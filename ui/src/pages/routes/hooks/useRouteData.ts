import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import type { Route, RouteResponse, RouteStats } from "../types";

interface UseRouteDataReturn {
  routes: Route[];
  stats: RouteStats | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

export function useRouteData(): UseRouteDataReturn {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🟢 Client initiating request at:", new Date().toISOString());

      // Fetch routes with statistics included in response
      const response = await axiosInstance.get<RouteResponse>("/routes/", {
        params: { page: 1, page_size: 1000 }, // Fetch all routes for client-side filtering
      });

      console.log("🟢 Client received response at:", new Date().toISOString());

      setRoutes(response.data.results);
      setTotalCount(response.data.count);
      setStats(response.data.statistics);
    } catch (err: any) {
      setError(err.message || "Failed to fetch routes");
      console.error("Route fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    routes,
    stats,
    loading,
    error,
    totalCount,
    refetch: fetchData,
  };
}
