from django.db import models
from django.contrib.auth.models import AbstractUser


# modelo de usuario personalizado, hereda de abstractuser que ya trae
# username, email, password, first_name, last_name, is_active, etc
class User(AbstractUser):
    pass
