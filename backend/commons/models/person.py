from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

class Person(models.Model):
    """
    Generic person information - can be referenced by Consumer, DeliveryPerson, etc.
    Holds all personal/family information and contact details.
    """
    first_name = models.CharField("First Name", max_length=200)
    last_name = models.CharField("Last Name", max_length=200)
    full_name = models.CharField("Person Name", max_length=200)
    dob = models.DateField("Date of Birth", blank=True, null=True)

    # Foreign Key relations to models that are person-specific
    identification = models.ForeignKey(
        'commons.Identification',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='persons',
        help_text="Identification documents for this person"
    )
    family_details = models.ForeignKey(
        'commons.FamilyDetails',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='persons',
        help_text="Family details for this person"
    )

    # Generic relations - Contact and Address can link to Person, Office, Organization, etc.
    addresses = GenericRelation(
        'commons.Address',
        content_type_field='content_type',
        object_id_field='object_id',
        related_query_name='person'
    )
    contacts = GenericRelation(
        'commons.Contact',
        content_type_field='content_type',
        object_id_field='object_id',
        related_query_name='person'
    )

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "Person"
        verbose_name_plural = "Persons"
        indexes = [
            models.Index(fields=['full_name']),  # Name search
        ]
