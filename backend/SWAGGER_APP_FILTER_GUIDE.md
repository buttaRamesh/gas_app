# Swagger App Filtering Guide

This guide explains how the Swagger documentation is configured to show only specific apps, and how to add more apps as you complete reorganization.

## Current Configuration

**Currently Documented Apps:**
- ✅ **Consumers** - `/api/consumers/`
- ✅ **Routes** - `/api/routes/`

**Total Endpoints:** 19

All other apps are hidden from the Swagger documentation until you're ready to add them.

## How It Works

The filtering is done through custom preprocessing and postprocessing hooks in `backend/core/spectacular_hooks.py`:

### 1. `filter_endpoints_by_app()` - Preprocessing Hook
This function filters which endpoints appear in the documentation based on the URL path and module name.

### 2. `customize_schema()` - Postprocessing Hook
This function customizes the generated schema to add better descriptions and tags.

## How to Add More Apps

When you're ready to add another app to the documentation:

### Step 1: Edit the Hook File

Open `backend/core/spectacular_hooks.py` and update the `ALLOWED_APPS` list:

```python
def filter_endpoints_by_app(endpoints):
    # Define which apps to include in documentation
    ALLOWED_APPS = [
        'consumers',
        'routes',
        'delivery',      # ← Add new app here
        'order_book',    # ← Add another app
    ]
    # ... rest of the code
```

### Step 2: Update Schema Description (Optional)

In the same file, update the `customize_schema()` function to add custom descriptions:

```python
result['info']['description'] = """
API documentation for Gas App - a comprehensive gas distribution management system.

**Currently Documenting:**
- 🛒 **Consumers API** - Consumer management, registration, and tracking
- 🗺️ **Routes API** - Route management, assignments, and optimization
- 🚚 **Delivery API** - Delivery management and tracking    # ← Add new description
- 📦 **Order Book API** - Order management system           # ← Add new description

*Other APIs will be added incrementally as the codebase is reorganized.*
""".strip()
```

### Step 3: Add Tags for Better Organization (Optional)

Update the tags list to organize endpoints:

```python
tags = [
    {
        'name': 'consumers',
        'description': 'Consumer management endpoints'
    },
    {
        'name': 'routes',
        'description': 'Route management endpoints'
    },
    {
        'name': 'delivery',  # ← Add new tag
        'description': 'Delivery management and tracking endpoints'
    },
]
```

### Step 4: Regenerate Schema

After making changes, regenerate the schema:

```bash
cd backend
python manage.py spectacular --file schema.yml
```

### Step 5: Restart Server

Restart the Django development server to see the changes:

```bash
python manage.py runserver
```

Then visit: http://localhost:8000/api/docs/

## Configuration Location

All Swagger settings are in `backend/core/settings/base.py`:

```python
SPECTACULAR_SETTINGS = {
    'TITLE': 'Gas App API - Consumers & Routes',
    'PREPROCESSING_HOOKS': [
        'core.spectacular_hooks.filter_endpoints_by_app',
    ],
    'POSTPROCESSING_HOOKS': [
        'core.spectacular_hooks.customize_schema',
    ],
    # ... other settings
}
```

## Viewing All Endpoints (Temporarily)

If you need to see ALL endpoints temporarily:

1. Comment out the preprocessing hook:
   ```python
   SPECTACULAR_SETTINGS = {
       # 'PREPROCESSING_HOOKS': [
       #     'core.spectacular_hooks.filter_endpoints_by_app',
       # ],
   }
   ```

2. Restart server

3. Remember to uncomment it after testing!

## Example: Adding Delivery App

Here's a complete example of adding the delivery app:

**1. Edit `core/spectacular_hooks.py`:**
```python
ALLOWED_APPS = [
    'consumers',
    'routes',
    'delivery',  # ← Added
]
```

**2. Update description:**
```python
**Currently Documenting:**
- 🛒 **Consumers API** - Consumer management, registration, and tracking
- 🗺️ **Routes API** - Route management, assignments, and optimization
- 🚚 **Delivery API** - Delivery runs, loads, and records  # ← Added
```

**3. Add tag:**
```python
{
    'name': 'delivery',
    'description': 'Delivery management endpoints - runs, loads, records, and tracking'
},
```

**4. Restart and verify:**
```bash
python manage.py runserver
# Visit http://localhost:8000/api/docs/
```

## Troubleshooting

### App endpoints not showing after adding to ALLOWED_APPS

**Check:**
1. Make sure the app's URL pattern includes `/api/` in the path
2. Verify the app is included in `INSTALLED_APPS` in settings
3. Check that the ViewSets have proper serializers
4. Look for errors when running `python manage.py spectacular --validate`

### Schema generation errors

Run validation to see detailed errors:
```bash
python manage.py spectacular --validate
```

### Changes not appearing

1. Restart the Django server
2. Hard refresh browser (Ctrl+Shift+R)
3. Regenerate schema: `python manage.py spectacular --file schema.yml`

## Quick Reference

| Action | Command |
|--------|---------|
| Add app to docs | Edit `ALLOWED_APPS` in `core/spectacular_hooks.py` |
| Generate schema | `python manage.py spectacular --file schema.yml` |
| Validate schema | `python manage.py spectacular --validate` |
| View docs | http://localhost:8000/api/docs/ |
| View schema | http://localhost:8000/api/schema/ |

## Benefits of This Approach

✅ **Clean documentation** - Only show what's ready
✅ **Incremental updates** - Add apps one at a time
✅ **Easy to maintain** - Simple list to update
✅ **No code changes** - Just update the allowed apps list
✅ **Flexible** - Easy to enable/disable specific apps
