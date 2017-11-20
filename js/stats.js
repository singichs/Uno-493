$( document ).ready(function() {
	console.log("load stats page");
	$("#game_over_screen").click(function() {
		console.log("hello");
		go_to_game_over_screen();
	});
});

function go_to_game_over_screen() {
	console.log("go back to game over screen");
	document.location.href = "end_game.html";
}