/* jshint strict: true */
// life.js - Electronic Life Simulation
// Inspired by one of the projects in the book "Eloquent Javascript"
// http://eloquentjavascript.net/07_elife.html
//
// Class Descriptions:
//      - Vector: A simple 2D Vector Class with the addition operation
//      - Grid: The container for all the objects in the world.
//              Provides checks to see if a vector is inside it as
//              well as getters and setters for each coordinate pair.
//      - View: A class to help navigate around the world and locate
//              other entities living nearby.
//      - World: A representation of the whole world, based on a map
//               provided as a list of stings and a dictionary of 
//               (symbol, entitiy). Responsible for moving objects
//               around and managing turns.
//      - Entitiy classes: Animals, plants and objects in the world.
//                         Some of them have the ability to move around
//                         or perform other actions.



// Sample game map 
// The '#' character represents a wall block and
// the 'o' character represents a critter
var plan = ['##################################################',
            '#****     ~                 *                   *#',
            '#**                *******       **             *#',
            '#*                   *****       ##             *#',
            '#*****                  O         #             *#',
            '#*      ####                                    *#',
            '#       #* #                                    *#',
            '#       #*                     **               *#',
            '#       ####                  ****              *#',
            '#                             ***               *#',
            '#         **********                            *#',
            '#   #     *****                    ##           *#',
            '#           ##*                      #          *#',
            '#         ### *   ****             ##           *#',
            '#        ###  *   *##*                          *#',
            '#                  *#*                          *#',
            '#**                             @               *#',
            '#******                                         *#',
            '##################################################'];


// Available moves
// Clockwise order (45 degree intervals)
// Having a known order is useful for adjusting the behaviour
// of some animals
var directions = {
    'n': new Vector(0, -1),
    'ne': new Vector(1, -1),
    'e': new Vector(1, 0),
    'se': new Vector(1, 1),
    's': new Vector(0, 1),
    'sw': new Vector(1, -1),
    'w': new Vector(-1, 0),
    'nw': new Vector(-1, -1)
};


// Manually setting instead of using Object.keys() to make sure 
// that we get the correct order
var directionNames = 'n,ne,e,se,s,sw,w,nw'.split(',');


//
// Helper Functions
//

// Get a random element from the provided array
function randomElement(array) {
    if (array.length === 0) {
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}


// Given a legend object, get the object that corresponds to the given char
// on the map
function elementFromChar(legend, ch) {
    if (ch === ' ') {
        return null;
    }
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

// Given a specific object, get the corresponding char on the map
function charFromElement(element) {
    if (element === null) {
        return ' ';
    }
    else {
        return element.originChar;
    }
}

// Shift the direction by the given amount of degrees
// WARNING: Only multiples of 45 degrees are allowed
function turnDirection(direction, degrees) {
    if (degrees % 45 !== 0) {
        throw new Error('Only multiples of 45 degrees are allowed');
    }
    directionIdx = directionNames.indexOf(direction);
    steps = (360 + degrees) % 360;
    steps = steps / 45;
    return directionNames[(directionIdx + steps) % directionNames.length];
}


//
// Vector Class 
//
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function(other) {
    if (other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    else {
        throw new Error('Vector.plus failed!' + this.toString());
    }
};
Vector.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
};


//
// Grid Class
//
function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}
Grid.prototype.isInside = function(vector) {
    return vector.x >= 0 && vector.x < this.width &&
           vector.y >= 0 && vector.y < this.height;
};
Grid.prototype.get = function(vector) {
    return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function(vector, value) {
    this.space[vector.x + this.width * vector.y] = value;
};
Grid.prototype.forEach = function(f, context) {
    for (var y = 0; y < this.height; y++) {
       for (var x = 0; x < this.width; x++) {
          var value = this.space[x + this.width * y];
          if (value !== null) {
             f.call(context, value, new Vector(x, y));
          }
       }
    }
};


//
// View Class
//
function View(world, vector) {
    this.world = world;
    this.vector = vector;
}
View.prototype.look = function(dir) {
    if (dir === null || !directions.hasOwnProperty(dir)) {
        return '#'
    }
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target)) {
        return charFromElement(this.world.grid.get(target));
    }
    else {
        return '#';
    }
};
View.prototype.findAll = function(ch) {
    var found = [];
    for (var dir in directions) {
        if (this.look(dir) === ch) {
            found.push(dir);
        }
    }
    return found;
};
View.prototype.find = function(ch) {
    var found = this.findAll(ch);
    if (found.length === 0) return null;
    return randomElement(found);
};


//
// Wall Class
//
function Wall() {
}


//
// BouncingCritter Class
//
function BouncingCritter() {
    this.direction = randomElement(directionNames);
    this.energy = 10.0;
}
BouncingCritter.prototype.act = function(view) {
    if (view.look(this.direction) !== ' ') {
        this.direction = view.find(' ') || 's';
    }
    return { type: 'move',
             direction: this.direction };
};


function Snake() {
    //Default behaviour: drop until you find a wall
    this.direction = 's';
    this.energy = 10.0;
}
Snake.prototype.act = function(view) {
    var start = this.direction;
    if (view.look(turnDirection(this.direction, -135)) !== ' ') {
        start = this.direction = turnDirection(this.direction, -90);
    }
    while (view.look(this.direction) !== ' ') {
        this.direction = turnDirection(this.direction, 45);
        if (this.direction === start) {
            break;
        }
    }
    var space = this.direction;
    if (this.energy > 45 && space) {
        return { type: 'reproduce',
                 direction: space };
    }
    // Eat a plant if there are 2 or more nearby
    var plant = view.findAll('*');
    if (plant && plant.length > 1) {
        return { type: 'eat',
                 direction: randomElement(plant) };
    }
    return { type: 'move',
             direction: this.direction };
};


// 
// Plant Class
//
function Plant() {
    this.energy = 3 + Math.random() * 4;
}
Plant.prototype.act = function(view) {
    if (this.energy > 15) {
        var space = view.find(' ');
        if (space) {
            return { type: 'reproduce',
                     direction: space };
        }
    }
    if (this.energy < 20) {
        return { type: 'grow' };
    }
};


//
// PlantEater Class
//
function PlantEater() {
    this.energy = 15;
    this.direction = randomElement(directionNames);
}
PlantEater.prototype.act = function(view) {
    if (view.look(this.direction) !== ' ') {
        this.direction = view.find(' ');
    }
    var space = this.direction;
    if (this.energy > 45 && space) {
        return { type: 'reproduce',
                 direction: space };
    }
    // Eat a plant if there are 2 or more nearby
    var plant = view.findAll('*');
    if (plant && plant.length > 1) {
        return { type: 'eat',
                 direction: randomElement(plant) };
    }
    if (space) {
        return { type: 'move',
                 direction: space };
    }
};


//
// Tiger Class
//
function Tiger() {
    this.energy = 135;
}
Tiger.prototype.act = function(view) {
    var space = view.find(' ');
    if (this.energy > 300 && space) {
        return { type: 'reproduce',
                 direction: space };
    }
    // Eat a plant if there are 2 or more nearby
    var prey1 = view.find('~');
    if (prey1) {
        return { type: 'eat',
                 direction: prey1 };
    }
    var prey2 = view.find('O');
    if (prey2) {
        return { type: 'eat',
                 direction: prey2 };
    }
    if (space) {
        return { type: 'move',
                 direction: space };
    }
};

// World Class
// 
function World(map, legend) {
    var grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach(function(line, y) {
        for (var x = 0; x < line.length; x++) {
            grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
        }
    });
}
World.prototype.turn = function() {
    var acted = [];
    this.grid.forEach(function(critter, vector) {
        if (critter.act && acted.indexOf(critter) === -1) {
            acted.push(critter);
            this.letAct(critter, vector);
        }
    }, this);
};
World.prototype.letAct = function(critter, vector) {
    var action = critter.act(new View(this, vector));
    if (action && action.type == 'move') {
        // If the destination is valid and unoccupied
        var dest = this.checkDestination(action, vector);
        if (dest && this.grid.get(dest) === null) {
            this.grid.set(vector, null);
            this.grid.set(dest, critter);
        }
    }
};
World.prototype.checkDestination = function(action, vector) {
    // Validate that the critter chose an existing direction
    if (directions.hasOwnProperty(action.direction)) {
        var dest = vector.plus(directions[action.direction]);
        if (this.grid.isInside(dest)) {
            return dest;
        }
    }
};
World.prototype.toString = function() {
    var output = '';
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var element = this.grid.get(new Vector(x, y));
            output += charFromElement(element);
        }
        output += '<br>';
    }
    return output;
};


//
// ActionTypes Object
//
var actionTypes = Object.create(null);
actionTypes.grow = function(critter) {
    // Growing just increases the energy of the critter
    critter.energy += 0.5;
    return true;
};
actionTypes.move = function(critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    // Can the critter move to the new destination?
    if (dest === null || 
        critter.energy <= 1 ||
        this.grid.get(dest) !== null) {
        return false;
    }
    // Make the move
    critter.energy -= 1;
    this.grid.set(vector, null);
    this.grid.set(dest, critter);
    return true;
};
actionTypes.eat = function(critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    var destContent = dest !== null && this.grid.get(dest);
    // Can the critter eat what is at that destination?
    if (!destContent || destContent.energy === null) {
        return false;
    }
    critter.energy += destContent.energy;
    this.grid.set(dest, null);
    return true;
};
actionTypes.reproduce = function(critter, vector, action) {
    var baby = elementFromChar(this.legend, critter.originChar);
    var dest = this.checkDestination(action, vector);
    // Can the critter make a baby?
    if (dest === null ||
        critter.energy <= 2 * baby.energy ||
        this.grid.get(dest) !== null) {
        return false;
    }
    critter.energy -= 2 * baby.energy;
    this.grid.set(dest, baby);
    return true;
};


//
// RealWorld Class
//
function RealWorld(map, legend) {
    World.call(this, map, legend);
}
RealWorld.prototype = Object.create(World.prototype);
RealWorld.prototype.letAct = function(critter, vector) {
    var action = critter.act(new View(this, vector));
    var handled = action && action.type in actionTypes &&
                  actionTypes[action.type].call(this, critter,
                                                vector, action);
    if (!handled) {
        critter.energy -= 0.2;
        // If zero energy, the critter is dead
        if (critter.energy <= 0) {
            this.grid.set(vector, null);
        }
    }
};

//
// Presentation Functions
//
function draw(str) {
    document.getElementById('world').innerHTML = '<p>' + str + '</p>';
}


var world = new RealWorld(plan, { '#': Wall,
                                  'o': BouncingCritter,
                                  '~': Snake, 
                                  'O': PlantEater,
                                  '*': Plant,
                                  '@': Tiger } );


function animateWorld() {
    world.turn();
    draw(world.toString());
}

