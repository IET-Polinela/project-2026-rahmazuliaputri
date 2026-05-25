from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from usermanagement_24782027.api_views import RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main_app.urls')),
    path('', include('about.urls')),
    path('', include('contacts.urls')),
    path('', include('usermanagement_24782027.urls')),
    path('dashboard/', include('dashboard_24782027.urls')),

    path('api/', include('main_app.api_urls')),

    path('api/register/', RegisterView.as_view(), name='api_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]