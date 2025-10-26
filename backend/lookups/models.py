from django.db import models

class DCTType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField("Type description", max_length=150, blank=True, null=True)

    def __str__(self):
        return self.name

class MarketType(models.Model):
    name = models.CharField("Market type name", max_length=100, unique=True)

    def __str__(self):
        return self.name

class ConnectionType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ConsumerCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class ConsumerType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class BPLType(models.Model):
    name = models.CharField("BPL Type", max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "BPL Type"
        verbose_name_plural = "BPL Types"