import React, { useRef, useEffect } from 'react';

interface DesmosGraphProps {
  expression: any;
  height?: string;
  width?: string;
}

const DesmosGraph: React.FC<DesmosGraphProps> = ({ 
  expression, 
  height = '250px', 
  width = '100%' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load Desmos API and initialize calculator
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    script.async = true;
    
    script.onload = () => {
      if (containerRef.current && window.Desmos) {
        // Create calculator with simplified UI
        const calculator = window.Desmos.GraphingCalculator(containerRef.current, {
          expressionsCollapsed: true,
          settingsMenu: false,
          zoomButtons: true,
          expressions: false,
          lockViewport: false,
          border: false,
          keypad: false,
          invertedColors: true
        });
        
        // Set expressions
        try {
          if (expression.graph && Array.isArray(expression.graph.elements)) {
            calculator.setBlank(); // Clear existing expressions
            expression.graph.elements.forEach(element => {
              calculator.setExpression(element);
            });
          } else {
            calculator.setExpression(expression);
          }
        } catch (error) {
          console.error('Error setting expression in Desmos:', error);
        }
        
        // Clean up calculator on unmount
        return () => {
          calculator.destroy();
        };
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Remove the script if component unmounts before it loads
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [expression]);
  
  return (
    <div 
      ref={containerRef} 
      style={{ height, width }}
      className="desmos-container"
    ></div>
  );
};

export default DesmosGraph; 