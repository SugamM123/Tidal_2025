import { ParsedFrontmatter, parseFrontmatter } from './toolParsers';

interface FrontmatterResult {
  frontmatter: ParsedFrontmatter;
  content: string;
}

const stripCodeBlocks = (text: string): string => {
  // Remove ```text or ```plaintext or similar markers at start and end
  return text.replace(/^```(?:text|plaintext|)?\n?/, '').replace(/\n?```$/, '');
};

export const extractFrontmatter = (text: string): FrontmatterResult => {
  const defaultResult = {
    frontmatter: {},
    content: text
  };

  // First strip any code block markers
  const cleanedText = stripCodeBlocks(text);

  // Check if the text starts with frontmatter markers
  if (!cleanedText.startsWith('---\n')) {
    return defaultResult;
  }

  // Find the closing frontmatter marker
  const endMarkerIndex = cleanedText.indexOf('\n---\n', 4);
  if (endMarkerIndex === -1) {
    return defaultResult;
  }

  // Extract the frontmatter and content sections
  const frontmatterSection = cleanedText.slice(4, endMarkerIndex);
  const content = cleanedText.slice(endMarkerIndex + 5);

  // Parse frontmatter into raw key-value pairs
  const rawFrontmatter: Record<string, string> = {};
  const lines = frontmatterSection.split('\n');
  
  let currentKey = '';
  let currentValue = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('||')) {
      // If we were collecting a multiline value, save it
      if (currentKey && currentValue.length > 0) {
        rawFrontmatter[currentKey] = currentValue.join('\n');
        currentValue = [];
      }
      
      const [key, ...rest] = line.split('||');
      currentKey = key.trim();
      
      // If this is a single-line entry
      if (rest.join('||').includes('||')) {
        rawFrontmatter[currentKey] = rest.join('||').replace(/\|\|$/, '').trim();
        currentKey = '';
      } else if (currentKey === 'Diagram') {
        // Start collecting multiline diagram content
        currentValue = [];
      }
    } else if (currentKey === 'Diagram') {
      // Collecting diagram content
      currentValue.push(line);
    }
  }
  
  // Save any remaining multiline content
  if (currentKey && currentValue.length > 0) {
    rawFrontmatter[currentKey] = currentValue.join('\n');
  }

  // Parse the raw frontmatter into specialized types
  const parsedFrontmatter = parseFrontmatter(rawFrontmatter);
  console.log("Parsed frontmatter:", parsedFrontmatter);
  return {
    frontmatter: parsedFrontmatter,
    content: content.trim()
  };
};