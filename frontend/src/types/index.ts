export interface Inventory {
  id: number;
  itemCode: string;
  itemName: string;
  category?: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice?: number;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  client?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: '대기',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export const TRANSACTION_TYPE_LABELS = {
  IN: '입고',
  OUT: '출고',
};

export interface ProjectItem {
  id: number;
  project: Project;
  inventory: Inventory;
  requiredQuantity: number;
  allocatedQuantity: number;
  notes?: string;
  createdAt?: string;
}

export interface InventoryTransaction {
  id: number;
  inventory: Inventory;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  project?: Project;
  referenceNo?: string;
  transactionDate: string;
  notes?: string;
  createdBy?: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

export interface ItemAvailability {
  itemId: number;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  availableStock: number;
  shortfall: number;
  isAvailable: boolean;
}

export interface ProjectAvailability {
  projectId: number;
  projectName: string;
  allItemsAvailable: boolean;
  items: ItemAvailability[];
}

export interface InventoryStatusReport {
  totalItems: number;
  lowStockItems: number;
  totalStock: number;
  inventoryList: Inventory[];
  lowStockList: Inventory[];
}

export interface ProjectSummaryReport {
  totalProjects: number;
  statusCounts: Record<string, number>;
  projects: Project[];
}

export interface TransactionHistoryReport {
  totalTransactions: number;
  inTransactions: number;
  outTransactions: number;
  totalInQuantity: number;
  totalOutQuantity: number;
  transactions: InventoryTransaction[];
}
