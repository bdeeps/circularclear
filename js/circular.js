// Shared parts for CircularClear: constants and the circular-motion formulas, number formatting,
// chart boards, force arrows that point anywhere, a stylised person, car and bicycle, glowing dots
// and a seeded random generator.
// Scenes are built in metres unless a chapter says otherwise: +x right, +y up, +z towards the viewer.
import { THREE, M, box, beam, sphere, torus, arrow, clamp } from './kit.js';

// ---------------------------------------------------------------- constants
export const G = 9.81;                    // m/s², standard gravity (9.806 65 by definition)
export const KMH = 3.6;                   // 1 m/s = 3.6 km/h
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;
export const RPM = TAU / 60;              // 1 rpm = 2π ÷ 60 rad/s

// ---------------------------------------------------------------- the physics
// Uniform circular motion (Huygens 1673, Newton 1687): a body moving at speed v round a circle of
// radius r is always turning, so it accelerates towards the centre with a = v² ÷ r = ω² r, where
// ω = v ÷ r is the angular speed in rad/s. Something must pull it inwards with F = m v² ÷ r.
export const accel = (v, r) => (v * v) / r;
export const omegaOf = (v, r) => v / r;
export const rpmOf = (w) => w / RPM;
export const periodOf = (v, r) => (TAU * r) / v;
// Relative centrifugal force, "× g": the number printed on lab centrifuges. RCF = ω² r ÷ g
// (the familiar shortcut is 1.118 × 10⁻⁵ × r[cm] × rpm²).
export const gForce = (rpm, r) => ((rpm * RPM) ** 2 * r) / G;
// Flat curve: friction supplies m v² ÷ r, so the top speed is v = √(μ g r).
export const vMaxFlat = (mu, r) => Math.sqrt(mu * G * r);
// Banked curve at angle θ with friction μ (both limits); the speed that needs no friction at all
// is v = √(g r tan θ).
export const vIdeal = (r, th) => Math.sqrt(G * r * Math.tan(th));
export function vBankMax(r, th, mu) { const d = 1 - mu * Math.tan(th); return d <= 0 ? Infinity : Math.sqrt((G * r * (Math.tan(th) + mu)) / d); }
export function vBankMin(r, th, mu) { const n = Math.tan(th) - mu; return n <= 0 ? 0 : Math.sqrt((G * r * n) / (1 + mu * Math.tan(th))); }
// Leaning into a turn: the lean from upright satisfies tan θ = v² ÷ (g r).
export const leanOf = (v, r) => Math.atan((v * v) / (G * r));

// ---------------------------------------------------------------- formatting
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');
export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
export function sci(v, d = 2) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
  if (e >= -2 && e <= 5) return fmt(v, Math.max(0, d - Math.max(0, e)));
  return `${m.toFixed(d)} × 10${sup(e)}`;
}
export function fmtN(F) {
  const a = Math.abs(F);
  if (a >= 1e6) return (F / 1e6).toFixed(a >= 1e7 ? 0 : 1) + ' MN';
  if (a >= 1e4) return (F / 1e3).toFixed(a >= 1e5 ? 0 : 1) + ' kN';
  if (a >= 100) return Math.round(F).toLocaleString('en-IN') + ' N';
  if (a >= 1) return F.toFixed(a >= 10 ? 0 : 1) + ' N';
  if (a >= 0.01) return F.toFixed(2) + ' N';
  return sci(F, 2) + ' N';
}
// "× g" with sensible digits: 0.21 g, 4.1 g, 402 g, 10,900 g
export function fmtG(k) {
  if (k >= 100) return Math.round(k).toLocaleString('en-IN') + ' g';
  if (k >= 10) return k.toFixed(0) + ' g';
  if (k >= 1) return k.toFixed(1) + ' g';
  if (k >= 0.01) return k.toFixed(2) + ' g';
  return sci(k, 1) + ' g';
}
export const fmtV = (v) => `${v >= 10 ? v.toFixed(0) : v.toFixed(1)} m/s (${Math.round(v * KMH)} km/h)`;
export const fmtT = (s) => (s >= 1 ? s.toFixed(s >= 10 ? 0 : 2) + ' s' : (s * 1000).toFixed(s >= 0.01 ? 0 : 1) + ' ms');
export const fmtRpm = (r) => (r >= 100 ? Math.round(r).toLocaleString('en-IN') : r.toFixed(r >= 10 ? 0 : 1)) + ' rpm';

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function title(g, text, sub = '') {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logX = false }) {
  const X = logX ? (x) => x0 + ((Math.log10(x) - xMin) / (xMax - xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function text(g, s, x, y, col = 'rgba(255,255,255,.75)', font = '18px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }
// Horizontal bars on a log scale: rows = [{ label, v, col, on, text }], values from 10^lo to 10^hi.
export function logBars(g, w, rows, { x0 = 250, x1 = w - 150, y0 = 70, dy = 52, bh = 30, lo = -1, hi = 6 } = {}) {
  rows.forEach((r, i) => {
    const y = y0 + i * dy, k = clamp((Math.log10(Math.max(r.v, 10 ** lo)) - lo) / (hi - lo), 0, 1);
    g.font = `${r.on ? 'bold ' : ''}19px sans-serif`; g.fillStyle = r.on ? '#fff' : 'rgba(255,255,255,.62)';
    g.fillText(r.label, 20, y + bh * 0.72);
    g.globalAlpha = r.on ? 1 : 0.45; g.fillStyle = r.col; g.fillRect(x0, y, Math.max(4, k * (x1 - x0)), bh); g.globalAlpha = 1;
    g.font = 'bold 18px sans-serif'; g.fillStyle = '#e8eef8';
    g.fillText(r.text, x0 + Math.max(4, k * (x1 - x0)) + 10, y + bh * 0.72);
  });
}
export const COL = { pull: '#c49bff', vel: '#5ce1a9', hot: '#ffb547', cool: '#8ef0ff', red: '#ff5a8a', fric: '#ff7a59', normal: '#7be08c', soft: 'rgba(255,255,255,.55)' };
export const HEX = { pull: 0xc49bff, vel: 0x5ce1a9, hot: 0xffb547, cool: 0x8ef0ff, red: 0xff5a8a, fric: 0xff7a59, normal: 0x7be08c, weight: 0xe8eef8 };

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Views dodge the readout in the upper left of a wide stage. On a phone-width stage, re-centre
// them on the model (v.cx) instead.
export function pickView(stage, v) {
  if (v.cx === undefined || stage.host.clientWidth >= 560 || inReel()) return v;
  const dx = v.cx - v.target[0];
  return { pos: [v.pos[0] + dx, v.pos[1], v.pos[2]], target: [v.cx, v.target[1], v.target[2]] };
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.clone(), s: b.mesh.scale.x };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.set(0, 0, 0); }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(b.home.s); b.mesh.rotation.copy(b.home.r); }
  });
}
// Several scenes side by side in one chapter: show one group and fly the camera to its view.
export function switcher(stage, groups, views) {
  let cur = '';
  return (focus, onSwitch) => {
    if (focus === cur) return false;
    cur = focus;
    for (const [k, g] of Object.entries(groups)) g.visible = k === focus;
    if (!inReel()) { const v = pickView(stage, views[focus]); stage.setView(v.pos, v.target, 1.0); }
    onSwitch?.(focus);
    return true;
  };
}

// ---------------------------------------------------------------- arrows
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
// A kit arrow that can point any way and draws on top: aim(from, dir, len).
export function force(color, r = 0.035, head = 0.2) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-12) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}

// ---------------------------------------------------------------- bits and pieces
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function disc(r, h, mat, seg = 48) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; }
// A flat ring in the XZ plane (a road, a track, a painted circle).
export function ring(r0, r1, mat, seg = 128) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, seg), mat); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
// Many small glowing dots. place(i, x, y, z, s) then done().
export function dots(n, r, color = 0xffffff, seg = 8, opacity = 0.9) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.hide = (i) => mesh.place(i, 0, -999, 0, 0.0001);
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}
// A trail of beads through points (up to n), rewritten when setPoints is called.
export function trail(color = 0xffffff, r = 0.02, n = 600, opacity = 0.9) {
  const d = dots(n, r, color, 6, opacity);
  d.setPoints = (pts) => {
    const k = Math.min(n, pts.length);
    for (let i = 0; i < n; i++) { if (i < k) d.place(i, pts[i][0], pts[i][1], pts[i][2]); else d.hide(i); }
    d.done();
  };
  d.setPoints([]);
  return d;
}

// A person standing with feet at the origin, facing +x. pose({ arm, lean }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, TAU, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.22 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); return l; });
  body.position.y = hipY;
  g.pose = ({ arm = 0, lean = 0 } = {}) => { arms.forEach((a) => { a.rotation.z = arm; }); body.rotation.z = -lean; };
  g.arms = arms; g.legs = legs; g.body = body; g.head = head;
  return g;
}

// A small hatchback, 4.2 m long, facing +x, wheels on y = 0 (after FrictionClear's car).
export function makeCar(color = 0xd8332f) {
  const g = new THREE.Group();
  const prof = [[-2.1, 0.3], [2.08, 0.3], [2.12, 0.62], [2.02, 0.82], [1.1, 0.96], [0.35, 1.42], [-1.35, 1.44], [-2.0, 1.05], [-2.12, 0.85]];
  const sh = new THREE.Shape(); prof.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const W = 1.72;
  const geo = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -W / 2);
  const paint = M.plastic(color, { roughness: 0.3, metalness: 0.3 });
  const shell = new THREE.Mesh(geo, paint); shell.castShadow = true; g.add(shell);
  const glass = M.plastic(0x0e1420, { roughness: 0.08, metalness: 0.3, side: THREE.DoubleSide });
  const side = [[1.02, 1.0], [0.4, 1.36], [-1.28, 1.38], [-1.85, 1.04]];
  const gs = new THREE.Shape(); side.forEach(([x, y], i) => (i ? gs.lineTo(x, y) : gs.moveTo(x, y))); gs.closePath();
  for (const z of [-1, 1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(gs), glass); w.position.z = z * (W / 2 + 0.07); g.add(w); }
  const wheels = [];
  for (const x of [-1.3, 1.32]) for (const z of [-1, 1]) {
    const t = torus(0.24, 0.085, M.matte(0x16181d), 32); t.position.set(x, 0.32, z * (W / 2 - 0.05)); g.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), M.metal(0xb7bfcc)); rim.rotation.x = Math.PI / 2; t.add(rim);
    wheels.push(t);
  }
  const lamp = box(0.04, 0.1, 0.34, M.glow(0xfff2c8)); for (const z of [-0.6, 0.6]) { const l = lamp.clone(); l.position.set(2.1, 0.74, z); g.add(l); }
  for (const z of [-0.62, 0.62]) { const l = box(0.04, 0.12, 0.3, M.glow(0xff2a1f)); l.position.set(-2.14, 0.92, z); g.add(l); }
  g.wheels = wheels; g.W = W;
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.33; });
  return g;
}

// A bicycle (or, with moto: true, a motorbike) with rider, 1.8 m long, facing +x, tyres touching
// y = 0 at x = ±0.55. Build the lean on a parent group rotated about x.
export function makeRider({ moto = false, shirt = 0xe07a2f } = {}) {
  const g = new THREE.Group();
  const R = moto ? 0.31 : 0.34, tyreR = moto ? 0.06 : 0.025;
  const frameM = M.plastic(moto ? 0x2f6fd8 : 0x14a37f, { roughness: 0.3, metalness: 0.4 }), tyreM = M.matte(0x16181d), steel = M.metal(0xb7bfcc);
  const wheels = [-0.55, 0.55].map((x) => { const t = torus(R, tyreR, tyreM, 40); t.position.set(x, R + tyreR, 0); g.add(t); if (!moto) for (let k = 0; k < 6; k++) { const sp = beam([0, 0, 0], [R * Math.cos(k * 0.52), R * Math.sin(k * 0.52), 0], 0.004, steel); const sp2 = sp.clone(); sp2.rotation.z += Math.PI; t.add(sp, sp2); } else { const hub = disc(R * 0.62, 0.08, steel, 24); hub.rotation.x = Math.PI / 2; t.add(hub); } return t; });
  const hy = R + tyreR;
  if (moto) {
    const tank = box(0.55, 0.22, 0.26, frameM); tank.position.set(0.1, hy + 0.42, 0); g.add(tank);
    const eng = box(0.4, 0.3, 0.24, M.metal(0x5a606b)); eng.position.set(0, hy + 0.12, 0); g.add(eng);
    const seat = box(0.45, 0.08, 0.24, M.matte(0x1b1d22)); seat.position.set(-0.3, hy + 0.5, 0); g.add(seat);
    g.add(beam([0.55, hy, 0], [0.4, hy + 0.62, 0], 0.03, steel), beam([-0.55, hy, 0], [-0.1, hy + 0.2, 0], 0.03, steel));
  } else {
    g.add(beam([-0.55, hy, 0], [-0.08, hy, 0], 0.018, frameM), beam([-0.08, hy, 0], [-0.2, hy + 0.5, 0], 0.02, frameM), beam([-0.2, hy + 0.5, 0], [0.42, hy + 0.48, 0], 0.02, frameM), beam([-0.08, hy, 0], [0.44, hy + 0.4, 0], 0.024, frameM), beam([-0.55, hy, 0], [-0.2, hy + 0.5, 0], 0.014, frameM), beam([0.55, hy, 0], [0.44, hy + 0.56, 0], 0.018, steel));
    const seat = box(0.2, 0.04, 0.1, M.matte(0x1b1d22)); seat.position.set(-0.22, hy + 0.56, 0); g.add(seat);
  }
  g.add(beam([0.4, hy + (moto ? 0.66 : 0.6), -0.3], [0.4, hy + (moto ? 0.66 : 0.6), 0.3], 0.015, steel));
  // rider: a seated person, bent forward
  const p = makePerson({ shirt, s: 0.95 });
  p.body.rotation.z = -(moto ? 0.75 : 0.55);
  p.legs.forEach((l) => { l.rotation.z = 1.35; });
  p.arms.forEach((a) => { a.rotation.z = 1.2; });
  p.position.set(moto ? -0.3 : -0.22, hy + (moto ? 0.54 : 0.58) - 0.92 * 0.95, 0);
  g.add(p);
  g.wheels = wheels; g.R = R + tyreR;
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / (R + tyreR); });
  return g;
}

export { clamp, THREE, M, box, beam, sphere, torus };
