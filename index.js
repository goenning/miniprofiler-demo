var express = require('express')
  , miniprofiler = require('miniprofiler')
  , app = express();

app.set('view engine', 'pug');
app.use(miniprofiler.express());
app.use((req, res, next) => {
  res.locals.miniprofiler = req.miniprofiler;
  next();
});

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('index');
    });
  });
});

app.listen(8080);