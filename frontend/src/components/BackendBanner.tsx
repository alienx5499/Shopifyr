'use client';

import { useCart } from '@/contexts/CartContext';

export function BackendBanner() {
  const { backendUnavailable } = useCart();
  if (!backendUnavailable) return null;
  return (
    <div
      role="alert"
      className="bg-amber-500/90 text-white text-center text-sm py-2 px-4"
    >
      Backend temporarily unavailable. Cart and some features may not work until the server is back.
    </div>
  );
}
