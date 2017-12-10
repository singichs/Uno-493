$( document ).ready(function() {
	console.log("load stats page");
	$("#game_over_screen").click(function() {
		go_to_game_over_screen();
	});
	var value = JSON.parse(localStorage.getItem("players"));
	for (var i = 0; i < value.length; i++) {
		console.log(value[i]);
	}
});

function go_to_game_over_screen() {
	console.log("go back to game over screen");
	document.location.href = "end_game.html";
}