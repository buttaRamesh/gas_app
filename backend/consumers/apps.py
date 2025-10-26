from django.apps import AppConfig


class ConsumersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'consumers'
    def ready(self):
            import consumers.signals # Import your signals file here

    