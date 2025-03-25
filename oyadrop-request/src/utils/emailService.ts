
import { toast } from "sonner";

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
  itemImage?: File | null;
  
  // Additional dropoffs (if any)
  additionalDropoffs?: Array<{
    name: string;
    address: string;
    phone: string;
    itemQuantity: string;
    itemImage?: File | null;
  }>;
  
  // Item details
  itemDescription: string;
  itemComments?: string;
  referral?: string;
  
  // Payment details
  estimatedPrice: number | null;
  paymentMethod: 'pay_after' | 'pay_now';
  
  // Coordinates for distance calculation
  coordinates: {
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  };
}

/**
 * Sends the delivery request data to the server
 * This function simulates sending an email by logging to console
 * In production, this would make an API call to a server endpoint
 */
export async function sendDeliveryRequest(
  formData: DeliveryFormData,
  onSuccess: () => void
): Promise<boolean> {
  console.log("Sending delivery request with data:", formData);
  
  // In a real implementation, you would use an API endpoint
  try {
    // Create a FormData object to send the form data including the image file
    const data = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'itemImage' && value instanceof File) {
        data.append('itemImage', value);
      } else if (key === 'additionalDropoffs') {
        // For additionalDropoffs with item images, we need special handling
        if (value && Array.isArray(value)) {
          // First append the non-file data as JSON
          const dropoffsWithoutImages = value.map(dropoff => {
            const { itemImage, ...rest } = dropoff;
            return rest;
          });
          data.append('additionalDropoffsData', JSON.stringify(dropoffsWithoutImages));
          
          // Then append each file separately with a unique key
          value.forEach((dropoff, index) => {
            if (dropoff.itemImage instanceof File) {
              data.append(`additionalDropoffImage_${index}`, dropoff.itemImage);
            }
          });
        }
      } else if (key === 'coordinates') {
        data.append('coordinates', JSON.stringify(value));
      } else if (key === 'pickupDateTime' || key === 'dropoffDateTime') {
        data.append(key, value ? value.toISOString() : '');
      } else {
        data.append(key, String(value));
      }
    });

    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log the data that would be sent to server
    console.log("Email would be sent to: team@oyadrop.com.ng");
    console.log("Form data processed:", Object.fromEntries(data));
    
    // Show success message
    toast.success("Delivery request submitted successfully");
    onSuccess();
    
    return true;
  } catch (error) {
    console.error("Error sending delivery request:", error);
    toast.error("Failed to submit delivery request. Please try again.");
    return false;
  }
}
