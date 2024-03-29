import { vec3, mat4 } from './lib/gl-matrix-module.js';
import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Physics } from './Physics.js'

let running_and_breathing = new Audio('../../common/audio/running_and_breathingBoosted.opus');
let running_and_breathingSpeedUp = new Audio('../../common/audio/running_and_breathingSpeedUp1.opus');
let pick_knife = new Audio('../../common/audio/pick_knife.mp3');
let pick_flashlight = new Audio('../../common/audio/pick_flashlight.mp3');

let active = false;

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        this.projection = mat4.create();
        this.updateProjection();
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.mousedown = this.onMouseDown.bind(this);
        //this.translation[1] = 14
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
            if (APP.item == 1 && this.flashlight){
                this.getFlashlight(this.flashlight);
            } else if (APP.item == 2 && this.knife){
                this.getKnife(this.knife);
            } else if (APP.item == 3 && this.key){
                this.getKey(this.key);
            }

        }
        if(this.hasKnife && active){
            active = false;
            this.knife.stabbed = true;
            c.knife.stab();
        } else if (this.hasKnife){
            this.knife.stabbed = false;
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
        document.addEventListener("contextmenu", function(e) {
                e.preventDefault();
        });
        document.addEventListener("mousedown", this.onMouseDown);
    }

    disable() {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('mousedown', this.onMouseDown);
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
    onMouseDown(e){
        if (e.which === 3 || e.button === 2){//IE, Opera e.button === 2
            active = true;
        }
    }
    getFlashlight(flashlight) {
        const c = this;
        this.hasFlashlight = true;
        c.addChild(flashlight);
        flashlight.setCarryTranslation();
        flashlight.updateMatrix();
        pick_flashlight.volume = 0.8;
        pick_flashlight.play();
    }
    getKnife(knife) {
        const c = this;
        this.hasKnife = true;
        c.addChild(knife);
        knife.setCarryTranslation();
        knife.updateMatrix();
        pick_knife.volume = 0.8;
        pick_knife.play();
    }
    getKey(key) {
        const c = this;
        this.hasKey = true;
        c.addChild(key);
        key.setHoldTranslation();
        key.updateMatrix();
        pick_flashlight.volume = 0.8;
        pick_flashlight.play();
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
