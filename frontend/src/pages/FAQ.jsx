import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center mb-8">
        <HelpCircle className="w-8 h-8 text-blue-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">How do I track my order?</h2>
          <p className="text-gray-600">Once your order ships, you will receive an email with a tracking number and link to track your package.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">What payment methods do you accept?</h2>
          <p className="text-gray-600">We accept Visa, Mastercard, American Express, and secure online payment methods. All transactions are encrypted.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Is my data secure?</h2>
          <p className="text-gray-600">Yes, we use industry-standard encryption and security practices to protect your personal and financial data.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Do you ship internationally?</h2>
          <p className="text-gray-600">Currently, we only ship within the United States. We hope to expand to other countries soon.</p>
        </div>
      </div>
    </div>
  );
}
