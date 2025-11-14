"use client";

import { AlertCircle, CheckCircle, Info, TriangleAlert, XCircle } from "lucide-react";

import { Button, useMessage } from "@meta-1/design";

const Page = () => {
  const message = useMessage();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-4 font-semibold text-2xl">Message 消息提示演示</h2>
        <p className="text-muted-foreground text-sm">基于 Sonner 实现的轻量级消息提示</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础用法</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => message.info("这是一条普通信息")} variant="outline">
            <Info className="mr-2 h-4 w-4" />
            Info 信息
          </Button>

          <Button onClick={() => message.success("操作成功！")} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Success 成功
          </Button>

          <Button onClick={() => message.warning("请注意检查相关设置")} variant="outline">
            <TriangleAlert className="mr-2 h-4 w-4" />
            Warning 警告
          </Button>

          <Button onClick={() => message.error("操作失败，请重试")} variant="outline">
            <XCircle className="mr-2 h-4 w-4" />
            Error 错误
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">带描述的消息</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              message.info("系统通知", {
                description: "您有一条新的系统消息，请及时查看。",
              })
            }
            variant="outline"
          >
            Info 带描述
          </Button>

          <Button
            onClick={() =>
              message.success("保存成功", {
                description: "您的更改已成功保存到服务器。",
              })
            }
            variant="outline"
          >
            Success 带描述
          </Button>

          <Button
            onClick={() =>
              message.warning("存储空间不足", {
                description: "您的存储空间即将用完，建议清理不必要的文件。",
              })
            }
            variant="outline"
          >
            Warning 带描述
          </Button>

          <Button
            onClick={() =>
              message.error("网络错误", {
                description: "无法连接到服务器，请检查您的网络连接。",
              })
            }
            variant="outline"
          >
            Error 带描述
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">自定义持续时间</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              message.success("3秒后自动关闭", {
                duration: 3000,
              })
            }
            variant="outline"
          >
            3秒消息
          </Button>

          <Button
            onClick={() =>
              message.info("5秒后自动关闭", {
                duration: 5000,
              })
            }
            variant="outline"
          >
            5秒消息
          </Button>

          <Button
            onClick={() =>
              message.warning("需要手动关闭", {
                duration: Number.POSITIVE_INFINITY,
              })
            }
            variant="outline"
          >
            持久显示
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">自定义操作</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              message.success("保存成功", {
                description: "文件已保存到草稿箱",
                action: {
                  label: "查看",
                  onClick: () => console.log("查看草稿"),
                },
              })
            }
            variant="outline"
          >
            带操作按钮
          </Button>

          <Button
            onClick={() =>
              message.info("有新的更新可用", {
                description: "发现新版本 v2.0.0",
                action: {
                  label: "立即更新",
                  onClick: () => console.log("开始更新"),
                },
                cancel: {
                  label: "稍后",
                  onClick: () => console.log("取消更新"),
                },
              })
            }
            variant="outline"
          >
            带多个按钮
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">自定义位置</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              message.success("顶部居中显示", {
                position: "top-center",
              })
            }
            variant="outline"
          >
            顶部居中
          </Button>

          <Button
            onClick={() =>
              message.success("顶部右侧显示", {
                position: "top-right",
              })
            }
            variant="outline"
          >
            顶部右侧
          </Button>

          <Button
            onClick={() =>
              message.success("底部居中显示", {
                position: "bottom-center",
              })
            }
            variant="outline"
          >
            底部居中
          </Button>

          <Button
            onClick={() =>
              message.success("底部右侧显示", {
                position: "bottom-right",
              })
            }
            variant="outline"
          >
            底部右侧
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">批量测试</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              message.info("消息 1");
              setTimeout(() => message.success("消息 2"), 200);
              setTimeout(() => message.warning("消息 3"), 400);
              setTimeout(() => message.error("消息 4"), 600);
            }}
            variant="outline"
          >
            连续显示多条消息
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="mb-2 font-medium">说明</h4>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
          <li>Message 组件基于 Sonner 库实现</li>
          <li>支持 success、error、warning、info 四种类型</li>
          <li>可以自定义持续时间、位置、操作按钮等</li>
          <li>支持多条消息堆叠显示</li>
          <li>自动适配亮色/暗色主题</li>
        </ul>
      </div>
    </div>
  );
};

export default Page;

