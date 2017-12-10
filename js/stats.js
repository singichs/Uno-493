$( document ).ready(function() {
	console.log("load stats page");
	$("#game_over_screen").click(function() {
		go_to_game_over_screen();
	});
	var value = JSON.parse(localStorage.getItem("players"));
	for (var i = 0; i < value.length; i++) {
		console.log(value[i]);
		document.getElementById((i+1) + "name").innerHTML = value[i].name;
		document.getElementById((i+1) + "points").innerHTML = "Points: " + value[i].points;
		document.getElementById((i+1) + "played").innerHTML = "Cards Played: " + value[i].cards_played;
		document.getElementById((i+1) + "drawn").innerHTML = "Cards Drawn: " + value[i].cards_drawn;
		document.getElementById((i+1) + "blue").innerHTML = value[i].colors_played['blue'] + " blue";
		document.getElementById((i+1) + "green").innerHTML = value[i].colors_played['green'] + " green";
		document.getElementById((i+1) + "red").innerHTML = value[i].colors_played['red'] + " red"
		document.getElementById((i+1) + "yellow").innerHTML = value[i].colors_played['yellow'] + " yellow";
	}
});

function go_to_game_over_screen() {
	console.log("go back to game over screen");
	document.location.href = "end_game.html";
}