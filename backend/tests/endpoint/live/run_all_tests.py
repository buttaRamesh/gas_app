"""
Run all live API tests
Usage: python run_all_tests.py
"""

import sys
from test_consumers_live import ConsumerAPITester


def main():
    print("\n" + "=" * 80)
    print("RUNNING ALL LIVE API TESTS".center(80))
    print("=" * 80 + "\n")

    print("Make sure your Django server is running on http://localhost:8000")
    print("Press Enter to continue or Ctrl+C to cancel...")
    try:
        input()
    except KeyboardInterrupt:
        print("\n\nTests cancelled.")
        sys.exit(0)

    # Run Consumer tests
    print("\n" + "🔹" * 40)
    print("CONSUMER API TESTS".center(80))
    print("🔹" * 40)
    consumer_tester = ConsumerAPITester()
    consumer_tester.run_all()

    # Add more test classes here as you create them
    # Example:
    # connection_tester = ConnectionAPITester()
    # connection_tester.run_all()

    print("\n" + "=" * 80)
    print("ALL LIVE TESTS COMPLETED".center(80))
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
