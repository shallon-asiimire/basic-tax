
import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface AddressInputProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  required?: boolean;
  error?: string;
  className?: string;
  showLabel?: boolean;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const OSM_API_KEY = "KeGDqW3pztpWqZerbhM3L60BCaJZl2_fgMEdBrNGOho";

const AddressInput = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className,
  showLabel = true,
}: AddressInputProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle debounced input change
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${OSM_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (data && data.features) {
        const addressSuggestions = data.features.map((feature: any) => ({
          place_id: feature.properties.place_id || Math.random().toString(36).substring(7),
          display_name: feature.properties.formatted || feature.properties.name,
          lat: feature.properties.lat || feature.geometry.coordinates[1],
          lon: feature.properties.lon || feature.geometry.coordinates[0]
        }));
        
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name, [parseFloat(suggestion.lon), parseFloat(suggestion.lat)]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("relative space-y-2", className)}>
      {showLabel && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-foreground"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn(
            "pl-10",
            error ? "border-red-500" : "border-border"
          )}
          aria-invalid={!!error}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-oyadrop/30 border-t-oyadrop rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg animate-fade-in-up max-h-60 overflow-y-auto"
        >
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.place_id}
                className="px-3 py-2 hover:bg-oyadrop/10 cursor-pointer text-sm transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddressInput;
