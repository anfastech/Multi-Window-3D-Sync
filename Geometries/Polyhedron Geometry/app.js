class WindowManager {
	#windows;
	#count;
	#id;
	#winData;
	#winShapeChangeCallback;
	#winChangeCallback;

	constructor() {
		let that = this;

		addEventListener("storage", (event) => {
			if (event.key == "windows") {
				let newWindows = JSON.parse(event.newValue);
				let winChange = that.#didWindowsChange(that.#windows, newWindows);
				that.#windows = newWindows;
				if (winChange && that.#winChangeCallback) that.#winChangeCallback();
			}
		});

		window.addEventListener('beforeunload', function(e) {
			let index = that.getWindowIndexFromId(that.#id);
			that.#windows.splice(index, 1);
			that.updateWindowsLocalStorage();
		});
	}

	#didWindowsChange(pWins, nWins) {
		if (pWins.length !== nWins.length) {
			return true;
		} else {
			for (let i = 0; i < pWins.length; i++) {
				if (pWins[i].id !== nWins[i].id) {
					return true;
				}
			}
			return false;
		}
	}

	init(metaData) {
		this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
		this.#count = +localStorage.getItem("count") || 0;
		this.#count++;
		this.#id = this.#count;
		let shape = this.getWinShape();
		this.#winData = {
			id: this.#id,
			shape: shape,
			metaData: metaData
		};
		this.#windows.push(this.#winData);
		localStorage.setItem("count", this.#count);
		this.updateWindowsLocalStorage();
	}

	getWinShape() {
		return {
			x: window.screenX,
			y: window.screenY,
			w: window.innerWidth,
			h: window.innerHeight
		};
	}

	getWindowIndexFromId(id) {
		return this.#windows.findIndex(win => win.id === id);
	}

	updateWindowsLocalStorage() {
		localStorage.setItem("windows", JSON.stringify(this.#windows));
	}

	update() {
		let winShape = this.getWinShape();
		if (JSON.stringify(winShape) !== JSON.stringify(this.#winData.shape)) {
			this.#winData.shape = winShape;
			let index = this.getWindowIndexFromId(this.#id);
			this.#windows[index].shape = winShape;
			if (this.#winShapeChangeCallback) this.#winShapeChangeCallback();
			this.updateWindowsLocalStorage();
		}
	}

	setWinShapeChangeCallback(callback) {
		this.#winShapeChangeCallback = callback;
	}

	setWinChangeCallback(callback) {
		this.#winChangeCallback = callback;
	}

	getWindows() {
		return this.#windows;
	}

	getThisWindowData() {
		return this.#winData;
	}

	getThisWindowID() {
		return this.#id;
	}
}

let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let Polyhedrons = [];
let sceneOffsetTarget = {
	x: 0,
	y: 0
};
let sceneOffset = {
	x: 0,
	y: 0
};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

function getTime() {
	return (new Date().getTime() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear")) {
	localStorage.clear();
} else {
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState != 'hidden' && !initialized) {
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden') {
			init();
		}
	};

	function init() {
		initialized = true;
		setTimeout(() => {
			setupScene();
			setupWindowManager();
			resize();
			updateWindowShape(false);
			render();
			window.addEventListener('resize', resize);
		}, 500);
	}

	function setupScene() {
		camera = new THREE.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
		camera.position.z = 2.5;
		near = camera.position.z - .5;
		far = camera.position.z + 0.5;

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0.0);
		scene.add(camera);

		renderer = new THREE.WebGLRenderer({
			antialias: true,
			depthBuffer: true
		});
		renderer.setPixelRatio(pixR);
		world = new THREE.Object3D();
		scene.add(world);

		renderer.domElement.setAttribute("id", "scene");
		document.body.appendChild(renderer.domElement);
	}

	function setupWindowManager() {
		windowManager = new WindowManager();
		windowManager.setWinShapeChangeCallback(updateWindowShape);
		windowManager.setWinChangeCallback(windowsUpdated);
		let metaData = {
			foo: "bar"
		};
		windowManager.init(metaData);
		windowsUpdated();
	}

	function windowsUpdated() {
		updateNumberOfPolyhedrons();
	}

    function updateNumberOfPolyhedrons() {
    let wins = windowManager.getWindows();
    Polyhedrons.forEach((c) => {
        world.remove(c);
    })

	const verticesOfCube = [
		-1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
		-1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
	];
	
	const indicesOfFaces = [
		2,1,0,    0,3,2,
		0,4,7,    7,3,0,
		0,1,5,    5,4,0,
		1,2,6,    6,5,1,
		2,3,7,    7,6,2,
		4,5,6,    6,7,4
	];

    Polyhedrons = [];
    for (let i = 0; i < wins.length; i++) {
        let win = wins[i];
        let c = new THREE.Color();
		
        c.setHSL(i * .1, 1.0, .5);
        let Polyhedron = 
            new THREE.Mesh(
            new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 80, 2 ),
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true
        }));
        
        Polyhedron.position.x = win.shape.x + (win.shape.w * .5);
        Polyhedron.position.y = win.shape.y + (win.shape.h * .5);

        world.add(Polyhedron);
        Polyhedrons.push(Polyhedron);
    }
}
	function updateWindowShape(easing = true) {
		sceneOffsetTarget = {
			x: -window.screenX,
			y: -window.screenY
		};
		if (!easing) sceneOffset = sceneOffsetTarget;
	}

	function render() {
		let time = getTime();
		windowManager.update();
		let falloff = .05;
		sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
		sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);
		world.position.x = sceneOffset.x;
		world.position.y = sceneOffset.y;
		let wins = windowManager.getWindows();
		for (let i = 0; i < Polyhedrons.length; i++) {
			let Polyhedron = Polyhedrons[i];
			let win = wins[i];
			let _time = time;
			let posTarget = {
				x: win.shape.x + (win.shape.w * .5),
				y: win.shape.y + (win.shape.h * .5)
			};
			Polyhedron.position.x = Polyhedron.position.x + (posTarget.x - Polyhedron.position.x) * falloff;
			Polyhedron.position.y = Polyhedron.position.y + (posTarget.y - Polyhedron.position.y) * falloff;
			Polyhedron.rotation.x = _time * .5;
			Polyhedron.rotation.y = _time * .3;
		};
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	function resize() {
		let width = window.innerWidth;
		let height = window.innerHeight
		camera = new THREE.OrthographicCamera(0, width, 0, height, -10000, 10000);
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}
}
