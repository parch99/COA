import { Utils } from './Utils.js';
import { Model } from './Model.js'
import { vec3 } from './lib/gl-matrix-module.js';

export class Flashlight extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);
        Utils.init(this, Flashlight.defaults, options);
    }

    setCarryTranslation() {
        this.translation = vec3.set(vec3.create(), -0.1, -0.5, -0.2);//-0.2
        this.scale = vec3.set(vec3.create(), 1.75, 1.75, 1.75);
        this.rotation = vec3.set(vec3.create(), -1.55, 0.5, -1);
    }
}

Flashlight.defaults = {
    on: true
};
