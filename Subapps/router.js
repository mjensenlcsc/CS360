const express = require('express');
const router = express.Router();
const request = require('request');
const ejs = require('ejs');

const variables = require('../variables');

router.get('/index.html', (req, res) => {
	res.redirect('/');
});

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/schedule', function(req, res) {
	res.render('schedule');
});

router.get('/scores', function(req, res) {
	ejs.renderFile(__dirname + '/../Views/scores.ejs', {teams: variables.teams}, function(err, str){
		console.info(err || str)
		res.end(ejs.render(str))
	});
});

router.get('/no', function(req, res) {
	res.render('unauthorised');
});

router.get('/admin*', isAuthenticated, function(req, res, next) {
	next();
});

router.get('/admin', function(req, res) {
	res.render('admin/index');
});

router.get('/admin/account', function(req, res) {
	res.render('admin/account');
});

router.get('/admin/logout', function(req, res) {
	delete req.session.auth;
	res.redirect('/');
});

router.get('/admin/schedule', function(req, res) {
	res.render('admin/schedule');
});

router.get('/admin/scores', function(req, res) {
	res.render('admin/scores');
});

router.get('/admin/teams', function(req, res) {
	res.render('admin/teams');
});

router.get('/login', function(req, res) {
	res.render('login', { user : req.user, message: req.flash('message') });
});

router.post('/login', function(req, res) {
	if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
		req.session.auth = true;
		res.redirect('/admin');
	} else {
		req.flash('message', 'Invalid username or password.');
		res.redirect('/login');
	}
});


module.exports = {
	router: router
};

function isAuthenticated(req, res, next) {
	if (req.session.auth) return next();
	else res.redirect('/no');
}
