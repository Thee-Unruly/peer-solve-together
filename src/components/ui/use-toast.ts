
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

// Re-export for use throughout the application
export const useToast = useToastHook;
export const toast = toastFunction;
