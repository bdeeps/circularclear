// Chapter 4: rides and space. The same m v² ÷ r, felt in your stomach.
// 1. Loop-the-loop. A frictionless cart enters a circular loop of radius R at speed v₀. Energy:
//    v² = v₀² − 2 g R (1 − cos φ), φ measured from the bottom. The track's push on the rider (per kg)
//    is N ÷ m = v² ÷ R + g cos φ. At the top this is v² ÷ R − g, so the cart stays on the track only if
//    v_top ≥ √(g R), which needs v₀ ≥ √(5 g R). Where N would go below zero the cart leaves the track
//    and flies as a projectile. "Felt g" is N ÷ (m g): 6 g at the bottom of a just-safe circular loop,
//    which is why coasters since the 1976 Revolution (Werner Stengel) use tear-drop clothoid loops.
// 2. Giant wheel. Riders go round at ω = 2π ÷ T. At the top the seat pushes up with m (g − ω² r), at the
//    bottom with m (g + ω² r). A typical fairground wheel: 15 m across, one turn in about 12 s
//    (estimate). The 1893 Ferris wheel: 250 ft (76 m) across, about 9 minutes for one non-stop turn
//    (Wikipedia, Ferris Wheel 1893). London Eye: 120 m wheel, one turn in 30 minutes (London Eye).
// 3. Wall of death ("maut ka kuan"): Indian walls are about 30 ft (9.1 m) across (Wikipedia, Wall of
//    death), so r ≈ 4.6 m. The wall pushes the bike inwards with N = m v² ÷ r; friction must hold the
//    weight, μ N ≥ m g, so v ≥ √(g r ÷ μ). With μ ≈ 0.7 for a tyre on wooden planks (estimate) that is
//    about 29 km/h. The bike leans so the wall's push and friction point through its centre of mass:
//    angle above horizontal = atan(g r ÷ v²).
// 4. Spinning space station. Artificial gravity a = ω² R. For 1 g at 2 rpm, R = 224 m. Many studies
//    suggest untrained people stay comfortable below about 2 rpm, adapted ones up to about 4–6 rpm
//    (Hall, "Artificial gravity" reviews; a guideline, not a hard limit). Head-to-foot difference for a
//    1.8 m person: (R − 1.8) ÷ R. Gemini 11 (1966) tethered its Agena rocket on a 30 m line and spun
//    slowly, making about 0.00015 g (NASA; Wikipedia, Gemini 11). The ISS doesn't spin: at 408 km,
//    v = 7.66 km/s and v² ÷ r = 8.66 m/s², exactly the local gravity, so everything falls together
//    (see GravityClear).
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, D2R, RPM, board, panelBg, title, axes, dot, line, text, COL, HEX, force, fitNarrow, reelBoards,
  inReel, fmtN, fmtG, fmtT, fmtV, disc, trail, makePerson, makeRider, switcher, rng,
} from '../circular.js';

const PX = 0, WX = 40, DX = 80, SX = 120;
const LV = 2.2;                                        // loop drawn this big, whatever its real size
const WV = 2.6;                                        // giant wheel drawn this big
const SV = 3.0;                                        // space station ring drawn this big
const WALL = { r: 4.6, h: 5, mu: 0.7 };
const VIEWS = {
  loop: { pos: [PX - 1.6, 3.0, 12], target: [PX - 1.6, 2.6, 0], cx: PX },
  wheel: { pos: [WX - 1.7, 3.3, 12.5], target: [WX - 1.7, 3.0, 0], cx: WX },
  wall: { pos: [DX + 1.5, 12, 15.5], target: [DX + 1.0, 3.6, 0], cx: DX },
  station: { pos: [SX - 1.8, 3.7, 13], target: [SX - 1.8, 3.4, 0], cx: SX },
};
const BOARD_AT = { loop: [PX - 5.6, 1.4, -0.8], wheel: [WX - 5.8, 1.6, -0.8], wall: [DX + 5.6, 6.8, -5], station: [SX - 6.1, 2.1, -0.8] };
const BOARD_S = { loop: 1.1, wheel: 1.1, wall: 2.2, station: 1.1 };
const REEL_AT = { loop: [PX, 6.3, -1.2], wheel: [WX, 6.9, -1.2], wall: [DX, 7.8, -5], station: [SX, 7.9, -1.5] };
const loopRun = (v0, R, phi) => { const v2 = v0 * v0 - 2 * G * R * (1 - Math.cos(phi)); return { v2, n: v2 / R + G * Math.cos(phi) }; };

export default {
  id: 'rides',
  short: 'Rides and space',
  title: 'Loops, giant wheels, the wall of death and space',
  subtitle: 'Feel heavier, lighter, stuck to a wall, or weightless.',
  view: VIEWS.loop,
  learn: `<p>Fairground rides are circular motion you can <b>feel</b>. Your seat, or the wall, must push you towards the centre with m v² ÷ r, on top of holding you up against gravity. You feel that push as your weight changing.</p>
    <p><b>Loop-the-loop.</b> At the top of a loop the track and gravity both point to the centre. If the cart is fast enough, <b>v ≥ √(g r)</b> at the top, the track still pushes on it and it stays on, upside down. Too slow and gravity alone is more than the turn needs: the cart falls off the track. To get over, a cart must enter a round loop at <b>√(5 g r)</b>, and then riders feel <b>6 g</b> at the bottom. That is why real coasters use <b>tear-drop</b> loops, tight at the top and wide at the bottom.</p>
    <p><b>Giant wheel.</b> Going over the top, the seat pushes up with less than your weight, so you feel <b>lighter</b>; at the bottom you feel heavier. A fast mela wheel can make you 20% lighter at the top.</p>
    <p><b>The wall of death.</b> In India's <b>maut ka kuan</b> riders circle a wooden well about 9 m across. The wall pushes them inwards, and that big push lets <b>friction</b> hold them up. Below about 30 km/h friction can't carry their weight and they slide down.</p>
    <p><b>In space.</b> A spinning ring could make <b>artificial gravity</b>: the floor pushes you inwards with ω² R. For 1 g at a comfortable 2 rpm the ring needs to be 224 m in radius. The astronauts on the <b>ISS</b> float for the opposite reason: gravity is supplying exactly the pull their orbit needs, so they fall round the Earth with the station (see GravityClear).</p>
    <p class="tip"><b>Try it:</b> send the cart in too slowly and watch where it leaves the track. Then speed up the giant wheel until riders at the top would float.</p>`,
  terms: [
    { t: 'Apparent weight', d: 'The push you feel from your seat or the floor. It changes when you move in a curve, even though gravity doesn’t.' },
    { t: 'Loop-the-loop', d: 'A track that turns a full vertical circle. The cart needs v ≥ √(g r) at the top to stay on.' },
    { t: 'Clothoid loop', d: 'A tear-drop shaped loop, tighter at the top, used since 1976 to cut the g-force at the bottom.' },
    { t: 'Wall of death', d: 'A fairground well where riders go round a vertical wall. In India it’s called maut ka kuan.' },
    { t: 'Artificial gravity', d: 'The floor’s push in a spinning spacecraft, which feels like weight: a = ω² R.' },
    { t: 'Free fall', d: 'Moving under gravity alone. In orbit you and your spacecraft fall together, so you float.' },
  ],
  defaults: { focus: 'loop', v0: 55, R: 8, wR: 7.5, wT: 12, wv: 50, sR: 224, srpm: 2 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Ride', options: [{ v: 'loop', label: 'Loop' }, { v: 'wheel', label: 'Giant wheel' }, { v: 'wall', label: 'Wall of death' }, { v: 'station', label: 'Space' }] },
    { key: 'v0', type: 'range', label: 'Loop: speed going in', min: 10, max: 90, step: 1, ends: ['10 km/h', '90 km/h'], fmt: (v) => v + ' km/h' },
    { key: 'R', type: 'range', label: 'Loop: radius', min: 3, max: 15, step: 0.5, ends: ['3 m', '15 m'], fmt: (v) => v + ' m' },
    { key: 'wR', type: 'log', label: 'Giant wheel: radius', min: 5, max: 65, ends: ['5 m', '65 m'], fmt: (v) => v.toFixed(1) + ' m' },
    { key: 'wT', type: 'log', label: 'Giant wheel: one turn takes', min: 4, max: 1800, ends: ['4 s', '30 min'], fmt: (v) => (v < 90 ? v.toFixed(1) + ' s' : (v / 60).toFixed(1) + ' min') },
    { key: 'wv', type: 'range', label: 'Wall of death: speed', min: 10, max: 80, step: 1, ends: ['10 km/h', '80 km/h'], fmt: (v) => v + ' km/h' },
    { key: 'sR', type: 'log', label: 'Space station: radius', min: 10, max: 1000, ends: ['10 m', '1 km'], fmt: (v) => Math.round(v) + ' m' },
    { key: 'srpm', type: 'range', label: 'Space station: spin', min: 0, max: 10, step: 0.1, ends: ['0', '10 rpm'], fmt: (v) => v.toFixed(1) + ' rpm' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Send the cart', act: (s, inst) => { s.focus = 'loop'; inst.send?.(); } },
      { label: 'Mela wheel, 15 m', act: (s) => Object.assign(s, { focus: 'wheel', wR: 7.5, wT: 12 }) },
      { label: 'Ferris wheel, 1893', act: (s) => Object.assign(s, { focus: 'wheel', wR: 38, wT: 540 }) },
      { label: '1 g at 2 rpm', act: (s) => Object.assign(s, { focus: 'station', sR: 224, srpm: 2 }) },
    ] },
  ],
  onChange(s, key) {
    if (key === 'v0' || key === 'R') s.focus = 'loop';
    if (key === 'wR' || key === 'wT') s.focus = 'wheel';
    if (key === 'wv') s.focus = 'wall';
    if (key === 'sR' || key === 'srpm') s.focus = 'station';
  },
  quiz: [
    { q: 'What is the least speed a coaster cart needs at the top of a loop of radius 10 m?', options: ['About 3 m/s', 'About 10 m/s', 'About 30 m/s', 'Any speed works if you are strapped in'], answer: 1, why: 'At the top gravity alone must not be more than the turn needs: v ≥ √(g r) = √(9.81 × 10) ≈ 9.9 m/s.' },
    { q: 'Why do you feel lighter at the top of a giant wheel?', options: ['You are further from the Earth', 'Part of your weight is used to turn you, so the seat pushes up less', 'The wind lifts you', 'The wheel slows down'], answer: 1, why: 'At the top the net force must point down to the centre: m g − N = m ω² r, so the seat’s push N is less than your weight.' },
    { q: 'On the wall of death, what stops the rider sliding down?', options: ['Centrifugal force pushing up', 'Friction, made large by the wall’s big inward push', 'Magnets in the tyres', 'The engine’s thrust'], answer: 1, why: 'The wall pushes the bike inwards with m v² ÷ r. Friction can be up to μ times that push, and it points up, holding the weight.' },
  ],
  reel: [
    { ms: 5600, caption: 'A loop needs v ≥ √(g r) at the top. Too slow, and the cart falls off the track.', set: { focus: 'loop', R: 8, v0: 58 }, act: (s, inst) => inst.send(), view: { pos: [PX, 2.6, 8.2], target: [PX, 2.4, 0] }, spin: 0 },
    { ms: 5000, caption: 'In India’s maut ka kuan, the wall pushes riders in, and friction holds them up.', set: { focus: 'wall', wv: 50 }, view: { pos: [DX, 8, 10], target: [DX, 1.8, 0] }, spin: 0.5 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const groups = { loop: new THREE.Group(), wheel: new THREE.Group(), wall: new THREE.Group(), station: new THREE.Group() };
    groups.loop.position.x = PX; groups.wheel.position.x = WX; groups.wall.position.x = DX; groups.station.position.x = SX;
    Object.values(groups).forEach((g) => root.add(g));
    const steel = M.metal(0xb9bec8), red = M.plastic(0xd8332f, { roughness: 0.35 });

    // ================================================================ loop
    const gLp = groups.loop, LY = 0.3;
    const loopPts = []; for (let i = 0; i <= 96; i++) { const p = (i / 96) * TAU; loopPts.push([LV * Math.sin(p), LY + LV - LV * Math.cos(p), 0]); }
    gLp.add(tubeOf(loopPts, 0.05, steel, true));
    gLp.add(beam([-6, LY, 0], [5, LY, 0], 0.05, steel));
    for (const x of [-5, -3, -1, 1, 3]) gLp.add(beam([x, 0, 0], [x, LY, 0], 0.03, M.metal(0x6b7280)));
    gLp.add(beam([0, 0, -0.3], [0, LY + 2 * LV, -0.3], 0.06, M.metal(0x6b7280)));
    const cart = new THREE.Group(); gLp.add(cart);
    const cb = box(0.5, 0.22, 0.34, red); cb.position.y = 0.16; cart.add(cb);
    const seat = box(0.14, 0.2, 0.3, M.matte(0x1b1d22)); seat.position.set(-0.12, 0.3, 0); cart.add(seat);
    for (const x of [-0.17, 0.17]) { const wh = disc(0.06, 0.4, M.matte(0x16181d), 16); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.05, 0); cart.add(wh); }
    const aNl = force(HEX.normal, 0.03, 0.14), aGl = force(HEX.weight, 0.03, 0.14); gLp.add(aNl, aGl);
    const path = trail(0xffb547, 0.025, 200); gLp.add(path);
    const lCart = stage.label('', [0, 0, 0], gLp, 'hot'); lCart.element.style.setProperty('--c', COL.hot);
    const lNs = stage.label('', [-4.5, LY + 3.9, 0], gLp);
    const run = { phase: 'approach', x: -5.5, phi: 0, px: 0, py: 0, vx: 0, vy: 0, t: 0, pts: [], wait: 0, fell: false };
    const send = () => { Object.assign(run, { phase: 'approach', x: -5.5, phi: 0, t: 0, pts: [], wait: 0, fell: false }); path.setPoints([]); };

    // ================================================================ giant wheel
    const gWh = groups.wheel, WY = WV + 0.6;
    const wheel = new THREE.Group(); wheel.position.y = WY; gWh.add(wheel);
    for (const z of [-0.25, 0.25]) { const rim = torus(WV, 0.035, steel, 96); rim.position.z = z; wheel.add(rim); }
    const cars = [];
    for (let k = 0; k < 12; k++) { const a = (k * TAU) / 12; for (const z of [-0.25, 0.25]) wheel.add(beam([0, 0, z], [WV * Math.cos(a), WV * Math.sin(a), z], 0.015, steel)); }
    const legs = [[-1.6, 0], [1.6, 0]]; legs.forEach(([x]) => { for (const z of [-0.5, 0.5]) gWh.add(beam([x, 0, z], [0, WY, z * 0.5], 0.05, M.metal(0x6b7280))); });
    const hub = disc(0.2, 0.7, M.metal(0x8c95a3), 24); hub.rotation.x = Math.PI / 2; hub.position.y = WY; gWh.add(hub);
    const GC = [0xff5a8a, 0xffb547, 0x5ce1a9, 0x8ef0ff, 0xc49bff, 0xe07a2f];
    for (let k = 0; k < 8; k++) { const gg = new THREE.Group(); const c = box(0.36, 0.3, 0.4, M.plastic(GC[k % 6], { roughness: 0.4 })); c.position.y = -0.25; gg.add(c); gg.add(beam([0, 0, 0], [0, -0.1, 0], 0.012, steel)); gWh.add(gg); cars.push(gg); }
    const lTop = stage.label('', [0, 0, 0], gWh, 'hot'), lBot = stage.label('', [0, 0, 0], gWh, 'hot');
    lTop.element.style.setProperty('--c', COL.cool); lBot.element.style.setProperty('--c', COL.hot);
    const aTop = force(HEX.normal, 0.03, 0.14), aBot = force(HEX.normal, 0.03, 0.14); gWh.add(aTop, aBot);
    let angW = 0;

    // ================================================================ wall of death (life size)
    const gWd = groups.wall;
    const planks = document.createElement('canvas'); planks.width = 512; planks.height = 256;
    { const x = planks.getContext('2d'); const r = rng(3); for (let i = 0; i < 32; i++) { const l = 120 + r() * 50; x.fillStyle = `rgb(${l + 40},${l},${l - 50})`; x.fillRect(i * 16, 0, 16, 256); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(i * 16, 0, 1.5, 256); } x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, 150, 512, 4); }
    const pT = new THREE.CanvasTexture(planks); pT.colorSpace = THREE.SRGBColorSpace; pT.wrapS = THREE.RepeatWrapping; pT.repeat.x = 3;
    const wallBack = new THREE.Mesh(new THREE.CylinderGeometry(WALL.r, WALL.r, WALL.h, 96, 1, true, Math.PI * 0.5, Math.PI), new THREE.MeshStandardMaterial({ map: pT, roughness: 0.8, side: THREE.DoubleSide }));
    wallBack.position.y = WALL.h / 2; wallBack.receiveShadow = true; gWd.add(wallBack);
    const wallFront = new THREE.Mesh(new THREE.CylinderGeometry(WALL.r, WALL.r, WALL.h, 96, 1, true, -Math.PI * 0.5, Math.PI), M.clear(0xd9b07a, 0.08)); wallFront.position.y = WALL.h / 2; gWd.add(wallFront);
    const rimTop = torus(WALL.r + 0.1, 0.08, M.matte(0x8a6139), 96); rimTop.rotation.x = Math.PI / 2; rimTop.position.y = WALL.h; gWd.add(rimTop);
    const floorW = disc(WALL.r, 0.05, M.matte(0x5a4630), 64); floorW.position.y = 0.025; gWd.add(floorW);
    const crowd = new THREE.Group(); gWd.add(crowd);
    { const r = rng(9); for (let i = 0; i < 16; i++) { const a = Math.PI * 0.1 + (i / 15) * Math.PI * 0.8, p = makePerson({ shirt: GC[i % 6], s: 0.9 }); p.position.set((WALL.r + 0.45) * Math.cos(a), WALL.h + 0.1, -(WALL.r + 0.45) * Math.sin(a)); p.rotation.y = a + Math.PI + (r() - 0.5) * 0.3; crowd.add(p); } }
    const outer = new THREE.Group(), inner = new THREE.Group(); outer.add(inner); gWd.add(outer);
    const wbike = makeRider({ moto: true, shirt: 0xff5a8a }); inner.add(wbike);
    const aNw = force(HEX.normal, 0.05, 0.25), aFw = force(HEX.fric, 0.05, 0.25), aWw = force(HEX.weight, 0.05, 0.25); gWd.add(aNw, aFw, aWw);
    const lWall = stage.label('', [0, 0, 0], gWd, 'hot'); lWall.element.style.setProperty('--c', COL.fric);
    let angD = 0, hD = 2.3;

    // ================================================================ space station
    const gSt = groups.station;
    const stars = new THREE.Group(); gSt.add(stars);
    { const r = rng(4), pos = []; for (let i = 0; i < 400; i++) pos.push((r() - 0.5) * 60, (r() - 0.5) * 30 + 4, -12 - r() * 20); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); stars.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false }))); }
    const st = new THREE.Group(); st.position.y = 3.6; gSt.add(st);
    const ringS = torus(SV, 0.28, M.metal(0xd8dde6, { roughness: 0.4 }), 128); st.add(ringS);
    const winS = torus(SV - 0.29, 0.05, M.glow(0x8ef0ff), 128); st.add(winS);
    for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4; st.add(beam([0, 0, 0], [(SV - 0.2) * Math.cos(a), (SV - 0.2) * Math.sin(a), 0], 0.08, steel)); }
    const core = disc(0.4, 1.2, M.metal(0x8c95a3), 32); core.rotation.x = Math.PI / 2; st.add(core);
    const panelM = M.plastic(0x2d4fa8, { roughness: 0.3, metalness: 0.4 });
    for (const z of [-1, 1]) { const p = box(0.6, 0.02, 1.4, panelM); p.position.z = z * 1.3; p.rotation.x = Math.PI / 2; st.add(p); }
    const crew = [0, 1, 2].map((k) => { const p = makePerson({ shirt: GC[k + 1], s: 0.55 }); const a = -Math.PI / 2 + (k - 1) * 0.35; p.position.set((SV - 0.2) * Math.cos(a), (SV - 0.2) * Math.sin(a), 0.1); p.rotation.z = a + Math.PI / 2; st.add(p); return p; });
    const aSt = force(HEX.normal, 0.04, 0.2); gSt.add(aSt);
    const lSt = stage.label('', [0, 0, 0], gSt, 'hot'); lSt.element.style.setProperty('--c', COL.vel);
    const lSt2 = stage.label('floor pushes the crew in, towards the hub', [2.4, 0.3, 0.3], gSt);
    let angS = 0;

    // ================================================================ board
    let cur = null;
    const chart = board(root, 3.0, 1.8, 900, 540, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const s = cur;
      if (s.focus === 'loop') {
        const v0 = s.v0 / KMH, R = s.R;
        title(g, 'What the rider feels round the loop', 'track’s push ÷ weight');
        const { X, Y } = axes(g, w, h, { xMax: 360, yMin: -2, yMax: 8, xTicks: [0, 90, 180, 270, 360], yTicks: [-2, 0, 2, 4, 6, 8], xFmt: (x) => ({ 0: 'bottom', 90: 'side', 180: 'top', 270: 'side', 360: 'bottom' })[x], yFmt: (y) => y + ' g' });
        g.fillStyle = 'rgba(255,90,138,.14)'; g.fillRect(X(0), Y(0), X(360) - X(0), Y(-2) - Y(0));
        text(g, 'below 0: the track would have to pull, so the cart falls off', X(8), Y(-1.2), COL.red, '16px sans-serif');
        const pts = []; let off = false;
        for (let d = 0; d <= 360; d += 2) { const p = d * D2R, r = loopRun(v0, R, p); if (r.v2 < 0 || off) break; pts.push([d, clamp(r.n / G, -2, 8)]); if (r.n < 0) off = true; }
        line(g, pts, X, Y, off ? COL.red : COL.vel, 5);
        const vmin = Math.sqrt(5 * G * R) * KMH;
        text(g, `needs ${Math.round(vmin)} km/h going in`, X(200), Y(7.2), '#fff', 'bold 18px sans-serif');
      } else if (s.focus === 'wheel') {
        const om = TAU / s.wT, a = om * om * s.wR;
        title(g, 'How heavy riders feel', `r = ${s.wR.toFixed(1)} m, one turn in ${s.wT < 90 ? s.wT.toFixed(1) + ' s' : (s.wT / 60).toFixed(1) + ' min'}`);
        const { X, Y } = axes(g, w, h, { xMax: 360, yMin: -0.5, yMax: 2.5, xTicks: [0, 90, 180, 270, 360], yTicks: [0, 0.5, 1, 1.5, 2, 2.5], xFmt: (x) => ({ 0: 'bottom', 90: 'side', 180: 'top', 270: 'side', 360: 'bottom' })[x], yFmt: (y) => y + ' ×' });
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(0), Y(1)); g.lineTo(X(360), Y(1)); g.stroke(); g.setLineDash([]);
        text(g, 'your normal weight', X(4), Y(1) - 8, 'rgba(255,255,255,.6)', '16px sans-serif');
        const pts = []; for (let d = 0; d <= 360; d += 3) pts.push([d, clamp(1 + (a / G) * Math.cos(d * D2R), -0.5, 2.5)]);
        line(g, pts, X, Y, COL.hot, 5);
        if (a > G) text(g, 'at the top the seat can’t push: riders would lift out!', X(40), Y(-0.2), COL.red, 'bold 17px sans-serif');
      } else if (s.focus === 'wall') {
        title(g, 'Wall of death: grip needed', `r = ${WALL.r} m, wooden wall μ ≈ ${WALL.mu}`);
        const { X, Y } = axes(g, w, h, { xMax: 80, yMax: 2, xTicks: [0, 20, 40, 60, 80], yTicks: [0, 0.5, 1, 1.5, 2], xFmt: (x) => x + '', yFmt: (y) => y.toFixed(1), xLabel: 'speed, km/h →', yLabel: 'friction needed ÷ wall’s push ↑' });
        g.fillStyle = 'rgba(92,225,169,.12)'; g.fillRect(X(0), Y(WALL.mu), X(80) - X(0), Y(0) - Y(WALL.mu));
        text(g, 'friction can hold', X(60), Y(0.1), COL.vel, '16px sans-serif');
        const pts = []; for (let v = 8; v <= 80; v += 1) pts.push([v, Math.min(2, G * WALL.r / (v / KMH) ** 2)]); line(g, pts, X, Y, COL.fric, 5);
        const vmin = Math.sqrt(G * WALL.r / WALL.mu) * KMH; dot(g, X(vmin), Y(WALL.mu), '#fff', 7); text(g, `slides below ${Math.round(vmin)} km/h`, X(vmin) + 12, Y(WALL.mu) - 12, '#fff', 'bold 17px sans-serif');
        dot(g, X(s.wv), Y(Math.min(2, G * WALL.r / (s.wv / KMH) ** 2)), COL.hot, 10);
      } else {
        title(g, 'Spin needed for artificial gravity', 'a = ω² R');
        const { X, Y } = axes(g, w, h, { logX: true, xMin: 1, xMax: 3, yMax: 10, xTicks: [10, 30, 100, 300, 1000], yTicks: [0, 2, 4, 6, 8, 10], xFmt: (x) => x + ' m', yFmt: (y) => y + ' rpm', xLabel: 'radius →', yLabel: 'spin ↑' });
        g.fillStyle = 'rgba(92,225,169,.12)'; g.fillRect(X(10), Y(2), X(1000) - X(10), Y(0) - Y(2));
        text(g, 'comfortable for most people: under about 2 rpm', X(12), Y(0.5), COL.vel, '15px sans-serif');
        [[1, '1 g (Earth)', '#fff'], [0.38, '0.38 g (Mars)', COL.hot], [0.17, '0.17 g (Moon)', COL.cool]].forEach(([k, l, c]) => { const pts = []; for (let lr = 1; lr <= 3.001; lr += 0.02) { const R = 10 ** lr; pts.push([R, Math.min(10.5, Math.sqrt(k * G / R) / RPM)]); } line(g, pts, X, Y, c, 3); const R0 = k === 1 ? 40 : k > 0.3 ? 20 : 12; text(g, l, X(R0) + 8, Y(Math.sqrt(k * G / R0) / RPM) - 8, c, '15px sans-serif'); });
        dot(g, X(clamp(s.sR, 10, 1000)), Y(Math.min(10, s.srpm)), COL.red, 10);
      }
    }, BOARD_AT.loop);

    const show = switcher(stage, groups, VIEWS);
    let key = '';
    return {
      send,
      dispose() { stage.floor.visible = true; },
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lNs, lSt2, lBot]);
        show(s.focus, (f) => { chart.mesh.position.set(...BOARD_AT[f]); chart.mesh.scale.setScalar(BOARD_S[f]); chart.mesh.rotation.y = f === 'wall' ? -0.2 : 0.3; chart.home = null; stage.floor.visible = f !== 'station'; });
        reelBoards([[chart, REEL_AT[s.focus], s.focus === 'wall' ? 2.2 : 1.2]]);
        const k = `${s.focus}|${s.v0}|${s.R}|${s.wR}|${s.wT}|${s.wv}|${s.sR}|${s.srpm}`;
        if (k !== key) { key = k; cur = { ...s }; chart.redraw(); }

        if (s.focus === 'loop') {
          const v0 = s.v0 / KMH, R = s.R, sc = LV / R;           // metres → scene units
          lNs.element.innerHTML = `loop ${R} m radius, drawn to fit`;
          let pos, dir, n = null;
          if (run.phase === 'approach') { run.x += v0 * sc * dt; pos = [run.x, LY, 0]; dir = [1, 0, 0]; n = G; if (run.x >= 0) { run.phase = 'loop'; run.phi = 0; } }
          else if (run.phase === 'loop') {
            const r = loopRun(v0, R, run.phi);
            if (r.v2 <= 0.05) { run.phase = 'done'; }
            else if (r.n < 0) { const v = Math.sqrt(r.v2); run.phase = 'fly'; run.fell = true; run.px = R * Math.sin(run.phi); run.py = R - R * Math.cos(run.phi); run.vx = v * Math.cos(run.phi); run.vy = v * Math.sin(run.phi); }
            else { run.phi += (Math.sqrt(r.v2) / R) * dt; n = r.n; if (run.phi >= TAU) { run.phase = 'exit'; run.x = 0; } }
            pos = [LV * Math.sin(run.phi), LY + LV - LV * Math.cos(run.phi), 0]; dir = [Math.cos(run.phi), Math.sin(run.phi), 0];
          } else if (run.phase === 'fly') {
            run.vy -= G * dt; run.px += run.vx * dt; run.py += run.vy * dt;
            pos = [run.px * sc, LY + run.py * sc, 0]; dir = [run.vx, run.vy, 0];
            if (run.py < 0) run.phase = 'done';
          } else if (run.phase === 'exit') { run.x += v0 * sc * dt; pos = [run.x, LY, 0]; dir = [1, 0, 0]; n = G; if (run.x > 4.5) run.phase = 'done'; }
          if (run.phase === 'done') { run.wait += dt; pos = pos || [cart.position.x, cart.position.y, 0]; dir = dir || [1, 0, 0]; if (run.wait > 1.4) send(); }
          cart.position.set(...pos); cart.rotation.z = Math.atan2(dir[1], dir[0]);
          if (!run.pts.length || Math.hypot(pos[0] - run.pts[run.pts.length - 1][0], pos[1] - run.pts[run.pts.length - 1][1]) > 0.12) { run.pts.push([pos[0], pos[1], 0.2]); path.setPoints(run.pts); }
          const inward = run.phase === 'loop' ? [-Math.sin(run.phi), Math.cos(run.phi), 0] : [0, 1, 0];
          aNl.visible = n !== null; if (n !== null) aNl.aim([pos[0], pos[1] + 0.05, 0.25], inward, 0.15 + 0.13 * n / G);
          aGl.aim([pos[0], pos[1] + 0.05, 0.3], [0, -1, 0], 0.3);
          lCart.position.set(pos[0] + 0.4, pos[1] + 0.6, 0);
          lCart.element.innerHTML = run.fell ? '<b>off the track!</b>' : n !== null ? `rider feels <b>${(n / G).toFixed(1)} g</b>` : run.phase === 'done' && run.phi < Math.PI ? '<b>too slow: rolls back</b>' : '';
        }

        if (s.focus === 'wheel') {
          const w = TAU / s.wT, a = w * w * s.wR, spd = Math.min(w, 0.8);
          angW += spd * dt; wheel.rotation.z = angW;
          cars.forEach((c, i) => { const q = angW + (i * TAU) / 8; c.position.set(WV * Math.cos(q), WY + WV * Math.sin(q), 0); });
          lTop.position.set(0.4, WY + WV + 0.7, 0); lTop.element.innerHTML = a > G ? 'top: <b>riders lift off!</b>' : `top: feel <b>${Math.round((1 - a / G) * 100)}%</b> of your weight`;
          lBot.position.set(0.9, 0.2, 0.6); lBot.element.innerHTML = `bottom: <b>${Math.round((1 + a / G) * 100)}%</b>`;
          aTop.aim([0, WY + WV - 0.5, 0.35], [0, 1, 0], Math.max(0, 0.6 * (1 - a / G)));
          aBot.aim([0, WY - WV - 0.5, 0.35], [0, 1, 0], 0.6 * (1 + a / G));
        }

        if (s.focus === 'wall') {
          const v = s.wv / KMH, need = G * WALL.r / (v * v), slide = need > WALL.mu;
          angD += Math.min(v / WALL.r, 1.6) * dt;
          hD = slide ? Math.max(0.4, hD - dt * 1.2) : hD + (2.3 - hD) * (1 - Math.exp(-2 * dt));
          const al = Math.atan(need);                             // bike's tilt above horizontal
          outer.position.set(WALL.r * Math.cos(angD), hD, -WALL.r * Math.sin(angD)); outer.rotation.y = angD + Math.PI / 2;
          inner.rotation.x = -(Math.PI / 2 - al);
          wbike.roll(v * dt * 0.5);
          const p = [outer.position.x, outer.position.y, outer.position.z], inw = [-Math.cos(angD), 0, Math.sin(angD)], sc = 1.4;
          aNw.aim(p, inw, sc); aFw.aim(p, [0, 1, 0], Math.min(sc * need, sc * WALL.mu)); aWw.aim([p[0] + inw[0] * 0.6, p[1] + 0.02, p[2] + inw[2] * 0.6], [0, -1, 0], sc * need);
          lWall.position.set(p[0] + inw[0] * 1.5, p[1] + 1.2, p[2] + inw[2] * 1.5);
          lWall.element.innerHTML = slide ? `grip needed ${need.toFixed(2)} > ${WALL.mu}: <b>sliding down</b>` : `wall pushes <b>${(v * v / WALL.r / G).toFixed(1)} × weight</b>; friction holds it up`;
        }

        if (s.focus === 'station') {
          const w = s.srpm * RPM, a = w * w * s.sR;
          angS += Math.min(w, 1.2) * dt; st.rotation.z = angS;
          const q = angS - Math.PI / 2;
          aSt.aim([(SV - 0.35) * Math.cos(q), 3.6 + (SV - 0.35) * Math.sin(q), 0.4], [-Math.cos(q), -Math.sin(q), 0], 0.2 + 0.8 * Math.min(2, a / G));
          lSt.position.set((SV - 1.2) * Math.cos(q), 3.6 + (SV - 1.2) * Math.sin(q), 0.3);
          lSt.element.innerHTML = s.srpm < 0.05 ? '<b>no spin: everyone floats</b>' : `floor feels like <b>${fmtG(a / G)}</b>`;
        }
      },
      readout: (s) => {
        if (s.focus === 'wheel') {
          const w = TAU / s.wT, v = w * s.wR, a = w * w * s.wR;
          return `<div class="big">Top: ${Math.round((1 - a / G) * 100)}% · bottom: ${Math.round((1 + a / G) * 100)}%</div>
            <div class="row"><span>Rim speed v = 2π r ÷ T</span><b>${fmtV(v)}</b></div>
            <div class="row"><span>a = ω² r</span><b>${a.toFixed(a < 0.1 ? 4 : 2)} m/s² (${fmtG(a / G)})</b></div>
            <div class="row"><span>Riders float at the top if a turn is faster than</span><b>${fmtT(TAU * Math.sqrt(s.wR / G))}</b></div>
            <small>Seat’s push = m (g ∓ ω² r). The 1893 Ferris wheel took 9 minutes a turn: nobody felt a thing.</small>`;
        }
        if (s.focus === 'wall') {
          const v = s.wv / KMH, N = v * v / WALL.r, vmin = Math.sqrt(G * WALL.r / WALL.mu);
          return `<div class="big">Wall pushes ${(N / G).toFixed(1)} × your weight</div>
            <div class="row"><span>v² ÷ r at ${s.wv} km/h, r = ${WALL.r} m</span><b>${N.toFixed(1)} m/s²</b></div>
            <div class="row"><span>Friction needed ÷ wall’s push</span><b style="color:${G / N > WALL.mu ? COL.red : ''}">${(G / N).toFixed(2)} (max ≈ ${WALL.mu})</b></div>
            <div class="row"><span>Slowest speed that stays up, √(g r ÷ μ)</span><b>${Math.round(vmin * KMH)} km/h</b></div>
            <div class="row"><span>Bike tilted above horizontal</span><b>${(Math.atan(G / N) / D2R).toFixed(0)}°</b></div>
            <small>Wall 30 ft (9.1 m) across, as in Indian melas. μ for tyre on wood is an estimate.</small>`;
        }
        if (s.focus === 'station') {
          const w = s.srpm * RPM, a = w * w * s.sR, need = Math.sqrt(G / s.sR) / RPM;
          return `<div class="big">Artificial gravity ${fmtG(a / G)}</div>
            <div class="row"><span>a = ω² R, R = ${Math.round(s.sR)} m, ${s.srpm.toFixed(1)} rpm</span><b>${a.toFixed(2)} m/s²</b></div>
            <div class="row"><span>Spin for 1 g at this radius</span><b>${need.toFixed(1)} rpm</b></div>
            <div class="row"><span>Rim speed</span><b>${fmtV(w * s.sR)}</b></div>
            <div class="row"><span>Head vs feet (1.8 m tall)</span><b>${s.sR > 1.8 ? Math.round(((s.sR - 1.8) / s.sR) * 100) + '% at the head' : 'n/a'}</b></div>
            <small>Gemini 11 (1966) spun on a 30 m tether and made 0.000 15 g. The ISS doesn’t spin: in orbit, gravity is exactly the centripetal pull.</small>`;
        }
        const v0 = s.v0 / KMH, R = s.R, top = loopRun(v0, R, Math.PI), vmin = Math.sqrt(5 * G * R);
        const ok = top.v2 > 0 && top.n >= 0;
        return `<div class="big">${ok ? `Over the top at ${fmtV(Math.sqrt(top.v2))}` : 'Too slow: falls off'}</div>
          <div class="row"><span>Least speed at the top, √(g r)</span><b>${fmtV(Math.sqrt(G * R))}</b></div>
          <div class="row"><span>Least speed going in, √(5 g r)</span><b>${fmtV(vmin)}</b></div>
          <div class="row"><span>Rider feels at the bottom</span><b>${(1 + v0 * v0 / R / G).toFixed(1)} g</b></div>
          <div class="row"><span>Rider feels at the top</span><b>${ok ? (top.n / G).toFixed(1) + ' g' : 'falls off'}</b></div>
          <small>No friction or air drag. Energy: v² = v₀² − 2 g r (1 − cos φ).</small>`;
      },
    };
  },
};

function tubeOf(points, r, mat, closed) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, r, 10, closed), mat); m.castShadow = true; return m;
}
