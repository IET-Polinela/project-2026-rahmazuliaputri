from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    reporter_name = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'reporter_name',
            'is_owner',
            'created_at',
            'updated_at',
        ]

    def _is_feed_tab(self):
        request = self.context.get('request')

        if not request:
            return False

        return request.query_params.get('tab') == 'feed'

    def _is_owner(self, obj):
        request = self.context.get('request')

        if request and request.user and request.user.is_authenticated:
            return obj.reporter == request.user

        return False

    def get_reporter(self, obj):
        return "Warga Anonim"

    def get_reporter_name(self, obj):
        if self._is_feed_tab():
            return "Warga Anonim"

        if self._is_owner(obj):
            return obj.reporter.username

        return "Warga Anonim"

    def get_is_owner(self, obj):
        return self._is_owner(obj)