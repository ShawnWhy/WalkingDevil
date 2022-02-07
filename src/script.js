import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {SphereGeometry, TextureLoader , CubeTextureLoader} from 'three'
import CANNON from 'cannon'
import $ from "./Jquery"
import gsap from "gsap";
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

import {createSingleSetProper} from './createSingleSet.js'
// import createSinglesetProper from './createSingleSet.js'
const textureLoader = new THREE.TextureLoader()
const raycaster = new THREE.Raycaster()
let objectsToUpdate =[]
let loader;
let reticle;
let mixer = null
let impGroup = null
let walk;
let imp = null
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

const floorTexture = textureLoader.load('/checker1.jpg')
floorTexture.repeat.set(6,6)
floorTexture.wrapT = THREE.MirroredRepeatWrapping
floorTexture.wrapS = THREE.MirroredRepeatWrapping

const floorMaterial = new THREE.MeshBasicMaterial({map:floorTexture})
floorMaterial.transparent=true;
floorMaterial.opacity=0


// .5, .25, 2
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    color:"red"
    
})
const boxMaterial3 = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  color:"orange"
  
})
const boxMaterial4 = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  color:"blue"
  
})
const boxMaterial2 = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  transparent:true,
  opacity:0
  
})

const meshfake = new THREE.Mesh(boxGeometry, boxMaterial2)
meshfake.scale.set(.8, 3, .8)
meshfake.castShadow = true
scene.add(meshfake)

const world = new CANNON.World()
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: .6,
        restitution: 0.01
    }
)

const impBlock = new CANNON.Cylinder(1,1,5,8)
const impBody = new CANNON.Body({
  mass:1,
  position: new CANNON.Vec3(0, 3, 0),
  shape:impBlock,
  material:defaultMaterial

})
impBody.mass=1
world.add(impBody)


const createBox = (width, height, depth, position) =>
{
    // Three.js mesh
    let randColor = Math.floor(Math.random()*3+1)
    let mesh
    switch(randColor){
    case 1 :
     mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    break;
    case 2 :
     mesh = new THREE.Mesh(boxGeometry, boxMaterial3)
    break;
    case 3 :
     mesh = new THREE.Mesh(boxGeometry, boxMaterial4)
    break;

    }
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: .4,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}


    init();
    animate();

    function init() {
      

      const ambientLight = new THREE.AmbientLight('#7FFFD4', .5)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight('#F5F5DC', 2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)
const directionalLight2 = new THREE.DirectionalLight('#5F9EA0', 2)
directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.set(1024, 1024)
directionalLight2.shadow.camera.far = 15
directionalLight2.shadow.camera.left = - 7
directionalLight2.shadow.camera.top = 7
directionalLight2.shadow.camera.right = 7
directionalLight2.shadow.camera.bottom = - 7
directionalLight2.position.set(5, 5, 0)
scene.add(directionalLight2)
      
    world.broadphase = new CANNON.SAPBroadphase(world)
    world.allowSleep = true
    world.gravity.set(0, - 9.82, 0)




const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.position=new CANNON.Vec3(0, -6, -10)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI *0.5

)
floorBody.addShape(floorShape)


world.addBody(floorBody)
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
floorMaterial
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -.5
scene.add(floor)
floor.position.copy(floorBody.position)






        const container = document.createElement('div');
        document.body.appendChild(container);

       

  

  
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // we have to enable the renderer for webxr
  const controller= renderer.xr.getController(0);
  scene.add(controller)
  container.appendChild(renderer.domElement);

  controller.addEventListener('select', ()=>{
    let randheight = Math.random()*2+.2
    let randwidth = Math.random()*2+.2
    let randdepth = Math.random()*2+.2

    createBox( randheight,randwidth,randdepth,new THREE.Vector3(0,0,-10).applyMatrix4(controller.matrixWorld))
  
  }
  )

 
 

  // Add a GLTF model to the scene
  
  const modelUrl = '/imp.gltf';
  
        loader = new GLTFLoader();
        loader.load(
            modelUrl,
            function (gltf) {
  

   imp=gltf.scene
 
   console.log(gltf)
    // console.log(boy)
    

   impGroup = new THREE.Group()
  
   impGroup.add(imp)
   impGroup.scale.set(.1,.1,.1)

   //  impGroup.position.x=.5;
    impGroup.position.z =-10
    impGroup.position.y =-6
    impGroup.position.x =-1.5
   
    // Animation
    mixer = new THREE.AnimationMixer(imp)
    walk = mixer.clipAction(gltf.animations[0]) 
  

    walk.timeScale=1
    
    scene.add(impGroup)
      
    walk.play()
      
            },
    )
    

  addReticleToScene()
  
  const button = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"]
  });

        document.body.appendChild(button);

        window.addEventListener('resize', onWindowResize, false);
    }





    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

let rotationPos = 0

// setInterval(() => {
//     if(nesseGroup){
//         gsap.to(nesseGroup.rotation,{duration:2,y:rotationPos+.5})
//         rotationPos+=.5
//     }
// }, 2200);

  let hitTestSource = null;
  let localSpace = null;
  let hitTestSourceInitialized = false;

  // This function gets called just once to initialize a hitTestSource
  // The purpose of this function is to get a) a hit test source and b) a reference space
  async function initializeHitTestSource() {
    const session = renderer.xr.getSession();
    
    // Reference spaces express relationships between an origin and the world.

    // For hit testing, we use the "viewer" reference space,
    // which is based on the device's pose at the time of the hit test.
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    // We're going to use the reference space of "local" for drawing things.
    // which gives us stability in terms of the environment.
    // read more here: https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace
    localSpace = await session.requestReferenceSpace("local");

    // set this to true so we don't request another hit source for the rest of the session
    hitTestSourceInitialized = true;
    
    // In case we close the AR session by hitting the button "End AR"
    session.addEventListener("end", () => {
      hitTestSourceInitialized = false;
      hitTestSource = null;
    });
  }
//add reticle to scene

function addReticleToScene(){
  
  const geometry = new THREE.RingBufferGeometry(0.15,0.2,32).rotateX(-Math.PI/2);
  const material = new THREE.MeshBasicMaterial();
  material.transparent=true;
  material.opacity=0
  reticle = new THREE.Mesh(geometry, material);
  
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}

// createBox(.5, .25, 2, { x: 0, y: 3, z: -10 })



    function animate() {
        renderer.setAnimationLoop(render);
     if(mixer)
{
}
    }

let oldElapsedTime=null;

const clock = new THREE.Clock()
let previousTime = 0

    function render(timestamp, frame) {
   const elapsedTime = clock.getElapsedTime()
const deltaTime = elapsedTime - oldElapsedTime
oldElapsedTime = elapsedTime





  
  if(frame){
    
    if(!hitTestSourceInitialized){
      initializeHitTestSource();
    }
  }
  
  if(hitTestSourceInitialized){
    const hitTestResults = frame.getHitTestResults(hitTestSource);
    // console.log(hitTestResults)
    
    if(hitTestResults.length>0){
      const hit = hitTestResults[0]
      
      const pose = hit.getPose(localSpace)
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix)
    }
    else{
      reticle.visible=false
    }
  }
  
  
       

  
 if(impGroup!=null){
  (impGroup.children[0].children[0].children[0].getWorldPosition(meshfake.position))
  impBody.position.copy(meshfake.position)
  // console.log(impGroup.children[0].children[0].children[0].getWorldPosition(meshfake.position))
  
 }

  for(const object of objectsToUpdate)
  {
      object.mesh.position.copy(object.body.position)
      object.mesh.quaternion.copy(object.body.quaternion)
  }
  

  // rotateModel();
        renderer.render(scene, camera);
  if(mixer){
          mixer.update(deltaTime)
  }

  
  world.step(1 / 60, deltaTime, 3)


    }

let degrees = 0; // the angle to rotate our model

function rotateModel() {
  if (model !== undefined) {
    // valid degrees range from 0-360
    // Once over 360 three.js will treat 360 as 0, 361 as 1, 362 as 2 and so on
    degrees = degrees + 0.2; 
    model.rotation.y = THREE.Math.degToRad(degrees); // we convert degrees to a radian value
    
    // more math utility functions can be found here:
    // https://threejs.org/docs/#api/en/math/MathUtils
  }
}