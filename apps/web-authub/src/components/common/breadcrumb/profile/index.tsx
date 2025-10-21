import type { FC, PropsWithChildren } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@meta-1/design";
import { AppBreadcrumb } from "..";

export type BreadcrumbProps = PropsWithChildren;

export const ProfileBreadcrumb: FC<BreadcrumbProps> = (props) => {
  const { children } = props;
  const { t } = useTranslation();

  return (
    <AppBreadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink asChild={true}>
          <Link href={`/profile`}>{t("个人资料")}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {children && <BreadcrumbSeparator />}
      {children}
    </AppBreadcrumb>
  );
};
