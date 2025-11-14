import { type FC, useContext, useEffect, useState } from "react";
import get from "lodash/get";

import { Input } from "@meta-1/design/components/ui/input";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadcnPagination,
} from "@meta-1/design/components/ui/pagination";
import { UIXContext } from "@meta-1/design/components/uix/config-provider";
import { Select } from "@meta-1/design/components/uix/select";

export interface PaginationProps {
  total: number;
  page: number;
  size: number;
  onChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
  /** 简单模式：只显示上一页、当前页、下一页 */
  simple?: boolean;
  /** 是否显示总数信息 */
  showTotal?: boolean;
  /** 是否显示页面大小选择器 */
  showSizeChanger?: boolean;
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean;
}

export const SIZE_OPTIONS = [10, 20, 50, 100];

// 生成页码数组的辅助函数
const generatePageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    // 如果总页数小于等于7，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 总是显示第一页
    pages.push(1);

    if (currentPage <= 4) {
      // 当前页在前面时
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // 当前页在后面时
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 当前页在中间时
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return pages;
};

export const Pagination: FC<PaginationProps> = (props) => {
  const {
    total = 0,
    page = 1,
    size = 20,
    sizeOptions = SIZE_OPTIONS,
    onChange,
    onSizeChange,
    simple = false,
    showTotal = true,
    showSizeChanger = true,
    showQuickJumper = true,
  } = props;

  const config = useContext(UIXContext);
  const totalPageText = get(config.locale, "Pagination.totalPage");
  const totalText = get(config.locale, "Pagination.total");
  const sizeText = get(config.locale, "Pagination.size");
  const go = get(config.locale, "Pagination.go");
  const goSuffix = get(config.locale, "Pagination.goSuffix");

  const totalPage = Math.ceil(Number(total) / Number(size));
  // biome-ignore lint/suspicious/noExplicitAny: <pageValue>
  const [pageValue, setPageValue] = useState<any>(page);

  useEffect(() => {
    setPageValue(page);
  }, [page]);

  // biome-ignore lint/suspicious/noExplicitAny: <e>
  const handleChange = (e: any) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if (v === "") {
      setPageValue(v);
      return;
    }
    if (v < 1) {
      v = 1;
    }
    if (v > totalPage) {
      v = totalPage;
    }
    setPageValue(v);
  };

  const pageNumbers = generatePageNumbers(page, totalPage);

  // 渲染简单分页导航（只有上一页、当前页、下一页）
  const renderSimplePagination = () => {
    return (
      <PaginationContent>
        {/* 上一页 */}
        <PaginationItem>
          <PaginationPrevious
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={page === 1 ? undefined : () => onChange?.(page - 1)}
            size="default"
          />
        </PaginationItem>

        {/* 当前页 */}
        <PaginationItem>
          <PaginationLink isActive size="default">
            {page}
          </PaginationLink>
        </PaginationItem>

        {/* 下一页 */}
        <PaginationItem>
          <PaginationNext
            className={page === totalPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={page === totalPage ? undefined : () => onChange?.(page + 1)}
            size="default"
          />
        </PaginationItem>
      </PaginationContent>
    );
  };

  // 渲染完整分页导航（包含所有页码）
  const renderFullPagination = () => {
    return (
      <PaginationContent>
        {/* 上一页 */}
        <PaginationItem>
          <PaginationPrevious
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={page === 1 ? undefined : () => onChange?.(page - 1)}
            size="default"
          />
        </PaginationItem>

        {/* 页码数字 */}
        {pageNumbers.map((pageNum, index) => (
          <PaginationItem key={pageNum === "ellipsis" ? `ellipsis-${index}` : `page-${pageNum}`}>
            {pageNum === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                className="cursor-pointer"
                isActive={pageNum === page}
                onClick={() => onChange?.(pageNum)}
                size="default"
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* 下一页 */}
        <PaginationItem>
          <PaginationNext
            className={page === totalPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={page === totalPage ? undefined : () => onChange?.(page + 1)}
            size="default"
          />
        </PaginationItem>
      </PaginationContent>
    );
  };

  return (
    <div className="flex items-center justify-center space-x-6">
      <ShadcnPagination>
        {/* 总数信息 */}
        {showTotal ? (
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <span>{totalPageText?.replace("%total", `${total}`)}</span>
            <span>{totalText?.replace("%page", `${totalPage}`)}</span>
          </div>
        ) : null}
        {/* 分页导航 */}
        {simple ? renderSimplePagination() : renderFullPagination()}
        {/* 控制区域 */}
        {showSizeChanger || showQuickJumper ? (
          <div className="flex items-center space-x-3">
            {/* 页面大小选择 */}
            {showSizeChanger ? (
              <Select
                className="w-auto"
                onChange={(v) => onSizeChange?.(Number(v))}
                options={sizeOptions.map((v) => ({ label: sizeText?.replace("%size", `${v}`) || "", value: `${v}` }))}
                value={`${size}`}
              />
            ) : null}

            {/* 跳转输入框 */}
            {showQuickJumper ? (
              <div className="flex items-center space-x-1 text-sm">
                <span>{go}</span>
                <Input
                  className="h-9 w-12 rounded px-2 text-center"
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onChange?.(Number(pageValue));
                    }
                  }}
                  type="text"
                  value={pageValue}
                />
                <span>{goSuffix}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </ShadcnPagination>
    </div>
  );
};
