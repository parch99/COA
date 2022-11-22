import { vec3, mat4 } from './lib/gl-matrix-module.js';
import { count, check } from './TImer.js'
import { Flashlight } from './Flashlight.js'


let door_open = new Audio('../../common/audio/door_open.mp3');
let door_close = new Audio('../../common/audio/door_close.mp3');
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
                if (!(node instanceof Flashlight)) {
                    this.scene.traverse(other => {
                        if (node !== other && !(other instanceof Flashlight && node.hasFlashlight)) {
                            this.resolveCollision(node, other);
                            this.check2(node);
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
            a.flashlight = b;
            return;
        }
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);
        
        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding) {
            return;
        }
        

        if( b.aabb.max[0] == 0.1 ) { //coins
            count();
            b.translation[1] = -4;
            b.updateMatrix();
        }
        if( b.aabb.max[0] == 0.4 ) { //officer
            check();
            b.updateMatrix();
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

    check2(a){
        this.scene.traverse(b => {
            if(b.aabb.max[0] == 0.7){
                if(this.checkDistance(a,b)){
                    door_open.volume = 0.5;
                    door_open.play();
                    b.translation[0] = -1.75;
                    b.updateMatrix();
                    setTimeout(function() {
                        door_close.volume = 0.3;
                        door_close.play();
                        b.translation[0] = 0;
                        b.updateMatrix();
                    }, 5000);
                };
            }
        });
    }
//OPEN DOOR WHEN ALL 10 COINS ARE COLLECTED
    check3(a){
        this.scene.traverse(b => {
            if(b.aabb.max[0] == 0.75){
                if(this.checkDistance(a,b) && check() === true){
                    door_open.volume = 0.5;
                    door_open.play();
                    b.translation[0] = -1.75;
                    b.updateMatrix();
                };
            }
        });
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
            if(node.aabb.max[0] == 0.1){
                let x = Math.floor(Math.random()*18);
                let z = Math.floor(Math.random()*18);
                let a = Math.floor(Math.random()*2);
                let b = Math.floor(Math.random()*2);
                if(a < 0.5) z = -z;
                if (b > 0.5) x = -x;
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
}


