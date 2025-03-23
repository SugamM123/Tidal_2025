import React, { useState } from 'react';
import MediaViewer from './MediaViewer';

export interface MediaItem {
  id: string | number;
  type: 'video' | 'image' | 'desmos' | 'pdf' | 'excalidraw';
  src: string;
  title?: string;
  thumbnail?: string;
  size?: number;
  lastModified?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  layout?: 'grid' | 'carousel' | 'list';
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  layout = 'grid',
  className = '',
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = (item: MediaItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Format file size
  const formatSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const renderItemsByLayout = () => {
    switch (layout) {
      case 'carousel':
        return (
          <div className="relative">
            <div className="flex overflow-x-auto space-x-4 py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 w-64 cursor-pointer hover:opacity-90 transition"
                  onClick={() => openModal(item)}
                >
                  <MediaViewer
                    type={item.type}
                    src={item.thumbnail || item.src}
                    title={item.title}
                    height={160}
                    width="100%"
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div className="space-y-3">
            {items.map(item => (
              <div 
                key={item.id}
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                onClick={() => openModal(item)}
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center mr-4 overflow-hidden">
                    {item.type === 'video' && <i className="fas fa-video text-2xl text-gray-400"></i>}
                    {item.type === 'image' && <i className="fas fa-image text-2xl text-gray-400"></i>}
                    {item.type === 'desmos' && <i className="fas fa-chart-line text-2xl text-gray-400"></i>}
                    {item.type === 'pdf' && <i className="fas fa-file-pdf text-2xl text-gray-400"></i>}
                    {item.type === 'excalidraw' && <i className="fas fa-draw-polygon text-2xl text-gray-400"></i>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{item.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-400 mt-1 flex justify-between">
                      <span>{item.type.toUpperCase()}</span>
                      <span>{formatSize(item.size)}</span>
                    </div>
                    {item.lastModified && <div className="text-xs text-gray-500 mt-1">{item.lastModified}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'grid':
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div 
                key={item.id} 
                className="cursor-pointer hover:opacity-90 transition bg-gray-800 rounded-lg overflow-hidden"
                onClick={() => openModal(item)}
              >
                <MediaViewer
                  type={item.type}
                  src={item.thumbnail || item.src}
                  height={180}
                  width="100%"
                />
                <div className="p-3">
                  <div className="font-medium truncate">{item.title || 'Untitled'}</div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{item.type.toUpperCase()}</span>
                    <span>{formatSize(item.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`media-gallery ${className}`}>
      {renderItemsByLayout()}
      
      {/* Modal for viewing selected media */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium">{selectedItem.title || 'View Media'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <MediaViewer
                type={selectedItem.type}
                src={selectedItem.src}
                title={selectedItem.title}
                width="100%"
                height={selectedItem.type === 'desmos' ? '600px' : 'auto'}
                interactive={true}
              />
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedItem.type.toUpperCase()} • {formatSize(selectedItem.size)}
                {selectedItem.lastModified && ` • ${selectedItem.lastModified}`}
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  onClick={() => window.open(selectedItem.src, '_blank')}
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Open
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedItem.src;
                    link.download = selectedItem.title || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <i className="fas fa-download mr-2"></i>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;