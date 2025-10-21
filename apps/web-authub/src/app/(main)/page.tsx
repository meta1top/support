import type { Metadata } from "next";

import { st } from "@/utils/locale.server";
import { keywords, title } from "@/utils/seo";
import { HomePage } from "./components";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await title(await st("首页")),
    keywords: await keywords(),
  };
}

export default function Page() {
  return <HomePage />;
}
