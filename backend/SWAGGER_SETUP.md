# Swagger API Documentation Setup

This project uses `drf-spectacular` for automatic OpenAPI/Swagger documentation generation.

## Quick Start

1. Start your Django development server
2. Open your browser to `http://localhost:8000/api/docs/`
3. Login via `/api/auth/login/` to get your JWT token
4. Click "Authorize" button and paste the token
5. Test any endpoint!

## Accessing the Documentation

Once the server is running, you can access the API documentation at:

- **Swagger UI** (Interactive): `http://localhost:8000/api/docs/`
- **ReDoc** (Read-only): `http://localhost:8000/api/redoc/`
- **OpenAPI Schema** (JSON/YAML): `http://localhost:8000/api/schema/`

## Authentication Options

### Option 1: Use JWT Authentication (Default - Recommended for Production)

By default, authentication is enabled. To test protected endpoints in Swagger:

1. **Get your JWT token:**
   - In Swagger UI, scroll to the **Authentication** section
   - Find the `POST /api/auth/login/` endpoint
   - Click "Try it out"
   - Enter your credentials:
     ```json
     {
       "employee_id": "your_employee_id",
       "password": "your_password"
     }
     ```
   - Click "Execute"
   - Copy the `access` token from the response (not the whole response, just the token value)

2. **Authorize in Swagger:**
   - Click the **"Authorize"** button at the top right (green button with a lock icon)
   - In the popup, paste **ONLY the token value** (without "Bearer" prefix)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click "Authorize" button
   - Click "Close"

3. **Test endpoints:**
   - All subsequent requests will automatically include the JWT token
   - You'll see a lock icon next to each endpoint
   - Click "Try it out" on any endpoint to test it

### Option 2: Disable Authentication (Development Only)

**⚠️ WARNING: This disables all authentication and makes ALL endpoints publicly accessible!**

To disable authentication for easier testing in development:

1. Add this line to your `.env` file:
   ```
   DISABLE_AUTH=True
   ```

2. Restart the Django server

3. All endpoints will be accessible without authentication

**IMPORTANT:**
- Never use `DISABLE_AUTH=True` in production!
- Remove or set `DISABLE_AUTH=False` before deploying
- This is only for development/testing purposes

## Configuration

The Swagger settings are configured in `backend/core/settings/base.py`:

```python
SPECTACULAR_SETTINGS = {
    'TITLE': 'Gas App API',
    'DESCRIPTION': 'API documentation for Gas App',
    'VERSION': '1.0.0',
    # ... other settings
}
```

## Generating Static Schema File

To generate a static OpenAPI schema file:

```bash
cd backend
python manage.py spectacular --color --file schema.yml
```

This creates a `schema.yml` file that can be used with other OpenAPI tools.

## Customizing Documentation

### Adding Descriptions to Endpoints

Use the `@extend_schema` decorator to customize endpoint documentation:

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter

class MyViewSet(viewsets.ModelViewSet):
    @extend_schema(
        summary="List all items",
        description="Returns a paginated list of all items",
        parameters=[
            OpenApiParameter(
                name='search',
                description='Search term',
                required=False,
                type=str
            ),
        ],
        tags=['Items']
    )
    def list(self, request):
        # your code here
        pass
```

### Adding Type Hints to Serializers

For better schema generation, add type hints to serializer methods:

```python
from drf_spectacular.utils import extend_schema_field

class MySerializer(serializers.ModelSerializer):
    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_custom_field(self, obj) -> list[str]:
        return obj.get_related_items()
```

## Troubleshooting

### Endpoints Not Showing Up

Some ViewSets may not appear in the documentation if they:
- Don't have a `serializer_class` attribute
- Use custom logic that drf-spectacular can't introspect

Solution: Add `@extend_schema` decorators with explicit serializer information.

### Schema Generation Warnings

Warnings during schema generation are normal and don't prevent the documentation from working. They indicate:
- Missing type hints on serializer methods
- Custom endpoints that need manual documentation
- Name collisions in components

These can be fixed by adding `@extend_schema_field` decorators and type hints.

## Additional Resources

- [drf-spectacular Documentation](https://drf-spectacular.readthedocs.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Guide](https://swagger.io/tools/swagger-ui/)
