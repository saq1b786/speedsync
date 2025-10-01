
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database(path.join(__dirname, 'race_results.db')); //connection to the server to the database 



// returns the race times sorted by time which is the most important!
app.get('/results', (req, res) => {
  db.all('SELECT * FROM results ORDER BY finish_time ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get('/api/admin/results', (req, res) => {
  db.all(`
    SELECT 
      id,
      runner_number AS runnerNumber, 
      finish_time AS finishTime,
      recorded_at AS recordedAt
    FROM results 
    ORDER BY finish_time ASC
  `, (err, rows) => {
    if (err) {
      console.error('Admin results error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Database error' 
      });
    }
    res.json({
      success: true,
      data: rows
    });
  });
});


// POST the results with batch insertion to the database 


app.post('/results', (req, res) => {
  console.log('Received data:', req.body); 
  
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ 
      success: false,
      error: 'Expected array of results' 
    });
  }

  db.serialize(() => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO results (runner_number, finish_time, recorded_at)
      VALUES (?, ?, ?)
    `);

    const now = new Date().toISOString();
    let insertedCount = 0;

    req.body.forEach(result => {
      stmt.run(
        result.runner_number,
        result.finish_time,
        result.recorded_at || now,
        function(err) {
          if (err) {
            console.error('Error inserting result:', err);
          } else {
            insertedCount++;
            console.log(`Inserted runner #${result.runner_number}`);
          }
        }
      );
    });

    stmt.finalize(err => {
      if (err) {
        console.error('Statement finalize error:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Database error' 
        });
      }
      res.json({ 
        success: true,
        inserted: insertedCount
      });
    });
  });
});




app.delete('/api/results/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM results WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Database error' 
      });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'No result found with that ID'
      });
    }
    
    res.json({ 
      success: true,
      deleted: this.changes
    });
  });
});


app.get('/api/debug/sync-status', (req, res) => {
  db.get("SELECT COUNT(*) as count FROM results", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      recordCount: row.count,
      lastRecord: new Date().toISOString()
    });
  });
});





app.delete('/results', (req, res) => {
  db.run('DELETE FROM results', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'All server results cleared' });
  });
});



// shutdown message when the server shuts down 
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close(() => {
    console.log('📦 SQLite database closed.');
    process.exit(0);
  });
});


// i put this at the end so everything on the server loads up first before listening on the port 
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});