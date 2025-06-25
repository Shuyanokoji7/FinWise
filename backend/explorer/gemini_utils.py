import google.generativeai as genai
from django.conf import settings
import json

# Configure Google Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

def get_gemini_model():
    """Get the Gemini Pro model for text generation"""
    try:
        model = genai.GenerativeModel('gemini-pro')
        return model
    except Exception as e:
        print(f"Error initializing Gemini model: {e}")
        return None

def analyze_stock_data(stock_data, portfolio_data=None):
    """
    Analyze stock data using Gemini AI and provide insights
    
    Args:
        stock_data (dict): Dictionary containing stock information
        portfolio_data (dict, optional): Current portfolio data for personalized recommendations
        
    Returns:
        dict: Analysis results with insights and recommendations
    """
    try:
        model = get_gemini_model()
        if not model:
            return {"error": "Failed to initialize Gemini model"}
        
        # Prepare portfolio context if available
        portfolio_context = ""
        if portfolio_data and portfolio_data.get('stocks'):
            portfolio_context = "\n\nCurrent Portfolio Context:\n"
            for stock in portfolio_data['stocks']:
                portfolio_context += f"- {stock.get('ticker', 'N/A')}: {stock.get('weight', 'N/A')}% of portfolio\n"
            portfolio_context += f"Total Portfolio Value: ${portfolio_data.get('total_value', 'N/A')}\n"
            portfolio_context += f"Risk Level: {portfolio_data.get('risk_level', 'N/A')}\n"
        
        # Prepare the prompt for stock analysis
        prompt = f"""
        Analyze the following stock data and provide insights:
        
        Stock: {stock_data.get('name', 'N/A')} ({stock_data.get('ticker', 'N/A')})
        Current Price: ${stock_data.get('currentPrice', 'N/A')}
        Change: {stock_data.get('change', 'N/A')} ({stock_data.get('changePercent', 'N/A')}%)
        Market Cap: ${stock_data.get('marketCap', 'N/A')}
        P/E Ratio: {stock_data.get('pe', 'N/A')}
        P/B Ratio: {stock_data.get('pb', 'N/A')}
        ROE: {stock_data.get('roe', 'N/A')}%
        ROA: {stock_data.get('roa', 'N/A')}%
        EPS: ${stock_data.get('eps', 'N/A')}
        Net Profit Margin: {stock_data.get('netProfitMargin', 'N/A')}%
        Debt to Equity: {stock_data.get('debtToEquity', 'N/A')}
        Dividend Yield: {stock_data.get('dividendYield', 'N/A')}%
        
        Technical Indicators:
        - RSI: {stock_data.get('rsi', 'N/A')}
        - MACD: {stock_data.get('macd', 'N/A')}
        - EMA20: {stock_data.get('ema20', 'N/A')}
        
        Industry: {stock_data.get('industry', 'N/A')}{portfolio_context}
        
        Please provide:
        1. A brief overview of the company
        2. Key financial health indicators
        3. Technical analysis insights
        4. Risk factors to consider
        5. Portfolio fit analysis (how it complements current holdings)
        6. Overall investment recommendation (Buy/Hold/Sell)
        7. Confidence level (1-10)
        8. Suggested allocation percentage if buying
        9. Diversification benefits
        
        Format your response as a JSON object with these keys:
        - overview
        - financial_health
        - technical_analysis
        - risk_factors
        - portfolio_fit
        - recommendation
        - confidence_level
        - suggested_allocation
        - diversification_benefits
        - reasoning
        """
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Try to parse JSON response
        try:
            # Extract JSON from the response
            response_text = response.text
            # Find JSON content between ```json and ``` or just parse the whole response
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_content = response_text[json_start:json_end].strip()
            else:
                json_content = response_text.strip()
            
            analysis = json.loads(json_content)
            return analysis
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text
            return {
                "raw_analysis": response.text,
                "error": "Could not parse JSON response"
            }
            
    except Exception as e:
        return {"error": f"Error analyzing stock data: {str(e)}"}

def get_stock_news_insights(news_data):
    """
    Analyze news sentiment and provide insights using Gemini
    
    Args:
        news_data (list): List of news articles
        
    Returns:
        dict: News analysis results
    """
    try:
        model = get_gemini_model()
        if not model:
            return {"error": "Failed to initialize Gemini model"}
        
        # Prepare news data for analysis
        news_summary = []
        for i, news in enumerate(news_data[:5]):  # Analyze top 5 news
            news_summary.append(f"{i+1}. {news.get('headline', 'N/A')} - {news.get('summary', 'N/A')}")
        
        news_text = "\n".join(news_summary)
        
        prompt = f"""
        Analyze the following recent news about a stock and provide insights:
        
        {news_text}
        
        Please provide:
        1. Overall sentiment (Positive/Negative/Neutral)
        2. Key themes or trends mentioned
        3. Potential impact on stock price
        4. Important events or announcements
        5. Risk factors from news
        
        Format your response as a JSON object with these keys:
        - sentiment
        - key_themes
        - price_impact
        - important_events
        - risk_factors
        - summary
        """
        
        response = model.generate_content(prompt)
        
        try:
            response_text = response.text
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_content = response_text[json_start:json_end].strip()
            else:
                json_content = response_text.strip()
            
            analysis = json.loads(json_content)
            return analysis
            
        except json.JSONDecodeError:
            return {
                "raw_analysis": response.text,
                "error": "Could not parse JSON response"
            }
            
    except Exception as e:
        return {"error": f"Error analyzing news: {str(e)}"}

def get_portfolio_insights(portfolio_data):
    """
    Analyze portfolio composition and provide recommendations
    
    Args:
        portfolio_data (dict): Portfolio information with stocks and weights
        
    Returns:
        dict: Portfolio analysis results
    """
    try:
        model = get_gemini_model()
        if not model:
            return {"error": "Failed to initialize Gemini model"}
        
        # Format portfolio data
        stocks_info = []
        for stock in portfolio_data.get('stocks', []):
            stocks_info.append(f"- {stock.get('ticker', 'N/A')}: {stock.get('weight', 'N/A')}%")
        
        portfolio_text = "\n".join(stocks_info)
        
        prompt = f"""
        Analyze the following portfolio composition and provide insights:
        
        Portfolio Stocks:
        {portfolio_text}
        
        Total Value: ${portfolio_data.get('total_value', 'N/A')}
        Risk Level: {portfolio_data.get('risk_level', 'N/A')}
        
        Please provide:
        1. Portfolio diversification analysis
        2. Sector allocation insights
        3. Risk assessment
        4. Recommendations for improvement
        5. Potential rebalancing suggestions
        
        Format your response as a JSON object with these keys:
        - diversification_analysis
        - sector_allocation
        - risk_assessment
        - recommendations
        - rebalancing_suggestions
        - overall_score
        """
        
        response = model.generate_content(prompt)
        
        try:
            response_text = response.text
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_content = response_text[json_start:json_end].strip()
            else:
                json_content = response_text.strip()
            
            analysis = json.loads(json_content)
            return analysis
            
        except json.JSONDecodeError:
            return {
                "raw_analysis": response.text,
                "error": "Could not parse JSON response"
            }
            
    except Exception as e:
        return {"error": f"Error analyzing portfolio: {str(e)}"} 