// ES5

function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}

// 4 LINES BELOW THIS COMMENT CAN BE OMITTED IN ABGABE :)

var _require = require("./player-api"), walk = _require.walk, turnLeft = _require.turnLeft, turnRight = _require.turnRight, isFrontClear = _require.isFrontClear, look = _require.look, collectCoin = _require.collectCoin, isExitReached = _require.isExitReached, openBox = _require.openBox;
var _require1 = require("./game"), initGame = _require1.initGame, printMatrix = _require1.printMatrix;

var matrixInput = "#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#\n#,P, , , , , , , , , , ,#, , , , , , ,#\n#, , , , , , , , , , , ,#, , , , , , ,#\n#, , , ,#, , , ,#,#,#,#,#, , , , , , ,#\n#, , , ,#, , , , , , , ,#,#,#,#, , , ,#\n#, , , ,#, , , ,#, , , ,$, , , , , , ,#\n#,#,#,#,#, , , ,#, , , , , , , ,$, , ,#\n#, , , , , , , ,#, , , , , ,?, , , , ,#\n#, , ,$, , , , ,#,#,#,#,#,#,#,#,#,#,#,#\n#, , , , , , , , , , , , , , , , , , ,#\n#, , , ,#, , , ,#,#,#,#,#,#,#,#,#, , ,#\n#, ,#, ,#, , , , , , ,?, , ,#, , , , ,#\n#,#,#, ,#,#,#,#,#, ,#,#,#,#,#, , , , ,#\n#, , , , , , , ,#, , , , , ,#, , , ,#,#\n#, , , ,#,#,#,#,#, , , , , ,#,#, , ,?,#\n#, , , ,#, , , , , , , , , ,#, , , , ,#\n#,#,#,#,#, ,#,#,#,#,#,#,#, ,#, ,#,#,#,#\n#, , , , , ,#, , , , , , , ,#, , , , ,#\n#, , , , , ,#, , , , , , , ,#, , ,@, ,#\n#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#";
initGame(matrixInput);

// ABGABE STARTS HERE

var LabyrinthSolver = /*#__PURE__*/ function() {
    "use strict";
    function LabyrinthSolver(startPosition) {
        _class_call_check(this, LabyrinthSolver);
        this.queue = [];
        this.visited = new Set();
        this.distances = new Map();
        this.previousDirections = new Map();
        this.currentPosition = startPosition || [
            1,
            1
        ];
        this.currentDirection = "N";
        this.exitPosition = null;
    }
    _create_class(LabyrinthSolver, [
        {
            key: "enqueue",
            value: function enqueue(position, distance) {
                this.queue.push({
                    position: position,
                    distance: distance
                });
                this.queue.sort(function(a, b) {
                    return a.distance - b.distance;
                });
            }
        },
        {
            key: "getNeighbors",
            value: function getNeighbors(position) {
                var _position = _sliced_to_array(position, 2), x = _position[0], y = _position[1];
                var neighbors = [];
                if (y - 1 > 0) {
                    this.turnNorth();
                    neighbors.push({
                        position: [
                            x,
                            y - 1
                        ],
                        prevDirection: "S",
                        weight: this.weightOfNodeInFrontOfPlayer()
                    });
                }
                this.turnEast();
                neighbors.push({
                    position: [
                        x + 1,
                        y
                    ],
                    prevDirection: "W",
                    weight: this.weightOfNodeInFrontOfPlayer()
                });
                this.turnSouth();
                neighbors.push({
                    position: [
                        x,
                        y + 1
                    ],
                    prevDirection: "N",
                    weight: this.weightOfNodeInFrontOfPlayer()
                });
                this.turnWest();
                neighbors.push({
                    position: [
                        x - 1,
                        y
                    ],
                    prevDirection: "E",
                    weight: this.weightOfNodeInFrontOfPlayer()
                });
                return neighbors;
            }
        },
        {
            key: "solve",
            value: function solve() {
                this.dijkstra();
                if (!this.exitPosition) {
                    return console.log("No exit found.");
                }
                console.clear();
                this.log("Navigating to the exit...");
                this.walkToBeginning();
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = this.pathToNodeFromStart(this.exitPosition)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var direction = _step.value;
                        this.walkInDirection(direction);
                        collectCoin();
                        openBox();
                        printMatrix();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                            _iterator["return"]();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        },
        {
            key: "dijkstra",
            value: function dijkstra() {
                solver.enqueue(this.currentPosition, 0);
                while(this.queue.length > 0){
                    var position = this.queue.shift().position;
                    this.walkTo(position);
                    if (isExitReached()) {
                        this.log("Exit found at position:", position);
                        this.exitPosition = [
                            position[0],
                            position[1]
                        ];
                        break;
                    }
                    if (this.visited.has(position.toString())) {
                        continue;
                    }
                    this.visited.add(position.toString());
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = this.getNeighbors(position).filter(function(n) {
                            return n.weight < Infinity;
                        })[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var _step_value = _step.value, neighborPos = _step_value.position, weight = _step_value.weight, prevDirection = _step_value.prevDirection;
                            if (this.visited.has(neighborPos.toString())) continue;
                            var tentativeDistance = (this.distances.get(position.toString()) || 0) + weight;
                            if (tentativeDistance < (this.distances.get(neighborPos.toString()) || Infinity)) {
                                this.distances.set(neighborPos.toString(), tentativeDistance);
                                this.previousDirections.set(neighborPos.toString(), prevDirection);
                                this.enqueue(neighborPos, tentativeDistance);
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                                _iterator["return"]();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            }
        },
        {
            key: "walkToBeginning",
            value: function walkToBeginning() {
                while(this.previousDirections.has(this.currentPosition.toString())){
                    var previousDirection = this.previousDirections.get(this.currentPosition.toString());
                    this.walkInDirection(previousDirection);
                }
            }
        },
        {
            key: "walkInDirection",
            value: function walkInDirection(direction) {
                switch(direction){
                    case "N":
                        this.turnNorth();
                        this.currentPosition[1] -= 1;
                        walk();
                        break;
                    case "E":
                        this.turnEast();
                        this.currentPosition[0] += 1;
                        walk();
                        break;
                    case "S":
                        this.turnSouth();
                        this.currentPosition[1] += 1;
                        walk();
                        break;
                    case "W":
                        this.turnWest();
                        this.currentPosition[0] -= 1;
                        walk();
                        break;
                }
                ;
            }
        },
        {
            key: "pathToNodeFromStart",
            value: function pathToNodeFromStart(nodePosition) {
                var tempPos = [
                    nodePosition[0],
                    nodePosition[1]
                ];
                var directionsToGoFromBeginning = [];
                while(this.previousDirections.has(tempPos.toString())){
                    switch(this.previousDirections.get(tempPos.toString())){
                        case "N":
                            this.turnNorth();
                            directionsToGoFromBeginning.push("S");
                            tempPos[1] -= 1;
                            break;
                        case "E":
                            this.turnEast();
                            directionsToGoFromBeginning.push("W");
                            tempPos[0] += 1;
                            break;
                        case "S":
                            this.turnSouth();
                            directionsToGoFromBeginning.push("N");
                            tempPos[1] += 1;
                            break;
                        case "W":
                            this.turnWest();
                            directionsToGoFromBeginning.push("E");
                            tempPos[0] -= 1;
                            break;
                    }
                }
                directionsToGoFromBeginning.reverse();
                return directionsToGoFromBeginning;
            }
        },
        {
            key: "walkTo",
            value: function walkTo(targetPos) {
                this.walkToBeginning();
                var directionsToGoFromBeginning = this.pathToNodeFromStart(targetPos);
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = directionsToGoFromBeginning[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var direction = _step.value;
                        this.walkInDirection(direction);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                            _iterator["return"]();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        },
        {
            key: "log",
            value: function log() {
                for(var _len = arguments.length, data = new Array(_len), _key = 0; _key < _len; _key++){
                    data[_key] = arguments[_key];
                }
                console.debug(data);
            }
        },
        {
            key: "weightOfNodeInFrontOfPlayer",
            value: function weightOfNodeInFrontOfPlayer() {
                switch(look(1)){
                    case "$":
                    case "?":
                    default:
                        return isFrontClear() ? 1 : Infinity;
                }
            }
        },
        {
            key: "turnNorth",
            value: function turnNorth() {
                switch(this.currentDirection){
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
        },
        {
            key: "turnEast",
            value: function turnEast() {
                switch(this.currentDirection){
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
        },
        {
            key: "turnSouth",
            value: function turnSouth() {
                switch(this.currentDirection){
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
        },
        {
            key: "turnWest",
            value: function turnWest() {
                switch(this.currentDirection){
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
    ]);
    return LabyrinthSolver;
}();

var solver = new LabyrinthSolver([1, 1]);
solver.solve();


