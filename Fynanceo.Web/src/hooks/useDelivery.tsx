import { useState, useEffect } from "react";

export const useDelivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchDeliveries = async (status = null) => {
    setLoading(true);
    try {
      let url = "/api/deliveries";
      if (status) {
        url += `?status=${status}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/deliveries/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      await fetch(`/api/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchDeliveries();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const assignDeliveryPerson = async (deliveryId, deliveryPerson) => {
    try {
      await fetch(`/api/deliveries/${deliveryId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPerson }),
      });
      fetchDeliveries();
    } catch (error) {
      console.error("Erro ao atribuir entregador:", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, []);

  return {
    deliveries,
    loading,
    stats,
    fetchDeliveries,
    updateStatus,
    assignDeliveryPerson,
  };
};
