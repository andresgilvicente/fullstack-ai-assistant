import re
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework import serializers

from usage.models import Usage

User = get_user_model()

DEFAULT_MESSAGES_LIMIT = 100
USAGE_RESET_PERIOD = timedelta(days=30)


def validate_password_strength(password: str) -> list[str]:
    """Return the list of password policy violations (empty if the password is valid)."""
    errors = []

    if len(password) < 8:
        errors.append("The password must be at least 8 characters long.")

    if not re.search(r"[A-Z]", password):
        errors.append("The password must include at least one uppercase letter.")

    if not re.search(r"[a-z]", password):
        errors.append("The password must include at least one lowercase letter.")

    if not re.search(r"\d", password):
        errors.append("The password must include at least one number.")

    return errors


def validate_matching_passwords(attrs):
    """Shared validation for serializers that take a password and its confirmation."""
    if attrs.get("password") != attrs.get("password2"):
        raise serializers.ValidationError({"password2": "The passwords do not match."})

    password_errors = validate_password_strength(attrs.get("password"))
    if password_errors:
        raise serializers.ValidationError({"password": password_errors})

    return attrs


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default="")
    last_name = serializers.CharField(max_length=150, required=False, default="")

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if not re.match(r"^[^@]+@[^@]+\.[a-zA-Z]{2,}$", value):
            raise serializers.ValidationError(
                "Enter a valid email address (for example: user@domain.com)."
            )
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, attrs):
        return validate_matching_passwords(attrs)

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        Usage.objects.create(
            user=user,
            messages_used=0,
            messages_limit=DEFAULT_MESSAGES_LIMIT,
            reset_date=date.today() + USAGE_RESET_PERIOD,
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id"]

    def validate_username(self, value):
        user = self.context["request"].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        # Exclude the requesting user so that keeping the same email is allowed.
        user = self.context["request"].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already used by another account.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("The current password is incorrect.")
        return value

    def validate(self, attrs):
        return validate_matching_passwords(attrs)


class RegisterResponseSerializer(serializers.Serializer):
    """Response schema for the registration endpoint (used for the OpenAPI docs)."""

    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()
