import React from "react";
import {
  RegistrationStatus,
  OrganizationStatus,
  OrderStatus,
  UserRole,
  EmployeeRole,
  PromotionStatus,
} from "../../types/admin";
import { useTranslation } from "../../context/LanguageContext";

interface StatusBadgeProps {
  type: "registration" | "organization" | "order" | "userRole" | "employeeRole" | "promotion" | "product";
  value: any;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const { language } = useTranslation();
  const isHy = language === "hy";

  let label = String(value ?? "—");
  let variant: "success" | "warning" | "danger" | "info" | "purple" | "neutral" = "neutral";

  if (type === "registration") {
    const val = Number(value);
    if (val === RegistrationStatus.Pending || value === "Pending") {
      label = isHy ? "Սպասման մեջ" : "Pending";
      variant = "warning";
    } else if (val === RegistrationStatus.InProgress || value === "InProgress") {
      label = isHy ? "Մշակվում է" : "In Progress";
      variant = "info";
    } else if (val === RegistrationStatus.Approved || value === "Approved" || value === "Completed") {
      label = isHy ? "Հաստատված" : "Approved";
      variant = "success";
    } else if (val === RegistrationStatus.Declined || value === "Declined") {
      label = isHy ? "Մերժված" : "Declined";
      variant = "danger";
    }
  } else if (type === "organization") {
    const val = Number(value);
    if (val === OrganizationStatus.Active || value === "Active") {
      label = isHy ? "Ակտիվ" : "Active";
      variant = "success";
    } else if (val === OrganizationStatus.Pending || value === "Pending") {
      label = isHy ? "Սպասման մեջ" : "Pending";
      variant = "warning";
    } else if (val === OrganizationStatus.Suspended || value === "Suspended") {
      label = isHy ? "Կասեցված" : "Suspended";
      variant = "purple";
    } else if (val === OrganizationStatus.Blocked || value === "Blocked") {
      label = isHy ? "Արգելափակված" : "Blocked";
      variant = "danger";
    } else if (val === OrganizationStatus.Declined || value === "Declined") {
      label = isHy ? "Մերժված" : "Declined";
      variant = "danger";
    }
  } else if (type === "userRole") {
    const val = Number(value);
    if (val === UserRole.Client || value === "Client") {
      label = isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)";
      variant = "info";
    } else if (val === UserRole.Supplier || value === "Supplier") {
      label = isHy ? "Մատակարար" : "Supplier";
      variant = "purple";
    } else if (val === UserRole.Owner || value === "Owner") {
      label = isHy ? "Ղեկավար / Ադմին" : "Owner / Admin";
      variant = "success";
    }
  } else if (type === "employeeRole") {
    const mapHy: Record<string, string> = {
      SuperAdmin: "Գլխավոր ադմին",
      Admin: "Ադմինիստրատոր",
      Courier: "Առաքիչ",
      SalesManager: "Վաճառքի մենեջեր",
      PurchasingEmployee: "Գնումների մասնագետ",
      WarehouseManager: "Պահեստապետ",
    };
    const mapEn: Record<string, string> = {
      SuperAdmin: "Super Admin",
      Admin: "Admin",
      Courier: "Courier",
      SalesManager: "Sales Manager",
      PurchasingEmployee: "Purchasing Specialist",
      WarehouseManager: "Warehouse Manager",
    };
    label = isHy ? (mapHy[String(value)] || String(value)) : (mapEn[String(value)] || String(value));
    variant = "neutral";
  } else if (type === "order") {
    const val = Number(value);
    switch (val) {
      case OrderStatus.Draft: label = isHy ? "Սևագիր" : "Draft"; variant = "neutral"; break;
      case OrderStatus.New: label = isHy ? "Նոր" : "New"; variant = "info"; break;
      case OrderStatus.Seen: label = isHy ? "Դիտված" : "Seen"; variant = "info"; break;
      case OrderStatus.Accepted: label = isHy ? "Ընդունված" : "Accepted"; variant = "purple"; break;
      case OrderStatus.InProgress: label = isHy ? "Հավաքվում է" : "In Progress"; variant = "purple"; break;
      case OrderStatus.ReadyForDelivery: label = isHy ? "Պատրաստ է / Ճանապարհին" : "Ready / In Transit"; variant = "warning"; break;
      case OrderStatus.Delivered: label = isHy ? "Առաքված" : "Delivered"; variant = "success"; break;
      case OrderStatus.Paid: label = isHy ? "Վճարված" : "Paid"; variant = "success"; break;
      case OrderStatus.Finished: label = isHy ? "Ավարտված" : "Finished"; variant = "success"; break;
      case OrderStatus.Rejected: label = isHy ? "Չեղարկված" : "Cancelled"; variant = "danger"; break;
      default: label = String(value); variant = "neutral";
    }
  } else if (type === "promotion") {
    const val = Number(value);
    if (val === PromotionStatus.Active || value === "Active") {
      label = isHy ? "Ակտիվ" : "Active"; variant = "success";
    } else if (val === PromotionStatus.Scheduled || value === "Scheduled") {
      label = isHy ? "Ծրագրված" : "Scheduled"; variant = "info";
    } else if (val === PromotionStatus.Expired || value === "Expired") {
      label = isHy ? "Ժամկետանց" : "Expired"; variant = "neutral";
    } else if (val === PromotionStatus.Disabled || value === "Disabled") {
      label = isHy ? "Անջատված" : "Disabled"; variant = "danger";
    }
  } else if (type === "product") {
    if (value === true || value === 1 || value === "Active") {
      label = isHy ? "Ակտիվ" : "Active"; variant = "success";
    } else {
      label = isHy ? "Անջատված" : "Disabled"; variant = "danger";
    }
  }

  return <span className={`badge badge-${variant}`}>{label}</span>;
};
