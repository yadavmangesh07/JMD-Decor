import apiClient from "@/lib/axios";

export const creditNoteService = {
  getAll: async () => {
    const response = await apiClient.get("/credit-notes");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/credit-notes/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post("/credit-notes", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/credit-notes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/credit-notes/${id}`);
    return response.data;
  },

  downloadPdf: async (id: string, creditNoteNo: string) => {
    const response = await apiClient.get(`/credit-notes/${id}/pdf`, {
      responseType: "blob",
    });
    
    // Create download link matching your Invoice/Estimate download styles
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CreditNote_${creditNoteNo.replace(/\//g, "-")}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};