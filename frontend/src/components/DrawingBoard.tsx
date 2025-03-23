import React from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface DrawingBoardProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const DrawingBoard: React.FC<DrawingBoardProps> = ({ 
  width = "100%", 
  height = "500px",
  className = "" 
}) => {
  return (
    <div 
      className={`drawing-board ${className}`}
      style={{ width, height }}
    >
      <Excalidraw />
    </div>
  );
};

export default DrawingBoard;