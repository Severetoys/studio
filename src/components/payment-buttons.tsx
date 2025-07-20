
"use client";

import { useState } from 'react';
import PayPalButton from './paypal-button';

interface PaymentButtonsProps {
  amount: string;
}

export default function PaymentButtons({ amount }: PaymentButtonsProps) {
  
  const handleSuccess = (details: any) => {
    // This function is required by PayPalButton but the logic is self-contained for quick pay
    console.log("Quick Payment successful on parent:", details);
  };

  return (
    <div className="w-full">
      <PayPalButton 
        amount={amount}
        onSuccess={handleSuccess}
        isQuickPay={true}
      />
    </div>
  );
}
