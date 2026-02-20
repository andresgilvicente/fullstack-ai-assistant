import re
from datetime import date, timedelta

from rest_framework import serializers
from django.contrib.auth import get_user_model
from usage.models import Usage

User = get_user_model()


def validate_password_strength(password: str):
    errors = []

    if len(password) <= 8:
        errors.append("La contraseña debe tener más de 8 caracteres.")

    if not re.search(r"[A-Z]", password):
        errors.append("La contraseña debe incluir al menos una letra mayúscula.")

    if not re.search(r"[a-z]", password):
        errors.append("La contraseña debe incluir al menos una letra minúscula.")

    return errors


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default="")
    last_name = serializers.CharField(max_length=150, required=False, default="")

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate_email(self, value):
        email_regex = r"^[^@]+@[^@]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, value):
            raise serializers.ValidationError(
                "El email debe tener un formato válido (ejemplo: usuario@dominio.com)."
            )
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")

        if password != password2:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})

        password_errors = validate_password_strength(password)
        if password_errors:
            raise serializers.ValidationError({"password": password_errors})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        # TU MODELO Usage exige reset_date (NOT NULL)
        Usage.objects.create(
            user=user,
            messages_used=0,
            messages_limit=100,
            reset_date=date.today() + timedelta(days=30),
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")

        if password != password2:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})

        password_errors = validate_password_strength(password)
        if password_errors:
            raise serializers.ValidationError({"password": password_errors})

        return attrs


# Para documentar Swagger del register (user + tokens)
class RegisterResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()