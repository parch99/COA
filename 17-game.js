import { Application } from './common/engine/Application.js';

import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';
import { start_timer } from './Timer.js';
import { Flashlight } from './Flashlight.js';
import { Knife } from './Knife.js';
import { Light } from './Light.js';

import { ObjectBuilder } from './ObjectBuilder.js';

class App extends Application {
    
    async start() {
        const gl = this.gl;
        APP = this;
        this.renderer = new Renderer(gl);
        this.time = performance.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.item = 0;
        await this.load('scene.json');

        this.light = new Light();
        
        this.display();
        
        this.canvas.addEventListener('click', e => this.canvas.requestPointerLock());
        document.addEventListener('pointerlockchange', e => {
            if (document.pointerLockElement === this.canvas) {
                this.camera.enable();
            } else {
                this.camera.disable();
            }
        });
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.ObjectBuilder = await new ObjectBuilder().init(scene, this.scene, this.renderer);
        this.camera = null;
        
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
                //this.spawn(node); //random spawn
            }
        });
        this.scene.camera = this.camera;
        this.camera.aspect = this.aspect;
        this.camera.APP = this;
        this.camera.updateProjection();

        this.physics = new Physics(this.scene);
        this.renderer.prepare(this.scene);

        this.ObjectBuilder.createModel("Flashlight");
        this.ObjectBuilder.createModel("Knife");
    }

    display() {
        var D = document.getElementById("div1");
        D.style.display = "block";
    }

    spawn(player){
        let x = Math.floor(Math.random() * 18);
        let z = Math.floor(Math.random() * 18);
        let a = Math.floor(Math.random()*2);
        let b = Math.floor(Math.random()*2);
        if(a < 0.5) z = -z;
        if (b > 0.5) x = -x;
        player.translation[0] = x;
        player.translation[2] = z;
    }
    update() {
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;
        this.camera.update(dt);
        this.physics.update(dt);
    }

    render() {
        this.renderer.render(this.scene, this.camera, this.light);
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
    play_soundtrack() {
        const soundtrack = new Audio("../../common/audio/soundtrack.opus");
        soundtrack.volume = 0.1;
        soundtrack.loop = true;
        soundtrack.play();
    }

}


const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
canvas.addEventListener('click', e => startTimer());    

function startTimer() {
    start_timer();
    app.play_soundtrack();
 }
