import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

import { Control, FieldValues, Path } from "react-hook-form";

type DatePickerInputProps<T extends FieldValues, N extends Path<T>> = {
  control: Control<T>;
  name: N;
};

const DatePickerInput = <T extends FieldValues, N extends Path<T>>({
  control,
  name,
}: DatePickerInputProps<T, N>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <>
          <FormLabel className="form-label">Date</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {field.value ? (
                    new Date(field.value).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? date.toISOString() : "");
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage className="form-message" />
        </>
      )}
    />
  );
};

export default DatePickerInput;
