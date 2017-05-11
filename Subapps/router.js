const express = require('express');
const router = express.Router();
const request = require('request');
const ejs = require('ejs');

const authenticate = require('./auth');
const variables = require('../variables');
const firebase = require('../firebase');

router.get('/index.html', (req, res) => {
	res.redirect('/');
});

router.get('/', function(req, res) {
	res.redirect('/schedule');
});

router.get('/schedule', function(req, res) {
	res.render('schedule', {weeks: variables.weeks, teams: variables.teams});
});

router.get('/scores', function(req, res) {
	let sorted = [];
	for (team in variables.teams) sorted.push(variables.teams[team]);
	sorted.sort(function(a,b){return a.Name.localeCompare(b.Name)});

	ejs.renderFile(__dirname + '/../Views/scores.ejs', {teams: sorted}, function(err, str){
		res.end(ejs.render(str))
	});
});

router.get('/no', function(req, res) {
	res.render('unauthorised');
});

router.get('/admin*', authenticate.isAuthenticated, function(req, res, next) {
	next();
});

router.get('/admin', function(req, res) {
	res.redirect('/admin/scores');
});

router.get('/admin/account', function(req, res) {
	res.render('admin/account', { isOwner: firebase.firebase.auth().currentUser.email.split('@')[0] === 'owner', passFail: null, message: req.flash('message') });
});

router.get('/admin/logout', function(req, res) {
	delete req.session.auth;
	delete req.session.username;
	res.redirect('/');
});

router.get('/admin/schedule', function(req, res) {
	if (!variables.teams['0']) {
		req.flash('message', 'You must add teams before you can modify the schedule.');
		res.redirect('/admin/teams');
		return;
	}
	res.render('admin/schedule', {weeks: variables.weeks, teams: variables.teams, message: req.flash('message')});
});

router.get('/admin/scores', function(req, res) {
	if (!variables.teams['0']) {
		req.flash('message', 'You must add teams before you can modify the scores.');
		res.redirect('/admin/teams');
		return;
	}
	res.render('admin/scores', {weeks: variables.weeks, teams: variables.teams, message: req.flash('message')});
});

router.get('/admin/teams', function(req, res) {
	res.render('admin/teams', { message: req.flash('message') });
});

router.get('/login', function(req, res) {
	res.render('login', { user : req.user, message: req.flash('message') });
});

router.post('/login', function(req, res) {
	firebase.firebase.auth().signInWithEmailAndPassword(req.body.username + '@chess.com', req.body.password).then(function() {res.redirect('/admin');}).catch(function(err) {
		let errCode = err.code;
		let errMessage = err.message;

		if (errCode === 'auth/wrong-password') {
			req.flash('message', 'Invalid username or password.');
			res.redirect('/login');
		} else {
			req.flash('message', errMessage);
			res.redirect('/login');
		}
		console.info(err);
	});
});

router.post('/admin/teams', function(req, res) { // Do the teams and schedule thing
	variables.teamNames = [];
	for (let team of Object.values(req.body)) { // Team is now the name of the team
		variables.teamNames.push(team);
	}
	firebase.createSchedule(variables.teamNames);
	res.redirect('/admin/scores');
});

router.post('/admin/modifyaccount', function(req, res) {
	if (req.body.password === req.body.passwordC) {
		if (req.body.password.length < 6) {
			req.flash('message', 'Password must be at least 6 characters long.');
			res.redirect('/admin/account');
			return;
		}
		firebase.firebase.auth().currentUser.updatePassword(req.body.password).then(function() {
			req.flash('message', 'Password updated.');
			res.redirect('/admin/account');
		}, function(er) { // If it has been too long, reauthenticate.
			req.flash('message', 'Please sign in again before doing that.');
			res.redirect('/login')
		});
	} else {
		req.flash('message', 'Passwords do not match.');
		res.redirect('/admin/account');
	}
});

router.post('/admin/createaccount', function(req, res) {
	if (req.body.password === req.body.passwordC) {
		if (req.body.password.length < 6) {
			req.flash('message', 'Password must be at least 6 characters long.');
			res.redirect('/admin/account');
			return;
		}
		let user = firebase.firebase.auth().currentUser;
		firebase.firebase.auth().createUserWithEmailAndPassword(req.body.username + '@chess.com', req.body.password).then(function() {
			firebase.firebase.auth().currentUser = user;
			req.flash('message', 'Account created.');
			res.redirect('/admin/account');
		}).catch(function(err) {
			let errCode = err.code;
			let errMessage = err.message;

			console.log(err);
			req.flash('message', errCode);
			res.redirect('/admin/account');
		});
	} else {
		req.flash('message', 'Passwords do not match.');
		res.redirect('/admin/account');
	}
});

router.post('/admin/scores', function(req, res) {
	for (var score in req.body) {
		let week = Math.floor(score / 100);
		let time = Math.floor((score - week * 100) / 10);
		let game = Math.floor(score - week * 100 - time * 10);
		let result = parseInt(req.body[score]);
		let GAME = variables.weeks[week][time][game];

		if (result === 1) { // Black won
			firebase.addWin(GAME.Black, GAME.White, score);
		} else if (result === 2) { // White won
			firebase.addWin(GAME.White, GAME.Black, score);
		} else if (result === 3) { //Draw
			firebase.addDraw(GAME.White, GAME.Black, score);
		} else {
			console.error('Someone did something wrong.')
		}
	}

	req.flash('message', 'Scores updated.');
	res.redirect('/admin/scores');
});

router.post('/admin/schedule', function(req, res) {
	let week = Math.floor(req.body.id / 100);
	let time = Math.floor((req.body.id - week * 100) / 10);
	let game = Math.floor(req.body.id - week * 100 - time * 10);
	let GAME = variables.weeks[week][time][game];

	for (let i = 1; i < 9; i++) {
		if (variables.weeks[i] == null) { // The first empty week
			let id = i * 100 + 11;
			variables.weeks[i] = {
				'1': {
					'1': {
						White: GAME.White,
						Black: GAME.Black,
						_id:  id
					}
				}
			};
			variables.games[i.toString() + '11'] = {
				Black: GAME.Black,
				White: GAME.White
			};
			variables.games[week * 100 + time * 10 + game] = null;
			variables.weeks[week][time][game] = null;
			req.flash('message', 'Rescheduled');
			res.redirect('/admin/schedule');
			firebase.setSchedule();
			return;
		}
		for (let t = 1; t < 4; t++) {
			if (variables.weeks[i][t] == null) { // The first empty time slot of the week
				let id = i * 100 + t * 10 + 1;
				variables.weeks[i][t] = {
					'1': {
						White: GAME.White,
						Black: GAME.Black,
						_id:  id
					},
				};
				variables.games[i.toString() + t.toString() + '1'] = {
					Black: GAME.Black,
					White: GAME.White
				};
				variables.games[week * 100 + time * 10 + game] = null;
				variables.weeks[week][time][game] = null;
				req.flash('message', 'Rescheduled');
				res.redirect('/admin/schedule');
				firebase.setSchedule();
				return;
			}
			let playing = false;
			let notTaken = [1, 2, 3, 4, 5, 6];
			for (let g = 1; g < 6; g++) {
				if (variables.weeks[i][t][g] != null) {
					if (variables.weeks[i][t][g].White === GAME.White || variables.weeks[i][t][g].White === GAME.Black || variables.weeks[i][t][g].Black === GAME.White || variables.weeks[i][t][g].Black === GAME.Black) playing = true;
					notTaken.splice(notTaken.indexOf(g), 1);
				}
			}
			if (playing) continue; // If either team is in this time slot, don't set them here

			let id = i * 100 + t * 10 + notTaken[0];
			variables.weeks[i][t][notTaken[0]] = {
				White: GAME.White,
				Black: GAME.Black,
				_id:  id
			};
			variables.games[i.toString() + t.toString() + notTaken[0].toString()] = {
				Black: GAME.Black,
				White: GAME.White
			};
			variables.games[week * 100 + time * 10 + game] = null;
			variables.weeks[week][time][game] = null;
			req.flash('message', 'Rescheduled');
			res.redirect('/admin/schedule');
			firebase.setSchedule();
			return;
		}
	}
	req.flash('message', 'The game could not be rescheduled.');
	res.redirect('/admin/schedule');
});


module.exports = {
	router: router
};

function isAuthenticated(req, res, next) {
	if (req.session.auth) return next();
	else res.redirect('/no');
}
