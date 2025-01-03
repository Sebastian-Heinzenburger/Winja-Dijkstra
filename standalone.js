const { walk, turnLeft, turnRight, isFrontClear, look, collectCoin, isExitReached, openBox } = require("./player-api");
const { initGame, printMatrix } = require("./game");

// drawMap = () => {} // needed for standalone usage

const matrixInput =
  `#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#
#,P, , , , , , , , , , ,#, , , , , , ,#
#, , , , , , , , , , , ,#, , , , , , ,#
#, , , ,#, , , ,#,#,#,#,#, , , , , , ,#
#, , , ,#, , , , , , , ,#,#,#,#, , , ,#
#, , , ,#, , , ,#, , , ,$, , , , , , ,#
#,#,#,#,#, , , ,#, , , , , , , ,$, , ,#
#, , , , , , , ,#, , , , , ,?, , , , ,#
#, , ,$, , , , ,#,#,#,#,#,#,#,#,#,#,#,#
#, , , , , , , , , , , , , , , , , , ,#
#, , , ,#, , , ,#,#,#,#,#,#,#,#,#, , ,#
#, ,#, ,#, , , , , , ,?, , ,#, , , , ,#
#,#,#, ,#,#,#,#,#, ,#,#,#,#,#, , , , ,#
#, , , , , , , ,#, , , , , ,#, , , ,#,#
#, , , ,#,#,#,#,#, , , , , ,#,#, , ,?,#
#, , , ,#, , , , , , , , , ,#, , , , ,#
#,#,#,#,#, ,#,#,#,#,#,#,#, ,#, ,#,#,#,#
#, , , , , ,#, , , , , , , ,#, , , , ,#
#, , , , , ,#, , , , , , , ,#, , ,@, ,#
#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#`;

initGame(matrixInput);


class LabyrinthSolver {
  constructor(startPosition) {
    this.queue = [];
    this.visited = new Set();
    this.distances = new Map();
    this.previousDirections = new Map();

    this.currentPosition = startPosition || [1, 1];
    this.currentDirection = "N"; // Assume starting direction is North

    this.exitPosition = null; // To be determined when found
  }

  enqueue(position, distance) {
    this.queue.push({ position, distance });
    this.queue.sort((a, b) => a.distance - b.distance); // Priority queue
  }

  getNeighbors(position) {
    const [x, y] = position;
    let neighbors = [];

    //north
    if (y-1 > 0) {
      this.turnNorth();
      neighbors.push({
        position: [x, y-1],
        prevDirection: "S",
        weight: this.weightOfNodeInFrontOfPlayer()
      });
    }

    //east
    this.turnEast();
    neighbors.push({
      position: [x+1, y],
      prevDirection: "W",
      weight: this.weightOfNodeInFrontOfPlayer()
    });

    //south
    this.turnSouth();
    neighbors.push({
      position: [x, y+1],
      prevDirection: "N",
      weight: this.weightOfNodeInFrontOfPlayer()
    });

    //west
    this.turnWest();
    neighbors.push({
      position: [x-1, y],
      prevDirection: "E",
      weight: this.weightOfNodeInFrontOfPlayer()
    });

    return neighbors;
  }

  solve() {

    this.dijkstra();

    if (!this.exitPosition) {
      return console.log("No exit found.");
    }

    console.clear();
    this.log("Navigating to the exit...");
    this.walkToBeginning();

    for (const direction of this.pathToNodeFromStart(this.exitPosition)) {
      this.walkInDirection(direction);
      collectCoin();
      openBox();
      printMatrix();
    }

  }

  dijkstra() {
    solver.enqueue(this.currentPosition, 0);
    while (this.queue.length > 0) {

      const { position } = this.queue.shift();

      this.walkTo(position);

      if (isExitReached()) {
        this.log("Exit found at position:", position);
        this.exitPosition = [position[0], position[1]];
        break;
      }

      if (this.visited.has(position.toString())) {
        continue;
      }

      this.visited.add(position.toString());

      for (const { position: neighborPos, weight, prevDirection } of this.getNeighbors(position).filter(n => n.weight < Infinity)) {

        if (this.visited.has(neighborPos.toString()))
          continue;

        const tentativeDistance = (this.distances.get(position.toString()) || 0) + weight;
        if (tentativeDistance < (this.distances.get(neighborPos.toString()) || Infinity)) {
          this.distances.set(neighborPos.toString(), tentativeDistance);
          this.previousDirections.set(neighborPos.toString(), prevDirection);
          this.enqueue(neighborPos, tentativeDistance);
        }
      }

    }
  }

  walkToBeginning() {
    while (this.previousDirections.has(this.currentPosition.toString())) {
      let previousDirection = this.previousDirections.get(this.currentPosition.toString());
      this.walkInDirection(previousDirection);
    }
  }

  walkInDirection(direction) {
      switch (direction) {
        case "N":
          this.turnNorth();
          this.currentPosition[1] -= 1;
          walk();
          break
        case "E":
          this.turnEast();
          this.currentPosition[0] += 1;
          walk();
          break
        case "S":
          this.turnSouth();
          this.currentPosition[1] += 1;
          walk();
          break
        case "W":
          this.turnWest();
          this.currentPosition[0] -= 1;
          walk();
          break
      };
  }

  pathToNodeFromStart(nodePosition) {
    let tempPos = [nodePosition[0], nodePosition[1]];
    let directionsToGoFromBeginning = [];
    while (this.previousDirections.has(tempPos.toString())) {
      switch (this.previousDirections.get(tempPos.toString())) {
        case "N":
          this.turnNorth();
          directionsToGoFromBeginning.push("S");
          tempPos[1] -= 1;
          break
        case "E":
          this.turnEast();
          directionsToGoFromBeginning.push("W");
          tempPos[0] += 1;
          break
        case "S":
          this.turnSouth();
          directionsToGoFromBeginning.push("N");
          tempPos[1] += 1;
          break
        case "W":
          this.turnWest();
          directionsToGoFromBeginning.push("E");
          tempPos[0] -= 1;
          break
      }
    }
    directionsToGoFromBeginning.reverse();
    return directionsToGoFromBeginning;
  }

  walkTo(targetPos) {
    this.walkToBeginning();
    let directionsToGoFromBeginning = this.pathToNodeFromStart(targetPos);

    for (const direction of directionsToGoFromBeginning) {
      this.walkInDirection(direction);
    }
  }

  log(...data) {
    console.debug(data);
  }

  weightOfNodeInFrontOfPlayer() {
    switch (look(1)) {
      case "$":
      case "?":
        // return -100;
      default:
        return isFrontClear() ? 1 : Infinity;
    }
  }

  turnNorth() {
    switch (this.currentDirection) {
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
    this.currentDirection = "N";
  }

  turnEast() {
    switch (this.currentDirection) {
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
    this.currentDirection = "E";
  }

  turnSouth() {
    switch (this.currentDirection) {
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
    this.currentDirection = "S";
  }

  turnWest() {
    switch (this.currentDirection) {
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
    this.currentDirection = "W";
  }

}



printMatrix();

const solver = new LabyrinthSolver([1, 1]);
solver.solve();

printMatrix();







