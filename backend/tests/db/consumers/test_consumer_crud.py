"""
Comprehensive CRUD tests for Consumer model
Run with: python manage.py test tests.consumers.test_consumer_crud
"""
from django.contrib.contenttypes.models import ContentType
from commons.models import Person, Address, Contact, Identification, FamilyDetails
from consumers.models import Consumer
from connections.models import ConnectionDetails
from .base import ConsumerTestBase


class ConsumerCreateTests(ConsumerTestBase):
    """Test suite for creating consumers"""

    def test_01_create_simple_consumer(self):
        """Test 1.1: Create consumer with basic person data"""
        self.print_section("TEST 1.1: Create Simple Consumer")

        # Create person
        person = Person.objects.create(
            first_name="Simple",
            last_name="Test",
            full_name="Simple Test"
        )

        # Get content type
        person_ct = ContentType.objects.get_for_model(Person)

        # Create consumer
        consumer = Consumer.objects.create(
            person_content_type=person_ct,
            person_object_id=person.id,
            consumer_number="SIMPLE001",
            lpg_id=1001,
            blue_book=10010,
            is_kyc_done=False
        )

        self.print_success("Consumer created successfully")
        self.print_consumer_details(consumer)

        # Assertions
        self.assertEqual(consumer.consumer_number, "SIMPLE001")
        self.assertEqual(consumer.person.full_name, "Simple Test")
        self.assertFalse(consumer.is_kyc_done)

        self.print_success("All assertions passed")

    def test_02_create_consumer_with_full_details(self):
        """Test 1.2: Create consumer with complete person data"""
        self.print_section("TEST 1.2: Create Consumer with Full Details")

        # Create identification
        identification = Identification.objects.create(
            ration_card_num="RC123456",
            aadhar_num="123456789012",
            pan_num="ABCDE1234F"
        )
        self.print_success("Identification created")

        # Create family details
        family = FamilyDetails.objects.create(
            father_name="Test Father",
            mother_name="Test Mother",
            spouse_name="Test Spouse"
        )
        self.print_success("Family details created")

        # Create person
        person = Person.objects.create(
            first_name="Full",
            last_name="Details",
            full_name="Full Details",
            identification=identification,
            family_details=family
        )
        self.print_success("Person created")

        # Create address
        person_ct = ContentType.objects.get_for_model(Person)
        address = Address.objects.create(
            content_type=person_ct,
            object_id=person.id,
            house_no="456",
            street_road_name="Main Street",
            city_town_village="Mumbai",
            district="Mumbai",
            pin_code="400001",
            address_text="456 Main Street, Mumbai"
        )
        self.print_success("Address created")

        # Create contact
        contact = Contact.objects.create(
            content_type=person_ct,
            object_id=person.id,
            mobile_number="9876543210",
            phone_number="022-12345678",
            email="full.details@example.com"
        )
        self.print_success("Contact created")

        # Create consumer
        consumer = Consumer.objects.create(
            person_content_type=person_ct,
            person_object_id=person.id,
            consumer_number="FULL001",
            lpg_id=2001,
            blue_book=20010,
            is_kyc_done=True
        )
        self.print_success("Consumer created")

        self.print_subsection("Consumer Details")
        self.print_consumer_details(consumer)

        # Assertions
        self.assertEqual(consumer.person.identification.ration_card_num, "RC123456")
        self.assertEqual(consumer.person.family_details.father_name, "Test Father")
        self.assertEqual(consumer.person.addresses.count(), 1)
        self.assertEqual(consumer.person.contacts.count(), 1)
        self.assertTrue(consumer.is_kyc_done)

        self.print_success("All assertions passed")

    def test_03_create_consumer_with_connections(self):
        """Test 1.3: Create consumer with connections"""
        self.print_section("TEST 1.3: Create Consumer with Connections")

        # Create consumer
        consumer = self.create_test_consumer("CONN001", with_connections=False)
        self.print_success("Consumer created")

        # Create multiple connections
        if hasattr(self, 'product'):
            conn1 = ConnectionDetails.objects.create(
                consumer=consumer,
                sv_number="SV-CONN001-1",
                connection_type=self.connection_type,
                product=self.product,
                num_of_regulators=2
            )
            self.print_success("Connection 1 created")

            conn2 = ConnectionDetails.objects.create(
                consumer=consumer,
                sv_number="SV-CONN001-2",
                connection_type=self.connection_type,
                product=self.product,
                num_of_regulators=3
            )
            self.print_success("Connection 2 created")

            self.print_subsection("Consumer with Connections")
            self.print_consumer_details(consumer)

            connections = ConnectionDetails.objects.filter(consumer=consumer)
            self.print_info(f"Total Connections: {connections.count()}")

            for idx, conn in enumerate(connections, 1):
                print(f"\n  Connection {idx}:")
                self.print_connection_details(conn, indent=2)

            # Assertions
            self.assertEqual(connections.count(), 2)
            self.print_success("All assertions passed")
        else:
            self.print_info("Skipping connection tests (product not available)")


class ConsumerUpdateTests(ConsumerTestBase):
    """Test suite for updating consumers"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("UPDATE001", with_connections=True)

    def test_01_modify_consumer_basic_fields(self):
        """Test 2.1: Modify consumer basic fields"""
        self.print_section("TEST 2.1: Modify Consumer Basic Fields")

        self.print_subsection("BEFORE Update")
        self.print_data("LPG ID", self.consumer.lpg_id, indent=1)
        self.print_data("Blue Book", self.consumer.blue_book, indent=1)
        self.print_data("KYC Done", self.consumer.is_kyc_done, indent=1)

        # Modify consumer
        self.consumer.lpg_id = 99999
        self.consumer.blue_book = 88888
        self.consumer.is_kyc_done = True
        self.consumer.save()

        self.print_subsection("AFTER Update")
        self.print_data("LPG ID", self.consumer.lpg_id, indent=1)
        self.print_data("Blue Book", self.consumer.blue_book, indent=1)
        self.print_data("KYC Done", self.consumer.is_kyc_done, indent=1)

        # Refresh from DB
        self.consumer.refresh_from_db()

        # Assertions
        self.assertEqual(self.consumer.lpg_id, 99999)
        self.assertEqual(self.consumer.blue_book, 88888)
        self.assertTrue(self.consumer.is_kyc_done)

        self.print_success("All assertions passed")


class ConsumerAddressTests(ConsumerTestBase):
    """Test suite for consumer address operations"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("ADDR001")

    def test_01_add_new_address(self):
        """Test 2.2: Add new address to existing consumer"""
        self.print_section("TEST 2.2: Add New Address")

        person = self.consumer.person
        initial_count = person.addresses.count()
        self.print_info(f"Initial address count: {initial_count}")

        # Add new address
        person_ct = ContentType.objects.get_for_model(Person)
        new_address = Address.objects.create(
            content_type=person_ct,
            object_id=person.id,
            house_no="789",
            street_road_name="New Street",
            city_town_village="Delhi",
            pin_code="110001",
            address_text="789 New Street, Delhi"
        )

        new_count = person.addresses.count()
        self.print_success(f"New address added. Total addresses: {new_count}")

        # Print all addresses
        for idx, addr in enumerate(person.addresses.all(), 1):
            print(f"\n  Address {idx}:")
            self.print_data("House No", addr.house_no, indent=2)
            self.print_data("Street", addr.street_road_name, indent=2)
            self.print_data("City", addr.city_town_village, indent=2)

        # Assertions
        self.assertEqual(new_count, initial_count + 1)
        self.assertEqual(new_address.city_town_village, "Delhi")

        self.print_success("All assertions passed")

    def test_02_modify_existing_address(self):
        """Test 2.3: Modify existing address"""
        self.print_section("TEST 2.3: Modify Existing Address")

        person = self.consumer.person
        address = person.addresses.first()

        if address:
            self.print_subsection("BEFORE Update")
            self.print_data("House No", address.house_no, indent=1)
            self.print_data("City", address.city_town_village, indent=1)

            # Modify address
            address.house_no = "MODIFIED-123"
            address.city_town_village = "MODIFIED City"
            address.save()

            self.print_subsection("AFTER Update")
            self.print_data("House No", address.house_no, indent=1)
            self.print_data("City", address.city_town_village, indent=1)

            # Assertions
            address.refresh_from_db()
            self.assertEqual(address.house_no, "MODIFIED-123")
            self.assertEqual(address.city_town_village, "MODIFIED City")

            self.print_success("All assertions passed")
        else:
            self.print_info("No address found to modify")

    def test_03_delete_address(self):
        """Test 2.4: Delete existing address"""
        self.print_section("TEST 2.4: Delete Address")

        person = self.consumer.person
        initial_count = person.addresses.count()
        self.print_info(f"Initial address count: {initial_count}")

        address = person.addresses.first()
        if address:
            address_id = address.id
            address.delete()
            self.print_success(f"Address ID {address_id} deleted")

            new_count = person.addresses.count()
            self.print_info(f"Remaining addresses: {new_count}")

            # Assertions
            self.assertEqual(new_count, initial_count - 1)
            self.assertFalse(Address.objects.filter(id=address_id).exists())

            self.print_success("All assertions passed")
        else:
            self.print_info("No address found to delete")


class ConsumerContactTests(ConsumerTestBase):
    """Test suite for consumer contact operations"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("CONT001")

    def test_01_add_new_contact(self):
        """Test 2.5: Add new contact"""
        self.print_section("TEST 2.5: Add New Contact")

        person = self.consumer.person
        initial_count = person.contacts.count()
        self.print_info(f"Initial contact count: {initial_count}")

        # Add new contact
        person_ct = ContentType.objects.get_for_model(Person)
        new_contact = Contact.objects.create(
            content_type=person_ct,
            object_id=person.id,
            mobile_number="9999999999",
            email="new.contact@example.com"
        )

        new_count = person.contacts.count()
        self.print_success(f"New contact added. Total contacts: {new_count}")

        # Print all contacts
        for idx, cont in enumerate(person.contacts.all(), 1):
            print(f"\n  Contact {idx}:")
            self.print_data("Mobile", cont.mobile_number, indent=2)
            self.print_data("Email", cont.email, indent=2)

        # Assertions
        self.assertEqual(new_count, initial_count + 1)
        self.assertEqual(new_contact.mobile_number, "9999999999")

        self.print_success("All assertions passed")

    def test_02_modify_contact(self):
        """Test 2.6: Modify existing contact"""
        self.print_section("TEST 2.6: Modify Contact")

        person = self.consumer.person
        contact = person.contacts.first()

        if contact:
            self.print_subsection("BEFORE Update")
            self.print_data("Mobile", contact.mobile_number, indent=1)
            self.print_data("Email", contact.email, indent=1)

            # Modify contact
            contact.mobile_number = "1111111111"
            contact.email = "modified@example.com"
            contact.save()

            self.print_subsection("AFTER Update")
            self.print_data("Mobile", contact.mobile_number, indent=1)
            self.print_data("Email", contact.email, indent=1)

            # Assertions
            contact.refresh_from_db()
            self.assertEqual(contact.mobile_number, "1111111111")
            self.assertEqual(contact.email, "modified@example.com")

            self.print_success("All assertions passed")
        else:
            self.print_info("No contact found to modify")

    def test_03_delete_contact(self):
        """Test 2.7: Delete contact"""
        self.print_section("TEST 2.7: Delete Contact")

        person = self.consumer.person
        initial_count = person.contacts.count()
        self.print_info(f"Initial contact count: {initial_count}")

        contact = person.contacts.first()
        if contact:
            contact_id = contact.id
            contact.delete()
            self.print_success(f"Contact ID {contact_id} deleted")

            new_count = person.contacts.count()
            self.print_info(f"Remaining contacts: {new_count}")

            # Assertions
            self.assertEqual(new_count, initial_count - 1)
            self.assertFalse(Contact.objects.filter(id=contact_id).exists())

            self.print_success("All assertions passed")
        else:
            self.print_info("No contact found to delete")


class ConsumerIdentificationTests(ConsumerTestBase):
    """Test suite for consumer identification operations"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("IDENT001")

    def test_01_add_identification(self):
        """Test 2.8: Add identification to consumer without one"""
        self.print_section("TEST 2.8: Add Identification")

        person = self.consumer.person

        # Remove existing identification if any
        if person.identification:
            person.identification.delete()
            person.identification = None
            person.save()

        self.print_info("Initial: No identification")

        # Add new identification
        new_ident = Identification.objects.create(
            ration_card_num="NEW-RC123",
            aadhar_num="998877665544"  # 12 digits
        )

        person.identification = new_ident
        person.save()

        self.print_success("Identification added")
        self.print_data("Ration Card", new_ident.ration_card_num, indent=1)
        self.print_data("Aadhar", new_ident.aadhar_num, indent=1)

        # Assertions
        person.refresh_from_db()
        self.assertIsNotNone(person.identification)
        self.assertEqual(person.identification.ration_card_num, "NEW-RC123")

        self.print_success("All assertions passed")

    def test_02_modify_identification(self):
        """Test 2.9: Modify existing identification"""
        self.print_section("TEST 2.9: Modify Identification")

        person = self.consumer.person

        if person.identification:
            ident = person.identification

            self.print_subsection("BEFORE Update")
            self.print_data("Ration Card", ident.ration_card_num, indent=1)
            self.print_data("Aadhar", ident.aadhar_num, indent=1)

            # Modify identification
            ident.ration_card_num = "MODIFIED-RC456"
            ident.aadhar_num = "445566778899"  # 12 digits
            ident.pan_num = "NEWPAN123F"
            ident.save()

            self.print_subsection("AFTER Update")
            self.print_data("Ration Card", ident.ration_card_num, indent=1)
            self.print_data("Aadhar", ident.aadhar_num, indent=1)
            self.print_data("PAN", ident.pan_num, indent=1)

            # Assertions
            ident.refresh_from_db()
            self.assertEqual(ident.ration_card_num, "MODIFIED-RC456")
            self.assertEqual(ident.pan_num, "NEWPAN123F")

            self.print_success("All assertions passed")
        else:
            self.print_info("No identification found to modify")

    def test_03_remove_identification(self):
        """Test 2.10: Remove identification"""
        self.print_section("TEST 2.10: Remove Identification")

        person = self.consumer.person

        if person.identification:
            ident_id = person.identification.id
            self.print_info(f"Removing identification ID: {ident_id}")

            person.identification.delete()
            person.identification = None
            person.save()

            self.print_success("Identification removed")

            # Assertions
            person.refresh_from_db()
            self.assertIsNone(person.identification)
            self.assertFalse(Identification.objects.filter(id=ident_id).exists())

            self.print_success("All assertions passed")
        else:
            self.print_info("No identification found to remove")


class ConsumerFamilyDetailsTests(ConsumerTestBase):
    """Test suite for consumer family details operations"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("FAM001")

    def test_01_add_family_details(self):
        """Test 2.11: Add family details"""
        self.print_section("TEST 2.11: Add Family Details")

        person = self.consumer.person

        # Remove existing family details if any
        if person.family_details:
            person.family_details.delete()
            person.family_details = None
            person.save()

        self.print_info("Initial: No family details")

        # Add new family details
        new_family = FamilyDetails.objects.create(
            father_name="New Father",
            mother_name="New Mother",
            spouse_name="New Spouse"
        )

        person.family_details = new_family
        person.save()

        self.print_success("Family details added")
        self.print_data("Father", new_family.father_name, indent=1)
        self.print_data("Mother", new_family.mother_name, indent=1)
        self.print_data("Spouse", new_family.spouse_name, indent=1)

        # Assertions
        person.refresh_from_db()
        self.assertIsNotNone(person.family_details)
        self.assertEqual(person.family_details.father_name, "New Father")

        self.print_success("All assertions passed")

    def test_02_modify_family_details(self):
        """Test 2.12: Modify family details"""
        self.print_section("TEST 2.12: Modify Family Details")

        person = self.consumer.person

        if person.family_details:
            family = person.family_details

            self.print_subsection("BEFORE Update")
            self.print_data("Father", family.father_name, indent=1)
            self.print_data("Mother", family.mother_name, indent=1)

            # Modify family details
            family.father_name = "Modified Father"
            family.mother_name = "Modified Mother"
            family.save()

            self.print_subsection("AFTER Update")
            self.print_data("Father", family.father_name, indent=1)
            self.print_data("Mother", family.mother_name, indent=1)

            # Assertions
            family.refresh_from_db()
            self.assertEqual(family.father_name, "Modified Father")
            self.assertEqual(family.mother_name, "Modified Mother")

            self.print_success("All assertions passed")
        else:
            self.print_info("No family details found to modify")

    def test_03_remove_family_details(self):
        """Test 2.13: Remove family details"""
        self.print_section("TEST 2.13: Remove Family Details")

        person = self.consumer.person

        if person.family_details:
            family_id = person.family_details.id
            self.print_info(f"Removing family details ID: {family_id}")

            person.family_details.delete()
            person.family_details = None
            person.save()

            self.print_success("Family details removed")

            # Assertions
            person.refresh_from_db()
            self.assertIsNone(person.family_details)
            self.assertFalse(FamilyDetails.objects.filter(id=family_id).exists())

            self.print_success("All assertions passed")
        else:
            self.print_info("No family details found to remove")


class ConsumerConnectionTests(ConsumerTestBase):
    """Test suite for consumer connection operations"""

    def setUp(self):
        """Create test consumer before each test"""
        self.consumer = self.create_test_consumer("CONN001", with_connections=True)

    def test_01_add_new_connection(self):
        """Test 2.14: Add new connection to existing consumer"""
        self.print_section("TEST 2.14: Add New Connection")

        if not hasattr(self, 'product'):
            self.print_info("Skipping test (product not available)")
            return

        initial_count = ConnectionDetails.objects.filter(consumer=self.consumer).count()
        self.print_info(f"Initial connections: {initial_count}")

        # Add new connection
        new_conn = ConnectionDetails.objects.create(
            consumer=self.consumer,
            sv_number=f"SV-NEW-{self.consumer.consumer_number}",
            connection_type=self.connection_type,
            product=self.product,
            num_of_regulators=5
        )

        new_count = ConnectionDetails.objects.filter(consumer=self.consumer).count()
        self.print_success(f"New connection added. Total: {new_count}")

        # Print all connections
        for idx, conn in enumerate(ConnectionDetails.objects.filter(consumer=self.consumer), 1):
            print(f"\n  Connection {idx}:")
            self.print_connection_details(conn, indent=2)

        # Assertions
        self.assertEqual(new_count, initial_count + 1)
        self.assertEqual(new_conn.num_of_regulators, 5)

        self.print_success("All assertions passed")

    def test_02_modify_connection(self):
        """Test 2.15: Modify existing connection"""
        self.print_section("TEST 2.15: Modify Connection")

        connection = ConnectionDetails.objects.filter(consumer=self.consumer).first()

        if connection:
            self.print_subsection("BEFORE Update")
            self.print_data("SV Number", connection.sv_number, indent=1)
            self.print_data("Regulators", connection.num_of_regulators, indent=1)

            # Modify connection
            connection.num_of_regulators = 10
            connection.hist_code_description = "Modified connection"
            connection.save()

            self.print_subsection("AFTER Update")
            self.print_data("SV Number", connection.sv_number, indent=1)
            self.print_data("Regulators", connection.num_of_regulators, indent=1)
            self.print_data("Description", connection.hist_code_description, indent=1)

            # Assertions
            connection.refresh_from_db()
            self.assertEqual(connection.num_of_regulators, 10)

            self.print_success("All assertions passed")
        else:
            self.print_info("No connection found to modify")

    def test_03_delete_connection(self):
        """Test 2.16: Delete connection"""
        self.print_section("TEST 2.16: Delete Connection")

        initial_count = ConnectionDetails.objects.filter(consumer=self.consumer).count()
        self.print_info(f"Initial connections: {initial_count}")

        connection = ConnectionDetails.objects.filter(consumer=self.consumer).first()

        if connection:
            conn_id = connection.id
            sv_num = connection.sv_number
            connection.delete()

            self.print_success(f"Connection deleted (ID: {conn_id}, SV: {sv_num})")

            new_count = ConnectionDetails.objects.filter(consumer=self.consumer).count()
            self.print_info(f"Remaining connections: {new_count}")

            # Assertions
            self.assertEqual(new_count, initial_count - 1)
            self.assertFalse(ConnectionDetails.objects.filter(id=conn_id).exists())

            self.print_success("All assertions passed")
        else:
            self.print_info("No connection found to delete")


class ConsumerDeleteTests(ConsumerTestBase):
    """Test suite for deleting consumers"""

    def test_01_delete_consumer_without_connections(self):
        """Test 3.1: Delete consumer without connections"""
        self.print_section("TEST 3.1: Delete Consumer (No Connections)")

        consumer = self.create_test_consumer("DELETE001", with_connections=False)
        consumer_id = consumer.id
        consumer_number = consumer.consumer_number
        person_id = consumer.person.id if consumer.person else None

        self.print_info(f"Consumer ID: {consumer_id}")
        self.print_info(f"Consumer Number: {consumer_number}")
        self.print_info(f"Person ID: {person_id}")

        # Delete consumer
        consumer.delete()
        self.print_success(f"Consumer {consumer_number} deleted")

        # Assertions
        self.assertFalse(Consumer.objects.filter(id=consumer_id).exists())
        self.print_success("Consumer deleted from database")

        # Check if person still exists (it should, as it's not cascade)
        if person_id:
            person_exists = Person.objects.filter(id=person_id).exists()
            self.print_info(f"Person still exists: {person_exists}")

        self.print_success("All assertions passed")

    def test_02_delete_consumer_with_connections(self):
        """Test 3.2: Delete consumer with connections"""
        self.print_section("TEST 3.2: Delete Consumer (With Connections)")

        if not hasattr(self, 'product'):
            self.print_info("Skipping test (product not available)")
            return

        consumer = self.create_test_consumer("DELETE002", with_connections=True)
        consumer_id = consumer.id
        consumer_number = consumer.consumer_number

        # Count connections
        conn_count = ConnectionDetails.objects.filter(consumer=consumer).count()
        self.print_info(f"Consumer has {conn_count} connection(s)")

        # Delete consumer
        consumer.delete()
        self.print_success(f"Consumer {consumer_number} deleted")

        # Assertions
        self.assertFalse(Consumer.objects.filter(id=consumer_id).exists())
        self.print_success("Consumer deleted from database")

        # Check if connections were cascade deleted
        remaining_conns = ConnectionDetails.objects.filter(consumer_id=consumer_id).count()
        self.assertEqual(remaining_conns, 0)
        self.print_success("All connections cascade deleted")

        self.print_success("All assertions passed")

    def test_03_bulk_delete_consumers(self):
        """Test 3.3: Bulk delete multiple consumers"""
        self.print_section("TEST 3.3: Bulk Delete Consumers")

        # Create multiple consumers
        consumers = []
        for i in range(3):
            consumer = self.create_test_consumer(f"BULK{i:03d}")
            consumers.append(consumer)

        self.print_info(f"Created {len(consumers)} test consumers")

        # Bulk delete
        deleted_count, _ = Consumer.objects.filter(
            consumer_number__startswith="BULK"
        ).delete()

        self.print_success(f"Deleted {deleted_count} consumers")

        # Assertions
        remaining = Consumer.objects.filter(consumer_number__startswith="BULK").count()
        self.assertEqual(remaining, 0)

        self.print_success("All assertions passed")
