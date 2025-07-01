from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    PasswordChangeView,
    check_auth
)
from . import views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
    path('check-auth/', check_auth, name='check-auth'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('forgot-password/send-otp/', views.forgot_password_send_otp, name='forgot_password_send_otp'),
    path('forgot-password/verify-otp/', views.forgot_password_verify_otp, name='forgot_password_verify_otp'),
    path('forgot-password/reset/', views.reset_password, name='reset_password'),
]