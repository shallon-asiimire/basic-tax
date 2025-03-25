
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppSupportProps {
  phoneNumber: string;
  message?: string;
  className?: string;
}

const WhatsAppSupport = ({
  phoneNumber,
  message = "Hello, I need assistance with my delivery request.",
  className
}: WhatsAppSupportProps) => {
  // Format phone number by removing any non-digit characters
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="bg-white/90 backdrop-blur-sm text-oyadrop rounded-lg px-3 py-1 text-sm font-medium shadow-sm">
        Having challenges? Talk to us
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all flex items-center justify-center",
          className
        )}
        aria-label="Contact Support via WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
};

export default WhatsAppSupport;
