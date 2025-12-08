"""
Configuration for live server tests
"""

# Base URL of your running server
BASE_URL = "http://localhost:8000"

# API base path
API_BASE = f"{BASE_URL}/api"

# Endpoints
CONSUMERS_URL = f"{API_BASE}/consumers/"
CONNECTIONS_URL = f"{API_BASE}/connections/"
PRODUCTS_URL = f"{API_BASE}/products/"

# Test data cleanup (set to False if you don't want to delete test data)
CLEANUP_AFTER_TESTS = False

# Test data prefix to identify test records (keep short - consumer_number max 9 chars)
TEST_DATA_PREFIX = "API"
