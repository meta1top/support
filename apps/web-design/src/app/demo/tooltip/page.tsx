"use client";

import { Button, Tooltip } from "@meta-1/design";

const Page = () => {
  return (
    <div className="p-4">
      <Tooltip content="This is a tooltip">
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  );
};

export default Page;
