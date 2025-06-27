from django.urls import path
from django.http import JsonResponse
from .views import stock_overview, portfolio_ai_analysis, stock_overview_with_portfolio, ai_portfolio_suggestion

# def ping(request):
#     return JsonResponse({"status": "ok", "message": "Explorer app is working!"})

urlpatterns = [
    # path('', ping),
    path('overview/', stock_overview),
    path('overview-with-portfolio/', stock_overview_with_portfolio),
    path('portfolio-analysis/', portfolio_ai_analysis),
    path('ai-suggest-portfolio/', ai_portfolio_suggestion),
]
