import { mat4, vec3 } from './lib/gl-matrix-module.js';
import { WebGL } from './common/engine/WebGL.js';
import { shaders } from './shaders.js';

export class Renderer {

    constructor(gl) {
        this.gl = gl;

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        this.programs = WebGL.buildPrograms(gl, shaders);

        this.defaultTexture = WebGL.createTexture(gl, {
            width  : 1,
            height : 1,
            data   : new Uint8Array([255, 255, 255, 255])
        });
    }

    prepare(scene) {
        scene.nodes.forEach(node => {
            node.gl = {};
            if (node.mesh) {
                Object.assign(node.gl, this.createModel(node.mesh));
            }
            if (node.image) {
                node.gl.texture = this.createTexture(node.image);
            }
        });
    }
    prepareNode(node) {
        node.gl = {};
        if (node.mesh) {
            Object.assign(node.gl, this.createModel(node.mesh));
        }
        if (node.image) {
            node.gl.texture = this.createTexture(node.image);
        }
    }

    render(scene, camera, light) {
        const gl = this.gl;
        gl.clearColor(0.5, 0.62, 0.75, 0.8);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        const { program, uniforms } = this.programs.phong;
        gl.useProgram(program);

        const matrix = mat4.create();
        const matrixStack = [];

        const viewMatrix = camera.getGlobalTransform();
        mat4.invert(viewMatrix, viewMatrix);
        mat4.copy(matrix, viewMatrix);
        gl.uniformMatrix4fv(uniforms.uProjection, false, camera.projection);

        let color = vec3.clone(light.ambientColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(uniforms.uAmbientColor, color);
        color = vec3.clone(light.diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(uniforms.uDiffuseColor, color);
        color = vec3.clone(light.specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        gl.uniform3fv(uniforms.uSpecularColor, color);
        gl.uniform1f(uniforms.uShininess, light.shininess);
        gl.uniform3fv(uniforms.uLightPosition, light.position);
        gl.uniform3fv(uniforms.uLightAttenuation, light.attenuatuion);

        scene.traverse(
            node => {
                matrixStack.push(mat4.clone(matrix));
                mat4.mul(matrix, matrix, node.matrix);
                if (node.gl.vao) {
                    gl.bindVertexArray(node.gl.vao);
                    gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, node.gl.texture);
                    gl.uniform1i(uniforms.uTexture, 0);
                    gl.drawElements(gl.TRIANGLES, node.gl.indices, gl.UNSIGNED_SHORT, 0);
                }
            },
            node => {
                mat4.copy(matrix, matrixStack.pop());
            }
        );
    }

    createModel(model) {
        const gl = this.gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        const indices = model.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        return { vao, indices };
    }

    createTexture(texture) {
        const gl = this.gl;
        return WebGL.createTexture(gl, {
            image : texture,
            mip   : true,
            min   : gl.NEAREST_MIPMAP_NEAREST,
            mag   : gl.NEAREST
        });
    }

}
