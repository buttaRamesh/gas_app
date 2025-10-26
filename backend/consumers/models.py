from django.db import models
from django.conf import settings # If using custom user model for history
from django.contrib.contenttypes.fields import GenericRelation # Needed for Consumer

# ==============================================================================
# app: consumers (or assignments app)
# Created: Model for assignment history (Created earlier today, discussed in last hour)
# ==============================================================================
class ConsumerRouteAssignmentHistory(models.Model):
    class ActionType(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        UPDATED = 'UPDATED', 'Updated'
        DELETED = 'DELETED', 'Deleted'
    consumer = models.ForeignKey(
        'consumers.Consumer', on_delete=models.SET_NULL, null=True,blank=True,related_name='+')
    consumer_number = models.CharField(max_length=50, blank=True)
    consumer_name = models.CharField(max_length=200, blank=True)
    
    route = models.ForeignKey(
        'routes.Route', on_delete=models.SET_NULL,null=True,blank=True, related_name='+')
    route_code = models.CharField(max_length=50, blank=True)
    route_description = models.CharField(max_length=150, blank=True)
    action_type = models.CharField(max_length=10, choices=ActionType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)

    # changed_by = models.ForeignKey(
    #         settings.AUTH_USER_MODEL, 
    #         null=True, 
    #         blank=True, 
    #         on_delete=models.SET_NULL,
    #         related_name='consumer_route_changes'
    #     )
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


# ==============================================================================
# app: consumers (or assignments app)
# Created: Model for assignment relationship (Created earlier today, discussed in last hour)
# ==============================================================================
class ConsumerRouteAssignment(models.Model):
    consumer = models.OneToOneField(
        'consumers.Consumer', on_delete=models.CASCADE, primary_key=True,
        related_name='route_assignment')
    route = models.ForeignKey(
        'routes.Route', on_delete=models.PROTECT, related_name='consumer_assignments')

    def __str__(self):
        return f"{self.consumer.consumer_name} assigned to {self.route.area_code}"

    class Meta:
        verbose_name = "Consumer Route Assignment"
        verbose_name_plural = "Consumer Route Assignments"
        indexes = [
            models.Index(fields=['route']),  # Fast lookup by route
        ]

# ==============================================================================
# app: consumers
# Modified: Removed unique constraint from ration_card_num and blue_book,
#           re-added null=True to ration_card_num, removed direct route FK
# ==============================================================================
class Consumer(models.Model):
    class OptingStatus(models.TextChoices):
        OPT_IN = 'OPT_IN', 'Opt In'
        OPT_OUT = 'OPT_OUT', 'Opt Out'
        PENDING = 'PENDING', 'Pending'
    consumer_number = models.CharField(max_length=50, unique=True)
    consumer_name = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200, blank=True, null=True)
    mother_name = models.CharField(max_length=200, blank=True, null=True)
    spouse_name = models.CharField(max_length=200, blank=True, null=True)
    ration_card_num = models.CharField("Ration Card Number", max_length=50, blank=True, null=True) # Modified
    blue_book = models.PositiveIntegerField("Blue Book Number", blank=True, null=True) # Modified
    lpg_id = models.PositiveBigIntegerField("LPG ID", blank=True, null=True, unique=True)
    is_kyc_done = models.BooleanField("KYC Status", default=False)
    category = models.ForeignKey('lookups.ConsumerCategory', on_delete=models.PROTECT)
    consumer_type = models.ForeignKey('lookups.ConsumerType', on_delete=models.PROTECT)
    bpl_type = models.ForeignKey('lookups.BPLType', on_delete=models.PROTECT, blank=True, null=True)
    dct_type = models.ForeignKey('lookups.DCTType', on_delete=models.PROTECT, verbose_name="DCT Type", blank=True, null=True)
    opting_status = models.CharField(max_length=20, choices=OptingStatus.choices, default=OptingStatus.PENDING)
    scheme = models.ForeignKey('schemes.Scheme', on_delete=models.SET_NULL, blank=True, null=True)
    # The direct route ForeignKey was removed earlier today
    addresses = GenericRelation('address.Address', related_query_name='consumer')
    contacts = GenericRelation('address.Contact', related_query_name='consumer')

    def __str__(self): return f"{self.consumer_name} ({self.consumer_number})"

    class Meta:
        indexes = [
            models.Index(fields=['consumer_name']),  # Name search
            models.Index(fields=['opting_status']),  # Filter by status
            models.Index(fields=['is_kyc_done']),  # Filter by KYC
            models.Index(fields=['category', 'consumer_type']),  # Composite for reports
            models.Index(fields=['scheme']),  # Filter by scheme
        ]
