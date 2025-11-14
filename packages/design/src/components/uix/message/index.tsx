import { type ReactNode, useMemo } from "react";
import { type ExternalToast, toast } from "sonner";

export const useMessage = () => {
  return useMemo(() => {
    return {
      success: (message?: ReactNode, options?: ExternalToast) => {
        toast.success(message, {
          unstyled: true,
          ...options,
          className:
            "group w-full max-w-sm border-success-foreground/20 bg-success/80 text-success-foreground rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3 backdrop-blur-sm overflow-hidden",
          descriptionClassName: "text-sm truncate",
        });
      },
      error: (message?: ReactNode, options?: ExternalToast) => {
        toast.error(message, {
          unstyled: true,
          ...options,
          className:
            "group w-full max-w-sm border-error-foreground/20 bg-error/80 text-error-foreground rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3 backdrop-blur-sm overflow-hidden",
          descriptionClassName: "text-sm truncate",
        });
      },
      warning: (message?: ReactNode, options?: ExternalToast) => {
        toast.warning(message, {
          unstyled: true,
          ...options,
          className:
            "group w-full max-w-sm border-warning-foreground/20 bg-warning/80 text-warning-foreground rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3 backdrop-blur-sm overflow-hidden",
          descriptionClassName: "text-sm truncate",
        });
      },
      info: (message?: ReactNode, options?: ExternalToast) => {
        toast.info(message, {
          unstyled: true,
          ...options,
          className:
            "group w-full max-w-sm border-info-foreground/20 bg-info/80 text-info-foreground rounded-lg border px-4 py-3 shadow-lg flex items-start gap-3 backdrop-blur-sm overflow-hidden",
          descriptionClassName: "text-sm truncate",
        });
      },
    };
  }, []);
};
