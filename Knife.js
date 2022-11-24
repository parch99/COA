import { Utils } from './Utils.js';
import { Model } from './Model.js'
import { vec3 } from './lib/gl-matrix-module.js';

export class Knife extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);
        Utils.init(this, Knife.defaults, options);
    }

    setCarryTranslation() {
        this.translation = vec3.set(vec3.create(), 0.15, -0.1, -0.2);
        this.scale = vec3.set(vec3.create(), 1,1,1);
        this.rotation = vec3.set(vec3.create(), 1, 0, -1);
    }
}

Knife.defaults = {
    velocity: [0, 0, 0],
    stabbed: false
};
