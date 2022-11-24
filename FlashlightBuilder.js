import { Flashlight } from './Flashlight.js';
import { Knife } from './Knife.js';
import { Mesh } from './Mesh.js';
export class FlashlightBuilder {

    async init(sceneMap, scene, renderer) {
        this.sceneMap = sceneMap;
        this.scene = scene;
        this.renderer = renderer;

        await this.loadModel();
        return this;
    }

    async loadModel() {
        this.flashlightModel = await this.loadJson('../../common/models/flash.json');
        this.knifeModel = await this.loadJson('../../common/models/knife.json');
    }

    createModel(type) {
        switch (type) {
            case 'Flashlight': {
                const mesh = new Mesh(this.sceneMap.meshes[15]);
                const texture = this.sceneMap.textures[4];
                const model = new Flashlight(mesh, texture, this.flashlightModel);
                this.scene.addNode(model);
                this.renderer.prepareNode(model);
                return;
            }
            case 'Knife': {
                const mesh = new Mesh(this.sceneMap.meshes[18]);
                const texture = this.sceneMap.textures[18];
                const model = new Knife(mesh, texture, this.knifeModel);
                this.scene.addNode(model);
                this.renderer.prepareNode(model);
                return;
            }
            default: return null;
        }
    }

    async loadJson(uri) {
        const response = await fetch(uri);
        return await response.json();
    }
}
