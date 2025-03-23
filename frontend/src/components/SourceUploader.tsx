import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { geminiService } from '../services/geminiService';

interface SourceUploaderProps {
  onClose: () => void;
  onUploadComplete: (filename: string) => void;
}

const SourceUploader: React.FC<SourceUploaderProps> = ({ onClose, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    const pdfjsWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
  }, []);

  // Fallback text extraction method that doesn't rely on PDF.js rendering
  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      // Read the file as text directly
      const text = await file.text().catch(() => '');
      if (text.trim()) {
        // If we got text content directly, use it (works for some PDFs and text files)
        return text;
      }
      
      // If text extraction failed, try a simpler approach with PDF.js
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      for (let i = 1; i <= totalPages; i++) {
        setUploadProgress(Math.floor((i / totalPages) * 100));
        
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.error(`Error extracting text from page ${i}:`, pageError);
          fullText += `[Error extracting page ${i}]\n\n`;
        }
      }
      
      return fullText || 'No text content could be extracted from this PDF.';
    } catch (err) {
      console.error('Error extracting text from PDF:', err);
      
      // Return placeholder text when extraction fails
      return `[Failed to extract text from PDF: ${file.name}]\n\nThis PDF could not be processed, but has been added as a source reference.`;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      setUploadProgress(10); // Show initial progress
      
      // Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      
      setUploadProgress(80); // Update progress
      
      // Update the Gemini conversation with the extracted text
      await updateGeminiWithSource(file.name, extractedText);
      
      setUploadProgress(100); // Complete progress
      
      // Notify parent component
      onUploadComplete(file.name);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process the PDF file. Try a smaller PDF or a different file.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const updateGeminiWithSource = async (filename: string, extractedText: string) => {
    // Truncate text if it's too long
    const maxLength = 10000; // Limit text length to avoid API limitations
    const truncatedText = extractedText.length > maxLength 
      ? extractedText.substring(0, maxLength) + '... (content truncated due to length)'
      : extractedText;
      
    // Create context message for Gemini
    const contextMessage = `I'm uploading a document named "${filename}" with the following content for reference:\n\n${truncatedText}\n\nPlease acknowledge that you've received this document and can refer to it in our conversation.`;
    
    try {
      // Send the context message to Gemini
      await geminiService.appendToHistory(contextMessage);
    } catch (err) {
      console.error('Error updating Gemini with source:', err);
      throw new Error('Failed to add source to the conversation');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Upload Source</h2>
        
        <p className="text-gray-300 mb-4">
          Upload a PDF file to add it as a source to your conversation.
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileUpload}
        />
        
        {isUploading ? (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Processing PDF ({uploadProgress}%)...
            </p>
          </div>
        ) : (
          <button
            onClick={triggerFileInput}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Select PDF File
          </button>
        )}
        
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceUploader; 