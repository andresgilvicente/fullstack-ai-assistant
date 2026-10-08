from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model, kept separate from the default to allow future extension."""
