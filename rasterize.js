/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_URL = "https://ncsucg4games.github.io/prog2/"; // location of input files
const INPUT_TRIANGLES_URL = INPUT_URL + "triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = INPUT_URL + "spheres.json"; // spheres file loc
const ALTERNATE_ROOMS_URL = "https://anmolkoul11.github.io/CG2_prog2/rooms.json";
const INPUT_ROOMS_URL = INPUT_URL + "rooms.json";
const CELL_SIZE = 1.0;
const CELL_HEIGHT = 1.0;
const FPS_UPDATE_INTERVAL = 500; // Update FPS every 500ms
const MAX_FPS = 240; // Cap FPS display at 240
const ROOM_TYPES = {
    SOLID: "s",
    PORTAL: "p",
    ROOM: "room"
};
const CULLING_MODES = {
    NONE: { id: 0, name: "No Culling" },
    FRUSTUM: { id: 1, name: "Frustum Culling" }
};
const perfStats = {
    frameTime: 0,
    lastFrameTime: performance.now(),
    fps: 0,
    trianglesRendered: 0,
    cellsVisible: 0,
    spheresVisible: 0,
    triangleSetsVisible: 0,
    frameCount: 0,
    // Add these for 10-frame averaging
    frameStartTimes: new Array(10).fill(0),
    frameEndTimes: new Array(10).fill(0),
    frameIndex: 0
};

window.DEBUG = {
    SHOW_PARTICLES: true,
    SHOW_CULLING: false
};

const ROOM_TEXTURES = {
    WALL: "rocktile.jpg",
    WALL_ALT: "https://anmolkoul11.github.io/CG2_prog2/Walltile.png",
    FLOOR: "floor.jpg",
    CEILING: "sky.jpg"
};

const PROJECTILE = {
    SIZE: 0.01,           // Small but visible size
    INITIAL_SPEED: 5.9,   // Initial launch speed
    LIFETIME: 10000,      // 10 second lifetime
    COLOR: [1, 0, 0, 1],  // Red color
    GRAVITY: -3.9,      // Reduced gravity for more natural arc
    FRICTION: 0.98,       // Air resistance
    BOUNCE: 0.9,          // Lose 50% energy on bounce
    MIN_SPEED: 0.1,      // Minimum speed before coming to rest
    GROUND_FRICTION: 0.9  // Extra friction when hitting ground
};

const HAND_SPRITE = {
    WIDTH: 0.8,         // Adjusted width
    HEIGHT: 1.0,        // Adjusted height
    BOB_AMOUNT: 0.02,   // Slightly increased bob amount
    BOB_SPEED: 8,       // Same speed
    TEXTURE_URL: "hand2.png"
};

// Add with other global variables
let projectiles = [];  
let showPerfStats = false; // Flag to show performance stats
let handSprite = null; // Hand sprite object
let initialClick = 0;

const ROOM_MATERIAL = {
    ambient: [0.3, 0.3, 0.3],
    diffuse: [0.7, 0.7, 0.7],
    specular: [0.1, 0.1, 0.1],
    n: 10,
    texture: true
};
const MINIMAP = {
    SIZE: 200,               // Size of minimap in pixels
    CELL_SIZE: 20,          // Size of each cell in pixels
    COLORS: {
        WALL: '#333333',
        ROOM: '#666666',
        VISIBLE: '#88ff88',
        CULLED: '#ff8888',
        PLAYER: '#ffff00',
        FRUSTUM: 'rgba(255,255,0,0.3)'
    }
};

const HAND_ANIMATION = {
    IDLE: 'idle',
    THROW_WINDUP: 'windup',
    THROW_RELEASE: 'release',
    THROW_RESET: 'reset',
    WINDUP_SPEED: 4.0,     // Speed of wind up animation
    RELEASE_SPEED: 6.0,    // Speed of release animation
    RESET_SPEED: 3.0,      // Speed of reset animation
    MAX_WINDUP_OFFSET: 0.5,  // How far right the hand moves during windup
    MAX_RELEASE_OFFSET: -0.5 // How far left the hand moves during release
};

const AUDIO = {
    FOOTSTEPS: 'https://anmolkoul11.github.io/CG2_prog2/steps.flac',
    COLLISION: 'https://anmolkoul11.github.io/CG2_prog2/grunt.wav',
    COLLISION_PROJECTILE: 'collision_projectile.wav'
};

const PARTICLE_TYPES = {
    SMOKE: 'smoke',
    LIQUID: 'liquid'
};

const PARTICLE_TEXTURES = {
    SMOKE: {
        URL: "smoke2.png", 
        SIZE: 256
    },
    LIQUID: {
        URL: "fire.png",
        SIZE: 256
    }
};

// Define separate behaviors for each type
const PARTICLE_CONFIGS = {
    [PARTICLE_TYPES.SMOKE]: {
        maxParticles: 25,
        lifetime: 15000,
        startSize: 0.001,
        endSize: 0.1,
        startOpacity: 0.6,
        endOpacity: 0,
        startColor: [0.1, 0.1, 0.1],
        endColor: [0.1, 0.1, 0.1],
        
        // Add initial velocity range
        initialVelocityRange: {
            x: [-0.1, 0.1],    // Random x velocity between -0.1 and 0.1
            y: [0.2, 0.5],     // Upward velocity between 0.2 and 0.5
            z: [-0.1, 0.1]     // Random z velocity between -0.1 and 0.1
        },
        
        // Rest of the config remains the same...
        burst: {
            speed: 0.7,
            spread: 0.5,
            angle: Math.PI / 3
        },
        physics: {
            buoyancy: 0.015,
            drag: 0.98,
            mass: 1.2,
            gravity: -0.0005
        },
        turbulence: {
            scale: 0.2,
            speed: 2.0,
            octaves: 3,
            persistence: 0.5
        },
        swirl: {
            amplitude: 0.001,
            frequency: 0.8,
            radius: 0.2,
            decay: 0.98
        },
        expansion: {
            rate: 2.1,
            maxRadius: 2.5,
            curve: 0.5
        }
    },
    [PARTICLE_TYPES.LIQUID]: {
        maxParticles: 15,
        lifetime: 1000,    // milliseconds
        startSize: 0.03,
        endSize: 0.01,    // Liquid particles shrink
        startOpacity: 0.9,
        endOpacity: 0,
        startColor: [0.2, 0.5, 1.0],  // Blue
        endColor: [0.3, 0.6, 1.0],
        verticalForce: -1.0, // Downward force
        spread: 0.3,         // Tighter spread
        viscosity: 0.8,      // Resistance to movement
        surfaceTension: 0.5  // Particle attraction
    }
};

var defaultEye = vec3.fromValues(1.5,0.5,1.5); // default eye position in world space
var defaultCenter = vec3.fromValues(2.5,0.5,1.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightPosition = vec3.fromValues(2,4,-0.5); // default light position
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
//var lightPosition = vec3.fromValues(2,4,-0.5); // default light position
var rotateTheta = Math.PI/25; // how much to rotate models by with each key press
var canvas = null;
let showMinimap = false;

/* input model data */
var gl = null; // the all powerful gl object. It's all here folks!
var shaderProgram; // Add this line with other global variables
var vPosAttribLoc;
var vNormAttribLoc;
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var triSetSizes = []; // this contains the size of each triangle set
var inputSpheres = []; // the sphere data as loaded from input files
var numSpheres = 0; // how many spheres in the input scene
var inputRooms = [];
var currentRoom = null;

/* model data prepared for webgl */
var vertexBuffers = []; // vertex coordinate lists by set, in triples
var normalBuffers = []; // normal component lists by set, in triples
var uvBuffers = []; // uv coord lists by set, in duples
var triangleBuffers = []; // indices into vertexBuffers by set, in triples
var textures = []; // texture imagery by set

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var vNormAttribLoc; // where to put normal for vertex shader
var vUVAttribLoc; // where to put UV for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var usingTextureULoc; // where to put using texture boolean for fragment shader
var textureULoc; // where to put texture for fragment shader
let useAlternateTexture = false;

var hMatrix = mat4.create(); // handedness matrix
var pMatrix = mat4.create(); // projection matrix
var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create(); // model matrix
var hpvMatrix = mat4.create(); // hand * proj * view matrices
var hpvmMatrix = mat4.create(); // hand * proj * view * model matrices

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var viewDelta = 0; // how much to displace view with each key press
let currentCullingMode = CULLING_MODES.NONE.id;
// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

function setupMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    if (!canvas) {
        console.error('Minimap canvas not found!');
        return;
    }
    canvas.width = MINIMAP.SIZE;
    canvas.height = MINIMAP.SIZE;
    canvas.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        border: 2px solid white;
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        display: none;
    `;
    window.minimapContext = canvas.getContext('2d');
}

function checkParticleCollision(particle, trialPos) {
    const BUFFER = 0.02;                         // safety gap

    /* ---------- floor / ceiling ---------- */
    if (trialPos[1] < BUFFER) {
        return {
            hit   : true,
            normal: vec3.fromValues(0, 1, 0),
            point : vec3.fromValues(trialPos[0], BUFFER, trialPos[2])
        };
    }
    if (trialPos[1] > CELL_HEIGHT - BUFFER) {
        return {
            hit   : true,
            normal: vec3.fromValues(0, -1, 0),
            point : vec3.fromValues(trialPos[0], CELL_HEIGHT - BUFFER, trialPos[2])
        };
    }

    /* ---------- solid rooms ---------- */
    for (const room of inputRooms) if (room.type === ROOM_TYPES.SOLID) {

        // quick AABB test
        if (trialPos[0] < room.bounds.min[0] - BUFFER ||
            trialPos[0] > room.bounds.max[0] + BUFFER ||
            trialPos[1] < room.bounds.min[1] - BUFFER ||
            trialPos[1] > room.bounds.max[1] + BUFFER ||
            trialPos[2] < room.bounds.min[2] - BUFFER ||
            trialPos[2] > room.bounds.max[2] + BUFFER)  continue;

        /* ---- inside or intersecting: clamp to box ---- */
        const closest = vec3.fromValues(
            Math.max(room.bounds.min[0], Math.min(trialPos[0], room.bounds.max[0])),
            Math.max(room.bounds.min[1], Math.min(trialPos[1], room.bounds.max[1])),
            Math.max(room.bounds.min[2], Math.min(trialPos[2], room.bounds.max[2]))
        );

        // penetration vector = trialPos - closest
        const pen = vec3.subtract(vec3.create(), trialPos, closest);
        if (vec3.squaredLength(pen) === 0) continue;      // rare edge case

        /* pick axis of maximum penetration as the collision normal */
        let nx = Math.abs(pen[0]), ny = Math.abs(pen[1]), nz = Math.abs(pen[2]);
        let normal = vec3.create();
        if (nx > ny && nx > nz) vec3.set(normal, Math.sign(pen[0]), 0, 0);
        else if (ny > nz)        vec3.set(normal, 0, Math.sign(pen[1]), 0);
        else                     vec3.set(normal, 0, 0, Math.sign(pen[2]));

        /* surface point offset by BUFFER so we stay outside next frame */
        const point = vec3.scaleAndAdd(vec3.create(),
                        closest, normal, BUFFER);

        return { hit: true, normal, point };
    }

    return { hit: false, normal: vec3.create(), point: vec3.create() };
}



function calculateReflection(velocity, normal) {
    const reflection = vec3.create();
    const dot = vec3.dot(velocity, normal);
    
    // r = v - 2(v·n)n
    vec3.scale(reflection, normal, -2 * dot);
    vec3.add(reflection, velocity, reflection);
    
    return reflection;
}

function setupAudio() {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioCtx = new AudioContext();
    
    // Object to store our loaded sounds
    window.sounds = {};
    
    // Load sound files
    const soundFiles = [
        { name: 'footsteps', url: AUDIO.FOOTSTEPS },
        { name: 'collision', url: AUDIO.COLLISION },
        { name: 'collision_projectile', url: AUDIO.COLLISION_PROJECTILE },
    ];

    soundFiles.forEach(sound => {
        fetch(sound.url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                window.audioCtx.decodeAudioData(buffer, decodedData => {
                    window.sounds[sound.name] = {
                        buffer: decodedData,
                        isPlaying: false,
                        source: null
                    };
                });
            })
            .catch(error => console.error(`Error loading sound ${sound.name}:`, error));
    });
}

function playSound(soundName, loop = false) {
    const sound = window.sounds[soundName];
    if (!sound) return;

    // If sound is already playing and we're trying to loop it, just keep playing
    if (sound.isPlaying && loop) return;

    // If sound is playing but not meant to loop, stop it first
    if (sound.isPlaying) {
        stopSound(soundName);
    }

    try {
        // Create new source (we need a new one each time)
        const source = window.audioCtx.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = loop;
        
        // Connect source to speakers
        source.connect(window.audioCtx.destination);
        
        // Store source reference and start playing
        sound.source = source;
        sound.isPlaying = true;
        source.start(0);

        // Clean up when sound finishes
        source.onended = () => {
            if (!source.loop) { // Only clean up if not looping
                sound.isPlaying = false;
                sound.source = null;
            }
        };
    } catch (error) {
        console.error("Error playing sound:", error);
        sound.isPlaying = false;
        sound.source = null;
    }
}

function stopSound(soundName) {
    const sound = window.sounds[soundName];
    if (!sound || !sound.isPlaying || !sound.source) return;

    try {
        sound.source.stop();
    } catch (error) {
        console.error("Error stopping sound:", error);
    } finally {
        sound.isPlaying = false;
        sound.source = null;
    }
}

function createHandSprite() {
    // Create a simple quad for the hand sprite
    const handVertices = new Float32Array([
        -HAND_SPRITE.WIDTH/2, -HAND_SPRITE.HEIGHT/2, 0.0,
         HAND_SPRITE.WIDTH/2, -HAND_SPRITE.HEIGHT/2, 0.0,
         HAND_SPRITE.WIDTH/2,  HAND_SPRITE.HEIGHT/2, 0.0,
        -HAND_SPRITE.WIDTH/2,  HAND_SPRITE.HEIGHT/2, 0.0
    ]);

    const handUVs = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]);

    

    const handIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    // Create WebGL buffers
    const handSprite = {
        vertexBuffer: gl.createBuffer(),
        uvBuffer: gl.createBuffer(),
        indexBuffer: gl.createBuffer(),
        bobOffset: 0,
        lastBobTime: performance.now(),
        // Add these animation properties
        animationState: HAND_ANIMATION.IDLE,
        animationTime: 0,
        throwOffset: 0
    };

    // Set up buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, handSprite.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, handVertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, handSprite.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, handUVs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handSprite.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, handIndices, gl.STATIC_DRAW);

    // Load hand texture
    handSprite.texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, handSprite.texture);
    
    // Set texture parameters for better handling
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // Create and load a temporary 1x1 pixel until the image loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
        new Uint8Array([0, 0, 0, 0]));

    const image = new Image();

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, handSprite.texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); // Add this line
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        console.log("Hand texture loaded successfully");
    };
    image.onerror = () => {
        console.error("Error loading hand texture");  // Debug message
    };
    image.src = HAND_SPRITE.TEXTURE_URL;


    gl.bindBuffer(gl.ARRAY_BUFFER, handSprite.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, handUVs, gl.STATIC_DRAW);

    return handSprite;
}

function renderHandSprite(handSprite) {
    const now = performance.now();
    const deltaTime = (now - handSprite.lastBobTime) / 1000;
    handSprite.lastBobTime = now;

    if (handSprite.animationState === HAND_ANIMATION.IDLE) {
        if (keys.w || keys.s || keys.a || keys.d) {
            handSprite.bobOffset += deltaTime * HAND_SPRITE.BOB_SPEED;
            if (handSprite.bobOffset > Math.PI * 2) handSprite.bobOffset -= Math.PI * 2;
        }
    }

    // Handle throwing animation states
    switch (handSprite.animationState) {
        case HAND_ANIMATION.THROW_WINDUP:
            handSprite.animationTime += deltaTime * HAND_ANIMATION.WINDUP_SPEED;
            handSprite.throwOffset = Math.min(handSprite.animationTime, 1) * HAND_ANIMATION.MAX_WINDUP_OFFSET;
            if (handSprite.animationTime >= 1) {
                handSprite.animationState = HAND_ANIMATION.THROW_RELEASE;
                handSprite.animationTime = 0;
                createProjectile(); // Create projectile at release point
            }
            break;

        case HAND_ANIMATION.THROW_RELEASE:
            handSprite.animationTime += deltaTime * HAND_ANIMATION.RELEASE_SPEED;
            handSprite.throwOffset = HAND_ANIMATION.MAX_WINDUP_OFFSET + 
                (HAND_ANIMATION.MAX_RELEASE_OFFSET - HAND_ANIMATION.MAX_WINDUP_OFFSET) * 
                Math.min(handSprite.animationTime, 1);
            if (handSprite.animationTime >= 1) {
                handSprite.animationState = HAND_ANIMATION.THROW_RESET;
                handSprite.animationTime = 0;
            }
            break;

        case HAND_ANIMATION.THROW_RESET:
            handSprite.animationTime += deltaTime * HAND_ANIMATION.RESET_SPEED;
            handSprite.throwOffset = HAND_ANIMATION.MAX_RELEASE_OFFSET * (1 - Math.min(handSprite.animationTime, 1));
            if (handSprite.animationTime >= 1) {
                handSprite.animationState = HAND_ANIMATION.IDLE;
                handSprite.animationTime = 0;
                handSprite.throwOffset = 0;
            }
            break;
    }

    // Calculate horizontal bob
    const bobX = Math.sin(handSprite.bobOffset) * HAND_SPRITE.BOB_AMOUNT;
    const finalOffsetX = bobX + handSprite.throwOffset;

    // Create a view matrix just for the hand sprite
    const handProjMatrix = mat4.create();

    // Set up orthographic projection for the hand
    mat4.ortho(handProjMatrix, -1, 1, -1, 1, -1, 1);

    // Position the hand in the bottom right corner of the screen
    mat4.identity(mMatrix);
    mat4.translate(mMatrix, mMatrix, [0.80 + finalOffsetX, -0.76, 0]);  // Adjust these values to position the hand
    mat4.scale(mMatrix, mMatrix, [0.9, 0.8, 2]);  // Adjust scale as needed

    // Calculate final matrix without using the scene's view matrix
    mat4.multiply(hpvmMatrix, handProjMatrix, mMatrix);

    // Set uniforms
    gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix);
    gl.uniformMatrix4fv(pvmMatrixULoc, false, hpvmMatrix);
    
    // Set material properties
    gl.uniform3fv(ambientULoc, [1, 1, 1]);
    gl.uniform3fv(diffuseULoc, [1, 1, 1]);
    gl.uniform3fv(specularULoc, [0, 0, 0]);
    gl.uniform1f(shininessULoc, 1.0);
    gl.uniform1i(usingTextureULoc, true);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, handSprite.texture);
    gl.uniform1i(textureULoc, 0);

    // Draw sprite
    gl.bindBuffer(gl.ARRAY_BUFFER, handSprite.vertexBuffer);
    gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, handSprite.uvBuffer);
    gl.vertexAttribPointer(vUVAttribLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handSprite.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // Disable blending after drawing
    gl.depthMask(true); // Re-enable depth writing
    gl.disable(gl.BLEND);
}

function setupParticleShaders() {
    // In setupParticleShaders():
const particleVShaderCode = `
attribute vec3 aPosition;
attribute vec4 aColor;
attribute vec2 aSize;
attribute float aLifetime;
attribute vec3 aVelocity;
attribute vec2 aTexCoord;

uniform mat4 uProjectionView;
uniform vec3 uEyePosition;
uniform float uTime;

varying vec4 vColor;
varying vec2 vUV;
varying float vLifetime;

void main() {
        vColor = aColor;
        vLifetime = aLifetime;
        // Fix UV coordinates
        vUV = vec2(aTexCoord.x, aTexCoord.y); // Flip both U and V

        // Billboard calculation
        vec3 toEye = normalize(uEyePosition - aPosition);
        vec3 right = normalize(cross(vec3(0, 1, 0), toEye));
        vec3 up = cross(toEye, right);
        
        float size = mix(aSize.x, aSize.y, aLifetime);
        
        vec3 pos = aPosition + 
                   right * (aTexCoord.x - 0.5) * size + 
                   up * (aTexCoord.y - 0.5) * size;
                   
        gl_Position = uProjectionView * vec4(pos, 1.0);
    }
`;

// In setupParticleShaders(), modify the fragment shader:
const particleFShaderCode = `
    precision mediump float;
    varying vec4 vColor;
    varying vec2 vUV;
    varying float vLifetime;
    uniform sampler2D uSmokeTexture;
    uniform float uTime;

    void main() {
    vec4 texColor = texture2D(uSmokeTexture, vUV);
    float alpha = texColor.a * vColor.a;
    
    // Simple fade based on lifetime (already normalized and clamped)
    float finalAlpha = alpha * (1.0 - vLifetime);
    
    gl_FragColor = vec4(texColor.rgb, finalAlpha);
}
`;

    // Create and compile vertex shader first
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, particleVShaderCode);
    gl.compileShader(vShader);

    // Create and compile fragment shader
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, particleFShaderCode);
    gl.compileShader(fShader);

    // Check for shader compilation errors
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vShader));
        return null;
    }
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fShader));
        return null;
    }

    // Create and link shader program
    const particleProgram = gl.createProgram();
    gl.attachShader(particleProgram, vShader);
    gl.attachShader(particleProgram, fShader);
    gl.linkProgram(particleProgram);

    if (!gl.getProgramParameter(particleProgram, gl.LINK_STATUS)) {
        console.error('Shader program link error:', gl.getProgramInfoLog(particleProgram));
        return null;
    }

    // Store program in global scope
    window.particleProgram = {
        program: particleProgram,
        attributes: {
            position: gl.getAttribLocation(particleProgram, 'aPosition'),
            color: gl.getAttribLocation(particleProgram, 'aColor'),
            size: gl.getAttribLocation(particleProgram, 'aSize'),
            lifetime: gl.getAttribLocation(particleProgram, 'aLifetime'),
            velocity: gl.getAttribLocation(particleProgram, 'aVelocity'),
            texCoord: gl.getAttribLocation(particleProgram, 'aTexCoord')
        },
        uniforms: {
            projectionView: gl.getUniformLocation(particleProgram, 'uProjectionView'),
            time: gl.getUniformLocation(particleProgram, 'uTime'),
            eyePosition: gl.getUniformLocation(particleProgram, 'uEyePosition'),
            smokeTexture: gl.getUniformLocation(particleProgram, 'uSmokeTexture'),
            liquidTexture: gl.getUniformLocation(particleProgram, 'uLiquidTexture')
        },
        buffers: {} // Add this to store buffer objects
    };

    // Create buffers for each attribute
    const attributes = window.particleProgram.attributes;
    const buffers = window.particleProgram.buffers;

    // Create position buffer
    buffers.position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 0,    0, 0,
        1, -1, 0,     1, 0,
        1, 1, 0,      1, 1,
        -1, 1, 0,     0, 1
    ]), gl.STATIC_DRAW);

    // Create color buffer
    buffers.color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]), gl.STATIC_DRAW);

    // Create size buffer
    buffers.size = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        1, 1,
        1, 1,
        1, 1,
        1, 1
    ]), gl.STATIC_DRAW);

    // Create lifetime buffer
    buffers.lifetime = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lifetime);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0, 0, 0
    ]), gl.DYNAMIC_DRAW);

    // Create velocity buffer
    buffers.velocity = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ]), gl.STATIC_DRAW);

    // Create texCoord buffer
    buffers.texCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ]), gl.STATIC_DRAW);

    // Create index buffer
    buffers.indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]), gl.STATIC_DRAW);

    // Enable attributes and set up attribute pointers
    gl.useProgram(particleProgram);
    gl.enableVertexAttribArray(window.particleProgram.attributes.lifetime);
    
    if (attributes.position !== -1) {
        gl.enableVertexAttribArray(attributes.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
    }

    if (attributes.color !== -1) {
        gl.enableVertexAttribArray(attributes.color);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(attributes.color, 4, gl.FLOAT, false, 0, 0);
    }

    if (attributes.size !== -1) {
        gl.enableVertexAttribArray(attributes.size);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
        gl.vertexAttribPointer(attributes.size, 2, gl.FLOAT, false, 0, 0);
    }

    if (attributes.lifetime !== -1) {
        gl.enableVertexAttribArray(attributes.lifetime);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lifetime);
        gl.vertexAttribPointer(attributes.lifetime, 1, gl.FLOAT, false, 0, 0);
    }

    if (attributes.velocity !== -1) {
        gl.enableVertexAttribArray(attributes.velocity);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
        gl.vertexAttribPointer(attributes.velocity, 3, gl.FLOAT, false, 0, 0);
    }

    if (attributes.texCoord !== -1) {
        gl.enableVertexAttribArray(attributes.texCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
        gl.vertexAttribPointer(attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
    }

    // Switch back to the main shader program
    gl.useProgram(shaderProgram);

    return window.particleProgram;
}

class Particle {
    constructor(position, type) {
        this.position = vec3.clone(position);
        this.type = type;
        this.startTime = performance.now();
        this.age = 0;
        
        const config = PARTICLE_CONFIGS[type];
        this.lifetime = config.lifetime;
        
        // Initial velocity with burst effect
        this.velocity = vec3.fromValues(
            config.initialVelocityRange.x[0] + Math.random() * (config.initialVelocityRange.x[1] - config.initialVelocityRange.x[0]),
            config.initialVelocityRange.y[0] + Math.random() * (config.initialVelocityRange.y[1] - config.initialVelocityRange.y[0]),
            config.initialVelocityRange.z[0] + Math.random() * (config.initialVelocityRange.z[1] - config.initialVelocityRange.z[0])
        );
        
        // Initial properties
        this.size = config.startSize;
        this.alpha = config.startOpacity;
        this.color = vec3.fromValues(...config.startColor);
        
        // Additional physics properties
        this.angularVelocity = Math.random() * Math.PI * 2;
        this.phase = Math.random() * Math.PI * 2; // Random starting phase for swirl
    }

    // In Particle class, modify the update method
// In Particle class, update the update method:
// In Particle class, update the update method
update(deltaTime) {

    /* ----- age & physics forces (unchanged) ----- */
    this.age = performance.now() - this.startTime;
    const lifeT = Math.min(1, this.age / this.lifetime);

    const cfg = PARTICLE_CONFIGS[this.type];

    // buoyancy + gravity
    const accel = vec3.fromValues(
        0,
        cfg.physics.buoyancy * (1 - lifeT * lifeT) + cfg.physics.gravity,
        0
    );

    // simple turbulence
    this.velocity[0] += (Math.random() - 0.5) * cfg.turbulence.scale * deltaTime;
    this.velocity[2] += (Math.random() - 0.5) * cfg.turbulence.scale * deltaTime;
    vec3.scaleAndAdd(this.velocity, this.velocity, accel, deltaTime);
    vec3.scale(this.velocity, this.velocity,
               Math.pow(cfg.physics.drag, deltaTime * 60));

    /* ----- motion & collision ----- */
    const nextPos = vec3.scaleAndAdd(vec3.create(), this.position,
                                     this.velocity, deltaTime);

    const hit = checkParticleCollision(this, nextPos);
    if (hit.hit) {
        /* place particle exactly on the surface */
        vec3.copy(this.position, hit.point);

        /* reflect only the outward component, keep tangential velocity */
        const vn = vec3.dot(this.velocity, hit.normal);
        if (vn < 0) vec3.scaleAndAdd(this.velocity, this.velocity,
                                     hit.normal, -vn);   // kill inward part
        vec3.scale(this.velocity, this.velocity, 0.5);    // your damping factor
    } else {
        vec3.copy(this.position, nextPos);
    }

    /* ----- visual properties ----- */
    this.size  = cfg.startSize +
                 (cfg.endSize - cfg.startSize) * (1 - (1 - lifeT) ** 2);
    this.alpha = lifeT > 0.7
               ? cfg.startOpacity * (1 - (lifeT - 0.7) / 0.3)
               : cfg.startOpacity;

    return this.age < this.lifetime && this.alpha > 0.01;
};
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emitSmoke(position) {
        const config = PARTICLE_CONFIGS[PARTICLE_TYPES.SMOKE];
        const particleCount = config.maxParticles;
        
        // Emit in a more natural cone pattern
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 0.1; // Tighter initial spread
            const heightVariation = Math.random() * 0.05; // Small vertical variation
            
            const offset = vec3.fromValues(
                Math.cos(angle) * radius,
                heightVariation,
                Math.sin(angle) * radius
            );
            
            const emissionPos = vec3.add(vec3.create(), position, offset);
            const particle = new Particle(emissionPos, PARTICLE_TYPES.SMOKE);
            
            // Add random initial rotation
            particle.angularVelocity = (Math.random() - 0.5) * Math.PI;
            particle.phase = Math.random() * Math.PI * 2;
            
            this.particles.push(particle);
        }
    }

    update() {
        const currentTime = performance.now();
        // Ensure we have a valid last update time
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
            return;
        }
        
        // Calculate delta time in seconds with higher precision
        const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 1000.0, 0.1); // Cap at 100ms to avoid large jumps
        this.lastUpdateTime = currentTime;
    
        // Update and filter out dead particles
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }

    render() {
          if (this.particles.length === 0 || !window.DEBUG.SHOW_PARTICLES) {
            // console.log("Skipping particle render:", {
            //     particleCount: this.particles.length,
            //     debugEnabled: window.DEBUG.SHOW_PARTICLES
            // });
            return;
        }
    
        //console.log("Rendering particles:", this.particles.length); // Debug log
    
        gl.useProgram(window.particleProgram.program);

        // Enable depth testing but don't write to depth buffer
        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL)
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        gl.depthMask(false);
        
        // Enable blending for transparency
        
        
        this.particles.sort((a, b) => {
            const distA = vec3.squaredDistance(a.position, Eye);
            const distB = vec3.squaredDistance(b.position, Eye);
            return distB - distA;  // Sort back-to-front
        });

        // Update uniforms
        gl.uniformMatrix4fv(
            window.particleProgram.uniforms.projectionView,
            false,
            hpvMatrix
        );
        gl.uniform3fv(
            window.particleProgram.uniforms.eyePosition,
            Eye
        );
        gl.uniform1f(
            window.particleProgram.uniforms.time,
            (performance.now() % 15000) / 15000.0  // Creates a 0-1 cycle every second
        );

        
    
        // Bind smoke texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, window.particleTextures.smoke);
        gl.uniform1i(window.particleProgram.uniforms.smokeTexture, 0);
    
        // Bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, window.particleProgram.buffers.position);
        gl.vertexAttribPointer(window.particleProgram.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, window.particleProgram.buffers.texCoord);
        gl.vertexAttribPointer(window.particleProgram.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
    
        // Draw each particle
        this.particles.forEach(particle => {

            let normalizedLifetime = Math.min(1.0, Math.max(0.0, particle.age / particle.lifetime));
            normalizedLifetime = Math.round(normalizedLifetime * 1000) / 1000;

            const lifetimeArray = new Float32Array([
                normalizedLifetime,
                normalizedLifetime,
                normalizedLifetime,
                normalizedLifetime
            ]);

            // console.log("Particle lifetime:", particle.lifetime, "Normalized:", normalizedLifetime); // Debug log
            // Set particle-specific attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, window.particleProgram.buffers.lifetime);
            gl.bufferData(gl.ARRAY_BUFFER, lifetimeArray, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(window.particleProgram.attributes.lifetime, 1, gl.FLOAT, false, 0, 0);

            gl.vertexAttrib1f(window.particleProgram.attributes.lifetime, normalizedLifetime);
            gl.vertexAttrib2f(window.particleProgram.attributes.size, particle.size, particle.size);
            gl.vertexAttrib4f(window.particleProgram.attributes.color, particle.color[0], particle.color[1], particle.color[2], particle.alpha);
            
            // Update position buffer with particle position
            gl.bindBuffer(gl.ARRAY_BUFFER, window.particleProgram.buffers.position);
            const positions = new Float32Array([
                particle.position[0] - particle.size, particle.position[1] - particle.size, particle.position[2],
                particle.position[0] + particle.size, particle.position[1] - particle.size, particle.position[2],
                particle.position[0] + particle.size, particle.position[1] + particle.size, particle.position[2],
                particle.position[0] - particle.size, particle.position[1] + particle.size, particle.position[2]
            ]);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    
            // Draw particle
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        });
    
        // Reset state
        gl.depthMask(true);
        gl.depthFunc(gl.LESS); // Reset to default depth function
        gl.disable(gl.BLEND);
        gl.useProgram(shaderProgram);
    }
}

// Create particle system instance
const particleSystem = new ParticleSystem();



function createProjectile() {

    const lookDir = vec3.subtract(vec3.create(), Center, Eye);
    vec3.normalize(lookDir, lookDir);
    
    const right = vec3.cross(vec3.create(), lookDir, Up);
    vec3.normalize(right, right);

    const handOffset = {
        right: 0.3,  // Positive moves right
        down: -0.2,  // Negative moves down
        forward: 0.5  // How far forward from the camera
    };

    const startPos = vec3.create();
    vec3.scaleAndAdd(startPos, Eye, lookDir, handOffset.forward); // Move forward
    vec3.scaleAndAdd(startPos, startPos, right, -handOffset.right); // Move right
    vec3.scaleAndAdd(startPos, startPos, Up, handOffset.down); // Move down

    const projectile = {
        position: startPos,
        velocity: vec3.scale(vec3.create(), lookDir, PROJECTILE.INITIAL_SPEED),
        acceleration: vec3.fromValues(0, PROJECTILE.GRAVITY, 0),
        isResting: false,
        createTime: performance.now(),
        lastUpdateTime: performance.now(),
        // Define cube vertices
        vertices: new Float32Array([
            // Front face
            -PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
             PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
            -PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
            // Back face
            -PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
            -PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
            // Top face
            -PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE,
            -PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE,
            // Bottom face
            -PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
            -PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
            // Right face
             PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE,
             PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
             PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
            // Left face
            -PROJECTILE.SIZE, -PROJECTILE.SIZE, -PROJECTILE.SIZE,
            -PROJECTILE.SIZE, -PROJECTILE.SIZE,  PROJECTILE.SIZE,
            -PROJECTILE.SIZE,  PROJECTILE.SIZE,  PROJECTILE.SIZE,
            -PROJECTILE.SIZE,  PROJECTILE.SIZE, -PROJECTILE.SIZE
        ]),
        // Define indices for the cube
        indices: new Uint16Array([
            0,  1,  2,    0,  2,  3,    // Front
            4,  5,  6,    4,  6,  7,    // Back
            8,  9,  10,   8,  10, 11,   // Top
            12, 13, 14,   12, 14, 15,   // Bottom
            16, 17, 18,   16, 18, 19,   // Right
            20, 21, 22,   20, 22, 23    // Left
        ])
    };

    // Create WebGL buffers
    projectile.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, projectile.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, projectile.vertices, gl.STATIC_DRAW);

    projectile.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, projectile.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, projectile.indices, gl.STATIC_DRAW);

    projectiles.push(projectile);
}

function checkProjectileCollision(projectile, newPosition) {
    const result = {
        hit: false,
        normal: vec3.create(),
        point: vec3.create(),
        isWall: false
    };

    // Check floor collision first
    if (newPosition[1] < PROJECTILE.SIZE) {
        result.hit = true;
        result.normal = vec3.fromValues(0, 1, 0);
        result.point = vec3.clone(newPosition);
        result.point[1] = PROJECTILE.SIZE;
        return result;
    }

    if (newPosition[1] > CELL_HEIGHT - PROJECTILE.SIZE) {
        result.hit = true;
        result.normal = vec3.fromValues(0, -1, 0);  // Normal pointing down
        result.point = vec3.clone(newPosition);
        result.point[1] = CELL_HEIGHT - PROJECTILE.SIZE;
        result.isWall = false;  // Treat ceiling like floor
        return result;
    }

    // Check walls and other solid objects
    for(const room of inputRooms) {
        if(room.type === ROOM_TYPES.SOLID) {
            // Increase buffer size for faster projectiles
            const BUFFER = PROJECTILE.SIZE * 4;
            
            // Calculate ray from current position to new position
            const ray = vec3.subtract(vec3.create(), newPosition, projectile.position);
            const rayLength = vec3.length(ray);
            
            // Early exit if too far
            const maxDist = Math.max(
                room.bounds.max[0] - room.bounds.min[0],
                room.bounds.max[1] - room.bounds.min[1],
                room.bounds.max[2] - room.bounds.min[2]
            ) + BUFFER * 2;
            
            if (rayLength > maxDist) continue;

            // Check if either current or new position is near the wall
            const currentNearWall = (
                projectile.position[0] >= room.bounds.min[0] - BUFFER &&
                projectile.position[0] <= room.bounds.max[0] + BUFFER &&
                projectile.position[1] >= room.bounds.min[1] - BUFFER &&
                projectile.position[1] <= room.bounds.max[1] + BUFFER &&
                projectile.position[2] >= room.bounds.min[2] - BUFFER &&
                projectile.position[2] <= room.bounds.max[2] + BUFFER
            );

            const newPosNearWall = (
                newPosition[0] >= room.bounds.min[0] - BUFFER &&
                newPosition[0] <= room.bounds.max[0] + BUFFER &&
                newPosition[1] >= room.bounds.min[1] - BUFFER &&
                newPosition[1] <= room.bounds.max[1] + BUFFER &&
                newPosition[2] >= room.bounds.min[2] - BUFFER &&
                newPosition[2] <= room.bounds.max[2] + BUFFER
            );

            if (currentNearWall || newPosNearWall) {
                // Find closest point of intersection
                const distances = [
                    {normal: [-1, 0, 0], dist: Math.abs(newPosition[0] - room.bounds.max[0])},
                    {normal: [1, 0, 0], dist: Math.abs(newPosition[0] - room.bounds.min[0])},
                    {normal: [0, -1, 0], dist: Math.abs(newPosition[1] - room.bounds.max[1])},
                    {normal: [0, 1, 0], dist: Math.abs(newPosition[1] - room.bounds.min[1])},
                    {normal: [0, 0, -1], dist: Math.abs(newPosition[2] - room.bounds.max[2])},
                    {normal: [0, 0, 1], dist: Math.abs(newPosition[2] - room.bounds.min[2])}
                ];

                const closest = distances.reduce((prev, curr) => 
                    curr.dist < prev.dist ? curr : prev
                );

                result.hit = true;
                result.isWall = true;
                result.normal = vec3.fromValues(...closest.normal);
                
                // Calculate exact collision point
                const collisionPoint = vec3.create();
                vec3.copy(collisionPoint, projectile.position);
                const penetrationDepth = closest.dist;
                vec3.scaleAndAdd(collisionPoint, collisionPoint, result.normal, -penetrationDepth);
                result.point = collisionPoint;

                return result;
            }
        }
    }
    return result;
}

function handleCollision(projectile, collision) {
    const now = performance.now();
    if (projectile.lastCollisionTime && (now - projectile.lastCollisionTime) < 50) {
        return;
    }
    projectile.lastCollisionTime = now;
    
    const speed = vec3.length(projectile.velocity);
    
    // Ground collision with low speed - come to rest
    // In handleCollision function
if (!collision.isWall && 
    projectile.position[1] <= PROJECTILE.SIZE + 0.01 && 
    speed < PROJECTILE.MIN_SPEED) {
    
    console.log("Projectile coming to rest, emitting particles");
    projectile.isResting = true;
    projectile.velocity = vec3.fromValues(0, 0, 0);
    projectile.position[1] = PROJECTILE.SIZE;
    playSound('collision_projectile');
    
    if (!particleSystem) {
        console.error("Particle system not initialized!");
        return;
    }
    
    // More particles with bigger spread and size
    const config = PARTICLE_CONFIGS[PARTICLE_TYPES.SMOKE];
    const particleCount = config.maxParticles;
    console.log(`Attempting to emit ${particleCount} particles`);
    for (let i = 0; i < particleCount; i++) {
        const randomOffset = vec3.fromValues(
            (Math.random() - 0.5) * 0.2,
            0.1,
            (Math.random() - 0.5) * 0.2
        );
        const emissionPos = vec3.add(vec3.create(), projectile.position, randomOffset);
        particleSystem.emitSmoke(emissionPos);
    }
}

    
    // Regular collision handling
    if (!collision.isWall) {
        if (collision.point[1] >= CELL_HEIGHT - PROJECTILE.SIZE) {
            // Ceiling collision - just reverse vertical velocity with bounce factor
            projectile.velocity[1] = -Math.abs(projectile.velocity[1]) * PROJECTILE.BOUNCE;
        } else {
            // Floor collision
            projectile.velocity[1] = Math.abs(projectile.velocity[1]) * PROJECTILE.BOUNCE;
            projectile.velocity[0] *= PROJECTILE.GROUND_FRICTION;
            projectile.velocity[2] *= PROJECTILE.GROUND_FRICTION;
        }
        
        // Additional check for very small velocities after bounce (only for floor)
        if (vec3.length(projectile.velocity) < PROJECTILE.MIN_SPEED && 
            projectile.position[1] <= PROJECTILE.SIZE + 0.01) {
            projectile.isResting = true;
            projectile.velocity = vec3.fromValues(0, 0, 0);
            projectile.position[1] = PROJECTILE.SIZE;
        }
    } else {
        // Wall collision
        const dot = vec3.dot(projectile.velocity, collision.normal);
        const reflection = vec3.create();
        vec3.scale(reflection, collision.normal, 2 * dot);
        vec3.subtract(projectile.velocity, projectile.velocity, reflection);
        vec3.scale(projectile.velocity, projectile.velocity, PROJECTILE.BOUNCE);
        
        const pushDistance = PROJECTILE.SIZE * 2;
        vec3.scaleAndAdd(projectile.position, collision.point, collision.normal, pushDistance);
    }
    
    // Only play sound if not already at rest
    if (!projectile.isResting) {
        playSound('collision_projectile');
    }
}

function resizeToNextPowerOfTwo(image) {
    const canvas = document.createElement('canvas');
    const nextPowerOf2 = (value) => {
        let power = 1;
        while (power < value) power *= 2;
        return power;
    };
    
    canvas.width = nextPowerOf2(image.width);
    canvas.height = nextPowerOf2(image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function loadParticleTextures() {
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    function resizeToNextPowerOf2(image) {
        const canvas = document.createElement('canvas');
        const nextPowerOf2 = (value) => {
            let power = 1;
            while (power < value) power *= 2;
            return power;
        };
        
        canvas.width = nextPowerOf2(image.width);
        canvas.height = nextPowerOf2(image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    const textureLoader = (type) => {
        return new Promise((resolve, reject) => {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            // Set initial texture parameters for loading
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // Changed from CLAMP_TO_EDGE
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                
                let textureImage = image;
                // Check if image dimensions are powers of 2
                if (!isPowerOf2(image.width) || !isPowerOf2(image.height)) {
                    console.log(`Resizing ${type} texture to power of 2`);
                    textureImage = resizeToNextPowerOf2(image);
                }

                // Upload the power-of-2 image
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
                
                // Set texture parameters
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                
                resolve(texture);
            };
            
            image.onerror = (error) => {
                console.error(`Error loading ${type} texture:`, error);
                reject(error);
            };
            
            image.crossOrigin = "anonymous";
            image.src = PARTICLE_TEXTURES[type].URL;
        });
    };

    return Promise.all([
        textureLoader('SMOKE').then(texture => {
            window.particleTextures = window.particleTextures || {};
            window.particleTextures.smoke = texture;
        }),
        textureLoader('LIQUID').then(texture => {
            window.particleTextures = window.particleTextures || {};
            window.particleTextures.liquid = texture;
        })
    ]).catch(error => {
        console.error("Error loading particle textures:", error);
    });
}

// In updateProjectiles function, modify the projectile update loop:
function updateProjectiles() {
    const currentTime = performance.now();
    
    for(let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Skip if projectile is already marked as resting
        if (projectile.isResting) continue;

        // Calculate delta time
        const deltaTime = (currentTime - projectile.lastUpdateTime) / 1000;
        projectile.lastUpdateTime = currentTime;

        // Update velocity with acceleration (gravity)
        vec3.scaleAndAdd(projectile.velocity, projectile.velocity, projectile.acceleration, deltaTime);
        
        // Apply air friction
        vec3.scale(projectile.velocity, projectile.velocity, PROJECTILE.FRICTION);

        // Check if projectile should come to rest
        const speed = vec3.length(projectile.velocity);
        if (speed < PROJECTILE.MIN_SPEED && projectile.position[1] <= PROJECTILE.SIZE + 0.01) {
            // Mark as resting and emit particles
            projectile.isResting = true;
            projectile.velocity = vec3.fromValues(0, 0, 0);
            projectile.position[1] = PROJECTILE.SIZE;
            
            console.log("Projectile coming to rest naturally");
            playSound('collision_projectile');
            
            // Emit particles for resting projectile
            if (particleSystem) {
                const config = PARTICLE_CONFIGS[PARTICLE_TYPES.SMOKE];
                const particleCount = config.maxParticles;
                for (let j = 0; j < particleCount; j++) {
                    const randomOffset = vec3.fromValues(
                        (Math.random() - 0.5) * 0.2,
                        0.1,
                        (Math.random() - 0.5) * 0.2
                    );
                    const emissionPos = vec3.add(vec3.create(), projectile.position, randomOffset);
                    particleSystem.emitSmoke(emissionPos);
                }
            }
            continue;
        }

        // Calculate new position and check collisions
        const newPosition = vec3.create();
        vec3.scaleAndAdd(newPosition, projectile.position, projectile.velocity, deltaTime);
        const collision = checkProjectileCollision(projectile, newPosition);
        
        if (collision.hit) {
            handleCollision(projectile, collision);
        } else {
            vec3.copy(projectile.position, newPosition);
        }

        // Remove if lifetime expired
        if (currentTime - projectile.createTime > PROJECTILE.LIFETIME) {
            projectiles.splice(i, 1);
        }
    }
}

// Add this function to render the minimap
function renderMinimap() {
    if (!showMinimap) return;
    
    const ctx = window.minimapContext;
    if (!ctx) {
        console.error("No minimap context found");
        return;
    }

    // Clear minimap with dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, MINIMAP.SIZE, MINIMAP.SIZE);

    // Find map boundaries
    const mapWidth = Math.max(...inputRooms.map(r => r.position[0])) + 1;
    const mapHeight = Math.max(...inputRooms.map(r => r.position[2])) + 1;

    // Calculate scale to fit map in minimap with padding
    const padding = 20;
    const scale = Math.min(
        (MINIMAP.SIZE - padding * 2) / (mapWidth * MINIMAP.CELL_SIZE),
        (MINIMAP.SIZE - padding * 2) / (mapHeight * MINIMAP.CELL_SIZE)
    );

    // Center the map
    const offsetX = (MINIMAP.SIZE - mapWidth * MINIMAP.CELL_SIZE * scale) / 2;
    const offsetY = (MINIMAP.SIZE - mapHeight * MINIMAP.CELL_SIZE * scale) / 2;

    // Draw rooms with clear colors
    inputRooms.forEach(room => {
        const x = room.position[0] * MINIMAP.CELL_SIZE * scale + offsetX;
        const y = room.position[2] * MINIMAP.CELL_SIZE * scale + offsetY;
        const size = MINIMAP.CELL_SIZE * scale;

        // Set different colors based on room type and visibility
        ctx.fillStyle = MINIMAP.COLORS[
            room.type === ROOM_TYPES.SOLID ? 'WALL' :
            room.visible ? 'VISIBLE' : 'CULLED'
        ];

        // Draw room cell
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(x, y, size, size);
    });

    // Draw player position and direction
    const playerX = Eye[0] * MINIMAP.CELL_SIZE * scale + offsetX;
    const playerY = Eye[2] * MINIMAP.CELL_SIZE * scale + offsetY;
    
    // Draw player direction
    const lookDir = vec3.subtract(vec3.create(), Center, Eye);
    vec3.normalize(lookDir, lookDir);

    // Draw frustum if in frustum culling mode
    if (currentCullingMode === CULLING_MODES.FRUSTUM.id) {
        // Calculate frustum points
        const fov = Math.PI/3; // Same as your perspective matrix
        const aspectRatio = canvas.width / canvas.height;
        const frustumAngle = (fov * aspectRatio) / 2;
        
        // Increase line length significantly
        const frustumLength = 5.0; // Increased from 2.0 to 5.0
        const leftAngle = Math.atan2(lookDir[2], lookDir[0]) - frustumAngle;
        const rightAngle = Math.atan2(lookDir[2], lookDir[0]) + frustumAngle;
        
        // Draw just the lines, no fill
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        
        // Right line of frustum
        ctx.lineTo(
            playerX + Math.cos(rightAngle) * frustumLength * MINIMAP.CELL_SIZE * scale,
            playerY + Math.sin(rightAngle) * frustumLength * MINIMAP.CELL_SIZE * scale
        );
        
        // Move back to player position for left line
        ctx.moveTo(playerX, playerY);
        
        // Left line of frustum
        ctx.lineTo(
            playerX + Math.cos(leftAngle) * frustumLength * MINIMAP.CELL_SIZE * scale,
            playerY + Math.sin(leftAngle) * frustumLength * MINIMAP.CELL_SIZE * scale
        );
        
        // Draw the lines
        ctx.strokeStyle = MINIMAP.COLORS.FRUSTUM;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw view direction line
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(
        playerX + lookDir[0] * MINIMAP.CELL_SIZE * scale,
        playerY + lookDir[2] * MINIMAP.CELL_SIZE * scale
    );
    ctx.strokeStyle = MINIMAP.COLORS.PLAYER;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw player position
    ctx.beginPath();
    ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = MINIMAP.COLORS.PLAYER;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
}

window.addEventListener('beforeunload', () => {
    // Stop all sounds
    Object.keys(window.sounds).forEach(soundName => {
        stopSound(soundName);
    });
});

function switchScene(newRoomsUrl) {
    
    console.log("Switching scene to:", newRoomsUrl);
    Object.keys(window.sounds).forEach(soundName => {
        stopSound(soundName);
    });

    try {
        // Clear existing buffers
        vertexBuffers.forEach(buffer => gl.deleteBuffer(buffer));
        normalBuffers.forEach(buffer => gl.deleteBuffer(buffer));
        uvBuffers.forEach(buffer => gl.deleteBuffer(buffer));
        triangleBuffers.forEach(buffer => gl.deleteBuffer(buffer));
        textures.forEach(texture => gl.deleteTexture(texture));
        
        // Reset arrays
        vertexBuffers = [];
        normalBuffers = [];
        uvBuffers = [];
        triangleBuffers = [];
        textures = [];
        inputRooms = [];
        triSetSizes = [];
        inputTriangles = [];
        inputSpheres = [];
        
        // Reset camera position
        Eye = vec3.clone(defaultEye);
        Center = vec3.clone(defaultCenter);
        Up = vec3.clone(defaultUp);
        
        // Load new room data
        const roomData = getJSONFile(newRoomsUrl, "rooms");
        if (!roomData) {
            console.error("Failed to load alternate room data");
            return;
        }
        
        console.log("Room data loaded successfully");
        
        // Make sure we're using our shader program
        gl.useProgram(shaderProgram);
        
        // Reinitialize scene
        loadRoomData(roomData);
        loadModels();
        
        console.log("Scene switch completed");
    } catch (error) {
        console.error("Error during scene switch:", error);
    }
}

function makeModelTransform(currModel) {
    var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCenter = vec3.create();

    vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
    mat4.set(sumRotation,
        currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
        currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
        currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
        0, 0, 0, 1);
    vec3.negate(negCenter,currModel.center);
    mat4.multiply(sumRotation,sumRotation,mat4.fromTranslation(temp,negCenter));
    mat4.multiply(sumRotation,mat4.fromTranslation(temp,currModel.center),sumRotation);
    mat4.fromTranslation(mMatrix,currModel.translation);
    mat4.multiply(mMatrix,mMatrix,sumRotation);
}

function logRoomState() {
    console.log("Current Room:", currentRoom ? currentRoom.id : "none");
    console.log("Eye Position:", Eye);
    console.log("Visible Rooms:", inputRooms.filter(r => r.type === ROOM_TYPES.ROOM && r.visible)
        .map(r => r.id));

}

function checkCollision(newPosition) {
    // Check collision with walls and solid cells
    for(const room of inputRooms) {
        if(room.type === ROOM_TYPES.SOLID) {
            const COLLISION_BUFFER = 0.15;
            
            const expandedBounds = {
                min: vec3.fromValues(
                    room.bounds.min[0] - COLLISION_BUFFER,
                    room.bounds.min[1],        // Floor height
                    room.bounds.min[2] - COLLISION_BUFFER
                ),
                max: vec3.fromValues(
                    room.bounds.max[0] + COLLISION_BUFFER,
                    CELL_HEIGHT,               // Ceiling height
                    room.bounds.max[2] + COLLISION_BUFFER
                )
            };

            // Check if new position intersects with bounds
            if(newPosition[0] >= expandedBounds.min[0] && newPosition[0] <= expandedBounds.max[0] &&
               newPosition[1] >= expandedBounds.min[1] && newPosition[1] <= expandedBounds.max[1] &&
               newPosition[2] >= expandedBounds.min[2] && newPosition[2] <= expandedBounds.max[2]) {
                return false; // Collision detected
            }
        }
    }
    return true; // No collision
}

function loadRoomData(alternateRoomData=null) {
    // Load models first
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL, "triangles");
    inputSpheres = getJSONFile(INPUT_SPHERES_URL, "spheres");
    if (!inputTriangles || !inputSpheres) throw "Unable to load input files!";

    // Initialize model properties
    inputTriangles.forEach(triangle => {
        triangle.center = vec3.fromValues(0, 0, 0);
        triangle.translation = vec3.fromValues(0, 0, 0);
        triangle.xAxis = vec3.fromValues(1, 0, 0);
        triangle.yAxis = vec3.fromValues(0, 1, 0);
        triangle.on = false;
    });

    inputSpheres.forEach(sphere => {
        sphere.center = vec3.fromValues(0, 0, 0);
        sphere.translation = vec3.fromValues(0, 0, 0);
        sphere.xAxis = vec3.fromValues(1, 0, 0);
        sphere.yAxis = vec3.fromValues(0, 1, 0);
        sphere.on = false;
    });

    // Load room data
    const roomData = alternateRoomData || getJSONFile(INPUT_ROOMS_URL, "rooms");
    if (!roomData) throw "Unable to load rooms file!";

    const layout = roomData.rooms;
    const furniture = roomData.furniture;

    // Create room lookup table
    let roomLookup = new Map();

    let roomCounter = 0; // Ensure unique IDs

    const roomMap = {}; // Store unique rooms by ID

    layout.forEach((row, z) => {
        row.forEach((cell, x) => {
            if (cell === ROOM_TYPES.ROOM) {
                let roomId = `${x}_${z}`;  // Unique ID based on grid position
                
                if (!roomMap[roomId]) { // Create room if it doesn't exist
                    roomMap[roomId] = {
                        id: roomId,
                        type: ROOM_TYPES.ROOM,
                        gridPosition: { x, z },
                        localOrigin: vec3.fromValues(x, 0, z),
                        position: vec3.fromValues(x, 0, z),
                        cells: [] // Ensure cells are initialized
                    };
                }
                
                roomMap[roomId].cells.push({ id: roomId, bounds: computeBounds(x, z) });
            }
        });
    });
    
    // Convert roomMap to inputRooms array
    inputRooms = Object.values(roomMap);

    // Process room layout
    // In loadRoomData(), modify the room creation section:
    for(let z = 0; z < layout.length; z++) {
        for(let x = 0; x < layout[z].length; x++) {
            const cell = layout[z][x];
            const worldX = x;
            const worldZ = z;
            
            if(typeof cell === 'number') {
                // Room cell with proper coordinate system
                const room = {
                    id: cell,
                    type: ROOM_TYPES.ROOM,
                    // Store grid position
                    gridPosition: {x: x, z: z},
                    // World position (for rendering)
                    position: vec3.fromValues(x, 0, z),
                    // Local origin is cell center
                    localOrigin: vec3.fromValues(x + 0.5, 0.5, z + 0.5),
                    bounds: {
                        min: vec3.fromValues(x, 0, z),
                        max: vec3.fromValues(x + 1, CELL_HEIGHT, z + 1)
                    },
                    visible: true,
                    furniture: []
                };
                addRoomLighting(room);
                inputRooms.push(room);
                roomLookup.set(cell, room);
            }
            else if(cell === ROOM_TYPES.SOLID) {
                // Solid wall
                inputRooms.push({
                    type: ROOM_TYPES.SOLID,
                    position: vec3.fromValues(worldX, 0, worldZ),
                    bounds: {
                        min: vec3.fromValues(worldX, 0, worldZ),
                        max: vec3.fromValues(worldX + 1, CELL_HEIGHT, worldZ + 1)
                    }
                });
            }
        }
    }

    // Process furniture after rooms are created
    furniture.forEach(([roomId, x, z, type, modelId]) => {
        console.log(`Loading furniture: Room ${roomId}, Type ${type}, Model ${modelId}, Position (${x}, ${z})`);
        const room = roomLookup.get(roomId);
        if(room) {
            // Store local cell coordinates
            const localPosition = {
                x: x + 0.5,    // Center in cell horizontally
                y: 0.5,        // Center in cell vertically
                z: z + 0.5     // Center in cell depth-wise
            };
            
            if(type === "sphere" && inputSpheres[modelId]) {
                const sphere = inputSpheres[modelId];
                sphere.roomId = roomId;
                sphere.localCoords = localPosition;
                sphere.center = vec3.fromValues(0,0,0);
                
                // Set sphere world position
                sphere.x = room.position[0] + localPosition.x;
                sphere.y = localPosition.y;
                sphere.z = room.position[2] + localPosition.z;
                
                // Set translation
                vec3.set(sphere.translation,
                    room.position[0] + localPosition.x,
                    localPosition.y,
                    room.position[2] + localPosition.z
                );
            } else if(type === "triangleset" && inputTriangles[modelId]) {
                const triSet = inputTriangles[modelId];
                triSet.roomId = roomId;
                triSet.localCoords = {
                    x: x,              // Raw local X coordinate
                    y: 0.5,           // Fixed height
                    z: z               // Raw local Z coordinate
                };
                triSet.center = vec3.fromValues(0,0,0);
                vec3.set(triSet.translation, 0, 0, 0);
                
                console.log(`Triangle Set ${modelId} assigned to Room ${roomId}:`, {
                    roomBase: {x: room.position[0], z: room.position[2]},
                    localCoords: triSet.localCoords,
                    worldPos: {
                        x: room.position[0] + x,
                        z: room.position[2] + z
                    }
                });
            }
            
            room.furniture.push({
                type: type,
                modelId: modelId,
                localPosition: vec3.fromValues(localPosition.x, localPosition.y, localPosition.z)
            });
        }
    });

    console.log("Triangle Sets:", inputTriangles.map(t => ({
        roomId: t.roomId,
        localCoords: t.localCoords,
        translation: t.translation
    })));
    console.log("Spheres:", inputSpheres.map(s => ({
        roomId: s.roomId,
        localCoords: s.localCoords,
        position: {x: s.x, y: s.y, z: s.z}
    })));
    // Generate room geometry
    // In loadRoomData(), update the geometry generation section:
inputRooms.forEach((room, index) => {
    if(room.type === ROOM_TYPES.ROOM) {
        const geometry = generateRoomGeometry(room, layout);
        
        // Create WebGL buffers for the room
        room.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, room.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        room.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, room.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

        room.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, room.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW);

        room.triangleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, room.triangleBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.triangles, gl.STATIC_DRAW);

        room.triangleCount = geometry.triangles.length;

        // Load room textures
        const textureIndex = numTriangleSets + numSpheres + index;
        loadTexture(textureIndex, room, ROOM_TEXTURES.WALL);
        room.textureIndex = textureIndex;
    }
});

    // Set view delta
    viewDelta = CELL_SIZE / 5;
    const room0 = inputRooms.find(r => r.type === ROOM_TYPES.ROOM && r.id === 0);
if(room0) {
    console.log("Room 0 bounds:", room0.bounds);
    console.log("Room 0 position:", room0.position);
}


console.log("=== Model Loading Debug ===");
console.log("Number of triangle sets:", inputTriangles.length);
console.log("Number of spheres:", inputSpheres.length);
console.log("Triangle Sets:", inputTriangles.map(t => ({
    roomId: t.roomId,
    localCoords: t.localCoords,
    translation: t.translation,
    material: t.material
})));
console.log("Spheres:", inputSpheres.map(s => ({
    roomId: s.roomId,
    localCoords: s.localCoords,
    x: s.x,
    y: s.y,
    z: s.z,
    r: s.r
})));

    return true;
}

function updateFrustumVisibility(planes) {
    if (!planes) return;
    
    let visibleRooms = 0;
    let visibleTriangles = 0;

    // Reset visibility of all rooms
    inputRooms.forEach(room => {
        if (room.type === ROOM_TYPES.ROOM) {
            room.visible = isBoxInFrustum(room.bounds, planes);
            if (room.visible) {
                visibleRooms++;
                visibleTriangles += room.triangleCount / 3;
                console.log(`Room ${room.id} visible with ${room.triangleCount/3} triangles`);
            }
        }
    });

    console.log(`Total visible triangles: ${visibleTriangles}`);
    perfStats.roomsVisible = visibleRooms;
    perfStats.trianglesRendered = visibleTriangles;
}

function extractFrustumPlanes(pvMatrix) {
    const fpArray = new Array(6);
    for (let i = 0; i < 6; i++) {
        fpArray[i] = vec4.create();
    }

    // Left plane
    fpArray[0] = vec4.fromValues(
        pvMatrix[3] + pvMatrix[0],
        pvMatrix[7] + pvMatrix[4],
        pvMatrix[11] + pvMatrix[8],
        pvMatrix[15] + pvMatrix[12]
    );

    // Right plane
    fpArray[1] = vec4.fromValues(
        pvMatrix[3] - pvMatrix[0],
        pvMatrix[7] - pvMatrix[4],
        pvMatrix[11] - pvMatrix[8],
        pvMatrix[15] - pvMatrix[12]
    );

    // Bottom plane
    fpArray[2] = vec4.fromValues(
        pvMatrix[3] + pvMatrix[1],
        pvMatrix[7] + pvMatrix[5],
        pvMatrix[11] + pvMatrix[9],
        pvMatrix[15] + pvMatrix[13]
    );

    // Top plane
    fpArray[3] = vec4.fromValues(
        pvMatrix[3] - pvMatrix[1],
        pvMatrix[7] - pvMatrix[5],
        pvMatrix[11] - pvMatrix[9],
        pvMatrix[15] - pvMatrix[13]
    );

    // Near plane
    fpArray[4] = vec4.fromValues(
        pvMatrix[3] + pvMatrix[2],
        pvMatrix[7] + pvMatrix[6],
        pvMatrix[11] + pvMatrix[10],
        pvMatrix[15] + pvMatrix[14]
    );

    // Far plane
    fpArray[5] = vec4.fromValues(
        pvMatrix[3] - pvMatrix[2],
        pvMatrix[7] - pvMatrix[6],
        pvMatrix[11] - pvMatrix[10],
        pvMatrix[15] - pvMatrix[14]
    );

    // Normalize all planes
    for (let i = 0; i < 6; i++) {
        const fplength = Math.sqrt(
            fpArray[i][0] * fpArray[i][0] +
            fpArray[i][1] * fpArray[i][1] +
            fpArray[i][2] * fpArray[i][2]
        );
        vec4.scale(fpArray[i], fpArray[i], 1 / fplength);
    }

    return fpArray;
}

function isBoxInFrustum(bounds, frustumPlanes) {
    // Convert bounds to array of vertices
    const vertices = [
        [bounds.min[0], bounds.min[1], bounds.min[2]], // 000
        [bounds.max[0], bounds.min[1], bounds.min[2]], // 100
        [bounds.min[0], bounds.max[1], bounds.min[2]], // 010
        [bounds.max[0], bounds.max[1], bounds.min[2]], // 110
        [bounds.min[0], bounds.min[1], bounds.max[2]], // 001
        [bounds.max[0], bounds.min[1], bounds.max[2]], // 101
        [bounds.min[0], bounds.max[1], bounds.max[2]], // 011
        [bounds.max[0], bounds.max[1], bounds.max[2]]  // 111
    ];

    // Test against each plane
    for (let i = 0; i < 6; i++) {
        let inside = false;
        const plane = frustumPlanes[i];

        // Test all vertices against this plane
        for (let j = 0; j < 8; j++) {
            const vertex = vertices[j];
            const distance = 
                plane[0] * vertex[0] + 
                plane[1] * vertex[1] + 
                plane[2] * vertex[2] + 
                plane[3];

            if (distance >= 0) {
                inside = true;
                break;
            }
        }

        // If all vertices are outside this plane, the box is outside the frustum
        if (!inside) {
            return false;
        }
    }

    return true;
}


function frustumCullCell(cell, viewWindow) {
    
    if (!cell || cell.rendered) return;
    cell.rendered = true;
    cell.visible = true;

    const room = inputRooms.find(r => r && r.type === ROOM_TYPES.ROOM && r.id == cell.id);
    console.log("Looking for room with ID:", cell.id);
    console.log("Available rooms:", inputRooms.map(r => r.id));
    if (!room || !room.cells) return;
    // Expand visibility to all cells in the current room inside the frustum
    room.cells.forEach(adjCell => {
        const isVisible = isBoxInFrustum(adjCell.bounds, viewWindow);
        console.log("Checking cell:", adjCell.id, "Visible:", isVisible);
        
        if (!adjCell.rendered && isVisible) {
            console.log("Rendering cell:", adjCell.id);
            adjCell.rendered = true;
            adjCell.visible = true;
        }
    });
    

    
}



function createCellFrustum(eyePosition, cellBounds) {
    // Define the 8 corners of the cell
    const corners = [
        [cellBounds.min[0], cellBounds.min[1], cellBounds.min[2]], // 000
        [cellBounds.max[0], cellBounds.min[1], cellBounds.min[2]], // 100
        [cellBounds.min[0], cellBounds.max[1], cellBounds.min[2]], // 010
        [cellBounds.max[0], cellBounds.max[1], cellBounds.min[2]], // 110
        [cellBounds.min[0], cellBounds.min[1], cellBounds.max[2]], // 001
        [cellBounds.max[0], cellBounds.min[1], cellBounds.max[2]], // 101
        [cellBounds.min[0], cellBounds.max[1], cellBounds.max[2]], // 011
        [cellBounds.max[0], cellBounds.max[1], cellBounds.max[2]]  // 111
    ];

    const planes = [];

    // Create side planes from eye through cell edges
    const edges = [
        [0, 1], [1, 3], [3, 2], [2, 0], // front face
        [4, 5], [5, 7], [7, 6], [6, 4], // back face
        [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    ];

    for (const [i1, i2] of edges) {
        const p1 = corners[i1];
        const p2 = corners[i2];
        
        // Calculate vectors for plane
        const v1 = vec3.subtract(vec3.create(), p1, eyePosition);
        const v2 = vec3.subtract(vec3.create(), p2, eyePosition);
        const normal = vec3.cross(vec3.create(), v1, v2);
        vec3.normalize(normal, normal);

        // Create plane equation (ax + by + cz + d = 0)
        planes.push([
            normal[0],
            normal[1],
            normal[2],
            -(normal[0] * eyePosition[0] + 
              normal[1] * eyePosition[1] + 
              normal[2] * eyePosition[2])
        ]);
    }

    // Add near and far planes of the cell
    const center = vec3.fromValues(
        (cellBounds.min[0] + cellBounds.max[0]) / 2,
        (cellBounds.min[1] + cellBounds.max[1]) / 2,
        (cellBounds.min[2] + cellBounds.max[2]) / 2
    );

    // Near plane (facing into the cell)
    const toEye = vec3.subtract(vec3.create(), eyePosition, center);
    vec3.normalize(toEye, toEye);
    planes.push([
        toEye[0],
        toEye[1],
        toEye[2],
        -(toEye[0] * cellBounds.min[0] + 
          toEye[1] * cellBounds.min[1] + 
          toEye[2] * cellBounds.min[2])
    ]);

    // Far plane (facing away from eye)
    planes.push([
        -toEye[0],
        -toEye[1],
        -toEye[2],
        toEye[0] * cellBounds.max[0] + 
        toEye[1] * cellBounds.max[1] + 
        toEye[2] * cellBounds.max[2]
    ]);

    return planes;
}

function computeScreenIntersection(windowA, windowB) {
    if(!windowA || !windowB) return null;

    const intersection = {
        min: {
            x: Math.max(windowA.min.x, windowB.min.x),
            y: Math.max(windowA.min.y, windowB.min.y)
        },
        max: {
            x: Math.min(windowA.max.x, windowB.max.x),
            y: Math.min(windowA.max.y, windowB.max.y)
        }
    };

    // Check if intersection is valid
    if(intersection.min.x < intersection.max.x && 
       intersection.min.y < intersection.max.y) {
        return intersection;
    }
    return null;
}


// Add after loadRoomData
function updateRoomVisibility(planes) {
    let visibleRooms = 0;
    let visibleTriangles = 0;

    // Reset all visibility first
    inputRooms.forEach(room => {
        if(room.type === ROOM_TYPES.ROOM) {
            room.visible = false;
        }
    });

    switch(currentCullingMode) {
        case CULLING_MODES.FRUSTUM.id:
            // Frustum culling
            inputRooms.forEach(room => {
                if(room.type === ROOM_TYPES.ROOM) {
                    room.visible = isBoxInFrustum(room.bounds, planes);
                    if(room.visible) {
                        visibleRooms++;
                        visibleTriangles += room.triangleCount / 3;
                    }
                }
            });
            break;

        case CULLING_MODES.NONE.id:
        default:
            // No culling - show everything
            inputRooms.forEach(room => {
                if(room.type === ROOM_TYPES.ROOM) {
                    room.visible = true;
                    visibleRooms++;
                    visibleTriangles += room.triangleCount / 3;
                }
            });
            break;
    }
    
    perfStats.roomsVisible = visibleRooms;
    perfStats.trianglesRendered = visibleTriangles;
}

function addRoomLighting(room) {
    // Calculate center cell position
    const centerX = room.position[0] + 0.5;
    const centerZ = room.position[2] + 0.5;
    
    room.light = {
        position: vec3.fromValues(centerX, CELL_HEIGHT - 0.1, centerZ),
        ambient: vec3.fromValues(1, 1, 1),
        diffuse: vec3.fromValues(1, 1, 1),
        specular: vec3.fromValues(1, 1, 1)
    };
}

function generateRoomGeometry(room, layout) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    const triangles = [];
    let vertexCount = 0;

    // Helper function for adding quads
    function addQuad(v1, v2, v3, v4, normal, isWall) {
        vertices.push(...v1, ...v2, ...v3, ...v4);
        for(let i = 0; i < 4; i++) normals.push(...normal);
        
        if(isWall) {
            const width = Math.sqrt(
                Math.pow(v2[0] - v1[0], 2) + 
                Math.pow(v2[2] - v1[2], 2)
            );
            const height = v3[1] - v2[1];
            uvs.push(0, 0, width, 0, width, height, 0, height);
        } else {
            const scaleU = Math.abs(v2[0] - v1[0]);
            const scaleV = Math.abs(v4[2] - v1[2]);
            uvs.push(0,0, scaleU,0, scaleU,scaleV, 0,scaleV);
        }
        
        triangles.push(
            vertexCount, vertexCount + 1, vertexCount + 2,
            vertexCount, vertexCount + 2, vertexCount + 3
        );
        vertexCount += 4;
    }

// Add floor and ceiling for all rooms
addQuad(
    [room.bounds.min[0], room.bounds.min[1], room.bounds.min[2]],
    [room.bounds.max[0], room.bounds.min[1], room.bounds.min[2]],
    [room.bounds.max[0], room.bounds.min[1], room.bounds.max[2]],
    [room.bounds.min[0], room.bounds.min[1], room.bounds.max[2]],
    [0, 1, 0],
    false
);

addQuad(
    [room.bounds.min[0], room.bounds.max[1], room.bounds.min[2]],
    [room.bounds.max[0], room.bounds.max[1], room.bounds.min[2]],
    [room.bounds.max[0], room.bounds.max[1], room.bounds.max[2]],
    [room.bounds.min[0], room.bounds.max[1], room.bounds.max[2]],
    [0, -1, 0],
    false
);

const roomX = Math.floor(room.position[0]);
const roomZ = Math.floor(room.position[2]);

// Determine which walls to add based on room type and neighbors
const directions = [
    { dx: 0, dz: -1, normal: [0, 0, -1], side: 'north' }, // North
    { dx: 0, dz: 1, normal: [0, 0, 1], side: 'south' },   // South
    { dx: -1, dz: 0, normal: [-1, 0, 0], side: 'west' },  // West
    { dx: 1, dz: 0, normal: [1, 0, 0], side: 'east' }     // East
];

directions.forEach(dir => {
    const nextX = roomX + dir.dx;
    const nextZ = roomZ + dir.dz;
    const nextCell = nextZ >= 0 && nextZ < layout.length && 
                    nextX >= 0 && nextX < layout[0].length ? layout[nextZ][nextX] : null;

    // Determine if we should add a wall for this direction
    let addWall = false;

    
        // For regular rooms, add wall if next cell is solid or out of bounds
        addWall = nextCell === null || nextCell === ROOM_TYPES.SOLID || 
                ( ((room.orientation === 'horizontal' && (dir.side !== 'east' && dir.side !== 'west')) ||
                  (room.orientation === 'vertical' && (dir.side !== 'north' && dir.side !== 'south'))));

    if (addWall) {
        const isVertical = dir.dx !== 0;
        const wallX = dir.dx > 0 ? room.bounds.max[0] : room.bounds.min[0];
        const wallZ = dir.dz > 0 ? room.bounds.max[2] : room.bounds.min[2];

        addQuad(
            [isVertical ? wallX : room.bounds.min[0], room.bounds.min[1], isVertical ? room.bounds.min[2] : wallZ],
            [isVertical ? wallX : room.bounds.max[0], room.bounds.min[1], isVertical ? room.bounds.max[2] : wallZ],
            [isVertical ? wallX : room.bounds.max[0], room.bounds.max[1], isVertical ? room.bounds.max[2] : wallZ],
            [isVertical ? wallX : room.bounds.min[0], room.bounds.max[1], isVertical ? room.bounds.min[2] : wallZ],
            dir.normal,
            true
        );
    }
});

return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    triangles: new Uint16Array(triangles)
};
}

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles", SPHERE: "sphere"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        else
            handleKeyDown.modelOn = inputSpheres[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model

    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {
        
        // model selection
        case "Space": 
            if (handleKeyDown.modelOn != null)
                handleKeyDown.modelOn.on = false; // turn off highlighted model
            handleKeyDown.modelOn = null; // no highlighted model
            handleKeyDown.whichOn = -1; // nothing highlighted
            break;
        case "ArrowRight": // select next triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn+1) % numTriangleSets);
            break;
        case "ArrowLeft": // select previous triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numTriangleSets-1);
            break;
        case "ArrowUp": // select next sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn+1) % numSpheres);
            break;
        case "ArrowDown": // select previous sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numSpheres-1);
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye,defaultEye);
            Center = vec3.copy(Center,defaultCenter);
            Up = vec3.copy(Up,defaultUp);
            break;
            
        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,viewRight,viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,lookAt,-viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,lookAt,viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift 
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,Up,viewDelta));
            break;
        case "KeyB": // Toggle debug visualization
            window.debugCulling = !window.debugCulling;
        case "KeyV": // Toggle particle visualization
            window.DEBUG.SHOW_PARTICLES = !window.DEBUG.SHOW_PARTICLES;
            console.log("Particle visualization:", window.DEBUG.SHOW_PARTICLES, 
                "Particle count:", particleSystem.particles.length);
            break;
        case "KeyP": // Toggle performance stats
        if (!event.shiftKey) { // Only toggle if shift is not pressed
            showPerfStats = !showPerfStats;
        } else {
            // Original 'P' key behavior with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,Up,-viewDelta));
        }
        break;
        case "Digit1":
            if (event.shiftKey) {
                console.log("Switching scene...");
                switchScene(ALTERNATE_ROOMS_URL);
                useAlternateTexture = !useAlternateTexture;
                console.log("Switching wall texture...");
                inputRooms.forEach(room => {
                    if (room.type === ROOM_TYPES.ROOM) {
                        const textureFile = useAlternateTexture ? ROOM_TEXTURES.WALL_ALT : ROOM_TEXTURES.WALL;
                        loadTexture(room.textureIndex, room, textureFile);
                    }
                });
            } else {
                currentCullingMode = CULLING_MODES.NONE.id;
            }
            break;
        case "Digit2": 
            currentCullingMode = CULLING_MODES.FRUSTUM.id;
            break;
        case "KeyM": // Toggle minimap
        showMinimap = !showMinimap;
        console.log("Minimap toggled:", showMinimap);
        const minimapCanvas = document.getElementById('minimapCanvas');
        if (minimapCanvas) {
            minimapCanvas.style.display = showMinimap ? 'block' : 'none';
            if (showMinimap) {
                console.log("Minimap dimensions:", minimapCanvas.width, minimapCanvas.height);
                console.log("Minimap position:", minimapCanvas.style.right, minimapCanvas.style.bottom);
            }
        }
        break;
        case "Backspace": // reset model transforms to default
            for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
                vec3.set(inputTriangles[whichTriSet].translation,0,0,0);
                vec3.set(inputTriangles[whichTriSet].xAxis,1,0,0);
                vec3.set(inputTriangles[whichTriSet].yAxis,0,1,0);
            } // end for all triangle sets
            for (var whichSphere=0; whichSphere<numSpheres; whichSphere++) {
                vec3.set(inputSpheres[whichSphere].translation,0,0,0);
                vec3.set(inputSpheres[whichSphere].xAxis,1,0,0);
                vec3.set(inputSpheres[whichSphere].yAxis,0,1,0);
            } // end for all spheres
            break;
    } // end switch
} // end handleKeyDown

function drawBoundingBox(bounds, color) {
    // Create line vertices for box edges
    const vertices = new Float32Array([
        // Front face
        bounds.min[0], bounds.min[1], bounds.min[2],
        bounds.max[0], bounds.min[1], bounds.min[2],
        bounds.max[0], bounds.min[1], bounds.min[2],
        bounds.max[0], bounds.max[1], bounds.min[2],
        bounds.max[0], bounds.max[1], bounds.min[2],
        bounds.min[0], bounds.max[1], bounds.min[2],
        bounds.min[0], bounds.max[1], bounds.min[2],
        bounds.min[0], bounds.min[1], bounds.min[2],

        // Back face
        bounds.min[0], bounds.min[1], bounds.max[2],
        bounds.max[0], bounds.min[1], bounds.max[2],
        bounds.max[0], bounds.min[1], bounds.max[2],
        bounds.max[0], bounds.max[1], bounds.max[2],
        bounds.max[0], bounds.max[1], bounds.max[2],
        bounds.min[0], bounds.max[1], bounds.max[2],
        bounds.min[0], bounds.max[1], bounds.max[2],
        bounds.min[0], bounds.min[1], bounds.max[2],

        // Connecting edges
        bounds.min[0], bounds.min[1], bounds.min[2],
        bounds.min[0], bounds.min[1], bounds.max[2],
        bounds.max[0], bounds.min[1], bounds.min[2],
        bounds.max[0], bounds.min[1], bounds.max[2],
        bounds.max[0], bounds.max[1], bounds.min[2],
        bounds.max[0], bounds.max[1], bounds.max[2],
        bounds.min[0], bounds.max[1], bounds.min[2],
        bounds.min[0], bounds.max[1], bounds.max[2]
    ]);

    // Create and bind vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Set up debug shader program if not already created
    if (!window.debugShaderProgram) {
        const vShaderCode = `
            attribute vec3 aPosition;
            uniform mat4 uPVMMatrix;
            void main() {
                gl_Position = uPVMMatrix * vec4(aPosition, 1.0);
            }
        `;

        const fShaderCode = `
            precision mediump float;
            uniform vec4 uColor;
            void main() {
                gl_FragColor = uColor;
            }
        `;

        const vShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, vShaderCode);
        gl.compileShader(vShader);

        const fShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, fShaderCode);
        gl.compileShader(fShader);

        const debugProgram = gl.createProgram();
        gl.attachShader(debugProgram, vShader);
        gl.attachShader(debugProgram, fShader);
        gl.linkProgram(debugProgram);

        window.debugShaderProgram = debugProgram;
        window.debugPositionLoc = gl.getAttribLocation(debugProgram, 'aPosition');
        window.debugPVMMatrixLoc = gl.getUniformLocation(debugProgram, 'uPVMMatrix');
        window.debugColorLoc = gl.getUniformLocation(debugProgram, 'uColor');
    }

    // Use debug shader program
    gl.useProgram(window.debugShaderProgram);

    // Set up attributes and uniforms
    gl.enableVertexAttribArray(window.debugPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(window.debugPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(window.debugPVMMatrixLoc, false, hpvmMatrix);
    gl.uniform4fv(window.debugColorLoc, color);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Draw the bounding box lines
    gl.drawArrays(gl.LINES, 0, 24);

    // Cleanup
    gl.disable(gl.BLEND);
    gl.deleteBuffer(vertexBuffer);

    // Switch back to main shader program
    gl.useProgram(shaderProgram);
}

function displayPerfStats() {
    const stats = document.getElementById('perfStats');
    if (!showPerfStats) {
        if (stats) stats.style.display = 'none';
        return;
    }
    
    const statsElement = stats || createStatsElement();
    statsElement.style.display = 'block';
    
    const modeName = Object.entries(CULLING_MODES)
        .find(([_, mode]) => mode.id === currentCullingMode)?.[1].name;
    
    statsElement.innerHTML = `
        Mode: ${modeName}
        FPS: ${Math.round(perfStats.fps)}
        Frame Time: ${perfStats.frameTime.toFixed(2)}ms (${perfStats.frameCount < 10 ? 'warming up' : 'avg'})
        Triangles: ${perfStats.trianglesRendered}
        Cells: ${perfStats.roomsVisible/2}
        Spheres: ${perfStats.spheresVisible}
        Triangles: ${perfStats.triangleSetsVisible}
    `;
}

function createStatsElement() {
    const stats = document.createElement('div');
    stats.id = 'perfStats';
    stats.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        white-space: pre;
        pointer-events: none;
    `;
    document.body.appendChild(stats);
    return stats;
}


function renderDebugCulling() {
    if (!window.debugCulling) return;

    const colors = {
        visible: [0, 1, 0, 0.2],      // Green for visible
        culled: [1, 0, 0, 0.2],       // Red for culled
        frustum: [1, 1, 0, 0.1]       // Yellow for frustum
    };

    // Draw room bounds
    inputRooms.forEach(room => {
        if(room.type === ROOM_TYPES.ROOM) {
            const color = room.visible ? colors.visible : colors.culled;
            drawBoundingBox(room.bounds, color);
        }
    });

    // Draw frustum bounds
    if(currentCullingMode === CULLING_MODES.FRUSTUM.id) {
        // Calculate frustum corners and draw them
        const corners = calculateFrustumCorners(pMatrix, vMatrix);
        drawFrustumLines(corners, colors.frustum);
    }
}

// set up the webGL environment
function setupWebGL() {
    // Set up keys
    document.onkeydown = handleKeyDown;

    // Create a webgl canvas and set it up
    canvas = document.getElementById("myWebGLCanvas");
    
    // Try different context creation approaches
    try {
        // First try with basic attributes
        gl = canvas.getContext('webgl', {
            alpha: true,
            depth: true,
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        if (!gl) {
            // Fallback attempt without specific attributes
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        }

        if (!gl) {
            throw new Error("Unable to create WebGL context");
        }

        // Initialize WebGL context
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Set viewport
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Log successful initialization
        console.log("WebGL context created successfully");

    } catch (e) {
        console.error("WebGL context creation failed:", e);
        alert("Failed to initialize WebGL. Your browser may not support it.");
        return null;
    }
}
// Add this function before loadModels()
function loadTexture(whichModel, currModel, textureFile) {
    textures[whichModel] = gl.createTexture();
    const currTexture = textures[whichModel];
    gl.bindTexture(gl.TEXTURE_2D, currTexture);
    
    // Load 1x1 gray placeholder
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([64, 64, 64, 255]));

    if (textureFile) {
        currTexture.image = new Image();
        currTexture.image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, currTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currTexture.image);
            
            // Check if image dimensions are powers of 2
            const isPowerOf2 = (value) => (value & (value - 1)) === 0;
            if (isPowerOf2(currTexture.image.width) && isPowerOf2(currTexture.image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            } else {
                // For non-power-of-2 textures
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
        }
        currTexture.image.onerror = function() {
            console.log("Unable to load texture " + textureFile);
        }
        currTexture.image.crossOrigin = "anonymous";
        currTexture.image.src = textureFile.startsWith('http') ? textureFile : INPUT_URL + textureFile;
    }

    // Set initial texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
// read models in, load them into webgl buffers
function loadModels() {

    
    // make a sphere with radius 1 at the origin, with numLongSteps longitudes. 
    // Returns verts, tris and normals.
    function makeSphere(numLongSteps) {
        
        try {
            if (numLongSteps % 2 != 0)
                throw "in makeSphere: uneven number of longitude steps!";
            else if (numLongSteps < 4)
                throw "in makeSphere: number of longitude steps too small!";
            else { // good number longitude steps
            
                // make vertices, normals and uvs -- repeat longitude seam
                const INVPI = 1/Math.PI, TWOPI = Math.PI+Math.PI, INV2PI = 1/TWOPI, epsilon=0.001*Math.PI;
                var sphereVertices = [0,-1,0]; // vertices to return, init to south pole
                var sphereUvs = [0.5,0]; // uvs to return, bottom texture row collapsed to one texel
                var angleIncr = TWOPI / numLongSteps; // angular increment 
                var latLimitAngle = angleIncr * (Math.floor(numLongSteps*0.25)-1); // start/end lat angle
                var latRadius, latY, latV; // radius, Y and texture V at current latitude
                for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle+epsilon; latAngle+=angleIncr) {
                    latRadius = Math.cos(latAngle); // radius of current latitude
                    latY = Math.sin(latAngle); // height at current latitude
                    latV = latAngle*INVPI + 0.5; // texture v = (latAngle + 0.5*PI) / PI
                    for (var longAngle=0; longAngle<=TWOPI+epsilon; longAngle+=angleIncr) { // for each long
                        sphereVertices.push(-latRadius*Math.sin(longAngle),latY,latRadius*Math.cos(longAngle));
                        sphereUvs.push(longAngle*INV2PI,latV); // texture u = (longAngle/2PI)
                    } // end for each longitude
                } // end for each latitude
                sphereVertices.push(0,1,0); // add north pole
                sphereUvs.push(0.5,1); // top texture row collapsed to one texel
                var sphereNormals = sphereVertices.slice(); // for this sphere, vertices = normals; return these

                // make triangles, first poles then middle latitudes
                var sphereTriangles = []; // triangles to return
                var numVertices = Math.floor(sphereVertices.length/3); // number of vertices in sphere
                for (var whichLong=1; whichLong<=numLongSteps; whichLong++) { // poles
                    sphereTriangles.push(0,whichLong,whichLong+1);
                    sphereTriangles.push(numVertices-1,numVertices-whichLong-1,numVertices-whichLong-2);
                } // end for each long
                var llVertex; // lower left vertex in the current quad
                for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                    for (var whichLong=0; whichLong<numLongSteps; whichLong++) {
                        llVertex = whichLat*(numLongSteps+1) + whichLong + 1;
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+numLongSteps+2);
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+2,llVertex+1);
                    } // end for each longitude
                } // end for each latitude
            } // end if good number longitude steps
            return({vertices:sphereVertices, normals:sphereNormals, uvs:sphereUvs, triangles:sphereTriangles});
        } // end try
        
        catch(e) {
            console.log(e);
        } // end catch
    } // end make sphere
    
    //inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var currSet; // the current triangle set
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the vertices array
            var normToAdd; // vtx normal to add to the normal array
            var uvToAdd; // uv coords to add to the uv arry
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                currSet = inputTriangles[whichSet];
                
                // set up hilighting, modeling translation and rotation
                currSet.center = vec3.fromValues(0,0,0);  // center point of tri set
                currSet.on = false; // not highlighted
                currSet.translation = vec3.fromValues(0,0,0); // no translation
                currSet.xAxis = vec3.fromValues(1,0,0); // model X axis
                currSet.yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex, normal and uv arrays, define model center and axes
                currSet.glVertices = []; // flat coord list for webgl
                currSet.glNormals = []; // flat normal list for webgl
                currSet.glUvs = []; // flat texture coord list for webgl
                var numVerts = currSet.vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = currSet.vertices[whichSetVert]; // get vertex to add
                    normToAdd = currSet.normals[whichSetVert]; // get normal to add
                    uvToAdd = currSet.uvs[whichSetVert]; // get uv to add
                    currSet.glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set vertex list
                    currSet.glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set normal list
                    currSet.glUvs.push(uvToAdd[0],uvToAdd[1]); // put uv in set uv list
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(currSet.center,currSet.center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(currSet.center,currSet.center,1/numVerts); // avg ctr sum

                // send the vertex coords, normals and uvs to webGL; load texture
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glNormals),gl.STATIC_DRAW); // data in
                uvBuffers[whichSet] = gl.createBuffer(); // init empty webgl set uv coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glUvs),gl.STATIC_DRAW); // data in
                loadTexture(whichSet,currSet,currSet.material.texture); // load tri set's texture

                // set up the triangle index array, adjusting indices across sets
                currSet.glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = currSet.triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = currSet.triangles[whichSetTri]; // get tri to add
                    currSet.glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(currSet.glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set 
        
            //inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres"); // read in the sphere data

            if (inputSpheres == String.null)
                throw "Unable to load spheres file!";
            else {
                
                // init sphere highlighting, translation and rotation; update bbox
                var sphere; // current sphere
                var temp = vec3.create(); // an intermediate vec3
                var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from sphere
                numSpheres = inputSpheres.length; // remember how many spheres
                for (var whichSphere=0; whichSphere<numSpheres; whichSphere++) {
                    sphere = inputSpheres[whichSphere];
                    sphere.on = false; // spheres begin without highlight
                    sphere.translation = vec3.fromValues(0,0,0); // spheres begin without translation
                    sphere.xAxis = vec3.fromValues(1,0,0); // sphere X axis
                    sphere.yAxis = vec3.fromValues(0,1,0); // sphere Y axis 
                    sphere.center = vec3.fromValues(0,0,0); // sphere instance is at origin
                    vec3.set(minXYZ,sphere.x-sphere.r,sphere.y-sphere.r,sphere.z-sphere.r); 
                    vec3.set(maxXYZ,sphere.x+sphere.r,sphere.y+sphere.r,sphere.z+sphere.r); 
                    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner
                    loadTexture(numTriangleSets+whichSphere,sphere,sphere.texture); // load the sphere's texture
                } // end for each sphere
                viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set global

                // make one sphere instance that will be reused, with 32 longitude steps
                var oneSphere = makeSphere(32);

                // send the sphere vertex coords and normals to webGL
                vertexBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.vertices),gl.STATIC_DRAW); // data in
                normalBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.normals),gl.STATIC_DRAW); // data in
                uvBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex uv buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[uvBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.uvs),gl.STATIC_DRAW); // data in
        
                triSetSizes.push(oneSphere.triangles.length);

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(oneSphere.triangles),gl.STATIC_DRAW); // data in
            } // end if sphere file loaded
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aVertexUV; // vertex texture uv
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 vVertexUV; // interpolated uv for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            
            // vertex uv
            vVertexUV = aVertexUV;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        
        // texture properties
        uniform bool uUsingTexture; // if we are using a texture
        uniform sampler2D uTexture; // the texture for the fragment
        varying vec2 vVertexUV; // texture uv of fragment
            
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to find lit color
            vec3 litColor = ambient + diffuse + specular; 
            
            if (!uUsingTexture) {
                gl_FragColor = vec4(litColor, 1.0);
            } else {
                vec4 texColor = texture2D(uTexture, vec2(vVertexUV.s, vVertexUV.t));
            
                // gl_FragColor = vec4(texColor.rgb * litColor, texColor.a);
                gl_FragColor = vec4(texColor.rgb * litColor, texColor.a);
            } // end if using texture
        } // end main
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                vUVAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexUV"); // ptr to vertex UV attrib
                gl.enableVertexAttribArray(vUVAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                usingTextureULoc = gl.getUniformLocation(shaderProgram, "uUsingTexture"); // ptr to using texture
                textureULoc = gl.getUniformLocation(shaderProgram, "uTexture"); // ptr to texture
                
                // pass global (not per model) constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

const movement = {
    speed: 0.01,         // Base movement speed
    mouseSensitivity: 0.002  // Mouse look sensitivity
};

function setupControls() {
    // Key listeners remain the same
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'KeyW': keys.w = true; break;
            case 'KeyA': keys.a = true; break;
            case 'KeyS': keys.s = true; break;
            case 'KeyD': keys.d = true; break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch(e.code) {
            case 'KeyW': keys.w = false; break;
            case 'KeyA': keys.a = false; break;
            case 'KeyS': keys.s = false; break;
            case 'KeyD': keys.d = false; break;
        }
    });

    // Modified mouse look controls
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            const dx = e.movementX * movement.mouseSensitivity;
            const dy = e.movementY * movement.mouseSensitivity;
            
            // Get current look direction
            const lookDir = vec3.subtract(vec3.create(), Center, Eye);
            
            // Rotate camera left/right (around Y axis)
            const rotationMatrix = mat4.create();
            mat4.rotateY(rotationMatrix, rotationMatrix, dx);
            vec3.transformMat4(lookDir, lookDir, rotationMatrix);
            
            // Calculate right vector for up/down rotation
            const right = vec3.cross(vec3.create(), lookDir, Up);
            vec3.normalize(right, right);
            
            // Limit vertical rotation to avoid flipping
            const currentPitch = Math.asin(lookDir[1] / vec3.length(lookDir));
            const newPitch = currentPitch - dy;
            if (newPitch < Math.PI/2 && newPitch > -Math.PI/2) {
                const pitchMatrix = mat4.create();
                mat4.rotate(pitchMatrix, pitchMatrix, -dy, right);
                vec3.transformMat4(lookDir, lookDir, pitchMatrix);
            }

            // Update Center position based on Eye position and look direction
            vec3.normalize(lookDir, lookDir);
            vec3.scaleAndAdd(Center, Eye, lookDir, 1.0); // Keep Center 1 unit away from Eye
        }
    });

    // Lock pointer on canvas click remains the same
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });
}

// Add this function to handle movement
function updateMovement() {
    const lookDir = vec3.subtract(vec3.create(), Center, Eye);
    vec3.normalize(lookDir, lookDir);
    
    const flatLookDir = vec3.fromValues(lookDir[0], 0, lookDir[2]);
    vec3.normalize(flatLookDir, flatLookDir);
    
    const right = vec3.cross(vec3.create(), flatLookDir, Up);
    vec3.normalize(right, right);
    
    const movement_vector = vec3.create();
    
    // Store previous position in case of collision
    const previousEye = vec3.clone(Eye);
    const previousCenter = vec3.clone(Center);
    
    // Handle WASD movement
    if(keys.w) vec3.add(movement_vector, movement_vector, flatLookDir);
    if(keys.s) vec3.subtract(movement_vector, movement_vector, flatLookDir);
    if(keys.a) vec3.add(movement_vector, movement_vector, right);
    if(keys.d) vec3.subtract(movement_vector, movement_vector, right);

    const isMoving = keys.w || keys.a || keys.s || keys.d;
    
    if (isMoving) {
        if (!window.footstepTimeout) {
            playSound('footsteps', true);
            window.footstepTimeout = setTimeout(() => {
                window.footstepTimeout = null;
            }, 100); // 100ms debounce
        }
    } else {
        if (window.footstepTimeout) {
            clearTimeout(window.footstepTimeout);
            window.footstepTimeout = null;
        }
        stopSound('footsteps');
    }
    
    if(vec3.length(movement_vector) > 0) {
        vec3.normalize(movement_vector, movement_vector);
        vec3.scale(movement_vector, movement_vector, movement.speed);
        
        const newEye = vec3.add(vec3.create(), Eye, movement_vector);
        newEye[1] = Math.max(0.5, Math.min(CELL_HEIGHT - 0.5, newEye[1]));
        
        // Only move if no collision
        if(checkCollision(newEye)) {
            vec3.copy(Eye, newEye);
            const heightDiff = Center[1] - Eye[1];
            vec3.add(Center, newEye, vec3.scale(vec3.create(), lookDir, 1.0));
            Center[1] = newEye[1] + heightDiff;
            // Reset collision state when moving freely
            window.lastCollisionTime = 0;
        } else {
            // Check if enough time has passed since last collision sound
            const now = performance.now();
            if (!window.lastCollisionTime || (now - window.lastCollisionTime) > 2000) { // 500ms debounce
                playSound('collision');
                window.lastCollisionTime = now;
            }
            vec3.copy(Eye, previousEye);
            vec3.copy(Center, previousCenter);
        }
    }
    
}

// render the loaded model
function renderModels() {

    /* ---------- frame setup & book-keeping ---------- */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // fresh frame
    gl.enable(gl.DEPTH_TEST);

    const frameStartTime = performance.now();
    updateMovement();
    updateProjectiles();

    // … (perfStats maintenance – unchanged) …

    /* ---------- update view / projection matrices ---------- */
    mat4.fromScaling(hMatrix, vec3.fromValues(-1, 1, 1));        // right-handed to left-handed
    mat4.perspective(pMatrix, Math.PI / 3,
                     gl.canvas.width / gl.canvas.height,
                     0.1, 30.0);
    mat4.lookAt(vMatrix, Eye, Center, Up);
    mat4.multiply(hpvMatrix, hMatrix, pMatrix);
    mat4.multiply(hpvMatrix, hpvMatrix, vMatrix);

    /* ---------- visibility / culling ---------- */
    const planes = extractFrustumPlanes(hpvMatrix);
    updateRoomVisibility(planes);

    /* ---------- 1. opaque geometry pass (rooms, projectiles) ---------- */
    inputRooms.forEach(room => {
        if (room.type === ROOM_TYPES.ROOM && room.visible) {

            mat4.identity(mMatrix);
            mat4.multiply(hpvmMatrix, hpvMatrix, mMatrix);

            gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix);
            gl.uniformMatrix4fv(pvmMatrixULoc, false, hpvmMatrix);
            gl.uniform3fv(ambientULoc, ROOM_MATERIAL.ambient);
            gl.uniform3fv(diffuseULoc, ROOM_MATERIAL.diffuse);
            gl.uniform3fv(specularULoc, ROOM_MATERIAL.specular);
            gl.uniform1f(shininessULoc, ROOM_MATERIAL.n);
            gl.uniform1i(usingTextureULoc, true);

            gl.bindBuffer(gl.ARRAY_BUFFER, room.vertexBuffer);
            gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, room.normalBuffer);
            gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, room.uvBuffer);
            gl.vertexAttribPointer(vUVAttribLoc, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textures[room.textureIndex]);
            gl.uniform1i(textureULoc, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, room.triangleBuffer);
            gl.drawElements(gl.TRIANGLES, room.triangleCount, gl.UNSIGNED_SHORT, 0);
        }
    });

    projectiles.forEach(p => {
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, p.position);
        mat4.multiply(hpvmMatrix, hpvMatrix, mMatrix);

        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix);
        gl.uniformMatrix4fv(pvmMatrixULoc, false, hpvmMatrix);
        gl.uniform3fv(ambientULoc, [0.8, 0, 0]);
        gl.uniform3fv(diffuseULoc, [1, 0, 0]);
        gl.uniform3fv(specularULoc, [0.8, 0.8, 0.8]);
        gl.uniform1f(shininessULoc, 100.0);
        gl.uniform1i(usingTextureULoc, false);

        gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexBuffer);
        gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.indexBuffer);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    });

    /* ---------- 2. translucent particle pass ---------- */
    if (particleSystem) {

        const saveDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        const hadDepthTest  = gl.isEnabled(gl.DEPTH_TEST);
        const hadBlend      = gl.isEnabled(gl.BLEND);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);            // first sub-pass writes depth

        particleSystem.update();
        particleSystem.render();       // does its two-pass peel internally

        // restore previous GL state
        if (!hadDepthTest) gl.disable(gl.DEPTH_TEST);
        gl.depthMask(saveDepthMask);
        if (!hadBlend)     gl.disable(gl.BLEND);
    }

    /* ---------- 3. HUD / hand sprite pass ---------- */
    gl.disable(gl.DEPTH_TEST);         // overlay ignores scene depth
    if (handSprite) renderHandSprite(handSprite);
    gl.enable(gl.DEPTH_TEST);          // restore for next frame

    /* ---------- misc overlays ---------- */
    renderMinimap();
    displayPerfStats();
    renderDebugCulling();

    /* ---------- schedule next frame ---------- */
    window.requestAnimationFrame(renderModels);
}

function rayPlane(t0, p0, p1, axis, plane) {
    const v = p1[axis] - p0[axis];
    if (Math.abs(v) < 1e-6) return null;                 // parallel
    const t = (plane - p0[axis]) / v;
    if (t <= 0 || t > 1)      return null;               // behind or past end
    return t0 + t * (1 - t0);                            // absolute t ∈ (0,1]
}

function setupMouseControls() {
    // Add pointer lock change event listener
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== canvas) {
            // Pointer was unlocked, reset projectile counter
            initialClick = 0;
            console.log("Pointer unlocked - projectiles disabled");
        }
    });

    // Mouse click handler
    document.addEventListener('mousedown', (e) => {
        if(e.button === 0) { // Left click
            if(initialClick > 0 && handSprite.animationState === HAND_ANIMATION.IDLE) {
                handSprite.animationState = HAND_ANIMATION.THROW_WINDUP;
                handSprite.animationTime = 0;
            } else {
                initialClick++;
                console.log("First click detected - projectiles enabled");
            }
        }
    });

    // Separate escape key handler
    document.addEventListener('keydown', (event) => {
        if(event.code === "Escape") {
            // Force pointer unlock
            if (document.pointerLockElement === canvas) {
                document.exitPointerLock();
            }
            // Reset projectile counter
            initialClick = 0;
            console.log("Projectiles disabled - requires first click");
        }
    }, true); // Add 'true' for capturing phase
}

/* MAIN -- HERE is where execution begins after window load */

async function main() {
    setupWebGL();
    setupShaders();
    setupParticleShaders();
    
    // Wait for particle textures to load
    await new Promise((resolve) => {
        loadParticleTextures();
        const checkTextures = setInterval(() => {
            if (window.particleTextures && 
                window.particleTextures.smoke && 
                window.particleTextures.liquid) {
                clearInterval(checkTextures);
                resolve();
            }
        }, 100);
    });

    // Initialize particle system after textures are loaded
    window.particleSystem = new ParticleSystem();
    console.log("Particle system initialized with textures");
    
    setupControls();
    setupMouseControls();
    setupMinimap();
    setupAudio();
    loadRoomData();
    loadModels();
    handSprite = createHandSprite();
    
    // Start rendering
    renderModels();
}

// Change how we call main
window.onload = () => {
    main().catch(console.error);
};