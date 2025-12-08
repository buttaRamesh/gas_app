from django.db import models


class ConsumerRouteAssignmentHistory(models.Model):
    """
    History tracking for consumer route assignments.
    Stores snapshots of assignment changes for audit purposes.
    """
    class ActionType(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        UPDATED = 'UPDATED', 'Updated'
        DELETED = 'DELETED', 'Deleted'

    consumer = models.ForeignKey(
        'consumers.Consumer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    consumer_number = models.CharField(max_length=50, blank=True)
    consumer_name = models.CharField(max_length=200, blank=True)

    route = models.ForeignKey(
        'routes.Route',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    route_code = models.CharField(max_length=50, blank=True)
    route_description = models.CharField(max_length=150, blank=True)
    action_type = models.CharField(max_length=10, choices=ActionType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        consumer_display = self.consumer_number or "Deleted Consumer"
        route_display = self.route_code or "Deleted Route"
        return f"{consumer_display} - {route_display} ({self.action_type} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        verbose_name = "Consumer Route Assignment History"
        verbose_name_plural = "Consumer Route Assignment History"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['consumer', 'timestamp']),
            models.Index(fields=['route', 'timestamp']),
        ]


class ConsumerRouteAssignment(models.Model):
    """
    Assignment relationship between Consumer and Route.
    One consumer can only be assigned to one route at a time.
    """
    consumer = models.OneToOneField(
        'consumers.Consumer',
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='route_assignment'
    )
    route = models.ForeignKey(
        'routes.Route',
        on_delete=models.PROTECT,
        related_name='consumer_assignments'
    )

    def __str__(self):
        consumer_name = (
            self.consumer.person.full_name
            if self.consumer and self.consumer.person
            else self.consumer.consumer_number
        )
        return f"{consumer_name} assigned to {self.route.area_code}"

    class Meta:
        verbose_name = "Consumer Route Assignment"
        verbose_name_plural = "Consumer Route Assignments"
        indexes = [
            models.Index(fields=['route']),  # Fast lookup by route
        ]
