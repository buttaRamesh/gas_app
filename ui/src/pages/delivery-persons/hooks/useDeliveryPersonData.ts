import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import type { DeliveryPerson, DeliveryPersonStats } from "../types";

interface UseDeliveryPersonDataReturn {
  deliveryPersons: DeliveryPerson[];
  stats: DeliveryPersonStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeliveryPersonData(): UseDeliveryPersonDataReturn {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [stats, setStats] = useState<DeliveryPersonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get("/delivery-persons/");

        setDeliveryPersons(response.data.results || []);
        setStats(response.data.statistics || null);
      } catch (err: any) {
        console.error("Failed to fetch delivery persons:", err);
        setError(err.response?.data?.detail || "Failed to load delivery persons");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return {
    deliveryPersons,
    stats,
    loading,
    error,
    refetch,
  };
}
