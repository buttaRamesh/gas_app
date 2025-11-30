from .base import *
import os
from decouple import Config, RepositoryEnv
from pathlib import Path

# Use .env.prod file for production settings
# __file__ is at backend/core/settings/prod.py, so we need to go up 3 levels to get to backend/
env_file = Path(__file__).resolve().parent.parent.parent / '.env.prod'
config = Config(RepositoryEnv(str(env_file)))

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

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

cors_origins = config('CORS_ALLOWED_ORIGINS', default='')

if cors_origins:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins.split(",") if o.strip()]
