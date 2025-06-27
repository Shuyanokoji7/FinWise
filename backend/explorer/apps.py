from django.apps import AppConfig


class ExplorerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # type: ignore[reportAssignmentType]
    name = 'explorer'
