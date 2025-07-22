
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

type AddItemSearchProps = {
  onAddItem: (itemName: string) => void;
  popularItems: string[];
  existingItems: string[];
};

export function AddItemSearch({ onAddItem, popularItems, existingItems }: AddItemSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchPool = useMemo(() => {
    // Combine popular items and existing items, ensuring no duplicates.
    const combined = new Set([...popularItems, ...existingItems]);
    return Array.from(combined);
  }, [popularItems, existingItems]);

  const fuse = useMemo(() => {
    return new Fuse(searchPool, {
      includeScore: true,
      threshold: 0.4,
    });
  }, [searchPool]);

  const searchResults = useMemo(() => {
    if (!query) return [];
    
    // Prioritize exact matches and then fuzzy search results
    const exactMatch = searchPool.find(item => item.toLowerCase() === query.toLowerCase());
    const fuseResults = fuse.search(query).map(result => result.item);
    
    // Combine and remove duplicates
    const results = [...(exactMatch ? [exactMatch] : []), ...fuseResults];
    const uniqueResults = Array.from(new Set(results));
    
    return uniqueResults;
  }, [query, fuse, searchPool]);

  const handleDismiss = () => {
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelect = (itemName: string) => {
    onAddItem(itemName);
    handleDismiss();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchResults.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex > -1 && searchResults[highlightedIndex]) {
        handleSelect(searchResults[highlightedIndex]);
      } else if (query) {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      handleDismiss();
    }
  };
  
  // Effect to manage highlighted index
  useEffect(() => {
    if (isFocused && query && searchResults.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isFocused, query, searchResults.length]);
  
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
        setQuery((q) => q + e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <>
      {isFocused && (
        <div 
          onClick={handleDismiss}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
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
              placeholder="Search to add an item..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
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

        {isFocused && query && (
          <div className="absolute z-50 w-full mt-2 bg-card border rounded-2xl shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-2">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((item, index) => (
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
                ))
              ) : (
                 <li className="px-5 py-4 text-muted-foreground text-sm text-center">
                  No items match your search.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
