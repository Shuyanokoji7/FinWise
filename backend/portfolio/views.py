from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Portfolio, PortfolioHolding, PortfolioPerformance, Watchlist, WatchlistItem
from .serializers import (
    PortfolioSerializer, PortfolioCreateSerializer, PortfolioHoldingSerializer,
    PortfolioHoldingCreateSerializer, WatchlistSerializer, WatchlistCreateSerializer,
    WatchlistItemSerializer, WatchlistItemCreateSerializer
)
import json
from decimal import Decimal
import requests
from django.conf import settings

# Portfolio Management Views

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def portfolio_list(request):
    """List all portfolios for the authenticated user or create a new one"""
    if request.method == 'GET':
        portfolios = Portfolio.objects.filter(user=request.user, is_active=True)
        serializer = PortfolioSerializer(portfolios, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PortfolioCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            portfolio = serializer.save()
            # Save holdings with real-time data
            holdings_data = request.data.get('holdings', [])
            finnhub_key = getattr(settings, 'FINNHUB_API_KEY', None)
            for holding in holdings_data:
                ticker = holding.get('ticker')
                allocation = float(holding.get('allocation_percentage', 0))
                total_amount = float(request.data.get('total_amount', 0))
                invested_amount = (allocation / 100) * total_amount if total_amount else 0
                # Fetch real-time price and metrics
                current_price = float(holding.get('current_price', 0))
                beta = None
                dividend_yield = None
                one_year_return = None
                volatility = None
                market_cap = None
                if finnhub_key and ticker:
                    # Quote endpoint for price
                    url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={finnhub_key}"
                    try:
                        resp = requests.get(url, timeout=5)
                        current_price = float(resp.json().get('c', current_price))
                    except Exception:
                        pass
                    # Metrics endpoint for other fields
                    metrics_url = f"https://finnhub.io/api/v1/stock/metric?symbol={ticker}&metric=all&token={finnhub_key}"
                    try:
                        metrics_resp = requests.get(metrics_url, timeout=5)
                        metrics = metrics_resp.json().get('metric', {})
                        beta = metrics.get('beta')
                        dividend_yield = metrics.get('dividendYieldTTM')
                        one_year_return = metrics.get('52WeekHigh') and metrics.get('52WeekLow') and ((current_price - float(metrics.get('52WeekLow', 0))) / float(metrics.get('52WeekLow', 1)) * 100) or None
                        volatility = metrics.get('volatility90d')
                        market_cap = metrics.get('marketCapitalization')
                    except Exception:
                        pass
                shares = invested_amount / current_price if current_price > 0 else 0
                market_value = shares * current_price
                average_price = current_price
                # Save holding
                PortfolioHolding.objects.create(
                    portfolio=portfolio,
                    ticker=ticker,
                    company_name=holding.get('company_name', ''),
                    sector=holding.get('sector', ''),
                    shares=shares,
                    average_price=average_price,
                    current_price=current_price,
                    allocation_percentage=allocation,
                    market_value=market_value,
                    unrealized_gain_loss=0,
                    beta=beta,
                    dividend_yield=dividend_yield,
                    one_year_return=one_year_return,
                    volatility=volatility,
                    market_cap=market_cap
                )
            # Update portfolio total value
            portfolio.total_value = sum(h.market_value for h in portfolio.holdings.all())
            portfolio.save()
            return Response(PortfolioSerializer(portfolio).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def portfolio_detail(request, portfolio_id):
    """Retrieve, update or delete a portfolio"""
    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    
    if request.method == 'GET':
        finnhub_key = getattr(settings, 'FINNHUB_API_KEY', None)
        # Update and save each holding with the latest price
        for holding in portfolio.holdings.all():
            ticker = holding.ticker
            shares = float(holding.shares)
            price = float(holding.current_price)
            if finnhub_key and ticker and shares > 0:
                url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={finnhub_key}"
                try:
                    resp = requests.get(url, timeout=5)
                    price = float(resp.json().get('c', price))
                except Exception:
                    pass
            holding.update_current_price(price)  # This will recalculate and save all values
        # Now re-serialize to get updated values
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PortfolioSerializer(portfolio, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        portfolio.is_active = False
        portfolio.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def portfolio_holdings(request, portfolio_id):
    """List all holdings in a portfolio or add a new holding"""
    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    
    if request.method == 'GET':
        holdings = portfolio.holdings.all()
        serializer = PortfolioHoldingSerializer(holdings, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PortfolioHoldingCreateSerializer(
            data=request.data, 
            context={'request': request, 'portfolio_id': portfolio_id}
        )
        if serializer.is_valid():
            holding = serializer.save()
            # Update portfolio total value
            portfolio.total_value = sum(h.market_value for h in portfolio.holdings.all())
            portfolio.save()
            return Response(PortfolioHoldingSerializer(holding).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def holding_detail(request, portfolio_id, holding_id):
    """Retrieve, update or delete a specific holding"""
    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    holding = get_object_or_404(PortfolioHolding, id=holding_id, portfolio=portfolio)
    
    if request.method == 'GET':
        serializer = PortfolioHoldingSerializer(holding)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PortfolioHoldingSerializer(holding, data=request.data, partial=True)
        if serializer.is_valid():
            holding = serializer.save()
            # Update portfolio total value
            portfolio.total_value = sum(h.market_value for h in portfolio.holdings.all())
            portfolio.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        holding.delete()
        # Update portfolio total value
        portfolio.total_value = sum(h.market_value for h in portfolio.holdings.all())
        portfolio.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Watchlist Management Views

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_list(request):
    """List all watchlists for the authenticated user or create a new one"""
    if request.method == 'GET':
        watchlists = Watchlist.objects.filter(user=request.user)
        serializer = WatchlistSerializer(watchlists, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = WatchlistCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            watchlist = serializer.save()
            return Response(WatchlistSerializer(watchlist).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def watchlist_detail(request, watchlist_id):
    """Retrieve, update or delete a watchlist"""
    watchlist = get_object_or_404(Watchlist, id=watchlist_id, user=request.user)
    
    if request.method == 'GET':
        serializer = WatchlistSerializer(watchlist)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = WatchlistSerializer(watchlist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        watchlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_items(request, watchlist_id):
    """List all items in a watchlist or add a new item"""
    watchlist = get_object_or_404(Watchlist, id=watchlist_id, user=request.user)
    
    if request.method == 'GET':
        items = watchlist.items.all()
        serializer = WatchlistItemSerializer(items, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = WatchlistItemCreateSerializer(
            data=request.data, 
            context={'request': request, 'watchlist_id': watchlist_id}
        )
        if serializer.is_valid():
            item = serializer.save()
            return Response(WatchlistItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def watchlist_item_detail(request, watchlist_id, item_id):
    """Retrieve, update or delete a specific watchlist item"""
    watchlist = get_object_or_404(Watchlist, id=watchlist_id, user=request.user)
    item = get_object_or_404(WatchlistItem, id=item_id, watchlist=watchlist)
    
    if request.method == 'GET':
        serializer = WatchlistItemSerializer(item)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = WatchlistItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Utility Views for AI Integration

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_for_analysis(request, portfolio_id):
    """Get portfolio data formatted for AI analysis"""
    portfolio = get_object_or_404(Portfolio, id=portfolio_id, user=request.user)
    
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
    
    return Response(portfolio_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_portfolios_summary(request):
    """Get summary of all user portfolios"""
    portfolios = Portfolio.objects.filter(user=request.user, is_active=True)
    
    summary = {
        'total_portfolios': portfolios.count(),
        'total_value': sum(p.total_value for p in portfolios),
        'portfolios': []
    }
    
    for portfolio in portfolios:
        portfolio_summary = {
            'id': portfolio.id,
            'name': portfolio.name,
            'total_value': portfolio.total_value,
            'stocks_count': portfolio.get_stocks_count(),
            'total_allocation': portfolio.get_total_allocation(),
            'risk_level': portfolio.risk_level
        }
        summary['portfolios'].append(portfolio_summary)
    
    return Response(summary)

# Legacy support for non-API views
@login_required
@csrf_exempt
@require_http_methods(["GET", "POST"])
def portfolio_api(request):
    """Legacy portfolio API endpoint for backward compatibility"""
    if request.method == 'GET':
        portfolios = Portfolio.objects.filter(user=request.user, is_active=True)
        data = []
        for portfolio in portfolios:
            portfolio_data = {
                'id': portfolio.id,
                'name': portfolio.name,
                'total_value': float(portfolio.total_value),
                'risk_level': portfolio.risk_level,
                'holdings': []
            }
            for holding in portfolio.holdings.all():
                holding_data = {
                    'ticker': holding.ticker,
                    'allocation_percentage': float(holding.allocation_percentage),
                    'market_value': float(holding.market_value)
                }
                portfolio_data['holdings'].append(holding_data)
            data.append(portfolio_data)
        return JsonResponse({'portfolios': data})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            portfolio = Portfolio.objects.create(
                user=request.user,
                name=data.get('name', 'My Portfolio'),
                risk_level=data.get('risk_level', 'Moderate')
            )
            return JsonResponse({'id': portfolio.id, 'name': portfolio.name})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
