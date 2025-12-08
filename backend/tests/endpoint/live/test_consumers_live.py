"""
Live API tests for Consumer endpoints
Run these tests against a RUNNING server

Usage:
1. Start your Django server: python manage.py runserver
2. Run this script: python tests/endpoint/live/test_consumers_live.py
"""

import requests
import json
from config import CONSUMERS_URL, TEST_DATA_PREFIX, CLEANUP_AFTER_TESTS

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


class ConsumerAPITester:
    """Test Consumer API endpoints against live server"""

    def __init__(self):
        self.base_url = CONSUMERS_URL
        self.test_consumer_ids = []
        self.passed = 0
        self.failed = 0

    def print_header(self, text):
        """Print test section header"""
        print(f"\n{'=' * 80}")
        print(f"{text.center(80)}")
        print(f"{'=' * 80}\n")

    def print_test(self, test_name):
        """Print test name"""
        print(f"\n{BLUE}[TEST]{RESET} {test_name}")

    def print_request(self, method, url, data=None):
        """Print HTTP request details"""
        print(f"  {YELLOW}[REQUEST]{RESET} {method} {url}")
        if data:
            print(f"  {YELLOW}[DATA]{RESET} {json.dumps(data, indent=2)}")

    def print_response(self, response):
        """Print HTTP response"""
        status_color = GREEN if 200 <= response.status_code < 300 else RED
        print(f"  {status_color}[RESPONSE]{RESET} Status: {response.status_code}")
        try:
            print(f"  {YELLOW}[BODY]{RESET} {json.dumps(response.json(), indent=2)}")
        except:
            print(f"  {YELLOW}[BODY]{RESET} {response.text}")

    def assert_status(self, response, expected_status):
        """Assert response status code"""
        if response.status_code == expected_status:
            print(f"  {GREEN}[PASS]{RESET} Status code: {response.status_code} == {expected_status}")
            self.passed += 1
            return True
        else:
            print(f"  {RED}[FAIL]{RESET} Status code: {response.status_code} != {expected_status}")
            self.failed += 1
            return False

    def assert_in_response(self, response, key, value=None):
        """Assert key exists in response"""
        data = response.json()
        if key in data:
            if value is None or data[key] == value:
                print(f"  {GREEN}[PASS]{RESET} '{key}' found in response")
                self.passed += 1
                return True
        print(f"  {RED}[FAIL]{RESET} '{key}' not found or value mismatch")
        self.failed += 1
        return False

    # ==================== TESTS ====================

    def test_01_list_consumers(self):
        """Test 1: GET /api/consumers/ - List all consumers"""
        self.print_test("Test 1: List Consumers")

        url = self.base_url
        self.print_request("GET", url)

        response = requests.get(url)
        self.print_response(response)

        self.assert_status(response, 200)
        self.assert_in_response(response, "results")
        self.assert_in_response(response, "count")

    def test_02_create_consumer(self):
        """Test 2: POST /api/consumers/ - Create a consumer"""
        self.print_test("Test 2: Create Consumer")

        url = self.base_url

        # First, get a person to associate (or create one)
        # For simplicity, we'll create a minimal consumer
        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}001",
            "lpg_id": 99991,
            "blue_book": 999910,
            "is_kyc_done": False
        }

        self.print_request("POST", url, data)
        response = requests.post(url, json=data)
        self.print_response(response)

        if self.assert_status(response, 201):
            consumer_id = response.json().get('id')
            if consumer_id:
                self.test_consumer_ids.append(consumer_id)
                print(f"  {GREEN}[INFO]{RESET} Created consumer ID: {consumer_id}")

        self.assert_in_response(response, "consumer_number", f"{TEST_DATA_PREFIX}001")

    def test_03_retrieve_consumer(self):
        """Test 3: GET /api/consumers/{id}/ - Retrieve consumer detail"""
        self.print_test("Test 3: Retrieve Consumer")

        # Get first consumer from list
        list_response = requests.get(self.base_url)
        consumers = list_response.json().get('results', [])

        if not consumers:
            print(f"  {YELLOW}[SKIP]{RESET} No consumers found to retrieve")
            return

        consumer_id = consumers[0]['id']
        url = f"{self.base_url}{consumer_id}/"

        self.print_request("GET", url)
        response = requests.get(url)
        self.print_response(response)

        self.assert_status(response, 200)
        self.assert_in_response(response, "id", consumer_id)
        self.assert_in_response(response, "consumer_number")

    def test_04_search_consumers(self):
        """Test 4: GET /api/consumers/?search=xxx - Search consumers"""
        self.print_test("Test 4: Search Consumers")

        url = f"{self.base_url}?search={TEST_DATA_PREFIX}"

        self.print_request("GET", url)
        response = requests.get(url)
        self.print_response(response)

        self.assert_status(response, 200)
        self.assert_in_response(response, "results")

    def test_05_update_consumer(self):
        """Test 5: PATCH /api/consumers/{id}/ - Update consumer"""
        self.print_test("Test 5: Update Consumer (PATCH)")

        # Get a test consumer
        list_response = requests.get(f"{self.base_url}?search={TEST_DATA_PREFIX}")
        consumers = list_response.json().get('results', [])

        if not consumers:
            print(f"  {YELLOW}[SKIP]{RESET} No test consumers found to update")
            return

        consumer_id = consumers[0]['id']
        url = f"{self.base_url}{consumer_id}/"

        data = {
            "lpg_id": 88888,
            "is_kyc_done": True
        }

        self.print_request("PATCH", url, data)
        response = requests.patch(url, json=data)
        self.print_response(response)

        self.assert_status(response, 200)
        self.assert_in_response(response, "lpg_id", 88888)
        self.assert_in_response(response, "is_kyc_done", True)

    def test_06_pagination(self):
        """Test 6: GET /api/consumers/?page=1&page_size=5 - Test pagination"""
        self.print_test("Test 6: Pagination")

        url = f"{self.base_url}?page=1&page_size=5"

        self.print_request("GET", url)
        response = requests.get(url)
        self.print_response(response)

        self.assert_status(response, 200)
        self.assert_in_response(response, "page")
        self.assert_in_response(response, "page_size")
        self.assert_in_response(response, "count")

    def test_07_invalid_consumer(self):
        """Test 7: GET /api/consumers/99999/ - Non-existent consumer"""
        self.print_test("Test 7: Non-existent Consumer (404)")

        url = f"{self.base_url}99999/"

        self.print_request("GET", url)
        response = requests.get(url)
        self.print_response(response)

        self.assert_status(response, 404)

    def test_08_duplicate_consumer_number(self):
        """Test 8: POST /api/consumers/ - Duplicate consumer number"""
        self.print_test("Test 8: Duplicate Consumer Number (400)")

        url = self.base_url

        # Try to create consumer with existing number
        data = {
            "consumer_number": f"{TEST_DATA_PREFIX}001",  # Already exists from test 2
            "lpg_id": 99992,
            "is_kyc_done": False
        }

        self.print_request("POST", url, data)
        response = requests.post(url, json=data)
        self.print_response(response)

        self.assert_status(response, 400)

    # ==================== CLEANUP ====================

    def cleanup(self):
        """Clean up test data"""
        if not CLEANUP_AFTER_TESTS:
            print(f"\n{YELLOW}[INFO]{RESET} Cleanup disabled. Test data preserved.")
            return

        self.print_header("CLEANUP: Removing Test Data")

        # Search for test consumers
        search_url = f"{self.base_url}?search={TEST_DATA_PREFIX}"
        response = requests.get(search_url)

        if response.status_code == 200:
            consumers = response.json().get('results', [])
            print(f"{YELLOW}[INFO]{RESET} Found {len(consumers)} test consumers to clean up")

            # Note: DELETE might not be implemented, so we just report
            for consumer in consumers:
                print(f"  - Consumer ID {consumer['id']}: {consumer['consumer_number']}")
                # If DELETE was supported:
                # delete_url = f"{self.base_url}{consumer['id']}/"
                # requests.delete(delete_url)

    # ==================== RUN ALL TESTS ====================

    def run_all(self):
        """Run all tests"""
        self.print_header("CONSUMER API LIVE TESTS")

        print(f"{BLUE}[INFO]{RESET} Testing endpoint: {self.base_url}")
        print(f"{BLUE}[INFO]{RESET} Make sure your Django server is running!\n")

        # Run tests
        try:
            self.test_01_list_consumers()
            self.test_02_create_consumer()
            self.test_03_retrieve_consumer()
            self.test_04_search_consumers()
            self.test_05_update_consumer()
            self.test_06_pagination()
            self.test_07_invalid_consumer()
            self.test_08_duplicate_consumer_number()
        except requests.exceptions.ConnectionError:
            print(f"\n{RED}[ERROR]{RESET} Could not connect to server at {self.base_url}")
            print(f"{YELLOW}[INFO]{RESET} Make sure Django server is running: python manage.py runserver")
            return
        except Exception as e:
            print(f"\n{RED}[ERROR]{RESET} Unexpected error: {e}")

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
            print(f"{RED}{'=' * 80}")
            print(f"{'SOME TESTS FAILED'.center(80)}")
            print(f"{'=' * 80}{RESET}\n")


if __name__ == "__main__":
    tester = ConsumerAPITester()
    tester.run_all()
