import { vec3, mat4 } from './lib/gl-matrix-module.js';
import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Physics } from './Physics.js'

let running_and_breathing = new Audio('../../common/audio/running_and_breathingBoosted.opus');
let running_and_breathingSpeedUp = new Audio('../../common/audio/running_and_breathingSpeedUp1.opus');

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        //this.translation[1] = 5;
        this.keys = {};
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
        
        // 1: add movement acceleration
        const acc = vec3.create();
        this.maxSpeed = 3.5;
        if (this.keys['KeyW']) {
            if(this.keys['ShiftLeft'] && !this.tired){
                c.maxSpeed = c.maxSpeed + 2;
                vec3.add(acc, acc, forward);
                running_and_breathing.pause();
                running_and_breathingSpeedUp.volume = 1;
                running_and_breathingSpeedUp.play();
            } else {
                running_and_breathingSpeedUp.pause()
                running_and_breathing.volume = 0.6;
                running_and_breathing.play();
                vec3.add(acc, acc, forward);
            }
        }
        if (this.keys['KeyS']) {
            if(this.keys['ShiftLeft'] && !c.tired){
                c.maxSpeed = c.maxSpeed + 2;
                vec3.sub(acc, acc, forward);
            } else {
                vec3.sub(acc, acc, forward);
            }
        }
        if (this.keys['KeyD']) {
            if(this.keys['ShiftLeft'] && !c.tired){
                c.maxSpeed = c.maxSpeed + 2;
                vec3.add(acc, acc, right);
            } else {
                vec3.add(acc, acc, right);
            }
        }
        if (this.keys['KeyA']) {
            if(this.keys['ShiftLeft'] && !c.tired){
                c.maxSpeed = c.maxSpeed + 2;
                vec3.sub(acc, acc, right);
            } else {
                vec3.sub(acc, acc, right);
            }
        }
        // Run
        if (c.stamina <= 0) {
            c.tired = true;
            c.stamina = 0;
        } else if (c.stamina >= 0) {
            c.tired = false;
        }

        if (this.keys['ShiftLeft']) {
            if (this.tired === false && this.stamina>=0) this.stamina = this.stamina - 1.5;
                
        }else{
            if(this.tired === true || this.stamina<=400) this.stamina = this.stamina + 1.25;
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyD'] && !this.keys['KeyA']/*  && !this.keys['ShiftLeft']*/){  
            running_and_breathing.volume = 0.4;
            running_and_breathingSpeedUp.volume = 0.6;
            setTimeout(function() {
                running_and_breathing.pause();
                running_and_breathingSpeedUp.pause();
            }, 800);
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        if (this.keys['KeyE'] ) {
            if (this.flashlight){
                this.getFlashlight(this.flashlight);
            }
        }

        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable() {
        document.addEventListener('pointermove', this.pointermoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.pointerSensitivity;
        c.rotation[1] -= dx * c.pointerSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }
    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    getFlashlight(flashlight) {
        const c = this;
        this.hasFlashlight = true;
        c.addChild(flashlight);
        flashlight.setCarryTranslation();
        flashlight.updateMatrix();
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    pointerSensitivity : 0.002,
    maxSpeed         : 3.5,
    friction         : 0.2,
    acceleration     : 25,
    tired            : false,
    stamina          : 400
};
