from django.shortcuts import render
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import MACD, EMAIndicator
import time
import datetime
from pymongo import MongoClient
import yfinance as yf
from .gemini_utils import analyze_stock_data, get_stock_news_insights, get_portfolio_insights, get_gemini_model
from portfolio.models import Portfolio
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json

# Create your views here.
MONGO_URI = "mongodb+srv://bhavya0525:ONlsjphGtmCowWWP@cluster0.kirn0hy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"# Setup MongoDB client
# MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['finwise']
cache_col = db['explorer_cache']

def get_cached_or_fetch(ticker, key, fetch_func, max_age_hours=24):
    doc = cache_col.find_one({'ticker': ticker, 'key': key})
    now = datetime.datetime.utcnow()
    if doc and (now - doc['fetched_at']).total_seconds() < max_age_hours * 3600:
        return doc['data']
    data = fetch_func()
    cache_col.update_one(
        {'ticker': ticker, 'key': key},
        {'$set': {'data': data, 'fetched_at': now}},
        upsert=True
    )
    return data

@require_GET
@csrf_exempt
def stock_overview(request):
    ticker = request.GET.get('ticker')
    if not ticker:
        return JsonResponse({'error': 'Ticker parameter is required.'}, status=400)

    # Get portfolio data from request parameters (optional)
    portfolio_data = None
    portfolio_stocks = request.GET.get('portfolio_stocks', '')
    portfolio_value = request.GET.get('portfolio_value', '0')
    portfolio_risk = request.GET.get('portfolio_risk', 'Moderate')
    
    if portfolio_stocks:
        portfolio_data = {
            'stocks': [],
            'total_value': portfolio_value,
            'risk_level': portfolio_risk
        }
        
        # Parse portfolio stocks (format: ticker1:weight1,ticker2:weight2,...)
        stocks_list = portfolio_stocks.split(',')
        for stock_info in stocks_list:
            if ':' in stock_info:
                ticker_portfolio, weight = stock_info.split(':')
                portfolio_data['stocks'].append({
                    'ticker': ticker_portfolio.strip(),
                    'weight': float(weight.strip())
                })

    api_key = settings.FINNHUB_API_KEY
    base_url = 'https://finnhub.io/api/v1/'

    def get(endpoint, params=None):
        if params is None:
            params = {}
        params['token'] = api_key
        response = requests.get(base_url + endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def get_candles(ticker, days=100):
        """Get stock price data using yfinance instead of Finnhub candles"""
        try:
            # Get data for the specified number of days
            ticker_obj = yf.Ticker(ticker)
            df = ticker_obj.history(period=f"{days}d", interval="1d")
            
            if df.empty:
                raise ValueError(f"No data available for {ticker}")
            
            # Rename columns to match the expected format
            df = df.rename(columns={
                'Open': 'open',
                'High': 'high', 
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })
            
            # Ensure 'close' is a Series and convert to float
            df['close'] = df['close'].astype(float)
            
            return df
            
        except Exception as e:
            raise ValueError(f"Failed to get candle data for {ticker}: {str(e)}")

    def get_indicators(ticker):
        df = get_candles(ticker)
        close = df['close'].astype(float)
        # Ensure close is a pandas Series for type safety
        if not isinstance(close, pd.Series):
            close = pd.Series(close)
        
        df['rsi'] = RSIIndicator(close=close, window=14).rsi()
        print(type(close))  # Should print: <class 'pandas.core.series.Series'>
        macd = MACD(close=close)
        df['macd'] = macd.macd()
        df['ema20'] = EMAIndicator(close=close, window=20).ema_indicator()
        latest = df.iloc[-1]
        return {
            'rsi': round(latest['rsi'], 2) if pd.notnull(latest['rsi']) else None,
            'macd': round(latest['macd'], 2) if pd.notnull(latest['macd']) else None,
            'ema20': round(latest['ema20'], 2) if pd.notnull(latest['ema20']) else None
        }

    try:
        timings = {}
        start = time.time()
        profile = get_cached_or_fetch(ticker, 'profile', lambda: get('stock/profile2', {'symbol': ticker}))
        timings['profile'] = time.time() - start
        print(f"Time to fetch profile: {timings['profile']:.3f} seconds")

        start = time.time()
        metrics = get_cached_or_fetch(ticker, 'metrics', lambda: get('stock/metric', {'symbol': ticker, 'metric': 'all'}))
        timings['metrics'] = time.time() - start
        print(f"Time to fetch metrics: {timings['metrics']:.3f} seconds")

        start = time.time()
        quote = get('quote', {'symbol': ticker})
        timings['quote'] = time.time() - start
        print(f"Time to fetch quote: {timings['quote']:.3f} seconds")

        start = time.time()
        ratings = get_cached_or_fetch(ticker, 'ratings', lambda: get('stock/recommendation', {'symbol': ticker}))
        timings['ratings'] = time.time() - start
        print(f"Time to fetch ratings: {timings['ratings']:.3f} seconds")

        # Get news from the last 15 days
        today = datetime.date.today()
        from_date = (today - datetime.timedelta(days=15)).isoformat()
        to_date = today.isoformat()
        start = time.time()
        news = get('company-news', {'symbol': ticker, 'from': from_date, 'to': to_date})
        timings['news'] = time.time() - start
        print(f"Time to fetch news: {timings['news']:.3f} seconds")

        start = time.time()
        indicators = get_indicators(ticker)
        timings['indicators'] = time.time() - start
        print(f"Time to calculate indicators: {timings['indicators']:.3f} seconds")

        # Prepare data for Gemini AI analysis
        stock_data = {
            'name': profile.get('name'),
            'ticker': ticker,
            'exchange': profile.get('exchange'),
            'industry': profile.get('finnhubIndustry'),
            'logo': profile.get('logo'),
            'marketCap': metrics['metric'].get('marketCapitalization'),
            'currentPrice': quote.get('c'),
            'change': quote.get('d'),
            'changePercent': quote.get('dp'),
            'pe': metrics['metric'].get('peInclExtraTTM'),
            'pb': metrics['metric'].get('pbAnnual'),
            'roe': metrics['metric'].get('roeTTM'),
            'roa': metrics['metric'].get('roaTTM'),
            'eps': metrics['metric'].get('epsInclExtraItemsTTM'),
            'netProfitMargin': metrics['metric'].get('netProfitMarginTTM'),
            'debtToEquity': metrics['metric'].get('totalDebt/totalEquityAnnual'),
            'dividendYield': metrics['metric'].get('dividendYieldIndicatedAnnual'),
            'rsi': indicators['rsi'],
            'macd': indicators['macd'],
            'ema20': indicators['ema20'],
            'news': news[:5]
        }

        # Get Gemini AI analysis with portfolio context
        start = time.time()
        ai_analysis = analyze_stock_data(stock_data, portfolio_data)
        timings['ai_analysis'] = time.time() - start
        print(f"Time for AI analysis: {timings['ai_analysis']:.3f} seconds")

        # Get news insights from Gemini
        start = time.time()
        news_insights = get_stock_news_insights(news[:5])
        timings['news_insights'] = time.time() - start
        print(f"Time for news insights: {timings['news_insights']:.3f} seconds")

        data = {
            'name': profile.get('name'),
            'ticker': ticker,
            'exchange': profile.get('exchange'),
            'industry': profile.get('finnhubIndustry'),
            'logo': profile.get('logo'),
            'marketCap': metrics['metric'].get('marketCapitalization'),
            'currentPrice': quote.get('c'),
            'change': quote.get('d'),
            'changePercent': quote.get('dp'),
            'pe': metrics['metric'].get('peInclExtraTTM'),
            'pb': metrics['metric'].get('pbAnnual'),
            'roe': metrics['metric'].get('roeTTM'),
            'roa': metrics['metric'].get('roaTTM'),
            'eps': metrics['metric'].get('epsInclExtraItemsTTM'),
            'netProfitMargin': metrics['metric'].get('netProfitMarginTTM'),
            'debtToEquity': metrics['metric'].get('totalDebt/totalEquityAnnual'),
            'dividendYield': metrics['metric'].get('dividendYieldIndicatedAnnual'),
            'rsi': indicators['rsi'],
            'macd': indicators['macd'],
            'ema20': indicators['ema20'],
            'news': news[:5],
            'ai_analysis': ai_analysis,
            'news_insights': news_insights,
            'portfolio_context': portfolio_data,
            'timings': timings
        }
        return JsonResponse(data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_GET
@csrf_exempt
def portfolio_ai_analysis(request):
    """AI-powered portfolio analysis using Google Gemini"""
    try:
        # Get portfolio data from request parameters
        portfolio_data = {
            'stocks': [],
            'total_value': request.GET.get('total_value', 0),
            'risk_level': request.GET.get('risk_level', 'Moderate')
        }
        
        # Parse stocks from request (format: ticker1:weight1,ticker2:weight2,...)
        stocks_param = request.GET.get('stocks', '')
        if stocks_param:
            stocks_list = stocks_param.split(',')
            for stock_info in stocks_list:
                if ':' in stock_info:
                    ticker, weight = stock_info.split(':')
                    portfolio_data['stocks'].append({
                        'ticker': ticker.strip(),
                        'weight': float(weight.strip())
                    })
        
        if not portfolio_data['stocks']:
            return JsonResponse({'error': 'No stocks provided. Use format: ticker1:weight1,ticker2:weight2'}, status=400)
        
        # Get AI analysis
        start = time.time()
        analysis = get_portfolio_insights(portfolio_data)
        analysis_time = time.time() - start
        
        response_data = {
            'portfolio_data': portfolio_data,
            'ai_analysis': analysis,
            'analysis_time': round(analysis_time, 3)
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_GET
@csrf_exempt
def stock_overview_with_portfolio(request):
    """Stock overview with portfolio data from database"""
    ticker = request.GET.get('ticker')
    portfolio_id = request.GET.get('portfolio_id')
    
    if not ticker:
        return JsonResponse({'error': 'Ticker parameter is required.'}, status=400)
    
    # Get portfolio data from database if portfolio_id is provided
    portfolio_data = None
    if portfolio_id:
        try:
            portfolio = Portfolio.objects.get(id=portfolio_id)
            portfolio_data = {
                'stocks': [],
                'total_value': str(portfolio.total_value),
                'risk_level': portfolio.risk_level
            }
            
            for holding in portfolio.holdings.all():
                portfolio_data['stocks'].append({
                    'ticker': holding.ticker,
                    'weight': float(holding.allocation_percentage)
                })
        except Portfolio.DoesNotExist:
            return JsonResponse({'error': f'Portfolio with id {portfolio_id} not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Error fetching portfolio: {str(e)}'}, status=500)

    api_key = settings.FINNHUB_API_KEY
    base_url = 'https://finnhub.io/api/v1/'

    def get(endpoint, params=None):
        if params is None:
            params = {}
        params['token'] = api_key
        response = requests.get(base_url + endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def get_candles(ticker, days=100):
        """Get stock price data using yfinance instead of Finnhub candles"""
        try:
            # Get data for the specified number of days
            ticker_obj = yf.Ticker(ticker)
            df = ticker_obj.history(period=f"{days}d", interval="1d")
            
            if df.empty:
                raise ValueError(f"No data available for {ticker}")
            
            # Rename columns to match the expected format
            df = df.rename(columns={
                'Open': 'open',
                'High': 'high', 
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })
            
            # Ensure 'close' is a Series and convert to float
            df['close'] = df['close'].astype(float)
            
            return df
            
        except Exception as e:
            raise ValueError(f"Failed to get candle data for {ticker}: {str(e)}")

    def get_indicators(ticker):
        df = get_candles(ticker)
        close = df['close'].astype(float)
        # Ensure close is a pandas Series for type safety
        if not isinstance(close, pd.Series):
            close = pd.Series(close)
        
        df['rsi'] = RSIIndicator(close=close, window=14).rsi()
        print(type(close))  # Should print: <class 'pandas.core.series.Series'>
        macd = MACD(close=close)
        df['macd'] = macd.macd()
        df['ema20'] = EMAIndicator(close=close, window=20).ema_indicator()
        latest = df.iloc[-1]
        return {
            'rsi': round(latest['rsi'], 2) if pd.notnull(latest['rsi']) else None,
            'macd': round(latest['macd'], 2) if pd.notnull(latest['macd']) else None,
            'ema20': round(latest['ema20'], 2) if pd.notnull(latest['ema20']) else None
        }

    try:
        timings = {}
        start = time.time()
        profile = get_cached_or_fetch(ticker, 'profile', lambda: get('stock/profile2', {'symbol': ticker}))
        timings['profile'] = time.time() - start
        print(f"Time to fetch profile: {timings['profile']:.3f} seconds")

        start = time.time()
        metrics = get_cached_or_fetch(ticker, 'metrics', lambda: get('stock/metric', {'symbol': ticker, 'metric': 'all'}))
        timings['metrics'] = time.time() - start
        print(f"Time to fetch metrics: {timings['metrics']:.3f} seconds")

        start = time.time()
        quote = get('quote', {'symbol': ticker})
        timings['quote'] = time.time() - start
        print(f"Time to fetch quote: {timings['quote']:.3f} seconds")

        start = time.time()
        ratings = get_cached_or_fetch(ticker, 'ratings', lambda: get('stock/recommendation', {'symbol': ticker}))
        timings['ratings'] = time.time() - start
        print(f"Time to fetch ratings: {timings['ratings']:.3f} seconds")

        # Get news from the last 15 days
        today = datetime.date.today()
        from_date = (today - datetime.timedelta(days=15)).isoformat()
        to_date = today.isoformat()
        start = time.time()
        news = get('company-news', {'symbol': ticker, 'from': from_date, 'to': to_date})
        timings['news'] = time.time() - start
        print(f"Time to fetch news: {timings['news']:.3f} seconds")

        start = time.time()
        indicators = get_indicators(ticker)
        timings['indicators'] = time.time() - start
        print(f"Time to calculate indicators: {timings['indicators']:.3f} seconds")

        # Prepare data for Gemini AI analysis
        stock_data = {
            'name': profile.get('name'),
            'ticker': ticker,
            'exchange': profile.get('exchange'),
            'industry': profile.get('finnhubIndustry'),
            'logo': profile.get('logo'),
            'marketCap': metrics['metric'].get('marketCapitalization'),
            'currentPrice': quote.get('c'),
            'change': quote.get('d'),
            'changePercent': quote.get('dp'),
            'pe': metrics['metric'].get('peInclExtraTTM'),
            'pb': metrics['metric'].get('pbAnnual'),
            'roe': metrics['metric'].get('roeTTM'),
            'roa': metrics['metric'].get('roaTTM'),
            'eps': metrics['metric'].get('epsInclExtraItemsTTM'),
            'netProfitMargin': metrics['metric'].get('netProfitMarginTTM'),
            'debtToEquity': metrics['metric'].get('totalDebt/totalEquityAnnual'),
            'dividendYield': metrics['metric'].get('dividendYieldIndicatedAnnual'),
            'rsi': indicators['rsi'],
            'macd': indicators['macd'],
            'ema20': indicators['ema20'],
            'news': news[:5]
        }

        # Get Gemini AI analysis with portfolio context
        start = time.time()
        ai_analysis = analyze_stock_data(stock_data, portfolio_data)
        timings['ai_analysis'] = time.time() - start
        print(f"Time for AI analysis: {timings['ai_analysis']:.3f} seconds")

        # Get news insights from Gemini
        start = time.time()
        news_insights = get_stock_news_insights(news[:5])
        timings['news_insights'] = time.time() - start
        print(f"Time for news insights: {timings['news_insights']:.3f} seconds")

        data = {
            'name': profile.get('name'),
            'ticker': ticker,
            'exchange': profile.get('exchange'),
            'industry': profile.get('finnhubIndustry'),
            'logo': profile.get('logo'),
            'marketCap': metrics['metric'].get('marketCapitalization'),
            'currentPrice': quote.get('c'),
            'change': quote.get('d'),
            'changePercent': quote.get('dp'),
            'pe': metrics['metric'].get('peInclExtraTTM'),
            'pb': metrics['metric'].get('pbAnnual'),
            'roe': metrics['metric'].get('roeTTM'),
            'roa': metrics['metric'].get('roaTTM'),
            'eps': metrics['metric'].get('epsInclExtraItemsTTM'),
            'netProfitMargin': metrics['metric'].get('netProfitMarginTTM'),
            'debtToEquity': metrics['metric'].get('totalDebt/totalEquityAnnual'),
            'dividendYield': metrics['metric'].get('dividendYieldIndicatedAnnual'),
            'rsi': indicators['rsi'],
            'macd': indicators['macd'],
            'ema20': indicators['ema20'],
            'news': news[:5],
            'ai_analysis': ai_analysis,
            'news_insights': news_insights,
            'portfolio_context': portfolio_data,
            'timings': timings
        }
        return JsonResponse(data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_portfolio_suggestion(request):
    print("ai_portfolio_suggestion called")
    print("Request method:", request.method)
    print("Request headers:", request.headers)
    print("User:", request.user)
    print("Request data:", request.data)
    tickers = request.data.get('tickers', [])
    total_amount = float(request.data.get('total_amount', 0))
    risk_level = request.data.get('risk_level', 'Moderate')
    api_key = settings.FINNHUB_API_KEY

    # 1. Fetch Finnhub data (detailed)
    stock_data = []
    for ticker in tickers:
        # Quote (price)
        quote_url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={api_key}"
        quote = requests.get(quote_url).json()
        # Profile (sector, market cap, etc.)
        profile_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={api_key}"
        profile = requests.get(profile_url).json()
        # Metrics (P/E, beta, dividend yield, etc.)
        metrics_url = f"https://finnhub.io/api/v1/stock/metric?symbol={ticker}&metric=all&token={api_key}"
        metrics = requests.get(metrics_url).json().get('metric', {})
        stock_data.append({
            "ticker": ticker,
            "company_name": profile.get("name"),
            "exchange": profile.get("exchange"),
            "current_price": quote.get("c"),
            "sector": profile.get("finnhubIndustry"),
            "market_cap": profile.get("marketCapitalization"),
            "beta": metrics.get("beta"),
            "pe": metrics.get("peInclExtraTTM"),
            "dividend_yield": metrics.get("dividendYieldIndicatedAnnual"),
            "1y_return": metrics.get("52WeekPriceReturnDaily"),
            "volatility": metrics.get("volatility90d"),
            "pb": metrics.get("pbAnnual"),
            "roe": metrics.get("roeTTM"),
            "roa": metrics.get("roaTTM"),
            "eps": metrics.get("epsInclExtraItemsTTM"),
            "net_profit_margin": metrics.get("netProfitMarginTTM"),
            "debt_to_equity": metrics.get("totalDebt/totalEquityAnnual"),
        })

    # 2. Build prompt for Gemini (detailed)
    stock_lines = [
        f"- {s['ticker']} ({s['company_name']}): Price ${s['current_price']}, Exchange {s['exchange']}, Sector {s['sector']}, Market Cap {s['market_cap']}, Beta {s['beta']}, P/E {s['pe']}, Dividend Yield {s['dividend_yield']}, 1Y Return {s['1y_return']}, Volatility {s['volatility']}, PB {s['pb']}, ROE {s['roe']}, ROA {s['roa']}, EPS {s['eps']}, Net Profit Margin {s['net_profit_margin']}, Debt/Equity {s['debt_to_equity']}"
        for s in stock_data
    ]
    prompt = f"""
    Given these stocks and their real-time data:
    {chr(10).join(stock_lines)}
    The user has ${total_amount} to invest and a {risk_level} risk profile.
    Suggest an optimal allocation (percentages for each stock) to maximize expected return and manage risk, considering diversification, volatility, and fundamentals.
    Return a JSON object with tickers as keys and percentages as values, and explain your reasoning.
    """

    # 3. Call Gemini
    model = get_gemini_model()
    response = model.generate_content(prompt)
    response_text = response.text

    # 4. Try to extract JSON allocation from Gemini's response
    allocation = {}
    reasoning = ""
    try:
        if '```json' in response_text:
            json_start = response_text.find('```json') + 7
            json_end = response_text.find('```', json_start)
            json_content = response_text[json_start:json_end].strip()
        else:
            json_start = response_text.find('{')
            json_end = response_text.find('}', json_start) + 1
            json_content = response_text[json_start:json_end]
        allocation = json.loads(json_content)
        reasoning = response_text.replace(json_content, '').strip()
    except Exception as e:
        reasoning = response_text
        allocation = {}

    return Response({
        "allocation": allocation,
        "reasoning": reasoning,
        "raw_response": response_text,
        "stock_data": stock_data  # Send all real-time data to frontend
    })
