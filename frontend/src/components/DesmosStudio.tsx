import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DesmosExpression {
  id: string;
  latex: string;
  color?: string;
  sliderBounds?: {
    min: number;
    max: number;
    step: number;
  };
}

interface DesmosGraphData {
  type: string;
  elements: DesmosExpression[];
}

interface DesmosStudioProps {
  initialExpression?: DesmosGraphData;
  height?: string;
  width?: string;
}

const DesmosStudio: React.FC<DesmosStudioProps> = ({
  initialExpression = {},
  height = '400px',
  width = '100%'
}) => {
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<any>(null);
  const expressionRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Desmos calculator
  useEffect(() => {
    // Load the Desmos calculator script dynamically
    console.log('Loading Desmos calculator script...');
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    script.async = true;
    
    script.onload = () => {
      console.log('Desmos script loaded successfully!');
      if (containerRef.current && window.Desmos) {
        console.log('Creating Desmos calculator...');
        // Create the calculator
        const calculator = window.Desmos.GraphingCalculator(containerRef.current, {
          expressionsCollapsed: false,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true,
          keypad: false,
          lockViewport: false,
          border: false,
          fontSize: 16
        });
        
        // Set initial expressions if provided
        if (initialExpression) {
          try {
            // Set each expression from the elements array
            if (initialExpression.elements && Array.isArray(initialExpression.elements)) {
              initialExpression.elements.forEach(element => {
                calculator.setExpression(element);
              });
            }
          } catch (error) {
            console.error('Error setting expressions:', error);
          }
        }
        
        // Store the calculator instance for cleanup
        calculatorRef.current = calculator;
      } else {
        console.error('Container ref or window.Desmos not available');
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Desmos script:', error);
    };
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
      }
      // Remove the script tag if it exists
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [initialExpression]);

  const handleSubmit = useCallback(() => {
    if (!expression.trim() || !calculatorRef.current) return;
    
    try {
      // Add a unique ID for each expression
      const id = `expr${Date.now()}`;
      calculatorRef.current.setExpression({ id, latex: expression });
      
      // Add to history
      setHistory(prev => [...prev, expression]);
      setHistoryIndex(prev => prev + 1);
      
      // Clear the input
      setExpression('');
    } catch (error) {
      console.error('Error setting expression:', error);
    }
  }, [expression]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle enter key (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Handle up/down arrows for history navigation
    if (e.key === 'ArrowUp' && e.ctrlKey && history.length > 0) {
      e.preventDefault();
      const newIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setExpression(history[newIndex]);
    }
    
    if (e.key === 'ArrowDown' && e.ctrlKey && historyIndex < history.length - 1) {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setExpression(history[newIndex]);
    }
  }, [history, historyIndex, handleSubmit]);

  const handleClear = useCallback(() => {
    if (calculatorRef.current) {
      calculatorRef.current.setBlank();
    }
  }, []);

  const insertSymbol = useCallback((symbol: string) => {
    if (expressionRef.current) {
      const start = expressionRef.current.selectionStart;
      const end = expressionRef.current.selectionEnd;
      const newExpression = 
        expression.substring(0, start) + 
        symbol + 
        expression.substring(end);
      
      setExpression(newExpression);
      
      // Focus and set cursor position after the inserted symbol
      setTimeout(() => {
        if (expressionRef.current) {
          expressionRef.current.focus();
          expressionRef.current.selectionStart = 
            expressionRef.current.selectionEnd = 
              start + symbol.length;
        }
      }, 10);
    }
  }, [expression]);

  const symbolButtons = [
    { symbol: '+', label: '+' },
    { symbol: '-', label: '−' },
    { symbol: '*', label: '×' },
    { symbol: '/', label: '÷' },
    { symbol: '^', label: '^' },
    { symbol: '\\pi', label: 'π' },
    { symbol: '\\sqrt{x}', label: '√' },
    { symbol: '\\frac{a}{b}', label: 'a/b' },
    { symbol: '\\int', label: '∫' },
    { symbol: '\\sum', label: 'Σ' },
    { symbol: '\\prod', label: 'Π' },
    { symbol: '\\infty', label: '∞' },
    { symbol: '=', label: '=' },
    { symbol: '<', label: '<' },
    { symbol: '>', label: '>' },
    { symbol: '\\leq', label: '≤' },
    { symbol: '\\geq', label: '≥' },
  ];

  return (
    <div className="desmos-studio bg-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="p-3 bg-[#222] flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">Desmos Equation Studio</h3>
        <button 
          onClick={handleClear}
          className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div 
        ref={containerRef} 
        className="desmos-container"
        style={{ width, height }}
      ></div>
      
      <div className="p-3 bg-[#2a2a2a]">
        <div className="flex mb-2 overflow-x-auto py-1 no-scrollbar">
          {symbolButtons.map(btn => (
            <button
              key={btn.symbol}
              onClick={() => insertSymbol(btn.symbol)}
              className="p-2 bg-[#333] text-white rounded min-w-[40px] mx-1 hover:bg-[#444] transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        <div className="flex">
          <textarea
            ref={expressionRef}
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#333] text-white p-3 rounded-l-lg focus:outline-none resize-none"
            placeholder="Enter a mathematical expression (e.g., y=x^2)"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
            title="Plot Expression (Enter)"
          >
            Plot
          </button>
        </div>
        
        <div className="mt-2 text-gray-400 text-xs">
          Press Enter to plot • Ctrl+Up/Down for history • Examples: y=sin(x), y=x^2, x^2+y^2=4
        </div>
      </div>
    </div>
  );
};

export default DesmosStudio; 