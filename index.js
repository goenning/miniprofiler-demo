var express = require('express');
var app = express();

if (app.settings.env === 'development') {
  var ip = require('docker-ip');
  process.env.DATABASE_URL = `postgres://docker:docker@${ip()}:5432/docker`
  process.env.REDIS_URL = `redis://${ip()}:6379`
}

var miniprofiler = require('miniprofiler');
var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);

var pgp = require('pg-promise')({
  // initialization options
});

var db = pgp(process.env.DATABASE_URL);

app.use(miniprofiler.express());
app.use(miniprofiler.express.for(require('miniprofiler-pg')(pgp.pg)));
app.use(miniprofiler.express.for(require('miniprofiler-redis')(redis)));

app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', function(req, res, next) {
  req.miniprofiler.step('Something very slow in here...', function() {
    for(var i=0;i<=100000000;i++) { }
  });

  req.miniprofiler.step('Do some more stuff', function() {
    res.render('index');
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
      client.expire('all-tasks', 10);
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
