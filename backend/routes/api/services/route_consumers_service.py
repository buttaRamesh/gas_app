from django.db.models import Prefetch
from consumers.models import Consumer
from delivery.models import DeliveryRouteAssignment


class RouteConsumersService:

    @staticmethod
    def _get_delivery_person_details(route):
        """Internal: Returns (name, mobile) of assigned delivery person."""
        assignment = getattr(route, "delivery_assignment", None)
        delivery_person = assignment.delivery_person if assignment else None

        if not delivery_person or not delivery_person.person:
            return None, None

        person = delivery_person.person
        name = delivery_person.name

        # Extract mobile (prefetched preferred)
        contacts = getattr(person, "prefetched_contacts", None)
        mobile = contacts[0].mobile_number if contacts else None

        return name, mobile

    @staticmethod
    def _get_consumers(route):
        """Internal: Returns optimized queryset of all consumers assigned to the route."""
        return (
            Consumer.objects
            .filter(route_assignment__route=route)
            .select_related("consumer_type", "person_content_type")
            .prefetch_related(
                Prefetch("person__addresses", to_attr="prefetched_addresses"),
                Prefetch("person__contacts", to_attr="prefetched_contacts"),
                Prefetch("connections", to_attr="prefetched_connections"),
            )
        )

    @staticmethod
    def get_route_consumers(route):
        """
        MAIN ENTRYPOINT
        Returns the fully assembled response payload.
        ViewSet calls only this function.
        """
        dp_name, dp_mobile = RouteConsumersService._get_delivery_person_details(route)
        consumers_qs = RouteConsumersService._get_consumers(route)

        return {
            "route_id": route.id,
            "route_name": f"{route.area_code}-{route.area_code_description}",
            "delivery_person_name": dp_name,
            "delivery_person_contact_num": dp_mobile,
            "consumers_count": consumers_qs.count(),
            "consumers": consumers_qs,
        }
