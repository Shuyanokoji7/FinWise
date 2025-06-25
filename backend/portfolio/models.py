from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

# Create your models here.

class Portfolio(models.Model):
    """User portfolio model"""
    RISK_LEVEL_CHOICES = [
        ('Conservative', 'Conservative'),
        ('Moderate', 'Moderate'),
        ('Aggressive', 'Aggressive'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    name = models.CharField(max_length=100, default='My Portfolio')
    description = models.TextField(blank=True, null=True)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='Moderate')
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.username}'s {self.name}"
    
    def get_total_allocation(self):
        """Calculate total allocation percentage"""
        return sum(holding.allocation_percentage for holding in self.holdings.all())
    
    def get_stocks_count(self):
        """Get number of stocks in portfolio"""
        return self.holdings.count()
    
    def get_sector_breakdown(self):
        """Get sector breakdown of portfolio"""
        sectors = {}
        for holding in self.holdings.all():
            sector = holding.sector or 'Unknown'
            if sector in sectors:
                sectors[sector] += holding.allocation_percentage
            else:
                sectors[sector] = holding.allocation_percentage
        return sectors

class PortfolioHolding(models.Model):
    """Individual stock holding in a portfolio"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='holdings')
    ticker = models.CharField(max_length=10)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    shares = models.DecimalField(max_digits=10, decimal_places=4, default=Decimal('0.0000'))
    average_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    allocation_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=Decimal('0.00')
    )
    market_value = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    unrealized_gain_loss = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    unrealized_gain_loss_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-allocation_percentage']
        unique_together = ['portfolio', 'ticker']
    
    def __str__(self):
        return f"{self.ticker} - {self.allocation_percentage}%"
    
    def save(self, *args, **kwargs):
        """Override save to calculate derived fields"""
        # Calculate market value
        self.market_value = self.shares * self.current_price
        
        # Calculate unrealized gain/loss
        cost_basis = self.shares * self.average_price
        self.unrealized_gain_loss = self.market_value - cost_basis
        
        # Calculate unrealized gain/loss percentage
        if cost_basis > 0:
            self.unrealized_gain_loss_percentage = (self.unrealized_gain_loss / cost_basis) * 100
        else:
            self.unrealized_gain_loss_percentage = Decimal('0.00')
        
        super().save(*args, **kwargs)
    
    def update_current_price(self, new_price):
        """Update current price and recalculate values"""
        self.current_price = new_price
        self.save()

class PortfolioPerformance(models.Model):
    """Portfolio performance tracking over time"""
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='performance_records')
    date = models.DateField()
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    daily_return = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0000'))
    total_return = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0000'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['portfolio', 'date']
    
    def __str__(self):
        return f"{self.portfolio.name} - {self.date} - ${self.total_value}"

class Watchlist(models.Model):
    """User watchlist for stocks they're monitoring"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    name = models.CharField(max_length=100, default='My Watchlist')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.username}'s {self.name}"

class WatchlistItem(models.Model):
    """Individual stock in a watchlist"""
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name='items')
    ticker = models.CharField(max_length=10)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    target_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ['watchlist', 'ticker']
    
    def __str__(self):
        return f"{self.ticker} in {self.watchlist.name}"
