import { RefreshCw } from 'lucide-react';

export default function Returns() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center mb-8">
        <RefreshCw className="w-8 h-8 text-blue-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Returns Policy</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">30-Day Return Policy</h2>
          <p className="text-gray-600 mb-4">
            We want you to be completely satisfied with your purchase. If you are not happy with your order, you may return it within 30 days of purchase for a full refund or exchange.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Condition of Items</h2>
          <p className="text-gray-600 mb-4">
            To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Initiate a Return</h2>
          <p className="text-gray-600 mb-4">
            Please contact our support team at support@matcsecdesignc.com with your order number to request a return authorization. We will provide you with instructions on how to send your package back to us.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Refunds</h2>
          <p className="text-gray-600">
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment.
          </p>
        </section>
      </div>
    </div>
  );
}
