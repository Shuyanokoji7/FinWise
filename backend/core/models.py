from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    risk_preference = models.CharField(max_length=50)
    watchlist = models.JSONField(default=list)  # example: stock tickers
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username  # type: ignore
