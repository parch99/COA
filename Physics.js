import { vec3, mat4 } from './lib/gl-matrix-module.js';
import { count, check } from './TImer.js'
import { Flashlight } from './Flashlight.js'
import { Knife } from './Knife.js'

let door_open = new Audio('../../common/audio/door_open.mp3');
let door_close = new Audio('../../common/audio/door_close.mp3');
let slash_miss = new Audio('../../common/audio/slash_miss.mp3');
let slash_object = new Audio('../../common/audio/slash_object.mp3');
let critical_hit = new Audio('../../common/audio/critical_hit.mp3');
let alarm = new Audio('../../common/audio/alarm.mp3');
let alarm_police = new Audio('../../common/audio/alarm_police.mp3');

let doorIsOpen = false;
let policemenIsAlive = true;
let knifePositionSet = false;
let game_finished = false;

export class Physics {

    constructor(scene) {
        this.scene = scene;
        this.randomizeCoins();
    }

    update(dt) {
        this.scene.traverse(node => {
            // Move every node with defined velocity.
            if (node.velocity) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateMatrix();
                // After moving, check for collision with every other node.
                if (!(node instanceof Flashlight) && !(node instanceof Knife)) {
                    this.scene.traverse(other => {
                        if (node !== other && !(other instanceof Flashlight && node.hasFlashlight)
                            && !(other instanceof Knife && node.hasKnife)) {
                            this.resolveCollision(node, other);
                            if(other.aabb.max[0] == 0.7 && !doorIsOpen){
                                this.openDoor(node, other);
                            }
                            if(other.aabb.max[0] == 0.4 && policemenIsAlive){
                                this.end2(node, other);
                            }
                        }
                    });
                }
            }
        });
    }
    
    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.getGlobalTransform();
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    resolveCollision(a, b) {
        if(b instanceof Flashlight && !a.hasFlashlight) {
            this.randomizeFlashlightLocation(b)
        }
        if(b instanceof Knife && !a.hasKnife && !knifePositionSet) {
            knifePositionSet = true;
            this.randomizeKnifeLocation(b)
        }
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);
        
        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);

        if(a.hasKnife && a.knife.stabbed && isColliding){
            slash_object.volume = 1;
            slash_object.play();
        } else if (a.hasKnife && a.knife.stabbed && !isColliding){
            slash_miss.volume = 0.5;
            slash_miss.play();
        }

        if (!isColliding) {
            return;
        } else if (b instanceof Flashlight && !a.hasFlashlight) {
            APP.showHelper = 1;
            a.flashlight = b;
            return;
        } else if (b instanceof Knife && !a.hasKnife) {
            APP.showHelper = 2;
            a.knife = b;
            return;
        }
        APP.showHelper = 0;

        if( b.aabb.max[0] == 1.1 ) { //coins
            count();
            b.translation[1] = -4;
            b.updateMatrix();
        }
        if( b.aabb.max[0] == 0.4 ) { //officer
            this.end(a, b)
        }
        
        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);
        
        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {//ce je diffa[i] < 0 se objekta ne prekrivata
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }
        
        vec3.add(a.translation, a.translation, minDirection);
        a.updateMatrix();
    }

    openDoor(a, b){   
        if(this.checkDistance(a,b)){
            door_open.volume = 0.5;
            door_open.play();
            b.translation[0] = -1.75;
            b.updateMatrix();
            doorIsOpen = true;
            setTimeout(function() {
                door_close.volume = 0.3;
                door_close.play();
                b.translation[0] = 0;
                b.updateMatrix();
                doorIsOpen = false;
            }, 5000);
        };
    }
    //OPEN DOOR WHEN ALL 10 COINS ARE COLLECTED
    end(a, b){
        if(this.checkDistance(a,b) && check(game_finished) && !game_finished){
            document.getElementById("warn").innerHTML = '<span class="fs40">A deal is a deal</span>';
            this.scene.traverse(door => {
                if(door.aabb.max[0] == 0.75 && !game_finished){
                    door_open.volume = 0.5;
                    door_open.play();
                    door.translation[0] -= 1.75;
                    door.updateMatrix();
                    game_finished = true;
                }
            });
            setTimeout(function() {
                location.href = 'win.html';
            }, 7000);
        };
    }
    //OPEN DOOR WHEN GUARD IS KILLED
    end2(a, b){
        if(this.checkDistance(a,b) && !game_finished && policemenIsAlive && a.hasKnife && a.knife.stabbed){
            let chance = Math.floor((Math.random() * 100) + 1);
            if(chance <= 50){
                critical_hit.volume = 0.7;
                critical_hit.play();
                b.translation = [18, 0.2, 19.3]
                b.rotation[2] = -1.6;
                b.updateMatrix();
                document.getElementById("warn").innerHTML = '<span class="fs40">Ahhh you $%@*&!</span>';
                policemenIsAlive = false;
                this.scene.traverse(door => {
                    if(door.aabb.max[0] == 0.75 && !game_finished){
                        door_open.volume = 0.5;
                        door_open.play();
                        door.translation[0] -= 1.75;
                        door.updateMatrix();
                        game_finished = true;
                    }
                });
                alarm.volume = 0.7;
                alarm.play();
                setTimeout(function() {
                    location.href = 'win.html';
                }, 7000);
            } else {
                document.getElementById("warn2").innerHTML = '<span class="fs40">I got you now $%@*&!</span>';
                alarm_police.volume = 0.7;
                alarm_police.play();
                game_finished = true;
                setTimeout(function() {
                    location.href = 'loss.html';
                }, 5000);
            }
        };
    }

    checkDistance(a, b){
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);
        let minDiff = Infinity;
        
        if (diffa[0] >= 0 && diffa[0] < minDiff) {//ce je diffa[i] < 0 se objekta ne prekrivata
            minDiff = diffa[0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
        }
        if(diffa[0] <= 3 && diffa[1] <= 3 && diffa[2] <= 3
            && diffb[0] <= 3 && diffb[1] <= 4 && diffb[2] <= 3){
            return true;
        }
        return false;
    }

    randomizeCoins(){
        this.scene.traverse(node => {
            if(node.aabb.max[0] == 1.1){
                let x = Math.floor(Math.random()*18);
                let z = Math.floor(Math.random()*18);
                let a = Math.floor(Math.random()*2);
                let b = Math.floor(Math.random()*2);
                if(a == 1) z = -z;
                if (b == 2) x = -x;
                node.translation[0] = x;
                node.translation[2] = z;
                node.translation[1] = 1;
                node.updateMatrix();
                this.scene.traverse(other => {
                    if (node !== other) {
                        this.resolveCollision(node, other);
                    }
                });
                node.translation[1] = 1;
                node.updateMatrix();
            }
            
        });
    }
    randomizeKnifeLocation(knife){
        if(knife){
            let x = Math.floor(Math.random()*4);
            if(x == 0){
                knife.translation = [3.5, 0, 14.3]
            } else if (x == 1){
                knife.translation = [7, 0, 6.5]
            } else if (x == 2){
                knife.translation = [-9.8, 0, -8.8]
            } else {
                knife.translation = [7, 1.5, -6]
            }
            knife.scale = [2, 2, 2];
            knife.rotation[0] = 2;
            knife.rotation[2] = 0;
            knife.aabb.max = [0.25, 4, 0.25];
            knife.aabb.min = [-0.25, -4, -0.25];
            knife.updateMatrix();
        }
    }
    randomizeFlashlightLocation(flashlight){
        if(flashlight){
            flashlight.translation = [0.25, 0.84, -3.75]
            flashlight.scale = [1.5, 1.5, 1.5];
            flashlight.rotation[0] = 0.8;
            flashlight.rotation[2] = 1.58;
            flashlight.aabb.max = [0.2, 1, 0.2];
            flashlight.aabb.min = [-0.2, -1, -0.2];
            flashlight.updateMatrix();
        }
    }
}


