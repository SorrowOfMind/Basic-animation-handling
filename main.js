//selecting elements
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
const display = document.createElement("canvas").getContext('2d');

//variables
const SIZE_BG_W = 160;
const SIZE_BG_H = 208;
display.canvas.width = 320;
display.canvas.height = 208;

//sprite for bg
const sprite = new Image();
sprite.src = "assets/bg-sprite.png";

class Asset {
    constructor(sx, sy, sW, sH, dx, dy, dW, dH) {
        this.sx = sx;
        this.sy = sy;
        this.sW = sW;
        this.sH = sH;
        this.dx = dx;
        this.dy = dy;
        this.dW = dW;
        this.dH = dH;
    }
    draw() {
        display.drawImage(sprite, this.sx, this.sy, this.sW, this.sH, this.dx, this.dy, this.dW, this.dH);
        display.drawImage(sprite, this.sx, this.sy, this.sW, this.sH, this.dx + this.dW, this.dy, this.dW, this.dH);
    }
}

const world = {
    bgClouds: new Asset(0, 0, SIZE_BG_W , SIZE_BG_H, 0, 0, SIZE_BG_W, SIZE_BG_H),
    bgMountains: new Asset(SIZE_BG_W, 0, SIZE_BG_W, SIZE_BG_H, 0, 0, SIZE_BG_W, SIZE_BG_H),
    bgTrees: new Asset((SIZE_BG_W * 2), 0, SIZE_BG_W, SIZE_BG_H, 0, 0, SIZE_BG_W, SIZE_BG_H)
};

class Animation {
    constructor(frameSet, delay) {
        this.count = 0; //game cycles
        this.delay = delay; // cycles to wait
        this.frame = 0; // current animation frame
        this.fIndex = 0; //index of current animation frame
        this.frameSet = frameSet; // idle, run ,jump
    }
    change(frameSet, delay = 10) { //change animation set idle-run-jump
        if (this.frameSet !== frameSet) {
            this.count = 0;
            this.delay = delay;
            this.fIndex = 0; 
            this.frameSet = frameSet;
            this.frame = this.frameSet[this.fIndex]; //first frame of the new set
        }
    }
    update() { //update frames within the frameset
        this.count++;
        if (this.count >= this.delay) {
            this.count = 0;
            this.fIndex = (this.fIndex === this.frameSet.length - 1) ? 0 : this.fIndex + 1;
            this.frame = this.frameSet[this.fIndex];
        }
    }
}

const player = {
    animation: new Animation(),
    jumping: true,
    w: 33,
    h: 32,
    x: 10,
    y: 30,
    velX: 0,
    velY: 0,
    gravity: 0.3,
    friction: 0.9
};

const animationStrip = {
    frameSets: [
        [0,1], //jump left i=0
        [2,3], //jump right i=1
        [4,5,6,7], //idle i=2
        [8,9,10,11,12,13], //run left i=3
        [14,15,16,17,18,19] //run right i=4
    ], 
    image: new Image
}


const controller = {
    left: false,
    right: false,
    up: false,
    move(e) {
        let key = e.keyCode;
        let keyState = e.type === 'keydown' ? true : false;
        switch (key) {
            case 37:
                controller.left = keyState;
                break;
            case 38:
                controller.up = keyState;
                break;
            case 39:
                controller.right = keyState;
                break;
        }
    }
};

function draw() {
    //enviroment
    world.bgClouds.draw();
    world.bgMountains.draw();
    world.bgTrees.draw();

    //draw player
    display.drawImage(animationStrip.image, player.animation.frame * player.w, 0, player.w, player.h, Math.floor(player.x), Math.floor(player.y), player.w, player.h);

    //ground
    display.fillStyle = "#009900";
    display.fillRect(0, display.canvas.height - 10, display.canvas.width, 10);
    
    //draw 'display' canvas
    ctx.drawImage(display.canvas, 0, 0, display.canvas.width, display.canvas.height, 0, 0, cvs.width, cvs.height);
}

function resizeCvs() {
    cvs.width = document.documentElement.clientWidth -33;

    if (cvs.width > document.documentElement.clientHeight) {
        cvs.width = document.documentElement.clientHeight;
    }

    cvs.height = cvs.width / 2;
    cvs.imageSmoothEnabled = false;
}


function loop() {
    if (controller.up && !player.jumping) {
        player.jumping = true;
        player.velY -= 10;
        if (controller.left) {
            player.animation.change(animationStrip.frameSets[0], 30);
        }
        if (controller.right) {
            player.animation.change(animationStrip.frameSets[1], 30);
        }
    }

    if (controller.left) {
        player.animation.change(animationStrip.frameSets[3], 15);
        player.velX -=0.2;
    }

    if (controller.right) {
        player.animation.change(animationStrip.frameSets[4], 15);
        player.velX += 0.2;
    }

    if (!controller.left && !controller.right & !controller.up) {
        player.animation.change(animationStrip.frameSets[2], 10);
    }

    player.velY += player.gravity;
    player.x += player.velX;
    player.y += player.velY;
    player.velX *= player.friction;
    player.velY *= player.friction;

    //collision detection
    if (player.y + player.h > display.canvas.height - 10) {
        player.jumping = false;
        player.y = display.canvas.height - 10 - player.h;
        player.velY = 0;
    }

    if (player.x + player.w > display.canvas.width) {
        player.x = display.canvas.width - player.w;
    } else if (player.x < 0) {
        player.x = 0;
    }

    player.animation.update();
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener('resize', resizeCvs);
window.addEventListener('keydown', controller.move);
window.addEventListener('keyup', controller.move);
resizeCvs();

animationStrip.image.addEventListener('load', function() {
    loop();
})

animationStrip.image.src = "assets/player-sprite.png";