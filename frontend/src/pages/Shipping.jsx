import { Truck } from 'lucide-react';

export default function Shipping() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center mb-8">
        <Truck className="w-8 h-8 text-blue-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Shipping Information</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Policy</h2>
          <p className="text-gray-600 mb-4">
            We strive to process and ship all orders within 1-2 business days. Delivery times depend on the shipping method selected at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Methods</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Expedited Shipping:</strong> 2-3 business days</li>
            <li><strong>Overnight Shipping:</strong> 1 business day</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Costs</h2>
          <p className="text-gray-600">
            Shipping costs are calculated based on the weight of your order and the destination. You can view the estimated shipping cost in your cart before checkout.
          </p>
        </section>
      </div>
    </div>
  );
}
