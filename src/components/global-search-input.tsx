
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

type GlobalSearchInputProps = {
  onSearchChange: (query: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  suggestions: string[];
  placeholder: string;
  showBackdrop?: boolean;
};

export function GlobalSearchInput({
  onSearchChange,
  onSelectSuggestion,
  suggestions,
  placeholder,
  showBackdrop = true,
}: GlobalSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onSearchChange(newQuery);
  }

  const handleDismiss = () => {
    handleQueryChange('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelect = (itemName: string) => {
    onSelectSuggestion(itemName);
    handleDismiss();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex > -1 && suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      } else if (query) {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      handleDismiss();
    }
  };
  
  useEffect(() => {
    if (isFocused && query && suggestions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isFocused, query, suggestions.length]);
  
  useEffect(() => {
    if (highlightedIndex > -1) {
      const el = searchContainerRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (e.target instanceof HTMLInputElement) ||
        (e.target instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        inputRef.current?.focus();
        handleQueryChange(query + e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [query]);

  return (
    <>
      {isFocused && showBackdrop && (
        <div 
          onClick={handleDismiss}
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
        />
      )}
      <div className="relative z-50" ref={searchContainerRef}>
         <div className={cn(
             "relative transition-all duration-300 rounded-full",
             isFocused ? "shadow-2xl shadow-primary/40 scale-[1.01]" : "shadow-lg shadow-primary/5"
         )}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                handleQueryChange(e.target.value);
              }}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "text-lg h-16 pl-12 pr-5 rounded-full border-2 border-transparent transition-all duration-300",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/50",
                isFocused ? "bg-background" : "bg-background/60 backdrop-blur-xl"
              )}
            />
        </div>

        {isFocused && query && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-card border rounded-2xl shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-2">
              {suggestions.slice(0, 10).map((item, index) => (
                <li
                  key={item}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  onMouseOver={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-5 py-3 cursor-pointer text-base transition-colors",
                    highlightedIndex === index && 'bg-primary/10 text-primary'
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
