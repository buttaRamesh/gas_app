copy .env.dev .env
set DJANGO_SETTINGS_MODULE=core.settings.dev
python manage.py runserver