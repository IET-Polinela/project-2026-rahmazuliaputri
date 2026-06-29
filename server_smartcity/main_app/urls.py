from django.urls import path

from .views import (
    HomeView,
    ReportListView,
    ReportDetailView,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportUpdateStatusView,
    ReportSearchView,
    ReportDetailJsonView,
    AboutView,
    ContactView,
)


urlpatterns = [
    path('', HomeView.as_view(), name='home'),

    path('reports/', ReportListView.as_view(), name='report_list'),
    path('reports/search/', ReportSearchView.as_view(), name='report_search'),
    path('reports/<int:pk>/json/', ReportDetailJsonView.as_view(), name='report_detail_json'),

    path('reports/add/', ReportCreateView.as_view(), name='report_create'),
    path('reports/add/', ReportCreateView.as_view(), name='add_report'),

    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),

    path('reports/<int:pk>/edit/', ReportUpdateView.as_view(), name='report_update'),
    path('reports/<int:pk>/edit/', ReportUpdateView.as_view(), name='update_report'),

    path('reports/<int:pk>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    path('reports/<int:pk>/delete/', ReportDeleteView.as_view(), name='delete_report'),

    path('reports/<int:pk>/status/', ReportUpdateStatusView.as_view(), name='report_update_status'),
    path('reports/<int:pk>/status/', ReportUpdateStatusView.as_view(), name='update_status'),

    path('about/', AboutView.as_view(), name='about'),
    path('contact/', ContactView.as_view(), name='contact'),
]