// Deliberately small rich-text vocabulary. All attributes except safe link hrefs are removed.
export function cleanHtml(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, token => {
    const match = /^<\s*(\/?)\s*([a-z0-9]+)/i.exec(token);
    if (!match) return '';
    const tag = match[2].toLowerCase();
    if (!['p', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br', 'a', 'blockquote'].includes(tag)) return '';
    if (match[1]) return `</${tag}>`;
    if (tag === 'a') {
      const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(token)?.[1] || '';
      return /^(https?:\/\/|\/(?!\/)|#[a-z0-9])/i.test(href) && !/[<>\s&]/.test(href) ? `<a href="${href}" rel="noopener noreferrer">` : '<a>';
    }
    return `<${tag}>`;
  });
}
