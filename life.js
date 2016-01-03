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

// Presentation Functions
function draw(str) {
    document.getElementById('world').textContent = str;
}

