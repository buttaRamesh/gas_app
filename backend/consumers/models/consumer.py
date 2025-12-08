from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Consumer(models.Model):
    """
    Consumer model representing LPG gas consumers.
    Links to Person model via GenericForeignKey for personal information.
    """
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

    # Agency-specific identification
    consumer_number = models.CharField(
        "Consumer Number",
        max_length=9,
        unique=True,
        blank=True,
        null=True
    )

    # LPG specific details
    blue_book = models.PositiveBigIntegerField("Blue Book Number", blank=True, null=True)
    lpg_id = models.PositiveBigIntegerField("LPG ID", blank=True, null=True, unique=True)
    is_kyc_done = models.BooleanField("KYC Status", default=False)

    # Business categorization
    category = models.ForeignKey(
        'lookups.ConsumerCategory',
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )
    consumer_type = models.ForeignKey(
        'lookups.ConsumerType',
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )
    bpl_type = models.ForeignKey(
        'lookups.BPLType',
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )
    dct_type = models.ForeignKey(
        'lookups.DCTType',
        on_delete=models.PROTECT,
        verbose_name="DCT Type",
        blank=True,
        null=True
    )
    opting_status = models.CharField(
        max_length=20,
        choices=OptingStatus.choices,
        default=OptingStatus.PENDING
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW
    )
    scheme = models.ForeignKey(
        'schemes.Scheme',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    def __str__(self):
        if self.person:
            consumer_num = self.consumer_number or "Pending"
            return f"{self.person.full_name} ({consumer_num})"
        return f"Consumer {self.consumer_number or 'Pending'}"

    @property
    def full_name(self):
        """Get consumer's full name from person"""
        if self.person:
            return self.person.full_name
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
            models.Index(fields=['person_content_type', 'person_object_id']),
            models.Index(fields=['consumer_number']),
            models.Index(fields=['opting_status']),
            models.Index(fields=['status']),
            models.Index(fields=['is_kyc_done']),
            models.Index(fields=['category', 'consumer_type']),
            models.Index(fields=['scheme']),
        ]
