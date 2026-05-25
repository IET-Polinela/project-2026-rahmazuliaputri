from rest_framework import viewsets, permissions
from .models import Report
from .serializers import ReportSerializer
from .permissions import *


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated:
            non_draft_reports = Report.objects.exclude(status='DRAFT')
            own_draft_reports = Report.objects.filter(
                status='DRAFT',
                reporter=user
            )

            return non_draft_reports | own_draft_reports

        return Report.objects.none()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerAndDraftOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)