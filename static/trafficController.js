// Constants for canvas and layout
const CANVAS_MAX = 800;
const MIDDLE = CANVAS_MAX / 2;
const NORTH_STOP_LINE_Y = 320;
const SOUTH_STOP_LINE_Y = 480;
const EAST_STOP_LINE_X = 480;
const WEST_STOP_LINE_X = 320;

const ROAD_COLOUR = "grey";
const DIVIDER_COLOUR = "orange";
const STOP_LINE_COLOUR = "white";
const DASHED_LANE_COLOUR = "darkgrey";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let lightStateEW = "green";
let lightStateNS = "red";
let cars = [];

// Define car spawn zones for each direction
const spawnZones = {
    north: [
        { xRange: [345, 365], yRange: [5, 55], spawnPoint: [350, 10] },
        { xRange: [375, 395], yRange: [5, 55], spawnPoint: [380, 10] }
    ],
    south: [
        { xRange: [405, 425], yRange: [745, 795], spawnPoint: [410, 770] },
        { xRange: [435, 455], yRange: [745, 795], spawnPoint: [440, 770] }
    ],
    east: [
        { xRange: [745, 795], yRange: [345, 365], spawnPoint: [770, 350] },
        { xRange: [745, 795], yRange: [375, 395], spawnPoint: [770, 380] }
    ],
    west: [
        { xRange: [5, 55], yRange: [435, 455], spawnPoint: [10, 440] },
        { xRange: [5, 55], yRange: [405, 425], spawnPoint: [10, 410] }
    ]
};

function drawRoads() {
    // Inner Function to Draw rectangular road
    function drawRoadRect(x, y, width, height) {
        ctx.fillStyle = ROAD_COLOUR;
        ctx.fillRect(x, y, width, height);
    }
    drawRoadRect(340, 0, 120, 800);  // Vertical road
    drawRoadRect(0, 340, 800, 120);  // Horizontal road
}

function drawRoadLines() {
    // Inner Function to Draw Solid Lines
    function drawSolidLine(x1, y1, x2, y2, color, width) {
        ctx.setLineDash([]);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    // Inner Function to Draw Dashed Lines
    function drawDashedLine(x1, y1, x2, y2, color, width) {
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Traffic Divider Lines (solid)
    drawSolidLine(MIDDLE, 320, MIDDLE, 0, DIVIDER_COLOUR, 4); // North
    drawSolidLine(EAST_STOP_LINE_X, MIDDLE, CANVAS_MAX, MIDDLE, DIVIDER_COLOUR, 4); // East
    drawSolidLine(MIDDLE, SOUTH_STOP_LINE_Y, MIDDLE, CANVAS_MAX, DIVIDER_COLOUR, 4); // South
    drawSolidLine(0, MIDDLE, WEST_STOP_LINE_X, MIDDLE, DIVIDER_COLOUR, 4); // West

    // Dashed Lane Lines
    drawDashedLine(0, 370, 320, 370, DASHED_LANE_COLOUR, 2);
    drawDashedLine(0, 430, 320, 430, DASHED_LANE_COLOUR, 2);
    drawDashedLine(480, 370, 800, 370, DASHED_LANE_COLOUR, 2);
    drawDashedLine(480, 430, 800, 430, DASHED_LANE_COLOUR, 2);
    drawDashedLine(370, 0, 370, 320, DASHED_LANE_COLOUR, 2);
    drawDashedLine(370, 480, 370, 800, DASHED_LANE_COLOUR, 2);
    drawDashedLine(430, 0, 430, 320, DASHED_LANE_COLOUR, 2);
    drawDashedLine(430, 480, 430, 800, DASHED_LANE_COLOUR, 2);

    // Stop Lines (solid white)
    drawSolidLine(340, 320, 460, 320, STOP_LINE_COLOUR, 6);
    drawSolidLine(340, 480, 460, 480, STOP_LINE_COLOUR, 6);
    drawSolidLine(320, 340, 320, 460, STOP_LINE_COLOUR, 6);
    drawSolidLine(480, 340, 480, 460, STOP_LINE_COLOUR, 6);
}


function drawSpawnZones() {
    // Inner Function to draw the car spawn locations
    function drawSpawnRect(x, y, width, height) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, width, height);
    }
    // NORTH SPAWN ZONES
    drawSpawnRect(375, 5, 20, 50); // Zone 2
    drawSpawnRect(345, 5, 20, 50); // Zone 1

    // EAST SPAWN ZONES
    drawSpawnRect(745, 345, 50, 20); // Zone 1
    drawSpawnRect(745, 375, 50, 20); // Zone 2

    // SOUTH SPAWN ZONES
    drawSpawnRect(405, 745, 20, 50); // Zone 1
    drawSpawnRect(435, 745, 20, 50); // Zone 2

    // WEST SPAWN ZONES
    drawSpawnRect(5, 435, 50, 20); // Zone 1
    drawSpawnRect(5, 405, 50, 20); // Zone 2
}

function drawTrafficLights() {
    const lights = [
        { x: 400, y: 330, direction: 'north', width: 25, height: 5, arcStart: 0, arcEnd: Math.PI, counterClockwise: true },
        { x: 400, y: 470, direction: 'south', width: 25, height: 5, arcStart: 0, arcEnd: Math.PI, counterClockwise: false },
        { x: 330, y: 400, direction: 'west', width: 5, height: 25, arcStart: Math.PI / 2, arcEnd: Math.PI * 1.5, counterClockwise: false },
        { x: 470, y: 400, direction: 'east', width: 5, height: 25, arcStart: Math.PI / 2, arcEnd: Math.PI * 1.5, counterClockwise: true }
    ];

    lights.forEach(({ x, y, direction, width, height, arcStart, arcEnd, counterClockwise }) => {
        // Draw black background for the light
        ctx.fillStyle = "black";
        ctx.fillRect(x - width / 2, y - height / 2, width, height);

        // Determine traffic light color
        const isNS = direction === 'north' || direction === 'south';
        const lightColor = (isNS ? lightStateNS : lightStateEW) === "green" ? "rgb(50,205,50)" : "red";

        // Draw the traffic light as an arc
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(x, y, 10, arcStart, arcEnd, counterClockwise);
        ctx.fill();
    });
}


class Car {
    static idCounter = 1;
    static colors = ["red", "blue", "green", "yellow", "purple", "orange"];

    constructor(x, y, width, height, speed, direction) {
        this.id = Car.idCounter++; // Assign a unique ID
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = direction;
        this.color = Car.colors[Math.floor(Math.random() * Car.colors.length)]; // Assign random color
        this.isStopped = false; // Track if the car is stopped
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    resume() {
        this.isStopped = false; // Mark the car as not stopped
        this.speed = 2; // Set the car's speed back to a default value (or original speed)
    }

    // Collision check method
    isCollidingWith(otherCar) {
        return (
            this.x < otherCar.x + otherCar.width &&
            this.x + this.width > otherCar.x &&
            this.y < otherCar.y + otherCar.height &&
            this.y + this.height > otherCar.y
        );
    }
}

// Draw all cars
function drawCars() {
    cars.forEach(car => car.draw(ctx));
}

// Update car positions
function updateCars() {
  cars.forEach(car => {

    // Check for collisions with other cars
    for (const carBehind of cars) {
        if (carBehind !== car && car.isCollidingWith(carBehind)) {
            car.speed = 0;
            break; // Stop checking further cars if a collision is found
        } 
        else {
            car.speed = 2;
        }
    }

    if (lightStateEW === "green" ) { //EW Green Lights
      if (car.direction === "east") {
        car.resume();
        car.x -= car.speed;
      }  
      if (car.direction === "west") {
        car.resume();
        car.x += car.speed; 
      }
      if (car.direction === "north") { //North=RED Light
        if (car.y > NORTH_STOP_LINE_Y - 19) {
            car.y += car.speed + 15;
        } else if (car.y < NORTH_STOP_LINE_Y - 20) {
            car.y += car.speed;
        }
      }
      if (car.direction === "south") {//South=RED Light
        if(car.y < SOUTH_STOP_LINE_Y) {
            car.y -= car.speed+15; 
        } else if (car.y > SOUTH_STOP_LINE_Y) {
            car.y -= car.speed; 
        }
      }
    } else {
        if (car.direction === "east") { //EAST=RED Light
            if (car.x < EAST_STOP_LINE_X) {
                car.x -= car.speed+15;
            } else if (car.x > EAST_STOP_LINE_X+1) {
                car.x -= car.speed; 
            }
        }
        if (car.direction === "west") { //West=RED Light
            if (car.x > WEST_STOP_LINE_X-19) { 
                car.x += car.speed+15; //Passed the stop line (light is red)
            } else if (car.x < WEST_STOP_LINE_X-20) { 
                car.x += car.speed; //Approaching stop line (light is red)
            } else if (car.x >= WEST_STOP_LINE_X-20){ 
                //At the stop line (light is red)
            } else {
                //Should never arrive here
            }
        }
      if (car.direction === "north") {//North=Green Light
        car.resume();
        car.y += car.speed; 
      }
      if (car.direction === "south") {//South=Green Light  
        car.resume();
        car.y -= car.speed; 
      }
    }
  });
}



// Count cars heading east/west and north/south that have not crossed the intersection stop lines.
function countCars() {
  const eastWestCount = cars.filter(car => {
    if (car.direction === "east" && car.x >= EAST_STOP_LINE_X) return true;
    if (car.direction === "west" && car.x <= WEST_STOP_LINE_X) return true;
    return false;
  }).length;
  
  const northSouthCount = cars.filter(car => {
    if (car.direction === "north" && car.y <= NORTH_STOP_LINE_Y) return true;
    if (car.direction === "south" && car.y >= SOUTH_STOP_LINE_Y) return true;
    return false;
  }).length;

    // Set font and style
    ctx.font = "25px sans-serif";
    ctx.fillStyle = "Red";  // Change color as needed

    // Draw the counts on the canvas
    ctx.fillText(`${eastWestCount}`, 10, 30);  // Positioning (x, y)
    ctx.fillText(`${northSouthCount}`, 10, 60); // Positioning (x, y)
    ctx.fillText(`(East/West)`, 60, 30);  // New position (x, y)
    ctx.fillText(`(North/South)`, 60, 60);  // New position (x, y)

  
//   console.log("East-West count (not in intersection):", eastWestCount);
//   console.log("North-South count (not in intersection):", northSouthCount);
}

// Main update loop
function update() {
  ctx.clearRect(0, 0, CANVAS_MAX, CANVAS_MAX);
  drawRoads();
  drawRoadLines();
  drawSpawnZones();
  updateCars();
  drawCars();
  drawTrafficLights();
  countCars();
}

// Toggle light state
function changeLight() {
  if (lightStateEW === "green") {
    lightStateEW = "red";
    lightStateNS = "green";
  } else {
    lightStateEW = "green";
    lightStateNS = "red";
  }
}

// Add a random car
function addCar() {
  const randomDirection = ["east", "west", "north", "south"][Math.floor(Math.random() * 4)];
  addCarFrom(randomDirection);
}

// Check if the new car's area is clear (at least 1px distance from any existing car)
function isAreaClear(newCar) {
  for (let other of cars) {
    if (
      newCar.x < other.x + other.width + 1 &&
      newCar.x + newCar.width > other.x - 1 &&
      newCar.y < other.y + other.height + 1 &&
      newCar.y + newCar.height > other.y - 1
    ) {
      return false;
    }
  }
  return true;
}

// Spawn a car in a given direction at preset spawn positions.
function addCarFrom(direction, spawnX, spawnY) {
    let width, height, x, y;
    const speed = 2; // Default speed

    if (direction === "north") {
        width = 10;
        height = 20;
        x = spawnX !== undefined ? spawnX : (Math.random() < 0.5 ? 350 : 380);
        y = spawnY !== undefined ? spawnY : 10;
    } else if (direction === "south") {
        width = 10;
        height = 20;
        x = spawnX !== undefined ? spawnX : (Math.random() < 0.5 ? 410 : 440);
        y = spawnY !== undefined ? spawnY : 770;
    } else if (direction === "east") {
        width = 20;
        height = 10;
        x = spawnX !== undefined ? spawnX : 770;
        y = spawnY !== undefined ? spawnY : (Math.random() < 0.5 ? 350 : 380);
    } else if (direction === "west") {
        width = 20;
        height = 10;
        x = spawnX !== undefined ? spawnX : 10;
        y = spawnY !== undefined ? spawnY : (Math.random() < 0.5 ? 440 : 410);
    } else {
        return; // Invalid direction, do nothing
    }

    // Create a temporary car object for collision check
    const car = new Car(x, y, width, height, speed, direction);

    // Ensure the area is clear before adding the new car
    if (isAreaClear(car)) {
        cars.push(car); // Add car only if there's space
    }
}

// Canvas click listener: if user clicks within a spawn zone, spawn a car at that zone's predetermined coordinates.
canvas.addEventListener('click', function(event) {
const { pageX, pageY } = event;
const { left, top } = canvas.getBoundingClientRect();
const canvasX = pageX - left;
const canvasY = pageY - top;

// console.log("Clicked:", canvasX, canvasY);

// Loop through spawn zones
for (const direction in spawnZones) {
    for (const zone of spawnZones[direction]) {
    const [xMin, xMax] = zone.xRange;
    const [yMin, yMax] = zone.yRange;

    // Check if click is within the spawn zone
    if (canvasX >= xMin && canvasX <= xMax && canvasY >= yMin && canvasY <= yMax) {
        const [spawnX, spawnY] = zone.spawnPoint;
        addCarFrom(direction, spawnX, spawnY);
        return;
    }
    }
}
});


setInterval(update, 50);
