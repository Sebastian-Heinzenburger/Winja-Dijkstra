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
  var x = position[0];
  var y = position[1];
  var neighbors = [];

  // north
  if (y - 1 > 0) {
    turnNorth();
    neighbors.push({
      position: [x, y - 1],
      prevDirection: "S",
      weight: weightOfNodeInFrontOfPlayer()
    });
  }

  // east
  turnEast();
  neighbors.push({
    position: [x + 1, y],
    prevDirection: "W",
    weight: weightOfNodeInFrontOfPlayer()
  });

  // south
  turnSouth();
  neighbors.push({
    position: [x, y + 1],
    prevDirection: "N",
    weight: weightOfNodeInFrontOfPlayer()
  });

  // west
  turnWest();
  neighbors.push({
    position: [x - 1, y],
    prevDirection: "E",
    weight: weightOfNodeInFrontOfPlayer()
  });

  return neighbors;
}

function solve() {
  dijkstra();

  if (!exitPosition)
    return console.log("No exit found.");

  console.clear();
  console.log("Navigating to the exit...");
  walkToBeginning();

  var path = pathToNodeFromStart(exitPosition);
  for (var i = 0; i < path.length; i++) {
    walkInDirection(path[i]);
    collectCoin();
    openBox();
    printMatrix();
  }
}

function dijkstra() {
  while (queue.length > 0) {
    var current = queue.shift();
    var position = current.position;

     if (isVisited(position))
      continue;

    walkTo(position);
    markVisited(position);

    if (isExitReached()) {
      console.log("Exit found at position:", position);
      exitPosition = [position[0], position[1]];
      break;
    }

    var neighbors = getNeighbors(position).filter(function (n) {
      return n.weight < Infinity;
    });

    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var neighborPos = neighbor.position;
      var weight = neighbor.weight;
      var prevDirection = neighbor.prevDirection;

      if (isVisited(neighborPos))
        continue;

      var tentativeDistance = getDistance(position) + weight;
      if (tentativeDistance < getDistance(neighborPos)) {
        setDistance(neighborPos, tentativeDistance);
        setPreviousDirection(neighborPos, prevDirection);

        queue.push({ position: neighborPos, distance: tentativeDistance });
        queue.sort(function (a, b) {
          return a.distance - b.distance;
        });
      }
    }
  }
}

function walkToBeginning() {
  while (hasPreviousDirection(currentPosition)) {
    var previousDirection = getPreviousDirection(currentPosition);
    walkInDirection(previousDirection);
  }
}

function walkInDirection(direction) {
  switch (direction) {
    case "N":
      turnNorth();
      currentPosition[1] -= 1;
      walk();
      break;
    case "E":
      turnEast();
      currentPosition[0] += 1;
      walk();
      break;
    case "S":
      turnSouth();
      currentPosition[1] += 1;
      walk();
      break;
    case "W":
      turnWest();
      currentPosition[0] -= 1;
      walk();
      break;
  }
}

function pathToNodeFromStart(nodePosition) {
  var tempPos = [nodePosition[0], nodePosition[1]];
  var directionsToGoFromBeginning = [];

  while (hasPreviousDirection(tempPos)) {
    switch (getPreviousDirection(tempPos)) {
      case "N":
        turnNorth();
        directionsToGoFromBeginning.push("S");
        tempPos[1] -= 1;
        break;
      case "E":
        turnEast();
        directionsToGoFromBeginning.push("W");
        tempPos[0] += 1;
        break;
      case "S":
        turnSouth();
        directionsToGoFromBeginning.push("N");
        tempPos[1] += 1;
        break;
      case "W":
        turnWest();
        directionsToGoFromBeginning.push("E");
        tempPos[0] -= 1;
        break;
    }
  }

  directionsToGoFromBeginning.reverse();
  return directionsToGoFromBeginning;
}

function walkTo(targetPos) {
  walkToBeginning();
  var directionsToGoFromBeginning = pathToNodeFromStart(targetPos);

  for (var i = 0; i < directionsToGoFromBeginning.length; i++) {
    walkInDirection(directionsToGoFromBeginning[i]);
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

function isVisited(position) {
  for (var i = 0; i < visited.length; i++) {
    if (visited[i][0] === position[0] && visited[i][1] === position[1]) {
      return true;
    }
  }
  return false;
}

function markVisited(position) {
  visited.push([position[0], position[1]]);
}

function getDistance(position) {
  for (var i = 0; i < distances.length; i++) {
    if (distances[i][0][0] === position[0] && distances[i][0][1] === position[1]) {
      return distances[i][1];
    }
  }
  return Infinity;
}

function setDistance(position, distance) {
  for (var i = 0; i < distances.length; i++) {
    if (distances[i][0][0] === position[0] && distances[i][0][1] === position[1]) {
      distances[i][1] = distance;
      return;
    }
  }
  distances.push([[position[0], position[1]], distance]);
}

function getPreviousDirection(position) {
  for (var i = 0; i < previousDirections.length; i++) {
    if (previousDirections[i][0][0] === position[0] && previousDirections[i][0][1] === position[1]) {
      return previousDirections[i][1];
    }
  }
  return null;
}

function setPreviousDirection(position, direction) {
  for (var i = 0; i < previousDirections.length; i++) {
    if (previousDirections[i][0][0] === position[0] && previousDirections[i][0][1] === position[1]) {
      previousDirections[i][1] = direction;
      return;
    }
  }
  previousDirections.push([[position[0], position[1]], direction]);
}

function hasPreviousDirection(position) {
  return getPreviousDirection(position) !== null;
}


initGame(matrixInput);

var startPosition = [1, 1];

var visited = [];
var distances = [[[startPosition[0], startPosition[1]], 0]];
var previousDirections = [];
var queue = [{ position: startPosition, distance: 0 }];

var currentPosition = startPosition;
var currentDirection = "N"; // Assume starting direction is North
var exitPosition = null; // To be determined when found

printMatrix();
solve();
printMatrix();

