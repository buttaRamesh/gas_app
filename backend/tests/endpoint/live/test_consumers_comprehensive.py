"""
Comprehensive Live API tests for Consumer endpoints
Tests: Creation with full data, Validations, Modifications (Consumer/Person/Connections)

Usage:
1. Start your Django server: python manage.py runserver
2. Run this script: python tests/endpoint/live/test_consumers_comprehensive.py
"""

import requests
import json
from config import BASE_URL, TEST_DATA_PREFIX, CLEANUP_AFTER_TESTS

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'


class ComprehensiveConsumerTester:
    """Comprehensive tests for Consumer API - Creation, Validation, Modifications"""

    def __init__(self):
        self.base_url = f"{BASE_URL}/api"
        self.consumers_url = f"{self.base_url}/consumers/"
        self.persons_url = f"{BASE_URL}/api/persons/"  # Assuming this exists
        self.connections_url = f"{BASE_URL}/api/connections/"

        # Track created resources for cleanup
        self.test_consumer_id = None
        self.test_person_id = None
        self.test_connection_ids = []

        self.passed = 0
        self.failed = 0

    def print_header(self, text, level=1):
        """Print test section header"""
        if level == 1:
            print(f"\n{'=' * 80}")
            print(f"{text.center(80)}")
            print(f"{'=' * 80}\n")
        elif level == 2:
            print(f"\n{'-' * 80}")
            print(f"  {text}")
            print(f"{'-' * 80}\n")

    def print_test(self, test_name):
        """Print test name"""
        print(f"\n{BLUE}[TEST]{RESET} {test_name}")

    def print_request(self, method, url, data=None):
        """Print HTTP request details"""
        print(f"  {YELLOW}[REQUEST]{RESET} {method} {url}")
        if data:
            print(f"  {CYAN}[DATA]{RESET}")
            print(json.dumps(data, indent=4))

    def print_response(self, response):
        """Print HTTP response"""
        status_color = GREEN if 200 <= response.status_code < 300 else RED
        print(f"  {status_color}[RESPONSE]{RESET} Status: {response.status_code}")
        try:
            data = response.json()
            print(f"  {CYAN}[BODY]{RESET}")
            print(json.dumps(data, indent=4))
        except:
            print(f"  {CYAN}[BODY]{RESET} {response.text}")

    def assert_status(self, response, expected_status, test_desc=""):
        """Assert response status code"""
        if response.status_code == expected_status:
            print(f"  {GREEN}[PASS]{RESET} {test_desc or 'Status'}: {response.status_code} == {expected_status}")
            self.passed += 1
            return True
        else:
            print(f"  {RED}[FAIL]{RESET} {test_desc or 'Status'}: {response.status_code} != {expected_status}")
            self.failed += 1
            return False

    def assert_field(self, data, field, expected_value=None, test_desc=""):
        """Assert field exists and optionally matches value"""
        if field in data:
            if expected_value is None or data[field] == expected_value:
                print(f"  {GREEN}[PASS]{RESET} {test_desc or field}: Found{' and matches' if expected_value else ''}")
                self.passed += 1
                return True
        print(f"  {RED}[FAIL]{RESET} {test_desc or field}: Not found or mismatch")
        self.failed += 1
        return False

    # ==================== HELPER METHODS ====================

    def get_existing_person_id(self):
        """Get an existing person ID from database"""
        # List consumers and get first person
        response = requests.get(self.consumers_url)
        if response.status_code == 200:
            consumers = response.json().get('results', [])
            for consumer in consumers:
                if consumer.get('person'):
                    # Get person detail to get person ID
                    consumer_detail = requests.get(f"{self.consumers_url}{consumer['id']}/")
                    if consumer_detail.status_code == 200:
                        person = consumer_detail.json().get('person')
                        if person and person.get('id'):
                            return person['id']
        return None

    def get_existing_product_and_connection_type(self):
        """Get existing product and connection type from database"""
        # Get from first connection
        response = requests.get(self.connections_url)
        if response.status_code == 200:
            connections = response.json().get('results', [])
            if connections:
                conn = connections[0]
                return conn.get('product'), conn.get('connection_type')
        return None, None

    # ==================== SECTION 1: CREATION TESTS ====================

    def test_01_create_consumer_minimal(self):
        """Test 1.1: Create consumer with minimal data"""
        self.print_test("Test 1.1: Create Consumer (Minimal Data)")

        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}MIN",
            "lpg_id": 11111,
            "is_kyc_done": False
        }

        self.print_request("POST", self.consumers_url, data)
        response = requests.post(self.consumers_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Consumer created"):
            self.assert_field(response.json(), 'consumer_number', f"{TEST_DATA_PREFIX}MIN")
            self.assert_field(response.json(), 'lpg_id', 11111)

    def test_02_create_consumer_with_person(self):
        """Test 1.2: Create consumer with associated person"""
        self.print_test("Test 1.2: Create Consumer with Person")

        # Get existing person ID
        person_id = self.get_existing_person_id()
        if not person_id:
            print(f"  {YELLOW}[SKIP]{RESET} No existing person found")
            return

        print(f"  {CYAN}[INFO]{RESET} Using existing person ID: {person_id}")

        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}PER",
            "person_object_id": person_id,
            "lpg_id": 22222,
            "blue_book": 222220,
            "is_kyc_done": True
        }

        self.print_request("POST", self.consumers_url, data)
        response = requests.post(self.consumers_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Consumer with person created"):
            self.test_consumer_id = response.json().get('id')
            self.test_person_id = person_id
            print(f"  {CYAN}[INFO]{RESET} Created consumer ID: {self.test_consumer_id}")

    def test_03_add_connection_to_consumer(self):
        """Test 1.3: Add connection to existing consumer"""
        self.print_test("Test 1.3: Add Connection to Consumer")

        if not self.test_consumer_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer available")
            return

        # Get existing product and connection type
        product_id, conn_type_id = self.get_existing_product_and_connection_type()
        if not product_id or not conn_type_id:
            print(f"  {YELLOW}[SKIP]{RESET} No existing product/connection_type found")
            return

        print(f"  {CYAN}[INFO]{RESET} Using product ID: {product_id}, connection_type ID: {conn_type_id}")

        data = {
            "consumer": self.test_consumer_id,
            "sv_number": f"SV-{TEST_DATA_PREFIX}-001",
            "sv_date": "2024-12-04",
            "connection_type": conn_type_id,
            "product": product_id,
            "num_of_regulators": 2
        }

        self.print_request("POST", self.connections_url, data)
        response = requests.post(self.connections_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Connection created"):
            conn_id = response.json().get('id')
            self.test_connection_ids.append(conn_id)
            print(f"  {CYAN}[INFO]{RESET} Created connection ID: {conn_id}")
            self.assert_field(response.json(), 'sv_number', f"SV-{TEST_DATA_PREFIX}-001")

    # ==================== SECTION 2: VALIDATION TESTS ====================

    def test_04_duplicate_consumer_number(self):
        """Test 2.1: Validation - Duplicate consumer number"""
        self.print_test("Test 2.1: Validation - Duplicate Consumer Number")

        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}PER",  # Already exists
            "lpg_id": 99999
        }

        self.print_request("POST", self.consumers_url, data)
        response = requests.post(self.consumers_url, json=data)
        self.print_response(response)

        self.assert_status(response, 400, "Duplicate rejected with 400")

    def test_05_consumer_number_too_long(self):
        """Test 2.2: Validation - Consumer number exceeds max length"""
        self.print_test("Test 2.2: Validation - Consumer Number Too Long")

        data = {
            "consumer_number": "1234567890",  # 10 chars, max is 9
            "lpg_id": 99999
        }

        self.print_request("POST", self.consumers_url, data)
        response = requests.post(self.consumers_url, json=data)
        self.print_response(response)

        self.assert_status(response, 400, "Too long rejected with 400")

    def test_06_invalid_data_type(self):
        """Test 2.3: Validation - Invalid data type (string for integer)"""
        self.print_test("Test 2.3: Validation - Invalid Data Type")

        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}INV",
            "lpg_id": "NOT_A_NUMBER"  # Should be integer
        }

        self.print_request("POST", self.consumers_url, data)
        response = requests.post(self.consumers_url, json=data)
        self.print_response(response)

        self.assert_status(response, 400, "Invalid type rejected with 400")

    def test_07_duplicate_sv_number_same_consumer(self):
        """Test 2.4: Validation - Duplicate SV number for same consumer"""
        self.print_test("Test 2.4: Validation - Duplicate SV Number")

        if not self.test_consumer_id or not self.test_connection_ids:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer/connection available")
            return

        product_id, conn_type_id = self.get_existing_product_and_connection_type()

        data = {
            "consumer": self.test_consumer_id,
            "sv_number": f"SV-{TEST_DATA_PREFIX}-001",  # Already exists
            "connection_type": conn_type_id,
            "product": product_id,
            "num_of_regulators": 1
        }

        self.print_request("POST", self.connections_url, data)
        response = requests.post(self.connections_url, json=data)
        self.print_response(response)

        self.assert_status(response, 400, "Duplicate SV rejected with 400")

    # ==================== SECTION 3: CONSUMER MODIFICATION TESTS ====================

    def test_08_update_consumer_basic_fields(self):
        """Test 3.1: Modify Consumer - Update basic fields"""
        self.print_test("Test 3.1: Modify Consumer - Update Basic Fields")

        if not self.test_consumer_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer available")
            return

        url = f"{self.consumers_url}{self.test_consumer_id}/"

        # Get current state
        print(f"  {CYAN}[BEFORE]{RESET}")
        before_response = requests.get(url)
        self.print_response(before_response)

        # Update
        data = {
            "lpg_id": 77777,
            "blue_book": 888888,
            "is_kyc_done": False
        }

        self.print_request("PATCH", url, data)
        response = requests.patch(url, json=data)

        print(f"  {CYAN}[AFTER]{RESET}")
        self.print_response(response)

        if self.assert_status(response, 200, "Consumer updated"):
            self.assert_field(response.json(), 'lpg_id', 77777)
            self.assert_field(response.json(), 'blue_book', 888888)
            self.assert_field(response.json(), 'is_kyc_done', False)

    def test_09_update_consumer_kyc_status(self):
        """Test 3.2: Modify Consumer - Toggle KYC status"""
        self.print_test("Test 3.2: Modify Consumer - Toggle KYC Status")

        if not self.test_consumer_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer available")
            return

        url = f"{self.consumers_url}{self.test_consumer_id}/"

        data = {"is_kyc_done": True}

        self.print_request("PATCH", url, data)
        response = requests.patch(url, json=data)
        self.print_response(response)

        if self.assert_status(response, 200, "KYC status updated"):
            self.assert_field(response.json(), 'is_kyc_done', True)

    # ==================== SECTION 4: PERSON MODIFICATION TESTS ====================

    def test_10_add_address_to_person(self):
        """Test 4.1: Modify Person - Add new address"""
        self.print_test("Test 4.1: Modify Person - Add New Address")

        if not self.test_person_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test person available")
            return

        addresses_url = f"{BASE_URL}/api/addresses/"

        data = {
            "object_id": self.test_person_id,
            "house_no": "999",
            "street_road_name": f"{TEST_DATA_PREFIX} Test Street",
            "city_town_village": "Test City",
            "pin_code": "500001",
            "address_text": f"999 {TEST_DATA_PREFIX} Test Street, Test City"
        }

        self.print_request("POST", addresses_url, data)
        response = requests.post(addresses_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Address added"):
            self.assert_field(response.json(), 'house_no', "999")

    def test_11_add_contact_to_person(self):
        """Test 4.2: Modify Person - Add new contact"""
        self.print_test("Test 4.2: Modify Person - Add New Contact")

        if not self.test_person_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test person available")
            return

        contacts_url = f"{BASE_URL}/api/contacts/"

        data = {
            "object_id": self.test_person_id,
            "mobile_number": "9999999999",
            "email": f"test{TEST_DATA_PREFIX}@example.com"
        }

        self.print_request("POST", contacts_url, data)
        response = requests.post(contacts_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Contact added"):
            self.assert_field(response.json(), 'mobile_number', "9999999999")

    def test_12_update_person_identification(self):
        """Test 4.3: Modify Person - Update identification"""
        self.print_test("Test 4.3: Modify Person - Update Identification")

        if not self.test_consumer_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer available")
            return

        # Get consumer detail to find identification
        consumer_url = f"{self.consumers_url}{self.test_consumer_id}/"
        consumer_response = requests.get(consumer_url)

        if consumer_response.status_code != 200:
            print(f"  {YELLOW}[SKIP]{RESET} Could not get consumer detail")
            return

        person = consumer_response.json().get('person', {})
        identification = person.get('identification')

        if not identification:
            print(f"  {YELLOW}[SKIP]{RESET} No identification found")
            return

        ident_id = identification.get('id')
        ident_url = f"{BASE_URL}/api/identifications/{ident_id}/"

        data = {
            "aadhar_num": "999988887777",
            "pan_num": "TESTPAN99X"
        }

        self.print_request("PATCH", ident_url, data)
        response = requests.patch(ident_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 200, "Identification updated"):
            self.assert_field(response.json(), 'aadhar_num', "999988887777")

    # ==================== SECTION 5: CONNECTION MODIFICATION TESTS ====================

    def test_13_update_connection_regulators(self):
        """Test 5.1: Modify Connection - Update number of regulators"""
        self.print_test("Test 5.1: Modify Connection - Update Regulators")

        if not self.test_connection_ids:
            print(f"  {YELLOW}[SKIP]{RESET} No test connection available")
            return

        conn_id = self.test_connection_ids[0]
        url = f"{self.connections_url}{conn_id}/"

        # Get current state
        print(f"  {CYAN}[BEFORE]{RESET}")
        before_response = requests.get(url)
        self.print_response(before_response)

        # Update
        data = {"num_of_regulators": 5}

        self.print_request("PATCH", url, data)
        response = requests.patch(url, json=data)

        print(f"  {CYAN}[AFTER]{RESET}")
        self.print_response(response)

        if self.assert_status(response, 200, "Connection updated"):
            self.assert_field(response.json(), 'num_of_regulators', 5)

    def test_14_add_second_connection(self):
        """Test 5.2: Modify Consumer - Add second connection"""
        self.print_test("Test 5.2: Modify Consumer - Add Second Connection")

        if not self.test_consumer_id:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumer available")
            return

        product_id, conn_type_id = self.get_existing_product_and_connection_type()
        if not product_id or not conn_type_id:
            print(f"  {YELLOW}[SKIP]{RESET} No existing product/connection_type found")
            return

        data = {
            "consumer": self.test_consumer_id,
            "sv_number": f"SV-{TEST_DATA_PREFIX}-002",
            "sv_date": "2024-12-05",
            "connection_type": conn_type_id,
            "product": product_id,
            "num_of_regulators": 3
        }

        self.print_request("POST", self.connections_url, data)
        response = requests.post(self.connections_url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201, "Second connection added"):
            conn_id = response.json().get('id')
            self.test_connection_ids.append(conn_id)
            print(f"  {CYAN}[INFO]{RESET} Total connections for consumer: {len(self.test_connection_ids)}")

    def test_15_delete_connection(self):
        """Test 5.3: Modify Consumer - Remove connection"""
        self.print_test("Test 5.3: Modify Consumer - Remove Connection")

        if len(self.test_connection_ids) < 2:
            print(f"  {YELLOW}[SKIP]{RESET} Need at least 2 connections")
            return

        # Delete the second connection
        conn_id = self.test_connection_ids[-1]
        url = f"{self.connections_url}{conn_id}/"

        self.print_request("DELETE", url)
        response = requests.delete(url)
        self.print_response(response)

        if self.assert_status(response, 204, "Connection deleted"):
            self.test_connection_ids.pop()
            print(f"  {CYAN}[INFO]{RESET} Remaining connections: {len(self.test_connection_ids)}")

    # ==================== CLEANUP ====================

    def cleanup(self):
        """Clean up test data"""
        if not CLEANUP_AFTER_TESTS:
            print(f"\n{YELLOW}[INFO]{RESET} Cleanup disabled. Test data preserved.")
            print(f"  Test consumer ID: {self.test_consumer_id}")
            print(f"  Test connection IDs: {self.test_connection_ids}")
            return

        self.print_header("CLEANUP: Removing Test Data", level=2)

        # Delete test connections
        for conn_id in self.test_connection_ids:
            url = f"{self.connections_url}{conn_id}/"
            response = requests.delete(url)
            if response.status_code == 204:
                print(f"  {GREEN}[OK]{RESET} Deleted connection ID: {conn_id}")

        # Note: Depending on your API, you might need to delete consumer as well
        # But based on previous info, DELETE might not be supported

        # Search for any test consumers with our prefix
        search_url = f"{self.consumers_url}?search={TEST_DATA_PREFIX}"
        response = requests.get(search_url)

        if response.status_code == 200:
            consumers = response.json().get('results', [])
            test_consumers = [c for c in consumers if c['consumer_number'].startswith(TEST_DATA_PREFIX)]
            print(f"\n{YELLOW}[INFO]{RESET} Found {len(test_consumers)} test consumers (manual cleanup may be needed):")
            for consumer in test_consumers:
                print(f"  - ID {consumer['id']}: {consumer['consumer_number']}")

    # ==================== RUN ALL TESTS ====================

    def run_all(self):
        """Run all comprehensive tests"""
        self.print_header("COMPREHENSIVE CONSUMER API TESTS")

        print(f"{BLUE}[INFO]{RESET} Testing endpoint: {self.consumers_url}")
        print(f"{BLUE}[INFO]{RESET} Make sure your Django server is running!\n")

        try:
            # Section 1: Creation Tests
            self.print_header("SECTION 1: CREATION TESTS", level=2)
            self.test_01_create_consumer_minimal()
            self.test_02_create_consumer_with_person()
            self.test_03_add_connection_to_consumer()

            # Section 2: Validation Tests
            self.print_header("SECTION 2: VALIDATION TESTS", level=2)
            self.test_04_duplicate_consumer_number()
            self.test_05_consumer_number_too_long()
            self.test_06_invalid_data_type()
            self.test_07_duplicate_sv_number_same_consumer()

            # Section 3: Consumer Modification Tests
            self.print_header("SECTION 3: CONSUMER MODIFICATION TESTS", level=2)
            self.test_08_update_consumer_basic_fields()
            self.test_09_update_consumer_kyc_status()

            # Section 4: Person Modification Tests
            self.print_header("SECTION 4: PERSON MODIFICATION TESTS", level=2)
            self.test_10_add_address_to_person()
            self.test_11_add_contact_to_person()
            self.test_12_update_person_identification()

            # Section 5: Connection Modification Tests
            self.print_header("SECTION 5: CONNECTION MODIFICATION TESTS", level=2)
            self.test_13_update_connection_regulators()
            self.test_14_add_second_connection()
            self.test_15_delete_connection()

        except requests.exceptions.ConnectionError:
            print(f"\n{RED}[ERROR]{RESET} Could not connect to server at {BASE_URL}")
            print(f"{YELLOW}[INFO]{RESET} Make sure Django server is running: python manage.py runserver")
            return
        except Exception as e:
            print(f"\n{RED}[ERROR]{RESET} Unexpected error: {e}")
            import traceback
            traceback.print_exc()

        # Cleanup
        self.cleanup()

        # Summary
        self.print_header("TEST SUMMARY")
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0

        print(f"{GREEN}Passed:{RESET} {self.passed}")
        print(f"{RED}Failed:{RESET} {self.failed}")
        print(f"Total: {total}")
        print(f"Pass Rate: {pass_rate:.1f}%\n")

        if self.failed == 0:
            print(f"{GREEN}{'=' * 80}")
            print(f"{'ALL TESTS PASSED!'.center(80)}")
            print(f"{'=' * 80}{RESET}\n")
        else:
            print(f"{YELLOW}{'=' * 80}")
            print(f"{'SOME TESTS FAILED OR SKIPPED'.center(80)}")
            print(f"{'=' * 80}{RESET}\n")


if __name__ == "__main__":
    tester = ComprehensiveConsumerTester()
    tester.run_all()
