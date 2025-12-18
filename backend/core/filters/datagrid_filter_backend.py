"""
Custom filter backend for MUI X DataGrid filter model.

This backend parses and applies filters from MUI DataGrid's filter panel,
mapping MUI operators to Django ORM lookups.
"""
import json
from rest_framework.filters import BaseFilterBackend
from django.db.models import Q


class DataGridFilterBackend(BaseFilterBackend):
    """
    Filter backend that handles MUI DataGrid filter model.

    Parses filter_model query parameter and applies filters using Django ORM.

    Example filter_model from MUI DataGrid:
    {
        "items": [
            {"field": "area_name", "operator": "contains", "value": "North"},
            {"field": "route_code", "operator": "startsWith", "value": "R1"}
        ],
        "logicOperator": "and"  # or "or"
    }
    """

    # Map MUI DataGrid operators to Django field lookups
    OPERATOR_MAP = {
        'contains': 'icontains',
        'doesNotContain': 'icontains',  # Special handling needed (negation)
        'equals': 'iexact',
        'doesNotEqual': 'iexact',  # Special handling needed (negation)
        'startsWith': 'istartswith',
        'endsWith': 'iendswith',
        '=': 'exact',
        '!=': 'exact',  # Special handling needed (negation)
        '>': 'gt',
        '>=': 'gte',
        '<': 'lt',
        '<=': 'lte',
        'isEmpty': 'isnull',
        'isNotEmpty': 'isnull',  # Special handling needed (negation)
        'is': 'exact',
        'not': 'exact',  # Special handling needed (negation)
        'after': 'gt',
        'onOrAfter': 'gte',
        'before': 'lt',
        'onOrBefore': 'lte',
    }

    def filter_queryset(self, request, queryset, view):
        """
        Apply filters from MUI DataGrid filter model.
        """
        # Get filter_model from query params
        filter_model_str = request.query_params.get('filter_model')

        if not filter_model_str:
            return queryset

        try:
            filter_model = json.loads(filter_model_str)
        except (json.JSONDecodeError, TypeError):
            # Invalid JSON, skip filtering
            return queryset

        items = filter_model.get('items', [])
        logic_operator = filter_model.get('logicOperator', 'and').lower()

        if not items:
            return queryset

        # Build Q objects for each filter item
        q_objects = []
        for item in items:
            q_obj = self._build_q_object(item, view)
            if q_obj is not None:
                q_objects.append(q_obj)

        if not q_objects:
            return queryset

        # Combine Q objects with AND or OR
        if logic_operator == 'or':
            combined_q = q_objects[0]
            for q_obj in q_objects[1:]:
                combined_q |= q_obj
        else:  # default to AND
            combined_q = q_objects[0]
            for q_obj in q_objects[1:]:
                combined_q &= q_obj

        return queryset.filter(combined_q)

    def _get_field_mapping(self, field_name, view):
        """
        Get the actual database field name from filterset_class if available.

        Args:
            field_name: The field name from the filter_model
            view: The viewset instance

        Returns:
            Tuple of (actual_field_name, default_lookup) or (field_name, None) if no mapping found
        """
        filterset_class = getattr(view, 'filterset_class', None)

        if not filterset_class:
            return field_name, None

        # Get the filter instance for this field
        try:
            # Try to access base_filters (set by django-filter's metaclass)
            filters = getattr(filterset_class, 'base_filters', {})

            if not filters:
                # Fallback to declared_filters
                filters = getattr(filterset_class, 'declared_filters', {})

            if field_name in filters:
                filter_obj = filters[field_name]
                # Get the actual field_name (e.g., 'route__area_code')
                # If field_name is not set or is None, use the filter name itself
                actual_field = getattr(filter_obj, 'field_name', None)
                if not actual_field:
                    actual_field = field_name
                # Get the default lookup_expr (e.g., 'icontains')
                default_lookup = getattr(filter_obj, 'lookup_expr', None)

                return actual_field, default_lookup
        except (AttributeError, KeyError):
            pass

        return field_name, None

    def _build_q_object(self, item, view):
        """
        Build a Q object from a filter item.

        Args:
            item: Filter item dict with 'field', 'operator', and 'value' keys
            view: The viewset instance

        Returns:
            Q object or None if invalid
        """
        field = item.get('field')
        operator = item.get('operator')
        value = item.get('value')

        if not field or not operator:
            return None

        # Get the actual database field name from filterset_class
        actual_field, default_lookup = self._get_field_mapping(field, view)

        # Get Django lookup from operator
        django_lookup = self.OPERATOR_MAP.get(operator)

        if not django_lookup:
            # Unknown operator, try to use it as-is
            django_lookup = operator

        # Handle special cases
        if operator in ['isEmpty', 'isNotEmpty']:
            # These don't need a value, they check for null
            lookup_key = f"{actual_field}__isnull"
            if operator == 'isEmpty':
                return Q(**{lookup_key: True})
            else:  # isNotEmpty
                return Q(**{lookup_key: False})

        elif operator in ['!=', 'doesNotEqual', 'doesNotContain']:
            # Negation (not equal, does not contain)
            lookup_key = f"{actual_field}__{django_lookup}"
            return ~Q(**{lookup_key: value})

        elif operator in ['not']:
            # Negation of exact match
            lookup_key = f"{actual_field}__exact"
            return ~Q(**{lookup_key: value})

        else:
            # Standard lookup
            lookup_key = f"{actual_field}__{django_lookup}"
            return Q(**{lookup_key: value})

    def get_schema_operation_parameters(self, view):
        """
        Define the filter_model parameter for OpenAPI schema.
        """
        return [
            {
                'name': 'filter_model',
                'required': False,
                'in': 'query',
                'description': 'MUI DataGrid filter model (JSON string)',
                'schema': {
                    'type': 'string',
                    'example': '{"items":[{"field":"area_name","operator":"contains","value":"North"}],"logicOperator":"and"}',
                },
            },
        ]
