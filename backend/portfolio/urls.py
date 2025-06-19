from django.urls import path
from django.http import JsonResponse

def ping(request):
    return JsonResponse({"message": "Portfolio app is working!"})

urlpatterns = [
    path('', ping),
]
