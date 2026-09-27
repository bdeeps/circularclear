// Chapter 5: myths and limits.
// 1. "Centrifugal force" in a turning car. A ball rests on the smooth floor of an open cart going round
//    a circle. Nothing pulls it sideways, so seen from the road it carries straight on at the cart's
//    speed (Newton's first law); the cart turns away under it until the outer wall catches it. Seen
//    from inside the cart the same ball seems to be flung outwards: that "centrifugal force", m v² ÷ r,
//    is not a push from anything; it is the ball's inertia described from a turning frame. Drawn with
//    the cart enlarged; the path radius is 20 m for the numbers.
// 2. Coriolis. A ball rolled straight out from the middle of a turning roundabout. From the ground it
//    goes straight; on the roundabout its track curves (to the right for a roundabout turning
//    anticlockwise seen from above). Coriolis acceleration in the turning frame: 2 Ω v (Coriolis,
//    1835). Earth: Ω = 7.292 × 10⁻⁵ rad/s; the horizontal part is 2 Ω v sin(latitude).
//    Sink drain: water drifting at about 0.1 m/s in Delhi (28.6° N) gets 2 × 7.29 × 10⁻⁵ × 0.48 × 0.1
//    ≈ 7 × 10⁻⁶ m/s², about a millionth of g, far weaker than the swirl left by filling the basin or
//    its shape. Ascher Shapiro (MIT, Nature 196, 1962) only saw it after letting a 6 ft tank settle for
//    24 hours; Trefethen and others repeated it in Sydney with the opposite spin (Nature, 1965).
//    Hurricanes: wind of 10 m/s at 20° latitude gets about 5 × 10⁻⁴ m/s², small, but acting for days
//    over hundreds of kilometres, which is why they spin anticlockwise north of the equator.
// 3. Relativity: near the speed of light the formula becomes F = γ m v² ÷ r. LHC protons at 6.8 TeV
//    have γ ≈ 7,250 (CERN), so the magnets bend them much harder than m v² ÷ r alone would say.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, RPM, board, panelBg, title, logBars, text, COL, HEX, force, fitNarrow, reelBoards, inReel, fmtN,
  fmtG, disc, ring, trail, makePerson, switcher,
} from '../circular.js';

const CX = 0, RX = 50;
const RV = 4.2, R_REAL = 20;                             // cart path: drawn 4.2 units, 20 m for the numbers
const RR = 3.0;                                          // roundabout radius (life size, m)
const OMEGA_E = 7.292e-5;
const VIEWS = {
  frame: { pos: [CX + 0.8, 12.5, 12.5], target: [CX + 0.6, 2.8, 0], cx: CX },
  coriolis: { pos: [RX + 0.4, 7.2, 8], target: [RX + 0.3, 1.4, 0], cx: RX },
};
const BOARD_AT = { frame: [CX + 3.8, 5.0, -5.5], coriolis: [RX + 3.3, 2.5, -3.4] };
const REEL_AT = { frame: [CX, 5, -5.5], coriolis: [RX, 4.4, -4] };

export default {
  id: 'limits',
  short: 'Myths and limits',
  title: 'Centrifugal force, Coriolis and the sink myth',
  subtitle: 'Nothing flings you outwards. You just keep going straight.',
  view: VIEWS.frame,
  learn: `<p><b>Myth: "centrifugal force throws you outwards."</b> In a car taking a sharp bend you feel shoved towards the door. But nothing is pushing you out. Your body simply tries to <b>keep going straight</b> (inertia, Newton's first law), and the car turns away underneath you until the door pushes you <b>in</b>. Watch the ball on the cart: from the road its path is a straight line. Only from inside the turning cart does it seem to slide outwards.</p>
    <p>Physicists call centrifugal force a <b>fictitious force</b>: it appears when you describe motion from a <b>rotating frame</b>. That can be a handy trick, which is how Huygens first worked it out in the 1600s, but there is no outward push acting on the ball. Cut the string (chapter 1) and the ball flies off along the tangent, never straight out.</p>
    <p><b>Coriolis.</b> Slide a ball straight out across a smooth, turning roundabout. From the ground it goes straight; to someone riding the roundabout its path <b>curves sideways</b>. The Earth is a slow roundabout too, turning once a day, so winds and ocean currents curve: that is why cyclones spin <b>anticlockwise</b> north of the equator and clockwise south of it.</p>
    <p><b>Myth: sinks drain the other way in Australia.</b> The Earth's Coriolis effect on a sink is about a <b>millionth of g</b>. The shape of the basin and the swirl left from filling it matter thousands of times more. An MIT professor, Ascher Shapiro, needed a still 2 m tank, left for a whole day, to see it in 1962.</p>
    <p><b>Very fast.</b> Near the speed of light, F = m v² ÷ r needs Einstein's correction: the protons in the Large Hadron Collider need thousands of times more bending force than Newton's formula alone says.</p>
    <p class="tip"><b>Try it:</b> watch the ball from the road, then switch to "inside the cart". Same ball, same path, two very different stories.</p>`,
  terms: [
    { t: 'Inertia', d: 'The tendency of anything to keep moving in a straight line at a steady speed unless something pushes it.' },
    { t: 'Frame of reference', d: 'The point of view you measure motion from: the road, the car, or a turning roundabout.' },
    { t: 'Rotating frame', d: 'A point of view that turns, like a car going round a bend. Things seem to be pushed that aren’t.' },
    { t: 'Centrifugal force', d: 'The outward “force” you seem to feel in a turning frame. It is inertia, not a push from anything.' },
    { t: 'Coriolis effect', d: 'In a turning frame, moving things seem to curve sideways. On Earth it steers winds and cyclones.' },
    { t: 'Fictitious force', d: 'A force that appears only because the observer is accelerating or turning. Nothing causes it.' },
  ],
  defaults: { focus: 'frame', view: 'road', kmh: 40, rrpm: 8, rv: 2.5 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'frame', label: 'Ball on a cart' }, { v: 'coriolis', label: 'Roundabout' }] },
    { key: 'view', type: 'seg', label: 'Watch from', options: [{ v: 'road', label: 'The ground' }, { v: 'ride', label: 'Inside, turning' }] },
    { key: 'kmh', type: 'range', label: 'Cart speed', min: 10, max: 60, step: 1, ends: ['10 km/h', '60 km/h'], fmt: (v) => v + ' km/h' },
    { key: 'rrpm', type: 'range', label: 'Roundabout spin', min: 0, max: 20, step: 0.5, ends: ['0', '20 rpm'], fmt: (v) => v + ' rpm' },
    { key: 'rv', type: 'range', label: 'Ball speed across the roundabout', min: 1, max: 5, step: 0.1, ends: ['1 m/s', '5 m/s'], fmt: (v) => v.toFixed(1) + ' m/s' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Release the ball again', act: (s, inst) => inst.release?.() },
    ] },
  ],
  onChange(s, key) {
    if (key === 'kmh') s.focus = 'frame';
    if (key === 'rrpm' || key === 'rv') s.focus = 'coriolis';
  },
  quiz: [
    { q: 'In a car turning left, a loose bottle slides to the right-hand door. What really happened?', options: ['Centrifugal force pushed it right', 'It kept going straight while the car turned left under it', 'The road tilted', 'Air pushed it'], answer: 1, why: 'Nothing pushes the bottle outwards. It carries straight on (inertia) and the car turns away beneath it, until the door pushes it round with the car.' },
    { q: 'Seen from the ground, what path does a ball rolled straight out from the centre of a turning roundabout take?', options: ['A curve', 'A straight line', 'A spiral inwards', 'A circle'], answer: 1, why: 'From the ground nothing pushes it sideways, so it goes straight. Only riders on the roundabout see it curve: the Coriolis effect.' },
    { q: 'Does the Earth’s spin decide which way your sink drains?', options: ['Yes, always clockwise in the north', 'No: in a sink the Coriolis effect is about a millionth of g, swamped by the basin’s shape and leftover swirl', 'Only on the equator', 'Yes, but only for hot water'], answer: 1, why: 'The Coriolis effect grows with size and time. Over a cyclone hundreds of km wide it wins; in a sink it is far too small to matter.' },
  ],
  reel: [
    { ms: 5400, caption: 'No force flings the ball outwards. Seen from the road, it just goes straight while the cart turns.', set: { focus: 'frame', view: 'road', kmh: 40 }, act: (s, inst) => inst.release(0.3), view: { pos: [CX, 11, 7], target: [CX, 0, 0] }, spin: 0 },
    { ms: 5000, caption: 'Seen from inside the turning cart, the same ball seems flung out: “centrifugal force” is just inertia.', set: { focus: 'frame', view: 'ride', kmh: 40 }, act: (s, inst) => inst.release(0.3), view: { pos: [CX, 11, 7], target: [CX, 0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const groups = { frame: new THREE.Group(), coriolis: new THREE.Group() };
    groups.frame.position.x = CX; groups.coriolis.position.x = RX;
    Object.values(groups).forEach((g) => root.add(g));

    // ================================================================ ball on a cart
    const gFr = groups.frame;
    const world = new THREE.Group(); gFr.add(world);                  // everything that belongs to the road
    const grass = disc(9, 0.02, M.matte(0x2f4a33), 96); grass.position.y = 0.004; world.add(grass);
    const road = ring(RV - 0.9, RV + 0.9, M.matte(0x2b2f36, { roughness: 0.85 })); road.position.y = 0.02; world.add(road);
    const mid = ring(RV - 0.03, RV + 0.03, M.matte(0xe8e2c8)); mid.position.y = 0.026; world.add(mid);
    const post = disc(0.08, 0.6, M.metal(0xb9bec8), 16); post.position.y = 0.3; world.add(post);
    for (let k = 0; k < 10; k++) { const a = (k * TAU) / 10, t = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 8), M.matte(0x3f7a4a)); t.position.set((RV + 2.2) * Math.cos(a), 0.4, -(RV + 2.2) * Math.sin(a)); world.add(t); }
    const cart = new THREE.Group(); world.add(cart);
    const bed = box(1.8, 0.12, 1.3, M.plastic(0xffb547, { roughness: 0.4 })); bed.position.y = 0.3; cart.add(bed);
    const wallM = M.clear(0xffd9a0, 0.35);
    [[0, 0.62], [0, -0.62]].forEach(([x, z]) => { const w = box(1.8, 0.28, 0.06, wallM); w.position.set(x, 0.5, z); cart.add(w); });
    [[0.87, 0], [-0.87, 0]].forEach(([x, z]) => { const w = box(0.06, 0.28, 1.3, wallM); w.position.set(x, 0.5, z); cart.add(w); });
    const cab = box(0.6, 0.5, 1.3, M.plastic(0x2f6fd8, { roughness: 0.35 })); cab.position.set(1.2, 0.55, 0); cart.add(cab);
    for (const x of [-0.6, 0.6]) for (const z of [-0.66, 0.66]) { const w = torus(0.16, 0.06, M.matte(0x16181d), 20); w.position.set(x, 0.2, z); cart.add(w); }
    const ball = sphere(0.1, M.plastic(0xff5a8a, { roughness: 0.3 })); world.add(ball);
    const roadTrail = trail(0x8ef0ff, 0.03, 120); world.add(roadTrail);
    const cartTrail = trail(0xff5a8a, 0.03, 120); cart.add(cartTrail);
    const aCf = force(HEX.red, 0.04, 0.18); gFr.add(aCf);
    const lBall = stage.label('', [0, 0, 0], gFr, 'hot'); lBall.element.style.setProperty('--c', COL.cool);
    const lCart = stage.label('', [0, 0, 0], gFr);
    const bs = { t: 0, a0: 0, x0: 0, z0: 0, vx: 0, vz: 0, stuck: false, wait: 0, delay: 0, rp: [], cp: [] };
    let angC = 0;
    const release = (delay = 0) => Object.assign(bs, { t: 0, stuck: false, wait: 0, delay, pending: true, rp: [], cp: [] });
    release();

    // ================================================================ roundabout
    const gR = groups.coriolis;
    const rworld = new THREE.Group(); gR.add(rworld);
    const ground = disc(8, 0.02, M.matte(0x4a4a3a), 64); ground.position.y = 0.004; rworld.add(ground);
    const straight = trail(0x8ef0ff, 0.025, 100, 0.5); rworld.add(straight);
    const spinG = new THREE.Group(); rworld.add(spinG);
    const deck = disc(RR, 0.1, M.plastic(0xd8332f, { roughness: 0.5 }), 72); deck.position.y = 0.25; spinG.add(deck);
    for (let k = 0; k < 6; k++) { const a = (k * TAU) / 6, st = box(RR * 2 - 0.2, 0.012, 0.06, M.matte(0xf2d27a)); st.position.y = 0.306; st.rotation.y = a; spinG.add(st); }
    for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4; spinG.add(beam([0.2 * Math.cos(a), 0.3, 0.2 * Math.sin(a)], [(RR - 0.2) * Math.cos(a), 1.0, (RR - 0.2) * Math.sin(a)], 0.025, M.metal(0xb9bec8))); }
    const hubR = disc(0.25, 1.1, M.metal(0x8c95a3), 20); hubR.position.y = 0.6; spinG.add(hubR);
    const kid = makePerson({ shirt: 0x5ce1a9, s: 0.7 }); kid.position.set(-RR + 0.5, 0.3, 0); spinG.add(kid);
    const rball = sphere(0.09, M.plastic(0xffb547)); rworld.add(rball);
    const spinTrail = trail(0xff5a8a, 0.03, 100); spinG.add(spinTrail);
    const lR = stage.label('', [0, 0, 0], gR, 'hot'); lR.element.style.setProperty('--c', COL.red);
    const lS = stage.label('', [0, 0, 0], gR);
    const rb = { t: 0, a0: 0, pts: [], sp: [], wait: 0 };
    let angR = 0;

    // ================================================================ board: the sink myth
    let cur = null;
    const chart = board(root, 3.0, 1.7, 900, 510, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'How strong is the Coriolis effect?', 'sideways acceleration, log scale');
      const rows = [
        { label: 'Gravity, for scale', v: G, col: '#e8eef8', text: '9.81 m/s²' },
        { label: `Roundabout, ${cur ? cur.rrpm : 8} rpm`, v: cur ? Math.max(1e-7, 2 * cur.rrpm * RPM * cur.rv) : 4, col: COL.red, on: cur?.focus === 'coriolis', text: '' },
        { label: 'Cyclone wind, 10 m/s', v: 2 * OMEGA_E * Math.sin(20 * Math.PI / 180) * 10, col: COL.hot, text: '' },
        { label: 'Water in a sink, Delhi', v: 2 * OMEGA_E * Math.sin(28.6 * Math.PI / 180) * 0.1, col: COL.cool, on: true, text: '' },
      ].map((r) => ({ ...r, text: r.text || `${r.v.toExponential(1).replace('e-', ' × 10⁻').replace('e+', ' × 10^')} m/s²`.replace(/⁻(\d)/, (m, d) => '⁻' + '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]) }));
      logBars(g, w, rows, { x0: 260, x1: w - 230, y0: 78, dy: 70, bh: 36, lo: -6, hi: 1.5 });
      text(g, 'A sink gets about a millionth of g: its shape and leftover swirl win easily.', 20, h - 26, 'rgba(255,255,255,.7)', '18px sans-serif');
    }, BOARD_AT.frame);
    chart.mesh.rotation.y = -0.2;
    chart.mesh.scale.setScalar(1.5);

    const show = switcher(stage, groups, VIEWS);
    let key = '';
    return {
      release,
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lCart, lS]);
        show(s.focus, (f) => { chart.mesh.position.set(...BOARD_AT[f]); chart.mesh.scale.setScalar(f === 'frame' ? 2.1 : 1.4); chart.home = null; });
        reelBoards([[chart, REEL_AT[s.focus], 1.2]]);
        const k = `${s.focus}|${s.rrpm}|${s.rv}`; if (k !== key) { key = k; cur = { ...s }; chart.redraw(); }
        const ride = s.view === 'ride';

        if (s.focus === 'frame') {
          const v = s.kmh / KMH, w = Math.min(v / R_REAL, 1.0), vs = w * RV;
          angC += w * dt;
          const c = Math.cos(angC), sn = Math.sin(angC);
          cart.position.set(RV * c, 0, -RV * sn); cart.rotation.y = angC + Math.PI / 2;
          world.rotation.y = ride ? -angC - Math.PI / 2 : 0;
          cart.updateMatrixWorld(true);
          if (bs.pending) { bs.delay -= dt; if (bs.delay <= 0) { bs.pending = false; bs.a0 = angC; bs.t = 0; } }
          if (bs.pending) { ball.position.set(RV * c, 0.46, -RV * sn); }
          else if (!bs.stuck) {
            // released at the cart's centre with the cart's velocity; nothing pushes it sideways
            bs.t += dt;
            const a0 = bs.a0, p = [RV * Math.cos(a0) - Math.sin(a0) * vs * bs.t, 0.46, -RV * Math.sin(a0) - Math.cos(a0) * vs * bs.t];
            const loc = cart.worldToLocal(world.localToWorld(new THREE.Vector3(...p)));
            if (loc.z > 0.5 || Math.abs(loc.x) > 0.8) { bs.stuck = true; bs.loc = new THREE.Vector3(clamp(loc.x, -0.78, 0.78), 0.46, Math.min(loc.z, 0.5)); }
            ball.position.set(...p);
            if (!bs.rp.length || bs.t - bs.last > 0.05) { bs.last = bs.t; bs.rp.push([p[0], 0.4, p[2]]); bs.cp.push([loc.x, 0.4, loc.z]); roadTrail.setPoints(bs.rp); cartTrail.setPoints(bs.cp); }
          }
          if (bs.stuck) {
            const wp = cart.localToWorld(bs.loc.clone()); world.worldToLocal(wp); ball.position.copy(wp);
            bs.wait += dt; if (bs.wait > 1.6) release(0.2);
          }
          roadTrail.visible = !ride; cartTrail.visible = ride;
          // in the turning view, draw the "centrifugal" arrow the rider imagines
          const bw = new THREE.Vector3(); ball.getWorldPosition(bw); gFr.worldToLocal(bw);
          const cw = new THREE.Vector3(); cart.getWorldPosition(cw); gFr.worldToLocal(cw);
          const out = cw.clone().setY(0).normalize();
          aCf.visible = ride && !bs.stuck && !bs.pending; if (aCf.visible) aCf.aim([bw.x, 0.6, bw.z], [out.x, 0, out.z], 0.8);
          lBall.position.set(bw.x, 1.25, bw.z);
          lBall.element.innerHTML = bs.stuck ? 'the wall now pushes it <b>in</b>' : bs.pending ? '' : ride ? 'seems flung <b>outwards</b>' : 'keeps going <b>straight</b>';
          lBall.element.style.setProperty('--c', ride ? COL.red : COL.cool);
          lCart.position.set(cw.x * 0.5, 1.0, cw.z * 0.5); lCart.element.innerHTML = ride ? 'you, turning with the cart' : 'the cart turns away under it';
        }

        if (s.focus === 'coriolis') {
          const W = s.rrpm * RPM, wS = Math.min(W, 1.6);
          angR += wS * dt; spinG.rotation.y = angR;
          rworld.rotation.y = ride ? -angR : 0;
          // the ball starts at the middle and rolls straight out along a fixed ground direction
          rb.t += dt;
          // slowed by the same factor as the spin, so the turn during the crossing stays true
          const vv = W > 0 ? s.rv * (wS / W) : s.rv * 0.6, dist = vv * rb.t;
          const dir = [Math.cos(rb.a0), 0, -Math.sin(rb.a0)];
          const p = [dir[0] * (0.3 + dist), 0.4, dir[2] * (0.3 + dist)];
          if (dist > RR + 0.1) { rb.wait += dt; if (rb.wait > 1) { Object.assign(rb, { t: 0, a0: angR + 0.3, pts: [], sp: [], wait: 0 }); } }
          else {
            rball.position.set(...p);
            if (!rb.pts.length || rb.t - rb.last > 0.04) { rb.last = rb.t; rb.pts.push([p[0], 0.36, p[2]]); const loc = spinG.worldToLocal(rworld.localToWorld(new THREE.Vector3(...p))); rb.sp.push([loc.x, 0.36 - 0.0, loc.z]); straight.setPoints(rb.pts); spinTrail.setPoints(rb.sp); }
          }
          straight.visible = !ride;
          lR.position.set(p[0], 1.1, p[2]); lR.element.innerHTML = ride ? 'curves <b>sideways</b>' : 'goes <b>straight</b>';
          lR.element.style.setProperty('--c', ride ? COL.red : COL.cool);
          lS.position.set(-2, 1.6, 1.5); lS.element.innerHTML = ride ? 'pink: its track on the roundabout' : 'blue: its path over the ground';
        }
      },
      readout: (s) => {
        if (s.focus === 'coriolis') {
          const W = s.rrpm * RPM, ac = 2 * W * s.rv, t = RR / s.rv;
          return `<div class="big">Coriolis: ${ac.toFixed(1)} m/s²</div>
            <div class="row"><span>2 Ω v, Ω = ${W.toFixed(2)} rad/s, v = ${s.rv.toFixed(1)} m/s</span><b>${fmtG(ac / G)}</b></div>
            <div class="row"><span>Time to reach the edge</span><b>${t.toFixed(1)} s</b></div>
            <div class="row"><span>Roundabout turns meanwhile</span><b>${Math.round((W * t) / TAU * 360)}°</b></div>
            <div class="row"><span>Same thing for a sink, on Earth</span><b>≈ 7 × 10⁻⁶ m/s²</b></div>
            <small>From the ground the ball goes straight. Riders see it curve because they turn while it rolls.</small>`;
        }
        const v = s.kmh / KMH, a = v * v / R_REAL;
        return `<div class="big">${s.view === 'ride' ? '“Centrifugal force”' : 'No outward force'}</div>
          <div class="row"><span>Cart: ${s.kmh} km/h on a ${R_REAL} m bend</span><b>a = ${a.toFixed(1)} m/s²</b></div>
          <div class="row"><span>Push the wall must give a 0.16 kg ball</span><b>${fmtN(0.16 * a)} inwards</b></div>
          <div class="row"><span>What the rider “feels” pushing it out</span><b>${fmtN(0.16 * a)}</b></div>
          <small>${s.view === 'ride' ? 'In a turning frame, inertia looks like a force. Nothing is actually pushing the ball.' : 'From the road, the ball goes straight until the wall catches it and pushes it round.'} The cart is drawn larger than life.</small>`;
      },
    };
  },
};
