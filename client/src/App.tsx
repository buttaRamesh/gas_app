import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import ServerError from "./pages/ServerError";
import LayoutDemo from "./pages/LayoutDemo";
import Settings from "./pages/Settings";
import SidebarDemo from "./pages/SidebarDemo";

// Route pages
import RoutesPage from "./pages/route/Routes";
import RouteDetail from "./pages/route/RouteDetail";
import RouteEdit from "./pages/route/RouteEdit";
import RouteCreate from "./pages/route/RouteCreate";
import RouteAreas from "./pages/route/RouteAreas";
import RouteAreaCreate from "./pages/route/RouteAreaCreate";
import RouteStatistics from "./pages/route/RouteStatistics";
import RouteHistory from "./pages/route/RouteHistory";
import RouteCardColorDemo from "./pages/route/RouteCardColorDemo";
import RouteConsumers from "./pages/route/RouteConsumers";

// Delivery Person pages
import DeliveryPersons from "./pages/delivery/DeliveryPersons";
import DeliveryPersonCreate from "./pages/delivery/DeliveryPersonCreate";
import DeliveryPersonConsumers from "./pages/delivery/DeliveryPersonConsumers";
import DeliveryPersonStatistics from "./pages/delivery/DeliveryPersonStatistics";
import DeliveryPersonDetail from "./pages/delivery/DeliveryPersonDetail";

// Product pages
import Products from "./pages/product/Products";
import ProductCreate from "./pages/product/ProductCreate";
import ProductDetail from "./pages/product/ProductDetail";
import ProductStatistics from "./pages/product/ProductStatistics";
import Units from "./pages/product/Units";
import UnitCreate from "./pages/product/UnitCreate";
import VariantCreate from "./pages/product/VariantCreate";

// Consumer pages
import Consumers from "./pages/consumer/Consumers";
import ConsumerDetail from "./pages/consumer/ConsumerDetail";
import ConsumerStatistics from "./pages/consumer/ConsumerStatistics";
import ConsumerKycPendingNew from "./pages/consumer/ConsumerKycPendingNew";
import ConsumerNewActivation from "./pages/consumer/ConsumerNewActivation";
import ConsumerCreate from "./pages/consumer/ConsumerCreate";
import ConsumerEdit from "./pages/consumer/ConsumerEdit";

// OrderBook pages
import OrderBook from "./pages/orderbook/OrderBook";
import BulkUpload from "./pages/orderbook/BulkUpload";
import ColumnMappings from "./pages/orderbook/ColumnMappings";
import FieldSettings from "./pages/orderbook/FieldSettings";
import BulkUploadHistory from "./pages/orderbook/BulkUploadHistory";
// Lookup pages
import ConsumerCategories from "./pages/lookup/ConsumerCategories";
import ConsumerTypes from "./pages/lookup/ConsumerTypes";
import BPLTypes from "./pages/lookup/BPLTypes";
import DCTTypes from "./pages/lookup/DCTTypes";
import Schemes from "./pages/lookup/Schemes";
import MarketTypes from "./pages/lookup/MarketTypes";
import ConnectionTypes from "./pages/lookup/ConnectionTypes";
import SubsidyDetails from "./pages/lookup/SubsidyDetails";
import LogDashboard from "./pages/logs_request/LogDashboard";
// User Management pages
import UserManagementPage from "./pages/user/UserManagementPage";

// Role Management pages
import RoleManagementPage from "./pages/user/RoleManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Landing page - public facing */}
            <Route path="/" element={<Landing />} />

            {/* Main dashboard - full screen without sidebar */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Full-screen demo pages */}
            <Route path="/demo" element={<LayoutDemo />} />
            <Route path="/sidebar-demo" element={<SidebarDemo />} />
            
            {/* Pages with sidebar layout */}
            <Route path="/routes" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RoutesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/statistics" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RouteStatistics /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/history" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RouteHistory /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/color-demo" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RouteCardColorDemo /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/consumers" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RouteConsumers /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/new" element={<ProtectedRoute requiredPermission="routes.create"><AppLayout><RouteCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/:id" element={<ProtectedRoute requiredPermission="routes.view"><AppLayout><RouteDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/routes/:id/edit" element={<ProtectedRoute requiredPermission="routes.edit"><AppLayout><RouteEdit /></AppLayout></ProtectedRoute>} />
            <Route path="/route-areas" element={<ProtectedRoute requiredPermission="route_areas.view"><AppLayout><RouteAreas /></AppLayout></ProtectedRoute>} />
            <Route path="/route-areas/new" element={<ProtectedRoute requiredPermission="route_areas.create"><AppLayout><RouteAreaCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/delivery-persons" element={<ProtectedRoute requiredPermission="delivery_persons.view"><AppLayout><DeliveryPersons /></AppLayout></ProtectedRoute>} />
            <Route path="/delivery-persons/create" element={<ProtectedRoute requiredPermission="delivery_persons.create"><AppLayout><DeliveryPersonCreate /></AppLayout></ProtectedRoute>} />

            <Route path="/delivery-persons/statistics" element={<ProtectedRoute requiredPermission="delivery_persons.view"><AppLayout><DeliveryPersonStatistics /></AppLayout></ProtectedRoute>} />
            <Route path="/delivery-persons/consumers" element={<ProtectedRoute requiredPermission="delivery_persons.view"><AppLayout><DeliveryPersonConsumers /></AppLayout></ProtectedRoute>} />
            <Route path="/delivery-persons/:id" element={<ProtectedRoute requiredPermission="delivery_persons.view"><AppLayout><DeliveryPersonDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute requiredPermission="products.view"><AppLayout><Products /></AppLayout></ProtectedRoute>} />
            <Route path="/products/create" element={<ProtectedRoute requiredPermission="products.create"><AppLayout><ProductCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/products/statistics" element={<ProtectedRoute requiredPermission="products.view"><AppLayout><ProductStatistics /></AppLayout></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute requiredPermission="products.view"><AppLayout><ProductDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/units" element={<ProtectedRoute requiredPermission="units.view"><AppLayout><Units /></AppLayout></ProtectedRoute>} />
            <Route path="/units/create" element={<ProtectedRoute requiredPermission="units.create"><AppLayout><UnitCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/variants/create" element={<ProtectedRoute requiredPermission="variants.create"><AppLayout><VariantCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers" element={<ProtectedRoute requiredPermission="consumers.view"><AppLayout><Consumers /></AppLayout></ProtectedRoute>} />

            <Route path="/consumers/create" element={<ProtectedRoute requiredPermission="consumers.create"><AppLayout><ConsumerCreate /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers/new-activation" element={<ProtectedRoute requiredPermission="consumers.create"><AppLayout><ConsumerNewActivation /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers/kyc-pending" element={<ProtectedRoute requiredPermission="consumers.view"><AppLayout><ConsumerKycPendingNew /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers/statistics" element={<ProtectedRoute requiredPermission="consumers.view"><AppLayout><ConsumerStatistics /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers/:id" element={<ProtectedRoute requiredPermission="consumers.view"><AppLayout><ConsumerDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/consumers/:id/edit" element={<ProtectedRoute requiredPermission="consumers.edit"><AppLayout><ConsumerEdit /></AppLayout></ProtectedRoute>} />

            {/* OrderBook routes */}
            <Route path="/orderbook/upload" element={<ProtectedRoute><AppLayout><BulkUpload /></AppLayout></ProtectedRoute>} />
            <Route path="/orderbook/mappings" element={<ProtectedRoute><AppLayout><ColumnMappings /></AppLayout></ProtectedRoute>} />
            <Route path="/orderbook/settings" element={<ProtectedRoute><AppLayout><FieldSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/orderbook/upload-history" element={<ProtectedRoute><AppLayout><BulkUploadHistory /></AppLayout></ProtectedRoute>} />
            <Route path="/orderbook" element={<ProtectedRoute><AppLayout><OrderBook /></AppLayout></ProtectedRoute>} />

            {/* Lookup tables - Requires lookups.view permission */}
            <Route path="/lookups/consumer-categories" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><ConsumerCategories /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/consumer-types" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><ConsumerTypes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/bpl-types" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><BPLTypes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/dct-types" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><DCTTypes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/schemes" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><Schemes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/market-types" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><MarketTypes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/connection-types" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><ConnectionTypes /></AppLayout></ProtectedRoute>} />
            <Route path="/lookups/subsidy-details" element={<ProtectedRoute requiredPermission="lookups.view"><AppLayout><SubsidyDetails /></AppLayout></ProtectedRoute>} />

            {/* Settings - All authenticated users can access */}
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

            {/* Logs - Admin and Manager only */}
            <Route path="/logs/requests" element={<ProtectedRoute requiredPermission="logs.view"><LogDashboard /></ProtectedRoute>} />

            {/* User Management - Requires users permissions */}
            <Route path="/users" element={<ProtectedRoute requiredPermission="users.view"><AppLayout><UserManagementPage /></AppLayout></ProtectedRoute>} />

            {/* Role Management - Requires roles permissions */}
            <Route path="/roles" element={<ProtectedRoute requiredPermission="roles.view"><AppLayout><RoleManagementPage /></AppLayout></ProtectedRoute>} />

            {/* Access Denied page */}
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Server Error page */}
            <Route path="/server-error" element={<ServerError />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
