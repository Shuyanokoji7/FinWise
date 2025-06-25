from django.urls import path
from . import views

urlpatterns = [
    # Portfolio Management
    path('', views.portfolio_list, name='portfolio_list'),
    path('<int:portfolio_id>/', views.portfolio_detail, name='portfolio_detail'),
    path('<int:portfolio_id>/holdings/', views.portfolio_holdings, name='portfolio_holdings'),
    path('<int:portfolio_id>/holdings/<int:holding_id>/', views.holding_detail, name='holding_detail'),
    
    # Watchlist Management
    path('watchlists/', views.watchlist_list, name='watchlist_list'),
    path('watchlists/<int:watchlist_id>/', views.watchlist_detail, name='watchlist_detail'),
    path('watchlists/<int:watchlist_id>/items/', views.watchlist_items, name='watchlist_items'),
    path('watchlists/<int:watchlist_id>/items/<int:item_id>/', views.watchlist_item_detail, name='watchlist_item_detail'),
    
    # Utility endpoints for AI integration
    path('<int:portfolio_id>/analysis/', views.get_portfolio_for_analysis, name='portfolio_for_analysis'),
    path('summary/', views.get_user_portfolios_summary, name='user_portfolios_summary'),
    
    # Legacy endpoint for backward compatibility
    path('api/', views.portfolio_api, name='portfolio_api'),
]
