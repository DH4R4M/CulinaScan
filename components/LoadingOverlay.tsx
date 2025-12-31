
import React from 'react';
import { LoadingIcon } from './Icons';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6">
      <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
        <LoadingIcon className="w-16 h-16 text-emerald-600 mb-6" />
        <h2 className="text-2xl font-bold text-emerald-900 text-center mb-2">CulinaScan is Thinking...</h2>
        <p className="text-emerald-600 text-center animate-pulse font-medium">{message}</p>
        <div className="mt-8 flex space-x-1">
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
