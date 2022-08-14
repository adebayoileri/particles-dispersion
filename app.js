import * as THREE from "three";
import fragmentShader from "./shaders/frament.glsl";
import vertexShader from "./shaders/vertex.glsl";
// let OrbitControls = require('three-orbit-controls')(THREE)
// init
import * as dat from 'dat.gui'
import gsap from 'gsap'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import mask from "./img/particle_mask.jpg";
import us from "./img/us.webp";
import apex from "./img/apex.jpeg";
import loba from "./img/loba.jpeg";

export default class Sketch {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setAnimationLoop(animation);
    document.getElementById("container").appendChild(this.renderer.domElement);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.enableDamping = true
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.point = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(mask),
      new THREE.TextureLoader().load(us),
      new THREE.TextureLoader().load(apex),
      new THREE.TextureLoader().load(loba),

    ];
    this.time = 0;
    this.move = 0;

    this.addMesh();

    this.mouseEffect();
    this.settings()

    this.render();
  }

  render() {
    this.time++;
    let next = Math.floor(this.move + 40)%2;
    let prev = (Math.floor(this.move)+ 1 + 40)%2;

    this.material.uniforms.t1.value = this.textures[prev];
    this.material.uniforms.t3.value = this.textures[next+1];

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.point;
    this.material.uniforms.transition.value = this.settings.progress;



    window.requestAnimationFrame(this.render.bind(this));

    this.renderer.render(this.scene, this.camera);
  }
  mouseEffect() {
    this.test = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshBasicMaterial()
    );

    const startEffect = (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration:1,
        value: 1,
        ease: "elastic.out(1,0.3)"
      })
    }

    const endEffect =  (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        value: 0,
        ease: "elastic.out(1,0.3)"
      })
    }

    window.addEventListener("mousedown",startEffect );
    window.addEventListener("touchstart",startEffect );


    window.addEventListener("mouseup", endEffect);
    window.addEventListener("touchend",startEffect );



    window.addEventListener("mousewheel", (e) => {
      this.move += e.wheelDeltaY / 4000;
    });

    window.addEventListener(
      "mousemove",
      (e) => {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.pointer, this.camera);

        // calculate objects intersecting the picking ray
        let intersects = this.raycaster.intersectObjects([this.test]);
        console.log(intersects[0].point);
        this.point.x = intersects[0].point.x;
        this.point.y = intersects[0].point.y;
      },
      false
    );
  }

  addMesh() {
    let number = 512 * 512;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
    this.coordinates = new THREE.BufferAttribute(
      new Float32Array(number * 3),
      3
    );
    this.speeds = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.press = new THREE.BufferAttribute(new Float32Array(number), 1);



    function rand(a, b) {
      return a + (b - a) * Math.random();
    }

    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
        this.coordinates.setXYZ(index, i, j, 0);

        this.offset.setX(index, rand(-1000, 1000));
        this.speeds.setX(index, rand(0.4, 1));
        this.direction.setX(index, Math.random()>0.5?1:-1);
        this.press.setX(index, rand(0.4, 1));


        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.geometry.setAttribute("aSpeed", this.speeds);
    this.geometry.setAttribute("aOffset", this.offset);
    this.geometry.setAttribute("aDirection", this.direction);
    this.geometry.setAttribute("aPress", this.press);


    this.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        progress: { type: "f", value: 0 },
        t1: { type: "t", value: this.textures[2] },
        t2: { type: "t", value: this.textures[1] },
        t3: { type: "t", value: this.textures[3] },
        mask: { type: "t", value: this.textures[0] },
        time: { type: "f", value: 0 },
        move: { type: "f", value: 0 },
        mouse: { type: "f", value: null },
        mousePressed: { type: "f", value: 0 },
        transition: { type: "f", value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  settings(){
    let that = this;
    this.settings = {
      progress: 1
    }
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress').min(0).max(1).step(0.01);
  }
}

new Sketch();

// animation
