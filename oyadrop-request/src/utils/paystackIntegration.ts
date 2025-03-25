import { toast } from "sonner";

// Paystack public key should be the test key in development
const PAYSTACK_PUBLIC_KEY = "pk_test_5ef0fbd0bc8ae14e952c7abf7a5725c49e481f2b"; // Use this for frontend

interface PaystackPaymentProps {
  amount: number;
  email: string;
  reference: string;
  metadata: Record<string, any>;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Initialize Paystack payment
 */
export function initializePaystackPayment({
  amount,
  email,
  reference,
  metadata,
  onSuccess,
  onCancel
}: PaystackPaymentProps): void {
  // Load Paystack inline script if it's not already loaded
  const loadPaystackScript = () => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      initializePayment();
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please try again.");
      onCancel();
    };
    document.body.appendChild(script);
  };

  // Initialize payment once script is loaded
  const initializePayment = () => {
    // Check if PaystackPop is defined
    if ((window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo (100 kobo = 1 Naira)
        currency: 'NGN',
        ref: reference,
        metadata: metadata,
        callback: (response: any) => {
          console.log("Payment successful. Reference:", response.reference);
          toast.success("Payment successful!");
          onSuccess();
        },
        onClose: () => {
          console.log("Payment window closed");
          toast.info("Payment cancelled.");
          onCancel();
        },
      });
      
      handler.openIframe();
    } else {
      toast.error("Payment gateway not available. Please try again later.");
      onCancel();
    }
  };

  // Check if Paystack script is already loaded
  if ((window as any).PaystackPop) {
    initializePayment();
  } else {
    loadPaystackScript();
  }
}

/**
 * Generate a unique reference for Paystack payment
 */
export function generatePaymentReference(): string {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `OYADROP-${timestamp}-${random}`;
}
