import { forwardRef, type MouseEvent, useContext, useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import get from "lodash/get";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button, Calendar, cn, Popover, PopoverContent, PopoverTrigger, Select } from "@meta-1/design";
import { UIXContext } from "@meta-1/design/components/uix/config-provider";

export type DatePickerProps = {
  placeholder?: string;
  format?: string;
  preset?: boolean;
  className?: string;
  allowClear?: boolean;
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>((props, _ref) => {
  const {
    placeholder,
    format: formatProp,
    preset = false,
    allowClear = false,
    className,
    value,
    onChange,
    open,
    onOpenChange,
  } = props;

  const hasValueProp = Object.hasOwn(props, "value");
  const isValueControlled = hasValueProp;
  const [internalDate, setInternalDate] = useState<Date | undefined>(value);
  const [presetValue, setPresetValue] = useState<string>("");
  const hasOpenProp = Object.hasOwn(props, "open");
  const isOpenControlled = hasOpenProp;
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (isValueControlled) {
      setInternalDate(value);
    }
  }, [isValueControlled, value]);

  useEffect(() => {
    if (isOpenControlled) {
      setInternalOpen(Boolean(open));
    }
  }, [isOpenControlled, open]);

  const config = useContext(UIXContext);
  const locale = get(config.locale, "DatePicker.locale");
  const formatConfig = formatProp || get(config.locale, "DatePicker.format") || "yyyy-MM-dd";
  const options = get(config.locale, "DatePicker.options");
  const selectedDate = isValueControlled ? value : internalDate;
  const popoverOpen = isOpenControlled ? open : internalOpen;

  const closePopover = () => {
    if (!isOpenControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  };

  const handleSelect = (nextDate?: Date) => {
    if (!nextDate) {
      return;
    }
    if (!isValueControlled) {
      setInternalDate(nextDate);
    }
    setPresetValue("");
    onChange?.(nextDate);
    closePopover();
  };

  const handlePresetChange = (valueStr: string) => {
    setPresetValue(valueStr);
    const offset = Number.parseInt(valueStr, 10);
    if (Number.isNaN(offset)) {
      if (!isValueControlled) {
        setInternalDate(undefined);
      }
      onChange?.(undefined);
      return;
    }
    const nextDate = addDays(new Date(), offset);
    if (!isValueControlled) {
      setInternalDate(nextDate);
    }
    onChange?.(nextDate);
    closePopover();
  };

  const handleClear = (event: MouseEvent<SVGSVGElement | HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isValueControlled) {
      setInternalDate(undefined);
    }
    setPresetValue("");
    onChange?.(undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!isOpenControlled) {
      setInternalOpen(nextOpen);
    }
  };

  const calendar = <Calendar locale={locale} mode="single" onSelect={handleSelect} selected={selectedDate} />;

  return (
    <Popover onOpenChange={handleOpenChange} open={popoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "group w-full justify-start space-x-1 text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1">{selectedDate ? format(selectedDate, formatConfig) : placeholder}</span>
          {allowClear && selectedDate ? (
            <span
              aria-label="Clear date"
              className="hidden cursor-pointer items-center justify-center group-hover:flex"
              onClick={handleClear}
              onPointerDown={(pointerEvent) => {
                pointerEvent.preventDefault();
                pointerEvent.stopPropagation();
              }}
              role="button"
              tabIndex={-1}
            >
              <Cross2Icon />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("flex w-fit", preset ? "flex-col space-y-2 p-2" : "p-0")}>
        {preset ? (
          <>
            <Select
              className="w-full"
              onChange={handlePresetChange}
              options={options || []}
              placeholder="请选择"
              value={presetValue}
            />
            <div className="rounded-md border">{calendar}</div>
          </>
        ) : (
          calendar
        )}
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = "DatePicker";
