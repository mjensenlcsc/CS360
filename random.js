function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function zip(rows) {
	return rows[0].map((_,c) => rows.map(row => row[c]))
}

function create_schedule(list) {
	list = shuffle(list);
	let s = [];
	if (list.length %2 == 1) list.push('BYE');
	for (let i = 0; i < list.length -1; i++) {
		let mid = Math.floor(list.length / 2);
		let l1 = list.slice(0, mid);
		let l2 = list.slice(mid);
		l2.reverse();
		if (i % 2 == 1) s = s.concat([zip([l1, l2])]);
		else s = s.concat([zip([l2, l1])]);
		list.splice(1, 0, list.pop())
	}
	return s;
}

function getSchedule(teamN) {
	let teams = [];
	let s = [];
	let current = [];
	for (let i = 0; i < teamN; i++) teams.push(i);
	let os = create_schedule(teams);
	os = os.concat(create_schedule(teams));
	os = shuffle(os);
	for (round of os) {
		if (current.length < 3) current.push(round);
		else {
			s.push(current);
			current = [];
			current.push(round)
		}
	}
	if (current.length > 0) s.push(current);
	return s;
}
module.exports.getSchedule = getSchedule;
module.exports.shuffle = shuffle;
