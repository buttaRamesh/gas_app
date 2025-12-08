# Quick Start Guide - Live API Tests

## How to Run

### Step 1: Start Django Server
```bash
cd backend
python manage.py runserver
```
Leave this running!

### Step 2: Run Tests (New Terminal)
```bash
cd backend\tests\endpoint\live

# Basic tests (8 tests)
python test_consumers_live.py

# Comprehensive tests (15 tests)
python test_consumers_comprehensive.py
```

## Test Coverage

### Basic Tests (test_consumers_live.py)
- ✅ List, Create, Retrieve, Search, Update, Pagination
- ✅ Error handling (404, 400)

### Comprehensive Tests (test_consumers_comprehensive.py)

#### 📋 Section 1: Creation (3 tests)
```
✓ Create consumer with minimal data
✓ Create consumer with person
✓ Add connection to consumer
```

#### ⚠️ Section 2: Validation (4 tests)
```
✓ Duplicate consumer number → 400
✓ Consumer number too long (>9 chars) → 400
✓ Invalid data type (string for integer) → 400
✓ Duplicate SV number for same consumer → 400
```

#### ✏️ Section 3: Consumer Modification (2 tests)
```
✓ Update basic fields (lpg_id, blue_book)
✓ Toggle KYC status
```

#### 👤 Section 4: Person Modification (3 tests)
```
✓ Add new address
✓ Add new contact
✓ Update identification (aadhar, PAN)
```

#### 🔗 Section 5: Connection Modification (3 tests)
```
✓ Update regulators count
✓ Add second connection
✓ Remove connection
```

## Test Features

### ✨ Colored Output
- 🟢 **GREEN** = Test passed
- 🔴 **RED** = Test failed
- 🟡 **YELLOW** = Warning/Skip/Info
- 🔵 **BLUE** = Section header
- 🔷 **CYAN** = Data/Request details

### 📊 Test Summary
After all tests run, you'll see:
```
TEST SUMMARY
Passed: 15
Failed: 0
Total: 15
Pass Rate: 100.0%
```

### 🔍 Detailed Logging
Each test shows:
```
[TEST] Test name
  [REQUEST] POST /api/consumers/
  [DATA] { ... }
  [RESPONSE] Status: 201
  [BODY] { ... }
  [PASS] Field verification
```

## Configuration

Edit `config.py`:
```python
BASE_URL = "http://localhost:8000"
TEST_DATA_PREFIX = "API"          # Short prefix (consumer_number max 9 chars)
CLEANUP_AFTER_TESTS = False       # Set True to auto-delete test data
```

## Test Data

All test data uses prefix: **"API"** (configurable)

Examples:
- Consumer: `APIMIN`, `APIPER`
- SV Numbers: `SV-API-001`, `SV-API-002`

To clean up manually:
```bash
# Search for test consumers
curl http://localhost:8000/api/consumers/?search=API
```

## Troubleshooting

### "Could not connect to server"
→ Make sure Django server is running: `python manage.py runserver`

### Tests skipped
→ Some tests need existing data (person, product, connection_type)
→ Run basic creation tests first to set up test data

### "Field has no more than 9 characters"
→ Consumer number max length is 9
→ Use short prefix in config.py (default: "API")

## Next Steps

1. ✅ Run basic tests to verify API works
2. ✅ Run comprehensive tests for full coverage
3. ✅ Check test summary for pass/fail counts
4. ✅ Review logs for any issues
5. ✅ Clean up test data (manual or auto)

## Examples

### Running specific sections
The tests run in order, creating data for later tests:
1. Creation → Sets up consumer/person/connection
2. Validation → Tests error cases
3. Modifications → Updates existing data

### Expected Results
- **Basic tests**: 8/8 pass
- **Comprehensive**: 15 tests (some may skip if dependencies missing)

All tests designed to work with **LIVE database** - no test database created! 🚀
