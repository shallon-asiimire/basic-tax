import { Input } from "@/components/ui/input";
import { User, Mail, Phone } from "lucide-react";
import { UseFormRegister, FieldValues, RegisterOptions, FieldError } from "react-hook-form";

interface InputFieldProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    register: UseFormRegister<FieldValues>;
    rules?: RegisterOptions;
    error?: FieldError;
    icon?: "user" | "mail" | "phone";
    required?: boolean;
}

export const InputField = ({
    name,
    label,
    type = "text",
    placeholder,
    register,
    rules,
    error,
    icon,
    required,
}: InputFieldProps) => {
    const icons = {
        user: <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />,
        mail: <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />,
        phone: <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />,
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && icons[icon]}
                <Input
                    {...register(name, rules)}
                    type={type}
                    className={`w-full ${icon ? "pl-10" : "px-3"} py-2 border rounded-md`}
                    placeholder={placeholder}
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