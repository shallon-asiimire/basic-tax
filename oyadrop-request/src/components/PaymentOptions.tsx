
import React from 'react';
import { Check, CreditCard, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentOption {
  id: 'pay_after' | 'pay_now';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PaymentOptionsProps {
  value: string;
  onChange: (value: string) => void;
  estimatedPrice: number | null;
  error?: string;
  className?: string;
}

const PaymentOptions = ({
  value,
  onChange,
  estimatedPrice,
  error,
  className,
}: PaymentOptionsProps) => {
  const options: PaymentOption[] = [
    {
      id: 'pay_after',
      title: 'Pay after pickup',
      description: 'Details will be sent to your email after submission',
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    },
    {
      id: 'pay_now',
      title: 'Pay right away',
      description: 'You will be redirected to Paystack to make payment',
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">
        Payment Option
      </label>

      {!estimatedPrice ? (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
          Enter pickup and drop-off addresses to calculate estimated price
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                "payment-option transition-all",
                value === option.id && "selected"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="shrink-0">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{option.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{option.description}</p>
                </div>
                <div className="shrink-0">
                  {value === option.id ? (
                    <div className="h-5 w-5 rounded-full bg-oyadrop flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default PaymentOptions;
