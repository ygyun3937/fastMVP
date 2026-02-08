import axios from 'axios';
import type {
  Inventory,
  Project,
  ProjectItem,
  InventoryTransaction,
  Notification,
  ProjectAvailability,
  InventoryStatusReport,
  ProjectSummaryReport,
  TransactionHistoryReport
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inventory API
export const inventoryApi = {
  getAll: () => apiClient.get<Inventory[]>('/inventory'),
  getById: (id: number) => apiClient.get<Inventory>(`/inventory/${id}`),
  getByCode: (itemCode: string) => apiClient.get<Inventory>(`/inventory/code/${itemCode}`),
  getByCategory: (category: string) => apiClient.get<Inventory[]>(`/inventory/category/${category}`),
  getLowStock: () => apiClient.get<Inventory[]>('/inventory/low-stock'),
  search: (keyword: string) => apiClient.get<Inventory[]>(`/inventory/search?keyword=${keyword}`),
  create: (data: Partial<Inventory>) => apiClient.post<Inventory>('/inventory', data),
  update: (id: number, data: Partial<Inventory>) => apiClient.put<Inventory>(`/inventory/${id}`, data),
  delete: (id: number) => apiClient.delete(`/inventory/${id}`),
};

// Project API
export const projectApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),
  getById: (id: number) => apiClient.get<Project>(`/projects/${id}`),
  getByCode: (projectCode: string) => apiClient.get<Project>(`/projects/code/${projectCode}`),
  getByStatus: (status: string) => apiClient.get<Project[]>(`/projects/status/${status}`),
  search: (keyword: string) => apiClient.get<Project[]>(`/projects/search?keyword=${keyword}`),
  create: (data: Partial<Project>) => apiClient.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => apiClient.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/projects/${id}`),
  getItems: (id: number) => apiClient.get<ProjectItem[]>(`/projects/${id}/items`),
  addItem: (id: number, data: { inventoryId: number; requiredQuantity: number; allocatedQuantity?: number; notes?: string }) =>
    apiClient.post<ProjectItem>(`/projects/${id}/items`, data),
  deleteItem: (itemId: number) => apiClient.delete(`/projects/items/${itemId}`),
  checkAvailability: (id: number) => apiClient.get<ProjectAvailability>(`/projects/${id}/availability`),
};

// Transaction API
export const transactionApi = {
  getAll: () => apiClient.get<InventoryTransaction[]>('/transactions'),
  getByInventory: (inventoryId: number) => apiClient.get<InventoryTransaction[]>(`/transactions/inventory/${inventoryId}`),
  getByProject: (projectId: number) => apiClient.get<InventoryTransaction[]>(`/transactions/project/${projectId}`),
  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<InventoryTransaction[]>(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`),
  create: (data: {
    inventoryId: number;
    transactionType: 'IN' | 'OUT';
    quantity: number;
    projectId?: number;
    referenceNo?: string;
    transactionDate?: string;
    notes?: string;
    createdBy?: string;
  }) => apiClient.post<InventoryTransaction>('/transactions', data),
};

// Notification API
export const notificationApi = {
  getAll: () => apiClient.get<Notification[]>('/notifications'),
  getUnread: () => apiClient.get<Notification[]>('/notifications/unread'),
  getUnreadCount: () => apiClient.get<number>('/notifications/unread-count'),
  markAsRead: (id: number) => apiClient.put<Notification>(`/notifications/${id}/read`),
  delete: (id: number) => apiClient.delete(`/notifications/${id}`),
};

// Report API
export const reportApi = {
  getInventoryStatus: () => apiClient.get<InventoryStatusReport>('/reports/inventory-status'),
  getProjectSummary: () => apiClient.get<ProjectSummaryReport>('/reports/project-summary'),
  getTransactionHistory: () => apiClient.get<TransactionHistoryReport>('/reports/transaction-history'),
};

export default apiClient;
