from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Contact(models.Model):
    email = models.EmailField("Email ID", max_length=150, blank=True, null=True)
    phone_number = models.CharField("Landline number", max_length=15, blank=True, null=True)
    mobile_number = models.CharField("Mobile number", max_length=15, blank=True, null=True)

    # --- fields for the generic relation ---
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    related_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        # Display the mobile, email, or landline, whichever is available
        return self.mobile_number or self.email or self.phone_number or f"Contact ID: {self.pk}"
    
    class Meta:
        verbose_name_plural = "Contacts"
        # Add index for faster lookups
        indexes = [
            models.Index(fields=['content_type', 'object_id']),  # For generic relation lookups
            models.Index(fields=['mobile_number']),  # For mobile searches
            models.Index(fields=['email']),  # For email searches
        ]