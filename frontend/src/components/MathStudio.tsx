import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DesmosStudio from './DesmosStudio';
import { naturalLanguageToLatex } from '../utils/mathParser';

const MathStudio: React.FC = () => {
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [latexResult, setLatexResult] = useState('');
  const [examples, setExamples] = useState([
    { id: 1, text: 'y = x^2', active: false },
    { id: 2, text: 'The indefinite integral of x^2 dx', active: false },
    { id: 3, text: 'The derivative of sin(x)', active: false },
    { id: 4, text: 'f(x) = x^3 - 4x', active: false },
    { id: 5, text: 'y = 2sin(x) + cos(2x)', active: false },
    { id: 6, text: 'x^2 + y^2 = 16', active: false },
  ]);

  const handleConvert = () => {
    try {
      const result = naturalLanguageToLatex(naturalLanguage);
      setLatexResult(result);
    } catch (error) {
      console.error('Error converting to LaTeX:', error);
      setLatexResult('Error in conversion. Please try a different expression.');
    }
  };

  const handleExampleClick = (id: number, text: string) => {
    // Update active state
    setExamples(examples.map(ex => ({
      ...ex,
      active: ex.id === id
    })));
    
    setNaturalLanguage(text);
    const result = naturalLanguageToLatex(text);
    setLatexResult(result);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Math Studio</h1>
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Chat
          </Link>
        </div>
        <p className="text-gray-300 mt-2">
          Explore mathematical expressions with Desmos integration. Type natural language or equation notation and see it visualized.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Input</h2>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Natural Language or Equation</label>
            <textarea
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter an expression like 'y = x^2' or 'the derivative of sin(x)'"
            />
          </div>
          
          <button
            onClick={handleConvert}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-6"
            disabled={!naturalLanguage.trim()}
          >
            Convert & Visualize
          </button>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Examples</h3>
            <div className="space-y-2">
              {examples.map(example => (
                <button
                  key={example.id}
                  onClick={() => handleExampleClick(example.id, example.text)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    example.active 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {example.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">LaTeX Result</h2>
            {latexResult ? (
              <div className="bg-gray-700 p-3 rounded font-mono text-green-400 overflow-x-auto">
                {latexResult}
              </div>
            ) : (
              <div className="bg-gray-700 p-3 rounded text-gray-400 italic">
                LaTeX will appear here after conversion
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold text-white p-4">Visualization</h2>
            <DesmosStudio 
              initialExpression={latexResult} 
              height="400px"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-10 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">About Math Studio</h2>
        <div className="text-gray-300 space-y-4">
          <p>
            Math Studio is a powerful tool for exploring mathematical concepts through visualization.
            It converts natural language and standard equation notation into LaTeX format that can be
            visualized using the Desmos graphing calculator.
          </p>
          <p>
            Features include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Natural language to LaTeX conversion</li>
            <li>Support for various mathematical notations (integrals, derivatives, etc.)</li>
            <li>Interactive Desmos graphing calculator integration</li>
            <li>Real-time visualization of mathematical expressions</li>
            <li>Collection of examples to get started quickly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MathStudio; 