# Live API Endpoint Tests

These tests run against a **RUNNING Django server** (not a test database).

## Quick Start

1. **Start your Django development server:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **In another terminal, run the tests:**
   ```bash
   cd backend/tests/endpoint/live

   # Basic API tests
   python test_consumers_live.py

   # Comprehensive tests (Creation + Validation + Modifications)
   python test_consumers_comprehensive.py
   ```

## Configuration

Edit `config.py` to change:
- `BASE_URL` - Your server URL (default: http://localhost:8000)
- `CLEANUP_AFTER_TESTS` - Set to True to delete test data after tests
- `TEST_DATA_PREFIX` - Prefix for test data (default: "APITEST")

## Test Scripts

### 1. Basic Consumer API Tests
**File:** `test_consumers_live.py`

**Tests (8 tests):**
1. ✓ List consumers (GET /api/consumers/)
2. ✓ Create consumer (POST /api/consumers/)
3. ✓ Retrieve consumer detail (GET /api/consumers/{id}/)
4. ✓ Search consumers (GET /api/consumers/?search=xxx)
5. ✓ Update consumer (PATCH /api/consumers/{id}/)
6. ✓ Pagination (GET /api/consumers/?page=1&page_size=5)
7. ✓ Non-existent consumer returns 404
8. ✓ Duplicate consumer number returns 400

**Run:**
```bash
python test_consumers_live.py
```

### 2. Comprehensive Consumer Tests
**File:** `test_consumers_comprehensive.py`

**Tests (15 tests organized in 5 sections):**

**Section 1: Creation Tests (3 tests)**
1. ✓ Create consumer with minimal data
2. ✓ Create consumer with associated person
3. ✓ Add connection to consumer

**Section 2: Validation Tests (4 tests)**
4. ✓ Duplicate consumer number validation
5. ✓ Consumer number length validation
6. ✓ Invalid data type validation
7. ✓ Duplicate SV number validation

**Section 3: Consumer Modification (2 tests)**
8. ✓ Update consumer basic fields (lpg_id, blue_book)
9. ✓ Toggle KYC status

**Section 4: Person Modification (3 tests)**
10. ✓ Add new address to person
11. ✓ Add new contact to person
12. ✓ Update identification details

**Section 5: Connection Modification (3 tests)**
13. ✓ Update number of regulators
14. ✓ Add second connection
15. ✓ Remove connection

**Run:**
```bash
python test_consumers_comprehensive.py
```

## Important Notes

⚠️ **These tests run on your REAL database!**
- Test data is created with prefix "APITEST" by default
- Set `CLEANUP_AFTER_TESTS = True` to auto-delete test data
- Or manually delete test consumers with consumer_number starting with "APITEST"

## Advantages of Live Tests

1. ✓ Test against real database with all lookups
2. ✓ Test middleware and authentication
3. ✓ Test actual request/response cycle
4. ✓ No need to create test database
5. ✓ Can debug with real server running

## Creating More Live Tests

To create tests for other endpoints, copy `test_consumers_live.py` and modify:

```python
from config import BASE_URL

class MyAPITester:
    def __init__(self):
        self.base_url = f"{BASE_URL}/api/myendpoint/"
        # ... rest of setup

    def test_something(self):
        url = self.base_url
        response = requests.get(url)
        # ... assertions

if __name__ == "__main__":
    tester = MyAPITester()
    tester.run_all()
```
