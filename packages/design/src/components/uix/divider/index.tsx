import type { PropsWithChildren } from "react";

import { cn } from "@meta-1/design/lib/utils";

export interface DividerProps extends PropsWithChildren {
  orientation?: "left" | "center" | "right";
  className?: string;
  labelClassName?: string;
  borderClassName?: string;
}

export const Divider = (props: DividerProps) => {
  const { orientation = "center" } = props;
  const orientationClass =
    orientation === "left" ? "justify-start" : orientation === "right" ? "justify-end" : "justify-center";

  return (
    <div className={cn("relative", props.className)}>
      <div className="absolute inset-0 flex items-center">
        <span className={cn("w-full border-t", props.borderClassName)} />
      </div>
      <div className={cn("relative flex text-xs uppercase", orientationClass)}>
        <span className={cn("mx-2 bg-background px-2 text-muted-foreground", props.labelClassName)}>
          {props.children}
        </span>
      </div>
    </div>
  );
};
