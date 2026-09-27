// Chapter 2: spinning machines at home and in the lab. Each one is a = ω² r, and "g-force" is a ÷ g.
// Washer spin-dry (WasherClear): drum radius 0.25 m (a 50 cm drum, 7 kg front-loader, as in
//   WasherClear). At 1,200 rpm: ω = 125.7 rad/s, wall speed 31 m/s, a = 3,950 m/s² ≈ 400 g. Clothes
//   are held in by the drum wall; water in the fabric has nothing to hold it, so it carries straight
//   on through the holes. Below about 60 rpm (ω² r = g) clothes fall from the top and tumble.
//   A 7 kg load holds about 3.5 kg of water after washing; at 1,200 rpm that water needs 400 times its
//   weight to be held in (typical figures; remaining moisture after spinning falls from about 70% at
//   800 rpm to about 50% at 1,400 rpm, EU energy label spin-drying classes).
// Mixer grinder (MixerClear): blade tip about 3 cm from the shaft; 18,000 rpm on a 750 W Indian mixer
//   (MixerClear): tip speed 57 m/s (204 km/h), a ≈ 107,000 m/s² ≈ 10,900 g.
// Ceiling fan (FanClear): 1,200 mm sweep, so the tips are 0.6 m out; about 350 rpm at top speed
//   (FanClear): tip speed 22 m/s, a = 806 m/s² ≈ 82 g. Pull on a blade's root: m ω² r_cm, with an
//   estimated 0.35 kg aluminium blade whose centre of mass is 0.36 m out: about 170 N at 350 rpm.
// Blood centrifuge: swing-out rotor, tube bottoms 10 cm from the axis. RCF = ω² r ÷ g, the shortcut
//   1.118 × 10⁻⁵ × r[cm] × rpm² (Beckman Coulter). 3,000 rpm gives about 1,000 g. Whole blood is
//   typically spun at 1,000–2,000 g for about 10 minutes (WHO guidelines on drawing blood; lab
//   protocols vary). It separates into plasma (about 55%), a thin "buffy coat" of white cells and
//   platelets (under 1%) and packed red cells (about 45%, the haematocrit). Separation here is
//   tracked as g × time, complete at 600,000 g·s (1,000 g for 10 min), and time runs 60× faster.
//   The buckets swing out until tan φ = ω² r ÷ g, nearly flat above a few hundred rpm.
// Salad spinner: about 400 rpm on a 12 cm basket radius (estimate): about 20 g.
// Ultracentrifuge: up to about 1,000,000 g (Beckman Optima class machines; Svedberg's 1920s machines
//   reached about 100,000 g).
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, TAU, RPM, gForce, board, panelBg, title, logBars, text, COL, HEX, force, fitNarrow, pickView, reelBoards,
  inReel, fmtN, fmtG, fmtRpm, fmtV, disc, dots, rng, switcher,
} from '../circular.js';

const WX = 0, MX = 30, FX = 60, CX = 90;
const MACH = {
  washer: { name: 'Washer drum wall', r: 0.25, max: 1400, def: 1200 },
  mixer: { name: 'Mixer blade tip', r: 0.03, max: 22000, def: 18000 },
  fan: { name: 'Ceiling fan blade tip', r: 0.6, max: 400, def: 350 },
  centrifuge: { name: 'Blood centrifuge tube', r: 0.1, max: 5000, def: 3000 },
};
const VIEWS = {
  washer: { pos: [WX + 0.05, 1.6, 2.75], target: [WX - 0.2, 1.2, 0], cx: WX },
  mixer: { pos: [MX + 0.1, 2.0, 3.4], target: [MX - 0.25, 1.5, 0], cx: MX },
  fan: { pos: [FX + 0.3, 3.35, 3.0], target: [FX + 0.3, 2.8, 0], cx: FX },
  centrifuge: { pos: [CX + 0.05, 2.0, 2.5], target: [CX - 0.2, 1.2, 0], cx: CX },
};
const BOARD_AT = { washer: [WX + 0.75, 1.72, -0.7], mixer: [MX + 0.95, 2.3, -0.9], fan: [FX + 1.5, 3.1, -0.9], centrifuge: [CX + 0.8, 1.75, -0.8] };
const REEL_AT = { washer: [WX, 1.66, -0.3], mixer: [MX, 2.5, -0.4], fan: [FX + 0.2, 3.45, -0.6], centrifuge: [CX, 1.95, -0.3] };
const SHOW = 5;                                          // fastest turning drawn, rad/s
const SEP_GS = 6e5, CF_SPEED = 60;
const BLADE = { m: 0.35, rcm: 0.36 };
const vLathe = (pts, mat, seg = 64) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat); m.castShadow = true; return m; };

export default {
  id: 'machines',
  short: 'Spinning machines',
  title: 'Spinning machines: washers, mixers, fans and centrifuges',
  subtitle: 'The faster and wider the spin, the harder the wall must push.',
  view: VIEWS.washer,
  learn: `<p>Every spinning machine is the ball on a string again. A point at radius r turning at ω needs an inward acceleration <b>a = ω² r</b>. Engineers compare it with gravity and call it <b>g-force</b>: a ÷ 9.81.</p>
    <p><b>Spin-dry.</b> In a washing machine (see WasherClear) the 50 cm drum turns at up to <b>1,200 rpm</b>. The wall then moves at 31 m/s and must push the clothes inwards about <b>400 times harder than gravity</b>. The clothes are held by the wall, but the water in them has <b>nothing to hold it</b>, so it carries straight on, out through the holes. Below about <b>60 rpm</b> the wall can't even beat gravity at the top, and the clothes tumble instead.</p>
    <p><b>Blades.</b> A mixer grinder (see MixerClear) at <b>18,000 rpm</b> moves its blade tips, only 3 cm out, at about <b>200 km/h</b>: over <b>10,000 g</b>. A ceiling fan (see FanClear) turns far slower, 350 rpm, but its tips are 60 cm out, so they still reach 80 km/h, and each blade's root must hold a pull of about 170 N.</p>
    <p><b>Centrifuges.</b> A salad spinner flings water off lettuce at about 20 g. A hospital <b>centrifuge</b> spins blood at about <b>1,000 g</b> for ten minutes: the heavy red cells pack at the bottom and yellow <b>plasma</b> floats on top, a job gravity alone takes hours to do, and does less neatly. The same trick separates cream from milk in every dairy.</p>
    <p class="tip"><b>Try it:</b> in the washer, drop the speed below 60 rpm and watch the clothes fall. Then run the blood centrifuge and watch the layers form.</p>`,
  terms: [
    { t: 'g-force', d: 'An acceleration measured in multiples of gravity: a ÷ 9.81 m/s². 400 g means 400 times the pull of gravity.' },
    { t: 'Spin-dry', d: 'Getting water out of clothes by spinning the drum fast. The wall holds the clothes; the water leaves through the holes.' },
    { t: 'Tip speed', d: 'How fast the end of a blade moves: v = ω r. Long blades have fast tips even at low rpm.' },
    { t: 'Centrifuge', d: 'A machine that spins samples so denser parts pack outwards, like gravity turned up hundreds or thousands of times.' },
    { t: 'RCF', d: 'Relative centrifugal force: the “× g” number on a lab centrifuge, ω² r ÷ g.' },
    { t: 'Plasma', d: 'The pale yellow liquid part of blood, about 55% of it. It carries water, salts, proteins and nutrients.' },
    { t: 'Haematocrit', d: 'The share of blood that is red cells, about 45%. A centrifuge measures it by packing them down.' },
  ],
  defaults: { focus: 'washer', washer: 1200, mixer: 18000, fan: 350, centrifuge: 3000, run: true },
  controls: [
    { key: 'focus', type: 'seg', label: 'Machine', options: [{ v: 'washer', label: 'Washer' }, { v: 'mixer', label: 'Mixer' }, { v: 'fan', label: 'Fan' }, { v: 'centrifuge', label: 'Centrifuge' }] },
    { key: 'washer', type: 'range', label: 'Washer drum speed', min: 0, max: 1400, step: 10, ends: ['0', '1,400 rpm'], fmt: (v) => fmtRpm(v) },
    { key: 'mixer', type: 'range', label: 'Mixer speed', min: 0, max: 22000, step: 100, ends: ['0', '22,000 rpm'], fmt: (v) => fmtRpm(v) },
    { key: 'fan', type: 'range', label: 'Ceiling fan speed', min: 0, max: 400, step: 5, ends: ['0', '400 rpm'], fmt: (v) => fmtRpm(v) },
    { key: 'centrifuge', type: 'range', label: 'Centrifuge speed', min: 0, max: 5000, step: 50, ends: ['0', '5,000 rpm'], fmt: (v) => fmtRpm(v) },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Washer at 50 rpm: tumble', act: (s) => Object.assign(s, { focus: 'washer', washer: 50 }) },
      { label: 'Washer at 1,200 rpm', act: (s) => Object.assign(s, { focus: 'washer', washer: 1200 }) },
      { label: 'Spin a blood sample', act: (s, inst) => { Object.assign(s, { focus: 'centrifuge', centrifuge: 3000 }); inst.resetBlood?.(); } },
    ] },
  ],
  onChange(s, key) { if (MACH[key]) s.focus = key; },
  quiz: [
    { q: 'In a spinning washer drum, what pushes the clothes round in a circle?', options: ['Centrifugal force pushing them out', 'The drum wall pushing them inwards', 'The water', 'Nothing: they float'], answer: 1, why: 'The wall pushes the clothes towards the centre, supplying m ω² r. The water has no such push through the holes, so it carries straight on and escapes.' },
    { q: 'A ceiling fan turns at 350 rpm and a mixer at 18,000 rpm. Why can the fan’s tips still move at about 80 km/h?', options: ['Fan motors are stronger', 'Tip speed is ω × r, and the fan’s tips are 20 times further out', 'Air speeds them up', 'They can’t'], answer: 1, why: 'v = ω r. The fan turns about 50 times slower, but its tips are 60 cm out instead of 3 cm, so they still move at 22 m/s.' },
    { q: 'Why do red cells end up at the bottom of a spun blood tube?', options: ['They are denser, so at 1,000 g they sink outwards much faster than in normal gravity', 'The plasma pushes them', 'They stick to the glass', 'Heat from the motor'], answer: 0, why: 'In a centrifuge “down” is outwards, and it is about 1,000 times stronger than gravity. The denser red cells pack outwards in minutes, leaving plasma on top.' },
  ],
  reel: [
    { ms: 5400, caption: 'A washer drum at 1,200 rpm pushes clothes in 400 times harder than gravity. The water flies straight out.', set: { focus: 'washer', washer: 200 }, anim: { washer: [200, 1200] }, view: { pos: [WX + 0.05, 1.3, 1.5], target: [WX, 0.95, 0] }, spin: 0 },
    { ms: 5200, caption: 'A blood centrifuge at 1,000 g packs red cells down and leaves yellow plasma on top in minutes.', set: { focus: 'centrifuge', centrifuge: 3000 }, act: (s, inst) => inst.resetBlood(0.1), view: { pos: [CX, 1.75, 1.25], target: [CX, 1.0, 0] }, spin: 0.6 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const groups = { washer: new THREE.Group(), mixer: new THREE.Group(), fan: new THREE.Group(), centrifuge: new THREE.Group() };
    groups.washer.position.x = WX; groups.mixer.position.x = MX; groups.fan.position.x = FX; groups.centrifuge.position.x = CX;
    Object.values(groups).forEach((g) => root.add(g));
    const R = rng(7);

    // ================================================================ washer
    const gW = groups.washer, WY = 0.95, DR = 0.25;
    const cab = box(0.6, 0.85, 0.6, M.clear(0xdfe6f0, 0.1)); cab.position.set(0, 0.425 + 0.52, -0.05); gW.add(cab);
    const stand = box(0.62, 0.52, 0.62, M.matte(0x2a2f3a)); stand.position.set(0, 0.26, -0.05); gW.add(stand);
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.34, 64, 1, true), M.clear(0x9fb3cc, 0.16)); tub.rotation.x = Math.PI / 2; tub.position.y = WY; gW.add(tub);
    const drum = new THREE.Group(); drum.position.y = WY; gW.add(drum);
    const holesC = document.createElement('canvas'); holesC.width = 512; holesC.height = 128;
    { const x = holesC.getContext('2d'); x.fillStyle = '#c3cad6'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#20262f'; for (let i = 0; i < 48; i++) for (let j = 0; j < 8; j++) { x.beginPath(); x.arc(5 + i * 10.6 + (j % 2) * 5, 8 + j * 15.5, 2.6, 0, TAU); x.fill(); } }
    const hT = new THREE.CanvasTexture(holesC); hT.colorSpace = THREE.SRGBColorSpace; hT.wrapS = THREE.RepeatWrapping;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(DR, DR, 0.3, 72, 1, true), new THREE.MeshStandardMaterial({ map: hT, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide }));
    shell.rotation.x = Math.PI / 2; drum.add(shell);
    const back = disc(DR, 0.01, M.metal(0x9aa3b0), 64); back.rotation.x = Math.PI / 2; back.position.z = -0.15; drum.add(back);
    for (let k = 0; k < 3; k++) { const p = box(0.05, 0.035, 0.28, M.metal(0xd8dde6)); const a = (k * TAU) / 3; p.position.set((DR - 0.02) * Math.cos(a), (DR - 0.02) * Math.sin(a), 0); p.rotation.z = a; drum.add(p); }
    const door = torus(0.23, 0.03, M.plastic(0xe8eef8, { roughness: 0.3 })); door.position.set(0, WY, 0.2); gW.add(door);
    const cloth = new THREE.Group(); drum.add(cloth);
    const COLS = [0xe07a2f, 0x3b6fd8, 0xf2d27a, 0x5ce1a9, 0xff5a8a, 0xe8eef8];
    const lumps = COLS.map((c, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), M.matte(c)); m.scale.set(1.2, 0.55, 1.6); m.castShadow = true; m.home = (i * TAU) / 6 + 0.3; m.z = (R() - 0.5) * 0.14; cloth.add(m); return m; });
    const drops = dots(160, 0.008, 0x8ef0ff, 6); drops.position.y = WY; gW.add(drops);
    const dropS = Array.from({ length: 160 }, () => ({ on: false }));
    const aW = force(HEX.pull, 0.012, 0.05); gW.add(aW);
    const aD = force(HEX.vel, 0.01, 0.045); gW.add(aD);
    const lWall = stage.label('', [0, 0, 0], gW, 'hot'); lWall.element.style.setProperty('--c', COL.pull);
    const lDrop = stage.label('water: nothing holds it,<br>so it carries straight on', [0.5, WY - 0.05, 0.2], gW);

    // ================================================================ mixer (drawn 6× life size)
    const gM = groups.mixer, MS = 6;
    const mix = new THREE.Group(); mix.scale.setScalar(MS); mix.position.y = 0.5; gM.add(mix);
    const base = vLathe([[0, 0], [0.075, 0], [0.08, 0.08], [0.06, 0.11], [0, 0.11]], M.plastic(0xe8eef8, { roughness: 0.35 })); mix.add(base);
    const jar = vLathe([[0.045, 0.11], [0.06, 0.13], [0.068, 0.24], [0.07, 0.25]], M.clear(0xdfe8f2, 0.2)); mix.add(jar);
    const shaft = disc(0.004, 0.03, M.metal(0xb9bec8), 12); shaft.position.y = 0.125; mix.add(shaft);
    const blades = new THREE.Group(); blades.position.y = 0.137; mix.add(blades);
    [[0, 0.25], [Math.PI, 0.25], [Math.PI / 2, -0.35], [-Math.PI / 2, -0.35]].forEach(([a, tilt]) => { const b = box(0.03, 0.0015, 0.008, M.metal(0xe0e4ea, { roughness: 0.2 })); b.geometry.translate(0.015, 0, 0); b.rotation.set(0, a, tilt); blades.add(b); });
    const tipRing = torus(0.03, 0.0008, M.ghost(0xffb547, 0.6)); tipRing.rotation.x = Math.PI / 2; tipRing.position.y = 0.137; mix.add(tipRing);
    const spice = dots(90, 0.0022, 0xd9a066, 6, 1); mix.add(spice);
    const spS = Array.from({ length: 90 }, () => ({ a: R() * TAU, r: 0.01 + R() * 0.04, y: 0.13 + R() * 0.02, k: R() }));
    const lTip = stage.label('', [0, 0, 0], gM, 'hot'); lTip.element.style.setProperty('--c', COL.hot);
    const lM = stage.label('drawn 6× life size', [-0.55, 0.45, 0.5], gM);

    // ================================================================ ceiling fan (life size)
    const gF = groups.fan, FY = 2.6;
    const rodF = disc(0.012, 0.35, M.metal(0xe8eef8), 12); rodF.position.y = FY + 0.2; gF.add(rodF);
    const canopy = vLathe([[0, 0], [0.07, 0], [0.04, 0.06], [0, 0.06]], M.plastic(0xe8eef8)); canopy.position.y = FY + 0.37; gF.add(canopy);
    const ceil = box(1.2, 0.03, 1.2, M.clear(0x9aa3b0, 0.12)); ceil.position.set(0, FY + 0.45, 0); gF.add(ceil);
    const fanR = new THREE.Group(); fanR.position.y = FY; gF.add(fanR);
    const motor = vLathe([[0, -0.05], [0.1, -0.04], [0.11, 0], [0.1, 0.04], [0, 0.05]], M.plastic(0xe8eef8, { roughness: 0.35 })); fanR.add(motor);
    for (let k = 0; k < 3; k++) { const b = box(0.47, 0.006, 0.11, M.plastic(0xf1ece2, { roughness: 0.5 })); b.geometry.translate(0.235 + 0.13, 0, 0); b.rotation.set(0.12, (k * TAU) / 3, 0); fanR.add(b); }
    const fanTip = torus(0.6, 0.004, M.ghost(0xffb547, 0.5), 96); fanTip.rotation.x = Math.PI / 2; fanTip.position.y = FY; gF.add(fanTip);
    const aFan = force(HEX.pull, 0.012, 0.06); gF.add(aFan);
    const lFan = stage.label('', [0, 0, 0], gF, 'hot'); lFan.element.style.setProperty('--c', COL.hot);
    const lRoot = stage.label('', [0, 0, 0], gF);

    // ================================================================ centrifuge (drawn 5× life size)
    const gC = groups.centrifuge, CS = 5;
    const cf = new THREE.Group(); cf.scale.setScalar(CS); cf.position.y = 0.55; gC.add(cf);
    const body = vLathe([[0, 0], [0.16, 0], [0.165, 0.02], [0.16, 0.09], [0.15, 0.1], [0.14, 0.1], [0.14, 0.02], [0, 0.02]], M.plastic(0xe8eef8, { roughness: 0.4 })); body.scale.setScalar(1); cf.add(body);
    const panel = box(0.12, 0.04, 0.02, M.plastic(0x2a2f3a)); panel.position.set(0, 0.05, 0.165); cf.add(panel);
    const rotor = new THREE.Group(); rotor.position.y = 0.1; cf.add(rotor);
    rotor.add(disc(0.02, 0.02, M.metal(0x8c95a3), 16));
    const buckets = [];
    const bloodCols = { mix: new THREE.Color(0x7a1414), plasma: new THREE.Color(0xf2d27a), buffy: new THREE.Color(0xf2f0e8), red: new THREE.Color(0x8e1616) };
    for (let k = 0; k < 4; k++) {
      const a = (k * TAU) / 4, armG = new THREE.Group(); armG.rotation.y = a; rotor.add(armG);
      armG.add(beam([0, 0, 0], [0.06, 0, 0], 0.005, M.metal(0xb9bec8)));
      const piv = new THREE.Group(); piv.position.set(0.06, 0, 0); armG.add(piv);
      const cup = new THREE.Group(); piv.add(cup);
      cup.add(beam([0, 0, -0.012], [0, 0, 0.012], 0.002, M.metal(0xb9bec8)));
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.006, 0.05, 16, 1, true), M.clear(0xe6f6ff, 0.3)); tube.position.y = -0.028; cup.add(tube);
      const segs = [['plasma', 0.55], ['buffy', 0.02], ['red', 0.43]].map(([n, f]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, 1, 12), new THREE.MeshStandardMaterial({ color: bloodCols.mix.clone(), roughness: 0.4 })); m.f = f; m.n = n; cup.add(m); return m; });
      let y = -0.006; segs.forEach((m) => { const L = 0.042 * m.f; m.scale.y = L; m.position.y = y - L / 2; y -= L; });
      buckets.push({ piv, segs });
    }
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 12, 0, TAU, 0, 0.5), M.clear(0xcfe8ff, 0.12)); lid.position.y = -0.04; cf.add(lid);
    const lCf = stage.label('', [0, 0, 0], gC, 'hot'); lCf.element.style.setProperty('--c', COL.red);
    const lCs = stage.label('drawn 5× life size', [-0.7, 0.4, 0.5], gC);
    const blood = { gs: 0 };
    const resetBlood = (k = 0) => { blood.gs = k * SEP_GS; };

    // ================================================================ board: g-forces compared
    let curFocus = 'washer', curVal = {};
    const chart = board(root, 1.2, 0.76, 900, 570, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'How many g?', 'a ÷ 9.81, log scale');
      const live = (k) => gForce(curVal[k] ?? MACH[k].def, MACH[k].r);
      const rows = [
        { label: 'Salad spinner', v: 21, col: COL.vel, text: '≈ 20 g' },
        { label: 'Ceiling fan tip', v: live('fan'), col: COL.cool, k: 'fan' },
        { label: 'Washer drum', v: live('washer'), col: COL.cool, k: 'washer' },
        { label: 'Blood centrifuge', v: live('centrifuge'), col: COL.red, k: 'centrifuge' },
        { label: 'Mixer blade tip', v: live('mixer'), col: COL.hot, k: 'mixer' },
        { label: 'Ultracentrifuge', v: 1e6, col: COL.pull, text: 'up to 1,000,000 g' },
      ].map((r) => ({ ...r, on: r.k === curFocus, text: r.text ?? (r.v < 0.01 ? 'stopped' : fmtG(r.v)) }));
      logBars(g, w, rows, { x0: 240, x1: w - 200, y0: 80, dy: 64, bh: 34, lo: -1, hi: 6 });
      ['0.1 g', '10 g', '1,000 g', '100,000 g'].forEach((t, i) => text(g, t, 240 + ((i * 2) / 7) * (w - 440) - 14, h - 22, 'rgba(255,255,255,.5)', '16px sans-serif'));
    }, BOARD_AT.washer);
    chart.mesh.rotation.y = -0.25;

    const show = switcher(stage, groups, VIEWS);
    const ang = { washer: 0, mixer: 0, fan: 0, centrifuge: 0 };
    let key = '';
    return {
      resetBlood,
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lDrop, lM, lCs, lRoot]);
        show(s.focus, (f) => { chart.mesh.position.set(...BOARD_AT[f]); chart.home = null; });
        reelBoards([[chart, REEL_AT[s.focus], 0.62]]);
        const f = s.focus, rpm = s[f], w = rpm * RPM, wShow = Math.min(w, SHOW) ;
        ang[f] += wShow * dt;
        const k = `${f}|${s.washer}|${s.mixer}|${s.fan}|${s.centrifuge}`;
        if (k !== key) { key = k; curFocus = f; curVal = { washer: s.washer, mixer: s.mixer, fan: s.fan, centrifuge: s.centrifuge }; chart.redraw(); }

        if (f === 'washer') {
          drum.rotation.z = ang.washer;
          const gk = gForce(rpm, DR), stuck = gk >= 1;
          // tumbling below 1 g: clothes are carried up the side, then fall back near the bottom
          lumps.forEach((m, i) => {
            let a;
            if (stuck) a = m.home;
            else { const up = 1.1 + 0.25 * Math.sin(i * 1.7); const ph = ((ang.washer * 0.8 + i * 0.9) % 1.6) / 1.6; a = -Math.PI / 2 - ang.washer + (-0.9 + ph * up * 1.6) + (i - 2.5) * 0.12; }
            const rr = stuck ? DR - 0.035 : DR - 0.04;
            m.position.set(rr * Math.cos(a), rr * Math.sin(a), m.z); m.rotation.z = a + Math.PI / 2;
          });
          // water: leaves a hole with the wall's velocity (tangent), shown at the slowed speed
          const vShow = wShow * DR, rate = gk > 20 ? Math.min(90, gk / 5) : 0;
          for (const d of dropS) if (!d.on && R() < rate * dt / 20) { const a = R() * TAU; Object.assign(d, { on: true, x: DR * Math.cos(a), y: DR * Math.sin(a), z: (R() - 0.5) * 0.26, vx: -Math.sin(a) * vShow, vy: Math.cos(a) * vShow, t: 0 }); }
          dropS.forEach((d, i) => {
            if (!d.on) { drops.hide(i); return; }
            d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt;
            if (Math.hypot(d.x, d.y) > 0.285) { d.vx *= 0.2; d.vy = Math.min(d.vy, 0) - 0.6 * dt * 10; }
            if (d.t > 1.2 || d.y < -0.4) d.on = false;
            drops.place(i, d.x, d.y, d.z);
          });
          drops.done();
          // arrows on the top lump when stuck
          const top = lumps[0], a0 = top.home + ang.washer;
          const p = [(DR - 0.035) * Math.cos(a0), WY + (DR - 0.035) * Math.sin(a0), 0.16];
          aW.visible = stuck; if (stuck) aW.aim(p, [-Math.cos(a0), -Math.sin(a0), 0], 0.12);
          const dd = dropS.find((d) => d.on && d.t > 0.05);
          aD.visible = !!dd && !narrow; if (dd) aD.aim([dd.x, WY + dd.y, 0.16], [dd.vx, dd.vy, 0], 0.08);
          lWall.position.set(0, WY - 0.4, 0.3);
          lWall.element.innerHTML = stuck ? `wall pushes clothes in: <b>${fmtG(gk)}</b>` : `under 1 g at the top: <b>clothes tumble</b>`;
          lDrop.visible = !narrow && rate > 0;
        }
        if (f === 'mixer') {
          blades.rotation.y = ang.mixer;
          const gk = gForce(rpm, 0.03), kk = clamp(rpm / 18000, 0, 1);
          spS.forEach((p, i) => {
            p.a += (wShow * 0.5 * (0.5 + p.k)) * dt;
            const rr = 0.012 + (0.054 - 0.012) * clamp(kk * (0.6 + p.k * 0.5), 0, 1);
            const yy = 0.13 + kk * (0.02 + 0.06 * p.k * (rr / 0.066)) + p.k * 0.01;
            spice.place(i, rr * Math.cos(p.a), yy, rr * Math.sin(p.a));
          });
          spice.done();
          const tv = rpm * RPM * 0.03;
          lTip.position.set(0.3, 1.5, 0.3); lTip.element.innerHTML = `tip: <b>${Math.round(tv * 3.6)} km/h, ${fmtG(gk)}</b>`;
        }
        if (f === 'fan') {
          fanR.rotation.y = ang.fan;
          const gk = gForce(rpm, 0.6);
          aFan.aim([0.6, FY - 0.08, 0.25], [-1, 0, 0], rpm > 5 ? 0.3 : 0);
          lFan.position.set(0.75, FY - 0.25, 0.3); lFan.element.innerHTML = `tip: <b>${Math.round(w * 0.6 * 3.6)} km/h, ${fmtG(gk)}</b>`;
          lRoot.position.set(-0.55, FY + 0.18, 0.3); lRoot.element.innerHTML = `each root holds <b>${fmtN(BLADE.m * w * w * BLADE.rcm)}</b>`;
        }
        if (f === 'centrifuge') {
          rotor.rotation.y = ang.centrifuge;
          const gk = gForce(rpm, 0.1);
          if (s.run) blood.gs = Math.min(SEP_GS, blood.gs + gk * dt * CF_SPEED);
          const p = blood.gs / SEP_GS;
          // swing-out angle from vertical: tan φ = ω² r ÷ g (pivot 6 cm out)
          const phi = Math.atan(((w * w) * 0.06) / G);
          buckets.forEach((b) => {
            b.piv.rotation.z = phi;
            b.segs.forEach((m) => m.material.color.copy(bloodCols.mix).lerp(bloodCols[m.n], clamp(p * 1.1, 0, 1)));
          });
          lCf.position.set(0.25, 1.35, 0.2);
          lCf.element.innerHTML = p >= 1 ? '<b>separated</b>: plasma on top, red cells packed' : rpm < 100 ? 'press play: spin it up' : `separating: <b>${Math.round(p * 100)}%</b> at ${fmtG(gk)}`;
        }
      },
      readout: (s) => {
        const f = s.focus, m = MACH[f], rpm = s[f], w = rpm * RPM, v = w * m.r, a = w * w * m.r, gk = a / G;
        let extra = '';
        if (f === 'washer') extra = `<div class="row"><span>Holding 3.5 kg of water in</span><b>${fmtN(3.5 * a)}</b></div><small>Clothes stick to the wall above ${Math.round(Math.sqrt(G / 0.25) / RPM)} rpm, where ω² r beats g. Shown slowed down.</small>`;
        if (f === 'mixer') extra = `<div class="row"><span>A 1 g bit of spice at the tip needs</span><b>${fmtN(0.001 * a)}</b></div><small>Blade tip 3 cm from the shaft. Shown far slower than real.</small>`;
        if (f === 'fan') extra = `<div class="row"><span>Pull on each blade’s root</span><b>${fmtN(BLADE.m * w * w * BLADE.rcm)}</b></div><small>1,200 mm fan, tips 0.6 m out. Blade pull estimated for a 0.35 kg blade.</small>`;
        if (f === 'centrifuge') extra = `<div class="row"><span>Shortcut 1.118 × 10⁻⁵ × r(cm) × rpm²</span><b>${fmtG(1.118e-5 * 10 * rpm * rpm)}</b></div><small>About 1,000 g for 10 minutes separates whole blood. Time runs 60× faster here.</small>`;
        return `<div class="big">${fmtG(gk)}</div>
          <div class="row"><span>${m.name}, r = ${m.r >= 0.1 ? m.r.toFixed(2) + ' m' : m.r * 100 + ' cm'}</span><b>${fmtRpm(rpm)}</b></div>
          <div class="row"><span>ω = rpm × 2π ÷ 60</span><b>${w.toFixed(1)} rad/s</b></div>
          <div class="row"><span>Speed v = ω r</span><b>${fmtV(v)}</b></div>
          <div class="row"><span>a = ω² r</span><b>${Math.round(a).toLocaleString('en-IN')} m/s²</b></div>
          ${extra}`;
      },
    };
  },
};
