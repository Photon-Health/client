/**
 * Highlights matching substrings by wrapping them in <strong> tags.
 * Splits the search term by spaces so each word is matched independently.
 */
export const boldSubstring = (inputString: string, substring: string) => {
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedSubstring = escapeRegExp(substring);
  const substrings = escapedSubstring.split(' ').filter((part: string) => part.length > 0);

  const regex = new RegExp(`(${substrings.join('|')})`, 'gi');
  const parts = inputString.split(regex);

  return parts.map((part) => {
    if (substrings.some((sub: string) => sub.toLowerCase() === part?.toLowerCase())) {
      return <strong class="font-extrabold">{part}</strong>;
    } else {
      return part;
    }
  });
};