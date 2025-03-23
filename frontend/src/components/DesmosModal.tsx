import React, { useState, useEffect } from 'react';
import DesmosStudio from './DesmosStudio';
import { naturalLanguageToLatex } from '../utils/mathParser';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: any;
}

const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose, expression }) => {
  const [processedExpression, setProcessedExpression] = useState('');
  
  useEffect(() => {
    if (expression) {
      try {
        // Try to convert natural language to LaTeX if needed
        const processed = naturalLanguageToLatex(expression);
        setProcessedExpression(processed);
      } catch (error) {
        console.error('Error processing expression:', error);
        setProcessedExpression(expression);
      }
    }
  }, [expression]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">Mathematical Expression Studio</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <div className="mb-4">
            <h3 className="text-white text-lg mb-2">Original Expression:</h3>
            <div className="bg-gray-800 p-3 rounded">
              <code className="text-green-400">{expression}</code>
            </div>
          </div>
          
          {processedExpression !== expression && (
            <div className="mb-4">
              <h3 className="text-white text-lg mb-2">Processed LaTeX:</h3>
              <div className="bg-gray-800 p-3 rounded">
                <code className="text-blue-400">{processedExpression}</code>
              </div>
            </div>
          )}
          
          <DesmosStudio 
            initialExpression={expression} 
            height="400px" 
          />
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesmosModal; 