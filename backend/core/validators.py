"""
Common validators for Django models and serializers
"""
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re


# Phone number validator - Indian format
phone_regex = RegexValidator(
    regex=r'^\+?91?[6-9]\d{9}$',
    message="Phone number must be in valid Indian format. Example: 9876543210 or +919876543210"
)


# Email validator - enhanced
def validate_email_domain(value):
    """
    Validate email domain is not from temporary email services
    """
    blocked_domains = [
        'tempmail.com',
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
    ]

    domain = value.split('@')[-1].lower()

    if domain in blocked_domains:
        raise ValidationError(
            f'Email addresses from {domain} are not allowed'
        )


# Aadhaar number validator
def validate_aadhaar(value):
    """
    Validate Aadhaar number (12 digits)
    """
    if not re.match(r'^\d{12}$', str(value)):
        raise ValidationError('Aadhaar number must be exactly 12 digits')


# PAN card validator
def validate_pan(value):
    """
    Validate PAN card format (AAAAA9999A)
    """
    if not re.match(r'^[A-Z]{5}\d{4}[A-Z]$', str(value).upper()):
        raise ValidationError('PAN must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)')


# Pincode validator - Indian
def validate_pincode(value):
    """
    Validate Indian pincode (6 digits)
    """
    if not re.match(r'^\d{6}$', str(value)):
        raise ValidationError('Pincode must be exactly 6 digits')


# LPG ID validator
def validate_lpg_id(value):
    """
    Validate LPG ID format
    """
    if not value or len(str(value)) < 10:
        raise ValidationError('LPG ID must be at least 10 characters')


# Price validator
def validate_price(value):
    """
    Validate price is positive
    """
    if value <= 0:
        raise ValidationError('Price must be greater than 0')


# Quantity validator
def validate_quantity(value):
    """
    Validate quantity is positive integer
    """
    if value <= 0:
        raise ValidationError('Quantity must be greater than 0')


# Date range validator
def validate_date_range(start_date, end_date):
    """
    Validate that end_date is after start_date
    """
    if end_date < start_date:
        raise ValidationError('End date must be after start date')


# File size validator
def validate_file_size(value, max_size_mb=5):
    """
    Validate uploaded file size

    Args:
        value: File object
        max_size_mb: Maximum file size in MB (default: 5)
    """
    if value.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f'File size cannot exceed {max_size_mb}MB')


# Image file validator
def validate_image_file(value):
    """
    Validate uploaded file is an image
    """
    valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    file_extension = value.name.split('.')[-1].lower()

    if file_extension not in valid_extensions:
        raise ValidationError(
            f'Only {", ".join(valid_extensions)} files are allowed'
        )


# Password strength validator
def validate_password_strength(value):
    """
    Validate password meets security requirements
    """
    if len(value) < 8:
        raise ValidationError('Password must be at least 8 characters long')

    if not re.search(r'[A-Z]', value):
        raise ValidationError('Password must contain at least one uppercase letter')

    if not re.search(r'[a-z]', value):
        raise ValidationError('Password must contain at least one lowercase letter')

    if not re.search(r'\d', value):
        raise ValidationError('Password must contain at least one digit')

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValidationError('Password must contain at least one special character')


# Consumer ID validator
def validate_consumer_id(value):
    """
    Validate consumer ID format
    """
    if not value or len(str(value)) < 8:
        raise ValidationError('Consumer ID must be at least 8 characters')


# Route code validator
def validate_route_code(value):
    """
    Validate route code format
    """
    if not re.match(r'^[A-Z0-9-]+$', str(value).upper()):
        raise ValidationError('Route code can only contain letters, numbers, and hyphens')


# Delivery person code validator
def validate_delivery_person_code(value):
    """
    Validate delivery person code format
    """
    if not re.match(r'^DP-\d{4,}$', str(value).upper()):
        raise ValidationError('Delivery person code must be in format: DP-XXXX')


# Cylinder serial number validator
def validate_cylinder_serial(value):
    """
    Validate cylinder serial number
    """
    if not value or len(str(value)) < 8:
        raise ValidationError('Cylinder serial number must be at least 8 characters')


# Positive decimal validator
def validate_positive_decimal(value):
    """
    Validate value is a positive decimal number
    """
    if value <= 0:
        raise ValidationError('Value must be greater than 0')


# Percentage validator
def validate_percentage(value):
    """
    Validate value is between 0 and 100
    """
    if value < 0 or value > 100:
        raise ValidationError('Value must be between 0 and 100')


# Bank account number validator
def validate_bank_account(value):
    """
    Validate bank account number (9-18 digits)
    """
    if not re.match(r'^\d{9,18}$', str(value)):
        raise ValidationError('Bank account number must be between 9 and 18 digits')


# IFSC code validator
def validate_ifsc_code(value):
    """
    Validate IFSC code format
    """
    if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', str(value).upper()):
        raise ValidationError('IFSC code must be in format: XXXX0XXXXXX (4 letters, 0, 6 alphanumeric)')


# GST number validator
def validate_gst_number(value):
    """
    Validate GST number format
    """
    if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', str(value).upper()):
        raise ValidationError('Invalid GST number format')


# No special characters validator
def validate_no_special_chars(value):
    """
    Validate string contains no special characters
    """
    if not re.match(r'^[a-zA-Z0-9\s]+$', value):
        raise ValidationError('Only letters, numbers, and spaces are allowed')


# Alphanumeric validator
def validate_alphanumeric(value):
    """
    Validate string is alphanumeric
    """
    if not re.match(r'^[a-zA-Z0-9]+$', value):
        raise ValidationError('Only letters and numbers are allowed')


# URL slug validator
url_slug_validator = RegexValidator(
    regex=r'^[-a-zA-Z0-9_]+$',
    message='Only letters, numbers, hyphens, and underscores are allowed'
)
