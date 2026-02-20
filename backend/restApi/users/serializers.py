import re
from datetime import date
# from dateutil.relativedelta import relativedelta

from rest_framework import serializers
from django.contrib.auth import get_user_model
from usage.models import Usage

User = get_user_model()  # pillamos el modelo de usuario que tengamos en settings


# funcion auxiliar para comprobar que la contraseña es segura
# la usamos en registro y en cambio de contraseña para no repetir codigo
def validate_password_strength(password):
    errors = []

    if len(password) <= 8:  # tiene que tener mas de 8 caracteres
        errors.append("La contraseña debe tener más de 8 caracteres.")

    if not re.search(r'[A-Z]', password):  # minimo una mayuscula
        errors.append("La contraseña debe incluir al menos una letra mayúscula.")

    if not re.search(r'[a-z]', password):  # minimo una minuscula
        errors.append("La contraseña debe incluir al menos una letra minúscula.")

    return errors


# serializer para registrar un usuario nuevo
# valida username unico, email valido, contraseñas coinciden y son seguras
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)  # write_only para que no se devuelva en la respuesta
    password2 = serializers.CharField(write_only=True)  # segunda contraseña para confirmar
    first_name = serializers.CharField(max_length=150, required=False, default="")
    last_name = serializers.CharField(max_length=150, required=False, default="")

    # django rest llama automaticamente a validate_<campo> si existe
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():  # comprobamos que no exista ya
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate_email(self, value):
        email_regex = r'^[^@]+@[^@]+\.[a-zA-Z]{2,}$'  # regex para texto@texto.dominio
        if not re.match(email_regex, value):
            raise serializers.ValidationError(
                "El email debe tener un formato válido (ejemplo: usuario@dominio.com)."
            )
        if User.objects.filter(email=value).exists():  # comprobamos que no exista ya
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    # validate se ejecuta despues de las validaciones individuales de cada campo
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password != password2:  # las dos contraseñas tienen que coincidir
            raise serializers.ValidationError({
                "password2": "Las contraseñas no coinciden."
            })

        password_errors = validate_password_strength(password)  # comprobamos requisitos de seguridad
        if password_errors:
            raise serializers.ValidationError({
                "password": password_errors
            })

        return attrs

    # crea el usuario en la bd una vez pasadas todas las validaciones
    def create(self, validated_data):
        validated_data.pop('password2')  # quitamos password2 porque no es campo del modelo

        user = User.objects.create_user(  # create_user hashea la contraseña automaticamente
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        Usage.objects.create(  # creamos el registro de uso para el nuevo usuario
            user=user,
            messages_used=0,
            messages_limit=100,
            # reset_date=date.today() + relativedelta(months=1),  # se renueva en 1 mes
        )

        return user


# serializer para ver y editar el perfil del usuario
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']  # estos no se pueden cambiar


# serializer para cambiar la contraseña
# valida que la actual sea correcta y que la nueva cumpla los requisitos
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user  # usuario logueado con jwt
        if not user.check_password(value):  # check_password compara con el hash de la bd
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password != password2:  # las dos contraseñas tienen que coincidir
            raise serializers.ValidationError({
                "password2": "Las contraseñas no coinciden."
            })

        password_errors = validate_password_strength(password)  # mismas validaciones que en registro
        if password_errors:
            raise serializers.ValidationError({
                "password": password_errors
            })

        return attrs
