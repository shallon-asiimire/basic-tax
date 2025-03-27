import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

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
  city?: string;
  state?: string;
}

const OSM_API_KEY = "c3d946fb64624c37bb37cb0bc770043d";

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
  // Add new state for input status
  const [inputStatus, setInputStatus] = useState<'idle' | 'typing' | 'valid' | 'invalid'>('idle');
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

  //close suggestion when scroll outside
  useEffect(() => {
    const handleScroll = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Lock body scroll when suggestions are shown
  useEffect(() => {
    if (showSuggestions && suggestionRef.current) {
      disableBodyScroll(suggestionRef.current);
    } else {
      enableBodyScroll(suggestionRef.current);
    }

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [showSuggestions]);

  // Update fetchSuggestions to handle status
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setInputStatus('typing');
      return;
    }

    setIsLoading(true);
    setInputStatus('typing');

    try {
      // Updated API call with Nigeria filter
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:ng&limit=5&apiKey=${OSM_API_KEY}`
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const addressSuggestions = data.features.map((feature: any) => ({
          place_id: feature.properties.place_id || Math.random().toString(36).substring(7),
          display_name: feature.properties.formatted || feature.properties.name,
          lat: feature.properties.lat || feature.geometry.coordinates[1],
          lon: feature.properties.lon || feature.geometry.coordinates[0],
          city: feature.properties.city,
          state: feature.properties.state,
        }));

        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
        setInputStatus('valid');
      } else {
        setSuggestions([]);
        setInputStatus('invalid');
        toast?.error('No Nigerian address found. Please try a different search.');
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setInputStatus('invalid');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };

  // Update handleSelectSuggestion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.display_name);
    setInputStatus('valid');
    onChange(suggestion.display_name, [parseFloat(suggestion.lon), parseFloat(suggestion.lat)]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Replace the Input component JSX with this updated version
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
        <MapPin className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
          {
            'text-muted-foreground': inputStatus === 'idle',
            'text-orange-500': inputStatus === 'typing',
            'text-green-500': inputStatus === 'valid',
            'text-red-500': inputStatus === 'invalid'
          }
        )} />
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            handleInputChange(e);
            setInputStatus(e.target.value.length >= 3 ? 'typing' : 'idle');
          }}
          onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn(
            "pl-10 transition-colors",
            {
              'border-border': inputStatus === 'idle',
              'border-orange-500 focus:border-orange-500 focus:ring-orange-500/20': inputStatus === 'typing',
              'border-green-500 focus:border-green-500 focus:ring-green-500/20': inputStatus === 'valid',
              'border-red-500 focus:border-red-500 focus:ring-red-500/20': inputStatus === 'invalid' || error
            }
          )}
          aria-invalid={!!error || inputStatus === 'invalid'}
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-oyadrop/30 border-t-oyadrop rounded-full animate-spin"></div>
          </div>
        ) : inputStatus === 'valid' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className=" w-full mt-1 bg-white border rounded-md shadow-lg animate-fade-in-up max-h-60 overflow-y-auto "
        >
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id + suggestion.display_name}
                className="px-3 py-2 hover:bg-oyadrop/10 cursor-pointer text-sm transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{suggestion.display_name}</span>
                  {(suggestion.city || suggestion.state) && (
                    <span className="text-xs text-muted-foreground">
                      {[suggestion.city, suggestion.state].filter(Boolean).join(', ')}, Nigeria
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddressInput;
