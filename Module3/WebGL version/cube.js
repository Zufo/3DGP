var WebGLObject = function(gl) {

    //needed variables
	var that = this;
	this.gl = gl;
	this.vertices = null;
	this.shader = null;
	this.indices = null;
	this.texCoords = null;
	this.textures = [];
	this.transform = new THREE.Matrix4();
	
    this.Render = function()
	{
	that.gl.useProgram(that.shader);
	that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertices);
	
	// Vertex data to shader
	that.gl.vertexAttribPointer( that.shader.vertexPositionAttribute, that.vertices.itemSize, that.gl.FLOAT, false, 0, 0);

	that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.texCoords);
	
	// Vertex data to shader
	that.gl.vertexAttribPointer( that.shader.textureCoords, that.texCoords.itemSize, that.gl.FLOAT, false, 0, 0);
	
	// Transform matrix to shader
	that.gl.uniformMatrix4fv( that.shader.modelView,  false, that.transform.flattenToArray([]));
	
	// Use this index buffer for drawing.
	that.gl.bindBuffer( that.gl.ELEMENT_ARRAY_BUFFER, that.indices);

	// Enable first texture unit (0)
	that.gl.activeTexture(that.gl.TEXTURE0);
	
	// Tell shader to use texunit 0 for sampler
	that.gl.uniform1i(that.shader.diffuse, 0);

	// ******* Each texture requires different drawing call  *********
	// Bind texture to texunit 0
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[0]);	
	// draw first face
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
	
	// Bind texture to texunit 1
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[1]);	
	// draw second face
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6);

	// Bind texture to texunit 2
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[2]);	
	// draw third face 
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 12);

	// Bind texture to texunit 3
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[3]);	
	// draw fourth face
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 18);

	// Bind texture to texunit 4
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[4]);	
	// draw fifth face
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 24);

	// Bind texture to texunit 5
	that.gl.bindTexture(that.gl.TEXTURE_2D, that.textures[5]);	
	
	// Draw sixth face
	that.gl.drawElements( that.gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 30);

	that.gl.bindTexture(that.gl.TEXTURE_2D, null);
    }

	this.Prepare = function()
	{
		this.transform.identity();

		that.vertices = that.gl.createBuffer();
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertices);

		// Vertices for the cube
		var verts = [
			-1, -1, -1,
			 1, -1, -1,
			 1,  1, -1,
			-1,  1, -1,

			 1, -1, -1,
			 1, -1,  1,
			 1,  1,  1,
			 1,  1, -1,	    

			 1, -1,  1,
			-1, -1,  1,
			-1,  1,  1,
			 1,  1,  1,	    

			-1, -1,  1,
			-1, -1, -1,
			-1,  1, -1,
			-1,  1,  1,	    

			-1,  1, -1,
			 1,  1, -1,
			 1,  1,  1,
			-1,  1,  1,	    

			-1,  -1,  1,
			 1,  -1,  1,
			 1,  -1, -1,
			-1,  -1, -1,	    

		];
		// indices for vertex data to be rendered as triangle list.
		var indices = [0,1,2,0,2,3,4,5,6,4,6,7, 8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];

		that.gl.bufferData( that.gl.ARRAY_BUFFER, new Float32Array(verts), that.gl.STATIC_DRAW );
		that.vertices.itemSize = 3;
		that.vertices.numItems = 24;

		// indices will be stored into single element array buffer
		that.indices = that.gl.createBuffer();
		that.gl.bindBuffer( that.gl.ELEMENT_ARRAY_BUFFER, that.indices);
		that.gl.bufferData( that.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
		that.indices.itemSize = 1; 
		that.indices.numItems = indices.length;
		
		// texture coordinates for vertices.
		var texCoords = [
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		];
		
		that.texCoords = that.gl.createBuffer();
		that.gl.bindBuffer( that.gl.ARRAY_BUFFER, that.texCoords);
		that.gl.bufferData( that.gl.ARRAY_BUFFER, new Float32Array(texCoords), that.gl.STATIC_DRAW);

		that.texCoords.itemSize = 2;
		that.texCoords.numItems = 24;

		console.log('Data initialized.');
    }
}

var WebGLApp = function() {

    //more needed variables
	var that = this;
	this.canvas = null;
	this.gl = null;
	this.vertices = null;
	this.colors = null;
	this.indices = null;
	this.projMat = new THREE.Matrix4();
	this.fragmentShader = null;
	this.vertexShader = null; 
	this.shaderProgram = null;
	this.prevTime = 0;
	this.rotationX = 0.0;
	this.rotationY = 0.0;
	this.rotationZ = 0.0;
	this.obj
	this.texture = null;
	this.keysPressed = [];
	
	this.Prepare = function(canvas) {
	that.canvas = canvas[0]

	that.InitGL();
	that.obj = new WebGLObject(this.gl);	

	that.InitShaders();
	
	// Texture initialization
	that.InitTextures();

	// set clear color
	that.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// enable depth testing
	that.gl.enable(that.gl.DEPTH_TEST);

	that.obj.shader = that.shaderProgram;
	that.obj.Prepare();
	
	that.Update();
	that.Render();
    }
	
    this.InitGL = function()
    {
	
	try 
	{
		// accesses webgl context
		that.gl = that.canvas.getContext("experimental-webgl");
		that.gl.viewportWidth = that.canvas.width;
		that.gl.viewportHeight = that.canvas.height;
	} 
		catch(e) 
		{
			console.log(e);
		}
		if (!that.gl) 
		{
			console.log("Could not initialise WebGL");
		} 
		else 
		{
			console.log("WebGL initialized ok!");
		}
    }
	this.InitData = function(){}
		
	this.InitShaders = function() 
	{

	var vs = that.compileShader("shader-vs");
	var fs = that.compileShader("shader-fs");
	
	that.shaderProgram = that.gl.createProgram();

	that.gl.attachShader(that.shaderProgram, vs);
	that.gl.attachShader(that.shaderProgram, fs);
	that.gl.linkProgram( that.shaderProgram);

	var ok = that.gl.getProgramParameter( that.shaderProgram, that.gl.LINK_STATUS);
	if ( !ok ) 
	{
	    console.log('Could not link shaders:' + that.gl.getProgramInfoLog( that.shaderProgram));
	}

	that.gl.useProgram( that.shaderProgram );
	that.shaderProgram.vertexPositionAttribute = that.gl.getAttribLocation(that.shaderProgram, "aVertPos");
	that.gl.enableVertexAttribArray(that.shaderProgram.vertexPositionAttribute);

	that.shaderProgram.textureCoords = that.gl.getAttribLocation(that.shaderProgram, "aTexcoord");
	that.gl.enableVertexAttribArray(that.shaderProgram.textureCoords);
	
	that.shaderProgram.projection   = that.gl.getUniformLocation(that.shaderProgram, "uProjection");
	that.shaderProgram.modelView    = that.gl.getUniformLocation(that.shaderProgram, "uModelView");
    }
	
	this.InitTextures = function()
    {
		that.obj.textures = [];
		// Create six texture objects
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[0].image = new Image();
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[1].image = new Image();
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[2].image = new Image();
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[3].image = new Image();
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[4].image = new Image();
		that.obj.textures.push(that.gl.createTexture()); 
		that.obj.textures[5].image = new Image();
		
		// Handlers on each image separately
		that.obj.textures[0].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[0]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0,  that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[0].image);

            //used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);


			// The application must bind the texture object to operate on it.
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);
		}
		that.obj.textures[0].image.src = "negz.jpg";
		
		that.obj.textures[1].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[1]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[1].image);

			//used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);
			
			// The application must bind the texture object to operate on it
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);
		}
		that.obj.textures[1].image.src = "negx.jpg";
		
		that.obj.textures[2].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[2]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[2].image);

			//used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);
			
			// The application must bind the texture object to operate on it
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);
		}
		that.obj.textures[2].image.src = "posz.jpg";
		
		that.obj.textures[3].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[3]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[3].image);

			//used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);
			
			// The application must bind the texture object to operate on it
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);

		}
		that.obj.textures[3].image.src = "posx.jpg";	
		
		that.obj.textures[4].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[4]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[4].image);

			//used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);
			
			// The application must bind the texture object to operate on it
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);
		}
		that.obj.textures[4].image.src = "posy.jpg";

		that.obj.textures[5].image.onload = function()
		{
			// Tell WebGL to process the currently loaded textures
			that.gl.bindTexture(that.gl.TEXTURE_2D, that.obj.textures[5]);

			that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true);
			
			// After generating a texture object and binding it, the next step to using a texture is to actually load the image data
			that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.obj.textures[5].image);

			//used to make the sides of the cube to be "glued" together, thus fading the empty spaces between them
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
			that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);

			that.gl.generateMipmap(that.gl.TEXTURE_2D);
			
			// The application must bind the texture object to operate on it
			that.gl.bindTexture(that.gl.TEXTURE_2D, null);
		}
		that.obj.textures[5].image.src = "negy.jpg";
    }
	
    this.Render = function()
    {
		// three.js specific
		requestAnimationFrame(that.Render);

		// viewport to fill entire canvas area
		that.gl.viewport(0,0, that.gl.viewportWidth, that.gl.viewportHeight);
		// clear screen.
		that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT);

		// create projection matrix
		var viewRatio = that.gl.viewportWidth / that.gl.viewportHeight;
		that.projMat.makePerspective( 60, viewRatio, 0.001, 102.0);
		
		// set uniform matrix
		that.gl.uniformMatrix4fv( that.shaderProgram.projection, false, 
					  that.projMat.flattenToArray([]));

		// object transform matrix (model transform)
		that.obj.transform.identity();

		// construct object transform, separate rotation matrices for X, Y and Z axis.
		var tmp = new THREE.Matrix4();
		tmp.makeRotationX(that.rotationX); 
		var tmp2 = new THREE.Matrix4();
		tmp2.makeRotationY(that.rotationY);
		var tmp3 = new THREE.Matrix4();
		tmp3.makeRotationZ(that.rotationZ);  

		// combine X, Y and Z rotations to single transform matrix.
		that.obj.transform.multiply(tmp);
		that.obj.transform.multiply(tmp2);
		that.obj.transform.multiply(tmp3); 
		
		// make object draw itself. camera stays where it is, object rotates. 
		// But it creates illusion of "looking" to different direction.
		that.obj.Render();
    }

    this.Update = function()
    {
		// Rotation handling routine
		var current = new Date().getTime();
		var delta = current - that.prevTime;
			
		// Rotate the cube automatically
		that.rotationX += 0.01;
		that.rotationY -= 0.01;
		that.rotationZ += 0.01;
		that.prevTime = current;
		
		// call update on regular interval
		setTimeout(that.Update, 50);
    }

    this.compileShader = function( id )
    {
		var script = $("#"+id);
		var src = script.html();
		var shader = null
		if (script[0].type == "x-shader/x-vertex" )
		{
			shader = that.gl.createShader(that.gl.VERTEX_SHADER);
		} 
		else if ( script[0].type == "x-shader/x-fragment" ) 
		{
			shader = that.gl.createShader(that.gl.FRAGMENT_SHADER);
		}
		else 
		{
			console.log('Unknown shader type:', script[0].type);
			return null;
		}
		
		that.gl.shaderSource( shader, src);
		that.gl.compileShader(shader);

		var ok = that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS);
		if (!ok ){
			console.log('shader failed to compile: ', that.gl.getShaderInfoLog(shader));
			return null;
		}
	return shader;
    }
}
var app = new WebGLApp();