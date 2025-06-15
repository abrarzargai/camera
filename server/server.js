const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'log.json');

// ✅ Enable CORS for all origins (or configure specific origin)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());


/**
 * GET /log
 * Returns all saved logs from log.json
 */
app.get('/log', (req, res) => {
  if (!fs.existsSync(LOG_FILE)) {
    return res.status(200).json([]); // Return empty array if no log yet
  }

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const logs = content ? JSON.parse(content) : [];

  res.status(200).json(logs);
});


// Handle POST request
app.post('/log', (req, res) => {
  const data = req.body;
  console.log("Received data:", data);

  // Add timestamp if not sent
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString();
  }

  // Read existing data (or initialize array)
  let existing = [];
  if (fs.existsSync(LOG_FILE)) {
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    if (content) {
      existing = JSON.parse(content);
    }
  }

  // Append new data
  existing.push(data);

  // Save to file
  fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));

  res.status(200).json({ message: "Data saved successfully." });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
