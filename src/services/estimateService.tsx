import apiClient from "@/lib/axios";
import type { Estimate } from "@/types";

export const estimateService = {
  getAll: async () => {
    const res = await apiClient.get("/estimates");
    return res.data;
  },
  
  getById: async (id: string) => {
    const res = await apiClient.get(`/estimates/${id}`);
    return res.data;
  },

  create: async (data: Partial<Estimate>) => {
    const res = await apiClient.post("/estimates", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Estimate>) => {
    const res = await apiClient.put(`/estimates/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/estimates/${id}`);
  },

  downloadPdf: async (id: string) => {
    const res = await apiClient.get(`/estimates/${id}/pdf`, {
      responseType: "blob",
    });
    return res.data;
  }
};