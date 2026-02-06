import { FileCheck } from 'lucide-react';

export default function Compliance() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center mb-8">
        <FileCheck className="w-8 h-8 text-blue-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Compliance & Certifications</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">PCI DSS</h2>
          <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider">Payment Card Industry Data Security Standard</p>
          <p className="text-gray-600">
            ZenShop is fully compliant with PCI DSS requirements to ensure the secure handling of credit card information. We undergo regular audits and scans to maintain this certification.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">GDPR</h2>
          <p className="text-sm font-semibold text-green-600 mb-4 uppercase tracking-wider">General Data Protection Regulation</p>
          <p className="text-gray-600">
            We respect the privacy rights of our users and comply with GDPR regulations regarding data collection, processing, and storage for users within the European Union.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">SOC 2 Type II</h2>
          <p className="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wider">Service Organization Control</p>
          <p className="text-gray-600">
            Our cloud infrastructure provider is SOC 2 Type II certified, ensuring high standards for security, availability, processing integrity, confidentiality, and privacy.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">SSL / TLS</h2>
          <p className="text-sm font-semibold text-orange-600 mb-4 uppercase tracking-wider">Transport Layer Security</p>
          <p className="text-gray-600">
            All data transmitted between your browser and our servers is encrypted using strong SSL/TLS protocols, protecting your information from interception.
          </p>
        </div>
      </div>
    </div>
  );
}
