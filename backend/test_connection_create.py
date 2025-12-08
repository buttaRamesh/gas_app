"""
Test creating connections for consumers
Run with: python manage.py shell < test_connection_create.py
"""

from connections.models import ConnectionDetails
from consumers.models import Consumer
from inventory.models import Product
from lookups.models import ConnectionType
from datetime import date

print("="*80)
print("TEST: Creating Connection for Consumer TEST001")
print("="*80)

# Get the test consumer
try:
    consumer = Consumer.objects.get(consumer_number="TEST001")
    print(f"\n✅ Found Consumer: {consumer.consumer_number} (ID: {consumer.id})")
    print(f"   Name: {consumer.person.full_name if consumer.person else 'N/A'}")
except Consumer.DoesNotExist:
    print("\n❌ Consumer TEST001 not found!")
    exit(1)

# Get product and connection type
product = Product.objects.first()
connection_type = ConnectionType.objects.first()

print(f"\n📦 Using Product: {product.name} (ID: {product.id})")
print(f"🔗 Using Connection Type: {connection_type.name} (ID: {connection_type.id})")

# Create connection
print("\n📝 Creating connection...")
connection = ConnectionDetails.objects.create(
    consumer=consumer,
    sv_number="SV-TEST-001",
    sv_date=date(2024, 12, 4),
    connection_type=connection_type,
    product=product,
    num_of_regulators=2,
    hist_code_description="Test connection for TEST001 consumer"
)

print(f"\n✅ Connection Created Successfully!")
print(f"   ID: {connection.id}")
print(f"   SV Number: {connection.sv_number}")
print(f"   Product: {connection.product.name}")
print(f"   Connection Type: {connection.connection_type.name}")
print(f"   Consumer: {connection.consumer.consumer_number}")

# Try to create a duplicate SV number for the same consumer (should work now)
print("\n" + "="*80)
print("TEST: Creating Second Connection with Different SV Number")
print("="*80)

connection2 = ConnectionDetails.objects.create(
    consumer=consumer,
    sv_number="SV-TEST-002",
    sv_date=date(2024, 12, 5),
    connection_type=connection_type,
    product=product,
    num_of_regulators=1,
    hist_code_description="Second test connection"
)

print(f"\n✅ Second Connection Created!")
print(f"   ID: {connection2.id}")
print(f"   SV Number: {connection2.sv_number}")

# Try to create duplicate SV number for SAME consumer (should work - no unique constraint)
print("\n" + "="*80)
print("TEST: Creating Connection with Duplicate SV Number for Same Consumer")
print("="*80)

connection3 = ConnectionDetails.objects.create(
    consumer=consumer,
    sv_number="SV-TEST-001",  # Same as first connection
    sv_date=date(2024, 12, 6),
    connection_type=connection_type,
    product=product,
    num_of_regulators=3,
    hist_code_description="Duplicate SV test"
)

print(f"\n✅ Duplicate SV Connection Created! (Unique constraint removed)")
print(f"   ID: {connection3.id}")
print(f"   SV Number: {connection3.sv_number}")

# Get all connections for this consumer
print("\n" + "="*80)
print("All Connections for Consumer TEST001:")
print("="*80)

connections = ConnectionDetails.objects.filter(consumer=consumer)
for conn in connections:
    print(f"\n  Connection #{conn.id}")
    print(f"    SV Number: {conn.sv_number}")
    print(f"    Date: {conn.sv_date}")
    print(f"    Product: {conn.product.name}")
    print(f"    Regulators: {conn.num_of_regulators}")

print("\n" + "="*80)
print(f"Total Connections: {connections.count()}")
print("="*80)
