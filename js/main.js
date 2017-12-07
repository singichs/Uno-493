$( document ).ready(function(){
	localStorage.setItem("number_of_turns", "XXX");
	localStorage.setItem("player_won", "yes");
	initialize_players(3);
	initialize_list();
	reset_deck();
	deal_cards(7);
	play_game();
	console.log(players);

	// gonna have to change this to the ondrag event
	$("#player2-cards").click(function() {
		console.log("clicked");
		// if (!game_over) {
		// 	get_next_player();
		// 	play_game();
		// }
	})

});

var list_of_cards = [];
var deck = [];
var used_deck = [];	// incase we want to keep track of random stuff
var players = [];
var cur_player_index = 0;
var last_played_card = 0;	// this indexes into list_of_cards
var game_over = false;
var cur_color = "none";		// this is used if a wild is played
var clockwise_dir = true;
var num_to_draw = 7;

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
	ev.target.replaceChild(document.getElementById(data), document.getElementById("centerCard"));
}

function allowDrop(ev) {
	ev.preventDefault();
}

// assuming for right now that first player is human and 3 cpu
function initialize_players(num_cpu) {
	// this should be some locally set variable for player's name
	// can also change to for loop thru array of player's name if we want to have that option
	players.push(new Player("Jim", false));
	players.push(new Player("Bob", false));
	players.push(new Player("Cooter", false));
	players.push(new Player("human boi", true));
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
			list_of_cards.push(new Card(colors[i], "none", "draw2"));
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
	// reset the wild cards to have no color associated with them
	for (var i = 99; i < 108; i++) {
		list_of_cards[i].color = "none";
	}
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
	last_played_card = deck.pop();
	console.log("last played card: " + list_of_cards[last_played_card].color + " " + list_of_cards[last_played_card].number + " " + list_of_cards[last_played_card].special)
	// set number of cards remaining in hand
	// player1-cards
	
	console.log("cards displayed");
	display_cards();
	update_cards_remaining();
}



// passed in card index is for player turn
function play_game() {
	// turn over top card
	// TO DO: make sure the top card isn't a special card
	// while (!game_over) {
	// 	player_turn();
	// }
	while (!players[cur_player_index].human && !game_over) {
		// parameter should only matter for human player
		console.log("who's turn: " + players[cur_player_index].name);
		player_turn(-1);
		update_cards_remaining();
	}
	console.log("waiting for player");
	
}

function player_turn(cardindex) {
	if (deck.length == 0) {
		deck = used_deck;
		used_deck = [];
		reset_deck();
	}
	if (players[cur_player_index].human) {
		// highlight playable cards for the player
		
		play_card(cardindex);
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
		// if we didn't find a card of the same color check to see if we have another
		// playable card
		if (to_play == -1) {
			if (same_number_found != -1) {
				to_play = same_number_found;
			} else if (special_found != -1) {
				to_play = special_found;
			}
		}
		// draw a card if we can't play a card, otherwise play it
		if (to_play == -1) {
			draw_card(cur_player_index, 1);
		} else {
			to_play = players[cur_player_index].hand[to_play];
			// console.log("to_play: " + to_play);
			play_card(to_play);
		}
	}	
}


function draw_card(player_index, card_index) {
	// TODO add in actual loop  that draws multiple cards
	for (var i = 0; i < num_to_draw; i++) {
		players[player_index].hand.push(deck.pop());
	}
	console.log("draw a card bro");
	get_next_player();

	// cur_player_index = (cur_player_index + 1) % players.length;
}

function play_card(loc_in_list) {
	// console.log("currently in hand: ");
	// for (var i = 0; i < players[cur_player_index].hand.length; i++) {
	// 	//console.log(list_of_cards[players[cur_player_index].hand[i]].color + " " + list_of_cards[players[cur_player_index].hand[i]].number + " " + list_of_cards[players[cur_player_index].hand[i]].special);
	// }
	console.log(players[cur_player_index].name + " plays a " + list_of_cards[loc_in_list].color + " " + list_of_cards[loc_in_list].number + " " + list_of_cards[loc_in_list].special)
	// console.log(list_of_cards[players[cur_player_index].hand[loc_in_hand]].color)
	// console.log(list_of_cards[players[cur_player_index].hand[loc_in_hand]].number);
	used_deck.push(last_played_card);
	last_played_card = loc_in_list;
	if (list_of_cards[last_played_card].color == "none" && list_of_cards[last_played_card].special != "none") {
		list_of_cards[last_played_card].color = get_color();
	}
	
	//players[cur_player_index].hand.splice(loc_in_hand, 1);
	// find index of card in hand
	var loc_in_hand = players[cur_player_index].hand.indexOf(loc_in_list);
	// console.log("loc in hand: " + loc_in_hand);
	players[cur_player_index].hand.splice(loc_in_hand, 1);

	// write in the case for +2 or + 4
	if (players[cur_player_index].hand.length == 1) {
		console.log("UNO!");
	} else if (players[cur_player_index].hand.length == 0) {
		console.log("game over, " + players[cur_player_index].name + " is the winner!");
		game_over = true;
	}

	if (list_of_cards[last_played_card].special == "draw-2") {
		console.log("next player draws 2");
		draw_card((cur_player_index + 1) % players.length, 2);
		get_next_player();
	} else if (list_of_cards[last_played_card].special == "wild-draw-4") {
		console.log("next player draws 4");
		draw_card((cur_player_index + 1) % players.length, 4);
		get_next_player();
	} else if (list_of_cards[last_played_card].special == "reverse") {
		if (clockwise_dir) {
			clockwise_dir = false;
		} else {
			clockwise_dir = true;
		}
	} else if (list_of_cards[last_played_card].special == "skip") {
		get_next_player();
	}
	get_next_player();
}

function get_color() {
	if (players[cur_player_index].human) {
		// have a pop up ask them for color
	} else {
		// just choose red for rn - run through and choose the color with most 
		return "red";
	}
}

// used to determine which player gets the next move
function get_next_player() {
	if (clockwise_dir) {
		cur_player_index = (cur_player_index + 1) % players.length;
		console.log("next player cur_index: " + cur_player_index);
	} else {
		cur_player_index = (cur_player_index - 1) % players.length;
		if (cur_player_index == -1) {
			cur_player_index = players.length - 1;
		}
	}
}

function get_player_card() {
	if (players[cur_player_index].human) {
		console.log("human time boi");
	}
}


function display_cards() {

	for (var i = 0; i < players.length; ++i)
	{
		if (players[i].human == true)
		{
			for (var j = 0; j < 7; ++j)
			{
				var cardindex = players[i].hand[j];

				var cardcolor = list_of_cards[cardindex].color;
				var cardnumber = list_of_cards[cardindex].number;

				var userhand = document.getElementById("player4-cards");
				var card = document.createElement("li");

				if (cardnumber == "none") //special cards
				{
					card.className = "card " + "draggable";
					card.id = cardindex;
					var cardimage = document.createElement("img");
					cardimage.setAttribute('height', '140px');
					cardimage.setAttribute('width', '105px');

					var specialtype = list_of_cards[cardindex].special;

					if (specialtype == "wild-draw-4")
					{
						cardimage.setAttribute('src', '../img/wild-draw-4.png');
					}
					else if (specialtype == "wild")
					{

						cardimage.setAttribute('src', '../img/wild.png');
			
					}
					else
					{
						console.log(cardcolor + " " + specialtype);

						cardimage.setAttribute('src', '../img/' + cardcolor + specialtype + '.png');
					}
					card.appendChild(cardimage);
					userhand.appendChild(card);

				}
				else
				{

					// console.log(cardcolor + " " + cardnumber);

					card.className = "card num-" + cardnumber + " " + cardcolor + " draggable";
					card.id = cardindex;
					var innerspan = document.createElement("span");
					innerspan.className = "inner";
					var markspan = document.createElement("span");
					markspan.className = "mark";
					markspan.innerHTML = cardnumber;
					innerspan.appendChild(markspan);
					card.appendChild(innerspan);
					userhand.appendChild(card);
				}

			}
		}
	}
}

function update_cards_remaining() {
	for (var i = 0; i < players.length; i++) {
		$("#p" + (i + 1) + "cards").text(players[i].hand.length);
	}
}



