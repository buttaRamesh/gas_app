import { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';
import type { ConsumerDetail, RouteInfo } from '../types';

interface UseConsumerDetailReturn {
  consumer: ConsumerDetail | null;
  routeInfo: RouteInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useConsumerDetail(consumerId: string | undefined): UseConsumerDetailReturn {
  const [consumer, setConsumer] = useState<ConsumerDetail | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!consumerId) {
      setLoading(false);
      return;
    }

    const fetchConsumerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch consumer details (includes route_info)
        const consumerResponse = await axiosInstance.get(`/consumers/${consumerId}/`);
        const consumerData = consumerResponse.data;
        setConsumer(consumerData);

        // Set route info from consumer data
        setRouteInfo(consumerData.route_info || null);
      } catch (err: any) {
        console.error('Failed to fetch consumer details:', err);
        setError(err.response?.data?.detail || 'Failed to load consumer details');
      } finally {
        setLoading(false);
      }
    };

    fetchConsumerData();
  }, [consumerId, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return {
    consumer,
    routeInfo,
    loading,
    error,
    refetch,
  };
}
