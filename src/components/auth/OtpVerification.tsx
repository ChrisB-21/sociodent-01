import React, { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

interface OtpVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  phoneNumber,
  onVerified,
  onCancel,
  onError
}) => {
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  // Setup recaptcha when component mounts
  useEffect(() => {
    // Clear any existing recaptcha
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log("Error clearing recaptcha:", e);
      }
      window.recaptchaVerifier = undefined;
    }

    // Small delay to ensure the DOM element is available
    setTimeout(() => {
      try {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          console.error("recaptcha-container element not found");
          onError("reCAPTCHA container not found. Please refresh and try again.");
          return;
        }

        // Initialize the reCAPTCHA verifier with normal size for better visibility
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            console.log("reCAPTCHA verified successfully");
          },
          'expired-callback': () => {
            // Reset reCAPTCHA
            if (window.recaptchaVerifier) {
              try {
                window.recaptchaVerifier.clear();
              } catch (e) {
                console.log("Error clearing recaptcha:", e);
              }
              window.recaptchaVerifier = undefined;
            }
            onError("reCAPTCHA has expired. Please refresh the page and try again.");
          }
        });

        // Render the reCAPTCHA widget
        window.recaptchaVerifier.render().then((widgetId: number) => {
          console.log("reCAPTCHA widget rendered with ID:", widgetId);
        });
      } catch (error: any) {
        console.error("Error initializing recaptcha:", error);
        onError("Failed to initialize verification. Please refresh and try again.");
      }
    }, 500); // 500ms delay to ensure DOM is ready

    // Clean up recaptcha when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log("Error clearing recaptcha:", e);
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, [onError]);

  // Timer countdown
  useEffect(() => {
    if (isSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSent, timer]);

  // Function to send OTP
  const sendOtp = async () => {
    try {
      // Check if recaptchaVerifier is initialized
      if (!window.recaptchaVerifier) {
        console.error("reCAPTCHA verifier not initialized");
        onError("reCAPTCHA not initialized. Please refresh the page.");
        return;
      }

      setIsLoading(true);

      // Format phone number for international format (ensuring it has country code)
      let formattedPhoneNumber = phoneNumber.trim();
      formattedPhoneNumber = formattedPhoneNumber.replace(/\s+/g, '').replace(/-/g, '');

      // Check if the number already has a country code
      if (!formattedPhoneNumber.startsWith('+')) {
        // Add +91 prefix for Indian numbers
        formattedPhoneNumber = `+91${formattedPhoneNumber}`;
      }

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmationResult;
      setIsSent(true);
      setIsLoading(false);
      setTimer(60);
      setOtp("");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setIsLoading(false);

      // Provide more user-friendly error messages
      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Please enter a valid phone number with country code.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = "reCAPTCHA verification failed. Please try again.";
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = "Verification quota exceeded. Please try again tomorrow.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.code === 'auth/timeout') {
        errorMessage = "Request timed out. Please check your internet connection and try again.";
      } else if (error.message && error.message.includes('network')) {
        errorMessage = "Network connection error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      onError(errorMessage);

      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log("Error clearing recaptcha:", e);
        }
        window.recaptchaVerifier = undefined;
      }
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      onError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      if (!window.confirmationResult) {
        throw new Error("Verification session expired. Please request a new OTP.");
      }

      // Confirm the OTP
      await window.confirmationResult.confirm(otp);

      setIsLoading(false);
      onVerified();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setIsLoading(false);

      let errorMessage = "Invalid OTP. Please try again.";
      if (error.code === 'auth/code-expired') {
        errorMessage = "Verification code has expired. Please request a new one.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      onError(errorMessage);
    }
  };

  // Function to resend OTP
  const resendOtp = async () => {
    setTimer(60);
    setOtp("");
    setIsSent(false);

    // Reset recaptcha
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log("Error clearing recaptcha:", e);
      }
      window.recaptchaVerifier = undefined;
    }

    try {
      // Initialize new recaptcha with normal size
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          console.log("reCAPTCHA solved on resend");
        },
        'expired-callback': () => {
          onError("reCAPTCHA has expired. Please refresh and try again.");
        }
      });

      // Render the reCAPTCHA widget
      await window.recaptchaVerifier.render();
      // Send OTP again after a short delay
      setTimeout(() => {
        sendOtp();
      }, 1000);
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      onError("Failed to resend verification code. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Phone Verification</h3>
      <p className="text-gray-600 mb-4 text-center">
        {isSent
          ? `We have sent a verification code to ${phoneNumber}`
          : `Verify your phone number ${phoneNumber}`
        }
      </p>

      {!isSent ? (
        <div>
          {/* reCAPTCHA will be rendered here */}
          <div id="recaptcha-container" className="flex justify-center mb-4"></div>
          <button
            onClick={sendOtp}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg mb-2 hover:bg-blue-700 transition"
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-wider"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              {timer > 0 ? `Resend in ${timer}s` : "Didn't receive code?"}
            </span>
            <button
              onClick={resendOtp}
              disabled={timer > 0 || isLoading}
              className={`text-sm ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
            >
              Resend Code
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;
