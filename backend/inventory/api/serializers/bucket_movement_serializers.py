from rest_framework import serializers


class BucketMovementDaySerializer(serializers.Serializer):
    date = serializers.DateField()
    bucket = serializers.CharField()
    state = serializers.CharField()

    opening_qty = serializers.IntegerField()
    inward_qty = serializers.IntegerField()
    outward_qty = serializers.IntegerField()
    closing_qty = serializers.IntegerField()


class BucketMovementReportSerializer(serializers.Serializer):
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    days = BucketMovementDaySerializer(many=True)
