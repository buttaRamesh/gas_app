import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LayoutDemo from "./pages/LayoutDemo";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import RouteEdit from "./pages/RouteEdit";
import RouteCreate from "./pages/RouteCreate";
import RouteAreas from "./pages/RouteAreas";
import RouteAreaCreate from "./pages/RouteAreaCreate";
import RouteStatistics from "./pages/RouteStatistics";
import RouteHistory from "./pages/RouteHistory";
import RouteCardColorDemo from "./pages/RouteCardColorDemo";
import RouteConsumers from "./pages/RouteConsumers";
import Settings from "./pages/Settings";
import SidebarDemo from "./pages/SidebarDemo";
import DeliveryPersons from "./pages/DeliveryPersons";
import DeliveryPersonCreate from "./pages/DeliveryPersonCreate";
import DeliveryPersonDetail from "./pages/DeliveryPersonDetail";
import DeliveryPersonStatistics from "./pages/DeliveryPersonStatistics";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import ProductDetail from "./pages/ProductDetail";
import ProductStatistics from "./pages/ProductStatistics";
import Units from "./pages/Units";
import UnitCreate from "./pages/UnitCreate";
import VariantCreate from "./pages/VariantCreate";
import Consumers from "./pages/Consumers";
import ConsumerDetail from "./pages/ConsumerDetail";
import ConsumerForm from "./pages/ConsumerForm";
import ConsumerStatistics from "./pages/ConsumerStatistics";
import ConsumerKycPending from "./pages/ConsumerKycPending";
import ConsumerCreateStepper from "./pages/ConsumerCreateStepper";
import ConsumerCategories from "./pages/ConsumerCategories";
import ConsumerTypes from "./pages/ConsumerTypes";
import BPLTypes from "./pages/BPLTypes";
import DCTTypes from "./pages/DCTTypes";
import Schemes from "./pages/Schemes";
import MarketTypes from "./pages/MarketTypes";
import ConnectionTypes from "./pages/ConnectionTypes";
import SubsidyDetails from "./pages/SubsidyDetails";

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
            <Route path="/routes/new" element={<AppLayout><RouteCreate /></AppLayout>} />
            <Route path="/routes/:id" element={<AppLayout><RouteDetail /></AppLayout>} />
            <Route path="/routes/:id/edit" element={<AppLayout><RouteEdit /></AppLayout>} />
            <Route path="/routes/:id/consumers" element={<AppLayout><RouteConsumers /></AppLayout>} />
            <Route path="/route-areas" element={<AppLayout><RouteAreas /></AppLayout>} />
            <Route path="/route-areas/new" element={<AppLayout><RouteAreaCreate /></AppLayout>} />
            <Route path="/delivery-persons" element={<AppLayout><DeliveryPersons /></AppLayout>} />
            <Route path="/delivery-persons/create" element={<AppLayout><DeliveryPersonCreate /></AppLayout>} />
            <Route path="/delivery-persons/statistics" element={<AppLayout><DeliveryPersonStatistics /></AppLayout>} />
            <Route path="/delivery-persons/:id" element={<AppLayout><DeliveryPersonDetail /></AppLayout>} />
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
