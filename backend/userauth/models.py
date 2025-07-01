from django.db import models
from django.contrib.auth.models import User

class OTPVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

class PendingRegistration(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)  # Store hashed or raw, but best to hash!
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        app_label = 'userauth'
