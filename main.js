const sprites = new Image();
sprites.src = "./img/sprites.png";

const gunfire = new Audio();
gunfire.src = "./sound/gunfire.mp3";

const countdown = new Audio();
countdown.src = "./sound/countdown.wav"

const canvas = document.querySelector('canvas');
if(window.navigator.onLine){
    canvas.height = window.innerHeight / 100 * 86;
}else{
    canvas.height = window.innerHeight
}
canvas.width = window.innerWidth;
const context = canvas.getContext("2d");

const players = {// Stores both players current sprites info, status and functions to draw, animate and reset them.
    first:{ //Stores first player info and draw and reset functions.
        status: "standing",
        name: "First",
        sourceX: 0,
        sourceY: 0,
        positionX: canvas.width / 2 - 350,
        positionY: canvas.height / 2 - 48,
        draw(){
            context.drawImage(
                sprites,
                players.first.sourceX, players.first.sourceY, //Start position
                96, 96, //Sprite size
                players.first.positionX, players.first.positionY, //On frame position
                96, 96 //On frame size
            );
        },
        reset(){
            players.first.status = "standing";
            players.first.sourceX = 0;
            players.first.sourceY = 0;
        }
    },
    second:{//Stores second player info and draw and reset functions.
        status: "standing",
        name: "Second",
        sourceX: 0,
        sourceY: 96,
        positionX: canvas.width / 2 + 254,
        positionY: canvas.height / 2 - 48,
        draw(){
            context.drawImage(
                sprites,
                players.second.sourceX, players.second.sourceY, //Start position
                96, 96, //Sprite size
                players.second.positionX , players.second.positionY, //On frame position
                96, 96 //On frame size
            );
        },
        reset(){
            players.second.status = "standing";
            players.second.sourceX = 0;
            players.second.sourceY = 96;
        }
    },
    doWithdraw(player){ //Makes the player withdraw the gun.
        if(player.status == "standing"){
            if(player.sourceX < 385){
                player.sourceX += 96;
            }else{
                player.status = "withdraw";
            }
        }else{
            console.log(player.name+" player can't withdraw.\nPlayer status: "+player.status);
        }
    },
    undoWithdraw(player){//Makes the player keep the gun.
        if(player.status == "withdraw"){
            if(player.sourceX > 0){
                player.sourceX -= 96;
            }else{
                player.reset();
            }
        }else{
            console.log(player.name+" player can't undo withdraw.\nPlayer status: "+player.status);
        }
    },
    shoot(shooter){//Makes the player shoot
        if(remaingTimer > 0){
            return;
        }else if(shooter.status == "withdraw"){
            shooter.status = "shooting";
            shooter.sourceX = 0;
            shooter.sourceY += 192;
        }else if(shooter.status == "shooting" && shooter.sourceX < 192){
            shooter.sourceX += 96;
        }else if(shooter.status == "shooting"){
            shooter.sourceX += 96;
            shooter.sourceY -= 192;
            shooter.status = "withdraw";
        }else{
            console.log(shooter.name+" player can't shoot.\nPlayer status: "+shooter.status);
        }
    },
    die(dead){//Makes the player die
        if(remaingTimer > 0){
            return;
        }else if(dead.status == "withdraw"){
            dead.status = "dead";
            changeCurrenScreen(screens.end);
            dead.sourceX = 0;
            dead.sourceY += 384 
        }else if(dead.status == "dead" && dead.sourceX < 385){
            dead.sourceX += 96;
        }else if(dead.status != "dead"){
            console.log(dead.name+" player can't die.\nPlayer status: "+dead.status);
        }
    },
    action(shooter, dead){//Calls the shoot and die functions together so they do not conflict each other.
        this.shoot(shooter);
        this.die(dead);
    }
}

const screens = { 
    menu:{ //Draw buttons and put both players to standing status reseting them.
        name: "menu",
        update(){
            drawEveryFrameObjects();
            context.drawImage(sprites, 1344, 0, 384, 192,(canvas.width / 2 - 144), (canvas.height / 2 -72),288,144)
            if(players.first.status == "withdraw"){
                players.undoWithdraw(players.first)
            }else{
                players.first.reset()
            }
            if(players.second.status == "withdraw"){
                players.undoWithdraw(players.second)
            }else{
                players.second.reset();
            }
        }
    },
    game:{ //Just responsible to update on game frames.
        name: "game",
        update(){
            drawEveryFrameObjects();
            drawEveryGameUpdate();
        },
    },
    end:{ //Updates frames and gives the user the result
        name: "end",
        update(){
            drawEveryFrameObjects();
            drawEveryGameUpdate();
            if(mode == "single"){
                if(players.first.status == "dead"){
                    context.drawImage(sprites, 960, 192, 384, 192,(canvas.width / 2 - 144), (canvas.height / 2 -72),288,144)
                }else if(players.second.status == "dead"){
                    context.drawImage(sprites, 576, 192, 384, 192,(canvas.width / 2 - 144), (canvas.height / 2 -72),288,144)
                }
            }else if(mode == "multi"){
                if(players.first.status == "dead"){
                    context.drawImage(sprites, 960, 0, 384, 192,(canvas.width / 2 - 144), (canvas.height / 2 -72),288,144)
                }else if(players.second.status == "dead"){
                    context.drawImage(sprites, 576, 0, 384, 192,(canvas.width / 2 - 144), (canvas.height / 2 -72),288,144)
                }  
            }
        }
    }
}

var currentScreen;
changeCurrenScreen(screens.menu);
var mode;
var then;
var remaingTimer;

function drawEveryFrameObjects(){ //Clears the frame, draws the backgorund and characters.
    context.clearRect(0,0, canvas.width, canvas.height);
    //background
    context.drawImage(sprites, 0, 576, 1400, 460,(canvas.width / 2 - 350), (canvas.height / 2 - 130), 700, 230);
    players.first.draw();
    players.second.draw();
}

function drawEveryGameUpdate(){ //Calls the functions that update the sprites to animate.
    if(players.first.status == "standing"){
        players.doWithdraw(players.first);
    }
    if(players.second.status == "standing"){
        players.doWithdraw(players.second);
    }
    if(players.first.status == "shooting"){
        players.action(players.first, players.second);
    }else if(players.second.status == "shooting"){
        players.action(players.second, players.first);
    }
    drawTimer();
}

function drawTimer(){ //Draws the timer when the game start
    let now = Date.now()
    remaingTimer = then - now;
    if(remaingTimer > 2000){
        context.drawImage(sprites, 576, 384, 192, 192,(canvas.width / 2 - 48), (canvas.height / 2 - 48), 96, 96)
    }else if(remaingTimer > 1000){
        context.drawImage(sprites, 768, 384, 192, 192,(canvas.width / 2 - 48), (canvas.height / 2 - 48), 96, 96)
    }else if(remaingTimer > 0){
        context.drawImage(sprites, 960, 384, 192, 192,(canvas.width / 2 - 48), (canvas.height / 2 - 48), 96, 96)
    }else if(remaingTimer > -500){
        context.drawImage(sprites, 1152, 384, 192, 192,(canvas.width / 2 - 48), (canvas.height / 2 - 48), 96, 96)
    }
    if(remaingTimer > -500){
        //console.log(remaingTimer);
    }
}

function changeCurrenScreen(newScreen){ //Changes the current screen, sets the timer and set when the second player will shoot on singleplayer mode.
    currentScreen = newScreen;
    if(currentScreen.name == "game"){
        //delays the screen change to prevent "autoplay" issue
        setTimeout(() =>{
            countdown.play();
            then = Date.now()+3000;
            if(mode == "single"){
                let player2Time = randomIntFromInterval(-300, -150)
                setTimeout(() => {
                    if(players.second.status != "dead"){
                        players.action(players.second, players.first);
                    }
                }, 3000 - (player2Time));
            }
        }, 100)       
    }else if(currentScreen.name == "end"){
        gunfire.play();
    } else if(currentScreen.name == "menu"){
        mode = null;
        gunfire.pause();
        gunfire.currentTime = 0;
        countdown.pause();
        countdown.currentTime = 0;
    }
}

function randomIntFromInterval(min, max) { //Generates random unmber (min and max included).
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var updateInterval = setInterval(() => {//Updates the frames and sets the frame rate. 
    //console.log("player1\nX: "+players.first.sourceX+"\n"+"Y: "+players.first.sourceY+"\nplayer2\nX: "+players.second.sourceX+"\n"+"Y: "+players.second.sourceY);
    //console.log(currentScreen.name);
    //console.log("first: "+players.first.status+"\nsecond: "+players.second.status);
    currentScreen.update();
}, 100);

document.addEventListener('keydown', function(event){
	if(currentScreen.name == "game"){
        if(mode == "single"){
            if(event.key == " "){
                players.action(players.first, players.second);
            }
        }else if(mode == "multi"){
            if(event.key == "f"){
                console.log(event.key);
                players.action(players.first, players.second);
            }else if(event.key == "j"){
                console.log(event.key);
                players.action(players.second, players.first);
            }
        }
    }
    if(event.key == "Escape"){
        changeCurrenScreen(screens.menu);
	}
});

//Adds event listener for touchstart or mousedown.
if(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)){
    document.addEventListener('touchstart', function(event){
        userInput(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
    });
}else{
    document.addEventListener('mousedown', function(event){
        userInput(event.clientX, event.clientY);
    });
}

function userInput(X, Y){//Receives mouse and touch inputs
    //console.log(X+" "+Y);
    if(currentScreen.name == "menu"){
        if(X > canvas.width / 2 - 144 && X < canvas.width / 2 && Y > canvas.height / 2 - 72 && Y < canvas.height / 2 + 72){
            console.log("1 player");
            mode = "single";
            changeCurrenScreen(screens.game);
        }else if(X > canvas.width / 2 && X < canvas.width / 2 + 144 && Y > canvas.height / 2 - 72 && Y < canvas.height / 2 + 72){
            console.log("2 players");
            mode = "multi";
            changeCurrenScreen(screens.game);
        }
    }else if(currentScreen.name == "game"){
        if(mode == "single" && X > players.first.positionX && X < players.first.positionX + 96 && Y > players.first.positionY && Y < players.first.positionY +96){
            players.action(players.first, players.second);
        }else if(mode == "multi"){
            if(X > players.first.positionX && X < players.first.positionX + 96 && Y > players.first.positionY && Y < players.first.positionY +96){
                players.action(players.first, players.second);
            }else if(X > players.second.positionX && X < players.second.positionX + 96 && Y > players.second.positionY && Y < players.second.positionY +96){
                players.action(players.second, players.first);
            }
        }
    }else if(currentScreen.name == "end"){
        if(X > canvas.width / 2 - 144 && X < canvas.width / 2 + 144 && Y > canvas.height / 2 - 72 && Y < canvas.height / 2 + 72){
            changeCurrenScreen(screens.menu);
        }
    }
}

window.addEventListener('resize', function(event) {
    if(window.navigator.onLine){
        canvas.height = window.innerHeight / 100 * 86;
    }else{
        canvas.height = window.innerHeight
    }
    canvas.width = window.innerWidth;
    players.first.positionX = canvas.width / 2 - 350;
    players.first.positionY = canvas.height / 2 - 48;
    players.second.positionX = canvas.width / 2 + 254;
    players.second.positionY = canvas.height / 2 - 48;
}, true);

//screen.orientation.onchange = () => { window.location.reload() }