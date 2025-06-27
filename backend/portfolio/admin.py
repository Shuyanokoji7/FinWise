from django.contrib import admin
from .models import Portfolio, PortfolioHolding, PortfolioPerformance, Watchlist, WatchlistItem

admin.site.register(Portfolio)
admin.site.register(PortfolioHolding)
admin.site.register(PortfolioPerformance)
admin.site.register(Watchlist)
admin.site.register(WatchlistItem)
