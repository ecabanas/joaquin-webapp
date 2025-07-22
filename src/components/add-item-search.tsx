
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import { Button } from './ui/button';

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
  
  const canAddItem = query.trim().length > 0 && !searchResults.includes(query.trim());

  const handleSelect = (itemName: string) => {
    onAddItem(itemName);
    setQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
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
      } else if (query.trim()) {
        handleSelect(query.trim());
      }
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

  return (
    <div className="relative" ref={searchContainerRef}>
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Add an item..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(-1); // Reset highlight on new typing
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="text-lg h-14 pl-10 pr-12"
          />
          {canAddItem && (
            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10" onClick={() => handleSelect(query.trim())}>
              <Plus className="h-5 w-5" />
            </Button>
          )}
      </div>

      {isFocused && query && (
        <div className="absolute z-10 w-full mt-2 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {searchResults.length > 0 ? (
              searchResults.slice(0, 10).map((item, index) => (
                <li
                  key={item}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  onMouseOver={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-4 py-2.5 cursor-pointer text-base",
                    highlightedIndex === index && 'bg-accent'
                  )}
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="px-4 py-2.5 text-muted-foreground text-sm">
                No matches found. You can still add it.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
