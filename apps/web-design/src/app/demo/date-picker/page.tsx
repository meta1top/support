"use client";

import { useEffect, useState } from "react";

import { DatePicker } from "@meta-1/design";

const Page = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div className="p-4">
      <div onDoubleClick={() => setVisible(true)}>
        <DatePicker
          allowClear={true}
          className="rounded-none border-none shadow-none"
          onChange={setDate}
          onSelect={() => {
            console.log("onSelect");
            setVisible(false);
          }}
          placeholder="Select date"
          preset={true}
          value={date}
          visible={visible}
        />
      </div>
    </div>
  );
};

export default Page;
