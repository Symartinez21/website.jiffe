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
    100,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 20; //this plops me higher

  // Define basic scene parameters
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  // Define scene lighting
  var light = new THREE.AmbientLight(0x404040, 1);
  // light.position.set(0.5, 1, 0.75);
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
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;

      // case "ShiftLeft":
      //   if (flyMode) velocity.y = -150;
      //   break;

    }
  };


  const onKeyUp = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
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
  let floorGeometry = new THREE.PlaneGeometry(3000, 3000, 50, 100);
  floorGeometry.rotateX(-Math.PI / 2);

  const floorMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
 const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // Insert completed floor into the scene
scene.add(floor);
//first image
//load image as texture
// const texture = new THREE.TextureLoader().load('./Giraffe_model.jpg');
// const material = new THREE.MeshBasicMaterial ( {map: texture, side: THREE.DoubleSide});
// const geometry = new THREE.PlaneGeometry (25, 25);
// const plane = new THREE.Mesh (geometry, material);
// plane.position.set(0, 20, -20);
// scene.add(plane);

  var mesh;

const loader = new GLTFLoader();

  loader.load( '../assets/3DModels/scene.glb',
   function ( gltf ) {

     gltf.scene.traverse(function(child) {
       if (child.isMesh) {
         objects.push(child);
         //child.material = newMaterial;
       }
     });
     // set position and scale
     mesh = gltf.scene;
     mesh.position.set(-40, 0, 0);
     mesh.rotation.set(0, 0, 0);
     mesh.scale.set(.8, .8 , .8);
     // Add model to scene
     scene.add(mesh);

  }, undefined, function ( error ) {

  	console.error( error );

  } );


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


    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass


    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 800.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 800.0 * delta;

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
