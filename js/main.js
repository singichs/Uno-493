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
var clockwise_dir = true;
var player_drawn_this_turn = false;
// var num_to_drawF = 7;

class Card {
	constructor(color, number, special, points) {
		this.color = color;
		this.number = number;
		this.special = special;
		this.points = points;
	}
}

class Player {
	constructor(name, human) {
		this.name = name;
		this.hand = [];	// list of numbers that index into list_of_cards
		this.human = human;	// this is true or false
		this.points = 0;
		this.cards_drawn = 0;
		this.cards_played = 0;
		this.total_cards = 7;
		this.colors_played = {"blue": 0, "green": 0, "yellow": 0, "red": 0};
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
			list_of_cards.push(new Card(colors[i], num.toString(), "none", num));
			if (num != 0) {
				list_of_cards.push(new Card(colors[i], num.toString(), "none", num));
			}
		}
	}
	for (var i = 0; i < colors.length; i++) {
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "draw2", 20));
		}
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "skip", 20));
		}
		for (var j = 0; j < 2; j++) {
			list_of_cards.push(new Card(colors[i], "none", "reverse", 20));
		}
	}
	for (var i = 0; i < 4; i++) {
		list_of_cards.push(new Card("none", "none", "wild", 50));
	}
	for (var i = 0; i < 4; i++) {
		list_of_cards.push(new Card("none", "none", "wild-draw-4", 50));
	}
}

function reset_deck() {
	deck = Array.from(Array(108).keys());
	deck = shuffle(deck);
	// reset the wild cards to have no color associated with them
	for (var i = 100; i < 108; i++) {
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
	while (list_of_cards[last_played_card].special == "wild-draw-4" || list_of_cards[last_played_card].special == "wild") {
		deck.push(last_played_card);
		last_played_card = deck.pop();
	}
	add_to_used_stack(last_played_card);
	set_current_color();
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
	console.log("playing the game");
	display_cards();
	update_playable_cards(3);
	// while (!players[cur_player_index].human && !game_over) {
	// 	// parameter should only matter for human player
	// 	// console.log("who's turn: " + players[cur_player_index].name);
	// 	//player_turn(-1);
	// 	console.log("timeout started");
	// 	setTimeout(cpu_play, 200);
	// 	// player_turn(-1);
	// 	// update_cards_remaining();
	// 	var start = new Date().getTime();
	// 	var end = start;
	// 	while(end < (start + 3000)) {
	// 		end = new Date().getTime();
	// 	}
	// 	//console.log("still in loop");
	// }

	if(players[cur_player_index].human){
		display_cards();	
		update_playable_cards(3);
	}
	$(".draggable").draggable();
	setTimeout(cpu_play, 4000);
	//player_turn(-1);
	//setInterval(cpu_play, 5000);
	//console.log("waiting for player");
	// if(players[cur_player_index].human){
	// 	display_cards();	
	// 	update_playable_cards(cur_player_index);
	// }
	// $(".draggable").draggable();
}

function cpu_play(){
	if(!players[cur_player_index].human && !game_over){

		console.log("timeout expired");
		console.log(cur_player_index + " played a card");
		player_turn(-1);
		update_cards_remaining();
	}
	
	update_playable_cards(3);
	$(".draggable").draggable();
	setTimeout(cpu_play, 5500);
}

function player_turn(cardindex) {
	if (deck.length == 0) {
		deck = used_deck;
		used_deck = [];
		reset_deck();
	}
	if (players[cur_player_index].human) {
		// highlight playable cards for the player
		//$("turn_announcement").text("Your Turn");
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
				if (list_of_cards[last_played_card].special == "none" && list_of_cards[last_played_card].special == list_of_cards[players[cur_player_index].hand[i]].special)
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
			// console.log("can't play anything, draw a card");
		} else {
			to_play = players[cur_player_index].hand[to_play];
			// console.log("to_play: " + to_play);
			play_card(to_play);
		}
	}	
}

function draw_animation(index)
{
	console.log("animating!");
	if (index == 0)
	{
		$("#sliding").effect("drop", {direction:"left"}, 1000);
	}
	else if (index == 1)
	{
		$("#sliding").effect("drop", {direction:"up"}, 1000);
	}
	else if (index == 2)
	{
		$("#sliding").effect("drop", {direction:"right"}, 1000);
	}
	else 
	{
		$("#sliding").effect("drop", {direction:"down"}, 1000);
	}

}

// if player clicks deck, only draw if player's turn
function check_draw_card() {
	if (players[cur_player_index].human && !player_drawn_this_turn) {
		player_drawn_this_turn = true;
		draw_card(3, 1);
	}
}

function draw_card(player_index, num_to_draw) {
	// TODO add in actual loop  that draws multiple cards
	// console.log(num_to_draw);
	// console.log(players[3].hand);
	for (var i = 0; i < num_to_draw; i++) {
		players[player_index].hand.push(deck.pop());
	}
	players[player_index].cards_drawn += num_to_draw;
	players[player_index].total_cards += num_to_draw;
	// console.log(players);
	// console.log(players[3].hand)
	draw_animation(player_index);
	setTimeout(delay_display_continue(player_index, num_to_draw), 2000);
	//delay_display_continue(player_index, num_to_draw);
}

function delay_display_continue(player_index, num_to_draw){
	let p4hand = document.getElementById('player4-cards');
	p4hand.innerHTML = "";
	display_cards();
	// console.log("cards in hand for " + players[cur_player_index].name + " " + players[cur_player_index].hand.length);
	console.log(players[player_index].name + " drew " + num_to_draw + " cards");
	player_drawn_this_turn = false;
	get_next_player();
	play_game();
}

function play_card(loc_in_list) {
	// console.log("currently in hand: ");
	// for (var i = 0; i < players[cur_player_index].hand.length; i++) {
	// 	//console.log(list_of_cards[players[cur_player_index].hand[i]].color + " " + list_of_cards[players[cur_player_index].hand[i]].number + " " + list_of_cards[players[cur_player_index].hand[i]].special);
	// }
	console.log(players[cur_player_index].name + " plays a " + list_of_cards[loc_in_list].color + " " + list_of_cards[loc_in_list].number + " " + list_of_cards[loc_in_list].special)
	used_deck.push(last_played_card);
	last_played_card = loc_in_list;
	if (list_of_cards[last_played_card].color == "none" && list_of_cards[last_played_card].special != "none") {
		list_of_cards[last_played_card].color = get_color();
	}

	// update scoring variables
	players[cur_player_index].points += list_of_cards[last_played_card].points;
	players[cur_player_index].cards_played += 1;
	players[cur_player_index].colors_played[list_of_cards[last_played_card].color] += 1;
	set_current_color();
	var loc_in_hand = players[cur_player_index].hand.indexOf(Number(loc_in_list));
	// console.log("location in hand removed: " + loc_in_hand);
	// console.log("location searched for: " + loc_in_list);
	play_animation(cur_player_index);
	players[cur_player_index].hand.splice(loc_in_hand, 1);
	add_to_used_stack(loc_in_list);

	// write in the case for +2 or + 4
	if (players[cur_player_index].hand.length == 1) {
		console.log("UNO!");
	} else if (players[cur_player_index].hand.length == 0) {
		console.log("game over, " + players[cur_player_index].name + " is the winner!");
		game_over = true;
		localStorage.setItem("players", JSON.stringify(players));
		window.location.href = "../HTML/end_game.html";
	}
	// console.log("checking specials: " + list_of_cards[last_played_card].special);
	if (list_of_cards[last_played_card].special == "draw2") {
		// console.log(players[(cur_player_index + 1) % players.length].name + " draws 2");
		if (clockwise_dir) {
			draw_card((cur_player_index + 1) % players.length, 2);
		} else {
			if (cur_player_index == 0) {
				draw_card(3, 2);
			} else {
				draw_card(cur_player_index - 1, 2);
			}
		}
		
		// get_next_player();
	} else if (list_of_cards[last_played_card].special == "wild-draw-4") {
		// console.log("next player draws 4");
		// console.log(players[(cur_player_index + 1) % players.length].name + " draws 4");
		// draw_card((cur_player_index + 1) % players.length, 4);
		if (clockwise_dir) {
			draw_card((cur_player_index + 1) % players.length, 4);
		} else {
			if (cur_player_index == 0) {
				draw_card(3, 4);
			} else {
				draw_card(cur_player_index - 1, 4);
			}
		}
		// get_next_player();
	} else if (list_of_cards[last_played_card].special == "reverse") {
		if (clockwise_dir) {
			clockwise_dir = false;
			$("#turn_direction").removeClass("arrow-clockwise");
			$("#turn_direction").addClass("arrow-counterclockwise");

		} else {
			$("#turn_direction").removeClass("arrow-counterclockwise");
			$("#turn_direction").addClass("arrow-clockwise");
			clockwise_dir = true;
		}
	} else if (list_of_cards[last_played_card].special == "skip") {
		get_next_player();
	}
	get_next_player();
}

function get_color() {
	let redCards = 0;
	let yellowCards = 0;
	let greenCards = 0;
	let blueCards = 0;
	for(var i = 0; i < players[cur_player_index].hand.length; i++){
		if(list_of_cards[players[cur_player_index].hand[i]].color == "red"){
			redCards++;
		}
		else if(list_of_cards[players[cur_player_index].hand[i]].color == "yellow"){
			yellowCards++;
		}
		else if(list_of_cards[players[cur_player_index].hand[i]].color == "blue"){
			blueCards++;
		}
		else if(list_of_cards[players[cur_player_index].hand[i]].color == "green"){
			greenCards++;
		}
	}
	let maxColor = redCards;
	let nextColor = "red";
	if(maxColor < yellowCards){
		maxColor = yellowCards;
		nextColor = "yellow";
	}
	if(maxColor < greenCards){
		maxColor = greenCards;
		nextColor = "green";
	}
	if(maxColor < blueCards){
		maxColor = blueCards;
		nextColor = "blue";
	}
	return nextColor;
}

// used to determine which player gets the next move
function get_next_player() {
	if (clockwise_dir) {
		cur_player_index = (cur_player_index + 1) % players.length;
		// console.log("next player cur_index: " + cur_player_index);
	} else {
		cur_player_index = (cur_player_index - 1) % players.length;
		if (cur_player_index == -1) {
			cur_player_index = players.length - 1;
		}
	}
}

function display_cards() {

	let p4hand = document.getElementById('player4-cards');
	p4hand.innerHTML = "";
	for (var i = 0; i < players.length; ++i)
	{
		if (players[i].human == true)
		{
			for (var j = 0; j < players[i].hand.length; ++j)
			{
				var cardindex = players[i].hand[j];

				var cardcolor = list_of_cards[cardindex].color;
				var cardnumber = list_of_cards[cardindex].number;

				var userhand = document.getElementById("player4-cards");
				var card = document.createElement("li");

				if (cardnumber == "none") //special cards
				{
					card.className = "card draggable";
					card.id = cardindex;
					var cardimage = document.createElement("img");
					cardimage.setAttribute('height', '140px');
					cardimage.setAttribute('width', '105px');
					card.zIndex = 1;

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
						// console.log(cardcolor + " " + specialtype);

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
					card.style.zIndex = 1;
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

// change this to accept a parameter called to_stack, where if it's false it goes back to hand
// use this function to add the first card off the deck to the pile at start of game
function add_to_used_stack(card_index_to_add) {
	//console.log("should add to used_stack");
	// var cardindex = card_index_to_add;

	var cardcolor = list_of_cards[card_index_to_add].color;
	var cardnumber = list_of_cards[card_index_to_add].number;

	var userhand = document.getElementById("droppable");
	userhand.innerHTML = '';
	var card = document.createElement("li");
	card.style.zIndex = -1;

	if (cardnumber == "none") //special cards
	{
		card.className = "card " + "draggable";
		card.id = card_index_to_add;
		var cardimage = document.createElement("img");
		cardimage.setAttribute('height', '140px');
		cardimage.setAttribute('width', '105px');

		var specialtype = list_of_cards[card_index_to_add].special;

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
			// console.log(cardcolor + " " + specialtype);

			cardimage.setAttribute('src', '../img/' + cardcolor + specialtype + '.png');
		}
		card.appendChild(cardimage);
		userhand.appendChild(card);

	}
	else
	{

		card.className = "card num-" + cardnumber + " " + cardcolor + " draggable";
		card.id = card_index_to_add;
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


// on each player's turn make sure that the only draggable cards are playable cards
function update_playable_cards(human_index) {
	for (var i = 0; i < players[human_index].hand.length; i++) {
		let card_li = $("#" + players[human_index].hand[i])
		card_li.draggable();
		// console.log(card_li);
		if (player_card_valid(players[human_index].hand[i])) {

			//console.log("card" + i + " playable")
			// add the draggable class
			card_li.addClass("draggable");
			card_li.draggable( "enable" );
			// card_li.addClass("ui-draggable");
			// card_li.addClass("ui-draggable-handle");
			card_li.addClass("card_highlight");
		} else {
			// remove the draggable class
			card_li.removeClass("draggable");
			card_li.draggable( "disable" );
			// card_li.removeClass("ui-draggable");
			// card_li.removeClass("ui-draggable-handle");
		}
		card_li.removeClass("ui-draggable");
		card_li.removeClass("ui-draggable-handle");
	}
}


function play_animation(index)
{
	if (index == 0)
	{
		$("#p1slide").effect("drop", {direction:"right"}, 1000);
	}
	else if (index == 1)
	{
		$("#p2slide").effect("drop", {direction:"down"}, 1000);
	}
	else if (index == 2)
	{
		$("#p3slide").effect("drop", {direction:"left"}, 1000);
	}

}

// use this to see if the player's card is acceptable, if not return it to screen 
function player_card_valid(player_card_index) {
	var player_card = list_of_cards[player_card_index];
	var last_card = list_of_cards[last_played_card];
	if (player_card.special == "wild" || player_card.special == "wild-draw-4") {
		return true;
	} else if (player_card.color == last_card.color) {
		return true;
	} else if (player_card.number == last_card.number && player_card.number != "none") {
		return true;
	} else if (player_card.special != "none" && player_card.special == last_card.special) {
		return true;
	}
	return false;
}


function set_current_color() {
	let cur_color = list_of_cards[last_played_card].color;
	$("#turn_direction").attr("src","../img/3arrows" + cur_color + ".png");
}

window.setInterval(function(){

var name = players[cur_player_index].name;

if (name == "human boi")
{
	document.getElementById("turn_announcement").innerHTML = "Your Turn";
}
else
{
	document.getElementById("turn_announcement").innerHTML = name + "'s Turn";
}

}, 50);
