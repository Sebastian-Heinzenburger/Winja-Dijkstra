var playerApi = require("./player-api");
var game = require("./game");

var walk = playerApi.walk;
var turnLeft = playerApi.turnLeft;
var turnRight = playerApi.turnRight;
var isFrontClear = playerApi.isFrontClear;
var look = playerApi.look;
var collectCoin = playerApi.collectCoin;
var isExitReached = playerApi.isExitReached;
var openBox = playerApi.openBox;

var initGame = game.initGame;
var printMatrix = game.printMatrix;

// drawMap = () => {} // needed for standalone usage

var matrixInput =
  "#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#\n" +
  "#,P, , , , , , , , , , ,#, , , , , , ,#\n" +
  "#, , , , , , , , , , , ,#, , , , , , ,#\n" +
  "#, , , ,#, , , ,#,#,#,#,#, , , , , , ,#\n" +
  "#, , , ,#, , , , , , , ,#,#,#,#, , , ,#\n" +
  "#, , , ,#, , , ,#, , , ,$, , , , , , ,#\n" +
  "#,#,#,#,#, , , ,#, , , , , , , ,$, , ,#\n" +
  "#, , , , , , , ,#, , , , , ,?, , , , ,#\n" +
  "#, , ,$, , , , ,#,#,#,#,#,#,#,#,#,#,#,#\n" +
  "#, , , , , , , , , , , , , , , , , , ,#\n" +
  "#, , , ,#, , , ,#,#,#,#,#,#,#,#,#, , ,#\n" +
  "#, ,#, ,#, , , , , , ,?, , ,#, , , , ,#\n" +
  "#,#,#, ,#,#,#,#,#, ,#,#,#,#,#, , , , ,#\n" +
  "#, , , , , , , ,#, , , , , ,#, , , ,#,#\n" +
  "#, , , ,#,#,#,#,#, , , , , ,#,#, , ,?,#\n" +
  "#, , , ,#, , , , , , , , , ,#, , , , ,#\n" +
  "#,#,#,#,#, ,#,#,#,#,#,#,#, ,#, ,#,#,#,#\n" +
  "#, , , , , ,#, , , , , , , ,#, , , , ,#\n" +
  "#, , , , , ,#, , , , , , , ,#, , ,@, ,#\n" +
  "#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#";


function getNeighbors(position) {
  const [x, y] = position;
  var neighbors = [];

  //north
  if (y-1 > 0) {
    turnNorth();
    neighbors.push({
      position: [x, y-1],
      prevDirection: "S",
      weight: weightOfNodeInFrontOfPlayer()
    });
  }

  //east
  turnEast();
  neighbors.push({
    position: [x+1, y],
    prevDirection: "W",
    weight: weightOfNodeInFrontOfPlayer()
  });

  //south
  turnSouth();
  neighbors.push({
    position: [x, y+1],
    prevDirection: "N",
    weight: weightOfNodeInFrontOfPlayer()
  });

  //west
  turnWest();
  neighbors.push({
    position: [x-1, y],
    prevDirection: "E",
    weight: weightOfNodeInFrontOfPlayer()
  });

  return neighbors;
}

function solve() {

  dijkstra();

  if (!exitPosition) {
    return console.log("No exit found.");
  }

  console.clear();
  console.log("Navigating to the exit...");
  walkToBeginning();

  for (const direction of pathToNodeFromStart(exitPosition)) {
    walkInDirection(direction);
    collectCoin();
    openBox();
    printMatrix();
  }

}

function dijkstra() {
  while (queue.length > 0) {

    const { position } = queue.shift();

    if (visited.has(position.toString()))
      continue;

    walkTo(position);
    visited.add(position.toString());

    if (isExitReached()) {
      console.log("Exit found at position:", position);
      exitPosition = [position[0], position[1]];
      break;
    }

    for (const { position: neighborPos, weight, prevDirection } of getNeighbors(position).filter(n => n.weight < Infinity)) {

      if (visited.has(neighborPos.toString()))
        continue;

      const tentativeDistance = distances.get(position.toString()) + weight;
      if (!(tentativeDistance > distances.get(neighborPos.toString()))) {
        distances.set(neighborPos.toString(), tentativeDistance);
        previousDirections.set(neighborPos.toString(), prevDirection);

        // Enqueue into Priority queue
        queue.push({ position: neighborPos, distance: tentativeDistance });
        queue.sort((a, b) => a.distance - b.distance);
      }
    }

  }
}

function walkToBeginning() {
  while (previousDirections.has(currentPosition.toString())) {
    var previousDirection = previousDirections.get(currentPosition.toString());
    walkInDirection(previousDirection);
  }
}

function walkInDirection(direction) {
    switch (direction) {
      case "N":
        turnNorth();
        currentPosition[1] -= 1;
        walk();
        break
      case "E":
        turnEast();
        currentPosition[0] += 1;
        walk();
        break
      case "S":
        turnSouth();
        currentPosition[1] += 1;
        walk();
        break
      case "W":
        turnWest();
        currentPosition[0] -= 1;
        walk();
        break
    };
}

function pathToNodeFromStart(nodePosition) {
  var tempPos = [nodePosition[0], nodePosition[1]];
  var directionsToGoFromBeginning = [];
  while (previousDirections.has(tempPos.toString())) {
    switch (previousDirections.get(tempPos.toString())) {
      case "N":
        turnNorth();
        directionsToGoFromBeginning.push("S");
        tempPos[1] -= 1;
        break
      case "E":
        turnEast();
        directionsToGoFromBeginning.push("W");
        tempPos[0] += 1;
        break
      case "S":
        turnSouth();
        directionsToGoFromBeginning.push("N");
        tempPos[1] += 1;
        break
      case "W":
        turnWest();
        directionsToGoFromBeginning.push("E");
        tempPos[0] -= 1;
        break
    }
  }
  directionsToGoFromBeginning.reverse();
  return directionsToGoFromBeginning;
}

function walkTo(targetPos) {
  walkToBeginning();
  var directionsToGoFromBeginning = pathToNodeFromStart(targetPos);

  for (const direction of directionsToGoFromBeginning) {
    walkInDirection(direction);
  }
}

function weightOfNodeInFrontOfPlayer() {
  switch (look(1)) {
    case "$":
    case "?":
      // return -100;
    default:
      return isFrontClear() ? 1 : Infinity;
  }
}

function turnNorth() {
  switch (currentDirection) {
    case "N":
      break;
    case "E":
      turnLeft();
      break;
    case "S":
      turnLeft();
      turnLeft();
      break;
    case "W":
      turnRight();
      break;
    default:
      console.error("panic at the disco");
      process.exit(1);
      break;
  }
  currentDirection = "N";
}

function turnEast() {
  switch (currentDirection) {
    case "E":
      break;
    case "S":
      turnLeft();
      break;
    case "W":
      turnLeft();
      turnLeft();
      break;
    case "N":
      turnRight();
      break;
    default:
      console.error("panic at the disco");
      process.exit(1);
      break;
  }
  currentDirection = "E";
}

function turnSouth() {
  switch (currentDirection) {
    case "S":
      break;
    case "W":
      turnLeft();
      break;
    case "N":
      turnLeft();
      turnLeft();
      break;
    case "E":
      turnRight();
      break;
    default:
      console.error("panic at the disco");
      process.exit(1);
      break;
  }
  currentDirection = "S";
}

function turnWest() {
  switch (currentDirection) {
    case "W":
      break;
    case "N":
      turnLeft();
      break;
    case "E":
      turnLeft();
      turnLeft();
      break;
    case "S":
      turnRight();
      break;
    default:
      console.error("panic at the disco");
      process.exit(1);
      break;
  }
  currentDirection = "W";
}


initGame(matrixInput);

var startPosition = [1, 1];

var visited = new Set();
var distances = new Map();
var previousDirections = new Map();
var queue = [ { position: startPosition, distance: 0 } ];

var currentPosition = startPosition;
var currentDirection = "N"; // Assume starting direction is North
var exitPosition = null; // To be determined when found

printMatrix();
solve();
printMatrix();


