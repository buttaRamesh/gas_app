# File: address/utils.py
from django.contrib.contenttypes.models import ContentType

def get_content_type_for_model(model_name: str) -> int:
    """
    Get content type ID for a given model name.

    Args:
        model_name: Name of the model (e.g., 'consumer', 'deliveryperson')

    Returns:
        Content type ID
    """
    try:
        content_type = ContentType.objects.get(model=model_name.lower())
        return content_type.id
    except ContentType.DoesNotExist:
        raise ValueError(f"Content type for model '{model_name}' does not exist")


def get_all_content_types():
    """
    Get all content types in the system.

    Returns:
        List of dictionaries with content type information
    """
    content_types = ContentType.objects.all()
    return [
        {
            'id': ct.id,
            'app_label': ct.app_label,
            'model': ct.model,
            'name': str(ct)
        }
        for ct in content_types
    ]
