"""
Quick check: For consumers with more than 1 connection,
check if the product is the same across all connections
"""

from django.db.models import Count
from consumers.models import Consumer
from connections.models import ConnectionDetails

print("=" * 80)
print("CHECKING CONSUMERS WITH MULTIPLE CONNECTIONS")
print("=" * 80)

# Get consumers with more than 1 connection
consumers_with_multiple = (
    Consumer.objects
    .annotate(connection_count=Count('connections'))
    .filter(connection_count__gt=1)
    .order_by('-connection_count')
)

total_consumers = consumers_with_multiple.count()
print(f"\nTotal consumers with multiple connections: {total_consumers}")

if total_consumers == 0:
    print("\nNo consumers found with multiple connections.")
    exit()

# Analyze product consistency
same_product_count = 0
different_product_count = 0
consumers_with_different_products = []

print("\nAnalyzing product consistency...\n")

for consumer in consumers_with_multiple[:100]:  # Check first 100
    connections = ConnectionDetails.objects.filter(consumer=consumer)
    products = set([conn.product_id for conn in connections if conn.product_id])

    connection_count = connections.count()

    if len(products) == 1:
        same_product_count += 1
    else:
        different_product_count += 1
        consumers_with_different_products.append({
            'consumer_number': consumer.consumer_number,
            'consumer_id': consumer.id,
            'connection_count': connection_count,
            'different_products': len(products),
            'products': products
        })

print(f"Consumers with SAME product across all connections: {same_product_count}")
print(f"Consumers with DIFFERENT products: {different_product_count}")

# Show examples of consumers with different products
if consumers_with_different_products:
    print("\n" + "=" * 80)
    print("EXAMPLES: Consumers with Different Products")
    print("=" * 80)

    for i, consumer_info in enumerate(consumers_with_different_products[:10], 1):
        print(f"\n{i}. Consumer: {consumer_info['consumer_number']} (ID: {consumer_info['consumer_id']})")
        print(f"   Connections: {consumer_info['connection_count']}")
        print(f"   Different products: {consumer_info['different_products']}")
        print(f"   Product IDs: {consumer_info['products']}")

        # Show connection details
        consumer = Consumer.objects.get(id=consumer_info['consumer_id'])
        connections = ConnectionDetails.objects.filter(consumer=consumer)

        for j, conn in enumerate(connections, 1):
            product_name = conn.product.name if conn.product else "N/A"
            print(f"     Connection {j}: SV={conn.sv_number}, Product={product_name} (ID: {conn.product_id})")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
percentage_same = (same_product_count / total_consumers * 100) if total_consumers > 0 else 0
print(f"Percentage with SAME product: {percentage_same:.1f}%")
print(f"Percentage with DIFFERENT products: {100 - percentage_same:.1f}%")

if different_product_count > 0:
    print(f"\n⚠️  WARNING: {different_product_count} consumers have different products across connections!")
    print("This means consumers can have connections with different product types.")
else:
    print(f"\n✅ All consumers have the SAME product across all connections.")
