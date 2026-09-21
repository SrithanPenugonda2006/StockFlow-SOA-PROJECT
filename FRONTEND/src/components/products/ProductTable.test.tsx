import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductTable } from "./ProductTable";
import { Product } from "../../types/product";

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Gaming Keyboard",
    sku: "KB-100",
    price: 89.99,
    category: "ELECTRONICS",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("ProductTable Component Role Actions", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewDetails = vi.fn();

  it("should render View and Edit actions for MANAGER role (canEdit=true, canDelete=false)", () => {
    render(
      <ProductTable
        products={mockProducts}
        canEdit={true}
        canDelete={false}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTitle("View Product Details")).toBeDefined();
    expect(screen.getByTitle("Edit Product")).toBeDefined();
    expect(screen.queryByTitle("Delete Product")).toBeNull();
  });

  it("should render View, Edit, and Delete actions for ADMIN role (canEdit=true, canDelete=true)", () => {
    render(
      <ProductTable
        products={mockProducts}
        canEdit={true}
        canDelete={true}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTitle("View Product Details")).toBeDefined();
    expect(screen.getByTitle("Edit Product")).toBeDefined();
    expect(screen.getByTitle("Delete Product")).toBeDefined();
  });

  it("should render View action only for CUSTOMER role (canEdit=false, canDelete=false)", () => {
    render(
      <ProductTable
        products={mockProducts}
        canEdit={false}
        canDelete={false}
        onViewDetails={mockOnViewDetails}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTitle("View Product Details")).toBeDefined();
    expect(screen.queryByTitle("Edit Product")).toBeNull();
    expect(screen.queryByTitle("Delete Product")).toBeNull();
  });
});
