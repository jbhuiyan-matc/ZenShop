import { Shield, Lock, Server, Eye } from 'lucide-react';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Security Details</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Our Commitment to Security</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          At ZenShop, security is not just a feature—it&apos;s the foundation of our platform. We employ industry-standard security measures to ensure your data, transactions, and privacy are protected at all times.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Lock className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Data Encryption</h3>
          </div>
          <p className="text-gray-600">
            All sensitive data, including passwords and personal information, is encrypted using robust hashing algorithms (bcrypt) and secure transmission protocols (TLS/SSL).
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Server className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Secure Infrastructure</h3>
          </div>
          <p className="text-gray-600">
            Our infrastructure is built on secure, isolated containers with strict access controls and regular security updates to prevent vulnerabilities.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Eye className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">OWASP Compliance</h3>
          </div>
          <p className="text-gray-600">
            We actively monitor and mitigate common web vulnerabilities defined by OWASP, including SQL injection, XSS, and CSRF attacks.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Payment Security</h3>
          </div>
          <p className="text-gray-600">
            We do not store your full credit card information. All payments are processed through secure, PCI-DSS compliant payment gateways.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting a Vulnerability</h2>
        <p className="text-gray-600 mb-4">
          We value the contribution of the security research community. If you discover a security vulnerability in our platform, please report it to our security team immediately.
        </p>
        <p className="font-semibold text-blue-600">
          security@matcsecdesignc.com
        </p>
      </div>
    </div>
  );
}
