var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.jpg";

var heroReady = false;
var heroImage = new Image();
heroImage.src = "images/bulbasaur1.png";
heroImage.onload = function () {
    heroReady = true;
    heroImage.width = heroImage.width / 2;  // scale down width by 50%
    heroImage.height = heroImage.height / 2;  // scale down height by 50%

};


var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/pokeball.png";

var obstacleReady = false;
var obstacleImage = new Image();
obstacleImage.onload = function() {
    obstacleReady = true;
};
obstacleImage.src = "images/rock.png";

var bushReady = false;
var bushImage = new Image();
bushImage.onload = function () {
    bushReady = true;
};
bushImage.src = "images/bush.png";

var spikesReady = false;
var spikesImage = new Image();
spikesImage.onload = function () {
    spikesReady = true;
};
spikesImage.src = "images/spikes.png";

var hero = { speed: 256, x: canvas.width / 2, y: canvas.height / 2 };
var monster = { x: 0, y: 0 };
var monstersCaught = 0;
var obstacles = [];

var getRandomPosition = function(excludePositions) {
    let position, size = 32;
    do {
        position = {
            x: Math.floor(Math.random() * (canvas.width - size)),
            y: Math.floor(Math.random() * (canvas.height - size))
        };
    } while (excludePositions.some(p => Math.abs(position.x - p.x) < size && Math.abs(position.y - p.y) < size));
    return position;
};


var initializeObstacles = function(numObstacles) {
    for (let i = 0; i < numObstacles; i++) {
        obstacles.push(getRandomPosition(obstacles));
    }
};

var spikes = [];

var initializeSpikes = function(numSpikes) {
    for (let i = 0; i < numSpikes; i++) {
        spikes.push(getRandomPosition(spikes));
    }
};

// Call the function to initialize the spikes
initializeSpikes(5);

var drawBorder = function() {
    if (bushReady) {
        const bushSize = 32;
        for (let x = 0; x < canvas.width; x += bushSize) {
            ctx.drawImage(bushImage, x, 0, bushSize, bushSize);
            ctx.drawImage(bushImage, x, canvas.height - bushSize, bushSize, bushSize);
        }
        for (let y = bushSize; y < canvas.height - bushSize; y += bushSize) {
            ctx.drawImage(bushImage, 0, y, bushSize, bushSize);
            ctx.drawImage(bushImage, canvas.width - bushSize, y, bushSize, bushSize);
        }
    }
};


var isObstacleAt = function(x, y) {
    const targetSize = 48;
    return obstacles.some(obstacle => Math.abs(x - obstacle.x) < targetSize && Math.abs(y - obstacle.y) < targetSize);
};

var reset = function() {
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
    resetMonster();
};

var resetGame = function() {
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
    monstersCaught = 0;
    resetMonster();
    keysDown = {};
};

var resetMonster = function() {
    do {
        let position = getRandomPosition(obstacles);
        monster.x = position.x;
        monster.y = position.y;
    } while (isObstacleAt(monster.x, monster.y));
};

var update = function(modifier) {
    var newX = hero.x - (37 in keysDown) * hero.speed * modifier + (39 in keysDown) * hero.speed * modifier;
    var newY = hero.y - (38 in keysDown) * hero.speed * modifier + (40 in keysDown) * hero.speed * modifier;

    if (newX < 0 || newY < 0 || newX > canvas.width - 32 || newY > canvas.height - 32) {
        alert("Game over! You fell off the earth. Tough Break, Try again.");
        resetGame();
    } else if (!isObstacleAt(newX, newY)) {
        hero.x = newX;
        hero.y = newY;
    }

    if (Math.abs(hero.x - monster.x) < 48 && Math.abs(hero.y - monster.y) < 48) {
        ++monstersCaught;
        resetMonster();
        var audio = new Audio('audio/ping.mp3');
        audio.play();
        if (monstersCaught >= 5) {
            alert("Congratulations! You saved your pokemon friends and won the game!");
            resetGame();
        }
    }
    spikes.forEach(spike => {
        if (Math.abs(hero.x - spike.x) < 32 && Math.abs(hero.y - spike.y) < 32) {
            alert("Game over! You stepped on spikes.");
            resetGame();
        }
    });
};

var render = function() {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
    drawBorder();
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, 32, 32);
    });
    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }
    if (monsterReady) {
        ctx.drawImage(monsterImage, monster.x, monster.y);
    }
    spikes.forEach(spike => {
        if (spikesReady) {
            ctx.drawImage(spikesImage, spike.x, spike.y, 32, 32);
        }
    });
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Friends Saved: " + monstersCaught, 32, 32);
};

var keysDown = {};
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

initializeObstacles(5);
var then = Date.now();
reset();
var main = function() {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    requestAnimationFrame(main);
};

main();  // Start the game loop
