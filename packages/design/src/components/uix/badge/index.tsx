import type * as React from "react";

import { Badge as UIBadge } from "@meta-1/design/components/ui/badge";
import { cn } from "@meta-1/design/lib";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "error"
  | "warning"
  | "info";

export type BadgeProps = Omit<React.ComponentProps<typeof UIBadge>, "variant"> & {
  variant?: BadgeVariant;
};

export const Badge = ({ variant = "default", className, ...props }: BadgeProps) => {
  // 扩展的场景色样式
  const variantStyles: Partial<Record<BadgeVariant, string>> = {
    success: "border-transparent bg-success text-success-foreground",
    error: "border-transparent bg-error text-error-foreground",
    warning: "border-transparent bg-warning text-warning-foreground",
    info: "border-transparent bg-info text-info-foreground",
  };

  // 扩展场景使用 default variant，并添加自定义样式
  if (variant && ["success", "error", "warning", "info"].includes(variant)) {
    return <UIBadge {...props} className={cn(variantStyles[variant], className)} variant="default" />;
  }

  // 原生 variant 直接传递
  return (
    <UIBadge
      {...props}
      className={className}
      variant={variant as "default" | "secondary" | "destructive" | "outline"}
    />
  );
};
