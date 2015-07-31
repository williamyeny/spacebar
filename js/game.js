var game = new Phaser.Game(800, 300, Phaser.AUTO, 'le-game', { preload: preload, create: create, update: update });
var player;
var enemies;
var level;
var spawnTimer = 0;
var spawnInterval = 0.0;
var spawnDuration = 180;
var startingLevel;
var gameEnd;
var enemiesSpawned;
var muzzleFlash;
var muzzleTime;
var numEnemies;
var enemiesPerLevel;
var grounds;
var cities1;
var cities2;
var header;
var score;
var highscore= 0;
var emitter;
var alertTimer = 0;
var shotgun;
var soundtrack;

function preload() {
  game.load.spritesheet("enemy", "assets/knight.png", 19, 23);
  game.load.spritesheet("player", "assets/runny guy.png", 12, 15);
  game.load.image("gun", "assets/gun.png");
  game.load.image("muzzle flash", "assets/muzzle flash.png");
  game.load.image("ground", "assets/ground.png");
  game.load.image("building-1-1", "assets/building-1-1.png");
  game.load.image("building-1-2", "assets/building-1-2.png");
  game.load.image("building-2-1", "assets/building-2-1.png");
  game.load.image("building-2-2", "assets/building-2-2.png");
  game.load.image("blood", "assets/blood.png")
  game.load.audio("shotgun", "assets/shotgun.mp3");
  game.load.audio("soundtrack", "assets/paperdolls.wav");
}


function startLevel() {
  
  level++;
  enemiesPerLevel += 4;
  spawnInterval = spawnDuration / (enemiesPerLevel);
  startingLevel = true;
  enemiesSpawned = 0;
}

function createBuilding(type) {

  if (getRandomNumber() == 0) {
    var bui = game.add.sprite(900, 50, "building-1-" + type);
  } else {
    var bui = game.add.sprite(900, 20, "building-2-" + type);
  }
  if (type == 1) {
    bui.scale.setTo(2, 2);
  } else {
    bui.scale.setTo(1.5, 1.5);
    bui.y += 40;
  }
  
  bui.smoothed = false;
  
  if (type == 2) {
    cities2.add(bui);
  }  else {
    cities1.add(bui);
  }
}
function getRandomNumber() {
  return parseInt(Math.random()*2);
}

function create() {
  soundtrack = game.add.audio("soundtrack");
  soundtrack.loop = true;
  soundtrack.play();
  
  game.physics.startSystem(Phaser.Physics.ARCADE);
  shotgun = game.add.audio("shotgun");
  shotgun.volume = 0.5;
  
  score = 0;
  header = "";
  game.stage.backgroundColor = "#60b0e9";
  cities2 = game.add.group();
  cities1 = game.add.group();  
  createBuilding(1);
  createBuilding(2);
  grounds = game.add.group();
  for (var i = 0; i < 5; i++) {
    var g = game.add.tileSprite(i*200, 160, 200, 200, "ground");
    grounds.add(g);
  }
  
  enemiesPerLevel = 12;
  numEnemies = 0;
  muzzleFlash = game.add.sprite(160, 135, "muzzle flash");
  level = 0;
  gameEnd = true;
  player = game.add.sprite(100, 150, "player");
  player.animations.add("run", [0, 1, 2, 3, 4, 5], 30, true);
  player.animations.play("run");
  player.smoothed = false;
  player.scale.setTo(3, 3);
  var gun = game.add.sprite(100, 160, "gun");
  gun.scale.setTo(2.5, 2.5);
  gun.smoothed = false;
  enemies = game.add.group();
  startLevel();
  this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(space, this);
  var style = { font: "32px Arial", fill: "#ff0044", align: "center" };
  
  emitter = game.add.emitter(0, 0, 10000);
  emitter.makeParticles("blood");
  emitter.minParticleScale = 5;
  emitter.gravity = 400;
  
}

function space() {
  muzzleFlash.alpha = 1;
  shotgun.play();
  if (enemies.length > 0) {
    emitter.x = enemies.getBottom().x;
    emitter.y = enemies.getBottom().y + 50;
    console.log(emitter.x);
    emitter.start(true, 2000, null, 20);
    enemies.getBottom().destroy();
    score++;
    numEnemies--;
  }
  
}

function update() {
  game.world.setBounds(Math.random()*5, Math.random()*7, 800, 300);
  
  $("#level").html("LEVEL: " + level);
  $("#score").html("SCORE: " + score);
  cities1.forEach(function(c) {
    c.x-= 1.5;
  });
  
  if (cities1.getTop().x < Math.random()*20 + 750) {
    createBuilding(1);
  }
  
  if (cities2.getTop().x < Math.random()*20 + 790) {
    createBuilding(2);
  }
  
  cities2.forEach(function(c) {
    c.x -= 1;
  })
  
  grounds.forEach(function(g) {
    g.tilePosition.x-=2;
  });
  
  if (numEnemies == 0 && !startingLevel) {
    startLevel();
  }
  
  enemies.forEach(function (enemy) {
    enemy.x -= 2;
    if (enemy.x < 170) {
      //gameover
      enemies.destroy();
      enemies = game.add.group();
      numEnemies = 0;
      enemiesPerLevel = 12;
      level = 0;
      if (score > highscore) {
        highscore = score;
        $("#highscore").html("HIGHSCORE: " + highscore);
      }
      alertTimer = 200;
      score = 0;
      return;
    }
  });
  
  if (alertTimer > 0) {
    alertTimer--;
    $("#alert").html("LEVEL HAS BEEN RESET");

  } else {
    $("#alert").html("");
  }
  
  

  muzzleFlash.alpha += (-muzzleFlash.alpha)/3;
  
   
  
  if (startingLevel && gameEnd) {
    spawnTimer++;
    if (spawnTimer > spawnInterval) {
      spawnTimer = 0;
      var enemy = game.add.sprite(900, 130, "enemy");
      enemy.animations.add("run", [0, 1, 2, 3, 4, 5], 30, true);
      enemy.animations.play("run");
      var scale = Math.random()*0.5 + 3;
      enemy.scale.setTo(-scale, scale);
      enemy.smoothed = false;
      enemies.add(enemy);
      numEnemies++;
      enemiesSpawned++;
      if (enemiesSpawned == enemiesPerLevel) {
        startingLevel = false;
      }
    }

    
  }
}