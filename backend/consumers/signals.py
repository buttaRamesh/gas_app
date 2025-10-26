from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import ConsumerRouteAssignment, ConsumerRouteAssignmentHistory


@receiver(pre_save, sender=ConsumerRouteAssignmentHistory)
def populate_consumer_route_history_fields(sender, instance, **kwargs):
    """Populate denormalized fields before saving history record"""
    if instance.consumer:
        instance.consumer_number = instance.consumer.consumer_number
        instance.consumer_name = instance.consumer.consumer_name
    
    if instance.route:
        instance.route_code = instance.route.area_code
        instance.route_description = instance.route.area_code_description


@receiver(post_save, sender=ConsumerRouteAssignment)
def log_consumer_route_assignment_create_update(sender, instance, created, **kwargs):
    """Automatically create history record when assignment is created or updated"""
    action_type = ConsumerRouteAssignmentHistory.ActionType.CREATED if created else ConsumerRouteAssignmentHistory.ActionType.UPDATED
    
    ConsumerRouteAssignmentHistory.objects.create(
        consumer=instance.consumer,
        consumer_number=instance.consumer.consumer_number,
        consumer_name=instance.consumer.consumer_name,
        route=instance.route,
        route_code=instance.route.area_code,
        route_description=instance.route.area_code_description,
        action_type=action_type,
        # changed_by=<get from request context if available>
    )


@receiver(post_delete, sender=ConsumerRouteAssignment)
def log_consumer_route_assignment_delete(sender, instance, **kwargs):
    """Automatically create history record when assignment is deleted"""
    ConsumerRouteAssignmentHistory.objects.create(
        consumer=instance.consumer,
        consumer_number=instance.consumer.consumer_number,
        consumer_name=instance.consumer.consumer_name,
        route=instance.route,
        route_code=instance.route.area_code,
        route_description=instance.route.area_code_description,
        action_type=ConsumerRouteAssignmentHistory.ActionType.DELETED,
        # changed_by=<get from request context if available>
    )
