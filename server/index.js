import express from 'express';
import cors from 'cors';
import voiceProfilesRouter from './routes/voiceProfiles.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/voice-profiles', voiceProfilesRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});