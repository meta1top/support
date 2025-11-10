"use client";

import { useEffect, useState } from "react";

import { DatePicker } from "@meta-1/design";

const Page = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div className="p-4">
      <div onDoubleClick={() => setOpen(true)}>
        <DatePicker
          allowClear={true}
          className="rounded-none border-none shadow-none"
          onChange={setDate}
          onOpenChange={setOpen}
          open={open}
          placeholder="Select date"
          preset={true}
          value={date}
        />
      </div>
    </div>
  );
};

export default Page;
