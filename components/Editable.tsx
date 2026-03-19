import React, { useRef } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Edit3, Image as ImageIcon, Upload } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  multiline?: boolean;
  as?: any;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  id, 
  defaultText, 
  className = '', 
  multiline = false,
  as: Component = 'p'
}) => {
  const { content, updateContent, isEditing } = useContent();
  const text = content[id] !== undefined ? content[id] : defaultText;

  if (isEditing) {
    return (
      <div className="relative group w-full">
        {multiline ? (
          <textarea
            value={text}
            onChange={(e) => updateContent(id, e.target.value)}
            className={`w-full p-2 border-2 border-dashed border-brand-blue bg-blue-50 rounded-lg text-gray-800 ${className}`}
            style={{ minHeight: '100px' }}
          />
        ) : (
          <input
            value={text}
            onChange={(e) => updateContent(id, e.target.value)}
            className={`w-full p-2 border-2 border-dashed border-brand-blue bg-blue-50 rounded-lg text-gray-800 ${className}`}
          />
        )}
        <div className="absolute -top-2 -right-2 bg-brand-blue text-white p-1.5 rounded-full pointer-events-none shadow-sm z-10">
          <Edit3 size={12} />
        </div>
      </div>
    );
  }

  return (
    <Component 
      className={className} 
      dangerouslySetInnerHTML={{ __html: text }} 
    />
  );
};

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  id,
  defaultSrc,
  alt,
  className = ''
}) => {
  const { content, updateContent, isEditing } = useContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use content from state, or fallback to default
  const src = content[id] !== undefined ? content[id] : defaultSrc;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to approx 3MB to prevent LocalStorage quota issues)
      if (file.size > 3 * 1024 * 1024) {
        alert("File is too large. Please select an image under 3MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateContent(id, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover rounded-lg shadow-md"
        onError={(e) => {
          // Fallback if image is broken
          e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
        }} 
      />
      
      {isEditing && (
        <>
          <button 
            type="button"
            onClick={handleClick}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white font-bold cursor-pointer backdrop-blur-sm border-2 border-dashed border-white m-2 rounded-lg transition-opacity hover:bg-black/70"
          >
            <Upload className="mb-2 w-8 h-8" />
            <span>Upload Photo</span>
            <span className="text-xs font-normal mt-1 text-gray-300">Click to select file</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
        </>
      )}
    </div>
  );
};