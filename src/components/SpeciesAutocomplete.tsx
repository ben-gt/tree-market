"use client";

import { useState, useEffect, useRef } from "react";

interface SpeciesSuggestion {
  scientificName: string;
  commonName: string | null;
  rank: string | null;
}

interface SpeciesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

export default function SpeciesAutocomplete({
  value,
  onChange,
  id = "species",
  name = "species",
  required = false,
  placeholder = "Start typing to search species...",
}: SpeciesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<SpeciesSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/species/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setIsOpen(data.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (error) {
        console.error("Failed to fetch species:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
  };

  const handleSelect = (suggestion: SpeciesSuggestion) => {
    const displayValue = suggestion.commonName
      ? `${suggestion.scientificName} (${suggestion.commonName})`
      : suggestion.scientificName;
    setQuery(displayValue);
    onChange(displayValue);
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.scientificName}-${index}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-3 py-2 ${
                index === highlightedIndex
                  ? "bg-green-50 text-green-900"
                  : "text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{suggestion.scientificName}</div>
              {suggestion.commonName && (
                <div className="text-sm text-gray-500">
                  {suggestion.commonName}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg px-3 py-2 text-sm text-gray-500">
          No species found. You can still enter a custom name.
        </div>
      )}
    </div>
  );
}
