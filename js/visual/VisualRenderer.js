/**
 * VisualRenderer.js
 * Manages Three.js scene and shader rendering.
 */

import { ShaderStore } from './ShaderStore.js';

export class VisualRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.mesh = null;
        this.startTime = 0;
        this.animationId = null;
        this.currentShaderName = 'neonRings';
        this.onShaderChanged = null; // Callback for UI
    }

    init() {
        // Setup Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Create Plane for Shader
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Initial Shader
        const shaderData = ShaderStore.neonRings;
        const uniforms = this.createUniforms(shaderData.uniforms);

        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: ShaderStore.vertex,
            fragmentShader: shaderData.fragment
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);

        // Resize handler
        window.addEventListener('resize', () => this.onResize());

        // Mouse handler
        document.addEventListener('mousemove', (e) => {
            if (this.material.uniforms.iMouse) {
                this.material.uniforms.iMouse.value.x = e.clientX;
                this.material.uniforms.iMouse.value.y = window.innerHeight - e.clientY;
            }
        });
        document.addEventListener('mousedown', (e) => {
            if (this.material.uniforms.iMouse) {
                this.material.uniforms.iMouse.value.z = 1.0;
                this.material.uniforms.iMouse.value.w = 1.0;
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (this.material.uniforms.iMouse) {
                this.material.uniforms.iMouse.value.z = 0.0;
                this.material.uniforms.iMouse.value.w = 0.0;
            }
        });

        this.startTime = Date.now();
    }

    createUniforms(shaderUniforms) {
        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
            iMouse: { value: new THREE.Vector4(0, 0, 0, 0) }
        };

        if (shaderUniforms) {
            for (const [key, config] of Object.entries(shaderUniforms)) {
                uniforms[key] = { value: config.value };
            }
        }
        return uniforms;
    }

    setShader(shaderName) {
        const shaderData = ShaderStore[shaderName];
        if (shaderData) {
            this.currentShaderName = shaderName;

            const newUniforms = this.createUniforms(shaderData.uniforms);

            this.material = new THREE.ShaderMaterial({
                uniforms: newUniforms,
                vertexShader: ShaderStore.vertex,
                fragmentShader: shaderData.fragment
            });

            this.mesh.material = this.material;
            this.material.needsUpdate = true;

            if (this.onShaderChanged) {
                this.onShaderChanged(shaderName, shaderData);
            }
        }
    }

    updateUniform(name, value) {
        if (this.material.uniforms[name]) {
            this.material.uniforms[name].value = value;
        }
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = (Date.now() - this.startTime) * 0.001;
        if (this.material.uniforms.iTime) {
            this.material.uniforms.iTime.value = time;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        if (this.material.uniforms.iResolution) {
            this.material.uniforms.iResolution.value.set(width, height, 1);
        }
    }
}
