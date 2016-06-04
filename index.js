var express = require('express')
  , miniprofiler = require('miniprofiler')
  , app = express();

app.set('view engine', 'pug');
app.use(miniprofiler.profile());

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('home');
    });
  });
});

app.listen(8080);