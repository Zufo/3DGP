// Based on Anssi Gröhn's example code
// Modified by Juho-Pekka Pirskanen

// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width / height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = []

var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var custParticleSystem = null;
// for easier conversion
function colorToVec4(color) {
    var res = new THREE.Vector4(color.r, color.g, color.b, color.a);
    return res;
}
function colorToVec3(color) {
    var res = new THREE.Vector3(color.r, color.g, color.b);
    return res;
}


//let's create the bonfire by using somewhat similiar way as in the waving hand
function bonfire(){
		bonfire = new THREE.Object3D();
        bonfire.position.y = 0.35;
        bonfire.position.x = 0.2;

        base = wood1 = new THREE.Mesh(new THREE.CubeGeometry(0.3,0.3,0.3), new THREE.MeshLambertMaterial({ color: 0x660000}));
        base.position.x = -0.2;
        base.position.y = -0.1;

		wood1 = new THREE.Mesh(new THREE.CubeGeometry(0.6,0.2,0.2), new THREE.MeshLambertMaterial({ color: 0x993300}));
		wood1.rotation.z = -1.2;

		wood2 = new THREE.Mesh(new THREE.CubeGeometry(0.6,0.2,0.2), new THREE.MeshLambertMaterial({ color: 0x993300}));
		wood2.rotation.z = 1.2;
		wood2.position.x = -0.4;

        wood3 = new THREE.Mesh(new THREE.CubeGeometry(0.6,0.2,0.2), new THREE.MeshLambertMaterial({ color: 0x993300}));
		wood3.rotation.z = 1.2;
		wood3.rotation.y = -1.5;
		wood3.position.z = -0.2;
		wood3.position.x = -0.2;

        wood4 = new THREE.Mesh(new THREE.CubeGeometry(0.6,0.2,0.2), new THREE.MeshLambertMaterial({ color: 0x993300}));
		wood4.rotation.z = 1.2;
		wood4.rotation.y = 1.5;
		wood4.position.z = 0.2;
		wood4.position.x = -0.2;
		
        bonfire.add(base);
		bonfire.add(wood1);
		bonfire.add(wood2);
        bonfire.add(wood3);
        bonfire.add(wood4);
   
		
		scene.add(bonfire);
    }

    var CustomParticleSystem = function( options )
{
    var that = this;
    
    this.prevTime = new Date();
    this.particles = new THREE.Geometry();
    this.options = options;

    this.numAlive = 0;
    this.throughPut = 0.0;
    this.throughPutFactor = 0.0;
    if ( options.throughPutFactor !== undefined ){
	this.throughPutFactor = options.throughPutFactor;
    }

    // add max amount of particles (vertices) to geometry
    for( var i=0;i<this.options.maxParticles;i++){
	this.particles.vertices.push ( new THREE.Vector3());
    }
    
    this.ps = new THREE.ParticleSystem(this.particles, 
				       this.options.material);
    this.ps.renderDepth = 0;
    this.ps.sortParticles = false;
    this.ps.geometry.__webglParticleCount = 0;

    this.getNumParticlesAlive = function(){
	return this.numAlive;
    }
    this.setNumParticlesAlive = function(particleCount){
	this.numAlive = particleCount;
    }
    this.getMaxParticleCount = function(){
	return this.ps.geometry.vertices.length;
    }

    this.removeDeadParticles = function(){

	var endPoint = this.getNumParticlesAlive();
	for(var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    //console.log("remove dead particles", particle.energy);
	    if ( particle.energy <= 0.0 ){
		// remove from array
		var tmp = this.ps.geometry.vertices.splice(p,1);
		// append to end of array
		this.ps.geometry.vertices.push(tmp[0]);
		// vertices have shifted, no need to as far anymore
		endPoint--;
		// decrease alive count by one
		this.setNumParticlesAlive( this.getNumParticlesAlive()-1);
		
	    }
	}
    }

    this.init = function( particleCount ){
	var previouslyAlive = this.getNumParticlesAlive();
	var newTotal = particleCount + previouslyAlive;
	newTotal = (newTotal > this.getMaxParticleCount()) ? 
	    this.getMaxParticleCount() : newTotal;
	
	this.setNumParticlesAlive(newTotal);
	// initialize every particle
	for(var p=previouslyAlive;p<newTotal;p++){
	    this.options.onParticleInit( this.ps.geometry.vertices[p]);
	}
	this.ps.geometry.verticesNeedUpdate = true;
	
    }
    
    this.update = function(){

	var now = new Date();
	var delta = (now.getTime() - that.prevTime.getTime())/1000.0;
	
	// a quick hack to get things working.
	this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();
	
	// seek and destroy dead ones
	this.removeDeadParticles();

	var endPoint = this.getNumParticlesAlive();
	for( var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    if ( particle !== undefined ){
		this.options.onParticleUpdate(particle, delta);
	    }
	}
	// Add new particles according to throughput factor
	that.throughPut += (that.throughPutFactor * delta);
	var howManyToCreate  = Math.floor( that.throughPut );
	if ( howManyToCreate > 1 ){
	    that.throughPut -= howManyToCreate;
	    that.init( howManyToCreate );
	}
	// Changes in position need to be reflected to VBO
	this.ps.geometry.verticesNeedUpdate = true;
	
	that.prevTime = now;
    }
}


$(function () {

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    // create scene
    scene = new THREE.Scene();
    // camera will be the the child of camObject
    camObject.add(camera);
    //for spotlight
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;

    // define renderer viewport size
    renderer.setSize(width, height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

      // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");
    var cloudTexture = THREE.ImageUtils.loadTexture("clouds.png");
    cloudObject = new THREE.Object3D();

    var limeTexture = THREE.ImageUtils.loadTexture("lime.png");
    var pineTexture = THREE.ImageUtils.loadTexture("pine.png");


    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;

    // directional light to the scene
    var directionalLight = new THREE.DirectionalLight(0x889999, 1.0);
    directionalLight.position.set(1, 1, -1);

    scene.add(directionalLight);

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add(ambientLight);

    scene.fog = new THREE.Fog(0x666666, 5.0, 30.0);
    // Add our flashlight
    var distance = 3.0;
    var intensity = 1.0;
    spotLight = new THREE.SpotLight(0xff0000, intensity, distance);
    spotLight.castShadow = false;
    spotLight.position = new THREE.Vector3(0, 0, 1);
    spotLight.target = spotLightObj;
    spotLight.exponent = 175;
    spotLight.angle = 0.5;
    scene.add(spotLight);

    //create custom lambert shader
    customLamberShader = new THREE.ShaderMaterial({
        vertexShader: $("#light-vs").text(),
        fragmentShader: $("#light-fs").text(),
        transparent: false,
        uniforms: {
            map: {
                type: 't',
                value: rockTexture
            },
            "dirlight.diffuse": {
                type: 'v4',
                value: colorToVec4(directionalLight.color)
            },
            "dirlight.pos": {
                type: 'v3',
                value: directionalLight.position
            },
            "dirlight.ambient": {
                type: 'v4',
                value: new THREE.Vector4(0, 0, 0, 1.0) /* ambient value in light */
            },
            "dirlight.specular": {
                type: 'v4',
                value: new THREE.Vector4(0, 0, 0, 1)
            },
            "spotlight.diffuse": {
                type: 'v4',
                value: new THREE.Vector4(1, 1, 0, 1)
            },
            "spotlight.distance": {
                type: 'f',
                value: distance
            },
            "spotlight.pos": {
                type: 'v3',
                value: spotLight.position
            },
            "spotlight.exponent": {
                type: 'f',
                value: spotLight.exponent
            },
            "spotlight.direction": {
                type: 'v3',
                value: new THREE.Vector3(0, 0, -1)
            },
            "spotlight.specular": {
                type: 'v4',
                value: new THREE.Vector4(1, 1, 1, 1)
            },
            "spotlight.intensity": {
                type: 'f',
                value: 2.0
            },
            "spotlight.angle": {
                type: 'f',
                value: spotLight.angle
            },
            u_ambient: {
                type: 'v4',
                value: colorToVec4(ambientLight.color) /* global ambient */
            },
            fogColor:
            {
                type: 'v3',
                value: colorToVec3(scene.fog.color)
            },

            fogNear:
            {
                type: 'f',
                value: scene.fog.near
            },

            fogFar:
            {
                type: 'f',
                value: scene.fog.far
            }
        }
    });

  

    // Construct a mesh object
    var ground = new THREE.Mesh(new THREE.CubeGeometry(100, 0.2, 100, 1, 1, 1), customLamberShader);


    // do a little magic with vertex coordinates so ground looks more intersesting.
    $.each(ground.geometry.faceVertexUvs[0], function (i, d) {
        d[0] = new THREE.Vector2(0, 25);
        d[2] = new THREE.Vector2(25, 0);
        d[3] = new THREE.Vector2(25, 25);
    });

    // add ground to scene
    scene.add(ground);

    //This is called to display the arm.
    //handy();


    // mesh loading functionality
    var loader = new THREE.JSONLoader();
    function handler(geometry, materials) {
        var m = new THREE.Mesh(geometry, customLamberShader);
        m.renderDepth = 2000;
        ruins.push(m);
        checkIsAllLoaded();
    }

    function skyHandler(geometry, materials)
	{
		clouds = new THREE.Mesh(geometry, cloudMaterial);
		clouds.scale.set(20, 20, 20);
		scene.add(clouds);
		clouds.position = cloudObject.position;
		clouds.rotation = cloudObject.rotation;

    
		clouds.scale.x = 150;
		clouds.scale.y = 150;
		clouds.scale.z = 150;
	}

    function checkIsAllLoaded() {

        if (ruins.length == 5) {
            $.each(ruins, function (i, mesh) {
                // rotate 90 degrees
                mesh.rotation.x = Math.PI / 2;
                scene.add(mesh);
            });
            // arcs
            ruins[0].position.z = 13;
            // corner
            ruins[1].position.x = 13;
            // crumbled place
            ruins[2].position.x = -13;

            ruins[3].position.z = -13;

            rotationComponent = 0.5;

        }

    }
    // loading of meshes
    loader.load("ruins/ruins30.js", handler);
    loader.load("ruins/ruins31.js", handler);
    loader.load("ruins/ruins33.js", handler);
    loader.load("ruins/ruins34.js", handler);
    loader.load("ruins/ruins35.js", handler);
    loader.load("ruins/sky.js", skyHandler);

    var cloudMaterial = new THREE.MeshPhongMaterial(
	{
	    map: cloudTexture,
	    transparent: true,
	    shininess: 150,
        blending: THREE.AdditiveBlending
	});

    cloudMaterial.depthWrite = false;

   var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./skybox/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 10,10,10,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    skybox.renderDepth = 0;
    scene.add(skybox);

    //pine trees
    var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
								new THREE.MeshBasicMaterial(
								{
									color: 0xffffff,
									map: pineTexture,
									depthTest: true,
									depthWrite: false,
									transparent: true,
									blending: THREE.NormalBlending
								}));
	plane1.material.side = THREE.DoubleSide;
	plane1.position.y = 3;
	plane1.position.x = -6;
	plane1.position.z = 2;
	plane1.rotation.z = 3.15;
    plane1.scale.y = 6;
	plane1.scale.x = 4;
	scene.add(plane1);

    var plane2 = plane1.clone();
    plane2.rotation.y = Math.PI/2;
    scene.add(plane2);

    //2nd tree
    var plane3 = plane1.clone();
    plane3.position.x = 7;
	plane3.position.z = -10;
    scene.add(plane3);

    var plane4 = plane3.clone();
    plane4.rotation.y = Math.PI/2;
    scene.add(plane4);

    //3rd tree
    var plane5 = plane1.clone();
    plane5.position.x = 15;
    plane5.position.z = 0;
    scene.add(plane5);

    var plane6 = plane5.clone();
    plane6.rotation.y = Math.PI / 2;
    scene.add(plane6);

    //4th tree
    var plane7 = plane1.clone();
    plane7.position.x = -3;
    plane7.position.z = 10;
    scene.add(plane7);

    var plane8 = plane7.clone();
    plane8.rotation.y = Math.PI / 2;
    scene.add(plane8);

    //5th tree
    var plane9 = plane1.clone();
    plane9.position.x = 6;
    plane9.position.z = 14;
    scene.add(plane9);

    var plane10 = plane9.clone();
    plane10.rotation.y = Math.PI / 2;
    scene.add(plane10);

    
    // lime tree
	var plane11 = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
								new THREE.MeshBasicMaterial(
								{
									color: 0xffffff,
									map: limeTexture,
									depthTest: true,
									depthWrite: false,
									transparent: true,
									blending: THREE.NormalBlending
								}));
	plane11.material.side = THREE.DoubleSide;
	plane11.position.y = 3;
	plane11.position.x = -4;
	plane11.position.z = -4;
	plane11.rotation.z = 3.15;
	plane11.scale.y = 6;
	plane11.scale.x = 4;
	scene.add(plane11);

	var plane12 = plane11.clone();
	plane12.rotation.y = Math.PI / 2;
	scene.add(plane12);

	//2nd limetree
	var plane13 = plane11.clone();
	plane13.position.x = 12;
	plane13.position.z = 8;
	scene.add(plane13);

	var plane14 = plane13.clone();
	plane14.rotation.y = Math.PI / 2;
	scene.add(plane14);

	//3rd limetree
	var plane15 = plane11.clone();
	plane15.position.x = 7;
	plane15.position.z = 0;
	scene.add(plane15);

	var plane16 = plane15.clone();
	plane16.rotation.y = Math.PI / 2;
	scene.add(plane16);

	//4th limetree
	var plane17 = plane11.clone();
	plane17.position.x = 4;
	plane17.position.z = -4;
	scene.add(plane17);

	var plane18 = plane17.clone();
	plane18.rotation.y = Math.PI / 2;
	scene.add(plane18);

	//5th limetree
	var plane19 = plane11.clone();
	plane19.position.x = -5;
	plane19.position.z = 7;
	scene.add(plane19);

	var plane20 = plane19.clone();
	plane20.rotation.y = Math.PI / 2;
	scene.add(plane20);




    bonfire();

    // Create our improved particle system object.
	custParticleSystem = new CustomParticleSystem( {
	maxParticles: 10,
	energyDecrement: 0.8,
	throughPutFactor: 10,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xffffff,
	    size: 2,
	    map: THREE.ImageUtils.loadTexture("fire.png"),
	    transparent: true,
	    blending: THREE.CustomBlending,
	    blendEquation: THREE.AddEquation,
	    blendSrc: THREE.SrcAlphaFactor,
	    blendDst: THREE.OneFactor,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(0,0.4,0);
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,1,0);
	    // particle life force
	    particle.energy = 0.5;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (custParticleSystem.options.energyDecrement * delta);
	}
    });
	
    // add Three.js particlesystem to scene.
    scene.add(custParticleSystem.ps);
	
	custParticleSystem2 = new CustomParticleSystem( {
	maxParticles: 10,
	energyDecrement: 0.5,
	throughPutFactor: 10,
	material: new THREE.ParticleBasicMaterial({
	    size: 2,
	    map: THREE.ImageUtils.loadTexture("smoke.png"),
	    transparent: true,
	    blending: THREE.AdditiveBlending,

	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(0,1.5,0);
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,1,0);
	    // particle life force
	    particle.energy = 0.5;
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (custParticleSystem2.options.energyDecrement * delta);
	}
    });
	
    // add Three.js particlesystem to scene.
    scene.add(custParticleSystem2.ps);



    // request frame update and call update-function once it comes
    requestAnimationFrame(update);



    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function (ev) {
        mouse.down = true;
        mouse.prevY = ev.pageY;
        mouse.prevX = ev.pageX;
    }


    document.onmouseup = function (ev) {
        mouse.down = false;
    }

    document.onmousemove = function (ev) {
        if (mouse.down) {

            var rot = (ev.pageY - mouse.prevY) * 0.01;
            var rotY = (ev.pageX - mouse.prevX) * 0.01;
            camObject.rotation.y -= rotY;
            camera.rotation.x -= rot;
            mouse.prevY = ev.pageY;
            mouse.prevX = ev.pageX;
        }
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function (event) {
        keysPressed[event.keyCode] = true;
    }

    document.onkeyup = function (event) {
        keysPressed[event.keyCode] = false;
    }


    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function (i, d) {
        console.log(d);
    });
});

var angle = 0.0;

function update() {

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera);

    // Add movement functionality to the scene
    movement();

    // "Animate" the hand with update function
    //handAnim();

    // request another frame update
    requestAnimationFrame(update);

    spotLight.position = camObject.position;
    customLamberShader.uniforms["spotlight.pos"].value = camObject.position;

    var dir = new THREE.Vector3(0, 0, -1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;

    if ( custParticleSystem != null ){
	custParticleSystem.update();
    }
	
	if ( custParticleSystem2 != null ){
	custParticleSystem2.update();
    }

	cloudObject.rotation.y += 0.001;
	cloudObject.position.x = camObject.position.x;
	cloudObject.position.y = camObject.position.y;
	cloudObject.position.z = camObject.position.z;




function movement() {
    if (keysPressed["W".charCodeAt(0)] == true) {
        var dir = new THREE.Vector3(0, 0, -1);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
        camObject.translate(0.1, dirW);
    }

    if (keysPressed["S".charCodeAt(0)] == true) {
        var dir = new THREE.Vector3(0, 0, -1);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
        camObject.translate(-0.1, dirW);
    }
    if (keysPressed["A".charCodeAt(0)] == true) {
        var dir = new THREE.Vector3(1, 0, 0);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
        camObject.translate(-0.1, dirW);
    }

    if (keysPressed["D".charCodeAt(0)] == true) {
        var dir = new THREE.Vector3(1, 0, 0);
        var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
        camObject.translate(0.1, dirW);
    }
}
}