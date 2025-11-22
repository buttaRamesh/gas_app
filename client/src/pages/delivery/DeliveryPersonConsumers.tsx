import { useLocation } from "react-router-dom";
import ConsumerSelector from "@/pages/shared/ConsumerSelector";

/**
 * Delivery Person Consumers Page
 *
 * Single route that handles both scenarios:
 * 1. /delivery-persons/consumers - No delivery person pre-selected (user selects from dropdown)
 * 2. /delivery-persons/consumers (with state: { personId: 3 }) - Delivery person pre-selected via navigation state
 */
export default function DeliveryPersonConsumersNew() {
  const location = useLocation();
  const personId = location.state?.personId;

  return <ConsumerSelector entityType="delivery_person" preSelectedId={personId} />;
}
