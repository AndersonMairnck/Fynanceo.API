// src/hooks/useCategories.js
import { useState, useEffect } from "react";
import CategoryService from "../services/CategoryService";
import { Category } from "../types/Category";



export const useCategories = () => {
 const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
  const error = err as Error;
  setError(error.message);
   
   
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      setError(null);
      const newCategory = await CategoryService.createCategory(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setError(null);
      const updatedCategory = await CategoryService.updateCategory(
        id,
        categoryData,
      );
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      );
      return updatedCategory;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      setError(null);
      await CategoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
};
