import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface PaymentGuardProps {
  children: React.ReactNode;
}

// UPDATE: Guard component to protect capture step
export const PaymentGuard: React.FC<PaymentGuardProps> = ({ children }) => {
  const canAccessCapture = useAppStore(state => state.canAccessCapture());
  
  if (!canAccessCapture) {
    return <Navigate to="/payment" replace />;
  }
  
  return <>{children}</>;
};