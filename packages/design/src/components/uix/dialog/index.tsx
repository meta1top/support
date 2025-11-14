import type * as React from "react";
import type { FC, PropsWithChildren } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog as UIDialog,
} from "@meta-1/design/components/ui/dialog";
import { Spin } from "@meta-1/design/components/uix/spin";
import { cn } from "@meta-1/design/lib";

export type EventCallback = () => void;

export interface DialogProps extends PropsWithChildren {
  visible?: boolean;
  onCancel?: EventCallback;
  onOk?: EventCallback;
  className?: string;
  maskClosable?: boolean;
  closable?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  loading?: boolean;
}

export const Dialog: FC<DialogProps> = (props) => {
  const {
    visible,
    onCancel,
    maskClosable = true,
    className,
    closable = true,
    title,
    description,
    footer,
    loading = false,
  } = props;

  return (
    <UIDialog open={visible}>
      <DialogContent
        aria-describedby={undefined}
        autoFocus={false}
        className={cn(className)}
        onClick={(e) => e.stopPropagation()}
        onCloseClick={onCancel}
        onOverlayClick={maskClosable ? onCancel : () => {}}
        showClose={closable}
      >
        <DialogHeader className={cn(!title && !description && "sr-only")}>
          <DialogTitle className={cn(!title && "sr-only")}>{title || "Dialog"}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto px-6 py-4">{props.children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
        {loading ? (
          <div className={cn("absolute top-0 right-0 bottom-0 left-0 bg-white/50", "flex items-center justify-center")}>
            <Spin />
          </div>
        ) : null}
      </DialogContent>
    </UIDialog>
  );
};
