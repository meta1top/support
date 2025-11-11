"use client";

import { useEffect, useState } from "react";

import { Button, Dialog, Uploader, type UploadFile } from "@meta-1/design";

const Page = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log(files);
  }, [files]);

  return (
    <div className="p-4">
      <Uploader
        action="/api/upload/file"
        maxFiles={1}
        onChange={setFiles}
        // uploadHandle={(props) => {
        //   props.onSuccess({
        //     ...props.file,
        //     response: {
        //       code: 0,
        //       data: "https://easykit.cn/api/upload/file/123.png",
        //     },
        //   });
        // }}
        value={files}
      />
      <Button onClick={() => setVisible(true)}>打开弹窗</Button>
      <Dialog onCancel={() => setVisible(false)} title="上传文件" visible={visible}>
        <Uploader
          action="/api/upload/file"
          maxFiles={1}
          onChange={setFiles}
          // uploadHandle={(props) => {
          //   props.onSuccess({
          //     ...props.file,
          //     response: {
          //       code: 0,
          //       data: "https://easykit.cn/api/upload/file/123.png",
          //     },
          //   });
          // }}
          value={files}
        />
      </Dialog>
    </div>
  );
};

export default Page;
