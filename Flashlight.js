import { Utils } from './Utils.js';
import { Model } from './Model.js'
import { vec3 } from './lib/gl-matrix-module.js';

export class Flashlight extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);
        Utils.init(this, Flashlight.defaults, options);
    }

    setCarryTranslation() {
        this.translation = vec3.set(vec3.create(), 0.5, -0.5, -0.2);
        this.scale = vec3.set(vec3.create(), 3, 3, 3);
        this.rotation = vec3.set(vec3.create(), -1.6, 0.5, 0);
    }
}

Flashlight.defaults = {
    on: true
};
