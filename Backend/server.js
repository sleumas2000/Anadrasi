'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mysql      = require('mysql');
var fs         = require('fs');

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'anadrasi',
  password : '@~fIazR*',
  database : 'anadrasi'
});

var PORT = process.env.PORT || 6225;
var API_STEM_V1 = "/api/v1"

var app = express();
var api = express.Router();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, x-confirm-delete, x-access-token');
  if (req.method === 'OPTIONS') {
    var headers = {};
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-HTTP-Method-Override, x-confirm-delete, x-access-token');
    res.end()
  } else {
    next();
  }
});

api.get('/ratings/today', function(req, res){ // Get today's ratings
  pool.query('SELECT * FROM Ratings WHERE TimeSubmitted > CURDATE()', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/ratings/all', function(req, res){ // Get every rating ever for all time
  pool.query('SELECT * FROM Ratings', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/ratings/daysago/:days', function(req, res){ // Get ratings from ":days" days ago. Also supports >, < or = eg ">5" to get all ratings at least 5 days old
  var operator = req.params.days[0]
  var daysAgo = req.params.days.slice(1)
  if (operator != "<" && operator != ">" && operator != "=") {
    operator = "="
    daysAgo = req.params.days
  }
  var gtstring = "TimeSubmitted < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL ? DAY), INTERVAL 1 DAY)"
  var ltstring = "TimeSubmitted > DATE_SUB(CURDATE(), INTERVAL ? DAY)"
  var eqstring = gtstring+" AND "+ltstring
  pool.query('SELECT * FROM Ratings WHERE '+(operator == "=" ? eqstring : operator == ">" ? gtstring : operator == "<" ? ltstring : "TRUE"), (operator == "=" ? [daysAgo, daysAgo] : daysAgo), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});

api.post('/rate/:rating', function(req, res){ // Submit a rating to the database
  pool.query('INSERT INTO Ratings SET Rating = ?', [req.params.rating], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});

api.get('/feedback/today', function(req, res){ // Get today's feedback
  pool.query('SELECT * FROM Feedback WHERE TimeSubmitted > CURDATE()', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/feedback/all', function(req, res){ // Get all feedback ever for all time
  pool.query('SELECT * FROM Feedback', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/feedback/daysago/:days', function(req, res){ // Get feedback from ":days" days ago. Also supports >, < or = eg ">5" to get all feedback at least 5 days old
  var operator = req.params.days[0]
  var daysAgo = req.params.days.slice(1)
  if (operator != "<" && operator != ">" && operator != "=") {
    operator = "="
    daysAgo = req.params.days
  }
  var gtstring = "TimeSubmitted < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL ? DAY), INTERVAL 1 DAY)"
  var ltstring = "TimeSubmitted > DATE_SUB(CURDATE(), INTERVAL ? DAY)"
  var eqstring = gtstring+" AND "+ltstring
  pool.query('SELECT * FROM Feedback WHERE '+(operator == "=" ? eqstring : operator == ">" ? gtstring : operator == "<" ? ltstring : "TRUE"), (operator == "=" ? [daysAgo, daysAgo] : daysAgo), function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});

api.post('/feedback', function(req, res){ // Submit feedback to the database
  pool.query('INSERT INTO Feedback SET Comment = ?', [req.body.comment], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json(req.body);
    };
  });
});

api.get('/menu/today', function(req, res){ // Get today's menu
  pool.query('SELECT * FROM Config WHERE Setting = "weekOnWeekBaseDate" OR Setting = "weekBaseDate"', function(err, results, fields){
    if (results.length != 2) {return res.json({success: false, message: "Something isn't configured right. I don't know what week it is"})}
    for (var i in results) { // set those settings from the config read
      if (results[i].Setting == "weekOnWeekBaseDate") {
        var weekOnWeekBaseDate = results[i].Value
      } else if (results[i].Setting == "weekBaseDate") {
        var weekBaseDate = new Date(results[i].Value)
      } else {console.log("SQL is broken");return res.json({success: false, message: "Something isn't configured right. I don't know what week it is"})} // This shouldn't happen. Ever
    }
    var now = new Date()
    var difference = Math.floor((now.getTime()-weekBaseDate.getTime())/(1000*60*60*24*7)) // Finds the difference in time between the time right now and the time in the database in milliseconds. Divides this by 1 week then floors it to find the number of weeks.
    var week = (weekOnWeekBaseDate+difference-1)%3+1 // Taking it mod 3 BUT so that it gives 1, 2 or 3 not 0, 1 or 2
    pool.query('SELECT * FROM Menu WHERE Week = ? AND Day = ?', [week, now.getDay()], function (err, results, fields){
      if (err) console.log(err);
      results.push({success: false, message:"No data"})
      res.json(results[0]);
    });
  });
});

api.post('/setWeek/:week', function(req, res){ // Set the week
  var now = new Date()
  now.setUTCHours(0,0,0,0)
  now.setDate(now.getDate() - ((now.getDay()-1)%7))
  console.log(now.toISOString())
  pool.query('REPLACE INTO Config(Setting, Value) VALUES ("weekBaseDate", ?), ("weekOnWeekBaseDate", ?)', [now.toISOString(),req.params.week], function(err, results, fields){
    if (err) {
      console.log(err);
      res.status(404).json(req.body)
    } else {
      res.status(200).json({success: true, message: 'Week set to '+req.params.week});
    };
  });
});


app.use(API_STEM_V1,api)

app.listen(PORT);
console.log("Webserver started on localhost:"+PORT)
