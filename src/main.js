import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

import maxresdefault from './assets/images/maxresdefault.jpg';
import mamcube from './assets/images/mamcube.png';

const folderUrl = new URL('./assets/folder.glb', import.meta.url);


// allocates space on webpage for the renderer
const renderer = new THREE.WebGLRenderer();

// enables shadow rendering
renderer.shadowMap.enabled = true;

// sets the size of the renderer to the full size of the window
renderer.setSize(window.innerWidth, window.innerHeight);

// appends the renderer to the body of the HTML document
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// field of view, aspect ratio, near and far clipping plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(0, 2, 5);
orbit.update();

// create a cube: geometry + material = mesh
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x8A2BE2 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// create a plane
const planeGeometry = new THREE.PlaneGeometry(30, 30); //can add more segments for more detail
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow=true;

// create a grid helper: size, divisions
const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

// create a sphere, add mesh (different materials allowed)
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, wireframe: false });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow=true;

// create lighting: ambient, directional, spotlight
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow=true;
// directionalLight.shadow.camera.bottom=-12;

// // create helper to show the direction of the light (directionalLight, size)
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight,5);
// scene.add(dLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xFFFFFF, 100000);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2; // angle of the spotlight small angle = sharper
scene.add(spotLight); // make sure to add this line so you dont scream for 1 hour about why you cant see the spotlight

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// create fog
const fog = new THREE.FogExp2(0xFFFFFF, 0.015);
scene.fog = fog;

// add background texture
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(maxresdefault);

// add background cube texture
// const cubeTextureLoader = new THREE.CubeTextureLoader();
// scene.background = cubeTextureLoader.load([
//     mamcube,
//     mamcube,
//     mamcube,
//     mamcube,
//     mamcube,
//     mamcube
// ]); // tip: images should be 1:1 ratio

// create awesome evil textured cube
const geometry2 = new THREE.BoxGeometry(4,4,4);
const material2 = new THREE.MeshStandardMaterial({ color: 0xEE0000, map: textureLoader.load(mamcube)});
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);
cube2.position.set(8,2,0);

// create stupid good textured cube
const geometry3 = new THREE.BoxGeometry(4,4,4);
const material3 = new THREE.MeshStandardMaterial({ color: 0x00FF00, map: textureLoader.load(mamcube)});
const cube3 = new THREE.Mesh(geometry3, material3);
scene.add(cube3);
cube3.position.set(0,2,-5);

// create custom 3d model of folder i defs dont have plans for (credits in readme)
let folderModel;
const assetLoader = new GLTFLoader();
assetLoader.load(folderUrl.href, function(gltf) {
    folderModel = gltf.scene;
    scene.add(folderModel);
    folderModel.position.set(5,0,5);
    folderModel.scale.set(3,3,3);
}, undefined, function(error) {console.error(error);});

// create GUI to control sphere colors, wireframe, and speed + spotlight properties
const gui = new dat.GUI();
const options = {
    sphereColor: '#FF0000',
    wireframe: false,
    speed: 0.02,
    // spotlight
    angle: 0.2,
    penumbra: 0, // feathering 
    intensity: 100000
}
gui.addColor(options, 'sphereColor').onChange(function(e) {
    sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function(e) {
    sphere.material.wireframe = e;
});

gui.add(options, 'speed', 0, 0.1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 50000, 100000);

let step = 0;

const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;

    // make the cube rotate based on mouse position
    cube2.lookAt(mousePosition.x, mousePosition.y, mousePosition.z);
    folderModel.lookAt(mousePosition.x, mousePosition.y, mousePosition.z);

});

const rayCaster = new THREE.Raycaster();
const sphereId = sphere.id;
const cube3Id = cube3.id; 

// animation loop for cube
function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity; 
    sLightHelper.update();


    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    console.log(intersects);

    for(let i=0; i<intersects.length; i++) {
        if(intersects[i].object.id === sphereId) {
            intersects[i].object.material.color.set(0x0000FF);
        }
        if(intersects[i].object.id === cube3Id) {
            intersects[i].object.rotation.x += 0.01;
            intersects[i].object.rotation.y += 0.01;
        }
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// makes sure the scene resizes based on window size
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
} );