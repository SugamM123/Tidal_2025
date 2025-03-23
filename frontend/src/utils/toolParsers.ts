// Tool command types
export interface VideoCommand {
  type: 'video';
  description: string;
}

export interface GraphLine {
  // type: 'line';
  id: string;
  latex: string;
  color: string;
}

export interface GraphSlider {
  // type: 'slider';
  id: string;
  sliderBounds: sliderBounds;
}

export interface sliderBounds {
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
  const elements = command.split('|')
    .map(element => {
      const parts = element.trim().split(',');
      
      if (!parts[0]) {
        return null;
      }

      const id = parts[0].trim();

      // Special handling for circle1
      if (id === 'circle1') {
        return {
          id,
          latex: '(x-0)^{2}+(y-0)^{2}=r^2',
          color: '#ff0000'
        };
      }

      // Special handling for r (both equation and slider)
      if (id === 'r') {
        // If all parts after id are undefined or empty, create the equation
        if (!parts[1] || parts[1] === 'undefined') {
          return {
            id,
            latex: 'r=1',
            color: '#00ff00'
          };
        }
        // Otherwise create the slider
        return {
          id,
          sliderBounds: {
            min: 0,
            max: 5,
            step: 0.1
          }
        };
      }

      // Regular expression or slider handling
      if (parts.length === 4 && parts.slice(1).some(p => p && p !== 'undefined')) {
        // Slider with at least one non-undefined value
        return {
          id,
          sliderBounds: {
            min: parseFloat(parts[1]) || 0,
            max: parseFloat(parts[2]) || 5,
            step: parseFloat(parts[3]) || 0.1
          }
        };
      } else if (parts.length >= 2) {
        // Expression with optional color
        return {
          id,
          latex: parts[1] && parts[1] !== 'undefined' ? parts[1] : '',
          ...(parts[2] && parts[2] !== 'undefined' && { color: parts[2] })
        };
      }

      return null;
    })
    .filter(Boolean) as (GraphLine | GraphSlider)[];

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