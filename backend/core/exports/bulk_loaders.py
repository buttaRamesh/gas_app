"""
Bulk data loaders for fast exports.
Loads all related data in minimal queries, assembles in Python memory.
"""
from collections import defaultdict
from django.contrib.contenttypes.models import ContentType
from commons.models import Person, Address, Contact
from connections.models import ConnectionDetails


def bulk_load_consumer_export_data(queryset, visible_fields):
    """
    Uses already-prefetched queryset data to build export rows.
    No additional queries - just accesses prefetched data.

    Returns list of dicts with requested fields only.
    """
    import time

    print(f"  🔄 Processing {len(visible_fields)} fields from prefetched data...")

    # Evaluate queryset - triggers the prefetch queries
    from django.db import connection, reset_queries
    from django.conf import settings

    # Enable query logging temporarily
    old_debug = settings.DEBUG
    settings.DEBUG = True
    reset_queries()

    t1 = time.time()
    consumers = list(queryset)
    elapsed = time.time() - t1

    # Show query count
    query_count = len(connection.queries)
    print(f"  ⏱️  Evaluated queryset ({len(consumers)} consumers): {elapsed:.2f}s")
    print(f"  📊 Total queries executed: {query_count}")

    # Show slow queries (> 1 second)
    slow_queries = [q for q in connection.queries if float(q['time']) > 1.0]
    if slow_queries:
        print(f"  ⚠️  Found {len(slow_queries)} slow queries (>1s):")
        for i, q in enumerate(slow_queries[:3], 1):
            print(f"     {i}. {float(q['time']):.2f}s - {q['sql'][:100]}...")

    settings.DEBUG = old_debug

    if not consumers:
        return []

    # Manually fetch persons with identification AND prefetch addresses/contacts
    from django.db.models import Prefetch
    from django.contrib.contenttypes.models import ContentType

    t_person = time.time()
    person_ids = [c.person_object_id for c in consumers if c.person_object_id]
    person_map = {}
    if person_ids:
        person_ct = ContentType.objects.get_for_model(Person)

        persons = Person.objects.filter(
            id__in=person_ids
        ).select_related('identification').prefetch_related(
            Prefetch(
                'addresses',
                queryset=Address.objects.filter(
                    content_type=person_ct
                ).only(
                    'id', 'address_text', 'street_road_name', 'pin_code', 'object_id', 'content_type_id'
                ).order_by('object_id', 'id')
            ),
            Prefetch(
                'contacts',
                queryset=Contact.objects.filter(
                    content_type=person_ct
                ).only(
                    'id', 'email', 'phone_number', 'mobile_number', 'object_id', 'content_type_id'
                ).order_by('object_id', 'id')
            )
        ).only(
            'id', 'full_name', 'first_name', 'last_name', 'identification_id',
            'identification__ration_card_num',
            'identification__aadhar_num',
            'identification__pan_num',
        )
        person_map = {p.id: p for p in persons}
    print(f"  ⏱️  Loaded {len(person_map)} persons with related data: {(time.time() - t_person):.2f}s")

    # Assemble data using prefetched relationships
    t2 = time.time()
    result = []
    for consumer in consumers:
        # Get person from our map (not from consumer.person which isn't prefetchable)
        person = person_map.get(consumer.person_object_id)

        # Get first address and contact from prefetched data
        addresses = list(person.addresses.all()) if person else []
        contacts = list(person.contacts.all()) if person else []
        connections = list(consumer.connections.all())

        first_address = addresses[0] if addresses else None
        first_contact = contacts[0] if contacts else None

        # Build complete field map
        field_map = {
            'id': consumer.id,
            'consumer_number': consumer.consumer_number,
            'is_kyc_done': consumer.is_kyc_done,
            'category': consumer.category.name if consumer.category else None,
            'consumer_type': consumer.consumer_type.name if consumer.consumer_type else None,

            # Person fields
            'name': (person.full_name or f"{person.first_name or ''} {person.last_name or ''}".strip()) if person else None,

            # Identification (from prefetched person.identification)
            'ration_card_num': person.identification.ration_card_num if (person and person.identification) else None,
            'aadhar_num': person.identification.aadhar_num if (person and person.identification) else None,
            'pan_num': person.identification.pan_num if (person and person.identification) else None,

            # Address fields (from prefetched addresses)
            'address_text': first_address.address_text if first_address else None,
            'street_road_name': first_address.street_road_name if first_address else None,
            'pin_code': first_address.pin_code if first_address else None,

            # Contact fields (from prefetched contacts)
            'email': first_contact.email if first_contact else None,
            'phone_number': first_contact.phone_number if first_contact else None,
            'mobile_number': first_contact.mobile_number if first_contact else None,

            # Cylinder count (from prefetched connections)
            'cylinders': len(connections),
        }

        # Build row with only requested fields
        row = {field: field_map.get(field) for field in visible_fields if field in field_map}
        result.append(row)

    print(f"  ⏱️  Assembled {len(result)} rows: {(time.time() - t2):.2f}s")

    return result
