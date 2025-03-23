// Tool command types
export interface VideoCommand {
  type: 'video';
  description: string;
}

export interface GraphLine {
  type: 'line';
  id: string;
  equation: string;
  color: string;
}

export interface GraphSlider {
  type: 'slider';
  id: string;
  min: number;
  max: number;
  step: number;
}

export type GraphCommand = {
  type: 'graph';
  elements: (GraphLine | GraphSlider)[];
}

export interface DiagramCommand {
  type: 'diagram';
  mermaidCode: string;
}

export interface WolframCommand {
  type: 'wolfram';
  query: string;
}

export type ToolCommand = VideoCommand | GraphCommand | DiagramCommand | WolframCommand;

// Simple parsing functions
export const parseVideoCommand = (command: string): VideoCommand => {
  return {
    type: 'video',
    description: command.trim()
  };
};

export const parseGraphCommand = (command: string): GraphCommand => {
  const elements = command.split('|').map(element => {
    const parts = element.trim().split(',');
    
    if (parts.length === 4) {
      // Slider: id,min,max,step
      return {
        type: 'slider' as const,
        id: parts[0],
        min: parseFloat(parts[1]),
        max: parseFloat(parts[2]),
        step: parseFloat(parts[3])
      };
    } else if (parts.length === 3) {
      // Line: id,equation,color
      return {
        type: 'line' as const,
        id: parts[0],
        equation: parts[1],
        color: parts[2]
      };
    }
    throw new Error(`Invalid graph element format: ${element}`);
  });

  return {
    type: 'graph',
    elements
  };
};

export const parseDiagramCommand = (command: string): DiagramCommand => {
  return {
    type: 'diagram',
    mermaidCode: command
  };
};

export const parseWolframCommand = (command: string): WolframCommand => {
  return {
    type: 'wolfram',
    query: command.trim()
  };
};

// Main frontmatter parser
export interface ParsedFrontmatter {
  video?: VideoCommand;
  graph?: GraphCommand;
  wolfram?: WolframCommand;
  diagram?: DiagramCommand;
}

export const parseFrontmatter = (rawFrontmatter: Record<string, string>): ParsedFrontmatter => {
  const result: ParsedFrontmatter = {};

  Object.entries(rawFrontmatter).forEach(([key, value]) => {
    switch (key) {
      case 'Video':
        result.video = parseVideoCommand(value);
        break;
      case 'Graph':
        result.graph = parseGraphCommand(value);
        break;
      case 'Diagram':
        result.diagram = parseDiagramCommand(value);
        break;
      case 'Wolfram':
        result.wolfram = parseWolframCommand(value);
        break;
    }
  });

  return result;
};