$( document ).ready(function(){
	localStorage.setItem("number_of_turns", "XXX");
	localStorage.setItem("player_won", "yes");
	initialize_players(3);
	initialize_list();
	reset_deck();
	deal_cards(7);
	play_game();
	console.log(players);


});

var list_of_cards = [];
var deck = [];
var used_deck = [];	// incase we want to keep track of random stuff
var players = [];
var cur_player_index = 0;
var last_played_card = 0;	// this indexes into list_of_cards
var game_over = false;
var cur_color = "none";		// this is used if a wild is played


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

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	//document.getElementById(data).classList.remove("")
	ev.target.replaceChild(document.getElementById(data), document.getElementById("centerCard"));
}

function allowDrop(ev) {
	ev.preventDefault();
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


function play_game() {
	// turn over top card
	// TO DO: make sure the top card isn't a special card
	last_played_card = deck.pop();
	console.log("last played card: " + list_of_cards[last_played_card].color + " " + list_of_cards[last_played_card].number + " " + list_of_cards[last_played_card].special)
	while (!game_over) {
		player_turn();
	}
}

function player_turn() {
	if (deck.length == 0) {
		deck = used_deck;
		used_deck = [];
		reset_deck();
	}

	if (players[cur_player_index].human) {
		// highlight playable cards for the player

		cur_player_index = (cur_player_index + 1) % players.length;
	} else {
		// look in hand first for: color, number, other, then draw
		// have some other logic for wilds (replace the list_of_cards lookup with just cur_color variable);
		let to_play = -1;
		let same_number_found = -1;
		let special_found = -1;
		let i = 0;
		let card_found = false;
		while (i < players[cur_player_index].hand.length && !card_found) {
			if (list_of_cards[players[cur_player_index].hand[i]].color == list_of_cards[last_played_card].color) {
				to_play = i;
				card_found = true;
			} else if (list_of_cards[players[cur_player_index].hand[i]].number == list_of_cards[last_played_card].number && list_of_cards[last_played_card].number != "none") {
				same_number_found = i;
			} else if (list_of_cards[players[cur_player_index].hand[i]].special != "none") {
				if (list_of_cards[last_played_card].special == "none" || list_of_cards[last_played_card].special == list_of_cards[players[cur_player_index].hand[i]].special)
				special_found = i;
			}
			i++;
		}
		// console.log("after looking thru hand, we have: ");
		// console.log("to play: " + to_play);
		// console.log(players[cur_player_index].hand[to_play]);
		// if we didn't find a card of the same color check to see if we have another
		// playable card
		if (to_play == -1) {
			if (same_number_found != -1) {
				// console.log("same number found: " + same_number_found);
				to_play = same_number_found;
			} else if (special_found != -1) {
				// console.log("special found: " + special_found);
				to_play = special_found;
			}
		}
		// draw a card if we can't play a card, otherwise play it
		if (to_play == -1) {
			draw_card(cur_player_index, 1);
		} else {
			play_card(cur_player_index, to_play);
		}
		// game_over = true;
	}
	// cur_player_index = (cur_player_index + 1) % players.length;
	
}


function draw_card(player_index, num_to_draw) {
	// TODO add in actual loop  that draws multiple cards
	// for (var i = 0; i < players[cur_player_index].hand.length; i++) {
	// 	//.console.log(list_of_cards[players[cur_player_index].hand[i]].color + " " + list_of_cards[players[cur_player_index].hand[i]].number + " " + list_of_cards[players[cur_player_index].hand[i]].special);
	// }
	for (var i = 0; i < num_to_draw; i++) {
		players[player_index].hand.push(deck.pop());
	}
	console.log("draw a card bro");
	cur_player_index = (cur_player_index + 1) % players.length;
}

function play_card(cur_player_index, loc_in_hand) {
	// console.log("currently in hand: ");
	for (var i = 0; i < players[cur_player_index].hand.length; i++) {
		//console.log(list_of_cards[players[cur_player_index].hand[i]].color + " " + list_of_cards[players[cur_player_index].hand[i]].number + " " + list_of_cards[players[cur_player_index].hand[i]].special);
	}
	console.log(players[cur_player_index].name + " plays a " + list_of_cards[players[cur_player_index].hand[loc_in_hand]].color + " " + list_of_cards[players[cur_player_index].hand[loc_in_hand]].number + " " + list_of_cards[players[cur_player_index].hand[loc_in_hand]].special)
	// console.log(list_of_cards[players[cur_player_index].hand[loc_in_hand]].color)
	// console.log(list_of_cards[players[cur_player_index].hand[loc_in_hand]].number);
	used_deck.push(last_played_card);
	last_played_card = players[cur_player_index].hand[loc_in_hand];
	if (list_of_cards[last_played_card].color == "none" && list_of_cards[last_played_card].special != "none") {
		list_of_cards[last_played_card].color = get_color(cur_player_index);
	}
	
	players[cur_player_index].hand.splice(loc_in_hand, 1);

	// write in the case for +2 or + 4
	if (players[cur_player_index].hand.length == 1) {
		console.log("UNO!");
	} else if (players[cur_player_index].hand.length == 0) {
		console.log("game over");
		game_over = true;
	}
	if (list_of_cards[last_played_card].special == "draw-2") {
		console.log("next player draws 2");
		draw_card((cur_player_index + 1) % players.length, 2);
		cur_player_index = (cur_player_index + 1) % players.length;
	} else if (list_of_cards[last_played_card].special == "wild-draw-4") {
		console.log("next player draws 4");
		draw_card((cur_player_index + 1) % players.length, 4);
		cur_player_index = (cur_player_index + 1) % players.length;
	}
	cur_player_index = (cur_player_index + 1) % players.length;
}

function get_color(cur_player_index) {
	if (players[cur_player_index].human) {
		// have a pop up ask them for color
	} else {
		// just choose red for rn - run through and choose the color with most 
		return "red";
	}
}

