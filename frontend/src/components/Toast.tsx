import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { toastAtom } from '../store/atoms';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const [toast, setToast] = useAtom(toastAtom);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000); // Auto dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-green-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-blue-500'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bgColors[toast.type]} shadow-lg rounded-md p-4 flex items-start gap-3 max-w-sm`}>
        {icons[toast.type]}
        <p className="text-gray-800 text-sm font-medium flex-1 pt-0.5">{toast.message}</p>
        <button 
          onClick={() => setToast(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
