// src/types/index.ts

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string; // Billing Address
  shippingAddress?: string; // Optional: If you want to store distinct shipping on client
  notes?: string;
  gstin?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
  hsnCode?: string;
  uom?: string; // NOS, KGS, etc.
  taxRate?: number; // e.g. 18
  
}
export interface Attachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientGst?: string;
  
  
  // 👇 NEW: Address Snapshot (Stored on Invoice)
  billingAddress?: string;
  shippingAddress?: string;

  // 👇 NEW: Transport & Order Details
  transportMode?: string;
  ewayBillNo?: string;
  challanNo?: string;
  challanDate?: string; // ISO String
  poNumber?: string;
  poDate?: string;      // ISO String

  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'PAID' | 'UNPAID' | 'PARTIAL' | 'PENDING';
  issuedAt: string;
  dueDate?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;

  client?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Add these to src/types/index.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface Company {
  id?: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  pincode?: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  
  // Tax
  gstin: string;
  udyamRegNo?: string;

  // Bank
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;

  // Branding
  logoUrl?: string;
  signatureUrl?: string;
}

export interface EstimateItem {
    id?: string;
    description: string;
    hsnCode: string;
    qty: number;
    rate: number;
    unit?: string; // e.g. NOS, SQFT
    taxRate: number; // GST %
}

export interface Estimate {
    id: string;
    estimateNo: string;
    estimateDate: string; // ISO Date
    clientId: string;
    clientName?: string; // For display
    
    // Address Details (Snapshot)
    billingAddress: string;
    shippingAddress?: string;
    
    items: EstimateItem[];
    
    // Totals
    subTotal: number;
    taxAmount: number;
    total: number;
    
    status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
    
    // Additional Fields from your screenshot
    subject?: string; // e.g. "Signage Work for Nykaa"
    notes?: string;   // Terms & Conditions
}

export interface Purchase {
  id?: string;
  storeName: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMode: string;
  paymentDate: string;
  status: string;
  notes?: string;
  createdBy?: string;
  remarks?: string;
}
export interface PurchaseStats {
  totalExpense: number;
  totalPaid: number;
  totalUnpaid: number;
}
