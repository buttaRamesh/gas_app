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
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins.split(",") if o.strip()]

# Disable authentication for development/testing (makes Swagger UI easier to use)
# WARNING: This allows unauthenticated access to all endpoints. Only use in development!
DISABLE_AUTH = config('DISABLE_AUTH', default=False, cast=bool)

if DISABLE_AUTH:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = []
    REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = ['rest_framework.permissions.AllowAny']
    print('WARNING: Authentication is DISABLED! All endpoints are publicly accessible.')

print('msg... ',config('DEBUG_MSG'))