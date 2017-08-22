// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 800;
document.body.appendChild(canvas);
// not working when youtube is running
// canvas.focus();

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
var yoff = -100 + scaleImg; //y offset
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
islandArray[0].x = (cw-200)/2;
islandArray[0].y = (ch-200)/2;

/*for (var i = 0; i < islandLocations.length; i++) {
	console.log("Island " + i + ": x=" + islandLocations[i][0] + " & y=" + islandLocations[i][1]);
}*/

// Load Islands
// var islandReady = false;
// var islandImage = new Image();

// Load player islands and push into islandArray
var playerIsland = [];
for (var i = 1; i <= 8; i++) {
	playerIsland[i] = new Image();
	playerIsland[i].src = "images/island" + i + ".png";
	// islandArray.push( new island(i, playerIsland[i].width, playerIsland[i].height, 50, 500) );
	islandArray.push( new island(i, 100, 100, 50, 500) );
	islandArray[i].x = islandLocations[i-1][0];
	islandArray[i].y = islandLocations[i-1][1];
}
/*island.onload = function () {
	islandReady = true;
};*/
// islandImage.src = "images/island1.png";

// console.log(island);

/*islandLocations.forEach(function(item) {
	console.log(item);
});*/

// Total islands, excluding the small islands
var mainIslandCount = islandArray.length;

// Create small islands
var smallIslandImage = new Image();
smallIslandImage.src = "images/small-island.png";
var smallIslandMax = 200; //there will be this many small islands
var minDistance = 100; //minimum distance between islands
for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
	// islandArray.push( new island(i, smallIslandImage.width, smallIslandImage.height, 10, 100));
	islandArray.push( new island(i, 100, 100, 10, 100));
	islandArray[i].x = 50 + Math.random()*(cw-100);
	islandArray[i].y = 50 + Math.random()*(ch-100);

	// // Prevent islands from overlapping: this method takes entirely too long
	// var distFail;
	// var tempDistance;
	// do {
	// 	distFail = false;
	// 	islandArray[i].x = 50 + Math.random()*(cw-100);
	// 	islandArray[i].y = 50 + Math.random()*(ch-100);
	// 	for (var j = 0; j < islandArray.length-1; j++) {
	// 		tempDistance = distBetween(islandArray[i].x, islandArray[i].y, islandArray[j].x, islandArray[j].y);
	// 		if (minDistance > tempDistance) {
	// 			console.log("The between island " + i + " and island j " + j + " distance is " + tempDistance);
	// 			distFail = true;
	// 		}
	// 	}
	// } while (distFail);
}

// Create island properties
function island (ID, width, height, pop, res) {
	this.ID = ID;
	this.width = width;
	this.height = height;
	this.control = 0;
	this.population = pop;
	this.resources = res;
}
// create spite metaobject
/*function Sprite () {
	this.xp = 150;
	this.speed = 128;
	this.HP = 3;
	this.HPMax = 3;
	this.isAlive = true;
	this.deathNum = 0;
	this.move_tick = 0;
	this.move_throttle = 10;
	this.death_tick = 50;
	this.death_frames = 0;
	this.distToHero = function () {
		return Math.sqrt(Math.pow(hero.x - this.x, 2) + Math.pow(hero.y - this.y, 2));
	}
	this.aggro = false;
	this.aggroRad = 800; // aggro radius is 200px
	this.animateDeath = function(n){
		this.deathNum++;
		this.death_x = this.x;
		this.death_y = this.y;
		this.HP = this.HPMax;
		this.fatigue = this.fatigueMax
		this.isAlive = false;
		switch (n) {
			case 0:
				this.death_tick = 0;
				break;
			case 1:
				this.explode_tick = 0;
				break;
			default:
				this.death_tick = 0;
				break;
		}
	}
	this.kbActive = false;
	this.kbDistance_x = 0;
	this.kbDistance_y = 0;
	this.kbIteration = 0;
	this.kb_tick = 0;
	this.isStunned = false;
	this.stun_tick = 0;
}*/


// Handle keyboard controls
var keysDown = {};
var keysUp = {70: true};

addEventListener("keydown", function (e) {
	// if (keysUp[e.keyCode]) {delete keysUp[e.keyCode];}
	
	// console.log(e.key);
	if (e.key === "a" /*&& !keysDown[e.keyCode]*/) {
		render();
	}
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode]; // prevents auto-trigger
	keysUp[e.keyCode] = true;
	// console.log(e.key);
}, false);

// Update game objects
var update = function (modifier) {
	// Hero has reached the boundaries
	// if (hero.x > 2368) {hero.x = 2368;}

	// When 'a' pressed, hero dashes
/*	if (!(65 in keysDown)) {
		hero.dash = 1;
	} else if (hero.fatigue > 1 && !hero.exhausted) {
		hero.dash = 2;
		hero.fatigue -= hero.fatigueDash;
		delete keysUp[65];
	}*/
};

// Draw everything
var render = function () {
	// Move canvas viewport to track hero
	ctx.save();
    //ctx.translate(-hero.x + 400, -hero.y + 300);

    // Draw background image
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	// Draw player islands (restructure this loop, the variable callouts are odd)
	for (var property in playerIsland) {
	    if (playerIsland.hasOwnProperty(property)) {
	    	// console.log(playerIsland[property]);
	        // console.log(property + ": " + playerIsland[property].x);
	        // console.log(playerIslandLocations[parseInt(property)-1][0]);
	        // playerIsland[property].x = parseInt(playerIslandLocations[parseInt(property)-1][0]);
	        // playerIsland[property].y = parseInt(playerIslandLocations[parseInt(property)-1][1]);
	        // console.log(playerIsland[property]);
	        // console.log(" with an x = " + playerIsland[property].x + " and y = " + playerIsland[property].y);
	       	// console.log("Type of property is " + typeof parseInt(property) + " with a value of " + property);
	       	// ctx.drawImage(playerIsland[property], islandLocations[parseInt(property)-1][0], islandLocations[parseInt(property)-1][1], scaleImg, scaleImg);
	    	ctx.drawImage(playerIsland[property], islandArray[property].x, islandArray[property].y, scaleImg, scaleImg);
	    }
	}

	// Draw big island
	// ctx.drawImage(bigIslandImage, (cw-bigIslandImage.width)/2, (ch-bigIslandImage.height)/2);
	ctx.drawImage(bigIslandImage, islandArray[0].x, islandArray[0].y);

	// Draw small islands
	for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
		ctx.drawImage(smallIslandImage, islandArray[i].x, islandArray[i].y, scaleImg, scaleImg);
		if (i < 10) {
			ctx.fillText(i, islandArray[i].x +22, islandArray[i].y +28);
		} else if (i >= 10 && i < 100) {
			ctx.fillText(i, islandArray[i].x +20, islandArray[i].y +28);
		} else {
			ctx.fillText(i, islandArray[i].x +18, islandArray[i].y +28);
		}
	}

	// Move islands apart to an appropriate distance
	// var distFail;
	var tempDistance;
	var deltaX;
	var deltaY;
	// do {
		// distFail = false;
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
				console.log("The between island " + i + " and island j " + j + " distance is " + tempDistance);
				// if (islandArray[i].x < islandArray[j].x) {
				// 	islandArray[j].x++;
				// } else if (islandArray[i].x > islandArray[j].x) {
				// 	islandArray[j].x--;
				// } else if (islandArray[i].y < islandArray[j].y) {
				// 	islandArray[j].y++;
				// } else if (islandArray[i].y > islandArray[j].y) {
				// 	islandArray[j].y--;
				// }
				deltaX = islandArray[j].x - islandArray[i].x;
				deltaY = islandArray[j].y - islandArray[i].y;
				islandArray[j].x += (minDistance+100) * deltaX / Math.pow(tempDistance, 2);
				islandArray[j].y += (minDistance+100) * deltaY / Math.pow(tempDistance, 2);
				inBound(islandArray[j]);
				if (i > 8) {
					islandArray[i].x -= (minDistance+100) * deltaX / Math.pow(tempDistance, 2);
					islandArray[i].y -= (minDistance+100) * deltaY / Math.pow(tempDistance, 2);
					inBound(islandArray[i]);
				}
				// distFail = true;
			}
		}
	}
	// } while (distFail);

	// Draw circle
	ctx.beginPath();
	ctx.arc(150, 55, 40, 0, 2 * Math.PI);
	ctx.strokeStyle="red";
	ctx.stroke();

/*	if (islandReady) {
		ctx.drawImage(islandImage, 200, 200);
	}*/


/*	// Hero health bar
	ctx.drawImage(hpBoxImage, 0, 0, 24, 8, hero.x - 390, hero.y - 290, 96, 24);
	ctx.beginPath();
	ctx.lineWidth="6";
	ctx.fillStyle="#AA0000";
	ctx.rect(hero.x - 386, hero.y - 286, 88 * hero.HP/hero.HPMax, 16);
	ctx.fill();

	// Display hero vitals
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("HP: " + Math.floor(hero.HP), hero.x - 385, hero.y - 283);
	if (!hero.exhausted) {
		ctx.fillText("FP: " + Math.floor(hero.fatigue), hero.x - 385, hero.y - 253);
	}
	if (hero.exhausted) {
		ctx.fillText("FP: ", hero.x - 385, hero.y - 253);
		ctx.font = "10px Helvetica";
		ctx.fillText("(exhausted)", hero.x - 360, hero.y - 253);
		ctx.font = "12px Helvetica";
	}
	ctx.fillText("XP: " + hero.xp, hero.x - 385, hero.y - 223);
	if (hero.levelup) {
		ctx.font = "20px Helvetica";
		ctx.fillText("+", hero.x - 285, hero.y - 227);
	}*/

	// Live debugging text
/*	ctx.fillText("Distance to monster[0]: " + Math.floor(monsters[0].distToHero()), hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("Number of monsters: " + monsters.length, hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("dir_block: " + dir_block, hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("dir = " + dir, hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("Dash value = " + hero.dash, hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("Keys Down = " + Object.getOwnPropertyNames(keysDown).sort(), hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("Keys Up = " + Object.getOwnPropertyNames(keysUp).sort(), hero.x + 200, hero.y - 290 + sT); sT+=14;
	ctx.fillText("sUp = " + sUp, hero.x + 200, hero.y - 290 + sT); sT+=14;*/
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

function distBetween (a, b) {
	return Math.sqrt(Math.pow((a.x + 3*a.width/4) - (b.x + 3*b.width/4), 2) + Math.pow((a.y + 3*a.height/4) - (b.y + 3*b.height/4), 2));
	// return Math.sqrt(Math.pow((a.x + a.width/2) - (b.x + b.width/2), 2) + Math.pow((a.y + a.height/2) - (b.y + b.height/2), 2));
	// return Math.sqrt(Math.pow((a.x + a.width) - (b.x + b.width), 2) + Math.pow((a.y + a.height) - (b.y + b.height), 2));
}

function inBound (a) {
	var aOff = 50; // Offset from the screen edge
	if (a.x < 0) a.x = 100;
	if (a.x > cw-aOff) a.x = cw-aOff-100;
	if (a.y < 0) a.y = 100;
	if (a.y > ch-aOff) a.y = ch-aOff-100;
}