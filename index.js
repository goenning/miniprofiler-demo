require('dotenv').config();

var express = require('express')
  , miniprofiler = require('miniprofiler')
  , app = express()
  , pg = require('pg')

app.use(miniprofiler.express());
app.use(miniprofiler.express.for(require('miniprofiler-pg')(pg)));
app.use((req, res, next) => {
  res.locals.miniprofiler = req.miniprofiler;
  next();
});

app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('index');
    });
  });
});

app.get("/tasks", function (req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM tasks', [ ], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

app.post("/tasks", function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('INSERT INTO tasks (title, created_on) VALUES ($1, $2)', [ request.query.task, new Date() ], function(err, result) {
      done();
      response.sendStatus(200);
    });
  });
});

app.listen(process.env.PORT || 8080, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});