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
etime = 0.0;
ptime = 0.0;
stime = 0.0;

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


function handy() {

    //THREE.Mesh materials and a object3D to call all of them is created here
    ArmWave = new THREE.Object3D();

    // Shoulder 
    shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.35, 5, 5), new THREE.MeshLambertMaterial(
	{
	    color: 0x0000FF
	}));
    shoulder.position.y = 0.5;

    // Upper arm 
    uarm = new THREE.Mesh(new THREE.CubeGeometry(0.3, 1, 0.3), new THREE.MeshLambertMaterial(
	{
	    color: 0xFF6699
	}));
    uarm.position.y = 0.8;

    // Elbow
    elbow = new THREE.Mesh(new THREE.SphereGeometry(0.27, 5, 5), new THREE.MeshLambertMaterial(
	{
	    color: 0x006666
	}));
    elbow.position.y = 0.6;

    // forearm
    forearm = new THREE.Mesh(new THREE.CubeGeometry(0.25, 1, 0.2), new THREE.MeshLambertMaterial(
	{
	    color: 0x00FF00
	}));
    forearm.position.y = 0.5;

    // Wrist
    wrist = new THREE.Mesh(new THREE.SphereGeometry(0.15, 5, 5), new THREE.MeshLambertMaterial(
	{
	    color: 0xFF0000
	}));
    wrist.position.y = 0.5;

    // Palm
    palm = new THREE.Mesh(new THREE.CubeGeometry(0.4, 0.3, 0.1), new THREE.MeshLambertMaterial(
	{
	    color: 0xFF00FF
	}));
	palm.position.y = 0.2;

	//thumb
	thumb = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.2, 0.05), new THREE.MeshLambertMaterial(
	{
	    color: 0xFFCC00
	}));
	thumb.position.y = 0.05;
	thumb.position.x = 0.3;
	thumb.rotation.z = 2;

    // indexfinger
	ifinger = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.05), new THREE.MeshLambertMaterial(
	{
	    color: 0xFFCC00
	}));
    ifinger.position.y = 0.3;
    ifinger.position.x = 0.15;

    // middlefinger
    mfinger = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.4, 0.05), new THREE.MeshLambertMaterial(
	{
	    color: 0xFFCC00
	}));
    mfinger.position.y = 0.3;
    mfinger.position.x = 0.05;

    // ring finger
    rfinger = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.05), new THREE.MeshLambertMaterial(
	{
	    color: 0xFFCC00
	}));
    rfinger.position.y = 0.3;
    rfinger.position.x = -0.05;

    // little finger
    lfinger = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.25, 0.02), new THREE.MeshLambertMaterial(
	{
	    color: 0xFFCC00
	}));
    lfinger.position.y = 0.25;
    lfinger.position.x = -0.15;

    // Call function that creates joints between the objects
    createJoints();

    scene.add(ArmWave);

   
}

// Make the above objects joint themselves 
function createJoints() {

    //Link each part of the arm to the next part, so they can be called later
    ArmWave.add(shoulder);
    shoulder.add(uarm);
    uarm.add(elbow);
    elbow.add(forearm);
    forearm.add(wrist);
    wrist.add(palm);

    //add fingers to the palm of the hand
    palm.add(ifinger);
    palm.add(mfinger);
    palm.add(rfinger);
    palm.add(lfinger);
    palm.add(thumb);
}

function handAnim() {
    shoulder.rotation.z = Math.cos(stime);
    elbow.rotation.z = Math.sin(etime);
    wrist.rotation.x = Math.sin(ptime);
    //palm.rotation.x = Math.sin(ptime);

    etime += 0.02;
    stime += 0.015;
    ptime += 0.03;

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

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;

    // directional light to the scene
    var directionalLight = new THREE.DirectionalLight(0x889999, 1.0);
    directionalLight.position.set(1, 1, 1);

    scene.add(directionalLight);

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add(ambientLight);

    scene.fog = new THREE.Fog(0x666666, 1.0, 25.0);
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
    handy();

    
    // mesh loading functionality
    var loader = new THREE.JSONLoader();
    function handler(geometry, materials) {
        var m = new THREE.Mesh(geometry, customLamberShader);
        m.renderDepth = 2000;
        ruins.push(m);
        checkIsAllLoaded();
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
        }

    }
    // loading of meshes
    loader.load("ruins/ruins30.js", handler);
    loader.load("ruins/ruins31.js", handler);
    loader.load("ruins/ruins33.js", handler);
    loader.load("ruins/ruins34.js", handler);
    loader.load("ruins/ruins35.js", handler);

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
    handAnim();

    // request another frame update
    requestAnimationFrame(update);

    spotLight.position = camObject.position;
    customLamberShader.uniforms["spotlight.pos"].value = camObject.position;

    var dir = new THREE.Vector3(0, 0, -1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;

}

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
