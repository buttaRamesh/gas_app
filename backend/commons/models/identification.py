from django.db import models


class Identification(models.Model):   
    ration_card_num = models.CharField("Ration Card Number", max_length=50, blank=True, null=True)
    aadhar_num = models.CharField("Aadhar Number", max_length=12, blank=True, null=True)
    pan_num = models.CharField("PAN Number", max_length=10, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return f"Identification for {self.consumer.consumer_number}"

    class Meta:
        verbose_name = "Identification"
        verbose_name_plural = "Identifications"
        indexes = [
            models.Index(fields=['ration_card_num']),
            models.Index(fields=['aadhar_num']),
        ]
