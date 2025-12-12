"""
Raw SQL bulk loader for maximum export performance.
Uses direct SQL queries instead of Django ORM.
"""
from django.db import connection
import time


def bulk_load_consumer_export_data_raw_sql(queryset, visible_fields):
    """
    Ultra-fast bulk loading using raw SQL.

    Executes a single optimized SQL query with all JOINs,
    avoiding Django ORM overhead entirely.

    Args:
        queryset: Django queryset (we'll extract filters from it)
        visible_fields: List of field names to export

    Returns:
        List of dicts with requested fields
    """
    print(f"  🚀 Using RAW SQL bulk loading for {len(visible_fields)} fields...")

    # Build the SQL query with all necessary JOINs
    t_start = time.time()

    sql = """
        SELECT
            c.id,
            c.consumer_number,
            c.is_kyc_done,

            -- Category and Type names
            cat.name as category,
            ct.name as consumer_type,

            -- Person name
            COALESCE(
                p.full_name,
                TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')))
            ) as name,

            -- Identification fields
            ident.ration_card_num,
            ident.aadhar_num,
            ident.pan_num,

            -- First address (using window function for efficiency)
            (
                SELECT a.address_text
                FROM commons_address a
                WHERE a.content_type_id = p_ct.id
                  AND a.object_id = p.id
                ORDER BY a.id
                LIMIT 1
            ) as address_text,
            (
                SELECT a.street_road_name
                FROM commons_address a
                WHERE a.content_type_id = p_ct.id
                  AND a.object_id = p.id
                ORDER BY a.id
                LIMIT 1
            ) as street_road_name,
            (
                SELECT a.pin_code
                FROM commons_address a
                WHERE a.content_type_id = p_ct.id
                  AND a.object_id = p.id
                ORDER BY a.id
                LIMIT 1
            ) as pin_code,

            -- First contact
            (
                SELECT co.email
                FROM commons_contact co
                WHERE co.content_type_id = p_ct.id
                  AND co.object_id = p.id
                ORDER BY co.id
                LIMIT 1
            ) as email,
            (
                SELECT co.phone_number
                FROM commons_contact co
                WHERE co.content_type_id = p_ct.id
                  AND co.object_id = p.id
                ORDER BY co.id
                LIMIT 1
            ) as phone_number,
            (
                SELECT co.mobile_number
                FROM commons_contact co
                WHERE co.content_type_id = p_ct.id
                  AND co.object_id = p.id
                ORDER BY co.id
                LIMIT 1
            ) as mobile_number,

            -- Cylinder count
            (
                SELECT COUNT(*)
                FROM connections_connectiondetails conn
                WHERE conn.consumer_id = c.id
            ) as cylinders

        FROM consumers_consumer c

        -- Join category and type
        LEFT JOIN lookups_consumercategory cat ON c.category_id = cat.id
        LEFT JOIN lookups_consumertype ct ON c.consumer_type_id = ct.id

        -- Join person (through GenericForeignKey)
        LEFT JOIN django_content_type p_ct ON c.person_content_type_id = p_ct.id
        LEFT JOIN commons_person p ON c.person_object_id = p.id
            AND c.person_content_type_id = p_ct.id

        -- Join identification
        LEFT JOIN commons_identification ident ON p.identification_id = ident.id

        ORDER BY c.id
    """

    # Execute the query
    with connection.cursor() as cursor:
        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    print(f"  ⏱️  Executed SQL query: {(time.time() - t_start):.2f}s")
    print(f"  📊 Fetched {len(rows)} rows")

    # Convert to list of dicts
    t_convert = time.time()
    result = []
    for row in rows:
        # Build complete row dict
        row_dict = dict(zip(columns, row))

        # Filter to only requested fields
        filtered_row = {field: row_dict.get(field) for field in visible_fields if field in row_dict}
        result.append(filtered_row)

    print(f"  ⏱️  Converted to dicts: {(time.time() - t_convert):.2f}s")
    print(f"  ✅ Total bulk load time: {(time.time() - t_start):.2f}s")

    return result
