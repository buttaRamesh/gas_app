"""
Simple check for product consistency in multi-connection consumers
"""
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from django.db.models import Count
from consumers.models import Consumer
from connections.models import ConnectionDetails

print("=" * 80)
print("CHECKING PRODUCT CONSISTENCY")
print("=" * 80)

# Get consumers with multiple connections
consumers_multi = Consumer.objects.annotate(
    conn_count=Count('connections')
).filter(conn_count__gt=1)[:50]  # Check first 50

print(f"\nAnalyzing {consumers_multi.count()} consumers with multiple connections...\n")

same_product = 0
diff_product = 0
examples = []

for consumer in consumers_multi:
    connections = list(ConnectionDetails.objects.filter(consumer=consumer).select_related('product'))

    if not connections:
        continue

    # Get unique product IDs
    product_ids = set([c.product_id for c in connections if c.product_id])

    if len(product_ids) <= 1:
        same_product += 1
    else:
        diff_product += 1
        if len(examples) < 5:  # Keep first 5 examples
            examples.append({
                'number': consumer.consumer_number,
                'id': consumer.id,
                'products': list(product_ids),
                'connections': [(c.sv_number, c.product.name if c.product else 'N/A') for c in connections]
            })

print(f"Same product across all connections: {same_product}")
print(f"Different products: {diff_product}")

if examples:
    print("\n" + "=" * 80)
    print("EXAMPLES OF CONSUMERS WITH DIFFERENT PRODUCTS:")
    print("=" * 80)
    for ex in examples:
        print(f"\nConsumer: {ex['number']} (ID: {ex['id']})")
        print(f"Product IDs: {ex['products']}")
        for i, (sv, prod) in enumerate(ex['connections'], 1):
            print(f"  Conn {i}: SV={sv}, Product={prod}")

print("\n" + "=" * 80)
total = same_product + diff_product
if total > 0:
    print(f"Result: {(same_product/total*100):.1f}% have SAME product")
    print(f"        {(diff_product/total*100):.1f}% have DIFFERENT products")
print("=" * 80)
