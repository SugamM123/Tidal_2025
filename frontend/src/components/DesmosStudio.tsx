import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DesmosSlider {
  id: string;
  sliderBounds: {
    min: number;
    max: number;
    step: number;
  };
}

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

type DesmosElement = DesmosExpression | DesmosSlider;


interface DesmosGraphData {
  type: string;
  elements: DesmosElement[];
}

interface DesmosStudioProps {
  initialExpression?: DesmosGraphData | string;
  height?: string;
  width?: string;
}

const DesmosStudio: React.FC<DesmosStudioProps> = ({
  initialExpression = { type: 'graph', elements: [] as DesmosElement[] },
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
    console.log('Loading Desmos calculator script...');
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    script.async = true;
    
    script.onload = () => {
      console.log('Desmos script loaded successfully!');
      if (containerRef.current && (window as any).Desmos) {
        console.log('Creating Desmos calculator...');
        const calculator = (window as any).Desmos.GraphingCalculator(containerRef.current, {
          expressionsCollapsed: false,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true,
          keypad: false,
          lockViewport: false,
          border: false,
          fontSize: 16
        });
        
        if (initialExpression) {
          let graphData: DesmosGraphData | undefined;
          const isExpression = (element: DesmosElement): element is DesmosExpression =>
            'latex' in element;

          if (typeof initialExpression === 'string') {
            // Parse the string format into proper graph data
            const elements: DesmosElement[] = initialExpression.split('|').map((expr: string) => {
              const [id, param1, param2, param3] = expr.split(',');
              
              // Handle special cases based on id
              if (id === 'circle1') {
                const element: DesmosExpression = {
                  id,
                  latex: '(x-0)^{2}+(y-0)^{2}=r^2',
                  color: '#ff0000'
                };
                return element;
              }
              
              if (id === 'r') {
                // First r is for the equation r=1
                if (!param1 || param1 === 'undefined') {
                  const element: DesmosExpression = {
                    id,
                    latex: 'r=1',
                    color: '#00ff00'
                  };
                  return element;
                }
                // Second r is for slider bounds
                const element: DesmosSlider = {
                  id,
                  sliderBounds: {
                    min: 0,
                    max: 5,
                    step: 0.1
                  }
                };
                return element;
              }

              // Default case - try to use provided values or fallback to empty
              const element: DesmosExpression = {
                id,
                latex: param1 && param1 !== 'undefined' ? param1 : '',
                ...(param2 && param2 !== 'undefined' && { color: param2 })
              };
              return element;
            }).filter(element => element.id);
            
            graphData = { type: 'graph', elements };
          } else if ('elements' in initialExpression) {
            graphData = initialExpression as DesmosGraphData;
          } else if ('graph' in initialExpression && (initialExpression as any).graph) {
            graphData = (initialExpression as any).graph;
          }

          if (graphData?.elements && Array.isArray(graphData.elements)) {
            // Clear existing expressions
            calculator.setBlank();
            
            // Process and set expressions
            graphData.elements.forEach(element => {
              if (element.id === 'circle1') {
                const expr: DesmosExpression = {
                  id: element.id,
                  latex: isExpression(element) ? element.latex : '(x-0)^{2}+(y-0)^{2}=r^2',
                  color: isExpression(element) ? element.color || '#ff0000' : '#ff0000'
                };
                calculator.setExpression(expr);
              }
              else if (element.id === 'r') {
                if (!('sliderBounds' in element)) {
                  // First r instance is for the equation
                  const expr: DesmosExpression = {
                    id: element.id,
                    latex: isExpression(element) ? element.latex : 'r=1',
                    color: isExpression(element) ? element.color || '#00ff00' : '#00ff00'
                  };
                  calculator.setExpression(expr);
                } else {
                  // Second r instance is for the slider
                  calculator.setExpression({
                    id: element.id,
                    sliderBounds: {
                      min: 0,
                      max: 5,
                      step: 0.1
                    }
                  });
                }
              }
              else if (isExpression(element)) {
                calculator.setExpression(element);
              }
            });
          }
        }
        
        calculatorRef.current = calculator;
      } else {
        console.error('Container ref or Desmos not available');
      }
    };

    script.onerror = (error: any) => {
      console.error('Failed to load Desmos script:', error);
    };

    document.body.appendChild(script);

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [initialExpression]);

  const handleSubmit = useCallback(() => {
    if (!expression.trim() || !calculatorRef.current) return;
    try {
      const id = `expr${Date.now()}`;
      calculatorRef.current.setExpression({ id, latex: expression });
      setHistory(prev => [...prev, expression]);
      setHistoryIndex(prev => prev + 1);
      setExpression('');
    } catch (error) {
      console.error('Error setting expression:', error);
    }
  }, [expression]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
      const newExpression = expression.substring(0, start) + symbol + expression.substring(end);
      setExpression(newExpression);
      setTimeout(() => {
        if (expressionRef.current) {
          expressionRef.current.focus();
          expressionRef.current.selectionStart = start + symbol.length;
          expressionRef.current.selectionEnd = start + symbol.length;
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