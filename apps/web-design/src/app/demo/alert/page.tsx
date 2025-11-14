"use client";

import { AlertCircle, CheckCircle, Info, TriangleAlert, XCircle } from "lucide-react";

import { Alert, Button, useAlert } from "@meta-1/design";

const Page = () => {
  const alert = useAlert();

  const test = () => {
    alert.confirm({
      title: "删除确认",
      description: "是否要删除这条记录，所有的子权限以及关联的角色权限将会失效，是否继续？",
      cancelText: "取消",
      okText: "删除",
      onOk: () => {
        console.log("ok");
        return false;
      },
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-4 font-semibold text-2xl">Alert 组件演示</h2>
        <p className="text-muted-foreground text-sm">展示不同场景下的提示样式</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础 Variant</h3>

        {/* Default */}
        <Alert icon={<Info />} title="默认提示">
          这是一个默认样式的提示信息，适合一般的信息展示。
        </Alert>

        {/* Info */}
        <Alert icon={<Info />} title="信息提示" variant="info">
          这是一个信息提示，使用浅蓝色背景，适合展示一般性的提示信息。
        </Alert>

        {/* Success */}
        <Alert icon={<CheckCircle />} title="成功提示" variant="success">
          操作已成功完成！您的更改已保存，可以继续后续操作。
        </Alert>

        {/* Warning */}
        <Alert icon={<TriangleAlert />} title="警告提示" variant="warning">
          请注意：此操作可能会影响系统性能，建议在非高峰期执行。
        </Alert>

        {/* Error */}
        <Alert icon={<XCircle />} title="错误提示" variant="error">
          操作失败：网络连接超时，请检查网络设置后重试。
        </Alert>

        {/* Destructive */}
        <Alert icon={<AlertCircle />} title="危险操作" variant="destructive">
          <div className="space-y-2">
            <p>此操作不可逆！删除后将无法恢复数据。</p>
            <Button onClick={test} size="sm" variant="destructive">
              确认删除
            </Button>
          </div>
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">无图标样式</h3>

        <Alert title="无图标的信息提示" variant="info">
          这是一个没有图标的信息提示。
        </Alert>

        <Alert title="无图标的成功提示" variant="success">
          这是一个没有图标的成功提示。
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">只有描述</h3>

        <Alert icon={<Info />} variant="info">
          只有描述内容，没有标题的信息提示。
        </Alert>

        <Alert icon={<CheckCircle />} variant="success">
          只有描述内容，没有标题的成功提示。
        </Alert>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">复杂内容</h3>

        <Alert icon={<Info />} title="系统更新通知" variant="info">
          <div className="space-y-2">
            <p>系统将于今晚 22:00 - 24:00 进行维护升级，期间可能影响以下功能：</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>用户登录和注册</li>
              <li>数据同步功能</li>
              <li>文件上传下载</li>
            </ul>
            <p className="text-sm">请提前做好准备，感谢您的理解与支持。</p>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default Page;
