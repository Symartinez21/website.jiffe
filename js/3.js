
// 3.js
// A three.js scene which uses basic shapes to generate a scene which can be traversed with basic WASD and mouse controls, this scene is full screen with an overlay.

// Import required source code
// Import three.js core
import * as THREE from "./three.module.js";

// Import pointer lock controls
import { PointerLockControls } from "./PointerLockControls.js";

import { GLTFLoader } from './GLTFLoader.js';


// Establish client
let camera, scene, renderer, controls;

let objects = [];
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let flyMode = false;

let lastSpacePressTime = 0;


let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

// Initialization and animation function calls
init();
animate();

// Initialize the scene
function init() {
  // Establish the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 50; //this plops me higher

  // Define basic scene parameters
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4169E1);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  // Define scene lighting
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  // Define controls
  controls = new PointerLockControls(camera, document.body);

  // Identify the html divs for the overlays
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  // Listen for clicks and respond by removing overlays and starting mouse look controls
  // Listen
  instructions.addEventListener("click", function() {
    controls.lock();
  });
  // Remove overlays and begin controls on click
  controls.addEventListener("lock", function() {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });
  // Restore overlays and stop controls on esc
  controls.addEventListener("unlock", function() {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
  // Add controls to scene
  scene.add(controls.getObject());

  console.log('If you found this text you\'re a nerd *<:o(')
  const makeFunOfArrowKeys = function() {
    console.log('I can\'t believe you used the arrow keys you noob');
  };

  // Define key controls for WASD controls
  const onKeyDown = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true && !flyMode) velocity.y = 350;
        if (flyMode) velocity.y = 150;
        canJump = false;
        break;

      case "ShiftLeft":
        if (flyMode) velocity.y = -150;
        break;

    }
  };


  const onKeyUp = function(event) {
    switch (event.code) {
      case "ArrowUp": makeFunOfArrowKeys();
      case "KeyW":
        moveForward = false;
        break;
      case "ArrowLeft": makeFunOfArrowKeys();
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown": makeFunOfArrowKeys();
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight": makeFunOfArrowKeys();
      case "KeyD":
        moveRight = false;
        break;

      case "Space":
        // if the last time space was pressed wasn't too long ago.
        const timeNow = performance.now();
        const maxTimePassed = 500;  // 500 ms or 1/2 a second
        if (timeNow - lastSpacePressTime < maxTimePassed) {
          console.log('Double press!!!');
          // Toggle flyMode between true and false
          flyMode = !flyMode;
          console.log('flyMode: ' + (flyMode ? 'ON' : 'OFF'));
          velocity.y = 0;
        }
        lastSpacePressTime = timeNow;

        // Stop flying up (if in flyMode) when space is released
        if (flyMode) velocity.y = 0;
        break;

      case "ShiftLeft":
        if (flyMode) velocity.y = 0;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Add raycasting for mouse controls
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // Generate the ground
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);

  // const floorMaterial = new THREE.MeshBasicMaterial({color: 0x4281f5});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  // Insert completed floor into the scene
  scene.add(floor);

var skyGeo = new THREE.SphereGeometry(100000, 25, 25);

const loader = new THREE.TextureLoader(), new GLTFLoader();
    texture = loader.load( "./assets/images/skydome.jpg" );

var material = new THREE.MeshPhongMaterial({
    map: texture,
       });
var sky = new THREE.Mesh(skyGeo, material);
    sky.material.side = THREE.BackSide;
    scene.add(sky);

  var mesh;

//const loader = new GLTFLoader();

  loader.load( './assets/Jiffe.glb',
   function ( gltf ) {

     gltf.scene.traverse(function(child) {
       if (child.isMesh) {
         objects.push(child);
         //child.material = newMaterial;
       }
     });
     // set position and scale
     mesh = gltf.scene;
     mesh.position.set(0, 0, 0);
     mesh.rotation.set(0, 0, 0);
     mesh.scale.set(1, 1 , 1);
     // Add model to scene
     scene.add(mesh);

  }, undefined, function ( error ) {

  	console.error( error );

  } );
  //
  // const loader2 = new GLTFLoader();
  // loader.load( './assets/clouds.glb',
  //   function(gltf) {
  //     // Scan loaded model for mesh and apply defined material if mesh is present
  //     gltf.scene.traverse(function(child) {
  //       if (child.isMesh2) {
  //         //child.material = newMaterial;
  //       }
  //     });
  //     // set position and scale
  //     mesh2 = gltf.scene;
  //     mesh2.position.set(1, 10, 0);
  //     mesh2.rotation.set(0, 0, 0);
  //     mesh2.scale.set(10, 10, 10);
  //     // Add model to scene
  //     scene.add(mesh2);
  //   },
  //   undefined,
  //   function(error) {
  //     console.error(error);
  //   }
  // );
  //

  // Define Rendered and html document placement
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Listen for window resizing
  window.addEventListener("resize", onWindowResize);
}

// Window resizing function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// // Animation function
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  // Check for controls being activated (locked) and animate scene according to controls
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    //raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, true);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if (!flyMode) {
      // Turn on gravity
      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    }

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }


  prevTime = time;

  renderer.render(scene, camera);
}
