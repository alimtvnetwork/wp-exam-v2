import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface CountryInfo {
  code: string; // ISO 2-letter
  name: string;
  dialCode: string;
  flag: string;
  formatPlaceholder: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', formatPlaceholder: '1712345678' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', formatPlaceholder: '2025550143' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', formatPlaceholder: '7911123456' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', formatPlaceholder: '4165550199' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', formatPlaceholder: '412345678' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', formatPlaceholder: '15112345678' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', formatPlaceholder: '9876543210' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', formatPlaceholder: '81234567' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', formatPlaceholder: '501234567' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', formatPlaceholder: '123456789' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', formatPlaceholder: '3001234567' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', formatPlaceholder: '612345678' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', formatPlaceholder: '9012345678' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', formatPlaceholder: '11987654321' },
];

export interface PhoneWithCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const PhoneWithCountrySelect: React.FC<PhoneWithCountrySelectProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}) => {
  // Parse dial code and national number from initial value
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    if (value) {
      const match = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (match) {
        return match;
      }
    }
    return COUNTRIES[0]; // Default to Bangladesh (+880) as requested in screenshot
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract national number without the dial code
  const nationalNumber = useMemo(() => {
    if (!value) return '';
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.slice(selectedCountry.dialCode.length).trim();
    }
    return value.replace(/^\+?[0-9]{1,4}\s?/, '').trim();
  }, [value, selectedCountry]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectCountry = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const newCombined = nationalNumber ? `${country.dialCode} ${nationalNumber}` : `${country.dialCode} `;
    onChange(newCombined);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers, spaces, and hyphens
    const cleanDigits = e.target.value.replace(/[^0-9\s-]/g, '');
    const combined = cleanDigits ? `${selectedCountry.dialCode} ${cleanDigits.trim()}` : '';
    onChange(combined);
  };

  return (
    <div className={cn('flex items-center rounded-xl border border-input bg-background shadow-2xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-150', className)}>
      {/* Country Selector Popover Trigger */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-10 px-3 flex items-center gap-1.5 rounded-l-xl border-r border-input bg-muted/30 hover:bg-accent/40 font-semibold text-sm shrink-0 cursor-pointer"
            title="Select country dialing code"
          >
            <span className="font-mono text-xs font-bold text-foreground">{selectedCountry.code}</span>
            <span className="text-foreground text-xs font-medium hidden sm:inline max-w-[90px] truncate">
              {selectedCountry.name}
            </span>
            <span className="text-muted-foreground text-xs font-mono">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-0.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-72 p-2 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-50 space-y-2"
        >
          {/* Quick Country Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="h-8 pl-8 text-xs bg-muted/40 border-border"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
            {filteredCountries.map((country) => {
              const isSelected = country.code === selectedCountry.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                    isSelected
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold text-muted-foreground w-6 shrink-0">
                      {country.code}
                    </span>
                    <span className="truncate">{country.name}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 ml-2">
                    ({country.dialCode})
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <div className="relative flex-1">
        <Input
          type="tel"
          value={nationalNumber}
          onChange={handleNumberChange}
          disabled={disabled}
          placeholder={placeholder || selectedCountry.formatPlaceholder}
          className="h-10 border-0 rounded-l-none rounded-r-xl bg-transparent text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-foreground"
        />
      </div>
    </div>
  );
};
