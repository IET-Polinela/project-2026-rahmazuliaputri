from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView, DeleteView, View
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseForbidden
from django.db.models import Q

from .models import Report
from .forms import ReportForm


def visible_reports_for_user(user):
    if user.is_authenticated:
        return Report.objects.filter(
            Q(reporter=user) | ~Q(status='DRAFT')
        )

    return Report.objects.exclude(status='DRAFT')


class AdminRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.')
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)


class HomeView(TemplateView):
    template_name = 'main_app/home.html'


class ReportListView(AdminRequiredMixin, ListView):
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'

    def get_queryset(self):
        return visible_reports_for_user(self.request.user).order_by('-created_at')


class ReportDetailView(AdminRequiredMixin, DetailView):
    model = Report
    template_name = 'main_app/detail_report.html'
    context_object_name = 'report'

    def get_queryset(self):
        return visible_reports_for_user(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        allowed_transitions = {
            'REPORTED': ['VERIFIED'],
            'VERIFIED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': [],
            'DRAFT': ['REPORTED'],
        }
        context['next_statuses'] = allowed_transitions.get(self.object.status, [])
        return context


class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        if not form.instance.reporter_id:
            form.instance.reporter = self.request.user

        messages.success(self.request, 'Laporan berhasil ditambahkan.')
        return super().form_valid(form)


class ReportUpdateView(AdminRequiredMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/update_report.html'
    success_url = reverse_lazy('report_list')

    def get_queryset(self):
        return visible_reports_for_user(self.request.user)

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil diperbarui.')
        return super().form_valid(form)


class ReportDeleteView(AdminRequiredMixin, DeleteView):
    model = Report
    template_name = 'main_app/delete_report.html'
    success_url = reverse_lazy('report_list')

    def get_queryset(self):
        return visible_reports_for_user(self.request.user)

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil dihapus.')
        return super().form_valid(form)


class ReportUpdateStatusView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.')
            return redirect('home')

        report = get_object_or_404(
            visible_reports_for_user(request.user),
            pk=pk
        )

        new_status = request.POST.get('new_status') or request.POST.get('status')

        allowed_transitions = {
            'REPORTED': ['VERIFIED'],
            'VERIFIED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': [],
            'DRAFT': ['REPORTED'],
        }

        if new_status in allowed_transitions.get(report.status, []):
            report.status = new_status
            report.save()
            messages.success(request, 'Status laporan berhasil diubah.')
        else:
            messages.error(request, 'Status tidak valid.')

        return redirect('report_list')


class ReportSearchView(View):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin:
            return HttpResponseForbidden()

        keyword = request.GET.get('q', '')

        reports = visible_reports_for_user(request.user).order_by('-created_at')

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

        return JsonResponse({'reports': data, 'results': data})


class ReportDetailJsonView(View):
    def get(self, request, pk, *args, **kwargs):
        report = get_object_or_404(
            visible_reports_for_user(request.user),
            pk=pk
        )

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


def report_detail_api(request, pk):
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