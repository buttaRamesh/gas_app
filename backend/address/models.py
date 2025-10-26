from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Address(models.Model):
    # Address component fields
    house_no = models.CharField("House number", max_length=50, blank=True, null=True)
    house_name_flat_number = models.CharField("Flat or building name", max_length=100, blank=True, null=True)
    housing_complex_building = models.CharField("Complex name", max_length=100, blank=True, null=True)
    street_road_name = models.CharField("Street name", max_length=150, blank=True, null=True)
    land_mark = models.CharField("Nearby landmark", max_length=150, blank=True, null=True)
    city_town_village = models.CharField("City or village", max_length=100, blank=True, null=True)
    district = models.CharField("District name", max_length=100, blank=True, null=True)
    pin_code = models.CharField("Postal code", max_length=10, blank=True, null=True)
    
    # Field for the complete, pre-formatted address string
    address_text = models.TextField("Full Address Text", blank=True, null=True)

    # Fields for the generic relationship
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.PositiveIntegerField()
    related_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.address_text or f"{self.house_no}, {self.street_road_name}"

    class Meta:
        verbose_name_plural = "Addresses"
        # Add index for faster lookups
        indexes = [
            models.Index(fields=['content_type', 'object_id']),  # For generic relation lookups
            models.Index(fields=['pin_code']),  # For location-based searches
            models.Index(fields=['city_town_village']),  # For city searches
        ]



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