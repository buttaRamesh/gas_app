from django.db import models


class BaseLookup(models.Model):
    """
    Abstract base class for all lookup tables.
    Provides common fields: name, description, ordering, __str__.
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name


class DCTType(BaseLookup):
    """Domestic / Commercial Type"""
    pass


class MarketType(BaseLookup):
    """Market Segmentation Type"""
    pass


class ConnectionType(BaseLookup):
    """Connection category type (e.g., Domestic, Non-Domestic)"""
    pass


class ConsumerCategory(BaseLookup):
    """Consumer category (e.g., APL, BPL, Others)"""
    pass


class ConsumerType(BaseLookup):
    """Type of consumer (e.g., Domestic, Commercial, Industrial)"""
    pass


class BPLType(BaseLookup):
    """Type classification for BPL households"""
    pass
