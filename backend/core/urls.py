"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.http import JsonResponse

# Health check endpoint
def health_check(request):
    """Simple health check endpoint to verify server is running"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Server is running'
    })

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    # re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),  # React entry point
    # path('api/', include('routes.urls')),
    path('api/auth/', include('authentication.urls')),  # Include authentication URLs
    path('api/', include('consumers.urls')),  # Include consumer URLs
    path('api/', include('routes.urls')),  # Include routes URLs
    path('api/', include('delivery.urls')),  # Include delivey URLs
    path('api/products/', include('products.urls')),  # Include products URLs
    path('api/', include('address.urls')),  # Include address and contact URLs
    path('api/lookups/', include('lookups.urls')),  # Include lookups URLs
    path('api/', include('schemes.urls')),  # Include schemes URLs
    path('api/', include('connections.urls')),  # Include connections URLs
    path("api/logger/", include("request_logger.urls")),
    path('api/', include('order_book.urls')),  # Include order_book URLs

    # re_path(r'^(?!assets/).*$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?!assets/|api/).*$', TemplateView.as_view(template_name='index.html')),
]


from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/assets/', document_root=settings.UI_DIR / 'assets')
    # urlpatterns += static('/assets/', document_root=settings.REACT_BUILD_DIR / 'assets')
