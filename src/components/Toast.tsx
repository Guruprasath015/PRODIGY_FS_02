import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 max-w-sm
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}
    >
      {type === 'success'
        ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      }
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition ml-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
