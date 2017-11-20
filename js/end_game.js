$( document ).ready(function() {
	console.log("getting localstorage item: " + localStorage.getItem("number_of_turns"));
	var num_turns = localStorage.getItem("number_of_turns");
	var won = localStorage.getItem("player_won");
	console.log(won);
	if (won == "yes") {
		$("#turns").text("You won the game in " + num_turns + " turns!");
	} else {
		$("#turns").text("You lost the game in " + num_turns + " turns.");
	}
	$("#stats_screen").click(function() {
		show_stats_screen();
	})
	$("#play_again").click(function() {
		new_game();
	})
});

function show_stats_screen() {
	console.log("showing stats screen");
	document.location.href = "stats.html";
}

function new_game() {
	console.log("starting a new game");
	document.location.href = "index.html";
}