
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AddItemSearchProps = {
  onAddItem: (itemName: string) => void;
  popularItems: string[];
};

export function AddItemSearch({ onAddItem, popularItems }: AddItemSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => {
    return new Fuse(popularItems, {
      includeScore: true,
      threshold: 0.4,
    });
  }, [popularItems]);

  const searchResults = useMemo(() => {
    if (!query) {
      setHighlightedIndex(-1);
      return [];
    };
    const results = fuse.search(query).map(result => result.item);
    // Reset highlight when results change but not when navigating
    if (highlightedIndex >= results.length) {
      setHighlightedIndex(-1);
    }
    return results;
  }, [query, fuse]);

  const handleSelect = (itemName: string) => {
    onAddItem(itemName);
    setQuery('');
    setHighlightedIndex(-1);
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
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
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
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search items to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="text-base"
        />
      </div>

      {isFocused && query && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {searchResults.length > 0 ? (
              searchResults.slice(0, 10).map((item, index) => (
                <li
                  key={index}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  onMouseOver={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-4 py-2 cursor-pointer",
                    highlightedIndex === index && 'bg-accent'
                  )}
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-muted-foreground text-sm">
                No matches found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
