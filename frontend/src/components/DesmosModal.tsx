import React, { useState, useEffect } from 'react';
import DesmosStudio from './DesmosStudio';
import { naturalLanguageToLatex } from '../utils/mathParser';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: any;
}

const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose, expression }) => {
  useEffect(() => {
    // No preprocessing needed for graph data structure
    if (expression && typeof expression === 'string') {
      try {
        // Only process strings through naturalLanguageToLatex
        const processed = naturalLanguageToLatex(expression);
        expression = processed;
      } catch (error) {
        console.error('Error processing expression:', error);
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
            <h3 className="text-white text-lg mb-2">Expression Details:</h3>
            <div className="bg-gray-800 p-3 rounded">
              <code className="text-green-400">
                {typeof expression === 'string'
                  ? expression
                  : JSON.stringify(expression, null, 2)}
              </code>
            </div>
          </div>
          
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