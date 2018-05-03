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
api.get('/ratings/today/summary', function(req, res){ // Get today's ratings
  pool.query('SELECT * FROM Ratings WHERE TimeSubmitted > CURDATE()', function (err, results, fields){
    if (err) console.log(err);
    var summary = {}
    var promises = []
    for (var l in results) {
      var date = new Date(results[l].TimeSubmitted)
      promises.push(new Promise(function(resolve){
        getService(date).then(function(service){
          date.setUTCHours(0,0,0,0)
          var d = date.toISOString()
          summary[d] = summary[d] || {}
          summary[d][service] = summary[d][service] || {1:0,2:0,3:0,4:0,5:0}
          summary[d][service][results[l].Rating] ++
          resolve()
        })
      }))
    }
    Promise.all(promises).then(function(){
      console.log("All promises resolved");
      res.json(summary);
    })
  });
});
api.get('/ratings/all', function(req, res){ // Get every rating ever for all time
  pool.query('SELECT * FROM Ratings', function (err, results, fields){
    if (err) console.log(err);
    res.json(results);
  });
});
api.get('/ratings/daysAgo/:days/summary', function(req, res){ // Get ratings from ":days" days ago. Also supports >, < or = eg ">5" to get all ratings at least 5 days old
  var operator = req.params.days[0]
  var daysAgo = req.params.days.slice(1)
  if (operator != "<" && operator != ">" && operator != "=") {
    operator = "="
    daysAgo = req.params.days
  }
  var gtstring = "TimeSubmitted < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL ? DAY), INTERVAL 1 DAY)"
  var ltstring = "TimeSubmitted > DATE_SUB(CURDATE(), INTERVAL ? DAY)"
  var eqstring = gtstring+" AND "+ltstring
  pool.query('SELECT * FROM Ratings WHERE '+(operator == "=" ? eqstring : operator == ">" ? gtstring : operator == "<" ? ltstring : "TRUE")+" ORDER BY TimeSubmitted", (operator == "=" ? [daysAgo, daysAgo] : daysAgo), function (err, results, fields){
    if (err) console.log(err);
    var summary = {}
    var promises = []
    for (var l in results) {
      promises.push(new Promise(function(resolve){
        var date = new Date(results[l].TimeSubmitted)
        var rating = results[l].Rating
        getService(date).then(function(service){
          date.setUTCHours(0,0,0,0)
          var d = date.toISOString()
          summary[d] = summary[d] || {}
          summary[d][service] = summary[d][service] || {1:0,2:0,3:0,4:0,5:0}
          summary[d][service][rating] ++
          resolve()
        })
      }))
    }
    Promise.all(promises).then(function(){
      res.json(summary);
    })
  });
});
api.get('/ratings/daysAgo/:days', function(req, res){ // Get ratings from ":days" days ago. Also supports >, < or = eg ">5" to get all ratings at least 5 days old
  var operator = req.params.days[0]
  var daysAgo = req.params.days.slice(1)
  if (operator != "<" && operator != ">" && operator != "=") {
    operator = "="
    daysAgo = req.params.days
  }
  var gtstring = "TimeSubmitted < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL ? DAY), INTERVAL 1 DAY)"
  var ltstring = "TimeSubmitted > DATE_SUB(CURDATE(), INTERVAL ? DAY)"
  var eqstring = gtstring+" AND "+ltstring
  pool.query('SELECT * FROM Ratings WHERE '+(operator == "=" ? eqstring : operator == ">" ? gtstring : operator == "<" ? ltstring : "TRUE")+" ORDER BY TimeSubmitted", (operator == "=" ? [daysAgo, daysAgo] : daysAgo), function (err, results, fields){
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
api.get('/feedback/daysAgo/:days', function(req, res){ // Get feedback from ":days" days ago. Also supports >, < or = eg ">5" to get all feedback at least 5 days old
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
  fs.readFile('config.json', 'utf8', function readConfigCallback(err, conf){
    if (err){
      console.log(err);
    } else {
      var config = JSON.parse(conf);
      var weekBaseDate = new Date(config.weekBaseDate)
      var now = new Date()
      var difference = Math.floor((now.getTime()-weekBaseDate.getTime())/(1000*60*60*24*7)) // Finds the difference in time between the time right now and the time in the database in milliseconds. Divides this by 1 week then floors it to find the number of weeks.
      var week = (config.weekOnWeekBaseDate+difference+29999)%3+1 // Taking it mod 3 BUT so that it gives 1, 2 or 3 not 0, 1 or 2
      fs.readFile('menu.json', 'utf8', function readMenuCallback(err, data){
        if (err){
          console.log(err);
        } else {
          var menu = JSON.parse(data);
          var daysMenu = menu[week.toString()][now.getDay().toString()]
          daysMenu.week = week.toString()
          daysMenu.day = now.getDay().toString()
          res.json(daysMenu)
        }
      });
    }
  });
});
api.get('/menu/onDate/:date', function(req, res){ // Get menu on particular date
  fs.readFile('config.json', 'utf8', function readConfigCallback(err, conf){
    if (err){
      console.log(err);
    } else {
      var config = JSON.parse(conf);
      var weekBaseDate = new Date(config.weekBaseDate)
      var now = new Date(req.params.date)
      var difference = Math.floor((now.getTime()-weekBaseDate.getTime())/(1000*60*60*24*7))// Finds the difference in time between the time right now and the time in the database in milliseconds. Divides this by 1 week then floors it to find the number of weeks.
      var week = (parseInt(config.weekOnWeekBaseDate)+difference+29999)%3+1 // Taking it mod 3 BUT so that it gives 1, 2 or 3 not 0, 1 or 2
      fs.readFile('menu.json', 'utf8', function readMenuCallback(err, data){
        if (err){
          console.log(err);
        } else {
          var menu = JSON.parse(data);
          var daysMenu = menu[week.toString()][now.getDay().toString()]
          daysMenu.week = week.toString()
          daysMenu.day = now.getDay().toString()
          res.json(daysMenu)
        }
      });
    }
  });
});
api.get('/menu/whatWeek/:date', function(req, res){ // Get today's menu
  fs.readFile('config.json', 'utf8', function readConfigCallback(err, conf){
    if (err){
      console.log(err);
    } else {
      var config = JSON.parse(conf);
      var weekBaseDate = new Date(config.weekBaseDate)
      var now = new Date(req.params.date)
      var difference = Math.floor((now.getTime()-weekBaseDate.getTime())/(1000*60*60*24*7))// Finds the difference in time between the time right now and the time in the database in milliseconds. Divides this by 1 week then floors it to find the number of weeks.
      var week = (parseInt(config.weekOnWeekBaseDate)+difference+29999)%3+1 // Taking it mod 3 BUT so that it gives 1, 2 or 3 not 0, 1 or 2
      res.json({week:week})
    }
  });
});

api.post('/setWeek/:week', function(req, res){ // Set the week
  var now = new Date()
  now.setUTCHours(0,0,0,0)
  now.setDate(now.getDate() - ((now.getDay()-1)%7))
  fs.readFile('config.json', 'utf8', function readConfigCallback(err, data){
    if (err){
      console.log(err);
    } else {
      var config = JSON.parse(data || "{}");
      config.weekBaseDate = now.toISOString()
      config.weekOnWeekBaseDate = req.params.week
      fs.writeFile('config.json', JSON.stringify(config), 'utf8', function writeConfigCallback(err, data){
        if (err) {
          console.log(err);
          res.status(404).json(req.body)
        } else {
          res.status(200).json({success: true, message: 'Week set to '+req.params.week});
        };
      });
    }
  });
});

api.get('/currentService', function(req, res){ // Get all feedback ever for all time
  var now = new Date()
  getService(now).then(function(value){return res.json({meal:value})})
});

api.get('/config/showCommentBox', function(req, res){ // Get all feedback ever for all time
  var now = new Date()
  fs.readFile('config.json', 'utf8', function readConfigCallback(err, data){
    if (err){
      console.log(err);
    } else {
      var config = JSON.parse(data || "{}");
      return res.json(config.showCommentBox || {value:false})
    }
  })
});

function getService(time){
  var p = new Promise(function(resolve){
    fs.readFile('config.json', 'utf8', function readConfigCallback(err, data){
      if (err){
        console.log(err);
      } else {
        var config = JSON.parse(data || "{}");
        var h = time.getUTCHours()
        if (h >= (config.breakFastStartTime || 6) && h < (config.breakfastEndTime || 10)) {
          resolve('breakfast')
        }
        if (h >= (config.lunchStartTime || 10) && h < (config.lunchEndTime || 15)) {
          resolve('lunch')
        }
        if (h >= (config.supperStartTime || 15) && h < (config.supperEndTime || 20)) {
          resolve('supper')
        }
        else resolve('outOfHours')
      }
    })
  })
  return p
}

app.use(API_STEM_V1,api)

app.listen(PORT);
console.log("API server started on localhost:"+PORT)
