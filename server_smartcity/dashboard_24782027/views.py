from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count
from django.db.models.functions import Trim, Upper
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.generic import TemplateView, View

from main_app.models import Report


class AdminRequiredMixin(LoginRequiredMixin):
    login_url = 'login'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')

        if not getattr(request.user, 'is_admin', False):
            messages.error(request, 'Akses ditolak. Hanya admin yang dapat mengakses dashboard.')
            return redirect('home')

        return super().dispatch(request, *args, **kwargs)


class DashboardView(AdminRequiredMixin, TemplateView):
    template_name = 'dashboard/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        semua_laporan_queryset = Report.objects.all()
        laporan_non_draft_queryset = Report.objects.exclude(status='DRAFT')

        status_order = ['DRAFT', 'REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']

        status_counts = (
            semua_laporan_queryset
            .values('status')
            .annotate(total=Count('id'))
        )

        status_map = {}
        for item in status_counts:
            status_map[item['status']] = item['total']

        status_labels = []
        status_values = []

        for status_item in status_order:
            total = status_map.get(status_item, 0)

            if total > 0:
                status_labels.append(status_item)
                status_values.append(total)

        category_counts = (
            laporan_non_draft_queryset
            .annotate(category_normalized=Upper(Trim('category')))
            .values('category_normalized')
            .annotate(total=Count('id'))
            .order_by('category_normalized')
        )

        category_labels = []
        category_values = []

        for item in category_counts:
            category_name = item['category_normalized']
            total = item['total']

            if category_name and total > 0:
                category_labels.append(category_name)
                category_values.append(total)

        context['total_laporan'] = semua_laporan_queryset.count()
        context['status_labels'] = status_labels
        context['status_values'] = status_values
        context['category_labels'] = category_labels
        context['category_values'] = category_values

        context['laporan_baru'] = (
            semua_laporan_queryset
            .filter(status__in=['REPORTED', 'VERIFIED', 'IN_PROGRESS'])
            .order_by('-created_at')[:5]
        )

        context['laporan_selesai'] = (
            semua_laporan_queryset
            .filter(status='RESOLVED')
            .order_by('-updated_at')[:5]
        )

        return context


class DashboardDataView(AdminRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        semua_laporan_queryset = Report.objects.all()
        laporan_non_draft_queryset = Report.objects.exclude(status='DRAFT')

        status_order = ['DRAFT', 'REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']

        status_counts = (
            semua_laporan_queryset
            .values('status')
            .annotate(total=Count('id'))
        )

        status_map = {}
        for item in status_counts:
            status_map[item['status']] = item['total']

        status_data = {}

        for status_item in status_order:
            total = status_map.get(status_item, 0)

            if total > 0:
                status_data[status_item] = total

        category_counts = (
            laporan_non_draft_queryset
            .annotate(category_normalized=Upper(Trim('category')))
            .values('category_normalized')
            .annotate(total=Count('id'))
            .order_by('category_normalized')
        )

        category_data = {}

        for item in category_counts:
            category_name = item['category_normalized']
            total = item['total']

            if category_name and total > 0:
                category_data[category_name] = total

        return JsonResponse({
            'total_laporan': semua_laporan_queryset.count(),
            'status': status_data,
            'category': category_data,
        })