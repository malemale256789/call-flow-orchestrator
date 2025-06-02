# Call Flow Orchestrator

The Call Flow Orchestrator is a web application designed to manage and initiate automated call scripts using configurable voice profiles and backend services. This application provides a user interface to configure call parameters, select voice profiles (powered by ElevenLabs for Text-to-Speech), and trigger calls through a backend system that utilizes Twilio for programmable voice capabilities.

## Key Features

-   **Dynamic Call Scenarios**: Initiate calls for various pre-defined scenarios such as Generic OTP, PGP Forwarding, Card Information Capture, SSN Capture, PIN Capture, and more.
-   **Interactive Call Control (Simulated)**: For scenarios requiring OTP validation or step-by-step guidance, the frontend provides UI controls to (simulate) manage the call flow in real-time.
-   **Voice Profile Management**: Manage and select different voice profiles for calls. These profiles are intended to map to ElevenLabs voices for generating speech.
-   **Configurable Settings**: Allows configuration of essential parameters like Ngrok URL, Twilio details (Account SID, Phone Number), and spoof numbers. Sensitive keys like API tokens are intended to be managed securely by the backend.
-   **User-Friendly Interface**: Built with React, TypeScript, and Tailwind CSS for a modern and responsive user experience.
-   **Modular Design**: Services for fetching voice profiles, settings, and initiating calls are separated for better maintainability.

## Technology Stack (Frontend)

-   **React**: A JavaScript library for building user interfaces.
-   **TypeScript**: Adds static typing to JavaScript for improved code quality and maintainability.
-   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
-   **React Router**: For handling client-side routing within the application.

## How It Works (Conceptual)

1.  **Configuration**:
    *   Users can configure application settings, such as API endpoints (Ngrok URL) and call parameters (default spoof numbers).
    *   Voice profiles are managed, linking friendly names to specific ElevenLabs voice IDs.
2.  **Call Initiation & Management**:
    *   On the Dashboard, users select a call scenario.
    *   They fill in the required parameters and select a voice profile.
    *   The application sends this payload to a backend server.
    *   **For scenarios requiring real-time interaction (e.g., OTP validation):**
        *   The frontend simulates receiving updates from the backend (e.g., "OTP captured").
        *   The UI presents options to the operator (e.g., "Accept OTP", "Deny OTP").
        *   Operator commands are (simulated as) sent back to the backend to drive the next step of the call.
3.  **Backend Processing (Assumed for a Live System)**:
    *   The backend server receives requests and commands from the frontend.
    *   It uses the selected ElevenLabs voice ID and script text to generate audio via the ElevenLabs API.
    *   It uses the Twilio Programmable Voice API to initiate and manage outbound calls.
    *   It plays generated audio, handles DTMF input, records calls, and executes scenario-specific logic.
    *   **For real-time interactive calls**, the backend would need to use **WebSockets** (or a similar technology) to:
        *   Push events to the frontend (e.g., "call answered", "DTMF received", "OTP captured").
        *   Receive commands from the frontend (e.g., "proceed to ask OTP", "accept OTP", "play this message").

## Application Structure

The frontend application is structured into several main parts:

-   **`pages/`**: Top-level components for routes (Dashboard, Scripts, Settings).
-   **`components/`**: Reusable UI components (common, layout, calls).
-   **`services/`**: Modules for interacting with backend APIs or mock data.
-   **`types.ts`**: TypeScript interfaces and types.
-   **`constants.ts`**: Global constants and scenario definitions.
-   **`App.tsx`**: Main application component (routing, layout).
-   **`index.tsx`**: React application entry point.

## Integrating with a Live Backend

The current frontend application uses mock services to simulate backend interactions. To connect to a real backend that handles ElevenLabs TTS and Twilio calls, you will primarily need to modify the files in the `services/` directory.

1.  **`services/callService.ts`**:
    *   **`initiateCall(payload)`**: Modify this function to make an HTTP POST request to your backend endpoint responsible for starting a new call. The `payload` contains the scenario type, parameters, and selected voice ID. The backend should return a call ID and initial status.
    *   **`processOperatorCommand(sessionId, command)` (if implementing full frontend control)**: This function (or similar logic) would send commands to your backend via WebSockets (e.g., "play initial prompt," "request OTP," "validate OTP"). The backend would execute the command in the live Twilio call and report back the result/next state.
    *   **`pollForLiveCallUpdates(...)`**: This polling mechanism is a **simulation placeholder** for WebSockets. In a real implementation, you would replace this with WebSocket event listeners that update the `ActiveCallSession` state in `DashboardPage.tsx` when the backend pushes real-time events (e.g., call answered, DTMF input received, OTP captured).
    *   **Expected Backend Behavior for Calls**:
        *   Accept call initiation requests.
        *   Manage the Twilio call lifecycle.
        *   Interface with ElevenLabs to generate audio based on script parts and selected voice.
        *   Play audio, gather DTMF, handle call logic as per the scenario.
        *   For interactive flows, communicate with the frontend via WebSockets, sending updates and receiving commands.

2.  **`services/voiceProfileService.ts`**:
    *   **`fetchVoiceProfiles()`**: Change this to fetch the list of available voice profiles (mapping to ElevenLabs voices) from your backend API.
    *   **`fetchVoiceProfileById(id)`**: Implement to fetch a single profile.
    *   You might also implement `createVoiceProfile`, `updateVoiceProfile`, `deleteVoiceProfile` to make API calls to manage these profiles on your backend if the backend supports storing/managing them. Otherwise, these might be configured directly in the backend or an ElevenLabs account.

3.  **`services/settingsService.ts`**:
    *   **`fetchSettings()`**: Modify to retrieve application settings from your backend.
    *   **`updateSettings(newSettings)`**: Modify to send updated settings to your backend.
    *   Your backend would be responsible for securely storing and using sensitive keys (Twilio Auth Token, ElevenLabs API Key, Bot Token). The frontend should only handle non-sensitive settings or display masked values for sensitive ones if needed for informational purposes.

**Important Considerations for Real-Time Interaction:**

*   The advanced step-by-step call control simulated in the frontend (where the operator clicks buttons to drive each part of the call script) **heavily relies on a responsive backend with WebSocket support.**
*   The Python backend (`otp.py` and `main.py` from the initial context) would need significant modifications to:
    *   Implement a WebSocket server (e.g., using Flask-SocketIO or FastAPI's WebSocket support).
    *   Break down its call handling logic into smaller, commandable steps.
    *   Listen for commands from the frontend via WebSockets.
    *   Push status updates and captured data (like DTMF or OTPs) to the frontend via WebSockets.

## Getting Started (Frontend Development)

This project is set up to be a frontend application.

1.  Ensure you have Node.js and npm/yarn installed.
2.  The `index.html` uses ESM imports via `esm.sh` for React and related libraries, meaning no local `node_modules` installation is strictly required for these dependencies to run in a browser that supports `type="importmap"`.
3.  To serve the `index.html` and related `.tsx` files, you can use a simple live server extension in your IDE (like Live Server for VS Code) or a basic HTTP server.
4.  The application expects a backend to be running to handle call initiation and TTS generation. The current `callService.ts` mocks many of these interactions. Refer to the "Integrating with a Live Backend" section for details on connecting to your actual backend.
