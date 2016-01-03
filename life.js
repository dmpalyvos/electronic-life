//
// Sample game map 
// The '#' character represents a wall block and
// the 'o' character represents a critter
var plan = ['##############################',
            '#        #               ##  #',
            '#     o #         #          #',
            '#      #          #          #',
            '#       ###                  #',
            '#                 o          #',
            '#                            #',
            '#    o ##          ###       #',
            '#        ##        #   o     #',
            '#      ##          #         #',
            '##############################'];

// Vector Class 
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

// Grid Class
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


// Wall Class
function Wall() {
}

// Critter Class
var directions = {
    'n': new Vector(0, -1),
    's': new Vector(0, 1),
    'e': new Vector(1, 0),
    'w': new Vector(-1, 0),
    'ne': new Vector(1, -1),
    'nw': new Vector(-1, -1),
    'se': new Vector(1, 1),
    'sw': new Vector(1, -1)
};

var directionNames = Object.keys(directions);

// Get a random element from the provided array
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function BouncingCritter() {
    this.direction = randomElement(directionNames);
}

BouncingCritter.prototype.act = function(view) {
    if (view.look(this.direction) != ' ') {
        this.direction = view.find(' ') || 's';
    }
    return { type: 'move',
             direction: this.direction };
};


// World Class
function elementFromChar(legend, ch) {
    if (ch === ' ') {
        return null;
    }
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

function charFromElement(element) {
    if (element === null) {
        return ' ';
    }
    else {
        return element.originChar;
    }
}

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


var world = new World(plan, { '#': Wall, 'o': BouncingCritter } );
draw(world.toString());
console.log(world.toString());

// Presentation Functions
function draw(str) {
    document.getElementById('world').innerHTML = '<p>' + str + '</p>';
}

