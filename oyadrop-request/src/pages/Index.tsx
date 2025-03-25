import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, MapPin, Clock, Phone, Mail, User, Package, AlertTriangle, MoveRight, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import AddressInput from '@/components/AddressInput';
import DateTimePicker from '@/components/DateTimePicker';
import ImageUpload from '@/components/ImageUpload';
import PaymentOptions from '@/components/PaymentOptions';
import WhatsAppSupport from '@/components/WhatsAppSupport';
import { formatPrice, estimatePrice } from '@/utils/priceCalculation';
import { sendDeliveryRequest } from '@/utils/emailService';
import { initializePaystackPayment, generatePaymentReference } from '@/utils/paystackIntegration';

// Define the form data interface
interface FormData {
  // Pickup details
  pickupName: string;
  pickupEmail: string;
  pickupAddress: string;
  pickupPhone: string;
  pickupDateTime: Date | null;
  
  // Additional pickup locations
  additionalPickups: Array<{
    name: string;
    address: string;
    phone: string;
    dateTime: Date | null;
  }>;
  
  // Dropoff details
  dropoffName: string;
  dropoffAddress: string;
  dropoffPhone: string;
  dropoffDateTime: Date | null;
  itemQuantity: string;
  itemImage: File | null;
  
  // Additional dropoffs
  additionalDropoffs: Array<{
    name: string;
    address: string;
    phone: string;
    itemQuantity: string;
    itemImage: File | null;
  }>;
  
  // Item details
  itemDescription: string;
  itemComments: string;
  referral: string;
  
  // Payment details
  paymentMethod: 'pay_after' | 'pay_now';
}

const Index = () => {
  // Form state
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      pickupName: '',
      pickupEmail: '',
      pickupAddress: '',
      pickupPhone: '',
      pickupDateTime: null,
      additionalPickups: [],
      dropoffName: '',
      dropoffAddress: '',
      dropoffPhone: '',
      dropoffDateTime: null,
      itemQuantity: '1',
      itemImage: null,
      additionalDropoffs: [],
      itemDescription: '',
      itemComments: '',
      referral: '',
      paymentMethod: 'pay_after',
    }
  });

  // Watch form values for conditional logic
  const watchPickupAddress = watch('pickupAddress');
  const watchDropoffAddress = watch('dropoffAddress');
  const watchPaymentMethod = watch('paymentMethod');
  
  // State for coordinates (for price calculation)
  const [coordinates, setCoordinates] = useState<{
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  }>({
    pickup: null,
    dropoff: null,
  });

  // State for estimated price
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  
  // Additional pickup/dropoff states
  const [showAdditionalPickups, setShowAdditionalPickups] = useState(false);
  const [showAdditionalDropoffs, setShowAdditionalDropoffs] = useState(false);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form ref for scrolling
  const formRef = useRef<HTMLDivElement>(null);

  // Calculate price when both addresses are available
  useEffect(() => {
    if (coordinates.pickup && coordinates.dropoff) {
      const price = estimatePrice(coordinates);
      setEstimatedPrice(price);
    } else {
      setEstimatedPrice(null);
    }
  }, [coordinates]);

  // Handle address selection with coordinates
  const handleAddressChange = (type: 'pickup' | 'dropoff', value: string, coords?: [number, number]) => {
    setValue(type === 'pickup' ? 'pickupAddress' : 'dropoffAddress', value);
    
    if (coords) {
      setCoordinates(prev => ({
        ...prev,
        [type]: coords
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File | null) => {
    setValue('itemImage', file);
  };

  const handleAdditionalDropoffImageUpload = (index: number, file: File | null) => {
    const currentDropoffs = [...watch('additionalDropoffs')];
    currentDropoffs[index].itemImage = file;
    setValue('additionalDropoffs', currentDropoffs);
  };

  // Add additional pickup
  const addPickup = () => {
    const currentPickups = watch('additionalPickups') || [];
    setValue('additionalPickups', [
      ...currentPickups,
      { name: '', address: '', phone: '', dateTime: null }
    ]);
    setShowAdditionalPickups(true);
  };

  // Remove additional pickup
  const removePickup = (index: number) => {
    const currentPickups = watch('additionalPickups') || [];
    setValue(
      'additionalPickups',
      currentPickups.filter((_, i) => i !== index)
    );
  };

  // Add additional dropoff
  const addDropoff = () => {
    const currentDropoffs = watch('additionalDropoffs') || [];
    setValue('additionalDropoffs', [
      ...currentDropoffs,
      { name: '', address: '', phone: '', itemQuantity: '1', itemImage: null }
    ]);
    setShowAdditionalDropoffs(true);
  };

  // Remove additional dropoff
  const removeDropoff = (index: number) => {
    const currentDropoffs = watch('additionalDropoffs') || [];
    setValue(
      'additionalDropoffs',
      currentDropoffs.filter((_, i) => i !== index)
    );
  };

  // Submit handler
  const onSubmit = async (data: FormData) => {
    // Validate essential data
    if (!coordinates.pickup || !coordinates.dropoff) {
      toast.error('Please select valid pickup and drop-off addresses');
      return;
    }

    if (!estimatedPrice) {
      toast.error('Unable to calculate price. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const formData = {
        ...data,
        coordinates,
        estimatedPrice,
      };

      // Handle payment method
      if (data.paymentMethod === 'pay_now') {
        // Initialize Paystack payment
        const reference = generatePaymentReference();
        
        initializePaystackPayment({
          amount: estimatedPrice,
          email: data.pickupEmail,
          reference,
          metadata: {
            pickupName: data.pickupName,
            dropoffName: data.dropoffName,
            pickupAddress: data.pickupAddress,
            dropoffAddress: data.dropoffAddress,
          },
          onSuccess: async () => {
            // Send delivery request after successful payment
            await sendDeliveryRequest(formData, () => {
              // Redirect to OyaDrop website after success
              window.location.href = 'https://www.oyadrop.com.ng';
            });
            setIsSubmitting(false);
          },
          onCancel: () => {
            setIsSubmitting(false);
          }
        });
      } else {
        // Send delivery request directly for pay-after-pickup
        await sendDeliveryRequest(formData, () => {
          // Redirect to OyaDrop website after success
          window.location.href = 'https://www.oyadrop.com.ng';
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while processing your request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-8 px-4 md:py-12">
      {/* WhatsApp Support Button */}
      <WhatsAppSupport 
        phoneNumber="2348123456789" // Replace with your actual WhatsApp number with country code
        message="Hello OyaDrop, I need help with my delivery request."
      />
      
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <Card className="mb-8 glass shadow-glass-lg overflow-hidden border-0">
          <div className="bg-gradient-to-br from-oyadrop-light to-oyadrop px-6 py-8 text-white">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 opacity-90">
                <img 
                  src="https://raw.githubusercontent.com/oyadrop/logoicons/main/YellowLogo.png" 
                  alt="OyaDrop Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">OyaDrop Request Form</h1>
              <p className="text-oyadrop-foreground/90 text-sm max-w-lg text-center">
                Fast and reliable delivery service. Fill the form below to place your request.
              </p>
            </div>
          </div>
        </Card>

        {/* Main Form */}
        <div ref={formRef}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Pickup Details Section */}
            <Card className="form-section overflow-hidden">
              <div className="bg-gradient-to-r from-oyadrop/10 to-transparent px-6 py-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Badge variant="outline" className="mr-2 bg-oyadrop/10 text-oyadrop border-0">1</Badge>
                  Pickup Details
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        {...register('pickupName', { required: 'Name is required' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Your name"
                      />
                    </div>
                    {errors.pickupName && (
                      <p className="text-red-500 text-xs mt-1">{errors.pickupName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        {...register('pickupEmail', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Your email"
                      />
                    </div>
                    {errors.pickupEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.pickupEmail.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <AddressInput
                      label="Pickup Address"
                      id="pickupAddress"
                      placeholder="Enter pickup address"
                      value={watchPickupAddress}
                      onChange={(value, coords) => handleAddressChange('pickup', value, coords)}
                      required
                      error={errors.pickupAddress?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border rounded-l-md border-r-0 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">+234</span>
                      </div>
                      <input
                        {...register('pickupPhone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\d{10}$/,
                            message: 'Enter a valid Nigerian phone number without the country code'
                          }
                        })}
                        type="tel"
                        className="flex-1 px-3 py-2 border rounded-r-md"
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.pickupPhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.pickupPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <DateTimePicker
                      label="Latest Pickup Date/Time"
                      value={watch('pickupDateTime')}
                      onChange={(date) => setValue('pickupDateTime', date || null)}
                      required
                      error={errors.pickupDateTime?.message}
                      minDate={new Date()}
                    />
                  </div>
                  
                  {/* Additional Pickups */}
                  {showAdditionalPickups && watch('additionalPickups')?.length > 0 && (
                    <div className="md:col-span-2 mt-2">
                      <div className="p-4 bg-muted/40 rounded-md">
                        <h3 className="text-sm font-medium mb-3">Additional Pickup Locations</h3>
                        <ScrollArea className="max-h-64">
                          {watch('additionalPickups').map((_, index) => (
                            <div key={index} className="mb-4 p-3 bg-white rounded-md shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">Pickup #{index + 2}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePickup(index)}
                                  className="h-7 w-7"
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Input
                                    {...register(`additionalPickups.${index}.name` as const, { 
                                      required: 'Name is required' 
                                    })}
                                    placeholder="Contact name at this location"
                                  />
                                </div>
                                <div>
                                  <AddressInput
                                    label=""
                                    id={`additionalPickups.${index}.address`}
                                    placeholder="Pickup address"
                                    value={watch(`additionalPickups.${index}.address` as const) || ''}
                                    onChange={(value) => setValue(`additionalPickups.${index}.address` as const, value)}
                                    showLabel={false}
                                  />
                                </div>
                                <div className="flex">
                                  <div className="bg-muted px-3 py-2 border rounded-l-md border-r-0 flex items-center">
                                    <span className="text-sm">+234</span>
                                  </div>
                                  <Input
                                    {...register(`additionalPickups.${index}.phone` as const, { 
                                      required: 'Phone is required',
                                      pattern: {
                                        value: /^\d{10}$/,
                                        message: 'Enter a valid Nigerian phone number'
                                      }
                                    })}
                                    type="tel"
                                    className="rounded-l-none"
                                    placeholder="Phone number"
                                  />
                                </div>
                                <div>
                                  <DateTimePicker
                                    label="Latest Pickup Date/Time"
                                    value={watch(`additionalPickups.${index}.dateTime` as const)}
                                    onChange={(date) => setValue(`additionalPickups.${index}.dateTime` as const, date || null)}
                                    minDate={new Date()}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center text-oyadrop"
                      onClick={addPickup}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add more pickup locations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Details Section */}
            <Card className="form-section overflow-hidden">
              <div className="bg-gradient-to-r from-oyadrop/10 to-transparent px-6 py-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Badge variant="outline" className="mr-2 bg-oyadrop/10 text-oyadrop border-0">2</Badge>
                  Drop-off Details
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Recipient's Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        {...register('dropoffName', { required: 'Recipient name is required' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Recipient's name"
                      />
                    </div>
                    {errors.dropoffName && (
                      <p className="text-red-500 text-xs mt-1">{errors.dropoffName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Recipient's Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border rounded-l-md border-r-0 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">+234</span>
                      </div>
                      <input
                        {...register('dropoffPhone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\d{10}$/,
                            message: 'Enter a valid Nigerian phone number without the country code'
                          }
                        })}
                        type="tel"
                        className="flex-1 px-3 py-2 border rounded-r-md"
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.dropoffPhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.dropoffPhone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <AddressInput
                      label="Drop-off Address"
                      id="dropoffAddress"
                      placeholder="Enter drop-off address"
                      value={watchDropoffAddress}
                      onChange={(value, coords) => handleAddressChange('dropoff', value, coords)}
                      required
                      error={errors.dropoffAddress?.message}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Item Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('itemQuantity', { 
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                    />
                    {errors.itemQuantity && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemQuantity.message}</p>
                    )}
                  </div>

                  <div>
                    <DateTimePicker
                      label="Latest Drop-off Date/Time"
                      value={watch('dropoffDateTime')}
                      onChange={(date) => setValue('dropoffDateTime', date || null)}
                      required
                      error={errors.dropoffDateTime?.message}
                      minDate={new Date()}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Upload Item Image"
                      value={watch('itemImage')}
                      onChange={handleImageUpload}
                      error={errors.itemImage?.message}
                      maxSize={10} // 10MB max file size
                    />
                  </div>

                  {/* Additional Dropoffs */}
                  {showAdditionalDropoffs && watch('additionalDropoffs')?.length > 0 && (
                    <div className="md:col-span-2 mt-2">
                      <div className="p-4 bg-muted/40 rounded-md">
                        <h3 className="text-sm font-medium mb-3">Additional Drop-offs</h3>
                        <ScrollArea className="max-h-64">
                          {watch('additionalDropoffs').map((_, index) => (
                            <div key={index} className="mb-4 p-3 bg-white rounded-md shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">Drop-off #{index + 2}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDropoff(index)}
                                  className="h-7 w-7"
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Input
                                    {...register(`additionalDropoffs.${index}.name` as const, { 
                                      required: 'Name is required' 
                                    })}
                                    placeholder="Recipient's name"
                                  />
                                </div>
                                <div>
                                  <AddressInput
                                    label=""
                                    id={`additionalDropoffs.${index}.address`}
                                    placeholder="Drop-off address"
                                    value={watch(`additionalDropoffs.${index}.address` as const) || ''}
                                    onChange={(value) => setValue(`additionalDropoffs.${index}.address` as const, value)}
                                    showLabel={false}
                                  />
                                </div>
                                <div className="flex">
                                  <div className="bg-muted px-3 py-2 border rounded-l-md border-r-0 flex items-center">
                                    <span className="text-sm">+234</span>
                                  </div>
                                  <Input
                                    {...register(`additionalDropoffs.${index}.phone` as const, { 
                                      required: 'Phone is required',
                                      pattern: {
                                        value: /^\d{10}$/,
                                        message: 'Enter a valid Nigerian phone number'
                                      }
                                    })}
                                    type="tel"
                                    className="rounded-l-none"
                                    placeholder="Phone number"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Item Quantity
                                  </label>
                                  <Input
                                    {...register(`additionalDropoffs.${index}.itemQuantity` as const, { 
                                      required: 'Quantity is required',
                                      min: { value: 1, message: 'Quantity must be at least 1' }
                                    })}
                                    type="number"
                                    min="1"
                                    placeholder="Enter quantity"
                                  />
                                </div>
                                <div>
                                  <ImageUpload
                                    label="Upload Item Image"
                                    value={watch(`additionalDropoffs.${index}.itemImage` as const)}
                                    onChange={(file) => handleAdditionalDropoffImageUpload(index, file)}
                                    maxSize={10} // 10MB max file size
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center text-oyadrop"
                      onClick={addDropoff}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add more Drop-off addresses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Section */}
            <Card className="form-section overflow-hidden">
              <div className="bg-gradient-to-r from-oyadrop/10 to-transparent px-6 py-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Badge variant="outline" className="mr-2 bg-oyadrop/10 text-oyadrop border-0">3</Badge>
                  Information
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Item for Pickup and Comments <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        {...register('itemDescription', { required: 'Item description is required' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md min-h-[100px]"
                        placeholder="Describe the item(s) to be picked up"
                      />
                    </div>
                    {errors.itemDescription && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemDescription.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Comments
                    </label>
                    <Textarea
                      {...register('itemComments')}
                      className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                      placeholder="Any special instructions or additional information"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Who referred you?
                    </label>
                    <input
                      {...register('referral')}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Payment Section */}
            <Card className="form-section overflow-hidden">
              <div className="bg-gradient-to-r from-oyadrop/10 to-transparent px-6 py-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Badge variant="outline" className="mr-2 bg-oyadrop/10 text-oyadrop border-0">4</Badge>
                  Pricing & Payment
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estimated Price
                    </label>
                    <div className="bg-muted/40 rounded-md p-4 flex items-center justify-between">
                      {!estimatedPrice ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                          Enter pickup and drop-off addresses to calculate
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">Based on distance between locations:</span>
                          <span className="text-lg font-bold text-oyadrop">
                            {formatPrice(estimatedPrice)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <PaymentOptions
                      value={watchPaymentMethod}
                      onChange={(value) => setValue('paymentMethod', value as 'pay_after' | 'pay_now')}
                      estimatedPrice={estimatedPrice}
                      error={errors.paymentMethod?.message}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-oyadrop hover:bg-oyadrop-dark text-white px-6 py-2 rounded-md transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Submit Request
                          <MoveRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OyaDrop. All rights reserved.</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="glass rounded-lg p-6 flex flex-col items-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-foreground font-medium">Processing your request...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
