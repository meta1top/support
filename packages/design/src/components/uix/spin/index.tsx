import type { FC } from "react";

import { Spin as IconSpin } from "@meta-1/design/components/icons";
import { cn } from "@meta-1/design/lib";

export type SpinProps = {
  className?: string;
};

export const Spin: FC<SpinProps> = (props) => {
  return <IconSpin className={cn("animate-spin", props.className)} />;
};
