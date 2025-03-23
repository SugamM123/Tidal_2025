import React from 'react';
import { Excalidraw, ExcalidrawElement, THEME } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface DrawingBoardProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  onClose?: () => void;
  initialData?: ExcalidrawElement[];
  prompt?: string;
}

const DrawingBoard: React.FC<DrawingBoardProps> = ({ 
  width = "100%", 
  height = "500px",
  className = "",
  onClose,
  initialData = [],
  prompt = ""
}) => {
  // Process initialData to ensure colors are vibrant
  const processedElements = initialData.map(element => {
    // Create a new object to avoid mutating the original
    const newElement = { ...element };
    
    // Make text elements stand out
    if (newElement.type === 'text') {
      // Only set color if not already specified or if it's black/dark
      if (!newElement.strokeColor || isColorTooDark(newElement.strokeColor)) {
        newElement.strokeColor = '#ffffff'; // White text works well on black
      } else {
        // If it has a color, make it more vibrant
        newElement.strokeColor = makeColorVibrant(newElement.strokeColor);
      }
    }
    
    // Make shape colors vibrant
    if (['rectangle', 'diamond', 'ellipse', 'line', 'arrow', 'draw'].includes(newElement.type)) {
      // Make stroke color vibrant
      if (newElement.strokeColor) {
        newElement.strokeColor = makeColorVibrant(newElement.strokeColor);
      }
      
      // Make fill color vibrant
      if (newElement.backgroundColor) {
        newElement.backgroundColor = makeColorVibrant(newElement.backgroundColor);
      }
    }
    
    return newElement;
  });
  
  return (
    <div 
      className={`drawing-board custom-excalidraw-wrapper ${className}`}
      style={{ width, height }}
    >
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-white text-sm">
        <div className="flex-1">
          {prompt && (
            <div>
              <strong>Prompt:</strong> {prompt}
            </div>
          )}
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-2 p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Close drawing board"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      <Excalidraw
        initialData={{
          elements: processedElements,
          appState: { 
            viewBackgroundColor: "#000000", // Pure black background
            theme: "dark"
          }
        }}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false
          }
        }}
      />
    </div>
  );
};

// Helper function to determine if a color is too dark
function isColorTooDark(color: string): boolean {
  // Convert hex to RGB
  let r, g, b;
  
  if (color.startsWith('#')) {
    // Handle hex color
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // Handle rgb/rgba color
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      r = parseInt(rgb[0]);
      g = parseInt(rgb[1]);
      b = parseInt(rgb[2]);
    } else {
      return true; // Default to considering it dark if we can't parse
    }
  } else {
    return true; // Default to considering it dark if unknown format
  }
  
  // Calculate perceived brightness
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
  
  return brightness < 100; // Lower threshold to only catch very dark colors
}

// Helper function to make a color more vibrant
function makeColorVibrant(color: string): string {
  // For hex colors
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Increase saturation by pushing colors to their extremes
    // Find the dominant channel and push the contrast
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) {
      // This is a gray color, make it whiter
      return '#ffffff';
    }
    
    // Increase the dominant channel and decrease others slightly
    if (r === max) r = Math.min(255, r * 1.2);
    else r = Math.max(0, r * 0.8);
    
    if (g === max) g = Math.min(255, g * 1.2);
    else g = Math.max(0, g * 0.8);
    
    if (b === max) b = Math.min(255, b * 1.2);
    else b = Math.max(0, b * 0.8);
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }
  
  // For rgb/rgba colors
  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      let r = parseInt(rgb[0]);
      let g = parseInt(rgb[1]);
      let b = parseInt(rgb[2]);
      
      // Increase saturation by pushing colors to their extremes
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      
      if (max === min) {
        // This is a gray color, make it whiter
        r = g = b = 240;
      } else {
        // Increase the dominant channel and decrease others slightly
        if (r === max) r = Math.min(255, r * 1.2);
        else r = Math.max(0, r * 0.8);
        
        if (g === max) g = Math.min(255, g * 1.2);
        else g = Math.max(0, g * 0.8);
        
        if (b === max) b = Math.min(255, b * 1.2);
        else b = Math.max(0, b * 0.8);
      }
      
      // Handle alpha if present
      if (rgb.length > 3) {
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${rgb[3]})`;
      }
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
  }
  
  // Default fallback
  return color;
}

export default DrawingBoard;