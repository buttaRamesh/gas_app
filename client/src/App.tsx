import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AppLayout } from "./components/AppLayout";
// import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
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
import ConsumerForm from "./pages/consumer/ConsumerForm";
import ConsumerStatistics from "./pages/consumer/ConsumerStatistics";
import ConsumerKycPending from "./pages/consumer/ConsumerKycPending";
import ConsumerCreateStepper from "./pages/consumer/ConsumerCreateStepper";

// Lookup pages
import ConsumerCategories from "./pages/lookup/ConsumerCategories";
import ConsumerTypes from "./pages/lookup/ConsumerTypes";
import BPLTypes from "./pages/lookup/BPLTypes";
import DCTTypes from "./pages/lookup/DCTTypes";
import Schemes from "./pages/lookup/Schemes";
import MarketTypes from "./pages/lookup/MarketTypes";
import ConnectionTypes from "./pages/lookup/ConnectionTypes";
import SubsidyDetails from "./pages/lookup/SubsidyDetails";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <BrowserRouter>
          <Routes>
            {/* Main dashboard - full screen without sidebar */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Full-screen demo pages */}
            <Route path="/demo" element={<LayoutDemo />} />
            <Route path="/sidebar-demo" element={<SidebarDemo />} />
            
            {/* Pages with sidebar layout */}
            <Route path="/routes" element={<AppLayout><RoutesPage /></AppLayout>} />
            <Route path="/routes/statistics" element={<AppLayout><RouteStatistics /></AppLayout>} />
            <Route path="/routes/history" element={<AppLayout><RouteHistory /></AppLayout>} />
            <Route path="/routes/color-demo" element={<AppLayout><RouteCardColorDemo /></AppLayout>} />
            <Route path="/routes/consumers-select" element={<AppLayout><RouteConsumers /></AppLayout>} />
            <Route path="/routes/new" element={<AppLayout><RouteCreate /></AppLayout>} />
            <Route path="/routes/:id" element={<AppLayout><RouteDetail /></AppLayout>} />
            <Route path="/routes/:id/edit" element={<AppLayout><RouteEdit /></AppLayout>} />
            <Route path="/routes/:id/consumers" element={<AppLayout><RouteConsumers /></AppLayout>} />
            <Route path="/route-areas" element={<AppLayout><RouteAreas /></AppLayout>} />
            <Route path="/route-areas/new" element={<AppLayout><RouteAreaCreate /></AppLayout>} />
            <Route path="/delivery-persons" element={<AppLayout><DeliveryPersons /></AppLayout>} />
            <Route path="/delivery-persons/create" element={<AppLayout><DeliveryPersonCreate /></AppLayout>} />

            <Route path="/delivery-persons/statistics" element={<AppLayout><DeliveryPersonStatistics /></AppLayout>} />
            <Route path="/delivery-persons/consumers-select" element={<AppLayout><DeliveryPersonConsumers /></AppLayout>} />
            <Route path="/delivery-persons/:id" element={<AppLayout><DeliveryPersonDetail /></AppLayout>} />
            {/* <Route path="/delivery-persons/:id/consumers" element={<AppLayout><DeliveryPersonConsumers /></AppLayout>} /> */}
            <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
            <Route path="/products/create" element={<AppLayout><ProductCreate /></AppLayout>} />
            <Route path="/products/statistics" element={<AppLayout><ProductStatistics /></AppLayout>} />
            <Route path="/products/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
            <Route path="/units" element={<AppLayout><Units /></AppLayout>} />
            <Route path="/units/create" element={<AppLayout><UnitCreate /></AppLayout>} />
            <Route path="/variants/create" element={<AppLayout><VariantCreate /></AppLayout>} />
            <Route path="/consumers" element={<AppLayout><Consumers /></AppLayout>} />
            <Route path="/consumers/create" element={<AppLayout><ConsumerCreateStepper /></AppLayout>} />
            <Route path="/consumers/statistics" element={<AppLayout><ConsumerStatistics /></AppLayout>} />
            <Route path="/consumers/kyc-pending" element={<AppLayout><ConsumerKycPending /></AppLayout>} />
            <Route path="/consumers/:id" element={<AppLayout><ConsumerDetail /></AppLayout>} />
            <Route path="/consumers/:id/edit" element={<AppLayout><ConsumerForm /></AppLayout>} />

            {/* Lookup tables */}
            <Route path="/lookups/consumer-categories" element={<AppLayout><ConsumerCategories /></AppLayout>} />
            <Route path="/lookups/consumer-types" element={<AppLayout><ConsumerTypes /></AppLayout>} />
            <Route path="/lookups/bpl-types" element={<AppLayout><BPLTypes /></AppLayout>} />
            <Route path="/lookups/dct-types" element={<AppLayout><DCTTypes /></AppLayout>} />
            <Route path="/lookups/schemes" element={<AppLayout><Schemes /></AppLayout>} />
            <Route path="/lookups/market-types" element={<AppLayout><MarketTypes /></AppLayout>} />
            <Route path="/lookups/connection-types" element={<AppLayout><ConnectionTypes /></AppLayout>} />
            <Route path="/lookups/subsidy-details" element={<AppLayout><SubsidyDetails /></AppLayout>} />

            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
