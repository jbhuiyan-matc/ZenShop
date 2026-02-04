import { Shield, Lock, CreditCard, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About ZenShop</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Building the future of secure e-commerce with elegant design and robust protection.
        </p>
      </div>

      {/* Our Story */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Founded in 2026, ZenShop emerged from a simple idea: that online shopping should be both beautiful and securely fortified. In an era where digital threats are evolving, we set out to build a platform where customers can shop with absolute peace of mind.
        </p>
        <p className="text-gray-600 leading-relaxed">
          We combine cutting-edge web technologies with industry-leading security practices to deliver a shopping experience that is as safe as it is seamless. Every feature we build starts with security by design, ensuring your data remains protected at every step.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Security First</h3>
          <p className="text-sm text-gray-500">
            Advanced encryption and protection protocols are at the core of our platform.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Privacy Focused</h3>
          <p className="text-sm text-gray-500">
            We respect your data and adhere to strict privacy standards and regulations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Safe Payments</h3>
          <p className="text-sm text-gray-500">
            Secure payment processing with PCI-DSS compliance for every transaction.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Customer Care</h3>
          <p className="text-sm text-gray-500">
            Dedicated support team ready to assist you with any questions or concerns.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Mission</h2>
        <div className="bg-blue-600 text-white rounded-2xl p-8 md:p-12">
          <p className="text-lg md:text-xl font-medium italic">
            "To empower customers with a secure, transparent, and enjoyable online shopping experience where safety is never compromised for convenience."
          </p>
        </div>
      </div>
    </div>
  );
}
