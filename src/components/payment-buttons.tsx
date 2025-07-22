
"use client";

import { useState } from 'react';
import MercadoPagoButton from './mercadopago-button';

interface PaymentButtonsProps {
  amount: string;
}

export default function PaymentButtons({ amount }: PaymentButtonsProps) {
  
  const handleSuccess = (details: any) => {
    // This function is required by MercadoPagoButton but the logic is self-contained for quick pay
    console.log("Quick Payment successful on parent:", details);
  };

  return (
    <div className="w-full">
      <MercadoPagoButton 
        amount={parseFloat(amount)}
        onSuccess={handleSuccess}
        isQuickPay={true}
      />
    </div>
  );
}
