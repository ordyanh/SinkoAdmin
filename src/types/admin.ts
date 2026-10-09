// ==========================================
// Sinko Admin - TypeScript Type Definitions
// ==========================================

export enum UserRole {
  Client = 1,
  Supplier = 2,
  Owner = 3
}

export enum EmployeeRole {
  SuperAdmin = 1,
  Admin = 2,
  Courier = 3,
  SalesManager = 4,
  PurchasingEmployee = 5,
  WarehouseManager = 6
}

export enum RegistrationStatus {
  Pending = 1,
  InProgress = 2,
  Approved = 3,
  Declined = 4
}

export enum CallResult {
  ContactedInterested = 1,
  ContactedNeedsClarification = 2,
  ContactedNotInterested = 3,
  CouldNotReach = 4,
  CallScheduled = 5,
  InformationIncorrect = 6
}

export enum OrganizationStatus {
  Pending = 1,
  Active = 2,
  Suspended = 3,
  Blocked = 4,
  Declined = 5
}

export enum OrderStatus {
  Draft = 0,
  New = 1,
  Seen = 2,
  Accepted = 3,
  InProgress = 4,
  ReadyForDelivery = 5,
  Delivered = 6,
  Rejected = 7,
  WaitingConfirmation = 8,
  Paid = 9,
  Finished = 10
}

export enum PromotionType {
  FixedPrice = 1,
  Percentage = 2,
  BuyXGetY = 3
}

export enum PromotionStatus {
  Draft = 1,
  Scheduled = 2,
  Active = 3,
  Expired = 4,
  Disabled = 5
}

export enum ProductStatus {
  Active = 1,
  Inactive = 2
}

export enum AuditActionType {
  RegistrationApproved = 1,
  RegistrationDeclined = 2,
  SubscriptionChanged = 3,
  OrganizationSuspended = 4,
  OrganizationReactivated = 5,
  HvhhApproved = 6,
  HvhhRejected = 7,
  CompanyChangeApproved = 8,
  CompanyChangeRejected = 9,
  PromotionDisabled = 10,
  UserStatusChanged = 11,
  PasswordReset = 12,
  Other = 99
}

export enum NotificationDeliveryStatus {
  Created = 1,
  Sent = 2,
  Delivered = 3,
  Failed = 4
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// 1. Dashboard
export interface AdminDashboardAlertDto {
  type: string;
  message: string;
  entityId?: string | null;
  timestamp: string;
}

export interface AdminDashboardSummaryResponse {
  totalHoreca: number;
  totalSuppliers: number;
  pendingRegistrations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  activeUsers: number;
  pendingSubscriptionRequests: number;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  totalOrders: number;
  ordersToday: number;
  ordersInProgress: number;
  deliveredOrders: number;
  cancelledOrders: number;
  alerts: AdminDashboardAlertDto[];
}

// 2. Registrations
export interface AdminRegistrationResponse {
  id: string;
  companyName: string;
  accountType: UserRole | string;
  applicantEmail: string;
  phone: string;
  taxCode: string;
  typeOfActivity?: string | null;
  status: RegistrationStatus | string;
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  selectedPlan?: string | null;
}

export interface AdminCallLogDto {
  id: string;
  adminId?: string | null;
  adminEmail?: string | null;
  callDate: string;
  callResult: CallResult | string;
  notes?: string | null;
}

export interface AdminNoteDto {
  id: string;
  adminId?: string | null;
  adminEmail?: string | null;
  entityType: string;
  entityId: string;
  noteText: string;
  createdAt: string;
}

export interface AdminRegistrationDetailResponse {
  id: string;
  companyName: string;
  accountType: UserRole | string;
  applicantEmail: string;
  phone: string;
  taxCode: string;
  jurAddress: string;
  typeOfActivity?: string | null;
  categoryIds: number[];
  status: RegistrationStatus | string;
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  declineReason?: string | null;
  selectedPlan?: string | null;
  callHistory: AdminCallLogDto[];
  notes: AdminNoteDto[];
}

// 3. Organizations
export interface AdminOrganizationSummaryResponse {
  id: string;
  companyName: string;
  role: UserRole | string;
  taxCode: string;
  email: string;
  phoneNumber: string;
  status: OrganizationStatus | string;
  subscriptionPlan?: string | null;
  employeeCount: number;
  creationDate: string;
  lastActivity?: string | null;
  typeOfActivity?: string | null;
}

export interface AdminOrganizationDetailResponse {
  id: string;
  companyName: string;
  role: UserRole | string;
  typeOfActivity?: string | null;
  taxCode: string;
  email: string;
  phoneNumber: string;
  jurAddress: string;
  deliveryAddresses: string[];
  creationDate: string;
  status: OrganizationStatus | string;
  subscriptionPlan?: string | null;
  maxEmployees: number;
  currentEmployeesCount: number;
  users: AdminUserResponse[];
  recentOrders: AdminOrderResponse[];
  relatedPartners: string[];
  notes: AdminNoteDto[];
}

// 4. Users & Employees
export interface AdminUserResponse {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  taxCode: string;
  role: UserRole | string;
  jurAddress: string;
  typeOfActivity?: string | null;
  subscriptionPlan?: string | null;
  creationDate: string;
  isActive: boolean;
  employeesCount: number;
  categoryIds: number[];
  lastLogin?: string | null;
}

export interface AdminEmployeeResponse {
  id: string;
  organizationId: string;
  organizationName: string;
  employeeName: string;
  email: string;
  phoneNumber: string;
  role: EmployeeRole | string;
  isActive: boolean;
  serviceAreas: string[];
  lastLogin?: string | null;
}

// 5. Subscriptions & Plans
export interface AdminSubscriptionResponse {
  organizationId: string;
  organizationName: string;
  accountType: UserRole | string;
  currentPlan: string;
  startDate: string;
  endDate?: string | null;
  employeeLimit: number;
  currentEmployeeUsage: number;
  isActive: boolean;
}

export interface AdminSubscriptionPlanDto {
  id: string;
  planName: string;
  accountType: UserRole | string;
  price: number;
  billingPeriod: string;
  employeeLimit: number;
  featuresJson?: string | null;
  isActive: boolean;
  createdAt: string;
}

// 6. Orders
export interface AdminOrderProductDto {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface AdminOrderStatusLogDto {
  id: number;
  changedByUserId?: string | null;
  changedByUserName?: string | null;
  oldStatus: number;
  newStatus: number;
  changedAt: string;
}

export interface AdminOrderResponse {
  id: string;
  creationDate: string;
  clientId: string;
  clientName: string;
  supplierId: string;
  supplierName: string;
  price: number;
  discount?: number | null;
  finalPrice?: number | null;
  status: OrderStatus | string;
  deliveryDate?: string | null;
  description?: string | null;
  productsCount: number;
  products: AdminOrderProductDto[];
}

export interface AdminOrderDetailResponse extends AdminOrderResponse {
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  statusLogs: AdminOrderStatusLogDto[];
}

// 7. Products & Promotions
export interface AdminProductResponse {
  id: number;
  code: string;
  name: string;
  categoryName?: string | null;
  supplierName?: string | null;
  basePrice: number;
  unit: number;
  sellingUnit: number;
  unitDisplay?: string | null;
  unitName?: string | null;
  inStock: boolean;
  creationDate: string;
  isActive: boolean;
}

export interface AdminPromotionResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description?: string | null;
  type: PromotionType | string;
  status: PromotionStatus | string;
  startDate: string;
  endDate: string;
  creationDate?: string | null;
  isBlocked: boolean;
  productsCount: number;
}

// 8. Requests
export interface AdminHvhhRequestResponse {
  id: number;
  supplierId: string;
  supplierName: string;
  oldHvhh: string;
  newHvhh: string;
  reason?: string | null;
  status?: number | null; // 0: Pending, 1: Approved, 2: Rejected
  createdAt?: string | null;
  reviewedAt?: string | null;
}

export interface AdminCompanyChangeResponse {
  id: number;
  supplierId: string;
  supplierName: string;
  dataJson: string;
  status?: number | null;
  createdAt?: string | null;
}

// 9. Catalog config
export interface AdminCategoryDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface AdminServiceAreaDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface AdminBusinessTypeDto {
  id: number;
  name: string;
}

// 10. Notifications
export interface AdminNotificationLogResponse {
  id: string;
  userId: string;
  userName?: string | null;
  title?: string | null;
  message: string;
  notificationType?: number | null;
  orderId?: string | null;
  creationDate: string;
  deliveryStatus: NotificationDeliveryStatus | string;
}

export interface AdminNotificationTemplateDto {
  id: string;
  templateKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  supportedVariablesJson?: string | null;
  isActive: boolean;
}

// 11. Global search & Audit
export interface AdminSearchResultItem {
  entityType: string;
  id: string;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  deepLink: string;
}

export interface AdminAuditLogResponse {
  id: string;
  adminId?: string | null;
  adminEmail?: string | null;
  actionType: AuditActionType | string;
  entityType: string;
  entityId: string;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  timestamp: string;
  ipAddress?: string | null;
}

export interface AdminGlobalSearchResponse {
  results: AdminSearchResultItem[];
}
