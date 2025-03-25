
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  required?: boolean;
  error?: string;
  minDate?: Date;
  className?: string;
}

const DateTimePicker = ({
  label,
  value,
  onChange,
  required = false,
  error,
  minDate = new Date(),
  className,
}: DateTimePickerProps) => {
  const [time, setTime] = useState<string>(
    value ? format(value, 'HH:mm') : '12:00'
  );

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    // Combine the date with the current time value
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateChange}
              disabled={(date) => date < minDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className={cn(
              "pl-10 pr-3 py-2 w-32 border rounded-md focus:ring-2 focus:ring-oyadrop/50 transition-all",
              error ? "border-red-500" : "border-border"
            )}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DateTimePicker;
