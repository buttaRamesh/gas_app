from django.contrib import admin
from .models import Address, Contact, FamilyDetails, Identification, Person


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'address_text', 'city_town_village', 'pin_code', 'content_type', 'object_id']
    list_filter = ['content_type', 'city_town_village', 'district']
    search_fields = ['address_text', 'city_town_village', 'pin_code', 'street_road_name']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['id', 'mobile_number', 'email', 'phone_number', 'content_type', 'object_id']
    list_filter = ['content_type']
    search_fields = ['mobile_number', 'email', 'phone_number']


@admin.register(FamilyDetails)
class FamilyDetailsAdmin(admin.ModelAdmin):
    list_display = ['id', 'father_name', 'mother_name', 'spouse_name']
    search_fields = ['father_name', 'mother_name', 'spouse_name']


@admin.register(Identification)
class IdentificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'ration_card_num', 'aadhar_num', 'pan_num', 'created_at']
    search_fields = ['ration_card_num', 'aadhar_num', 'pan_num']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'first_name', 'last_name', 'dob']
    list_filter = ['dob']
    search_fields = ['full_name', 'first_name', 'last_name']
    raw_id_fields = ['identification', 'family_details']
