import { useLocation } from "react-router-dom";
import ConsumerSelector from "@/pages/shared/ConsumerSelector";

/**
 * Route Consumers Page
 *
 * Single route that handles both scenarios:
 * 1. /routes/consumers - No route pre-selected (user selects from dropdown)
 * 2. /routes/consumers (with state: { routeId: 3 }) - Route pre-selected via navigation state
 */
export default function RouteConsumersNew() {
  const location = useLocation();
  const routeId = location.state?.routeId;

  return <ConsumerSelector entityType="route" preSelectedId={routeId} />;
}
