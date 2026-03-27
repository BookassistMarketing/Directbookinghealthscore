import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Security & Privacy</h1>
        <p className="text-xl text-gray-500">How we handle your data</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">What data we collect</h2>
          <p className="text-gray-600 leading-relaxed">
            When you complete the Direct Booking Health Score audit, we collect your questionnaire responses and the contact information you submit via the lead capture form. We also collect approximate geolocation data (country and region) derived from your IP address to help contextualise your results.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How we use it</h2>
          <p className="text-gray-600 leading-relaxed">
            Your audit responses are used solely to generate your Digital Health Score and strategic assessment. Contact information submitted via the form is processed by HubSpot and used by the Bookassist team to follow up with relevant resources and consultation offers. We do not sell your data to third parties.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Data storage</h2>
          <p className="text-gray-600 leading-relaxed">
            Audit responses and associated metadata are stored securely on AWS infrastructure. Contact form submissions are managed within Bookassist's HubSpot CRM. Data is retained in line with Bookassist's standard data retention policy.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            This tool uses minimal cookies for language preference storage and session management. HubSpot's form embed may set additional cookies in line with their own privacy policy.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Your rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to request access to, correction of, or deletion of any personal data we hold about you. To exercise these rights, please contact Bookassist directly via{' '}
            <a href="https://bookassist.org" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-medium hover:underline">
              bookassist.org
            </a>.
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Responsible party</h2>
          <p className="text-gray-600 leading-relaxed">
            This tool is operated by Bookassist. For all data and privacy enquiries, please refer to the Bookassist privacy policy available at{' '}
            <a href="https://bookassist.org" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-medium hover:underline">
              bookassist.org
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
};
