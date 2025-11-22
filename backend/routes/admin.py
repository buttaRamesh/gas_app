from django.contrib import admin

# Register your models here.
from .models import Route , RouteArea

admin.site.register(Route)
admin.site.register(RouteArea)