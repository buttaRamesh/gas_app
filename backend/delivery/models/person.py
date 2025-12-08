# ==============================================================================
# app: delivery
# Created: Model for delivery assignment history (Created earlier today, discussed in last hour)
# ==============================================================================

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class DeliveryRouteAssignmentHistory(models.Model):
    class ActionType(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        UPDATED = 'UPDATED', 'Updated'
        DELETED = 'DELETED', 'Deleted'
    delivery_person = models.ForeignKey(
        'delivery.DeliveryPerson', on_delete=models.SET_NULL,null=True,blank=True, related_name='+')
    delivery_person_name = models.CharField(max_length=200, blank=True)
    route = models.ForeignKey(
        'routes.Route', on_delete=models.SET_NULL,null=True,blank=True, related_name='+')
    route_code = models.CharField(max_length=50, blank=True)
    route_description = models.CharField(max_length=150, blank=True)
    action_type = models.CharField(max_length=10, choices=ActionType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Optional: changed_by field
    # changed_by = models.ForeignKey(
    #     settings.AUTH_USER_MODEL, 
    #     null=True, 
    #     blank=True, 
    #     on_delete=models.SET_NULL,
    #     related_name='delivery_route_changes'
    # )

    def __str__(self):
        dp_name = self.delivery_person_name or "Deleted Delivery Person"
        route_display = self.route_code or "Deleted Route"
        return f"{dp_name} - {route_display} ({self.action_type} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        verbose_name = "Delivery Route Assignment History"
        verbose_name_plural = "Delivery Route Assignment History"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['delivery_person', 'timestamp']),
            models.Index(fields=['route', 'timestamp']),
        ]

    def __str__(self):
        dp_name = self.delivery_person.name if self.delivery_person else "N/A"
        route_code = self.route.area_code if self.route else "N/A"
        return f"{dp_name} - {route_code} ({self.action_type} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        verbose_name = "Delivery Route Assignment History"
        verbose_name_plural = "Delivery Route Assignment History"
        ordering = ['-timestamp']

# ==============================================================================
# app: delivery
# Created: Model for delivery assignment relationship (Created earlier today, discussed in last hour)
# ==============================================================================
class DeliveryRouteAssignment(models.Model):
    route = models.OneToOneField(
        'routes.Route', on_delete=models.CASCADE, primary_key=True,
        related_name='delivery_assignment')
    delivery_person = models.ForeignKey(
        'delivery.DeliveryPerson', on_delete=models.PROTECT, related_name='route_assignments')

    def __str__(self):
        dp_name = self.delivery_person.name if self.delivery_person else "Unassigned"
        route_code = self.route.area_code if self.route else "N/A"
        return f"{dp_name} assigned to {route_code}"

    class Meta:
        verbose_name = "Delivery Route Assignment"
        verbose_name_plural = "Delivery Route Assignments"
        indexes = [
            models.Index(fields=['delivery_person']),  # Fast lookup by delivery person
        ]



class DeliveryPerson(models.Model):
    # Generic relation to Person (personal/family information)
    person_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        limit_choices_to={'model': 'person'}
    )
    person_object_id = models.PositiveIntegerField(null=True, blank=True)
    person = GenericForeignKey('person_content_type', 'person_object_id')

    def __str__(self):
        if self.person:
            return self.person.full_name
        return f"DeliveryPerson {self.pk}"

    @property
    def name(self):
        """Get delivery person's name from person"""
        if self.person:
            return self.person.full_name
        return ""

    class Meta:
        indexes = [
            models.Index(fields=['person_content_type', 'person_object_id']),  # Generic relation lookup
        ]