"use client";

import { useState } from "react";

import { Button, Dialog } from "@meta-1/design";

const Page = () => {
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [visible3, setVisible3] = useState(false);
  const [visible4, setVisible4] = useState(false);
  const [loading4, setLoading4] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="mb-2 font-semibold text-lg">测试 Dialog 内容溢出滚动</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setVisible1(true)}>短内容 Dialog</Button>
          <Button onClick={() => setVisible2(true)}>长内容 Dialog（垂直滚动）</Button>
          <Button onClick={() => setVisible3(true)}>宽内容 Dialog（横向滚动）</Button>
          <Button onClick={() => setVisible4(true)}>无 Footer + Loading</Button>
        </div>
      </div>

      {/* 短内容 Dialog */}
      <Dialog
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setVisible1(false)} variant="outline">
              取消
            </Button>
            <Button onClick={() => setVisible1(false)}>确定</Button>
          </div>
        }
        onCancel={() => setVisible1(false)}
        title="短内容测试"
        visible={visible1}
      >
        <div className="space-y-2">
          <p>这是一个简短的内容。</p>
          <p>不会触发滚动条。</p>
        </div>
      </Dialog>

      {/* 长内容 Dialog - 测试垂直滚动 */}
      <Dialog
        description="测试长内容时，header 和 footer 固定，内容区域滚动"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setVisible2(false)} variant="outline">
              取消
            </Button>
            <Button onClick={() => setVisible2(false)}>确定</Button>
          </div>
        }
        onCancel={() => setVisible2(false)}
        title="长内容测试 - 垂直滚动"
        visible={visible2}
      >
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">用户协议</h3>
            <p className="text-muted-foreground text-sm">欢迎使用我们的服务。在使用之前，请仔细阅读以下条款和条件。</p>
          </div>

          {[...Array(20)].map((_, index) => (
            <div className="rounded-md border p-4" key={index}>
              <h4 className="mb-2 font-medium">第 {index + 1} 条</h4>
              <p className="text-muted-foreground text-sm">
                这是第 {index + 1} 条条款的详细内容。用户在使用本服务时，应当遵守相关法律法规，
                不得利用本服务从事违法违规活动。本公司保留在必要时修改本协议的权利。
                如有任何疑问，请联系我们的客服团队。
              </p>
            </div>
          ))}

          <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">最后一项内容</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              滚动到这里说明滚动条工作正常！Header 和 Footer 应该保持固定。
            </p>
          </div>
        </div>
      </Dialog>

      {/* 宽内容 Dialog - 测试横向滚动 */}
      <Dialog
        description="测试宽内容时的横向滚动"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setVisible3(false)} variant="outline">
              取消
            </Button>
            <Button onClick={() => setVisible3(false)}>确定</Button>
          </div>
        }
        onCancel={() => setVisible3(false)}
        title="宽内容测试 - 横向滚动"
        visible={visible3}
      >
        <div className="space-y-4">
          <p>当内容宽度超出时，应该出现横向滚动条：</p>

          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-medium">代码示例（超宽内容）</h4>
            <pre className="rounded bg-muted p-3 text-sm" style={{ minWidth: "800px" }}>
              <code>
                {`const veryLongFunctionName = (parameter1, parameter2, parameter3, parameter4, parameter5) => {
  return "这是一个非常长的函数，用来测试横向滚动是否正常工作";
};`}
              </code>
            </pre>
          </div>

          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-medium">表格示例（超宽表格）</h4>
            <table className="min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="border p-2 text-left">列1</th>
                  <th className="border p-2 text-left">列2</th>
                  <th className="border p-2 text-left">列3</th>
                  <th className="border p-2 text-left">列4</th>
                  <th className="border p-2 text-left">列5</th>
                  <th className="border p-2 text-left">列6</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr className="border-b" key={i}>
                    <td className="border p-2">数据 {i + 1}-1</td>
                    <td className="border p-2">数据 {i + 1}-2</td>
                    <td className="border p-2">数据 {i + 1}-3</td>
                    <td className="border p-2">数据 {i + 1}-4</td>
                    <td className="border p-2">数据 {i + 1}-5</td>
                    <td className="border p-2">数据 {i + 1}-6</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground text-sm">横向滚动应该正常工作 ✓</p>
        </div>
      </Dialog>

      {/* 无 Footer + Loading 测试 */}
      <Dialog
        description="测试没有 Footer 时的底部 padding，以及 loading 状态不影响布局"
        loading={loading4}
        onCancel={() => {
          setVisible4(false);
          setLoading4(false);
        }}
        title="无 Footer + Loading 测试"
        visible={visible4}
      >
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">说明</h3>
            <p className="text-muted-foreground text-sm">
              这个 Dialog 没有 Footer（没有底部按钮），内容区域应该自动添加 padding-bottom。
            </p>
          </div>

          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-medium">测试要点</h4>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>内容区域底部应该有适当的留白（pb-6）</li>
              <li>点击"触发 Loading"按钮后，loading 层不应该影响布局</li>
              <li>loading 层使用绝对定位，不参与 flex gap 计算</li>
              <li>内容的底部间距应该保持不变</li>
            </ul>
          </div>

          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
            <p className="mb-3 font-medium text-blue-800 dark:text-blue-200">互动测试</p>
            <Button
              onClick={() => {
                setLoading4(true);
                setTimeout(() => setLoading4(false), 2000);
              }}
              size="sm"
              variant="outline"
            >
              触发 Loading（2秒）
            </Button>
          </div>

          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <p className="text-muted-foreground text-sm" key={i}>
                填充内容 {i + 1} - 这是一段测试文本，用于验证内容区域的滚动和间距是否正常。
              </p>
            ))}
          </div>

          <div className="rounded-md border border-green-500 bg-green-50 p-4 dark:bg-green-950">
            <p className="font-medium text-green-800 dark:text-green-200">最后一段内容</p>
            <p className="text-green-700 text-sm dark:text-green-300">
              如果这段内容和对话框底部有适当的间距，说明 padding-bottom 生效了 ✓
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Page;
