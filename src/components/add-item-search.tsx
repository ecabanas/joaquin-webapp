
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
    
    if (highlightedIndex >= uniqueResults.length) {
      setHighlightedIndex(-1);
    }
    return uniqueResults;
  }, [query, fuse, searchPool, highlightedIndex]);

  const handleSelect = (itemName: string) => {
    onAddItem(itemName);
    setQuery('');
    setHighlightedIndex(-1);
    setIsFocused(false);
    inputRef.current?.blur();
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
      } else if (searchResults.length > 0) {
        // If the user presses Enter and there are results, but none are highlighted,
        // add the first item from the results.
        handleSelect(searchResults[0]);
      }
      // If there are no search results, do nothing. This prevents adding new items.
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    }
  };
  
  useEffect(() => {
    if (highlightedIndex > -1) {
      const el = searchContainerRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    if (!isFocused) {
      setQuery('');
    }
  }, [isFocused]);


  return (
    <div className="relative" ref={searchContainerRef}>
      {isFocused && (
         <div className="fixed inset-0 bg-black/10 z-40 transition-opacity animate-in fade-in-0" />
       )}
       <div className={cn(
           "relative transition-all duration-300 rounded-full z-50",
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
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              "text-lg h-16 pl-12 pr-5 rounded-full border-2 border-transparent transition-all duration-300",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/50",
              "bg-background/60 backdrop-blur-xl",
              isFocused ? "bg-background/80" : "bg-background/60"
            )}
          />
      </div>

      {isFocused && query && (
        <div className="absolute z-50 w-full mt-2 bg-card/80 backdrop-blur-xl border rounded-2xl shadow-lg max-h-60 overflow-y-auto">
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
  );
}
