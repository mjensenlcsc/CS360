const express = require('express');
const router = express.Router();
const request = require('request');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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
	res.render('scores');
});

router.get('/login', function(req, res) {
	res.render('login');
});

router.get('/admin/', function(req, res) {
	res.render('admin/index.ejs');
});

router.get('/admin/account', function(req, res) {
	res.render('admin/account');
});

router.get('/admin/logout', function(req, res) {
	req.logout();
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


router.post('/login', (req, res, next) => {
	passport.authenticate('local', { successRedirect: '/admin',
                                   failureRedirect: '/login',
                                   failureFlash: true });
});










passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, user);
    });
  }
));

module.exports = {

	router: router
};
