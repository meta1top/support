import type { ComponentProps, ReactNode } from "react";

import { cn } from "@meta-1/design/lib";
import { Alert as UIAlert, AlertDescription as UIAlertDescription, AlertTitle as UIAlertTitle } from "../../ui/alert";

export type AlertVariant = "default" | "destructive" | "success" | "error" | "warning" | "info";

export type AlertProps = Omit<ComponentProps<typeof UIAlert>, "variant"> & {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  variant?: AlertVariant;
};

export const Alert = (props: AlertProps) => {
  const {
    title,
    description,
    icon,
    children: childrenProp,
    titleClassName,
    descriptionClassName,
    variant = "default",
    ...rest
  } = props;

  let className = props.className;
  const children = childrenProp || description;

  // 根据 variant 设置样式
  const variantStyles: Record<AlertVariant, string> = {
    default: "",
    destructive: "border-destructive/20 bg-destructive/10 text-destructive",
    success: "border-success-foreground/20 bg-success text-success-foreground",
    error: "border-error-foreground/20 bg-error text-error-foreground",
    warning: "border-warning-foreground/20 bg-warning text-warning-foreground",
    info: "border-info-foreground/20 bg-info text-info-foreground",
  };

  className = cn(variantStyles[variant], className);

  // 只有 default 和 destructive 传给 UIAlert，其他的我们自己处理样式
  const uiVariant = variant === "destructive" ? "destructive" : "default";

  return (
    <UIAlert {...rest} className={cn("flex gap-2", className)} variant={uiVariant}>
      {icon}
      <div className="flex flex-1 flex-col gap-2">
        {title && <UIAlertTitle className={titleClassName}>{title}</UIAlertTitle>}
        {children && <UIAlertDescription className={descriptionClassName}>{children}</UIAlertDescription>}
      </div>
    </UIAlert>
  );
};
