var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');  
var MongoStore = require('connect-mongo')(session);  
var setting = require('./setting');  

var routes = require('./routes/index');
var users = require('./routes/users');
var ejs = require('ejs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');// app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({  
    secret: setting.cookieSecret,  
    store: new MongoStore({  
        db : setting.db  
    })  
}));  
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
	res.locals.user = req.session.user;
	var err = req.session.error;
	delete req.session.error;
	res.locals.message = '';
	if (err) 
		res.locals.message = '<div class="alert alert-error">' + err + '</div>';
	next();
});

//app.use('/', routes);
app.use('/users', users);

app.get('/', routes.index);
app.all('/login', notAuthentication);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', authentication);
app.get('/logout', routes.logout);
app.get('/home', authentication);
app.get('/home', routes.home);

// authenticate
function authentication(req, res, next) {
	if (!req.session.user) {
		req.session.error='请先登陆';
		return res.redirect('/login');
	}
	next();
}

function notAuthentication(req, res, next) {
	if (req.session.user) {
		req.session.error='已登陆';
		return res.redirect('/');
	}
	next();
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler

// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
    	res.status(err.status || 500);
    	res.render('error', {
      		message: err.message,
      		error: err
    	});
  	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  	res.status(err.status || 500);
  	res.render('error', {
    	message: err.message,
    	error: {}
  	});
});


module.exports = app;
