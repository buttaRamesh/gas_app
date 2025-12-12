"""
Debug script to check query count during export
Run this to diagnose the performance issue
"""
from django.conf import settings
from django.db import connection, reset_queries
from django.test.utils import override_settings

@override_settings(DEBUG=True)
def test_export_queries():
    from core.exports.resources import get_consumer_export_queryset
    from core.exports.serializers import ConsumerExportSerializer

    # Reset query counter
    reset_queries()

    # Get queryset
    queryset = get_consumer_export_queryset(None)

    # Limit to first 10 for testing
    queryset = queryset[:10]

    print(f"Queries after building queryset: {len(connection.queries)}")

    # Serialize
    serializer = ConsumerExportSerializer(queryset, many=True)

    print(f"Queries after creating serializer: {len(connection.queries)}")

    # Access data (this is where queries happen)
    data = serializer.data

    print(f"\n=== TOTAL QUERIES: {len(connection.queries)} ===")
    print(f"For 10 consumers, we ran {len(connection.queries)} queries")
    print(f"Expected: ~5-6 queries (1 main + 4 prefetches)")

    if len(connection.queries) > 10:
        print("\n⚠️  TOO MANY QUERIES! N+1 problem still exists")
        print("\nFirst 20 queries:")
        for i, query in enumerate(connection.queries[:20], 1):
            print(f"\n{i}. {query['sql'][:200]}...")
    else:
        print("\n✅ Query count looks good!")
        print("\nAll queries:")
        for i, query in enumerate(connection.queries, 1):
            print(f"\n{i}. {query['sql'][:200]}...")

if __name__ == '__main__':
    import django
    django.setup()
    test_export_queries()
