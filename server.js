const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  if (title && text) {
    const newNote = { id: uuidv4(), title, text };

    fs.readFile('db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to read notes' });
      }

      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile('db/db.json', JSON.stringify(notes, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to save note' });
        }
        res.json(newNote);
      });
    });
  } else {
    res.status(400).json({ error: 'Note must have a title and text' });
  }
});

// BONUS: DELETE Route
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }

    const notes = JSON.parse(data);
    const updatedNotes = notes.filter(note => note.id !== noteId);

    fs.writeFile('db/db.json', JSON.stringify(updatedNotes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ message: 'Note deleted', noteId });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});