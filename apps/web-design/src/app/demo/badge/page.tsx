"use client";

import { Badge } from "@meta-1/design";

const Page = () => {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-4 font-semibold text-2xl">Badge 徽章组件演示</h2>
        <p className="text-muted-foreground text-sm">展示不同场景下的徽章样式</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础 Variant</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">场景色 Variant</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">状态标签应用</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">订单状态：</span>
            <Badge variant="success">已完成</Badge>
            <Badge variant="info">处理中</Badge>
            <Badge variant="warning">待确认</Badge>
            <Badge variant="error">已取消</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">任务状态：</span>
            <Badge variant="success">已完成</Badge>
            <Badge variant="info">进行中</Badge>
            <Badge variant="warning">即将到期</Badge>
            <Badge variant="error">已逾期</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">服务状态：</span>
            <Badge variant="success">正常</Badge>
            <Badge variant="warning">降级</Badge>
            <Badge variant="error">故障</Badge>
            <Badge variant="secondary">维护中</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">数字标签</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">未读消息</span>
            <Badge variant="error">99+</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">待办事项</span>
            <Badge variant="warning">5</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">已完成</span>
            <Badge variant="success">128</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">新通知</span>
            <Badge variant="info">3</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">文本标签</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="success">已认证</Badge>
          <Badge variant="info">会员</Badge>
          <Badge variant="warning">试用中</Badge>
          <Badge variant="error">已过期</Badge>
          <Badge variant="outline">免费版</Badge>
          <Badge variant="default">标准版</Badge>
          <Badge variant="secondary">企业版</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">组合使用</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">张三</span>
            <Badge variant="success">在线</Badge>
            <Badge variant="info">管理员</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">李四</span>
            <Badge variant="warning">离开</Badge>
            <Badge variant="outline">普通用户</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">王五</span>
            <Badge variant="error">离线</Badge>
            <Badge variant="secondary">访客</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">在不同背景下的效果</h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-card p-4">
            <p className="mb-3 text-sm">Card 背景</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="mb-3 text-sm">Muted 背景</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="mb-2 font-medium">说明</h4>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
          <li>Badge 组件基于 Shadcn UI 扩展</li>
          <li>新增 success、error、warning、info 四种场景色</li>
          <li>使用主题颜色变量，自动适配亮色/暗色主题</li>
          <li>保留 Shadcn 原生的 default、secondary、destructive、outline</li>
          <li>适用于状态标签、数字提示、分类标记等场景</li>
        </ul>
      </div>
    </div>
  );
};

export default Page;

