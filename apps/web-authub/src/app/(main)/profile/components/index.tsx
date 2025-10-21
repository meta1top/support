"use client";

import { useTranslation } from "react-i18next";

import { ProfileBreadcrumb } from "@/components/common/breadcrumb/profile";
import { Coming } from "@/components/common/coming";
import { MainPage } from "@/components/common/page";
import { PageHeader } from "@/components/common/page/header";
import { TitleBar } from "@/components/common/page/title-bar";
import { useLayoutConfig } from "@/components/layout/hooks";
import type { MainLayoutProps } from "@/components/layout/main";

export const Profile = () => {
  useLayoutConfig<MainLayoutProps>({
    active: "profile",
  });
  const { t } = useTranslation();
  const title = t("个人资料");
  return (
    <MainPage>
      <PageHeader>
        <ProfileBreadcrumb />
        <TitleBar title={title} />
      </PageHeader>
      <Coming />
    </MainPage>
  );
};
