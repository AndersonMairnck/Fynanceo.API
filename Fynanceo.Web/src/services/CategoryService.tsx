// src/services/CategoryService.js
import api from "./api";

class CategoryService {
  async getAllCategories() {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Erro ao buscar categorias";
      throw new Error(errorMessage);
    }
  }

  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Erro ao buscar categoria";
      throw new Error(errorMessage);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      console.error("Dados enviados:", categoryData);

      let errorMessage = "Erro ao criar categoria";

      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        errorMessage = validationErrors || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      }

      throw new Error(errorMessage);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Erro ao atualizar categoria";
      throw new Error(errorMessage);
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Erro ao deletar categoria";
      throw new Error(errorMessage);
    }
  }
}

export default new CategoryService();
