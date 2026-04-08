import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const container = document.getElementById('heroBust');
if (container) init(container);

function init(container) {
  // Scene
  const scene = new THREE.Scene();

  // Camera — narrow FOV for portrait-like framing
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // Rembrandt Lighting
  const keyLight = new THREE.DirectionalLight(0xfff4e6, 3.0);
  keyLight.position.set(3, 4, 2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd4e5f7, 1.0);
  fillLight.position.set(-3, 1, 1);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 1.5);
  rimLight.position.set(2, 2, -3);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  // Mouse tracking — reads from global set by inline script in HTML
  const MAX_ROT_X = 0.15; // ~8.5deg vertical
  const MAX_ROT_Y = 0.25; // ~14deg horizontal

  // Model
  let bust = null;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load('models/bust.glb', (gltf) => {
    bust = gltf.scene;

    // Auto-center and scale
    const box = new THREE.Box3().setFromObject(bust);
    const center = box.getCenter(new THREE.Vector3());
    bust.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.6 / maxDim;
    bust.scale.setScalar(scale);

    // Override material to warm marble
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xe8e4dc,
      roughness: 0.65,
      metalness: 0,
    });
    bust.traverse((child) => {
      if (child.isMesh) {
        child.material = marbleMat;
      }
    });

    scene.add(bust);
  });

  // Visibility optimization — skip rendering when off-screen
  let isVisible = true;
  const observer = new IntersectionObserver(
    ([entry]) => { isVisible = entry.isIntersecting; },
    { threshold: 0 }
  );
  observer.observe(container);

  // Scroll effects (uses GSAP ScrollTrigger if available)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Negative parallax — bust scrolls slower, lingering on screen longer
    gsap.to(container, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Fade out towards end of hero
    gsap.to(container, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: '60% top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // Render loop — independent from GSAP ticker
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || !bust) return;

    // Idle motion — faster on mobile/tablet, slower on desktop
    const isMobile = window.innerWidth <= 1024;
    const time = performance.now() * 0.001;
    const idleX = Math.sin(time * (isMobile ? 0.7 : 0.4)) * (isMobile ? 0.12 : 0.08);
    const idleY = Math.sin(time * (isMobile ? 0.45 : 0.25)) * (isMobile ? 0.18 : 0.12);

    // Layer cursor tracking on top of idle motion
    const cursorX = window.__mouseActive ? window.__mouseY * MAX_ROT_X : 0;
    const cursorY = window.__mouseActive ? window.__mouseX * MAX_ROT_Y : 0;

    bust.rotation.x = idleX + cursorX;
    bust.rotation.y = idleY + cursorY;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
