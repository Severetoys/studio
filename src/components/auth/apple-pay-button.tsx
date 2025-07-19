
"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// This is a placeholder function. In a real application, this would
// make a server-side call to your backend to get an Apple Pay merchant session.
// See: https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/requesting_an_apple_pay_payment_session
async function validateMerchant() {
  return new Promise((resolve, reject) => {
    // For demo purposes, we'll show an alert and resolve.
    // In a real implementation, you would fetch a session from your server.
    alert("Merchant validation is a required step, but is not implemented in this demo. See the code comments in apple-pay-button.tsx for details.");
    resolve({
      "displayName": "My Store",
      "initiative": "web",
      "initiativeContext": "mystore.example.com",
      "merchantIdentifier": "merchant.com.apdemo",
      "signature": "3a3c6b6f....",
      "nonce": "a1b2c3d4....",
    });
  });
}


async function onApplePayButtonClicked(showToast: (options: any) => void) {
    // Consider falling back to Apple Pay JS if Payment Request is not available.
    if (!window.PaymentRequest) {
        showToast({
            variant: "destructive",
            title: "Payment Request API not supported",
            description: "Your browser does not support the Payment Request API.",
        });
        return;
    }
    
    try {
        // Define PaymentMethodData
        const paymentMethodData = [{
            supportedMethods: "https://apple.com/apple-pay",
            data: {
                version: 3,
                merchantIdentifier: "merchant.com.apdemo", // This is a placeholder
                merchantCapabilities: ["supports3DS"],
                supportedNetworks: ["amex", "discover", "masterCard", "visa"],
                countryCode: "US",
            },
        }];
        
        // Define PaymentDetails
        const paymentDetails = {
            total: {
                label: "Demo (Card is not charged)",
                amount: {
                    value: "27.50",
                    currency: "USD",
                },
            },
        };
        
        // Define PaymentOptions
        const paymentOptions = {
            requestPayerName: false,
            requestBillingAddress: false,
            requestPayerEmail: false,
            requestPayerPhone: false,
            requestShipping: false,
        };
        
        // Create PaymentRequest
        const request = new PaymentRequest(paymentMethodData, paymentDetails, paymentOptions);
            
        request.onmerchantvalidation = event => {
            // Call your own server to request a new merchant session.
            const merchantSessionPromise = validateMerchant();
            event.complete(merchantSessionPromise);
        };
        
        const response = await request.show();
        
        // On successful payment, show a success message
        showToast({
            title: "Payment Successful!",
            description: "Your payment was processed successfully.",
            className: "bg-accent text-accent-foreground border-accent",
        });

        // Complete the payment
        await response.complete("success");

    } catch (e: any) {
        console.error(e);
        showToast({
            variant: "destructive",
            title: "Payment Failed",
            description: e.message || "An unknown error occurred.",
        });
    }
}


interface ApplePayButtonProps {
  className?: string;
}

export function ApplePayButton({ className }: ApplePayButtonProps) {
  const { toast } = useToast();

  const handlePaymentClick = () => {
    onApplePayButtonClicked(toast);
  };

  return (
    <button
      onClick={handlePaymentClick}
      className={cn(
        "w-full h-12 flex items-center justify-center rounded-md bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105 border border-black",
        className
      )}
    >
      <svg
        width="56"
        height="24"
        viewBox="0 0 56 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M36.5878 19.7119C36.938 19.7119 37.2882 19.678 37.6215 19.6102L37.8929 18.0678C37.3912 18.1525 36.8895 18.1864 36.3878 18.1864C35.5345 18.1864 34.8872 17.8475 34.4338 17.1695C33.9804 16.4915 33.7437 15.5593 33.7437 14.3729V9.45763H36.3033V7.91525H33.7437V5.55932L31.8516 4.71186V7.91525H29.566V9.45763H31.8516V14.7119C31.8516 16.5932 32.2783 17.9492 33.1316 18.7831C33.985 19.6169 35.1294 20.0339 36.5878 20.0339V19.7119Z"
          fill="white"
        />
        <path
          d="M44.5714 20C46.5477 20 48.0612 19.4915 49.1118 18.4746C50.1625 17.4576 50.6878 16.0339 50.6878 14.2034C50.6878 12.2881 50.0918 10.8136 48.9002 9.77966C47.7087 8.74576 46.069 8.22881 43.9808 8.22881H40.2321V20H42.124V16.1017H43.9308C44.4825 16.1017 44.9359 16.1186 45.2861 16.1525L45.8378 17.6271L48.1568 20H50.5572L47.8768 17.1864C48.0801 16.9661 48.2665 16.6949 48.4361 16.3729C48.6056 16.0508 48.6904 15.6949 48.6904 15.3051C48.6904 14.339 48.3402 13.6102 47.6402 13.1186C46.9402 12.6271 45.8568 12.3814 44.3904 12.3814H42.124V10.0169H44.1308C46.124 10.0169 47.5345 10.4576 48.3612 11.3424C49.1878 12.2271 49.6012 13.2627 49.6012 14.4492C49.6012 15.6864 49.1604 16.678 48.2783 17.4237C47.3961 18.1695 46.174 18.5424 44.6118 18.5424C44.0265 18.5424 43.4918 18.5254 43.0077 18.4915L42.124 20H44.5714Z"
          fill="white"
        />
        <path
          d="M13.655 14.0753C13.655 12.3333 14.9312 11.5333 16.8112 11.5333C18.655 11.5333 19.855 12.3333 19.855 14.0753C19.855 15.8507 18.6332 16.6333 16.8112 16.6333C14.9673 16.6333 13.655 15.8507 13.655 14.0753ZM16.8112 18.142C19.455 18.142 21.277 16.942 21.7332 14.7087L20.077 14.058C19.755 15.4247 18.542 16.4247 16.8112 16.4247C15.0973 16.4247 13.9312 15.458 13.8332 14.0247H21.8112V13.198C21.8112 10.6333 19.755 8.16601 16.8112 8.16601C14.0112 8.16601 11.8112 10.4927 11.8112 14.0753C11.8112 17.658 13.9943 19.998 16.8112 19.998V18.142Z"
          fill="white"
        />
        <path
          d="M8.83793 11.8082L10.3379 11.1082C10.7063 10.0249 11.8379 9.39958 12.9863 9.39958C13.9863 9.39958 14.6529 9.94124 14.6529 10.6996C14.6529 11.3582 14.1529 11.7249 13.1379 12.2082C12.1063 12.7082 11.0113 13.2582 11.0113 14.6582V14.8082H12.7529V14.6416C12.7529 13.8082 13.2696 13.4582 14.3013 12.9416C15.2863 12.4749 16.4379 11.8916 16.4379 10.5332C16.4379 8.64124 14.9379 7.42458 12.9529 7.42458C10.9863 7.42458 9.38627 8.79124 8.83793 10.3749V11.8082Z"
          fill="white"
        />
        <path
          d="M24.7571 8.42458L22.9571 9.09124C23.2904 8.27458 24.1071 7.69124 25.0237 7.69124C25.7904 7.69124 26.2404 8.09124 26.2404 8.65791C26.2404 9.42458 25.4737 9.87458 25.2237 10.0412L19.4237 14.0912V20.0246H21.2571V15.0246L24.7237 12.4246L25.9904 13.3412V20.0246H27.8237V11.6912L26.3571 10.5746C26.8904 9.92458 28.0237 8.84124 28.0237 8.49124C28.0237 7.49124 26.8237 6.19124 25.0404 6.19124C22.9404 6.19124 21.6571 7.74124 21.0571 8.80791L22.8404 9.50791C23.1404 8.89124 23.8237 8.32458 24.7571 8.42458Z"
          fill="white"
        />
        <path
          d="M5.99182 10.424C5.99182 10.1573 5.92515 9.90731 5.79182 9.67398C5.65848 9.45731 5.47515 9.25731 5.25848 9.10731C4.80848 8.79065 4.25848 8.63231 3.62515 8.63231C2.55848 8.63231 1.72515 9.15731 1.25848 10.0573C0.791818 10.9573 0.558484 12.124 0.558484 13.5573C0.558484 15.024 0.791818 16.2073 1.25848 17.1073C1.72515 18.0073 2.55848 18.5323 3.62515 18.5323C4.25848 18.5323 4.80848 18.374 5.25848 18.0573C5.47515 17.9073 5.65848 17.7073 5.79182 17.4906C5.92515 17.2573 5.99182 17.0073 5.99182 16.7406H4.20848C4.15848 16.8906 4.09182 17.024 4.02515 17.124C3.89182 17.324 3.74182 17.424 3.57515 17.424C3.12515 17.424 2.80848 17.124 2.62515 16.524C2.45848 15.924 2.37515 14.9406 2.37515 13.5573C2.37515 12.174 2.45848 11.1906 2.62515 10.5906C2.80848 9.99065 3.12515 9.69065 3.57515 9.69065C3.74182 9.69065 3.89182 9.79065 4.02515 9.99065C4.09182 10.0906 4.15848 10.224 4.20848 10.374H5.99182V10.424Z"
          fill="white"
        />
        <path
          d="M8.76993 4.708C8.76993 5.758 7.95326 6.59133 6.91993 6.59133C5.88659 6.59133 5.06993 5.758 5.06993 4.708C5.06993 3.658 5.88659 2.82466 6.91993 2.82466C7.95326 2.82466 8.76993 3.658 8.76993 4.708Z"
          fill="white"
        />
      </svg>
    </button>
  );
}
