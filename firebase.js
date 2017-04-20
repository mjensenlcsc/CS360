const firebase = require('firebase');

const random = require('./random');
const variables = require('./variables');

let config = {
	/* PRODUCTION
	apiKey: "AIzaSyBDE9McUBlMoxSaxk2BWtctvjZ6ol_imqY",
	authDomain: "groupproject-8a8eb.firebaseapp.com",
	databaseURL: "https://groupproject-8a8eb.firebaseio.com",
	storageBucket: "groupproject-8a8eb.appspot.com",
	*/
	/* DEVELOPMENT */
  	apiKey: "AIzaSyDRClb6inrm0wPBlkUmXTcCwKAxYwLG7zE",
    authDomain: "cs360chess.firebaseapp.com",
    databaseURL: "https://cs360chess.firebaseio.com",
    projectId: "cs360chess",
    storageBucket: "cs360chess.appspot.com",
    messagingSenderId: "23907906418"
};
firebase.initializeApp(config);
let db = firebase.database();

function createSchedule(startDate, teamNames) {
	teamNames = random.shuffle(teamNames);
	let n = 0;
	let teams = {};
	let games = {};
	let weeks = {};
	teamNames.forEach(name => {
		teams[n] = {
			Name: name,
			Score: 0,
			Record: {
				Wins: 0,
				Losses: 0,
				Draws: 0
			},
			Played: []
		}
		n++;
	});
	let w = 1;
	random.getSchedule(teamNames.length).forEach(week => {
		let t = 1;
		weeks[w] = {};
		week.forEach(time => {
			//console.info(time)
			weeks[w][t] = {}
			let g = 1;
			time.forEach(game => {
				weeks[w][t][g] = {
					Black: game[0],
					White: game[1],
					_id: w.toString() + t.toString() + g.toString()
				}
				games[w.toString() + t.toString() + g.toString()] = {
					Black: game[0],
					White: game[1],
					Winner: null,
					Loser: null,
				}
				g++;
			});
			t++
		});
		w++;
	});
  db.ref('current').set({
	  teams: teams,
	  games: games,
	  weeks: weeks
  });

  variables.teams = teams;
  variables.games = games;
  variables.weeks = weeks;
}

function addWin(winner, game) {
	variables.teams[winner].Score += 5;
	variables.teams[winner].Record.Wins++;
	db.ref('current/teams/' + winner).update(variables.teams[winner]);
	variables.games[game].Winner = winner;
	db.ref('current/games/' + game).update(variables.games[game]);
}

function addLoss(loser, game) {
	variables.teams[loser].Score += 1;
	variables.teams[loser].Record.Losses++;
	db.ref('current/teams/' + loser).update(variables.teams[loser]);
	variables.games[game].Loser = loser;
	db.ref('current/games/' + game).update(variables.games[game]);
}

function addDraw(t1, t2, game) {
	variables.teams[t1].Score += 3;
	variables.teams[t2].Score += 3;
	variables.teams[t1].Record.Draws++;
	variables.teams[t2].Record.Draws++;
	db.ref('current/teams/' + t1).update(variables.teams[t1]);
	db.ref('current/teams/' + t2).update(variables.teams[t2]);
	variables.games[game].Winner = 'DRAW';
	variables.games[game].Loser = 'DRAW';
	db.ref('current/games/' + game).update(variables.games[game]);
}

createSchedule(null, ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7']);
addWin(3, 111);
addLoss(0, 111);
addDraw(4, 5, 123);