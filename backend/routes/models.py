from django.db import models

class Route(models.Model):
    """
    Represents a delivery route, identified by a unique area code.
    """
    area_code = models.CharField("Unique route code", max_length=50, unique=True)
    area_code_description = models.CharField("Route description", max_length=150)
    

    def __str__(self):
        return f"{self.area_code} - {self.area_code_description}"
    
    # class Meta:
    #     indexes = [
    #         models.Index(fields=['area_code_description']),  # Search by description
    #     ]

# class RouteArea(models.Model):
#     """
#     Represents a specific area within a larger route.
#     """
#     area_name = models.CharField("Area name", max_length=100)
#     route = models.ForeignKey(
#         Route,
#         on_delete=models.CASCADE,
#         related_name='areas',
#         verbose_name="Associated route"
#     )

#     def __str__(self):
#         return self.area_name
    



class RouteArea(models.Model):
    """
    Areas within a route.
    Route can be null for unassigned areas.
    """
    area_name = models.CharField("Area name", max_length=100)
    route = models.ForeignKey(
        'routes.Route', 
        on_delete=models.SET_NULL,  # Set to NULL instead of deleting
        related_name='areas', 
        verbose_name="Associated route",
        null=True,           # Allow null
        blank=True           # Allow blank in forms
    )

    def __str__(self):
        if self.route:
            return f"{self.area_name} ({self.route.area_code})"
        return f"{self.area_name} (Unassigned)"

    class Meta:
        verbose_name = "Route Area"
        verbose_name_plural = "Route Areas"
        ordering = ['area_name']

# 