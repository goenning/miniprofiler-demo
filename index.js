var express = require('express');
var app = express();

if (app.settings.env === 'development') {
  var ip = require('docker-ip');
  process.env.DATABASE_URL = `postgres://docker:docker@${ip()}:5432/docker`
  process.env.REDIS_URL = `redis://${ip()}:6379`
}

var miniprofiler = require('miniprofiler');
var pg = require('pg');
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);
var db = require('pg-promise')()(process.env.DATABASE_URL);

app.use(miniprofiler.express());
app.use(miniprofiler.express.for(require('miniprofiler-pg')(pg)));
app.use(miniprofiler.express.for(require('miniprofiler-redis')(redis)));

app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', function(req, res, next) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('index');
    });
  });
});

app.get("/tasks", function (req, res, next) {
  client.get('all-tasks', function(err, data){
    if (err) { next(err); return; }

    if (data) {
      res.send(JSON.parse(data));
      return
    }

    db.query('SELECT * FROM tasks').then((rows) => {
      client.set('all-tasks', JSON.stringify(rows));
      res.send(rows);
    }).catch(next);
  });
});

app.post("/tasks", function (req, res, next) {
  db.query('INSERT INTO tasks (title, created_on) VALUES ($1, $2)', [ req.query.task, new Date() ]).then(function() {
    res.sendStatus(200);
  }).catch(next);
});

client.flushall(function() {
  app.listen(process.env.PORT || 8080, function(){
    console.log('Connected to postgres %s', process.env.DATABASE_URL)
    console.log('Connected to redis %s', process.env.REDIS_URL)
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
});