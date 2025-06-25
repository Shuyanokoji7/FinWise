from rest_framework import serializers
from .models import Portfolio, PortfolioHolding, PortfolioPerformance, Watchlist, WatchlistItem
from decimal import Decimal

class PortfolioHoldingSerializer(serializers.ModelSerializer):
    """Serializer for portfolio holdings"""
    ticker = serializers.CharField(max_length=10)
    company_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    sector = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shares = serializers.DecimalField(max_digits=10, decimal_places=4, min_value=Decimal('0'))
    average_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'))
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'))
    allocation_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0'), max_value=Decimal('100'))
    
    class Meta:
        model = PortfolioHolding
        fields = [
            'id', 'ticker', 'company_name', 'sector', 'shares', 'average_price', 
            'current_price', 'allocation_percentage', 'market_value', 
            'unrealized_gain_loss', 'unrealized_gain_loss_percentage', 
            'added_at', 'updated_at'
        ]
        read_only_fields = ['id', 'market_value', 'unrealized_gain_loss', 'unrealized_gain_loss_percentage', 'added_at', 'updated_at']

class PortfolioSerializer(serializers.ModelSerializer):
    """Serializer for portfolios"""
    holdings = PortfolioHoldingSerializer(many=True, read_only=True)
    total_allocation = serializers.SerializerMethodField()
    stocks_count = serializers.SerializerMethodField()
    sector_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'name', 'description', 'risk_level', 'total_value', 
            'created_at', 'updated_at', 'is_active', 'holdings',
            'total_allocation', 'stocks_count', 'sector_breakdown'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_allocation', 'stocks_count', 'sector_breakdown']
    
    def get_total_allocation(self, obj):
        return obj.get_total_allocation()
    
    def get_stocks_count(self, obj):
        return obj.get_stocks_count()
    
    def get_sector_breakdown(self, obj):
        return obj.get_sector_breakdown()

class PortfolioCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating portfolios"""
    class Meta:
        model = Portfolio
        fields = ['name', 'description', 'risk_level']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class PortfolioHoldingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating portfolio holdings"""
    class Meta:
        model = PortfolioHolding
        fields = ['ticker', 'company_name', 'sector', 'shares', 'average_price', 'current_price', 'allocation_percentage']
    
    def create(self, validated_data):
        portfolio_id = self.context.get('portfolio_id')
        validated_data['portfolio_id'] = portfolio_id
        return super().create(validated_data)

class PortfolioPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for portfolio performance"""
    class Meta:
        model = PortfolioPerformance
        fields = ['id', 'date', 'total_value', 'daily_return', 'total_return', 'created_at']
        read_only_fields = ['id', 'created_at']

class WatchlistItemSerializer(serializers.ModelSerializer):
    """Serializer for watchlist items"""
    class Meta:
        model = WatchlistItem
        fields = ['id', 'ticker', 'company_name', 'target_price', 'notes', 'added_at']
        read_only_fields = ['id', 'added_at']

class WatchlistSerializer(serializers.ModelSerializer):
    """Serializer for watchlists"""
    items = WatchlistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'name', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'created_at', 'updated_at']

class WatchlistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating watchlists"""
    class Meta:
        model = Watchlist
        fields = ['name']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WatchlistItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating watchlist items"""
    class Meta:
        model = WatchlistItem
        fields = ['ticker', 'company_name', 'target_price', 'notes']
    
    def create(self, validated_data):
        watchlist_id = self.context.get('watchlist_id')
        validated_data['watchlist_id'] = watchlist_id
        return super().create(validated_data)

# Utility serializers for AI analysis
class PortfolioDataSerializer(serializers.Serializer):
    """Serializer for portfolio data used in AI analysis"""
    stocks = serializers.ListField(
        child=serializers.DictField()
    )
    total_value = serializers.CharField()
    risk_level = serializers.CharField()

class StockAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for stock analysis requests"""
    ticker = serializers.CharField(max_length=10)
    portfolio_data = PortfolioDataSerializer(required=False)
