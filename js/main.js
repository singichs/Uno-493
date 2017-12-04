$( document ).ready(function(){
	localStorage.setItem("number_of_turns", "XXX");
	localStorage.setItem("player_won", "yes");
	initialize_players(3);
	initialize_list();
	reset_deck();
	deal_cards(7);
	console.log(list_of_cards.length);
	console.log(players);


});

var list_of_cards = [];
var deck = [];
var used_deck = [];	// incase we want to keep track of random stuff
var players = [];
var cur_player_index = 0;
var last_played_card = 0;	// this indexes into list_of_cards


class Card {
	constructor(color, number, special) {
		this.color = color;
		this.number = number;
		this.special = special;
	}
}

class Player {
	constructor(name, human) {
		this.name = name;
		this.hand = [];	// list of numbers that index into list_of_cards
		this.human = human;	// this is true or false
	}
}

// assuming for right now that first player is human and 3 cpu
function initialize_players(num_cpu) {
	// this should be some locally set variable for player's name
	// can also change to for loop thru array of player's name if we want to have that option
	players.push(new Player("human boi", true));
	players.push(new Player("Jim", false));
	players.push(new Player("Bob", false));
	players.push(new Player("Cooter", false));
}

// turns out there are 108 cards in an UNO deck
function initialize_list() {
	let colors = ["blue", "red", "green", "yellow"];
	for (var i = 0; i < colors.length; i++) {
		for (var num = 0; num < 10; num++) {
			list_of_cards.push(new Card(colors[i], num.toString(), "none"));
			if (num != 0) {
				list_of_cards.push(new Card(colors[i], num.toString(), "none"));
			}
		}
	}
	for (var i = 0; i < colors.length; i++) {
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "draw-2"));
		}
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "skip"));
		}
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "reverse"));
		}
	}
	for (var i = 0; i < 4; i++) {
		list_of_cards.push(new Card("none", "none", "wild"));
	}
	for (var i = 0; i < 4; i++) {
		list_of_cards.push(new Card("none", "none", "wild-draw-4"));
	}
}

function reset_deck() {
	deck = Array.from(Array(108).keys());
	deck = shuffle(deck);
}

// function below ripped directly from stack overflow page
// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function deal_cards(num_cards_in_hand) {
	for (var i = 0; i < num_cards_in_hand; i++) {
		for (var j = 0; j < players.length; j++) {
			players[j].hand.push(deck.pop());
		}
	}
	console.log(players);
}



