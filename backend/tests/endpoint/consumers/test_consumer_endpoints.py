"""
Comprehensive endpoint tests for Consumer API
Run with: python manage.py test tests.endpoint.consumers.test_consumer_endpoints
"""
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from commons.models import Person, Identification, FamilyDetails
from consumers.models import Consumer
from connections.models import ConnectionDetails
from tests.endpoint.base import EndpointTestBase


class ConsumerListEndpointTests(EndpointTestBase):
    """Test suite for Consumer List endpoint (GET /api/consumers/)"""

    def test_01_list_empty_consumers(self):
        """Test 1.1: List consumers when none exist"""
        self.print_section("TEST 1.1: List Empty Consumers")

        url = "/api/consumers/"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
        self.print_success("Empty list returned successfully")

    def test_02_list_consumers(self):
        """Test 1.2: List consumers with data"""
        self.print_section("TEST 1.2: List Consumers")

        # Create test consumers
        consumer1 = self.create_test_consumer("TEST001")
        consumer2 = self.create_test_consumer("TEST002")
        self.print_info(f"Created 2 test consumers")

        url = "/api/consumers/"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 2)
        self.print_success(f"Found {len(response.data['results'])} consumers")

    def test_03_list_consumers_with_pagination(self):
        """Test 1.3: List consumers with pagination"""
        self.print_section("TEST 1.3: List Consumers with Pagination")

        # Create multiple consumers
        for i in range(15):
            self.create_test_consumer(f"PAGE{i:03d}")
        self.print_info("Created 15 test consumers")

        url = "/api/consumers/?page=1&page_size=10"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 15)
        self.assertEqual(response.data['page'], 1)
        self.assertEqual(response.data['page_size'], 10)
        self.assertLessEqual(len(response.data['results']), 10)
        self.print_success("Pagination working correctly")

    def test_04_search_consumers(self):
        """Test 1.4: Search consumers by consumer number"""
        self.print_section("TEST 1.4: Search Consumers")

        # Create test consumer
        consumer = self.create_test_consumer("SEARCH01")
        self.print_info(f"Created consumer: {consumer.consumer_number}")

        url = f"/api/consumers/?search=SEARCH01"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
        self.assertEqual(response.data['results'][0]['consumer_number'], "SEARCH01")
        self.print_success("Search returned correct consumer")


class ConsumerCreateEndpointTests(EndpointTestBase):
    """Test suite for Consumer Create endpoint (POST /api/consumers/)"""

    def test_01_create_simple_consumer(self):
        """Test 2.1: Create consumer with basic data"""
        self.print_section("TEST 2.1: Create Simple Consumer")

        # Create person first
        person = self.create_test_person(suffix="01")
        person_ct = ContentType.objects.get_for_model(Person)

        url = "/api/consumers/"
        data = {
            "person_content_type": person_ct.id,
            "person_object_id": person.id,
            "consumer_number": "API001",
            "lpg_id": 1001,
            "blue_book": 10010,
            "is_kyc_done": False
        }

        self.print_request("POST", url, data)
        response = self.client.post(url, data, format='json')
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_201_CREATED)
        self.assertEqual(response.data['consumer_number'], "API001")
        self.assertEqual(response.data['lpg_id'], 1001)
        self.print_success("Consumer created successfully via API")

    def test_02_create_consumer_with_full_data(self):
        """Test 2.2: Create consumer with complete data"""
        self.print_section("TEST 2.2: Create Consumer with Full Data")

        # Create complete person data
        identification = Identification.objects.create(
            ration_card_num="API123456",
            aadhar_num="111122223333",
            pan_num="APIPN1234F"
        )

        family = FamilyDetails.objects.create(
            father_name="API Father",
            mother_name="API Mother",
            spouse_name="API Spouse"
        )

        person = Person.objects.create(
            first_name="API",
            last_name="Test",
            full_name="API Test",
            identification=identification,
            family_details=family
        )

        person_ct = ContentType.objects.get_for_model(Person)

        url = "/api/consumers/"
        data = {
            "person_content_type": person_ct.id,
            "person_object_id": person.id,
            "consumer_number": "API002",
            "lpg_id": 2002,
            "blue_book": 20020,
            "is_kyc_done": True
        }

        self.print_request("POST", url, data)
        response = self.client.post(url, data, format='json')
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_201_CREATED)
        self.assertEqual(response.data['consumer_number'], "API002")
        self.assertTrue(response.data['is_kyc_done'])
        self.print_success("Consumer with full data created successfully")

    def test_03_create_consumer_with_duplicate_number(self):
        """Test 2.3: Attempt to create consumer with duplicate number"""
        self.print_section("TEST 2.3: Create Duplicate Consumer")

        # Create first consumer
        consumer = self.create_test_consumer("DUPL001")
        self.print_info(f"Created consumer: {consumer.consumer_number}")

        # Try to create duplicate
        person = self.create_test_person(suffix="99")
        person_ct = ContentType.objects.get_for_model(Person)

        url = "/api/consumers/"
        data = {
            "person_content_type": person_ct.id,
            "person_object_id": person.id,
            "consumer_number": "DUPL001",  # Duplicate
            "lpg_id": 9999,
            "is_kyc_done": False
        }

        self.print_request("POST", url, data)
        response = self.client.post(url, data, format='json')
        self.print_response(response)

        self.assert_response_error(response, status.HTTP_400_BAD_REQUEST)
        self.print_success("Duplicate consumer rejected correctly")

    def test_04_create_consumer_with_minimal_data(self):
        """Test 2.4: Create consumer with minimal data (API allows nulls)"""
        self.print_section("TEST 2.4: Create Consumer with Minimal Data")

        url = "/api/consumers/"
        data = {
            "lpg_id": 5555,
            # consumer_number and person are optional (can be null)
        }

        self.print_request("POST", url, data)
        response = self.client.post(url, data, format='json')
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_201_CREATED)
        self.assertEqual(response.data['lpg_id'], 5555)
        self.assertIsNone(response.data['consumer_number'])
        self.assertIsNone(response.data['person'])
        self.print_success("Consumer created with minimal data")


class ConsumerRetrieveEndpointTests(EndpointTestBase):
    """Test suite for Consumer Retrieve endpoint (GET /api/consumers/{id}/)"""

    def test_01_retrieve_consumer(self):
        """Test 3.1: Retrieve consumer details"""
        self.print_section("TEST 3.1: Retrieve Consumer")

        # Create test consumer
        consumer = self.create_test_consumer("RETR001")
        self.print_info(f"Created consumer ID: {consumer.id}")

        url = f"/api/consumers/{consumer.id}/"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], consumer.id)
        self.assertEqual(response.data['consumer_number'], "RETR001")
        self.print_success("Consumer retrieved successfully")

    def test_02_retrieve_consumer_with_relations(self):
        """Test 3.2: Retrieve consumer with person data"""
        self.print_section("TEST 3.2: Retrieve Consumer with Relations")

        # Create test consumer
        consumer = self.create_test_consumer("RETR002")
        self.print_info(f"Created consumer with person: {consumer.person.full_name}")

        url = f"/api/consumers/{consumer.id}/"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get('person'))
        self.print_success("Consumer with relations retrieved successfully")

    def test_03_retrieve_nonexistent_consumer(self):
        """Test 3.3: Attempt to retrieve non-existent consumer"""
        self.print_section("TEST 3.3: Retrieve Non-existent Consumer")

        url = "/api/consumers/99999/"
        self.print_request("GET", url)

        response = self.client.get(url)
        self.print_response(response)

        self.assert_response_error(response, status.HTTP_404_NOT_FOUND)
        self.print_success("Non-existent consumer returns 404 correctly")


class ConsumerUpdateEndpointTests(EndpointTestBase):
    """Test suite for Consumer Update endpoints (PUT/PATCH /api/consumers/{id}/)"""

    def test_01_full_update_consumer(self):
        """Test 4.1: Full update consumer (PUT)"""
        self.print_section("TEST 4.1: Full Update Consumer (PUT)")

        # Create test consumer
        consumer = self.create_test_consumer("UPD001")
        self.print_info(f"Initial LPG ID: {consumer.lpg_id}")

        person_ct = ContentType.objects.get_for_model(Person)

        url = f"/api/consumers/{consumer.id}/"
        data = {
            "person_content_type": person_ct.id,
            "person_object_id": consumer.person.id,
            "consumer_number": consumer.consumer_number,
            "lpg_id": 88888,
            "blue_book": 77777,
            "is_kyc_done": True
        }

        self.print_request("PUT", url, data)
        response = self.client.put(url, data, format='json')
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertEqual(response.data['lpg_id'], 88888)
        self.assertEqual(response.data['blue_book'], 77777)
        self.assertTrue(response.data['is_kyc_done'])
        self.print_success("Consumer updated successfully via PUT")

    def test_02_partial_update_consumer(self):
        """Test 4.2: Partial update consumer (PATCH)"""
        self.print_section("TEST 4.2: Partial Update Consumer (PATCH)")

        # Create test consumer
        consumer = self.create_test_consumer("UPD002")
        self.print_info(f"Initial KYC status: {consumer.is_kyc_done}")

        url = f"/api/consumers/{consumer.id}/"
        data = {
            "is_kyc_done": True,
            "lpg_id": 66666
        }

        self.print_request("PATCH", url, data)
        response = self.client.patch(url, data, format='json')
        self.print_response(response)

        self.assert_response_success(response, status.HTTP_200_OK)
        self.assertEqual(response.data['lpg_id'], 66666)
        self.assertTrue(response.data['is_kyc_done'])
        self.print_success("Consumer updated successfully via PATCH")

    def test_03_update_with_invalid_data(self):
        """Test 4.3: Attempt to update with invalid data"""
        self.print_section("TEST 4.3: Update with Invalid Data")

        # Create test consumer
        consumer = self.create_test_consumer("UPD003")
        self.print_info(f"Consumer ID: {consumer.id}")

        url = f"/api/consumers/{consumer.id}/"
        data = {
            "lpg_id": "INVALID",  # Should be integer
        }

        self.print_request("PATCH", url, data)
        response = self.client.patch(url, data, format='json')
        self.print_response(response)

        self.assert_response_error(response, status.HTTP_400_BAD_REQUEST)
        self.print_success("Invalid data rejected correctly")



# Note: DELETE endpoint is not implemented for Consumer
# The ConsumerViewSet only supports: LIST, CREATE, RETRIEVE, UPDATE, PARTIAL_UPDATE
