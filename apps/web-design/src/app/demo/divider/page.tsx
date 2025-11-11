"use client";

import { Divider } from "@meta-1/design";

const Page = () => {
  return (
    <div className="p-4">
      <Divider orientation="left">left</Divider>
      <Divider orientation="center">center</Divider>
      <Divider orientation="right">right</Divider>
    </div>
  );
};

export default Page;
