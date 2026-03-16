import apiClient from "@/lib/axios";
import type { LoginRequest } from "@/types";

export interface User {
  id?: string;
  username: string;
  role: string;
}

export const authService = {
  // 1. LOGIN: Saves Token AND User Role to localStorage
  login: async (creds: LoginRequest) => {
    console.log("Attempting login with:", creds.username); 
    const response: any = await apiClient.post("/auth/login", creds);
    const data = response.data || response;

    const token = data.token;
    const role = data.role || "USER"; 
    const username = data.username || creds.username;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ username, role }));
      return { token, role, username };
    } else {
      throw new Error("Login failed: No token received");
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getAllUsers: async () => {
    const response: any = await apiClient.get<User[]>("/auth/users");
    return Array.isArray(response) ? response : (response.data || []);
  },

  register: async (username: string, password: string, role: string = "USER") => {
    return await apiClient.post("/auth/register", { username, password, role });
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/auth/users/${id}`);
  },

  verifyPassword: async (password: string) => {
    const response = await apiClient.post("/auth/verify-password", { password });
    return response.data || response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Using replace to prevent users from clicking 'back' into a protected route
    window.location.replace("/login");
  },

  // 👇 UPDATED: Now checks for token existence AND expiration
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // JWTs are Base64 encoded. The second part (index 1) contains the payload.
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(window.atob(payloadBase64));
      
      // Check if current time (in seconds) is greater than expiry time
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (decodedPayload.exp && decodedPayload.exp < currentTime) {
        console.warn("Auth: Token has expired");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Auth: Token validation failed", error);
      return false;
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  updateCurrentUser: async (data: { username: string; currentPassword: string; newPassword?: string }) => {
    const response = await apiClient.put("/auth/me", data);
    
    if (data.username) {
       const userStr = localStorage.getItem("user");
       if (userStr) {
           const user = JSON.parse(userStr);
           user.username = data.username;
           localStorage.setItem("user", JSON.stringify(user));
       }
    }
    return response.data;
  },
};