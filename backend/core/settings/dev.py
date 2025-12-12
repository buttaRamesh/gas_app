from .base import *
import os

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

DB_ENGINE = config('DB_ENGINE')
DATABASES = {
    'default': {
        'ENGINE': DB_ENGINE,
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}

cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")

if cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins.split(",") if o.strip()]
else:
    # Default origins for development (Vite runs on 5173 by default)
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

# Required for credentials (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Explicitly allow methods including POST
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Expose headers needed for file downloads
CORS_EXPOSE_HEADERS = [
    'Content-Disposition',
    'Content-Type',
    'Content-Length',
]

# Disable authentication for development/testing (makes Swagger UI easier to use)
# WARNING: This allows unauthenticated access to all endpoints. Only use in development!
DISABLE_AUTH = config('DISABLE_AUTH', default=False, cast=bool)

if DISABLE_AUTH:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = []
    REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = ['rest_framework.permissions.AllowAny']
    print('WARNING: Authentication is DISABLED! All endpoints are publicly accessible.')

print('msg... ',config('DEBUG_MSG'))