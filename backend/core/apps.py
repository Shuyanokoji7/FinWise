from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore[reportAssignmentType]
    name = 'core'
