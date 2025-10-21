import { forwardRef } from "react";

import { Button as UIButton } from "@meta-1/design/components/ui/button";
import { Spin } from "@meta-1/design/components/uix/spin";
import { cn } from "@meta-1/design/lib";

export interface ButtonProps extends React.ComponentProps<typeof UIButton> {
  loading?: boolean;
  long?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, forwardedRef) => {
  const { loading = false, long = false, disabled = false, className, ...rest } = props;
  const elementRef = forwardedRef;

  return (
    <UIButton
      {...rest}
      className={cn("gap-0.5", className, long ? "w-full" : null)}
      disabled={loading || disabled}
      ref={elementRef}
    >
      {loading ? <Spin /> : null}
      {props.children}
    </UIButton>
  );
});

Button.displayName = "Button";
