import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { UseFormRegister, RegisterOptions, FieldError, FieldValue, FieldValues } from "react-hook-form";

interface PhoneInputProps {
    name: string;
    label: string;
    register: UseFormRegister<FieldValues>;
    rules?: RegisterOptions;
    error?: FieldError;
    required?: boolean;
}

export const PhoneInput = ({
    name,
    label,
    register,
    rules,
    error,
    required,
}: PhoneInputProps) => {
    const defaultRules = {
        required: required ? "Phone number is required" : false,
        pattern: {
            value: /^[0-9]{10,11}$/,
            message: "Enter a valid Nigerian phone number (10-11 digits)",
        },
        validate: (value: string) => {
            if (value.startsWith("0")) {
                return value.length === 11 || "Invalid number format";
            }
            return value.length === 10 || "Invalid number format";
        },
        ...rules,
    } as RegisterOptions<any, string>;

    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex">
                <div className="bg-muted px-3 py-2 border rounded-l-md border-r-0 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">+234</span>
                </div>
                <Input
                    {...register(name, defaultRules)}
                    type="tel"
                    className="flex-1 rounded-l-none"
                    placeholder="Phone number"
                    aria-invalid={error ? "true" : "false"}
                />
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                    {error.message}
                </p>
            )}
        </div>
    );
};