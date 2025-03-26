import { toast } from "sonner";

// Declare Paystack types for TypeScript
declare global {
  interface Window {
    PaystackPop: new () => {
      newTransaction: (config: PaystackConfig) => Promise<void>;
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  metadata: Record<string, any>;
  onSuccess: (transaction: PaystackTransaction) => void;
  onLoad: () => void;
  onCancel: () => void;
  onError: (error: Error) => void;
}

interface PaystackTransaction {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

interface PaystackPaymentProps {
  amount: number;
  email: string;
  reference: string;
  metadata: Record<string, any>;
  onSuccess: (transaction: PaystackTransaction) => void;
  onCancel: () => void;
}

const PAYSTACK_PUBLIC_KEY = "pk_test_10e221b1e1fdfa7c5574781b3af64fa237411379";

/**
 * Initialize Paystack payment using V2 API
 */
export async function initializePaystackPayment({
  amount,
  email,
  reference,
  metadata,
  onSuccess,
  onCancel,
}: PaystackPaymentProps): Promise<void> {
  try {
    // Load Paystack V2 script if not already loaded
    if (!window.PaystackPop) {
      await loadPaystackScript();
    }

    const popup = new window.PaystackPop();

    await popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to kobo
      currency: "NGN",
      reference,
      metadata,
      onSuccess: (transaction: PaystackTransaction) => {
        console.log("Payment successful. Reference:", transaction.reference);
        toast.success("Payment successful!");
        onSuccess(transaction);
      },
      onLoad: () => {
        console.log("Payment modal loaded successfully");
      },
      onCancel: () => {
        console.log("Payment cancelled by user");
        toast.info("Payment cancelled.");
        onCancel();
      },
      onError: (error: Error) => {
        console.error("Payment error:", error);
        toast.error("Payment failed. Please try again.");
        onCancel();
      },
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    toast.error("Failed to initialize payment. Please try again.");
    onCancel();
  }
}

/**
 * Load Paystack V2 script
 */
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.body.appendChild(script);
  });
}

/**
 * Generate a unique reference for Paystack payment
 */
export function generatePaymentReference(): string {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `OYADROP-${timestamp}-${random}`;
}
