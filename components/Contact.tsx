import React from 'react';
import { ExternalLink } from 'lucide-react';
import { EditableText } from './Editable';
import { Button } from './Button';

export const Contact: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="mb-12">
        <EditableText 
          id="contact.title" 
          as="h1" 
          defaultText="Get in Touch" 
          className="text-4xl font-bold text-gray-900 mb-6"
        />
        <div className="text-xl text-gray-600 max-w-2xl mx-auto">
          <EditableText 
            id="contact.desc" 
            defaultText="Hotel Health Clinic is powered by Bookassist Strategy. For detailed enquiries or to schedule a consultation, please visit our partner contact page." 
            multiline
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mb-6">
            <ExternalLink className="w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
            <EditableText id="contact.card.title" defaultText="Contact Bookassist" />
        </h3>
        
        <div className="text-gray-500 mb-8 max-w-lg">
             <EditableText 
                id="contact.card.desc" 
                defaultText="Our team of digital strategists operates globally. Click below to find the local office nearest to you." 
                multiline
             />
        </div>

        <Button 
            href="https://bookassist.org/book-a-demo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
            <EditableText id="contact.btn" defaultText="Go to Contact Page" as="span" />
            <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};