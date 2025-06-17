import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  image: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={image}
            alt="Expanded view"
            className="w-full h-full object-contain"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 