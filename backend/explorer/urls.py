from django.urls import path
from django.http import JsonResponse

def ping(request):
    return JsonResponse({"status": "ok", "message": "Explorer app is working!"})

urlpatterns = [
    path('', ping),
]
