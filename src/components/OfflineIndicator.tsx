import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 text-white px-3.5 py-1.5 text-xs font-medium shadow-lg animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Mode Offline — Data tersimpan di penyimpanan lokal perangkat.</span>
    </div>
  );
};
