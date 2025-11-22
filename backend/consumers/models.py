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
        consumer_name = self.consumer.person.person_name if self.consumer and self.consumer.person else self.consumer.consumer_number
        return f"{consumer_name} assigned to {self.route.area_code}"

    class Meta:
        verbose_name = "Consumer Route Assignment"
        verbose_name_plural = "Consumer Route Assignments"
        indexes = [
            models.Index(fields=['route']),  # Fast lookup by route
        ]

# ==============================================================================
# app: consumers
# Created: Person model for generic personal information
# ==============================================================================
class Person(models.Model):
    """
    Generic person information - can be referenced by Consumer, DeliveryPerson, etc.
    Holds all personal/family information and contact details.
    """
    person_name = models.CharField("Person Name", max_length=200)
    father_name = models.CharField("Father's Name", max_length=200, blank=True, null=True)
    mother_name = models.CharField("Mother's Name", max_length=200, blank=True, null=True)
    spouse_name = models.CharField("Spouse Name", max_length=200, blank=True, null=True)
    dob = models.DateField("Date of Birth", blank=True, null=True)

    # Generic relations for address and contact
    addresses = GenericRelation('address.Address', related_query_name='person')
    contacts = GenericRelation('address.Contact', related_query_name='person')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.person_name

    class Meta:
        verbose_name = "Person"
        verbose_name_plural = "Persons"
        indexes = [
            models.Index(fields=['person_name']),  # Name search
        ]


# ==============================================================================
# app: consumers
# Created: Identifications model for consumer identification documents
# ==============================================================================
class Identification(models.Model):
    """
    Consumer identification documents.
    Holds ration card, aadhar, and PAN information.
    """
    consumer = models.OneToOneField(
        'Consumer',
        on_delete=models.CASCADE,
        related_name='identification',
        help_text="Consumer this identification belongs to"
    )
    ration_card_num = models.CharField("Ration Card Number", max_length=50, blank=True, null=True)
    aadhar_num = models.CharField("Aadhar Number", max_length=12, blank=True, null=True)
    pan_num = models.CharField("PAN Number", max_length=10, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Identification for {self.consumer.consumer_number}"

    class Meta:
        verbose_name = "Identification"
        verbose_name_plural = "Identifications"
        indexes = [
            models.Index(fields=['consumer']),
            models.Index(fields=['ration_card_num']),
            models.Index(fields=['aadhar_num']),
        ]


# ==============================================================================
# app: consumers
# Modified: Refactored to reference Person model, removed personal info fields
# ==============================================================================
class Consumer(models.Model):
    class OptingStatus(models.TextChoices):
        OPT_IN = 'OPT_IN', 'Opt In'
        OPT_OUT = 'OPT_OUT', 'Opt Out'
        PENDING = 'PENDING', 'Pending'

    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        DELETED = 'DELETED', 'Deleted'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    # Link to Person (personal/family information)
    # Temporarily nullable to allow data migration
    person = models.ForeignKey(
        'Person',
        on_delete=models.PROTECT,
        related_name='consumers',
        help_text="Personal information for this consumer",
        null=True,
        blank=True
    )

    # Agency-specific identification
    consumer_number = models.CharField("Consumer Number", max_length=9, unique=True, blank=True, null=True)

    # LPG specific details (now optional)
    blue_book = models.PositiveBigIntegerField("Blue Book Number", blank=True, null=True)
    lpg_id = models.PositiveBigIntegerField("LPG ID", blank=True, null=True, unique=True)
    is_kyc_done = models.BooleanField("KYC Status", default=False)

    # Business categorization (now optional)
    category = models.ForeignKey('lookups.ConsumerCategory', on_delete=models.PROTECT, blank=True, null=True)
    consumer_type = models.ForeignKey('lookups.ConsumerType', on_delete=models.PROTECT, blank=True, null=True)
    bpl_type = models.ForeignKey('lookups.BPLType', on_delete=models.PROTECT, blank=True, null=True)
    dct_type = models.ForeignKey('lookups.DCTType', on_delete=models.PROTECT, verbose_name="DCT Type", blank=True, null=True)
    opting_status = models.CharField(max_length=20, choices=OptingStatus.choices, default=OptingStatus.PENDING)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    scheme = models.ForeignKey('schemes.Scheme', on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        if self.person:
            consumer_num = self.consumer_number or "Pending"
            return f"{self.person.person_name} ({consumer_num})"
        return f"Consumer {self.consumer_number or 'Pending'}"

    @property
    def full_name(self):
        """Get consumer's full name from person"""
        if self.person:
            return self.person.person_name
        return ""

    @property
    def mobile(self):
        """Get consumer's primary mobile number from person contacts"""
        if self.person and self.person.contacts.exists():
            first_contact = self.person.contacts.first()
            return first_contact.mobile_number if first_contact.mobile_number else ""
        return ""

    class Meta:
        verbose_name = "Consumer"
        verbose_name_plural = "Consumers"
        indexes = [
            models.Index(fields=['person']),  # Join to person for name search
            models.Index(fields=['consumer_number']),  # Consumer number lookup
            models.Index(fields=['opting_status']),  # Filter by status
            models.Index(fields=['status']),  # Filter by consumer status
            models.Index(fields=['is_kyc_done']),  # Filter by KYC
            models.Index(fields=['category', 'consumer_type']),  # Composite for reports
            models.Index(fields=['scheme']),  # Filter by scheme
        ]
