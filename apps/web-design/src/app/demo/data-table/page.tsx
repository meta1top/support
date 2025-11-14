"use client";

import { useState } from "react";

import { Button, Card, DataTable, Input } from "@meta-1/design";

type Project = {
  id: number;
  name: string;
  createTime: number;
  description: string;
};

const initialParams = {
  teamId: "",
  keyword: "",
  type: "all",
  page: 1,
  size: 20,
};

// 生成测试数据
const generateData = (count: number): Project[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `项目 ${i + 1}`,
    createTime: new Date(2025, 0, (i % 28) + 1).getTime(),
    description: `这是项目 ${i + 1} 的详细描述信息`,
  }));
};

const Page = () => {
  const [loading] = useState(false);
  const [showMaxHeight, setShowMaxHeight] = useState(false);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="mb-4 font-semibold text-2xl">DataTable 演示</h2>
        <div className="flex gap-4">
          <Button onClick={() => setShowMaxHeight(false)} variant={!showMaxHeight ? "default" : "outline"}>
            标准表格（无高度限制）
          </Button>
          <Button onClick={() => setShowMaxHeight(true)} variant={showMaxHeight ? "default" : "outline"}>
            固定高度表格（表头固定）
          </Button>
        </div>
      </div>

      {!showMaxHeight ? (
        <Card className="shadow-none">
          <DataTable<Project>
            autoHidePagination={false}
            checkbox={true}
            columns={[
              {
                accessorKey: "id",
                header: "ID",
                enableHiding: false,
                className: "w-[80px]",
              },
              {
                accessorKey: "name",
                header: "项目名称",
                enableHiding: true,
                className: "min-w-[200px]",
              },
              {
                accessorKey: "description",
                header: "描述",
                enableHiding: true,
                className: "min-w-[300px]",
              },
              {
                accessorKey: "createTime",
                header: "创建时间",
                enableHiding: true,
                formatters: ["time"],
                className: "w-[200px] min-w-[200px]",
              },
            ]}
            data={generateData(10)}
            filter={{
              items: [
                {
                  field: "keyword",
                  render: () => <Input placeholder="请输入关键词" />,
                },
                {
                  field: "teamId",
                  label: "所属团队",
                  render: () => <Input placeholder="请输入关键词" />,
                },
              ],
              defaultValues: initialParams,
              query: initialParams,
            }}
            inCard={true}
            load={async () => {}}
            loading={loading}
            onRowActionClick={({ id: key }, { original }) => {
              const { id } = original;
              console.log(id, key);
              // if(key === "detail") {
              //     router.push(`/i18n/${original.identifier}/dashboard`);
              // }else if(key === "activity") {
              //     router.push(`/i18n/${original.identifier}/activity`);
              // }else if(key === "delete") {
              //
              // }
            }}
            onRowClick={(row) => {
              console.log(row);
              // const { identifier } = row.original;
              // router.push(`/i18n/${identifier}/dashboard`);
            }}
            pagination={{
              total: 100,
              page: 1,
              size: 10,
            }}
            rowActions={() => [
              {
                id: "detail",
                type: "item",
                label: "详情",
              },
              {
                id: "activity",
                type: "item",
                label: "动态",
              },
            ]}
          />
        </Card>
      ) : (
        <Card className="shadow-none">
          <div className="mb-4 space-y-2">
            <h3 className="font-semibold text-lg">固定高度表格示例</h3>
            <p className="text-muted-foreground text-sm">
              设置 <code className="rounded bg-muted px-1.5 py-0.5">maxHeight</code>{" "}
              后，表头会固定，内容区域可以滚动。适合在固定高度容器中展示大量数据。
            </p>
          </div>
          <DataTable<Project>
            checkbox={true}
            columns={[
              {
                accessorKey: "id",
                header: "ID",
                enableHiding: false,
                className: "w-[80px]",
              },
              {
                accessorKey: "name",
                header: "项目名称",
                enableHiding: true,
                className: "min-w-[200px]",
              },
              {
                accessorKey: "description",
                header: "描述",
                enableHiding: true,
                className: "min-w-[300px]",
              },
              {
                accessorKey: "createTime",
                header: "创建时间",
                enableHiding: true,
                formatters: ["time"],
                className: "w-[200px] min-w-[200px]",
              },
            ]}
            data={generateData(50)}
            filter={{
              items: [
                {
                  field: "keyword",
                  render: () => <Input placeholder="请输入关键词" />,
                },
                {
                  field: "teamId",
                  label: "所属团队",
                  render: () => <Input placeholder="请输入关键词" />,
                },
              ],
              defaultValues: initialParams,
              query: initialParams,
            }}
            inCard={true}
            load={async () => {}}
            loading={loading}
            maxHeight="500px"
            onRowActionClick={({ id: key }, { original }) => {
              const { id } = original;
              console.log(id, key);
            }}
            onRowClick={(row) => {
              console.log(row);
            }}
            pagination={{
              total: 50,
              page: 1,
              size: 50,
            }}
            rowActions={() => [
              {
                id: "detail",
                type: "item",
                label: "详情",
              },
              {
                id: "edit",
                type: "item",
                label: "编辑",
              },
              {
                id: "delete",
                type: "item",
                label: "删除",
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default Page;
