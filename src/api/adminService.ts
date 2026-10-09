import client from "./client";
import {
  AdminDashboardSummaryResponse,
  AdminRegistrationResponse,
  AdminRegistrationDetailResponse,
  AdminOrganizationSummaryResponse,
  AdminOrganizationDetailResponse,
  AdminUserResponse,
  AdminEmployeeResponse,
  AdminSubscriptionResponse,
  AdminSubscriptionPlanDto,
  AdminOrderResponse,
  AdminOrderDetailResponse,
  AdminProductResponse,
  AdminPromotionResponse,
  AdminHvhhRequestResponse,
  AdminCompanyChangeResponse,
  AdminCategoryDto,
  AdminServiceAreaDto,
  AdminBusinessTypeDto,
  AdminNotificationLogResponse,
  AdminNotificationTemplateDto,
  AdminGlobalSearchResponse,
  AdminAuditLogResponse,
  AdminNoteDto,
  PagedResult,
  UserRole,
  EmployeeRole,
  RegistrationStatus,
  OrganizationStatus,
  OrderStatus,
  ProductStatus,
  PromotionStatus,
  CallResult,
  AuditActionType,
} from "../types/admin";

export const adminApi = {
  // 1. Dashboard
  getDashboard: async () => {
    const res = await client.get<AdminDashboardSummaryResponse>("/admin/dashboard");
    return res.data;
  },

  // 2. Registrations
  getRegistrations: async (params?: {
    status?: RegistrationStatus;
    accountType?: UserRole;
    searchTerm?: string;
    assignedAdminId?: string;
    createdFrom?: string;
    createdTo?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminRegistrationResponse>>("/admin/registrations", { params });
    return res.data;
  },

  getRegistrationById: async (id: string) => {
    const res = await client.get<AdminRegistrationDetailResponse>(`/admin/registrations/${id}`);
    return res.data;
  },

  assignRegistration: async (id: string, data: { adminId: string; adminName?: string }) => {
    const res = await client.post<{ message: string }>(`/admin/registrations/${id}/assign`, data);
    return res.data;
  },

  addCallLog: async (id: string, data: { callResult: CallResult; notes?: string }) => {
    const res = await client.post<{ message: string }>(`/admin/registrations/${id}/call-log`, data);
    return res.data;
  },

  selectPlan: async (id: string, planName: string) => {
    const res = await client.post<{ message: string }>(`/admin/registrations/${id}/plan`, { planName });
    return res.data;
  },

  approveRegistration: async (id: string, data: { selectedPlan?: string; initialPassword?: string }) => {
    const res = await client.post<{ message: string; organizationId?: string }>(`/admin/registrations/${id}/approve`, data);
    return res.data;
  },

  declineRegistration: async (id: string, declineReason: string) => {
    const res = await client.post<{ message: string }>(`/admin/registrations/${id}/decline`, { declineReason });
    return res.data;
  },

  // 3. Organizations
  getOrganizations: async (params?: {
    accountType?: UserRole;
    status?: OrganizationStatus;
    subscriptionPlan?: string;
    searchTerm?: string;
    typeOfActivity?: string;
    createdFrom?: string;
    createdTo?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminOrganizationSummaryResponse>>("/admin/organizations", { params });
    return res.data;
  },

  getOrganizationById: async (id: string) => {
    const res = await client.get<AdminOrganizationDetailResponse>(`/admin/organizations/${id}`);
    return res.data;
  },

  suspendOrganization: async (id: string, reason: string) => {
    const res = await client.post<{ message: string }>(`/admin/organizations/${id}/suspend`, { reason });
    return res.data;
  },

  reactivateOrganization: async (id: string) => {
    const res = await client.post<{ message: string }>(`/admin/organizations/${id}/reactivate`);
    return res.data;
  },

  // 4. Users & Employees
  getUsers: async (params?: {
    role?: UserRole;
    searchTerm?: string;
    isActive?: boolean;
    subscriptionPlan?: string;
    createdFrom?: string;
    createdTo?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminUserResponse>>("/admin/users", { params });
    return res.data;
  },

  getUserById: async (userId: string) => {
    const res = await client.get<AdminUserResponse>(`/admin/users/${userId}`);
    return res.data;
  },

  createUser: async (data: {
    companyName: string;
    email: string;
    phoneNumber: string;
    taxCode: string;
    role: UserRole;
    password: string;
    address: string;
    typeOfActivity?: string;
    subscriptionPlan?: string;
    categoryIds?: number[];
  }) => {
    const res = await client.post<{ message: string; userId?: string }>("/admin/users", data);
    return res.data;
  },

  updateUser: async (userId: string, data: {
    companyName: string;
    email: string;
    phoneNumber: string;
    taxCode: string;
    jurAddress: string;
    typeOfActivity?: string;
    subscriptionPlan?: string;
  }) => {
    const res = await client.put<{ message: string }>(`/admin/users/${userId}`, data);
    return res.data;
  },

  toggleUserBlockStatus: async (userId: string, isBlocked: boolean, reason?: string) => {
    const res = await client.post<{ message: string }>(`/admin/users/${userId}/block`, { isBlocked, reason });
    return res.data;
  },

  resetUserPassword: async (userId: string, newPassword: string) => {
    const res = await client.post<{ message: string }>(`/admin/users/${userId}/reset-password`, { newPassword });
    return res.data;
  },

  changeUserRole: async (userId: string, newRole: UserRole) => {
    const res = await client.patch<{ message: string }>(`/admin/users/${userId}/role`, { newRole });
    return res.data;
  },

  getEmployees: async (params?: {
    organizationId?: string;
    role?: EmployeeRole;
    isActive?: boolean;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminEmployeeResponse>>("/admin/employees", { params });
    return res.data;
  },

  toggleEmployeeStatus: async (id: string, isActive: boolean) => {
    const res = await client.post<{ message: string }>(`/admin/employees/${id}/toggle-status`, null, {
      params: { isActive }
    });
    return res.data;
  },

  // 5. Subscriptions & Plans
  getSubscriptions: async (params?: {
    accountType?: UserRole;
    planName?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminSubscriptionResponse>>("/admin/subscriptions", { params });
    return res.data;
  },

  assignSubscription: async (orgId: string, data: {
    planName: string;
    employeeLimit?: number;
    endDate?: string;
  }) => {
    const res = await client.post<{ message: string }>(`/admin/subscriptions/${orgId}/assign`, data);
    return res.data;
  },

  extendSubscription: async (orgId: string, days: number = 30) => {
    const res = await client.post<{ message: string }>(`/admin/subscriptions/${orgId}/extend`, { days });
    return res.data;
  },

  suspendSubscription: async (orgId: string) => {
    const res = await client.post<{ message: string }>(`/admin/subscriptions/${orgId}/suspend`);
    return res.data;
  },

  getSubscriptionPlans: async () => {
    const res = await client.get<AdminSubscriptionPlanDto[]>("/admin/subscription-plans");
    return res.data;
  },

  createSubscriptionPlan: async (data: {
    planName: string;
    accountType: UserRole;
    price: number;
    billingPeriod?: string;
    employeeLimit?: number;
    featuresJson?: string;
  }) => {
    const res = await client.post<{ message: string; planId?: string }>("/admin/subscription-plans", data);
    return res.data;
  },

  updateSubscriptionPlan: async (planId: string, data: {
    planName: string;
    price: number;
    billingPeriod: string;
    employeeLimit: number;
    featuresJson?: string;
  }) => {
    const res = await client.put<{ message: string }>(`/admin/subscription-plans/${planId}`, data);
    return res.data;
  },

  toggleSubscriptionPlanStatus: async (planId: string, isActive: boolean) => {
    const res = await client.patch<{ message: string }>(`/admin/subscription-plans/${planId}/status`, null, {
      params: { isActive }
    });
    return res.data;
  },

  // 6. Orders
  getOrders: async (params?: {
    clientId?: string;
    supplierId?: string;
    status?: OrderStatus;
    searchTerm?: string;
    dateFrom?: string;
    dateTo?: string;
    minPrice?: number;
    maxPrice?: number;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminOrderResponse>>("/admin/orders", { params });
    return res.data;
  },

  getOrderById: async (orderId: string) => {
    const res = await client.get<AdminOrderDetailResponse>(`/admin/orders/${orderId}`);
    return res.data;
  },

  // 7. Products & Promotions
  getProducts: async (params?: {
    supplierId?: string;
    categoryId?: number;
    status?: ProductStatus;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminProductResponse>>("/admin/products", { params });
    return res.data;
  },

  toggleProductStatus: async (productId: number, isActive: boolean) => {
    const res = await client.patch<{ message: string }>(`/admin/products/${productId}/status`, null, {
      params: { isActive }
    });
    return res.data;
  },

  getPromotions: async (params?: {
    supplierId?: string;
    status?: PromotionStatus;
    type?: number;
    searchTerm?: string;
    startDateFrom?: string;
    startDateTo?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminPromotionResponse>>("/admin/promotions", { params });
    return res.data;
  },

  blockPromotion: async (promotionId: string, isBlocked: boolean, reason?: string) => {
    const res = await client.post<{ message: string }>(`/admin/promotions/${promotionId}/block`, {
      isBlocked,
      reason,
    });
    return res.data;
  },

  // 8. Requests
  getHvhhRequests: async () => {
    const res = await client.get<AdminHvhhRequestResponse[]>("/admin/requests/hvhh");
    return res.data;
  },

  reviewHvhhRequest: async (id: number, approve: boolean, rejectionReason?: string) => {
    const res = await client.post<{ message: string }>(`/admin/requests/hvhh/${id}/review`, {
      approve,
      rejectionReason,
    });
    return res.data;
  },

  getCompanyChangeRequests: async () => {
    const res = await client.get<AdminCompanyChangeResponse[]>("/admin/requests/company-changes");
    return res.data;
  },

  reviewCompanyChangeRequest: async (id: number, approve: boolean, rejectionReason?: string) => {
    const res = await client.post<{ message: string }>(`/admin/requests/company-changes/${id}/review`, {
      approve,
      rejectionReason,
    });
    return res.data;
  },

  // 9. Catalog configuration
  getCategories: async () => {
    const res = await client.get<AdminCategoryDto[]>("/admin/categories");
    return res.data;
  },

  createCategory: async (name: string) => {
    const res = await client.post<{ message: string; categoryId?: number }>("/admin/categories", null, {
      params: { name }
    });
    return res.data;
  },

  updateCategory: async (id: number, name: string) => {
    const res = await client.put<{ message: string }>(`/admin/categories/${id}`, null, {
      params: { name }
    });
    return res.data;
  },

  getServiceAreas: async () => {
    const res = await client.get<AdminServiceAreaDto[]>("/admin/service-areas");
    return res.data;
  },

  createServiceArea: async (name: string) => {
    const res = await client.post<{ message: string; regionId?: number }>("/admin/service-areas", null, {
      params: { name }
    });
    return res.data;
  },

  updateServiceArea: async (id: number, name: string) => {
    const res = await client.put<{ message: string }>(`/admin/service-areas/${id}`, null, {
      params: { name }
    });
    return res.data;
  },

  getBusinessTypes: async () => {
    const res = await client.get<AdminBusinessTypeDto[]>("/admin/business-types");
    return res.data;
  },

  // 10. Notifications
  getNotifications: async (pageNumber: number = 1, pageSize: number = 50) => {
    const res = await client.get<PagedResult<AdminNotificationLogResponse>>("/admin/notifications", {
      params: { pageNumber, pageSize }
    });
    return res.data;
  },

  getNotificationTemplates: async () => {
    const res = await client.get<AdminNotificationTemplateDto[]>("/admin/notification-templates");
    return res.data;
  },

  saveNotificationTemplate: async (data: AdminNotificationTemplateDto) => {
    const res = await client.post<{ message: string }>("/admin/notification-templates", data);
    return res.data;
  },

  // 11. Search & Audit & Notes
  globalSearch: async (query: string) => {
    const res = await client.get<AdminGlobalSearchResponse>("/admin/search", {
      params: { query }
    });
    return res.data;
  },

  getAuditLogs: async (params?: {
    adminId?: string;
    entityType?: string;
    entityId?: string;
    actionType?: AuditActionType;
    dateFrom?: string;
    dateTo?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => {
    const res = await client.get<PagedResult<AdminAuditLogResponse>>("/admin/audit-logs", { params });
    return res.data;
  },

  getInternalNotes: async (entityType: string, entityId: string) => {
    const res = await client.get<AdminNoteDto[]>(`/admin/internal-notes/${entityType}/${entityId}`);
    return res.data;
  },

  addInternalNote: async (entityType: string, entityId: string, noteText: string) => {
    const res = await client.post<{ message: string }>("/admin/internal-notes", {
      entityType,
      entityId,
      noteText
    });
    return res.data;
  }
};
