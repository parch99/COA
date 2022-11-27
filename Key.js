import { Utils } from './Utils.js';
import { Model } from './Model.js'
import { vec3 } from './lib/gl-matrix-module.js';

export class Key extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);
        Utils.init(this, Key.defaults, options);
    }

    setHoldTranslation() {
        this.translation = vec3.set(vec3.create(), 0.3, -0.14, -0.2);
        this.scale = vec3.set(vec3.create(), 0.01,0.01,0.01);
        this.rotation = [0.7, 0, 0]
    }
}

Key.defaults = {
};
