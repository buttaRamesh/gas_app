from django.db import models

class ConnectionDetails(models.Model):
    # --- NEW FIELD ADDED ---
    # This creates the many-to-one relationship.
    # Many connections can now belong to one consumer.
    consumer = models.ForeignKey(
        'consumers.Consumer',
        on_delete=models.CASCADE,
        related_name='connections'
    )
    # -----------------------

    sv_number = models.CharField("Service number", max_length=50, unique=True)
    sv_date = models.DateField("Service initiation date")
    hist_code_description = models.CharField(
        "History/category description", 
        max_length=150,
        blank=True,
        null=True
    )
    
    connection_type = models.ForeignKey(
        'lookups.ConnectionType',
        verbose_name="Connection Type",
        on_delete=models.PROTECT
    )
    
    product = models.ForeignKey(
        'products.ProductVariant',
        verbose_name="Product",
        on_delete=models.PROTECT
    )

    num_of_regulators = models.PositiveIntegerField(
        "Number of Regulators", 
        default=1
    )

    def __str__(self):
        try:
            return f"{self.sv_number} ({self.product.variant_name})"
        except (AttributeError, self.product.DoesNotExist):
            return self.sv_number

    class Meta:
        verbose_name = "Connection Details"
        verbose_name_plural = "Connection Details"
        indexes = [
            models.Index(fields=['consumer', 'connection_type']),  # Composite for filtering
            models.Index(fields=['sv_date']),  # Date-based queries
            models.Index(fields=['product']),  # Product-based reports
        ]






# consumer_number VARCHAR(50) Unique consumer number
# consumer_name VARCHAR(100) Full name of the customer
# father_name VARCHAR(100) Father’s name
# mother_name VARCHAR(100) Mother’s name
# spouse_name VARCHAR(100) Spouse’s name
# ration_card_no VARCHAR(50) Ration card number
# category VARCHAR(50) Customer category (domestic/commercial)
# consumer_type VARCHAR(50) Consumer type
# bpl_type VARCHAR(50) Below Poverty Line classification
# opting_status VARCHAR(50) Opted for subsidy or not
# scheme_id FK ® Scheme(id) Applicable LPG scheme
# dct_type_id FK ® DCTType(id)DCT classification
# connection_id FK ® ConnectionDeCtoanilsn(eidc)tion details
# address_id FK ® Address(id) Address reference
# contact_id FK ® Contact(id) Contact reference
# lgd_id FK ® LGDInfo(id) Linked LGD details
# kyc_log_id FK ® KYCLog(id) KYC verification record
# inspection_log_id FK ® InspectionLogIn(isdp)ection details
# subsidy_details_id FK ® SubsidyDetaiSlsu(ibds)idy and quota info
# route_id FK ® Route(id) Route under which the customer falls        