// Server setup
const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');

// App setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');
app.use(favicon(process.cwd() + "/Public/favicon.ico"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'Public')));
app.use(session({ secret: process.env.SECRET }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())

// Router setup
let routes = require('./Subapps/router');

// Start listening
server.listen(Number(process.env.PORT || "5000"), function() {

	console.log("Listening...");
});

app.use(function(req, res, next) {

	// Skip checks if we're running local.
	if (req.hostname == "localhost")
	{
		next();
		return;
	}

	let protocol = req.protocol;

	// Redirect to secure official domain if we're not secure or not on the official domain.
	if (req.hostname == "bitbossbattles.herokuapp.com" || protocol != "https")
	{
		res.redirect(301, "https://www.bitbossbattles.io" + req.originalUrl);
	}
	else
	{
		next();
	}
});

app.use(function checkAuth(req, res, next) {
	if (req.url.startsWith('/admin') && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
	}
	next();
});

// Mount the routers.
app.use('/', routes.router);

// Catch 404 and render the 404 page
app.use(function(req, res, next){

	res.status(404);

	// Respond with html page
	if (req.accepts('html'))
	{
		res.send('Not found: '+req.protocol +'://'+req.get('host')+req.baseUrl+req.url);
		return;
	}

	// Respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found', url: req.protocol +'://'+req.get('host')+req.baseUrl+req.url });
		return;
	}

	// Default to plain-text. send()
	res.type('txt').send('Not found: '+req.protocol +'://'+req.get('host')+req.baseUrl+req.url);
});

/// Error handlers

// Development error handler will print stacktrace
if (app.get('env') === 'development')
{
	app.use(function(err, req, res, next)
	{
		res.status(err.status || 500);
		res.send("An error has occured. Please contact the site administrator if you would like to help resolve this issue.<br><br>"+err.message);
	});
}

// Production error handler where no stacktraces leaked to user
app.use(function(err, req, res, next)
{
	res.status(err.status || 500);
    res.send("An error has occured. Please contact the site administrator if you would like to help resolve this issue.<br><br>"+err.message);
});

module.exports = app;
