import { useState, useEffect, useCallback } from "react";
import { BUSQUEDA } from "@/lib/constants";

interface UseSearchOptions {
  initialValue?: string;
  debounceDelay?: number;
  minLength?: number;
  onSearch?: (query: string) => void;
}

export function useSearch({
  initialValue = "",
  debounceDelay = BUSQUEDA.DELAY_DEBOUNCE,
  minLength = BUSQUEDA.LONGITUD_MINIMA_BUSQUEDA,
  onSearch,
}: UseSearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (!onSearch) return;

    if (debouncedSearchTerm.length >= minLength) {
      onSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === "") {
      // 🔑 importante: resetear cuando se limpia la búsqueda
      onSearch("");
    }
  }, [debouncedSearchTerm, onSearch, minLength]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const isValidSearch = useCallback(
    (term: string) => term.length >= minLength,
    [minLength]
  );

  return {
    searchTerm, // lo que hay en el input
    debouncedSearchTerm, // lo que realmente se usa para query
    handleSearchChange,
    clearSearch,
    isValidSearch,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}
