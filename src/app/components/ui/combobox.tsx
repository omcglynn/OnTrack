import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';

export interface ComboboxOption {
  /** Stable unique identifier (use your DB uuid/string id) */
  id: string;
  /** What gets displayed */
  label: string;
  /** Extra searchable strings (aliases, acronyms, etc.) */
  searchTerms?: string[];
}

interface ComboboxProps {
  options: ComboboxOption[];
  /** Selected option id */
  value?: string;
  /** Called with selected option id (or '' if cleared) */
  onValueChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Allow clicking the selected item to clear */
  allowClear?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  allowClear = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.id;

                // cmdk uses `value` for selection + filtering; keep it stable and unique.
                // Include label/searchTerms to make search work well.
                const cmdkValue = [
                  option.id,
                  option.label,
                  ...(option.searchTerms ?? []),
                ]
                  .filter(Boolean)
                  .join(' | ');

                return (
                  <CommandItem
                    key={option.id} // ALWAYS unique
                    value={cmdkValue}
                    keywords={option.searchTerms}
                    onSelect={() => {
                      if (allowClear && isSelected) onValueChange('');
                      else onValueChange(option.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
