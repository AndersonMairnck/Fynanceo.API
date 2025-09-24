// src/hooks/useCustomers.js
import { useState, useEffect } from "react";
import CustomerService from "../services/CustomerService";

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CustomerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    try {
      setError(null);
      const newCustomer = await CustomerService.createCustomer(customerData);
      setCustomers((prev) => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      setError(null);
      const updatedCustomer = await CustomerService.updateCustomer(
        id,
        customerData,
      );
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id ? updatedCustomer : customer,
        ),
      );
      return updatedCustomer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      setError(null);
      await CustomerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: loadCustomers,
  };
};
