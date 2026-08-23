import { ThreeScene } from '@/three/commonClass/ThreeScene';
import {
    AdditiveBlending,
    BackSide,
    BufferAttribute,
    BufferGeometry,
    CatmullRomCurve3,
    Color,
    Group,
    IUniform,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    Points,
    PointsMaterial,
    ShaderMaterial,
    SphereGeometry,
    Sprite,
    SpriteMaterial,
    SRGBColorSpace,
    Texture,
    TorusGeometry,
    Vector3,
} from 'three';
import erVertex from '@/shaders/earthCase1/earthMaterial/vertexShader.glsl?raw';
import erFragment from '@/shaders/earthCase1/earthMaterial/fragmentShader.glsl?raw';
import airVertex from '@/shaders/earthCase1/air/vertexShader.glsl?raw';
import airFragment from '@/shaders/earthCase1/air/fragmentShader.glsl?raw';
import { Resources } from '@/three/example/EarthCase1/Resources.ts';
import labelJson from '@/three/example/EarthCase1/data/labelJson.json';
import gsap from 'gsap';

interface GeoPoint {
    E: number;
    N: number;
    name: string;
}

interface EarthUniforms extends Record<string, IUniform> {
    glowColor: { value: Color };
    map: { value: Texture | null };
    time: { value: number };
}

const CYAN = 0x1ee8ff;
const ELECTRIC_BLUE = 0x4d67ff;

export class EarthCase1 extends ThreeScene {
    private readonly radius = 30;
    private readonly rootGroup = new Group();
    private readonly earthGroup = new Group();
    private readonly orbitGroup = new Group();
    private readonly uniforms: EarthUniforms = {
        glowColor: { value: new Color(CYAN) },
        map: { value: null },
        time: { value: 0 },
    };
    private resources: Resources | undefined;
    private stars: Points | undefined;
    private markerPulse: Points | undefined;
    private pulsePoints: Points | undefined;
    private pulseCurves: CatmullRomCurve3[] = [];
    private pulseOffsets: number[] = [];

    constructor(dom: HTMLDivElement) {
        super(dom);
        this.scene.background = new Color(0x01030b);
        this.camera.position.set(0, 10, this.getCameraDistance());
        this.camera.fov = 42;
        this.camera.near = 0.1;
        this.camera.far = 1200;
        this.camera.updateProjectionMatrix();
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.045;
        this.configureControlDistance();
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.18;
        this.rootGroup.scale.setScalar(0.001);
        this.earthGroup.rotation.z = -0.12;
    }

    public init() {
        this.resources = new Resources(() => {
            if (this.isDisposed) return;
            this.configureTextures();
            this.createEarth();
            this.createAtmosphere();
            this.createCoordinateGrid();
            this.createDataNetwork();
            this.createOrbitRings();
            this.createStarField();
            this.createEarthGlow();
            this.show();
        });
        this.registerCleanup(() => this.resources?.dispose());
    }

    private configureTextures() {
        const textures = this.resources!.textures;
        textures.earth.colorSpace = SRGBColorSpace;
        textures.earth.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    }

    private createEarth() {
        this.uniforms.map.value = this.resources!.textures.earth;
        const material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: erVertex,
            fragmentShader: erFragment,
        });
        const earth = new Mesh(new SphereGeometry(this.radius, 72, 48), material);
        earth.name = 'earth';
        this.earthGroup.add(earth);
        this.rootGroup.add(this.earthGroup, this.orbitGroup);
    }

    private createAtmosphere() {
        const material = new ShaderMaterial({
            uniforms: {
                coeficient: { value: 0.28 },
                power: { value: 2.6 },
                glowColor: { value: new Color(CYAN) },
            },
            vertexShader: airVertex,
            fragmentShader: airFragment,
            blending: AdditiveBlending,
            transparent: true,
            depthWrite: false,
            side: BackSide,
        });
        const atmosphere = new Mesh(new SphereGeometry(this.radius * 1.075, 56, 40), material);
        this.earthGroup.add(atmosphere);
    }

    private createCoordinateGrid() {
        const positions: number[] = [];
        const addSegment = (a: Vector3, b: Vector3) => positions.push(a.x, a.y, a.z, b.x, b.y, b.z);

        for (let latitude = -60; latitude <= 60; latitude += 15) {
            let previous = this.geoToVector(latitude, -180, this.radius * 1.008);
            for (let longitude = -176; longitude <= 180; longitude += 4) {
                const current = this.geoToVector(latitude, longitude, this.radius * 1.008);
                addSegment(previous, current);
                previous = current;
            }
        }
        for (let longitude = -165; longitude < 180; longitude += 15) {
            let previous = this.geoToVector(-88, longitude, this.radius * 1.008);
            for (let latitude = -84; latitude <= 88; latitude += 4) {
                const current = this.geoToVector(latitude, longitude, this.radius * 1.008);
                addSegment(previous, current);
                previous = current;
            }
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        const material = new LineBasicMaterial({
            color: CYAN,
            transparent: true,
            opacity: 0.09,
            blending: AdditiveBlending,
            depthWrite: false,
        });
        this.earthGroup.add(new LineSegments(geometry, material));
    }

    private createDataNetwork() {
        const links: Array<{ end: GeoPoint; start: GeoPoint }> = [];
        labelJson.forEach((route) => {
            route.endArray.forEach((end) => links.push({ start: route.startArray, end }));
        });

        const linePositions: number[] = [];
        const markerPositions: number[] = [];
        const markerKeys = new Set<string>();
        this.pulseCurves = links.map(({ start, end }, index) => {
            const startPosition = this.geoToVector(start.N, start.E, this.radius * 1.015);
            const endPosition = this.geoToVector(end.N, end.E, this.radius * 1.015);
            const middle = startPosition.clone().add(endPosition).normalize();
            const distance = startPosition.distanceTo(endPosition);
            middle.multiplyScalar(this.radius + Math.min(18, 5 + distance * 0.16));
            const curve = new CatmullRomCurve3([startPosition, middle, endPosition]);
            const points = curve.getPoints(48);
            for (let i = 0; i < points.length - 1; i++) {
                const a = points[i];
                const b = points[i + 1];
                linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
            this.pulseOffsets.push(index / links.length);
            [start, end].forEach((point) => {
                const key = `${point.N}:${point.E}`;
                if (markerKeys.has(key)) return;
                markerKeys.add(key);
                const position = this.geoToVector(point.N, point.E, this.radius * 1.035);
                markerPositions.push(position.x, position.y, position.z);
            });
            return curve;
        });

        const linkGeometry = new BufferGeometry();
        linkGeometry.setAttribute('position', new BufferAttribute(new Float32Array(linePositions), 3));
        const linkMaterial = new LineBasicMaterial({
            color: CYAN,
            transparent: true,
            opacity: 0.52,
            blending: AdditiveBlending,
            depthWrite: false,
        });
        this.earthGroup.add(new LineSegments(linkGeometry, linkMaterial));

        const markerGeometry = new BufferGeometry();
        markerGeometry.setAttribute('position', new BufferAttribute(new Float32Array(markerPositions), 3));
        const markerMaterial = new PointsMaterial({
            map: this.resources!.textures.redCircle,
            color: CYAN,
            size: 4.6,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.78,
            blending: AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.02,
        });
        this.markerPulse = new Points(markerGeometry, markerMaterial);
        this.earthGroup.add(this.markerPulse);

        const pulseGeometry = new BufferGeometry();
        pulseGeometry.setAttribute('position', new BufferAttribute(new Float32Array(this.pulseCurves.length * 3), 3));
        const pulseMaterial = new PointsMaterial({
            map: this.resources!.textures.gradient,
            color: 0xb6fbff,
            size: 2.4,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.03,
        });
        this.pulsePoints = new Points(pulseGeometry, pulseMaterial);
        this.earthGroup.add(this.pulsePoints);
    }

    private createOrbitRings() {
        const configurations = [
            { radius: 41.5, rotation: [Math.PI / 2.7, 0.1, 0.35], color: CYAN },
            { radius: 45, rotation: [Math.PI / 2.15, -0.3, -0.45], color: ELECTRIC_BLUE },
            { radius: 48.5, rotation: [Math.PI / 1.85, 0.4, 0.72], color: CYAN },
        ] as const;

        configurations.forEach(({ radius, rotation, color }) => {
            const material = new ShaderMaterial({
                uniforms: { color: { value: new Color(color) }, time: this.uniforms.time },
                vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float time;
                    varying vec3 vPosition;
                    void main() {
                        float angle = atan(vPosition.y, vPosition.x);
                        float dash = smoothstep(0.2, 0.85, sin(angle * 18.0 - time * 2.4));
                        gl_FragColor = vec4(color, 0.18 + dash * 0.58);
                    }
                `,
                transparent: true,
                blending: AdditiveBlending,
                depthWrite: false,
            });
            const ring = new Mesh(new TorusGeometry(radius, 0.075, 4, 160), material);
            ring.rotation.set(rotation[0], rotation[1], rotation[2]);
            this.orbitGroup.add(ring);
        });
    }

    private createStarField() {
        const positions = new Float32Array(900 * 3);
        for (let i = 0; i < 900; i++) {
            const direction = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            direction.multiplyScalar(145 + Math.random() * 440);
            positions.set([direction.x, direction.y, direction.z], i * 3);
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        const material = new PointsMaterial({
            map: this.resources!.textures.gradient,
            color: 0x789eff,
            size: 1.7,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.76,
            blending: AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.03,
        });
        this.stars = new Points(geometry, material);
        this.rootGroup.add(this.stars);
    }

    private createEarthGlow() {
        const material = new SpriteMaterial({
            map: this.resources!.textures.glow,
            color: 0x1b63d9,
            transparent: true,
            opacity: 0.48,
            blending: AdditiveBlending,
            depthWrite: false,
        });
        const sprite = new Sprite(material);
        sprite.scale.setScalar(this.radius * 3.25);
        this.earthGroup.add(sprite);
    }

    private geoToVector(latitude: number, longitude: number, radius: number) {
        const phi = ((90 - latitude) * Math.PI) / 180;
        const theta = ((longitude + 180) * Math.PI) / 180;
        return new Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }

    private getCameraDistance() {
        return this.viewSize.width / this.viewSize.height < 0.75 ? 176 : 112;
    }

    private configureControlDistance() {
        const narrowViewport = this.viewSize.width / this.viewSize.height < 0.75;
        this.controls.minDistance = narrowViewport ? 132 : 72;
        this.controls.maxDistance = narrowViewport ? 260 : 180;
    }

    private show() {
        this.scene.add(this.rootGroup);
        gsap.to(this.rootGroup.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.8,
            ease: 'power3.out',
        });
    }

    protected update(delta: number, elapsed: number) {
        this.uniforms.time.value = elapsed;
        this.earthGroup.rotation.y += delta * 0.075;
        this.orbitGroup.rotation.y -= delta * 0.045;
        this.orbitGroup.rotation.z = Math.sin(elapsed * 0.18) * 0.08;
        if (this.stars) this.stars.rotation.y += delta * 0.004;
        if (this.markerPulse) {
            const material = this.markerPulse.material as PointsMaterial;
            material.opacity = 0.55 + Math.sin(elapsed * 2.8) * 0.2;
            material.size = 4.4 + Math.sin(elapsed * 2.8) * 0.65;
        }
        if (this.pulsePoints) {
            const positions = this.pulsePoints.geometry.getAttribute('position') as BufferAttribute;
            this.pulseCurves.forEach((curve, index) => {
                const point = curve.getPoint((elapsed * 0.085 + this.pulseOffsets[index]) % 1);
                positions.setXYZ(index, point.x, point.y, point.z);
            });
            positions.needsUpdate = true;
        }
    }

    protected onResize() {
        this.camera.position.setLength(this.getCameraDistance());
        this.configureControlDistance();
    }

    public dispose() {
        gsap.killTweensOf(this.rootGroup.scale);
        this.pulseCurves = [];
        this.pulseOffsets = [];
        super.dispose();
    }
}
