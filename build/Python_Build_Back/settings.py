


INSTALLED_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Outros apps...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # outros middlewares...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # URL do frontend React
]
