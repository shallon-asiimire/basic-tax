import { toast } from "sonner";
import { createEmailTemplate } from "./createEmailTemplate";

// Declare EmailJS types
declare global {
  interface Window {
    emailjs: {
      init: (publicKey: string) => void;
      send: (
        serviceId: string,
        templateId: string,
        templateParams: any
      ) => Promise<any>;
    };
  }
}

interface DeliveryFormData {
  // Pickup details
  pickupName: string;
  pickupEmail: string;
  pickupAddress: string;
  pickupPhone: string;
  pickupDateTime: Date | null;

  // Dropoff details
  dropoffName: string;
  dropoffAddress: string;
  dropoffPhone: string;
  dropoffDateTime: Date | null;
  itemQuantity: string;
  itemImage?: File | string | null;

  // Additional dropoffs (if any)
  additionalDropoffs?: Array<{
    name: string;
    address: string;
    phone: string;
    itemQuantity: string;
    itemImage?: File | string | null;
  }>;

  // Item details
  itemDescription: string;
  itemComments?: string;
  referral?: string;

  // Payment details
  estimatedPrice: number | null;
  paymentMethod: "pay_after" | "pay_now";

  // Coordinates for distance calculation
  coordinates: {
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  };
}

/**
 * Load EmailJS script dynamically
 */
const loadEmailJSScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load EmailJS script"));
    document.body.appendChild(script);
  });
};

export async function sendDeliveryRequest(
  formData: DeliveryFormData,
  onSuccess: () => void
): Promise<boolean> {
  try {
    // Load EmailJS script if not already loaded
    await loadEmailJSScript();

    // Initialize EmailJS
    window.emailjs.init("Pkg3Whydu7HTFp47R");

    // Process images to base64
    const processedData = { ...formData };

    if (formData.itemImage instanceof File) {
      processedData.itemImage = await convertFileToBase64(formData.itemImage);
    }

    if (formData.additionalDropoffs?.length) {
      processedData.additionalDropoffs = await Promise.all(
        formData.additionalDropoffs.map(async (dropoff) => ({
          ...dropoff,
          itemImage:
            dropoff.itemImage instanceof File
              ? await convertFileToBase64(dropoff.itemImage)
              : null,
        }))
      );
    }

    // Generate HTML email content
    const htmlContent = createEmailTemplate(processedData);

    // Send email using EmailJS
    const response = await window.emailjs.send(
      "service_e4w9w3h",
      "template_tunqxci",
      {
        to_email: "team@oyadrop.com.ng",
        from_name: formData.pickupName,
        from_email: formData.pickupEmail,
        subject: `New Delivery Request - ${formData.pickupName}`,
        html_content: htmlContent,
      }
    );
    console.log("🚀 ~ response:", response);

    if (response.status === 200) {
      toast.success("Delivery request submitted successfully");
      onSuccess();
      return true;
    }

    throw new Error("Failed to send email");
  } catch (error) {
    console.error("Error sending delivery request:", error);
    if (error.status === 413) {
      toast.error("The image is to large reduce the file");
    } else {
      toast.error("Failed to submit delivery request. Please try again.");
    }
    return false;
  }
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
