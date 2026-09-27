// Chapter 3: on the road. Something must push a turning vehicle towards the centre of its curve.
// 1. Flat curve (CarClear, FrictionClear): only tyre friction can push sideways, so m v² ÷ r ≤ μ m g,
//    and the top speed is v = √(μ g r), whatever the mass. Car 1,200 kg. Road μ as in FrictionClear:
//    dry 0.8, wet 0.5, ice 0.1 (round road-safety figures; real tyres 0.7–1.0 dry).
//    Too fast, and the tyres can only give μ g sideways, so the car follows a wider circle of radius
//    v² ÷ (μ g) and slides off the outside of the bend.
//    Road design in India (IRC:38 horizontal curves; IRC:73 geometric design of rural highways):
//    v² ÷ (127 R) = e + f, with v in km/h and R in m, superelevation e up to 0.07 on plain roads and a
//    design side friction f = 0.15 (far below real grip, to leave a margin for wet roads, worn tyres
//    and trucks). 127 = 3.6² × 9.81. That sets the speed limit posted on a curve.
// 2. Banked curve: the road tilts inwards by θ. The push from the road (normal force) then leans
//    inwards and does part of the job. Resolving along the slope, the friction needed is
//    f = m (a cos θ − g sin θ) and the normal force N = m (g cos θ + a sin θ), a = v² ÷ r. With no
//    friction at all the right speed is v = √(g r tan θ).
//    Velodrome: a 250 m track banks at about 42–45° in the turns, radius about 25 m (UCI track rules
//    and typical designs), ideal speed about 55 km/h. Daytona International Speedway: turns banked
//    31° (Daytona / NASCAR), radius about 300 m here (estimate), ideal speed about 150 km/h.
// 3. Leaning (CycleClear, MotorcycleClear): a two-wheeler turns by leaning until the road's push
//    (normal plus friction) points through the centre of mass: tan θ = v² ÷ (g r). Grip needed is tan θ,
//    so on a dry road (μ 0.8) the lean can't pass about 39°. Racing tyres grip better; MotoGP riders
//    lean over 60°, helped by wide round tyres and hanging off the bike.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, D2R, vMaxFlat, vIdeal, leanOf, board, panelBg, title, axes, dot, line, text, COL, HEX, force,
  fitNarrow, reelBoards, inReel, fmtN, fmtV, disc, ring, makeCar, makeRider, switcher,
} from '../circular.js';

const FX = 0, BX = 60, LX = 120;
const MASS = 1200;
export const SURF = { dry: { name: 'Dry road', mu: 0.8 }, wet: { name: 'Wet road', mu: 0.5 }, ice: { name: 'Ice', mu: 0.1 } };
const VIEWS = {
  flat: { pos: [FX + 0.8, 15, 15.5], target: [FX + 0.6, 3.2, 0], cx: FX },
  bank: { pos: [BX - 0.2, 3.6, 12.5], target: [BX - 1.4, 2.0, 0], cx: BX },
  lean: { pos: [LX - 0.4, 1.9, 6.4], target: [LX - 0.5, 1.15, 0], cx: LX },
};
const BOARD_AT = { flat: [FX + 4.6, 5.6, -7.5], bank: [BX + 3.9, 3.9, -2], lean: [LX + 1.9, 1.95, -1.4] };
const REEL_AT = { flat: [FX, 4.5, -10], bank: [BX, 6.2, -2], lean: [LX, 3.1, -1.4] };
const rVis = (R) => 4 + (4 * Math.log(R / 5)) / Math.log(60);         // 5 m → 4 units, 300 m → 8
const irc = (R) => Math.sqrt(127 * R * (0.07 + 0.15));                  // km/h
const bankForces = (v, r, th) => { const a = (v * v) / r; return { a, f: MASS * (a * Math.cos(th) - G * Math.sin(th)), N: MASS * (G * Math.cos(th) + a * Math.sin(th)) }; };

export default {
  id: 'road',
  short: 'On the road',
  title: 'Cornering: friction, banked roads and leaning',
  subtitle: 'Something must push you towards the centre of the bend.',
  view: VIEWS.flat,
  learn: `<p>A car going round a bend is the ball on the string again, but there is no string. On a flat road the only thing that can push the car sideways is <b>friction</b> between the tyres and the road (see FrictionClear and CarClear). The most it can give is μ m g, so:</p>
    <p><b>top speed on a flat bend: v = √(μ g r)</b></p>
    <p>The mass cancels out: a truck and a scooter have the same limit on the same road. But the limit falls fast on a <b>wet</b> road (μ 0.5) and collapses on <b>ice</b> (μ 0.1). Go faster than √(μ g r) and the tyres can't bend your path enough: you slide off the <b>outside</b> of the curve, along a wider circle.</p>
    <p>That is why tight bends have <b>speed limits</b>. Indian road engineers use v² ÷ (127 R) = e + f, allowing only f = 0.15 of friction to leave a safety margin: a 100 m bend gets about <b>50 km/h</b>.</p>
    <p><b>Banked roads.</b> Tilt the road inwards and the road's push leans inwards too, doing part of the turning. At one speed, √(g r tan θ), no friction is needed at all. Race tracks and cycling <b>velodromes</b> bank steeply, up to about 45°.</p>
    <p><b>Leaning.</b> A bicycle or motorbike (see CycleClear and MotorcycleClear) leans into the bend until the road's push points through the rider's centre of mass: <b>tan θ = v² ÷ (g r)</b>. Faster or tighter means more lean, and more grip needed.</p>
    <p class="tip"><b>Try it:</b> on the flat bend, switch to "Wet" at 70 km/h and watch the car slide out. On the banked track, find the speed where friction drops to zero.</p>`,
  terms: [
    { t: 'Coefficient of friction (μ)', d: 'How grippy two surfaces are: the most sideways push is μ times the weight. About 0.8 for dry road, 0.1 for ice.' },
    { t: 'Skid', d: 'When the tyres slide because the push needed is more than friction can give.' },
    { t: 'Banking (superelevation)', d: 'Tilting a road or track inwards on a bend so the road’s own push helps turn you.' },
    { t: 'Design speed', d: 'The speed a road bend is built for, with a safety margin, which sets its speed limit.' },
    { t: 'Normal force', d: 'The push of a surface straight out of it. On a banked road it tilts towards the centre of the bend.' },
    { t: 'Lean angle', d: 'How far a two-wheeler tips from upright in a turn: tan θ = v² ÷ (g r).' },
  ],
  defaults: { focus: 'flat', kmh: 50, R: 50, surf: 'dry', bank: 31, rider: 'moto' },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'flat', label: 'Flat bend' }, { v: 'bank', label: 'Banked' }, { v: 'lean', label: 'Leaning' }] },
    { key: 'kmh', type: 'range', label: 'Speed', min: 10, max: 200, step: 1, ends: ['10 km/h', '200 km/h'], fmt: (v) => v + ' km/h' },
    { key: 'R', type: 'log', label: 'Radius of the bend', min: 5, max: 300, ends: ['5 m', '300 m'], fmt: (v) => Math.round(v) + ' m' },
    { key: 'surf', type: 'seg', label: 'Road surface', options: Object.entries(SURF).map(([v, o]) => ({ v, label: o.name.replace(' road', '') })), fmt: (v) => 'μ = ' + SURF[v].mu },
    { key: 'bank', type: 'range', label: 'Banked: tilt of the track', min: 0, max: 45, step: 1, ends: ['flat', '45°'], fmt: (v) => v + '°' },
    { key: 'rider', type: 'seg', label: 'Leaning: rider', options: [{ v: 'cycle', label: 'Bicycle' }, { v: 'moto', label: 'Motorbike' }] },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Wet bend at 70 km/h', act: (s) => Object.assign(s, { focus: 'flat', kmh: 70, R: 50, surf: 'wet' }) },
      { label: 'Velodrome, 43°', act: (s) => Object.assign(s, { focus: 'bank', bank: 43, R: 25, kmh: 55, surf: 'dry' }) },
      { label: 'Daytona, 31°', act: (s) => Object.assign(s, { focus: 'bank', bank: 31, R: 300, kmh: 150, surf: 'dry' }) },
      { label: 'Cyclist on a roundabout', act: (s) => Object.assign(s, { focus: 'lean', rider: 'cycle', kmh: 20, R: 15, surf: 'dry' }) },
    ] },
  ],
  onChange(s, key) {
    if (key === 'bank') s.focus = 'bank';
    if (key === 'rider') s.focus = 'lean';
  },
  quiz: [
    { q: 'On a dry flat bend (μ = 0.8) of radius 50 m, what is the top speed before the tyres slide?', options: ['About 30 km/h', 'About 71 km/h', 'About 140 km/h', 'It depends on the car’s mass'], answer: 1, why: 'v = √(μ g r) = √(0.8 × 9.81 × 50) ≈ 19.8 m/s ≈ 71 km/h. The mass cancels out.' },
    { q: 'A car takes a bend too fast on ice. Which way does it go?', options: ['Into the inside of the bend', 'Off the outside, on a wider curve', 'It spins on the spot', 'Straight back'], answer: 1, why: 'Friction can only bend its path into a circle of radius v² ÷ (μ g), wider than the road, so it drifts off the outside.' },
    { q: 'Why are velodrome tracks banked so steeply?', options: ['To slow riders down', 'So the track’s push leans inwards and helps turn the bikes without relying on tyre grip', 'To drain rain', 'For the crowd to see'], answer: 1, why: 'On a banked track the normal force tilts towards the centre. At √(g r tan θ) it supplies all of m v² ÷ r, so the tyres barely need to grip sideways.' },
  ],
  reel: [
    { ms: 5600, caption: 'On a flat bend only tyre grip turns the car. Too fast for √(μ g r) and it slides off the outside.', set: { focus: 'flat', kmh: 60, R: 50, surf: 'wet' }, anim: { kmh: [45, 75] }, view: { pos: [FX + 1, 13, 11], target: [FX, 0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const groups = { flat: new THREE.Group(), bank: new THREE.Group(), lean: new THREE.Group() };
    groups.flat.position.x = FX; groups.bank.position.x = BX; groups.lean.position.x = LX;
    Object.values(groups).forEach((g) => root.add(g));
    const asphalt = { dry: 0x2b2f36, wet: 0x1d2433, ice: 0xb9d4ea };

    // ================================================================ flat bend, seen from above
    const gF = groups.flat;
    const grass = disc(16, 0.02, M.matte(0x2f4a33), 96); grass.position.y = 0.004; gF.add(grass);
    const roadM = M.matte(0x2b2f36, { roughness: 0.85 });
    let roadMesh = null, lineMesh = null, curRv = -1;
    const car = makeCar(0xd8332f); car.scale.setScalar(0.6); gF.add(car);
    const centre = sphere(0.1, M.glow(0xffffff)); centre.position.y = 0.05; gF.add(centre);
    const aFr = force(HEX.fric, 0.06, 0.3), aVel = force(HEX.vel, 0.05, 0.26); gF.add(aFr, aVel);
    const skidT = []; const skidDots = new THREE.Group(); gF.add(skidDots);
    const lCar = stage.label('', [0, 0, 0], gF, 'hot'); lCar.element.style.setProperty('--c', COL.fric);
    const lCen = stage.label('centre of the bend', [0, 0.4, 0], gF);
    let skid = null, angF = 0;

    // ================================================================ banked track, seen from behind
    const gB = groups.bank;
    const slab = new THREE.Group(); slab.position.set(0, 0.6, 0); gB.add(slab);
    const bankRoad = box(5, 0.2, 10, M.matte(0x2b2f36, { roughness: 0.85 })); bankRoad.position.y = -0.1; slab.add(bankRoad);
    const dashes = []; for (let i = 0; i < 6; i++) { const d = box(0.12, 0.01, 1.2, M.matte(0xe8e2c8)); d.position.set(-1.2, 0.005, -4 + i * 2); slab.add(d); dashes.push(d); }
    const support = new THREE.Mesh(new THREE.BufferGeometry(), M.matte(0x3a3f4b)); gB.add(support);
    const carB = makeCar(0x2f6fd8); carB.rotation.y = Math.PI / 2; carB.position.set(0.6, 0, 1.5); slab.add(carB);
    const cgB = new THREE.Vector3();
    const aN = force(HEX.normal, 0.05, 0.25), aW = force(HEX.weight, 0.05, 0.25), aFb = force(HEX.fric, 0.05, 0.25), aNet = force(HEX.pull, 0.06, 0.3);
    gB.add(aN, aW, aFb, aNet);
    const lN = stage.label('road’s push', [0, 0, 0], gB), lW = stage.label('weight', [0, 0, 0], gB), lFb = stage.label('', [0, 0, 0], gB), lNet = stage.label('', [0, 0, 0], gB, 'hot');
    lNet.element.style.setProperty('--c', COL.pull);
    const lIn = stage.label('← centre of the bend', [-3.6, 0.3, 1.5], gB);

    // ================================================================ leaning two-wheeler, from behind
    const gL = groups.lean;
    const leanRoad = box(6, 0.04, 10, M.matte(0x2b2f36, { roughness: 0.85 })); leanRoad.position.y = -0.02; gL.add(leanRoad);
    const lDash = []; for (let i = 0; i < 6; i++) { const d = box(0.1, 0.01, 1.2, M.matte(0xe8e2c8)); d.position.set(-1.4, 0.01, -4 + i * 2); gL.add(d); lDash.push(d); }
    const tilt = new THREE.Group(); tilt.position.set(0, 0, 1.2); gL.add(tilt);
    const bikes = { cycle: makeRider({ moto: false, shirt: 0xffb547 }), moto: makeRider({ moto: true, shirt: 0xe07a2f }) };
    Object.values(bikes).forEach((b) => { b.rotation.y = Math.PI / 2; tilt.add(b); });
    const aNl = force(HEX.normal, 0.03, 0.15), aFl = force(HEX.fric, 0.03, 0.15), aRes = force(HEX.pull, 0.03, 0.15), aWl = force(HEX.weight, 0.03, 0.15);
    gL.add(aNl, aFl, aRes, aWl);
    const lLean = stage.label('', [0, 0, 0], gL, 'hot'); lLean.element.style.setProperty('--c', COL.pull);
    const lFl = stage.label('friction pushes in', [0, 0, 0], gL), lNl = stage.label('road pushes up', [0, 0, 0], gL);
    const lInL = stage.label('← centre of the bend', [-2.4, 0.25, 1.2], gL);
    let leanNow = 0;

    // ================================================================ board
    let cur = null;
    const chart = board(root, 4.2, 2.5, 900, 540, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { focus, kmh, R, surf, bank, rider } = cur, mu = SURF[surf].mu;
      if (focus === 'flat') {
        title(g, 'Top speed on a flat bend', 'v = √(μ g r)');
        const { X, Y } = axes(g, w, h, { xMax: 300, yMax: 200, xTicks: [0, 50, 100, 150, 200, 250, 300], yTicks: [0, 50, 100, 150, 200], xFmt: (x) => x + ' m', yFmt: (y) => y + '', xLabel: 'radius of the bend →', yLabel: 'km/h ↑' });
        Object.entries(SURF).forEach(([k, o], i) => { const pts = []; for (let r = 0; r <= 300; r += 3) pts.push([r, Math.min(205, vMaxFlat(o.mu, r) * KMH)]); line(g, pts, X, Y, ['#e8eef8', COL.cool, '#9ab'][i], k === surf ? 5 : 2.5); const lx = k === 'ice' ? 250 : k === 'wet' ? 175 : 95; text(g, o.name, X(lx), Y(vMaxFlat(o.mu, lx) * KMH) - 10, k === surf ? '#fff' : 'rgba(255,255,255,.6)', (k === surf ? 'bold ' : '') + '17px sans-serif'); });
        const pts = []; for (let r = 0; r <= 300; r += 3) pts.push([r, irc(r)]); line(g, pts, X, Y, COL.hot, 3, [8, 6]);
        text(g, 'road design speed (IRC)', X(200), Y(irc(200)) + 26, COL.hot, '16px sans-serif');
        const over = kmh / KMH > vMaxFlat(mu, R);
        dot(g, X(Math.min(R, 300)), Y(Math.min(kmh, 200)), over ? COL.red : COL.vel, 10);
      } else if (focus === 'bank') {
        title(g, 'Friction needed on a banked track', `${bank}°, r = ${Math.round(R)} m`);
        const th = bank * D2R, vmax = 200, fmax = 1.2;
        const { X, Y } = axes(g, w, h, { xMax: vmax, yMin: -1, yMax: fmax, xTicks: [0, 50, 100, 150, 200], yTicks: [-1, -0.5, 0, 0.5, 1], xFmt: (x) => x + '', yFmt: (y) => y.toFixed(1), xLabel: 'speed, km/h →', yLabel: 'friction needed ÷ road’s push ↑' });
        g.fillStyle = 'rgba(92,225,169,.12)'; g.fillRect(X(0), Y(mu), X(vmax) - X(0), Y(-mu) - Y(mu));
        text(g, `grip available ±${mu}`, X(4), Y(mu) + 20, COL.vel, '16px sans-serif');
        const pts = []; for (let v = 0; v <= vmax; v += 2) { const b = bankForces(v / KMH, R, th); pts.push([v, clamp(b.f / b.N, -1, fmax)]); }
        line(g, pts, X, Y, COL.fric, 4);
        const vi = vIdeal(R, th) * KMH; if (vi < vmax) { dot(g, X(vi), Y(0), '#fff', 7); text(g, `no friction at ${Math.round(vi)} km/h`, Math.min(X(vi) + 10, w - 250), Y(0) - 12, '#fff', 'bold 16px sans-serif'); }
        const b = bankForces(kmh / KMH, R, th); dot(g, X(Math.min(kmh, vmax)), Y(clamp(b.f / b.N, -1, fmax)), Math.abs(b.f / b.N) > mu ? COL.red : COL.hot, 10);
        text(g, 'friction pushes down the slope (too fast)', X(2), 84, 'rgba(255,255,255,.55)', '15px sans-serif');
        text(g, 'friction pushes up the slope (too slow)', X(2), Y(-1) - 8, 'rgba(255,255,255,.55)', '15px sans-serif');
      } else {
        title(g, 'Lean angle against speed', `r = ${Math.round(R)} m`);
        const { X, Y } = axes(g, w, h, { xMax: 200, yMax: 70, xTicks: [0, 50, 100, 150, 200], yTicks: [0, 20, 40, 60], xFmt: (x) => x + '', yFmt: (y) => y + '°', xLabel: 'speed, km/h →', yLabel: 'lean ↑' });
        const lim = Math.atan(mu) / D2R;
        g.strokeStyle = COL.red; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(lim)); g.lineTo(X(200), Y(lim)); g.stroke(); g.setLineDash([]);
        text(g, `tyres slide above ${Math.round(lim)}° (${SURF[surf].name.toLowerCase()}, μ ${mu})`, X(4), Y(lim) - 10, COL.red, '16px sans-serif');
        const pts = []; for (let v = 0; v <= 200; v += 2) pts.push([v, Math.min(72, leanOf(v / KMH, R) / D2R)]); line(g, pts, X, Y, COL.pull, 5);
        dot(g, X(kmh), Y(Math.min(70, leanOf(kmh / KMH, R) / D2R)), COL.hot, 10);
        text(g, rider === 'cycle' ? 'bicycle' : 'motorbike', X(kmh) + 12, Y(Math.min(70, leanOf(kmh / KMH, R) / D2R)) + 22, COL.hot, 'bold 16px sans-serif');
      }
    }, BOARD_AT.flat);

    const show = switcher(stage, groups, VIEWS);
    let key = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lCen, lIn, lInL, lFl, lNl, lN, lW]);
        show(s.focus, (f) => { chart.mesh.position.set(...BOARD_AT[f]); chart.mesh.scale.setScalar(f === 'flat' ? 1.45 : f === 'bank' ? 0.8 : 0.65); chart.mesh.rotation.y = f === 'flat' ? -0.35 : -0.2; chart.home = null; skid = null; });
        reelBoards([[chart, REEL_AT[s.focus], s.focus === 'flat' ? 1.5 : s.focus === 'bank' ? 1 : 0.6]]);
        const k = `${s.focus}|${s.kmh}|${s.R}|${s.surf}|${s.bank}|${s.rider}`;
        if (k !== key) { key = k; cur = { ...s }; chart.redraw(); }
        const v = s.kmh / KMH, mu = SURF[s.surf].mu;

        if (s.focus === 'flat') {
          const Rv = rVis(s.R);
          if (Math.abs(Rv - curRv) > 0.01) {
            curRv = Rv;
            if (roadMesh) { gF.remove(roadMesh, lineMesh); roadMesh.geometry.dispose(); lineMesh.geometry.dispose(); }
            roadMesh = ring(Rv - 1.1, Rv + 1.1, roadM); roadMesh.position.y = 0.02; gF.add(roadMesh);
            lineMesh = ring(Rv - 0.04, Rv + 0.04, M.matte(0xe8e2c8)); lineMesh.position.y = 0.026; gF.add(lineMesh);
          }
          roadM.color.setHex(asphalt[s.surf]);
          const vmax = vMaxFlat(mu, s.R), w = v / s.R, wShow = Math.min(w, 0.9), vs = wShow * Rv;
          const need = MASS * v * v / s.R, have = mu * MASS * G;
          if (!skid && v > vmax * 1.001) skid = { t: 0, x: Rv * Math.cos(angF), z: -Rv * Math.sin(angF), h: angF + Math.PI / 2, pts: [] };
          if (skid && v <= vmax) skid = null;
          if (skid) {
            // tyres give only μ g sideways: path radius v² ÷ (μ g), wider than the road's
            skid.t += dt;
            const ratio = (v * v) / (mu * G) / s.R;
            skid.h += (vs / (Rv * ratio)) * dt;
            skid.x += Math.cos(skid.h) * vs * dt; skid.z += -Math.sin(skid.h) * vs * dt;
            car.position.set(skid.x, 0, skid.z); car.rotation.y = skid.h + 0.25;
            if (Math.hypot(skid.x, skid.z) > Rv + 3.5 || skid.t > 6) { angF = Math.atan2(-skid.z, skid.x); skid = null; }
            aFr.visible = false;
            aVel.aim([car.position.x, 0.6, car.position.z], [Math.cos(skid?.h ?? 0), 0, -Math.sin(skid?.h ?? 0)], 1.2);
            lCar.position.set(car.position.x, 1.4, car.position.z); lCar.element.innerHTML = `needs ${fmtN(need)}, grip gives ${fmtN(have)}: <b>slides out</b>`;
          } else {
            angF += wShow * dt;
            const c = Math.cos(angF), sn = Math.sin(angF);
            car.position.set(Rv * c, 0, -Rv * sn); car.rotation.y = angF + Math.PI / 2;
            aFr.aim([Rv * c, 0.55, -Rv * sn], [-c, 0, sn], 0.4 + 1.8 * clamp(need / have, 0, 1));
            aVel.aim([Rv * c, 0.55, -Rv * sn], [-sn, 0, -c], 1.2);
            lCar.position.set(Rv * c * 0.72, 1.3, -Rv * sn * 0.72); lCar.element.innerHTML = `friction pushes in: <b>${fmtN(need)}</b>`;
          }
        }

        if (s.focus === 'bank') {
          const th = s.bank * D2R, b = bankForces(v, s.R, th);
          slab.rotation.z = th;
          // support wedge under the track
          const hw = 2.5, py = 0.3 + hw * Math.sin(th); slab.position.y = py;
          const pts = [[-hw * Math.cos(th), py - hw * Math.sin(th)], [hw * Math.cos(th), py + hw * Math.sin(th)]];
          const shp = new THREE.Shape(); shp.moveTo(pts[0][0], 0); shp.lineTo(pts[0][0], pts[0][1] - 0.2); shp.lineTo(pts[1][0], pts[1][1] - 0.2); shp.lineTo(pts[1][0], 0); shp.closePath();
          support.geometry.dispose(); support.geometry = new THREE.ExtrudeGeometry(shp, { depth: 10, bevelEnabled: false }); support.geometry.translate(0, 0, -5);
          dashes.forEach((d) => { d.position.z += v * 0.12 * dt; if (d.position.z > 5) d.position.z -= 12; });
          // arrows from the car's centre of mass, to scale: 1 unit = 10 kN
          carB.updateWorldMatrix(true, false); cgB.set(0, 0.6, 0).applyMatrix4(carB.matrixWorld); gB.worldToLocal(cgB);
          const cg = [cgB.x, cgB.y, 2.8], sc = 1 / 10000;
          const n = [-Math.sin(th), Math.cos(th), 0], d = [-Math.cos(th), -Math.sin(th), 0];   // inward = −x
          aN.aim(cg, n, b.N * sc); aW.aim(cg, [0, -1, 0], MASS * G * sc);
          aFb.aim(cg, b.f >= 0 ? d : [-d[0], -d[1], 0], Math.abs(b.f) * sc);
          aNet.aim([cg[0], cg[1] + 0.02, cg[2]], [-1, 0, 0], MASS * b.a * sc);
          lN.position.set(cg[0] + n[0] * b.N * sc * 0.9 + 0.3, cg[1] + n[1] * b.N * sc * 0.9 + 0.2, cg[2]);
          lW.position.set(cg[0] + 0.5, cg[1] - MASS * G * sc - 0.1, cg[2]);
          lFb.position.set(cg[0] + (b.f >= 0 ? d[0] : -d[0]) * 1.9 + 0.6, cg[1] + (b.f >= 0 ? d[1] : -d[1]) * 1.9 - 0.2, cg[2]);
          lFb.element.innerHTML = Math.abs(b.f) < 150 ? 'friction: <b>none needed</b>' : `friction <b>${fmtN(Math.abs(b.f))}</b> ${b.f > 0 ? 'down' : 'up'} the slope`;
          lFb.element.style.color = Math.abs(b.f) > mu * b.N ? COL.red : '';
          lNet.position.set(cg[0] - MASS * b.a * sc - 0.6, cg[1] - 0.45, cg[2]); lNet.element.innerHTML = `total: <b>${fmtN(MASS * b.a)}</b> to the centre`;
        }

        if (s.focus === 'lean') {
          const bike = bikes[s.rider]; bikes.cycle.visible = s.rider === 'cycle'; bikes.moto.visible = s.rider === 'moto';
          const th = leanOf(v, s.R), slide = Math.tan(th) > mu;
          leanNow += (Math.min(th, 70 * D2R) - leanNow) * (1 - Math.exp(-4 * dt));
          tilt.rotation.z = leanNow;
          bike.roll(v * 0.3 * dt);
          lDash.forEach((d) => { d.position.z += v * 0.3 * dt; if (d.position.z > 5) d.position.z -= 12; });
          const hc = s.rider === 'moto' ? 0.65 : 1.0;                   // rough centre of mass heights, m
          const cg = [-Math.sin(leanNow) * hc, Math.cos(leanNow) * hc, 1.2], m = s.rider === 'moto' ? 260 : 85, sc = 0.9 / (m * G);
          const Fin = m * v * v / s.R;
          aNl.aim([0, 0.02, 1.75], [0, 1, 0], m * G * sc);
          aFl.aim([0, 0.02, 1.75], [-1, 0, 0], Fin * sc);
          aRes.aim([0, 0.02, 1.75], [-Fin, m * G, 0], Math.hypot(Fin, m * G) * sc);
          aWl.aim(cg, [0, -1, 0], 0.5);
          lNl.position.set(0.35, 0.85, 1.75); lFl.position.set(-Fin * sc - 0.2, -0.1, 1.75);
          lLean.position.set(cg[0] - 0.7, cg[1] + 0.6, 1.2); lLean.element.innerHTML = slide ? `<b>${(th / D2R).toFixed(0)}°: tyres slide!</b>` : `lean <b>${(th / D2R).toFixed(0)}°</b>`;
          lLean.element.style.setProperty('--c', slide ? COL.red : COL.pull);
        }
        void narrow;
      },
      readout: (s) => {
        const v = s.kmh / KMH, mu = SURF[s.surf].mu, a = v * v / s.R;
        if (s.focus === 'bank') {
          const th = s.bank * D2R, b = bankForces(v, s.R, th), ratio = b.f / b.N, vi = vIdeal(s.R, th) * KMH;
          return `<div class="big">No-friction speed ${Math.round(vi)} km/h</div>
            <div class="row"><span>√(g r tan θ), ${s.bank}°, r = ${Math.round(s.R)} m</span><b>${Math.round(vi)} km/h</b></div>
            <div class="row"><span>Needed to turn at ${s.kmh} km/h</span><b>${fmtN(MASS * a)}</b></div>
            <div class="row"><span>Friction needed</span><b>${fmtN(Math.abs(b.f))} ${Math.abs(b.f) < 150 ? '' : b.f > 0 ? 'down slope' : 'up slope'}</b></div>
            <div class="row"><span>Grip used</span><b style="color:${Math.abs(ratio) > mu ? COL.red : ''}">${Math.round(Math.abs(ratio) * 100)}% of the push (max ${Math.round(mu * 100)}%)</b></div>
            <small>1,200 kg car. Arrows to scale: weight, road’s push, friction and their total, which points at the centre.</small>`;
        }
        if (s.focus === 'lean') {
          const th = leanOf(v, s.R);
          return `<div class="big">Lean ${(th / D2R).toFixed(0)}°</div>
            <div class="row"><span>tan θ = v² ÷ (g r)</span><b>${(v * v).toFixed(0)} ÷ (9.81 × ${Math.round(s.R)})</b></div>
            <div class="row"><span>Grip needed = tan θ</span><b style="color:${Math.tan(th) > mu ? COL.red : ''}">${Math.tan(th).toFixed(2)} (road gives ${mu})</b></div>
            <div class="row"><span>Most lean on this surface</span><b>${(Math.atan(mu) / D2R).toFixed(0)}°</b></div>
            <small>The road’s push and friction add up to a force along the lean, through the rider’s centre of mass.</small>`;
        }
        const vmax = vMaxFlat(mu, s.R), need = MASS * a, have = mu * MASS * G;
        return `<div class="big">Top speed ${Math.round(vmax * KMH)} km/h</div>
          <div class="row"><span>√(μ g r), μ = ${mu}, r = ${Math.round(s.R)} m</span><b>${fmtV(vmax)}</b></div>
          <div class="row"><span>Friction needed at ${s.kmh} km/h</span><b style="color:${need > have ? COL.red : ''}">${fmtN(need)}</b></div>
          <div class="row"><span>Most the tyres can give</span><b>${fmtN(have)}</b></div>
          <div class="row"><span>Road design speed, IRC</span><b>${Math.round(irc(s.R))} km/h</b></div>
          <small>1,200 kg car; the mass cancels out of the top speed. Design speed allows only f = 0.15 of friction plus a 7% bank.</small>`;
      },
    };
  },
};
