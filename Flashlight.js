import { Utils } from './Utils.js';
import { Model } from './Model.js'
import { vec3 } from './lib/gl-matrix-module.js';

export class Flashlight extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);
        Utils.init(this, Flashlight.defaults, options);
    }

    setCarryTranslation() {
        this.translation = vec3.set(vec3.create(), 0.4, -0.6, -0.4);
        this.scale = vec3.set(vec3.create(), 3, 3, 3);
        this.rotation = vec3.set(vec3.create(), -1.5, 0.5, 0);
    }
    update() {
        if (this.translation[2] > -0.39)
            this.velocity[2] = -0.3;
        else
            this.velocity[2] = 0;
    }
}

Flashlight.defaults = {
    on: true
};
