from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView, DeleteView, View
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse
from django.db.models import Q

from .models import Report
from .forms import ReportForm


class AdminRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.')
            return redirect('report_list')
        return super().dispatch(request, *args, **kwargs)


class HomeView(TemplateView):
    template_name = 'main_app/home.html'


class ReportListView(ListView):
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'
    ordering = ['-created_at']


class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/detail_report.html'
    context_object_name = 'report'


class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil ditambahkan.')
        return super().form_valid(form)


class ReportUpdateView(AdminRequiredMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/update_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil diperbarui.')
        return super().form_valid(form)


class ReportDeleteView(AdminRequiredMixin, DeleteView):
    model = Report
    template_name = 'main_app/delete_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil dihapus.')
        return super().form_valid(form)


class ReportUpdateStatusView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.')
            return redirect('report_list')

        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        if new_status in ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']:
            report.status = new_status
            report.save()
            messages.success(request, 'Status laporan berhasil diubah.')
        else:
            messages.error(request, 'Status tidak valid.')

        return redirect('report_list')


class ReportSearchView(View):
    def get(self, request, *args, **kwargs):
        keyword = request.GET.get('q', '')

        reports = Report.objects.all().order_by('-created_at')

        if keyword:
            reports = reports.filter(
                Q(title__icontains=keyword) |
                Q(category__icontains=keyword) |
                Q(description__icontains=keyword) |
                Q(location__icontains=keyword) |
                Q(status__icontains=keyword)
            )

        data = [
            {
                'id': report.id,
                'title': report.title,
                'category': report.category,
                'description': report.description,
                'location': report.location,
                'status': report.status,
                'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
            }
            for report in reports
        ]

        return JsonResponse({'reports': data})


class ReportDetailJsonView(View):
    def get(self, request, pk, *args, **kwargs):
        report = get_object_or_404(Report, pk=pk)

        data = {
            'id': report.id,
            'title': report.title,
            'category': report.category,
            'description': report.description,
            'location': report.location,
            'status': report.status,
            'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
        }

        return JsonResponse(data)


class AboutView(TemplateView):
    template_name = 'about/about.html'


class ContactView(TemplateView):
    template_name = 'contacts/contacts.html'