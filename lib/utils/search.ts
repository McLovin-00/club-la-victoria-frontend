export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchesMultiWordSearch(
  searchText: string,
  searchQuery: string,
): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;

  const normalizedQuery = normalizeForSearch(searchQuery);
  const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return true;

  const normalizedText = normalizeForSearch(searchText);

  return words.every((word) => normalizedText.includes(word));
}
