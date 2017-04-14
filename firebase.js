const firebase = require('firebase');

const random = require('./random');

let config = {
  apiKey: "AIzaSyBDE9McUBlMoxSaxk2BWtctvjZ6ol_imqY",
  authDomain: "groupproject-8a8eb.firebaseapp.com",
  databaseURL: "https://groupproject-8a8eb.firebaseio.com",
  storageBucket: "groupproject-8a8eb.appspot.com",
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
					Week: w,
					Time: t,
					Game: g
				}
				g++;
			});
			t++
		});
		w++;
	});
}

createSchedule(null, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
