/**
 * Barrel export for UI components
 * Provides centralized export for all reusable UI atoms
 */

// ShadCN UI Components
export * from "./avatar";
export * from "./badge";
export * from "./button";
export * from "./card";
export * from "./checkbox";
export * from "./dialog";
export * from "./dropdown-menu";
export * from "./input";
export * from "./label";
export * from "./progress";
export * from "./select";
export * from "./switch";
export * from "./table";
export * from "./toast";
export * from "./toaster";

// Custom Wrappers
export { Modal, type ModalProps } from "./Modal";
export { GenericTable, type Column, type GenericTableProps } from "./GenericTable";
export { default as StatCard } from "./StatCard";

// Legacy exports (for backward compatibility)
export { default as DataTable } from "./DataTable";
export { default as ChartCard } from "./ChartCard";

