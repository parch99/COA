import { Node } from './Node.js';

export class Light extends Node {

    constructor() {
        super();

        Object.assign(this, {
            position         : [2, 7, 2],
            ambientColor     : [30, 30, 30],
            diffuseColor     : [204, 204, 204],
            specularColor    : [255, 255, 255],
            shininess        : 40,
            attenuatuion     : [1.0, 0, 0.02]
        });
    }

}