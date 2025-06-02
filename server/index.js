import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import ngrok from 'ngrok';
import { router as voiceProfilesRouter } from './routes/voiceProfiles.js';
import { router as callsRouter } from './routes/calls.js';
import { router as settingsRouter } from './routes/settings.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio webhooks

// Routes
app.use('/api/voice-profiles', voiceProfilesRouter);
app.use('/api/calls', callsRouter);
app.use('/api/settings', settingsRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;

// Start the server and ngrok
(async function startServer() {
  try {
    // Start the HTTP server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Start ngrok tunnel
    if (process.env.NGROK_AUTHTOKEN) {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN
      });
      console.log(`Ngrok tunnel established at: ${url}`);
      
      // Store the ngrok URL for use in Twilio webhook URLs
      app.locals.ngrokUrl = url;
    } else {
      console.log('Ngrok authtoken not found. Skipping tunnel creation.');
    }
  } catch (error) {
    console.error('Error starting server:', error);
  }
})();

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await ngrok.kill();
  process.exit(0);
});