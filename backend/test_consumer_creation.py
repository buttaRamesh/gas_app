"""
Test script for Consumer Creation API
Run this after: python manage.py shell
"""

import json
import requests

BASE_URL = "http://127.0.0.1:8000/api/consumers/"

# Test 1: Create a simple consumer
print("=" * 80)
print("TEST 1: Create Simple Consumer")
print("=" * 80)

payload1 = {
    "consumer_number": "TEST001",
    "person": {
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe"
    }
}

print("\n📤 Request:")
print(json.dumps(payload1, indent=2))

try:
    response = requests.post(BASE_URL, json=payload1)
    print(f"\n📥 Response Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Create consumer with full details
print("\n\n" + "=" * 80)
print("TEST 2: Create Consumer with Full Details")
print("=" * 80)

payload2 = {
    "consumer_number": "TEST002",
    "lpg_id": 12345,
    "blue_book": 67890,
    "is_kyc_done": False,
    "person": {
        "first_name": "Jane",
        "last_name": "Smith",
        "full_name": "Jane Smith",
        "dob": "1990-05-15",
        "identification": {
            "ration_card_num": "RC123456",
            "aadhar_num": "123456789012"
        },
        "addresses": [
            {
                "house_no": "123",
                "street_road_name": "Main Street",
                "city_town_village": "Mumbai",
                "pin_code": "400001",
                "address_text": "123 Main Street, Mumbai"
            }
        ],
        "contacts": [
            {
                "mobile_number": "9876543210",
                "email": "jane.smith@example.com"
            }
        ]
    }
}

print("\n📤 Request:")
print(json.dumps(payload2, indent=2))

try:
    response = requests.post(BASE_URL, json=payload2)
    print(f"\n📥 Response Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Try to create duplicate consumer (should fail)
print("\n\n" + "=" * 80)
print("TEST 3: Create Duplicate Consumer (Should Fail)")
print("=" * 80)

payload3 = {
    "consumer_number": "TEST001",  # Duplicate
    "person": {
        "first_name": "Bob",
        "last_name": "Johnson",
        "full_name": "Bob Johnson"
    }
}

print("\n📤 Request:")
print(json.dumps(payload3, indent=2))

try:
    response = requests.post(BASE_URL, json=payload3)
    print(f"\n📥 Response Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("Tests Complete!")
print("=" * 80)
