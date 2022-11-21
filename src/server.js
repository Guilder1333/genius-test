const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const cors = require("cors");
const corsOptions = {
   origin: '*',
   credentials: true,
   optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

let db = null;
const dbPath = __dirname + "/data.db";
db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_FULLMUTEX, function (error) {
   if (error) {
      db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE | sqlite3.OPEN_FULLMUTEX, function (error) {
         if (error) {
            console.error("Failed to open or create new database");
            console.error(error);
         } else {
            console.log("Database was initialized");
            db.run("CREATE TABLE list (id INTEGER PRIMARY KEY, time TIMESTAMP default (strftime('%s', 'now')), content TEXT, done INTEGER default 0)");
         }
      });
   }
});

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/list", function (req, res) {
   db.all("SELECT * FROM list", function (err, rows) {
      res.end(JSON.stringify({
         items: rows,
         error: err
      }));
   });
});

app.post("/api/create", function (req, res) {
   db.run("INSERT INTO list (content) VALUES (?)", req.body.text, function () {
      if (this.lastID === undefined) {
         res.end(JSON.stringify({error: "Failed to store item"}));
      } else {
         db.get("SELECT * FROM list WHERE id = ?", this.lastID, function (err, row) {
            res.end(JSON.stringify({item: row}));
         });
      }
   });
});

app.get("/api/remove", function (req, res) {
   db.run("DELETE FROM list WHERE id = ?", req.query.id, function () {
      if (this.changes) {
         res.end(JSON.stringify({}));
      } else {
         res.end(JSON.stringify({error: "Failed to delete item"}));
      }
   });
});

app.get("/api/mark", function (req, res) {
   db.run("UPDATE list SET done = ? WHERE id = ?", req.query.done, req.query.id, function () {
      if (this.changes) {
         res.end(JSON.stringify({}));
      } else {
         res.end(JSON.stringify({error: "Failed to update item"}));
      }
   });
});

app.listen(port, () => console.log(`Listening on port ${port}`));