// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 800;
document.body.appendChild(canvas);
// not working when youtube is running
// canvas.focus();

// Game setup
var turn = 0; // implemented in case there is a desire to set a limit on how many turns can be had in a given game
var playerTurn = 0;
var maxPlayers = 8; // maximum players
var maxRange = 150; // maximum travel range from an island

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/main-map.png";

// Create island array
var scaleImg = 50; //change the size of the islands
var cw = canvas.width;
var ch = canvas.height;
var hoff = -90; //height offset
var xoff = -75 + scaleImg; //x offset
var yoff = -50 + scaleImg; //y offset
var sl = (ch - 2*hoff)/(1+2*Math.sqrt(2)); //octagon side length
var sl45 = sl/Math.sqrt(2); // x^2 + x^2 = y^2 ==> x = y/sqrt(2)
var islandLocations = [
	[(cw-sl)/2-sl45 + xoff, (ch-sl)/2 + yoff],
	[(cw-sl)/2-sl45 + xoff, (ch+sl)/2 + yoff],
	[(cw-sl)/2 + xoff, (ch+sl)/2+sl45 + yoff],
	[(cw+sl)/2 + xoff, (ch+sl)/2+sl45 + yoff],
	[(cw+sl)/2+sl45 + xoff, (ch+sl)/2 + yoff],
	[(cw+sl)/2+sl45 + xoff, (ch-sl)/2 + yoff],
	[(cw+sl)/2 + xoff, (ch-sl)/2-sl45 + yoff],
	[(cw-sl)/2 + xoff, (ch-sl)/2-sl45 + yoff]
];

// Create island object array
var islandArray = [];

// Create big island
var bigIslandImage = new Image();
bigIslandImage.src = "images/big-island.png";
// Need to create an image loader in order to get the appropriate width and heights of images
// var bigIsland = new island(0, bigIslandImage.width, bigIslandImage.height, 100, 1000);
var bigIsland = new island(0, 200, 200, 100, 1000);
islandArray.push(bigIsland);
islandArray[0].x = (cw)/2;
islandArray[0].y = (ch)/2;

// Load player islands and push into islandArray
var playerIsland = [];
var playerArray = [0]; // create player array, intialize with 0 to sync with initial player islands
for (var i = 1; i <= maxPlayers; i++) {
	playerIsland[i] = new Image();
	playerIsland[i].src = "images/island" + i + ".png";
	// islandArray.push( new island(i, playerIsland[i].width, playerIsland[i].height, 50, 500) );
	islandArray.push( new island(i, 100, 100, 50, 500) );
	// input coordinates based on octogon (8-player scenario)
	islandArray[i].x = islandLocations[i-1][0];
	islandArray[i].y = islandLocations[i-1][1];
	if (i <= maxPlayers) {
		playerArray.push ( new player(i) );
	}
}

// Total islands, excluding the small islands
var mainIslandCount = islandArray.length;

// Create small islands
var smallIslandImage = new Image();
smallIslandImage.src = "images/small-island.png";
var smallIslandMax = 100; //there will be this many small islands
var minDistance = 150; //minimum distance between islands
for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
	// islandArray.push( new island(i, smallIslandImage.width, smallIslandImage.height, 10, 100));
	islandArray.push( new island(i, 100, 100, 10, 100));
	islandArray[i].x = 50 + Math.random()*(cw-100);
	islandArray[i].y = 50 + Math.random()*(ch-100);
}

// Create island properties
function island (ID, width, height, pop, res) {
	this.ID = ID;
	this.width = width;
	this.height = height;
	this.control = 0;
	this.population = pop;
	this.resources = res;
	this.AP = 1; // action points
}

// Create player properties and methods
function player (ID) {
	this.ID = ID;
	this.islands = 0;
	this.population = 0;
	this.resources = 0;
	this.AP = 0;
	this.update = function () {
		for (var i = 0; i < islandArray.length; i++) {
			if (this.ID === islandArray[i].ID) {
				this.islands++;
				this.population += islandArray[i].population;
				this.resources += islandArray[i].resources;
				this.AP += islandArray[i].AP;
			}
		}
	};
}


// Update game objects
var update = function (clickX, clickY) {
	ctx.save();

    // Draw background image
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	// Draw big island
	// ctx.drawImage(bigIslandImage, (cw-bigIslandImage.width)/2, (ch-bigIslandImage.height)/2);
	ctx.drawImage(bigIslandImage, islandArray[0].x-100, islandArray[0].y-100);

	// Draw player islands (restructure this loop, the variable callouts are weird)
	for (var property in playerIsland) {
	    if (playerIsland.hasOwnProperty(property)) {
	    	ctx.drawImage(playerIsland[property], islandArray[property].x-25, islandArray[property].y-25, scaleImg, scaleImg);
	    }
	}

	// Draw small islands
	for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
		ctx.drawImage(smallIslandImage, islandArray[i].x-25, islandArray[i].y-25, scaleImg, scaleImg);
		if (i < 10 + maxPlayers) {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 3, islandArray[i].y + 3);
		} else if (i >= 10 + maxPlayers && i < 100 + maxPlayers) {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 5, islandArray[i].y + 3);
		} else {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 8, islandArray[i].y + 3);
		}
	}

	var islandSelected = [false];

	// Check if BIG island is clicked
	if (distClick(islandArray[0].x, islandArray[0].y, clickX, clickY) < 75) {
	
		// find all islands within travel range of the selected island
		for(var j = 1; j < islandArray.length; j++) {
			if (distClick(islandArray[0].x, islandArray[0].y, islandArray[j].x, islandArray[j].y) < maxRange+50) {
				// Draw circle around islands in travel range
				ctx.beginPath();
				ctx.arc(islandArray[j].x, islandArray[j].y, 15, 0, 2 * Math.PI);
				ctx.lineWidth=5;
				ctx.strokeStyle="limegreen";
				ctx.stroke();
			}
		}

		// Draw elipse around big island
		ctx.lineWidth=5;
		ctx.strokeStyle="red";
		drawEllipse(ctx, islandArray[0].x-95, islandArray[0].y-55, 180, 110);

		document.getElementById("island-info").innerHTML = "BIG Island, " + "Controlled by " + islandArray[0].control + ", " + "Population: " + islandArray[0].population + ", " + "Resources: " + islandArray[0].resources;
		islandSelected[0] = true;
	}

	// Check to see if any island is clicked (excluding BIG island)
	for (var i = 1; i < islandArray.length; i++) {

		if (distClick(islandArray[i].x, islandArray[i].y, clickX, clickY) < 15) {

			document.getElementById("island-info").innerHTML = "Island" + String(parseInt(islandArray[i].ID)-maxPlayers) + ", " + "Controlled by " + islandArray[i].control + ", " + "Population: " + islandArray[i].population + ", " + "Resources: " + islandArray[i].resources;
			islandSelected[0] = true;

			// Check if BIG island is in range
			if (distClick(islandArray[i].x, islandArray[i].y, islandArray[0].x, islandArray[0].y) < maxRange+50) {
				ctx.lineWidth=5;
				ctx.strokeStyle="limegreen";
				drawEllipse(ctx, islandArray[0].x-95, islandArray[0].y-55, 180, 110);
			}

			// find all islands within travel range of the selected island
			for(var j = 1; j < islandArray.length; j++) {
				if (distClick(islandArray[i].x, islandArray[i].y, islandArray[j].x, islandArray[j].y) < maxRange) {
					// Draw circle around islands in travel range
					ctx.beginPath();
					ctx.arc(islandArray[j].x, islandArray[j].y, 15, 0, 2 * Math.PI);
					ctx.lineWidth=5;
					ctx.strokeStyle="limegreen";
					ctx.stroke();
				}
			}

			// Draw circle around selected island
			ctx.beginPath();
			ctx.arc(islandArray[i].x, islandArray[i].y, 15, 0, 2 * Math.PI);
			ctx.lineWidth=5;
			ctx.strokeStyle="red";
			ctx.stroke();

			break; // found the selected island, no need to continue this this loop
		}
		
	}
	if (islandSelected[0]) {
		console.log("Island selected!");
	}
};

// Draw everything
var render = function () {
	ctx.save();

    // Draw background image
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	// Draw big island
	// ctx.drawImage(bigIslandImage, (cw-bigIslandImage.width)/2, (ch-bigIslandImage.height)/2);
	ctx.drawImage(bigIslandImage, islandArray[0].x-100, islandArray[0].y-100);

	// Draw player islands (restructure this loop, the variable callouts are weird)
	for (var property in playerIsland) {
	    if (playerIsland.hasOwnProperty(property)) {
	    	ctx.drawImage(playerIsland[property], islandArray[property].x-25, islandArray[property].y-25, scaleImg, scaleImg);
	    }
	}

	// Move islands apart to an appropriate distance
	var tempDistance;
	var deltaX;
	var deltaY;

	for (i = 1; i < islandArray.length; i++) {
		for (var j = i+1; j < islandArray.length; j++) {
			
			tempDistance0 = distBetween(islandArray[0], islandArray[j]);
			if (150 > tempDistance0) {
				if (100 > tempDistance0) {
					islandArray[j].x = 500 / Math.pow(tempDistance0, 2);
					islandArray[j].y = 500 / Math.pow(tempDistance0, 2);
				}
				deltaX = islandArray[j].x - islandArray[0].x;
				deltaY = islandArray[j].y - islandArray[0].y;
				islandArray[j].x += (1000) * deltaX / Math.pow(tempDistance0, 2);
				islandArray[j].y += (1000) * deltaY / Math.pow(tempDistance0, 2);
			}
			
			tempDistance = distBetween(islandArray[i], islandArray[j]);
			if (minDistance > tempDistance) {
				// console.log("The between island " + i + " and island j " + j + " distance is " + tempDistance);
				deltaX = islandArray[j].x - islandArray[i].x;
				deltaY = islandArray[j].y - islandArray[i].y;
				islandArray[j].x += (minDistance+100) * deltaX / Math.pow(tempDistance, 2);
				islandArray[j].y += (minDistance+100) * deltaY / Math.pow(tempDistance, 2);
				inBound(islandArray[j]);
				if (i > maxPlayers) {
					islandArray[i].x -= (minDistance+100) * deltaX / Math.pow(tempDistance, 2);
					islandArray[i].y -= (minDistance+100) * deltaY / Math.pow(tempDistance, 2);
					inBound(islandArray[i]);
				}
			}
		}
	}

	// Draw small islands
	for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
		ctx.drawImage(smallIslandImage, islandArray[i].x-25, islandArray[i].y-25, scaleImg, scaleImg);
		// if (i < 10) {
		// 	ctx.fillText(i, islandArray[i].x +22, islandArray[i].y +28);
		// } else if (i >= 10 && i < 100) {
		// 	ctx.fillText(i, islandArray[i].x +20, islandArray[i].y +28);
		// } else {
		// 	ctx.fillText(i, islandArray[i].x +17, islandArray[i].y +28);
		// }
		if (i < 10 + maxPlayers) {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 3, islandArray[i].y + 3);
		} else if (i >= 10 + maxPlayers && i < 100 + maxPlayers) {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 5, islandArray[i].y + 3);
		} else {
			ctx.fillText(i-maxPlayers, islandArray[i].x - 8, islandArray[i].y + 3);
		}
	}
};

/*// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Pause if 'p' or 'esc' is pressed
	if (27 in keysDown || 80 in keysDown
		|| 67 in keysDown || 69 in keysDown || 73 in keysDown || 75 in keysDown || 77 in keysDown || 79 in keysDown 
		) {
		cancelAnimationFrame(main);
		delete keysDown[27];
		delete keysDown[80];
		ctx.drawImage(pauseSplashImage, 0, 0);
		pauseStart = true;
		tempState = ctx.getImageData(0, 0, 800, 600); // saves the current background
		menu.selection(0);
		requestAnimationFrame(pause);
		return;
	}

	// Request to do this again ASAP
	requestAnimationFrame(main);
};*/

/*// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
//var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


// Let's play this game!
var then = Date.now();

main();*/

window.addEventListener('load', function() {
	var startTick = 0;
	var iterateIslands = setInterval(placeIslands, 30);
  	function placeIslands() {
  		startTick++;
		if (startTick === 90) {
			clearInterval(iterateIslands);
		} else {
			render();
		}

		// Assign control values to initial islands
		for (var i = 1; i <= maxPlayers; i++) {
			islandArray[i].control = i;
		}
	}

	// Left click
	canvas.addEventListener("click", function (e) {
		//console.log(e);
		update(e.offsetX, e.offsetY);

	});

	// Right click
	canvas.addEventListener('contextmenu', function(e) {
	    e.preventDefault();
	    newTurn();
	    return false;
	}, false);

	this.addEventListener("mouseover", function (e) {
		// console.log("In window.");
	});

	this.addEventListener("mouseout", function (e) {
		// console.log("Out of window.");
	});

	canvas.addEventListener("mousemove", function (e) {
		// document.getElementById("debug-box").innerHTML = e.toElement.offsetLeft + ", " + e.toElement.offsetTop;
		document.getElementById("debug-box").innerHTML = e.offsetX + ", " + e.offsetY;
	});

	// // Handle keyboard controls
	// var keysDown = {};
	// var keysUp = {70: true};

	// addEventListener("keydown", function (e) {
	// 	// if (keysUp[e.keyCode]) {delete keysUp[e.keyCode];}
		
	// 	console.log(e.key);
	// 	if (e.key === "a" && !keysDown[e.keyCode]) {
	// 		render();
	// 	}
	// 	keysDown[e.keyCode] = true;
	// }, false);

	// addEventListener("keyup", function (e) {
	// 	delete keysDown[e.keyCode]; // prevents auto-trigger
	// 	keysUp[e.keyCode] = true;
	// 	// console.log(e.key);
	// }, false);

}, false);

function distBetween (a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	// return Math.sqrt(Math.pow((a.x + a.width/2) - (b.x + b.width/2), 2) + Math.pow((a.y + a.height/2) - (b.y + b.height/2), 2));
	// return Math.sqrt(Math.pow((a.x + 3*a.width/4) - (b.x + 3*b.width/4), 2) + Math.pow((a.y + 3*a.height/4) - (b.y + 3*b.height/4), 2));
	// return Math.sqrt(Math.pow((a.x + a.width) - (b.x + b.width), 2) + Math.pow((a.y + a.height) - (b.y + b.height), 2));
}

function distClick (islx, isly, clix, cliy) {
	return Math.sqrt(Math.pow(islx - clix, 2) + Math.pow(isly - cliy, 2));
}

function inBound (a) {
	var aOff = 25; // Offset from the screen edge
	var bOff = 25; // Bounce when it hits the edge
	if (a.x < aOff)		a.x = aOff+bOff;
	if (a.x > cw-aOff)	a.x = cw-aOff-bOff;
	if (a.y < aOff)		a.y = aOff+bOff;
	if (a.y > ch-aOff)	a.y = ch-aOff-bOff;
}

function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  //ctx.closePath(); // not used correctly, see comments (use to close off open path)
  ctx.stroke();
}

function newTurn () {
	turn++;
	playerTurn++;
	if (playerTurn > maxPlayers) {playerTurn = 1;}
	// console.log("playerTurn = " + playerTurn);
	// console.log(playerArray[playerTurn]);
	// for (var i = 0; i < islandArray.length; i++) {
	// 	if (islandArray[i].control === playerArray[playerTurn].ID) {
	// 		playerArray[playerTurn].islands++;
	// 		playerArray[playerTurn].population += islandArray[i].population;
	// 		playerArray[playerTurn].resources += islandArray[i].resources;
	// 	}
	// }

	playerArray[playerTurn].update();
	document.getElementById("player-info").innerHTML = "Player " + playerArray[playerTurn].ID + " controls " + playerArray[playerTurn].islands + " with a total population of " + playerArray[playerTurn].population + " and a stash of " + playerArray[playerTurn].resources + ". There are " + playerArray[playerTurn].AP + " action point(s) left this turn.";
}