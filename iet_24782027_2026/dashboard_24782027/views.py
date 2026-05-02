from django.views.generic import TemplateView, View
from django.http import JsonResponse
from django.db.models import Count
from main_app.models import Report


class DashboardView(TemplateView):
    template_name = 'dashboard/dashboard.html'


class DashboardDataView(View):
    def get(self, request, *args, **kwargs):
        total_reports = Report.objects.count()

        status_data = (
            Report.objects
            .values('status')
            .annotate(total=Count('id'))
            .order_by('status')
        )

        category_data = (
            Report.objects
            .values('category')
            .annotate(total=Count('id'))
            .order_by('category')
        )

        latest_reported = Report.objects.filter(status='REPORTED').order_by('-created_at')[:5]
        latest_resolved = Report.objects.filter(status='RESOLVED').order_by('-created_at')[:5]

        data = {
            'total_reports': total_reports,
            'status_distribution': [
                {
                    'status': item['status'],
                    'total': item['total'],
                    'percentage': round((item['total'] / total_reports) * 100, 2) if total_reports > 0 else 0
                }
                for item in status_data
            ],
            'category_distribution': [
                {
                    'category': item['category'],
                    'total': item['total']
                }
                for item in category_data
            ],
            'latest_reported': [
                {
                    'id': report.id,
                    'title': report.title,
                    'category': report.category,
                    'location': report.location,
                    'status': report.status,
                    'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
                }
                for report in latest_reported
            ],
            'latest_resolved': [
                {
                    'id': report.id,
                    'title': report.title,
                    'category': report.category,
                    'location': report.location,
                    'status': report.status,
                    'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
                }
                for report in latest_resolved
            ],
        }

        return JsonResponse(data)