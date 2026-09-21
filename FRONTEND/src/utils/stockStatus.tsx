import React from "react";
import { Badge } from "../components/common/Badge";

export const DEFAULT_LOW_STOCK_THRESHOLD = 25;
export const DEFAULT_CRITICAL_STOCK_THRESHOLD = 10;

export type StockStatusType = "OUT_OF_STOCK" | "CRITICAL" | "LOW_STOCK" | "HEALTHY";

export interface StockStatusInfo {
  type: StockStatusType;
  label: string;
  badgeVariant: "danger" | "warning" | "success" | "neutral";
}

export function evaluateStockStatus(
  availableQuantity: number,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): StockStatusInfo {
  if (availableQuantity <= 0) {
    return {
      type: "OUT_OF_STOCK",
      label: "OUT OF STOCK",
      badgeVariant: "danger",
    };
  }
  if (availableQuantity < DEFAULT_CRITICAL_STOCK_THRESHOLD) {
    return {
      type: "CRITICAL",
      label: "CRITICAL",
      badgeVariant: "danger",
    };
  }
  if (availableQuantity <= threshold) {
    return {
      type: "LOW_STOCK",
      label: "LOW STOCK",
      badgeVariant: "warning",
    };
  }
  return {
    type: "HEALTHY",
    label: "HEALTHY",
    badgeVariant: "success",
  };
}

export function renderStockStatusBadge(
  availableQuantity: number,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD,
  size: "sm" | "md" = "md"
) {
  const info = evaluateStockStatus(availableQuantity, threshold);
  return (
    <Badge variant={info.badgeVariant} size={size}>
      {info.label}
    </Badge>
  );
}
