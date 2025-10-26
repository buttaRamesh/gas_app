from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import DeliveryRouteAssignment, DeliveryRouteAssignmentHistory


@receiver(pre_save, sender=DeliveryRouteAssignmentHistory)
def populate_delivery_route_history_fields(sender, instance, **kwargs):
    """Populate denormalized fields before saving history record"""
    if instance.delivery_person:
        instance.delivery_person_name = instance.delivery_person.name
    
    if instance.route:
        instance.route_code = instance.route.area_code
        instance.route_description = instance.route.area_code_description


@receiver(post_save, sender=DeliveryRouteAssignment)
def log_delivery_route_assignment_create_update(sender, instance, created, **kwargs):
    """Automatically create history record when assignment is created or updated"""
    action_type = DeliveryRouteAssignmentHistory.ActionType.CREATED if created else DeliveryRouteAssignmentHistory.ActionType.UPDATED
    
    DeliveryRouteAssignmentHistory.objects.create(
        delivery_person=instance.delivery_person,
        delivery_person_name=instance.delivery_person.name,
        route=instance.route,
        route_code=instance.route.area_code,
        route_description=instance.route.area_code_description,
        action_type=action_type,
        # changed_by=<get from request context if available>
    )


@receiver(post_delete, sender=DeliveryRouteAssignment)
def log_delivery_route_assignment_delete(sender, instance, **kwargs):
    """Automatically create history record when assignment is deleted"""
    DeliveryRouteAssignmentHistory.objects.create(
        delivery_person=instance.delivery_person,
        delivery_person_name=instance.delivery_person.name,
        route=instance.route,
        route_code=instance.route.area_code,
        route_description=instance.route.area_code_description,
        action_type=DeliveryRouteAssignmentHistory.ActionType.DELETED,
        # changed_by=<get from request context if available>
    )