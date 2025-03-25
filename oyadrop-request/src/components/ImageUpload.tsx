
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  value: File | null;
  required?: boolean;
  error?: string;
  className?: string;
  multiple?: boolean;
  maxSize?: number; // In MB
}

const ImageUpload = ({
  label,
  onChange,
  value,
  required = false,
  error,
  className,
  multiple = false,
  maxSize = 5, // Default 5MB max size
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileSize = (file: File): boolean => {
    // Convert MB to bytes
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setSizeError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    setSizeError(null);
    return true;
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!validateFileSize(file)) {
        // If size validation fails, don't proceed
        return;
      }
      
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onChange(null);
      setPreview(null);
      setSizeError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={cn(
          "upload-zone transition-all duration-300",
          isDragging && "border-oyadrop bg-oyadrop-light/20",
          preview && "border-solid bg-muted/30",
          (error || sizeError) && "border-red-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*"
          className="hidden"
          multiple={multiple}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-md object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-oyadrop/10 p-3 rounded-full mb-3">
              <ImageIcon className="h-6 w-6 text-oyadrop" />
            </div>
            <p className="text-sm font-medium mb-1">Drag & drop an image here</p>
            <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
            <Button variant="outline" size="sm" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Max file size: {maxSize}MB</p>
          </div>
        )}
      </div>

      {(error || sizeError) && (
        <p className="text-red-500 text-xs mt-1">{error || sizeError}</p>
      )}
    </div>
  );
};

export default ImageUpload;
