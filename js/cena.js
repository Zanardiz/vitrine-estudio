// Cena 3D da abertura: peças holográficas e um celular com o site da Macedo's, num painel escuro.
// As peças voltam para o lugar como molas e fogem do mouse; o celular olha para o mouse.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../assets/vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../assets/vendor/RoomEnvironment.js';

const stage = document.querySelector('[data-stage]');
const canvas = document.querySelector('[data-canvas]');
// Com "reduzir movimento" ligado, a cena continua viva, só que mais devagar.
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reduce = false;
let released = document.documentElement.dataset.ready === '1';
document.addEventListener('vitrine:ready', () => { released = true; }, { once: true });
setTimeout(() => { released = true; }, 4000);

const SCREENS = ['assets/img/macedos-celular.webp'];
// creme, marinho e violeta, com reflexo de arco-íris (iridescência), como a bolha holográfica da Panda
const COLORS = { white: '#ece6d8', black: '#10122f', blue: '#6d5cff' };
const IRIS = { iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 720] };
const SPRING = 0.018;
const DAMPING = 0.9;
const MOUSE_RADIUS = 3.2;
const MOUSE_FORCE = 0.06;

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (problem) {
    console.warn('WebGL indisponível, mostrando imagem parada:', problem);
    document.documentElement.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(4, 6, 8);
  scene.add(key, new THREE.AmbientLight('#8a90ff', 0.35));

  const mat = {
    white: new THREE.MeshPhysicalMaterial({ color: COLORS.white, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, ...IRIS }),
    black: new THREE.MeshPhysicalMaterial({ color: COLORS.black, roughness: 0.2, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, ...IRIS }),
    blue: new THREE.MeshPhysicalMaterial({ color: COLORS.blue, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, ...IRIS }),
  };
  const palette = [mat.white, mat.white, mat.black, mat.black, mat.blue];

  const root = new THREE.Group();
  scene.add(root);
  const bodies = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  // peça em cruz (três cápsulas) e tubo curto, como peças de montar
  const capsule = new THREE.CapsuleGeometry(0.26, 1.5, 8, 20);
  const tube = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 40, 1, false);
  function makePiece(material) {
    const g = new THREE.Group();
    if (Math.random() < 0.7) {
      const a = new THREE.Mesh(capsule, material);
      const b = new THREE.Mesh(capsule, material); b.rotation.z = Math.PI / 2;
      const c = new THREE.Mesh(capsule, material); c.rotation.x = Math.PI / 2;
      g.add(a, b, c);
    } else {
      g.add(new THREE.Mesh(tube, material));
    }
    return g;
  }

  function addBody(obj, home, opts = {}) {
    obj.position.set(home.x, home.y + (reduce ? 0 : rand(8, 14)), home.z);
    if (!opts.phone) obj.rotation.set(rand(0, 6), rand(0, 6), rand(0, 6));
    root.add(obj);
    bodies.push({ obj, home: home.clone(), vel: new THREE.Vector3(), spin: new THREE.Vector3(rand(-0.004, 0.004), rand(-0.006, 0.006), rand(-0.004, 0.004)), phone: !!opts.phone, phase: rand(0, 6.28) });
  }

  // celulares com os sites
  const loader = new THREE.TextureLoader();
  const phoneBody = new RoundedBoxGeometry(1.9, 4.05, 0.24, 6, 0.3);
  const screenGeo = new THREE.PlaneGeometry(1.72, 3.82);
  const phoneSpots = [new THREE.Vector3(1.9, 0.55, 2.4)];
  SCREENS.forEach((src, i) => {
    const tex = loader.load(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const phone = new THREE.Group();
    phone.add(new THREE.Mesh(phoneBody, mat.black));
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    screen.position.z = 0.125;
    phone.add(screen);
    phone.scale.setScalar(1.15);
    addBody(phone, phoneSpots[i], { phone: true });
  });

  // peças espalhadas em volta, umas na frente e outras atrás
  const PIECES = window.innerWidth < 700 ? 16 : 30;
  for (let i = 0; i < PIECES; i++) {
    const angle = (i / PIECES) * Math.PI * 2 + rand(-0.3, 0.3);
    const radius = rand(3.6, 7.5);
    const home = new THREE.Vector3(Math.cos(angle) * radius * 1.25, Math.sin(angle) * radius * 0.62, rand(-5, 2.5));
    const piece = makePiece(palette[i % palette.length]);
    piece.scale.setScalar(rand(0.7, 1.25));
    addBody(piece, home);
  }

  // mouse no plano da cena
  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector3(99, 99, 0);
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    ray.ray.intersectPlane(plane, target);
  });
  stage.addEventListener('pointerleave', () => { target.set(99, 99, 0); mouse.set(0, 0); });

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 24 : 16;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let scrollP = 0;
  // quanto a cena já subiu da tela (0 quando o topo dela está no topo da janela), não a rolagem da página toda
  const onScroll = () => { scrollP = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / Math.max(1, stage.clientHeight))); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  function step() {
    const t = clock.getElapsedTime() * (calm ? 0.6 : 1);
    if (!released) { renderer.render(scene, camera); return; }
    for (const b of bodies) {
      tmp.copy(b.home);
      tmp.y += Math.sin(t * 0.8 + b.phase) * (b.phone ? 0.12 : 0.2);
      b.vel.addScaledVector(tmp.sub(b.obj.position), SPRING);
      const dx = b.obj.position.x - target.x;
      const dy = b.obj.position.y - target.y;
      const d = Math.hypot(dx, dy);
      if (d < MOUSE_RADIUS && d > 0.001) {
        const push = (1 - d / MOUSE_RADIUS) * MOUSE_FORCE * (b.phone ? 0.35 : 1);
        b.vel.x += (dx / d) * push;
        b.vel.y += (dy / d) * push;
        if (!b.phone) b.spin.addScalar(push * 0.04);
      }
      b.vel.multiplyScalar(DAMPING);
      b.obj.position.add(b.vel);
      if (b.phone) {
        b.obj.rotation.y += (mouse.x * 0.45 - b.obj.rotation.y) * 0.06;
        b.obj.rotation.x += (-mouse.y * 0.25 - b.obj.rotation.x) * 0.06;
        b.obj.rotation.z += (-0.08 - b.obj.rotation.z) * 0.06;
      } else {
        b.spin.multiplyScalar(0.985).clampLength(0.003, 0.08);
        b.obj.rotation.x += b.spin.x; b.obj.rotation.y += b.spin.y; b.obj.rotation.z += b.spin.z;
      }
    }
    root.rotation.y = Math.sin(t * 0.15) * 0.12 + scrollP * 0.6;
    root.position.y = scrollP * 3;
    renderer.render(scene, camera);
  }

  if (reduce) {
    bodies.forEach((b) => b.obj.position.copy(b.home));
    renderer.render(scene, camera);
    setTimeout(() => renderer.render(scene, camera), 600);
    return;
  }

  stage.classList.add('live');
  let running = false;
  const loop = () => { if (!running) return; step(); requestAnimationFrame(loop); };
  const setRunning = (on) => { if (on && !running) { running = true; requestAnimationFrame(loop); } else if (!on) running = false; };
  new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden)).observe(stage);
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden && stage.getBoundingClientRect().bottom > 0));
}

if (stage && canvas) start();
