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
var round = 0;
var playerTurn = 0;
var maxPlayers = 8; // maximum players
var maxRange = 150; // maximum travel range from an island
var islandSelected = [false];
var improveSelected = false;
var travelSelected = false;
// Animal attributes: Name, Technology, Language, Breeding, Unity, Shelter, Agriculture, Fortitude, Hunting
var animalTraits = [[],
["Macropodine", 2,	1,	-1,	-2,	0,	0,	0,	0],
["Apiarian", -2,	0,	0,	1,	2,	-1,	0,	0],
["Leporine", 0,	0,	2,	0,	0,	1,	-1,	-2],
["Porcine", 0,	0,	0,	0,	-1,	2,	1,	-1],
["Eusuchian", 0,	-2,	1,	-1,	0,	0,	2,	0],
["Canine", 0,	0,	0,	2,	-1,	-2,	0,	1],
["Feline", 1,	-1,	0,	0,	0,	0,	-2,	2],
["Anatine", -1,	2,	-2,	0,	1,	0,	0,	0]
];

// Click menu global variables
var clickMenu = {};
var destinationIsland = [];
var isMenuOpen = false;
var	mw,	mh,	mtlx, mtly;
var technologyY, languageY, breedingY, unityY, shelterY, agricultureY, fortitudeY, huntingY;

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
var playerFlag = [0]; // create player array, intialize with 0 to sync with initial player islands
for (var i = 1; i <= maxPlayers; i++) {
	playerIsland[i] = new Image();
	playerIsland[i].src = "images/island" + i + ".png";
	playerFlag[i] = new Image();
	playerFlag[i].src = "images/flag" + i + ".png";
	// islandArray.push( new island(i, playerIsland[i].width, playerIsland[i].height, 50, 500) );
	islandArray.push( new island(i, 100, 100, 100, 100) ); // initialize each player with 100 population and 100 resources
	// input coordinates based on octogon (8-player scenario)
	islandArray[i].x = islandLocations[i-1][0];
	islandArray[i].y = islandLocations[i-1][1];
}

// Add traits to each player
var playerArray = [0]; // create player array, intialize with 0 to sync with initial player islands
for (var i = 1; i <= maxPlayers; i++) {
	playerArray.push ( new player(i) );
	playerArray[i].name = animalTraits[i][0];
	playerArray[i].technology = animalTraits[i][1];
	playerArray[i].language = animalTraits[i][2];
	playerArray[i].breeding = animalTraits[i][3];
	playerArray[i].unity = animalTraits[i][4];
	playerArray[i].shelter = animalTraits[i][5];
	playerArray[i].agriculture = animalTraits[i][6];
	playerArray[i].fortitude = animalTraits[i][7];
	playerArray[i].hunting = animalTraits[i][8];
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
	this.improveLVL = 0;
	this.update = function (round) {
		this.islands = [];
		this.population = 0;
		this.resources = 0;
		this.AP = 0;
		// this.isSelected = false;
		if (round === 0) {
			for (var i = 0; i < islandArray.length; i++) {
				if (this.ID === islandArray[i].control) {
					this.islands.push(islandArray[i]);
					this.population += islandArray[i].population;
					this.resources += islandArray[i].resources;
					this.AP += islandArray[i].AP;
				}
			}
		} else {
			console.log("Round " + round);
			for (var i = 0; i < islandArray.length; i++) {
				if (this.ID === islandArray[i].control) {
					this.islands.push(islandArray[i]);
					islandArray[i].population = Math.floor((1 + (this.breeding * 0.1))*islandArray[i].population);
					this.population += islandArray[i].population;
					this.resources += islandArray[i].resources;
					this.AP += islandArray[i].AP;
				}
			}
		}
	};
}

//-------------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------- PRIMARY HANDLER; CONTROLS --------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------------------//
window.addEventListener('load', function() {
	
	// Initialize map
	var startTick = 0;
	var iterateIslands = setInterval(placeIslands, 30);
  	function placeIslands() {
  		startTick++;
		if (startTick === 90) {
			clearInterval(iterateIslands);
		} else {
			initialize();
		}

		// Assign control values to initial islands
		for (var i = 1; i <= maxPlayers; i++) {
			islandArray[i].control = i;
		}
	}

	// Left click
	canvas.addEventListener("click", function (e) {
		//console.log(e);
		if(isMenuOpen) {
			if (improveSelected) {
				console.log("Improve is selected.");
				improveSelected = false;
				// Check to see if click is within player-stat bounds
				if(e.offsetX <= mtlx + mw && e.offsetX >= mtlx && e.offsetY <= mtly + mh && e.offsetY >= mtly) {

					if (e.offsetY >= technologyY && e.offsetY < languageY) {
						console.log("Technology was clicked");
						playerArray[playerTurn].update(0);
						playerArray[playerTurn].improveLVL++;
						console.log("playerArray[playerTurn].improveLVL = " + playerArray[playerTurn].improveLVL);
						playerArray[playerTurn].islands.forEach(function(item){
							// console.log("Island" + item.ID + " had " + item.resources + " resources.");
							item.resources -= Math.floor(playerArray[playerTurn].improveLVL * 100 * (item.resources/playerArray[playerTurn].resources));
							// console.log("Island" + item.ID + " now has " + item.resources + " resources.");
						});
						// for (var i = 0; i < playerArray[playerTurn].islands.length; i++) {
						// 	playerArray[playerTurn].islands[i].resources -= playerArray[playerTurn].improveLVL * 100 * Math.floor(playerArray[playerTurn].islands[i].resources/playerArray[playerTurn].resources);
						// }
						// playerArray[playerTurn].resources -= playerArray[playerTurn].improveLVL * 100;
						playerArray[playerTurn].technology++;
						playerArray[playerTurn].update(0);
						update(islandSelected[1].x, islandSelected[1].y); // redraw map and islands
						openMenu(true, 0, 0, islandSelected[1]); // redraw menu at same location of the previously opened menu with 'true' option
						// console.log(playerArray[playerTurn].islands);
					}
					if (e.offsetY >= languageY && e.offsetY < breedingY) {
						console.log("languageY was clicked");
						playerArray[playerTurn].language++;
					}
					if (e.offsetY >= breedingY && e.offsetY < unityY) {
						console.log("breedingY was clicked");
						playerArray[playerTurn].breeding++;
					}
					if (e.offsetY >= unityY && e.offsetY < shelterY) {
						console.log("unityY was clicked");
						playerArray[playerTurn].unity++;
					}
					if (e.offsetY >= shelterY && e.offsetY < agricultureY) {
						console.log("shelterY was clicked");
						playerArray[playerTurn].shelter++;
					}
					if (e.offsetY >= agricultureY && e.offsetY < fortitudeY) {
						console.log("agricultureY was clicked");
						playerArray[playerTurn].agriculture++;
					}
					if (e.offsetY >= fortitudeY && e.offsetY < huntingY) {
						console.log("fortitudeY was clicked");
						playerArray[playerTurn].fortitude++;
					}
					if (e.offsetY >= huntingY && e.offsetY < huntingY+20) {
						console.log("huntingY was clicked");
						playerArray[playerTurn].hunting++;
					}

				// Refresh screen with IMPROVE selection
				update(islandSelected[1].x, islandSelected[1].y); // redraw map and islands
				openMenu(true, 0, 0, islandSelected[1]); // redraw menu at same location of the previously opened menu with 'true' option				
				}
			} else if (travelSelected) {
				travelSelected = false;
				console.log("Selected Island" + islandSelected[1].ID + " x=" + islandSelected[1].x + " y=" + islandSelected[1].y);
				destinationIsland.forEach( function (item) {
					// console.log("Island" + item.ID + " x=" + item.x + " y=" + item.y);
					var distC = distClick(e.offsetX, e.offsetY, item.x, item.y);
					// console.log(distC);
					if (item.ID != 0) {
						if (distC < 15) {
							// console.log("Travel to " + item.ID + " completed with a click distance of " + distC);
							item.control = islandSelected[1].control;							
							islandSelected.pop();
							islandSelected.push(item);
							isMenuOpen = false;
							// update(e.offsetX, e.offsetY); // redraw map and islands
							// menuSelect(e.offsetY);
							playerArray[playerTurn].update(0);
							update(item.x, item.y); // redraw map and islands
							openMenu(true, 0, 0, islandSelected[1]); // redraw menu at same location of the previously opened menu with 'true' option
						}
					} else {
						if (distC < 85) {
							// console.log("Travel to " + item.ID + " completed with a click distance of " + distC);
							item.control = islandSelected[1].control;
							islandSelected.pop();
							islandSelected.push(item);
							isMenuOpen = false;
							playerArray[playerTurn].update(0);
							update(item.x, item.y); // redraw map and islands
							openMenu(true, 0, 0, islandSelected[1]); // redraw menu at same location of the previously opened menu with 'true' option
						}
					}
				});
			} else {
				// Check to see if click is within menu bounds
				if(e.offsetX <= mtlx + mw && e.offsetX >= mtlx && e.offsetY <= mtly + mh && e.offsetY >= mtly) {
					update(e.offsetX, e.offsetY); // redraw map and islands
					menuSelect(e.offsetY);
					openMenu(true, 0, 0, islandSelected[1]); // redraw menu at same location of the previously opened menu with 'true' option
				} else {
					console.log("Did not click within the menu boundaries.");
					isMenuOpen = false;
					if (islandSelected.length > 1) {
						// remove the last selected island
						islandSelected.pop();
					}
					update(e.offsetX, e.offsetY); // redraw map and islands without menu (if no new island is clicked)
				}
			}
		} else {
			console.log("isMenuOpen is false");
			update(e.offsetX, e.offsetY);
			console.log("isMenuOpen is now '" + isMenuOpen + "'");
		}
	});

	// Right click
	canvas.addEventListener('contextmenu', function(e) {
	    e.preventDefault();
	    newTurn();
	    return false;
	}, false);

	this.addEventListener("mouseover", function (e) {
		// console.log("In window.");
		if (isMenuOpen && e.offsetX <= mtlx + mw && e.offsetX >= mtlx && e.offsetY <= mtly + mh && e.offsetY >= mtly) {
			console.log("In menu boundaries.");
		}
	});

	this.addEventListener("mouseout", function (e) {
		// console.log("Out of window.");
	});

	canvas.addEventListener("mousemove", function (e) {
		// document.getElementById("debug-box").innerHTML = e.toElement.offsetLeft + ", " + e.toElement.offsetTop;
		document.getElementById("debug-box").innerHTML = e.offsetX + ", " + e.offsetY;
	});

}, false);


// Initially draw everything
var initialize = function () {
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
	}
};

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
	if (islandArray[0].control != 0) {
		drawFlag(islandArray[0]);
	}

	// Draw player islands (restructure this loop, the variable callouts are weird)
	for (var property in playerIsland) {
	    if (playerIsland.hasOwnProperty(property)) {
	    	ctx.drawImage(playerIsland[property], islandArray[property].x-25, islandArray[property].y-25, scaleImg, scaleImg);
	    }
	    if (islandArray[property].control != 0) {
			drawFlag(islandArray[property]);
		}
	}

	// Draw small islands
	for (var i = mainIslandCount; i < smallIslandMax + mainIslandCount; i++) {
		ctx.drawImage(smallIslandImage, islandArray[i].x-25, islandArray[i].y-25, scaleImg, scaleImg);
		if (islandArray[i].control != 0) {
			drawFlag(islandArray[i]);
		}
	}

	if(!isMenuOpen) {

		islandSelected[0] = false;
		destinationIsland = [];

		// Check if BIG island is clicked
		if (distClick(islandArray[0].x, islandArray[0].y, clickX, clickY) < 75) {
		
			// find all islands within travel range of the selected island
			for(var j = 1; j < islandArray.length; j++) {
				if (distClick(islandArray[0].x, islandArray[0].y, islandArray[j].x, islandArray[j].y) < maxRange+50) {
					// // Draw circle around islands in travel range
					// ctx.beginPath();
					// ctx.arc(islandArray[j].x, islandArray[j].y, 15, 0, 2 * Math.PI);
					// ctx.lineWidth=5;
					// ctx.strokeStyle="limegreen";
					// ctx.stroke();

					destinationIsland.push(islandArray[j]);
				}
			}

			// Draw elipse around big island
			ctx.lineWidth=5;
			ctx.strokeStyle="red";
			drawEllipse(ctx, islandArray[0].x-95, islandArray[0].y-55, 180, 110);

			document.getElementById("island-info").innerHTML = "BIG Island, " + "Controlled by " + islandArray[0].control + ", " + "Population: " + islandArray[0].population + ", " + "Resources: " + islandArray[0].resources;
			islandSelected[0] = true;
			if (islandSelected.length > 1) {
				// remove the last selected island if there is one to be removed
				islandSelected.pop();
				islandSelected.push(islandArray[0]);
			} else {
				islandSelected.push(islandArray[0]);
			}

			// if (islandArray[0].control != 0) {
			// 	drawFlag(islandArray[0]);
			// }

		}

		// Check to see if any island is clicked (excluding BIG island)
		for (var i = 1; i < islandArray.length; i++) {

			if (distClick(islandArray[i].x, islandArray[i].y, clickX, clickY) < 15) {

				if (islandArray[i].control == 0) {
					document.getElementById("island-info").innerHTML = "Island" + String(parseInt(islandArray[i].ID)-maxPlayers) + ", neutral territory, " + "Population: " + islandArray[i].population + ", " + "Resources: " + islandArray[i].resources;
				} else {
					document.getElementById("island-info").innerHTML = "Island" + String(parseInt(islandArray[i].ID)-maxPlayers) + ", controlled by Player " + islandArray[i].control + ", " + "Population: " + islandArray[i].population + ", " + "Resources: " + islandArray[i].resources;
				}
				
				islandSelected[0] = true;
				if (islandSelected.length > 1) {
					// remove the last selected island if there is one to be removed
					islandSelected.pop();
					islandSelected.push(islandArray[i]);
				} else {
					islandSelected.push(islandArray[i]);
				}


				// Check if BIG island is in range
				if (distClick(islandArray[i].x, islandArray[i].y, islandArray[0].x, islandArray[0].y) < maxRange+50) {
					// ctx.lineWidth=5;
					// ctx.strokeStyle="limegreen";
					// drawEllipse(ctx, islandArray[0].x-95, islandArray[0].y-55, 180, 110);

					destinationIsland.push(islandArray[0]);
				}

				// find all islands within travel range of the selected island
				for(var j = 1; j < islandArray.length; j++) {
					if (distClick(islandArray[i].x, islandArray[i].y, islandArray[j].x, islandArray[j].y) < maxRange) {
						// Draw circle around islands in travel range
						// ctx.beginPath();
						// ctx.arc(islandArray[j].x, islandArray[j].y, 15, 0, 2 * Math.PI);
						// ctx.lineWidth=5;
						// ctx.strokeStyle="limegreen";
						// ctx.stroke();

						if (i != j) {
							destinationIsland.push(islandArray[j]);
						}
					}
				}

				// Draw circle around selected island
				// ctx.beginPath();
				// ctx.arc(islandArray[i].x, islandArray[i].y, 15, 0, 2 * Math.PI);
				// ctx.lineWidth=5;
				// ctx.strokeStyle="red";
				// ctx.stroke();

				// break; // found the selected island, no need to continue this this loop
			}

			// if (islandArray[i].control != 0) {
			// 	drawFlag(islandArray[i]);
			// }
		}

		// If an island is selected, the cell from this array should be true
		if (islandSelected[0]) {
			console.log("New island selected");
			openMenu(false, clickX, clickY, islandSelected[1]);
		} /*else if (islandSelected.length > 1) {
			// remove the last selected island if there is one to be removed
			islandSelected.pop();
		}*/
	}

	document.getElementById("player-info").innerHTML = "Player " + playerArray[playerTurn].ID + " controls " + playerArray[playerTurn].islands.length + " with a total population of " + playerArray[playerTurn].population + " and a stash of " + playerArray[playerTurn].resources + " resources. There are " + playerArray[playerTurn].AP + " action point(s) left this turn.";		
};

function distBetween (a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function distClick (islx, isly, clix, cliy) {
	return Math.sqrt(Math.pow(islx - clix, 2) + Math.pow(isly - cliy, 2));
}

// Dim the map when the menu is open
// Open click menu
function openMenu (wasOpen, clix, cliy, obj) {
	
	// Check to see if the menue was already open
	if(!wasOpen) {
		isMenuOpen = true;

		// Check promixity to canvas boundaries
		mw = 200; // pop-up menu width
		mh = 400; // pop-up menu height
		mtlx = clix+maxRange+25; // top left x-coordiante
		mtly = cliy-mh/2; // top left y-coordinate

		// Put menu to the left when clicking on the right side of the canvas
		if (clix > cw/2) {
			mtlx -= mw + 2*(maxRange+25);
		}
		// Shift the menu down when too close the top of the canvas
		if (cliy - mh/2 < 15) {
			mtly = 15;
		}
		// Shift the menu up when too close to the bottom of the canvas
		if (cliy + mh/2 > ch - 15) {
			mtly = (ch - 15) - mh;
		}
	}

	// Draw circle around selected island
	if (obj.ID === 0) {
		ctx.lineWidth=5;
		ctx.strokeStyle="red";
		drawEllipse(ctx, obj.x-95, obj.y-55, 180, 110);
	} else {
		ctx.beginPath();
		ctx.arc(obj.x, obj.y, 15, 0, 2 * Math.PI);
		ctx.lineWidth=5;
		ctx.strokeStyle="red";
		ctx.stroke();
	}

	// Draw menu box
	ctx.strokeStyle="rgba(0,0,0,0.85)";
	ctx.strokeRect(mtlx-2, mtly-2, mw+2, mh+2);
	ctx.strokeStyle="rgba(255,255,255,0.25)";
	ctx.strokeRect(mtlx-1, mtly-1, mw+1, mh+1);
	ctx.fillStyle="rgba(0,0,0,0.85)";
	ctx.fillRect(mtlx, mtly, mw, mh); 

	// Populate menu
	ctx.fillStyle = "rgb(0, 250, 0)";
	ctx.font = "16px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	var sT = 10; // line spacing
	var tT = 14; // Adjust for font height

	ctx.fillText("Island " + obj.ID, mtlx+mw/2, mtly + sT); sT+=tT+10;
	ctx.textAlign = "left";
	ctx.font = "12px Helvetica";
	if (obj.control != 0) {
		ctx.fillText("Owner: Player " + obj.control, mtlx+10, mtly + sT); sT+=tT;
		ctx.fillText("Name: " + playerArray[obj.control].name, mtlx+10, mtly + sT); sT+=tT;
		technologyY = mtly + sT; sT+=tT;
		languageY = mtly + sT; sT+=tT;
		breedingY = mtly + sT; sT+=tT;
		unityY = mtly + sT; sT+=tT;
		shelterY = mtly + sT; sT+=tT;
		agricultureY = mtly + sT; sT+=tT;
		fortitudeY = mtly + sT; sT+=tT;
		huntingY = mtly + sT; sT+=tT;
		ctx.fillText("Technology: " + playerArray[obj.control].technology, mtlx+30, technologyY);
		ctx.fillText("Language: " + playerArray[obj.control].language, mtlx+30, languageY);
		ctx.fillText("Breeding: " + playerArray[obj.control].breeding, mtlx+30, breedingY);
		ctx.fillText("Unity: " + playerArray[obj.control].unity, mtlx+30, unityY);
		ctx.fillText("Shelter: " + playerArray[obj.control].shelter, mtlx+30, shelterY);
		ctx.fillText("Agriculture: " + playerArray[obj.control].agriculture, mtlx+30, agricultureY);
		ctx.fillText("Fortitude: " + playerArray[obj.control].fortitude, mtlx+30, fortitudeY);
		ctx.fillText("Hunting: " + playerArray[obj.control].hunting, mtlx+30, huntingY);
	} else {
		ctx.fillText("Owner: Neutral", mtlx+10, mtly + sT); sT+=tT;
	}
	ctx.fillText("Population: " + obj.population, mtlx+10, mtly + sT); sT+=tT;
	ctx.fillText("Resources: " + obj.resources, mtlx+10, mtly + sT); sT+=tT+15;

	ctx.fillStyle = "rgb(0, 0, 250)";
	if (obj.control == playerTurn) {
		ctx.fillText("Player Turn: True", mtlx+10, mtly + sT); sT+=tT+15;
	} else {
		ctx.fillText("Player Turn: False", mtlx+10, mtly + sT); sT+=tT+15;
	}

	// ACTIONS
	tT = 25;
	clickMenu.fontHeight = tT-2;
	ctx.fillStyle = "rgb(250, 0, 0)";
	ctx.fillText("Choose from the following:", mtlx+10, mtly + sT); sT+=tT;
	ctx.font = "20px Helvetica";
	ctx.textAlign = "center";
	clickMenu.improveY = mtly + sT;
	ctx.fillText("IMPROVE", mtlx+mw/2, clickMenu.improveY); sT+=tT;
	clickMenu.breedY = mtly + sT;
	ctx.fillText("BREED", mtlx+mw/2, mtly + sT); sT+=tT;
	clickMenu.huntY = mtly + sT;
	ctx.fillText("HUNT/GATHER", mtlx+mw/2, mtly + sT); sT+=tT;
	clickMenu.travelY = mtly + sT;
	ctx.fillText("TRAVEL", mtlx+mw/2, mtly + sT); sT+=tT;
	clickMenu.interactY = mtly + sT;
	ctx.fillText("INTERACT", mtlx+mw/2, mtly + sT); sT+=tT;

	ctx.textAlign = "left";
}

function menuSelect (clickY) {

	if(clickY <= clickMenu.improveY + clickMenu.fontHeight && clickY >= clickMenu.improveY) {
		console.log("IMPROVE");
		improveSelected = true;
/*			ctx.lineWidth=1;
		ctx.fillStyle = "rgb(250, 250, 0)";
		ctx.moveTo(mtlx, clickMenu.improveY);
		ctx.lineTo(mtlx + mw, clickMenu.improveY);
		ctx.stroke();
		ctx.moveTo(mtlx, clickMenu.improveY + clickMenu.fontHeight);
		ctx.lineTo(mtlx + mw, clickMenu.improveY + clickMenu.fontHeight);
		ctx.stroke(); */
	} else if(clickY <= clickMenu.breedY + clickMenu.fontHeight && clickY >= clickMenu.breedY) {
		console.log("BREED");
		console.log("Player Turn = " + playerTurn);
		playerArray[playerTurn].population = 0;
		for (var i = 0; i < islandArray.length; i++) {
			if (playerTurn === islandArray[i].control) {
				// console.log(islandArray[i].ID + " under control of : " + islandArray[i].control);
				// must modify this calculation to include the possibility of other species being present on the island
				// 8/23/2017 calc update follows: you get 100 every round per island, + (breeding x10%), ÷ number of species present
				islandArray[i].population = Math.floor((1 + (playerArray[playerTurn].breeding * 0.1))*islandArray[i].population);
				playerArray[playerTurn].population += islandArray[i].population;
				// visually update the menu by redrawing
			}
		}
		console.log("Population: " + playerArray[playerTurn].population);
	} else if(clickY <= clickMenu.huntY + clickMenu.fontHeight && clickY >= clickMenu.huntY) {
		console.log("HUNT/GATHER");
		playerArray[playerTurn].resources = 0;
		for (var i = 0; i < islandArray.length; i++) {
			if (playerTurn === islandArray[i].control) {
				// console.log(islandArray[i].ID + " under control of : " + islandArray[i].control);
				islandArray[i].resources = Math.floor((1 + (Math.max(playerArray[playerTurn].hunting, playerArray[playerTurn].agriculture) * 0.1))*islandArray[i].resources);
				playerArray[playerTurn].resources += islandArray[i].resources;
				// visually update the menu by redrawing
			}
		}
		console.log("Resources: " + playerArray[playerTurn].resources);
	} else if(clickY <= clickMenu.travelY + clickMenu.fontHeight && clickY >= clickMenu.travelY) {
		console.log("TRAVEL");
		// Draw green circles around islands within traveling range
		destinationIsland.forEach( function (item) {
			// console.log(item);
			if (item.ID === 0) {
				ctx.lineWidth=5;
				ctx.strokeStyle="limegreen";
				drawEllipse(ctx, item.x-95, item.y-55, 180, 110);
			} else {
				ctx.beginPath();
				// ctx.arc(islandArray[item].x, islandArray[item].y, 15, 0, 2 * Math.PI);
				ctx.arc(item.x, item.y, 15, 0, 2 * Math.PI);
				ctx.lineWidth=5;
				ctx.strokeStyle="limegreen";
				ctx.stroke();
			}
		});

		// Enable travel control
		travelSelected = true;

	} else if(clickY <= clickMenu.interactY + clickMenu.fontHeight && clickY >= clickMenu.interactY) {
		console.log("INTERACT");
	}
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

function drawFlag (obj) {
	// console.log(playerFlag[1]);
	// console.log(obj.control);
	ctx.drawImage(playerFlag[obj.control], obj.x, obj.y-40, 25, 40);
}

function newTurn () {
	turn++;
	playerTurn++;
	if (playerTurn > maxPlayers) {
		playerTurn = 1;
		round++;
	}

	playerArray[playerTurn].update(round);
	document.getElementById("player-info").innerHTML = "Player " + playerArray[playerTurn].ID + " controls " + playerArray[playerTurn].islands.length + " with a total population of " + playerArray[playerTurn].population + " and a stash of " + playerArray[playerTurn].resources + " resources. There are " + playerArray[playerTurn].AP + " action point(s) left this turn.";
}



// NOTES

// Need to keep working on the menu. When open, it will not open a new menu when clicked on a different island for the first time. The first click on a different island will close the current menu.
// The Breed option is one click ahead on the graphic display