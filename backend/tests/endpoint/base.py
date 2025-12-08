"""
Base test class for API endpoint tests with utility methods
"""
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from commons.models import Person, Address, Contact, Identification, FamilyDetails
from consumers.models import Consumer
from connections.models import ConnectionDetails
from inventory.models import Product, ProductCategory, Unit
from lookups.models import ConnectionType
import json


class EndpointTestBase(APITestCase):
    """Base test case with helper methods for endpoint testing"""

    # Load fixtures with lookup data from existing database
    fixtures = ['lookups.json', 'inventory_lookups.json']

    @classmethod
    def setUpTestData(cls):
        """Set up test data that doesn't change across tests"""
        # Get existing lookup data from fixtures
        cls.connection_type = ConnectionType.objects.first()
        if not cls.connection_type:
            cls.connection_type = ConnectionType.objects.create(name="Test Connection Type")

        # Get or create a test product
        try:
            cls.category = ProductCategory.objects.first()
            cls.unit = Unit.objects.first()

            if not cls.category:
                cls.category = ProductCategory.objects.create(name="Test Category")
            if not cls.unit:
                cls.unit = Unit.objects.create(short_name="KG", description="Kilogram")

            cls.product = Product.objects.first()
            if not cls.product:
                cls.product = Product.objects.create(
                    name="Test Product",
                    product_code="TEST001",
                    category=cls.category,
                    unit=cls.unit,
                    is_cylinder=True
                )
        except Exception as e:
            print(f"Warning: Could not setup product: {e}")
            cls.product = None

    def setUp(self):
        """Set up test client before each test"""
        self.client = APIClient()
        # Note: Authentication is disabled in dev, so we don't need to authenticate

    def print_section(self, title, symbol="="):
        """Print a formatted section header"""
        width = 80
        print(f"\n{symbol * width}")
        print(f"{title.center(width)}")
        print(f"{symbol * width}\n")

    def print_subsection(self, title):
        """Print a formatted subsection header"""
        print(f"\n{'-' * 80}")
        print(f"  {title}")
        print(f"{'-' * 80}")

    def print_success(self, message):
        """Print success message"""
        print(f"[OK] {message}")

    def print_info(self, message, indent=0):
        """Print info message"""
        prefix = "  " * indent
        print(f"{prefix}[INFO] {message}")

    def print_data(self, label, value, indent=1):
        """Print data in key-value format"""
        prefix = "  " * indent
        print(f"{prefix}{label}: {value}")

    def print_request(self, method, url, data=None):
        """Print HTTP request details"""
        print(f"\n[REQUEST] {method} {url}")
        if data:
            print(f"[DATA] {json.dumps(data, indent=2)}")

    def print_response(self, response):
        """Print HTTP response details"""
        print(f"[RESPONSE] Status: {response.status_code}")
        if response.data:
            print(f"[RESPONSE DATA] {json.dumps(response.data, indent=2, default=str)}")

    def create_test_person(self, suffix=""):
        """Create a test person with all related data"""
        # Create unique 12-digit aadhar (pad suffix to 2 digits)
        suffix_num = suffix if suffix else "00"
        if len(suffix_num) < 2:
            suffix_num = suffix_num.zfill(2)

        # Create identification
        identification = Identification.objects.create(
            ration_card_num=f"RC{suffix_num}123456",
            aadhar_num=f"12345678{suffix_num}12"  # 12 digits total
        )

        # Create family details
        family = FamilyDetails.objects.create(
            father_name=f"Test Father {suffix}",
            mother_name=f"Test Mother {suffix}",
            spouse_name=f"Test Spouse {suffix}"
        )

        # Create person
        person = Person.objects.create(
            first_name=f"Test{suffix_num}",
            last_name="Person",
            full_name=f"Test{suffix_num} Person",
            identification=identification,
            family_details=family
        )

        # Create address
        content_type = ContentType.objects.get_for_model(Person)
        address = Address.objects.create(
            content_type=content_type,
            object_id=person.id,
            house_no="123",
            street_road_name="Test Street",
            city_town_village="Test City",
            pin_code="400001",
            address_text=f"123 Test Street, Test City {suffix_num}"
        )

        # Create contact (10-digit mobile number)
        contact = Contact.objects.create(
            content_type=content_type,
            object_id=person.id,
            mobile_number=f"987654{suffix_num}10",  # 10 digits total
            email=f"test{suffix_num}@example.com"
        )

        return person

    def create_test_consumer(self, consumer_number, with_connections=False):
        """Create a test consumer with optional connections"""
        person = self.create_test_person(suffix=consumer_number[-2:])

        # Get content type for generic FK
        person_ct = ContentType.objects.get_for_model(Person)

        consumer = Consumer.objects.create(
            person_content_type=person_ct,
            person_object_id=person.id,
            consumer_number=consumer_number,
            lpg_id=int(consumer_number[-4:]) if consumer_number[-4:].isdigit() else None,
            blue_book=int(consumer_number[-4:]) * 10 if consumer_number[-4:].isdigit() else None,
            is_kyc_done=False
        )

        if with_connections and hasattr(self, 'product'):
            # Create test connections
            ConnectionDetails.objects.create(
                consumer=consumer,
                sv_number=f"SV-{consumer_number}",
                connection_type=self.connection_type,
                product=self.product,
                num_of_regulators=2
            )

        return consumer

    def assert_response_success(self, response, expected_status=status.HTTP_200_OK):
        """Assert that response is successful"""
        self.assertEqual(
            response.status_code,
            expected_status,
            f"Expected status {expected_status}, got {response.status_code}. Response: {response.data}"
        )

    def assert_response_error(self, response, expected_status=status.HTTP_400_BAD_REQUEST):
        """Assert that response is an error"""
        self.assertEqual(
            response.status_code,
            expected_status,
            f"Expected error status {expected_status}, got {response.status_code}"
        )
