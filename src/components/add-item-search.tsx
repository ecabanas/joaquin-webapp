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
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => {
    return new Fuse(popularItems, {
      includeScore: true,
      threshold: 0.4,
    });
  }, [popularItems]);

  const searchResults = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(result => result.item);
  }, [query, fuse]);

  const handleSelect = (itemName: string) => {
    onAddItem(itemName);
    setQuery('');
  };
  
  const handleAddNew = () => {
    if (query.trim()) {
        onAddItem(query.trim());
        setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNew();
    }
  };

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
          placeholder="Search or type to add an item..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="text-base"
        />
        <Button onClick={handleAddNew} disabled={!query.trim()} size="icon" aria-label="Add item">
            <PlusCircle />
        </Button>
      </div>

      {isFocused && query && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {searchResults.length > 0 ? (
              searchResults.slice(0, 10).map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 cursor-pointer hover:bg-accent"
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-muted-foreground text-sm">
                No popular matches. Press Enter or the add button to create "{query}".
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
