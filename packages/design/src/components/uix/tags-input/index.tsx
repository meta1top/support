import { forwardRef, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";

import { cn } from "@meta-1/design/lib";

export interface TagsInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  tagClassName?: string;
  maxTags?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  separator?: string | RegExp;
  validate?: (tag: string) => boolean;
  disabled?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  renderTag?: (tag: string, index: number, remove: () => void) => React.ReactNode;
}

export const TagsInput = forwardRef<HTMLDivElement, TagsInputProps>((props, ref) => {
  const {
    value,
    defaultValue = [],
    onChange,
    placeholder,
    className,
    inputClassName,
    tagClassName,
    maxTags,
    maxLength,
    allowDuplicates = false,
    separator = ",",
    validate,
    disabled = false,
    onTagAdd,
    onTagRemove,
    renderTag,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>(value || defaultValue);

  const isControlled = value !== undefined;
  const currentTags = isControlled ? value : tags;

  useEffect(() => {
    if (isControlled) {
      setTags(value);
    }
  }, [value, isControlled]);

  const handleChange = (newTags: string[]) => {
    if (!isControlled) {
      setTags(newTags);
    }
    onChange?.(newTags);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) return;

    // 验证标签
    if (validate && !validate(trimmedTag)) return;

    // 检查最大数量
    if (maxTags && currentTags.length >= maxTags) return;

    // 检查重复
    if (!allowDuplicates && currentTags.includes(trimmedTag)) return;

    const newTags = [...currentTags, trimmedTag];
    handleChange(newTags);
    onTagAdd?.(trimmedTag);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    const tag = currentTags[index];
    const newTags = currentTags.filter((_, i) => i !== index);
    handleChange(newTags);
    onTagRemove?.(tag);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // Enter 或分隔符键
    if (e.key === "Enter" || (typeof separator === "string" && e.key === separator)) {
      e.preventDefault();
      if (value) {
        addTag(value);
      }
      return;
    }

    // Backspace 删除最后一个标签
    if (e.key === "Backspace" && !value && currentTags.length > 0) {
      e.preventDefault();
      removeTag(currentTags.length - 1);
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 检查是否包含分隔符
    if (separator) {
      const parts = typeof separator === "string" ? value.split(separator) : value.split(separator);

      if (parts.length > 1) {
        // 添加所有非空部分（除了最后一个）
        parts.slice(0, -1).forEach((part) => {
          if (part.trim()) {
            addTag(part);
          }
        });
        // 保留最后一部分作为输入值
        setInputValue(parts[parts.length - 1]);
        return;
      }
    }

    // 检查最大长度
    if (maxLength && value.length > maxLength) return;

    setInputValue(value);
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const defaultRenderTag = (tag: string, index: number, remove: () => void) => (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm transition-colors",
        "hover:bg-secondary/80",
        disabled && "pointer-events-none opacity-50",
        tagClassName,
      )}
      key={`${tag}-${index}`}
    >
      <span className="max-w-[200px] truncate">{tag}</span>
      {!disabled && (
        <button
          className="inline-flex items-center justify-center rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            remove();
          }}
          type="button"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        "dark:bg-input/30",
        className,
      )}
      onClick={handleContainerClick}
      ref={ref}
    >
      {currentTags.map((tag, index) =>
        renderTag
          ? renderTag(tag, index, () => removeTag(index))
          : defaultRenderTag(tag, index, () => removeTag(index)),
      )}

      <input
        className={cn(
          "min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          inputClassName,
        )}
        disabled={disabled || (maxTags !== undefined && currentTags.length >= maxTags)}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={currentTags.length === 0 ? placeholder : undefined}
        ref={inputRef}
        type="text"
        value={inputValue}
      />
    </div>
  );
});

TagsInput.displayName = "TagsInput";
