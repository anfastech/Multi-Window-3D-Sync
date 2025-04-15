# Multiple Window Mesh Sync 3D Visualizer

![Live Demo GIF](media/MultiWindow3D.gif)

A real-time multi-window tracking and visualization system using `localStorage`, `THREE.js`, and a custom `WindowManager` class. Each browser window is represented as a 3D cube that reflects its size and position on the screen.

## Features

- 📦 Tracks multiple open browser windows
- 🧠 Each window is synced via `localStorage`
- 🔁 Updates shape and position when resized or moved
- 🧊 Visualizes each window as a 3D cube using `THREE.js`
- 🎨 Each cube is color-coded and animated
- 🔄 Smooth transitions and easing effects
- ⚡ Real-time updates using the `storage` event

## How It Works

1. Each browser window initializes a `WindowManager` instance.
2. The window's position and size are stored in `localStorage`.
3. `storage` event listeners sync updates across windows.
4. 3D cubes are created in a WebGL scene to represent each window.
5. Cube positions update with animations reflecting their associated window's shape.

## Visual Representation
Each window = One animated cube 🧊\
Window position & size = Cube position & size\
Window movement = Smooth cube transitions\
Window close = Cube disappears

## Structure and Components
- `index.html`: Entry point that sets up the HTML structure and includes the Three.js library and the main script.
- `WindowManager.js`: Core class managing window creation, synchronization, and state management across multiple windows.
- `main.js`: Contains the logic for initializing the 3D scene, handling window events, and rendering the scene.
- `three.r124.min.js`: Minified version of the Three.js library used for 3D graphics rendering.

## Tech Used
- `JavaScript`
- `THREE.js`
- `WebGL`
- `localStorage` API

##  Get Started

1\. Open \`index.html\` in your browser.

2\. Open the same file in \*\*multiple tabs or windows\*\*.

3\. Move/resize each window.

4\. Watch cubes animate in real-time!


## ⚠️ Notes
\- This project is best experienced on a desktop browser.

