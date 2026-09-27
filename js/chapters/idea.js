// Chapter 1: what circular motion is, and the centripetal force it needs: F = m v² ÷ r.
// A ball on a string is whirled round a post on an air table (so gravity doesn't tilt the string and
// friction doesn't slow it). A spring balance in the string reads the tension: the centripetal force.
// Formulas (Huygens, Horologium Oscillatorium 1673; Newton, Principia 1687, Definition 5):
//   a = v² ÷ r = ω² r, F = m a = m v² ÷ r, ω = v ÷ r, period T = 2π r ÷ v, rpm = 60 ÷ T.
// Units: force in newtons (kg m/s²), acceleration in m/s², ω in radians per second.
// When the string is cut, nothing pulls the ball inwards, so it carries straight on along the
// tangent at the speed it had (Newton's first law, see NewtonClear).
// The motion on screen is slowed when the real ω is above 4 rad/s, and the readout says by how much.
// Force arrows use a log scale (0.01 N to 1,000 N); the board shows the true F against v.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, TAU, accel, periodOf, rpmOf, board, panelBg, title, axes, dot, line, text, COL, HEX, force, fitNarrow,
  pickView, reelBoards, inReel, fmtN, fmtG, fmtT, fmtRpm, disc, trail,
} from '../circular.js';

const Y = 0.62;                                         // height of the string above the floor
const law = (m, v, r) => (m * v * v) / r;
const alen = (F) => clamp(0.18 + (Math.log10(Math.max(F, 0.005)) + 2) * 0.15, 0.12, 1.05);
const VIEW = { pos: [0.45, 3.3, 3.8], target: [0.3, 0.85, 0], cx: 0 };
const SHOW_MAX = 4;                                     // fastest angular speed drawn, rad/s

export default {
  id: 'idea',
  short: 'Why circles need a pull',
  title: 'Going round in a circle needs a pull to the centre',
  subtitle: 'Double the speed and you need four times the pull.',
  view: VIEW,
  learn: `<p>Whirl a ball on a string. Its <b>speed</b> can stay the same, but its <b>direction</b> changes all the time. A change of direction is a change of <b>velocity</b>, so the ball is <b>accelerating</b>, and by Newton's second law (see NewtonClear) something must push or pull it. That something is the string, pulling towards the centre. We call a pull like this a <b>centripetal force</b>: "centre-seeking".</p>
    <p>How big must it be? For mass m going at speed v round a circle of radius r:</p>
    <p><b>F = m v² ÷ r</b>, and the acceleration is <b>a = v² ÷ r</b>.</p>
    <p>Force is in <b>newtons</b>, acceleration in <b>m/s²</b>. The speed is <b>squared</b>, so double the speed and the pull goes up <b>four times</b>. A tighter circle, smaller r, also needs a bigger pull. You can <b>measure</b> it by putting a spring balance in the string, as here.</p>
    <p>Spinning things are often described by how fast they <b>turn</b> instead: the <b>angular speed</b> ω in radians per second, or <b>rpm</b>, turns per minute. Every point on a spinning thing turns at the same ω, but points further out move faster: <b>v = ω r</b>. Watch the bead halfway along the string: it goes round with the ball but at half the speed.</p>
    <p>Now <b>cut the string</b>. The ball does not fly outwards. It goes <b>straight on</b>, along the line touching the circle, the <b>tangent</b>. Nothing was pushing it out; the string was only bending its path in.</p>
    <p class="tip"><b>Try it:</b> press "Double the speed" and watch the pull on the board jump four times. Then cut the string and watch which way the ball goes.</p>`,
  terms: [
    { t: 'Centripetal force', d: 'The inward pull or push that keeps something moving in a circle: F = m v² ÷ r. A string, gravity, friction or a wall can supply it.' },
    { t: 'Centripetal acceleration', d: 'The acceleration towards the centre of the circle: a = v² ÷ r, in m/s². It changes the direction, not the speed.' },
    { t: 'Velocity', d: 'Speed together with direction. Going round a circle at steady speed, your velocity keeps changing.' },
    { t: 'Angular speed (ω)', d: 'How fast something turns, in radians per second. One turn is 2π radians, so 60 rpm is 6.28 rad/s.' },
    { t: 'rpm', d: 'Revolutions per minute: how many whole turns in a minute.' },
    { t: 'Period', d: 'The time for one full turn: T = 2π r ÷ v.' },
    { t: 'Tangent', d: 'The straight line that just touches the circle at one point. A released object flies off along it.' },
  ],
  defaults: { m: 0.2, v: 3, r: 0.8 },
  controls: [
    { key: 'm', type: 'log', label: 'Mass of the ball', min: 0.05, max: 2, ends: ['50 g', '2 kg'], fmt: (v) => (v < 1 ? Math.round(v * 1000) + ' g' : v.toFixed(2) + ' kg') },
    { key: 'v', type: 'range', label: 'Speed v', min: 0.5, max: 10, step: 0.1, ends: ['0.5 m/s', '10 m/s'], fmt: (v) => v.toFixed(1) + ' m/s' },
    { key: 'r', type: 'range', label: 'Radius r (string length)', min: 0.3, max: 1.5, step: 0.01, ends: ['0.3 m', '1.5 m'], fmt: (v) => v.toFixed(2) + ' m' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Double the speed', act: (s) => { s.v = clamp(+(s.v * 2).toFixed(1), 0.5, 10); } },
      { label: 'Halve the speed', act: (s) => { s.v = clamp(+(s.v / 2).toFixed(1), 0.5, 10); } },
      { label: 'Double the radius', act: (s) => { s.r = clamp(+(s.r * 2).toFixed(2), 0.3, 1.5); } },
      { label: 'Double the mass', act: (s) => { s.m = clamp(s.m * 2, 0.05, 2); } },
      { label: 'Cut the string', act: (s, inst) => inst.cut?.() },
    ] },
  ],
  quiz: [
    { q: 'A ball on a string needs a pull of 5 N at 2 m/s. You whirl it at 4 m/s on the same string. What pull does it need now?', options: ['10 N', '20 N', '5 N', '2.5 N'], answer: 1, why: 'F = m v² ÷ r goes with the square of the speed. Twice the speed needs 2² = 4 times the pull: 20 N.' },
    { q: 'You let go of a whirling ball. Which way does it fly?', options: ['Straight out from the centre', 'Along the tangent: straight on in the direction it was moving', 'In a spiral outwards', 'Straight down'], answer: 1, why: 'Once nothing pulls it inwards, the ball keeps its velocity, so it carries straight on along the tangent. Nothing ever pushed it outwards.' },
    { q: 'A ball goes round at a steady 3 m/s. Is it accelerating?', options: ['No, its speed is constant', 'Yes, towards the centre, because its direction keeps changing', 'Yes, outwards', 'Only when it speeds up'], answer: 1, why: 'Velocity includes direction. Turning is a change of velocity, so there is an acceleration of v² ÷ r, pointing at the centre.' },
  ],
  reel: [
    { ms: 5600, caption: 'Going round needs a pull to the centre: F = m v² ÷ r. Double the speed, four times the pull.', set: { m: 0.5, v: 2, r: 0.9 }, anim: { v: [2, 6] }, view: { pos: [0.2, 3.2, 4.4], target: [0.2, 1.0, 0] }, spin: 0 },
    { ms: 5000, caption: 'Cut the string and the ball flies straight on along the tangent, not outwards.', set: { m: 0.5, v: 2.5, r: 0.9 }, act: (s, inst) => inst.cut(0.9), view: { pos: [0, 4.6, 2.6], target: [0, 0.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // air table: a round glassy top on a stand, with a post in the middle
    const top = disc(1.75, 0.06, M.plastic(0x1d2433, { roughness: 0.15, metalness: 0.2 }), 96); top.position.y = Y - 0.09; root.add(top);
    const rim = torus(1.75, 0.025, M.metal(0x8c95a3), 96); rim.rotation.x = Math.PI / 2; rim.position.y = Y - 0.06; root.add(rim);
    const leg = disc(0.12, Y - 0.12, M.metal(0x5a606b), 24); leg.position.y = (Y - 0.12) / 2; root.add(leg);
    const foot = disc(0.6, 0.04, M.matte(0x2a2f3a), 48); foot.position.y = 0.02; root.add(foot);
    const holes = new THREE.InstancedMesh(new THREE.CircleGeometry(0.008, 6), M.glow(0x3a4a66), 400);
    { const o = new THREE.Object3D(); let i = 0; for (let a = -1.6; a <= 1.6; a += 0.16) for (let b = -1.6; b <= 1.6; b += 0.16) { if (a * a + b * b > 1.66 ** 2 || i >= 400) continue; o.position.set(a, Y - 0.058, b); o.rotation.x = -Math.PI / 2; o.updateMatrix(); holes.setMatrixAt(i++, o.matrix); } holes.count = i; }
    root.add(holes);
    const post = disc(0.05, 0.28, M.metal(0xb9bec8), 24); post.position.y = Y + 0.05; root.add(post);
    const cap = sphere(0.06, M.metal(0xd8dde6)); cap.position.y = Y + 0.2; root.add(cap);

    // the spinning part: string, spring balance, bead, ball
    const arm = new THREE.Group(); arm.position.y = Y; root.add(arm);
    const strM = M.plastic(0xf2ead8, { roughness: 0.6 });
    const string = beam([0, 0, 0], [1, 0, 0], 0.006, strM); arm.add(string);
    const scaleG = new THREE.Group(); arm.add(scaleG);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 20), M.plastic(0xffb547, { roughness: 0.3 })); barrel.rotation.z = Math.PI / 2; barrel.castShadow = true; scaleG.add(barrel);
    const needle = box(0.012, 0.035, 0.012, M.glow(0xff3b30)); needle.position.y = 0.03; scaleG.add(needle);
    const bead = sphere(0.035, M.plastic(0x5ce1a9)); arm.add(bead);
    const ballM = M.plastic(0xff7a59, { roughness: 0.35 });
    const ball = sphere(1, ballM, 40); root.add(ball);
    const path = torus(1, 0.006, M.ghost(0xffffff, 0.35)); path.rotation.x = Math.PI / 2; path.position.y = Y; root.add(path);
    const aF = force(HEX.pull, 0.03, 0.14), aV = force(HEX.vel, 0.03, 0.14), aVb = force(HEX.vel, 0.02, 0.1); root.add(aF, aV, aVb);
    const flight = trail(0xffb547, 0.018, 60); root.add(flight);
    const lF = stage.label('', [0, 0, 0], root, 'hot'); lF.element.style.setProperty('--c', COL.pull);
    const lV = stage.label('', [0, 0, 0], root); const lB = stage.label('', [0, 0, 0], root);
    const lS = stage.label('spring balance', [0, 0.13, 0], scaleG);
    const lT = stage.label('air table: no friction', [-1.2, Y - 0.1, 1.45], root);

    let cur = null;
    const chart = board(root, 2.6, 1.55, 900, 540, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { m, v, r } = cur, Fmax = Math.max(law(m, 10, r), 1e-6);
      title(g, 'Pull against speed', `F = m v² ÷ r  ·  m = ${m < 1 ? Math.round(m * 1000) + ' g' : m.toFixed(2) + ' kg'}, r = ${r.toFixed(2)} m`);
      const { X, Y: Yc } = axes(g, w, h, { xMax: 10, yMax: Fmax * 1.05, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 0.25, 0.5, 0.75, 1].map((k) => k * Fmax), xFmt: (x) => x + ' m/s', yFmt: (y) => (y === 0 ? '0' : fmtN(y)), xLabel: 'speed v →', yLabel: 'pull F ↑', x0: 110 });
      const pts = []; for (let x = 0; x <= 10.001; x += 0.1) pts.push([x, law(m, x, r)]);
      line(g, pts, X, Yc, COL.pull, 5);
      [1, 2].forEach((k) => { const x = v * k; if (x > 10) return; const y = law(m, x, r); g.strokeStyle = 'rgba(255,255,255,.3)'; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(X(x), Yc(0)); g.lineTo(X(x), Yc(y)); g.lineTo(X(0), Yc(y)); g.stroke(); g.setLineDash([]); dot(g, X(x), Yc(y), k === 1 ? COL.hot : '#fff', k === 1 ? 10 : 7); text(g, k === 1 ? 'you' : '2 × speed → 4 × pull', X(x) + (k === 1 ? 12 : -236), Yc(y) + (k === 1 ? -10 : 28), k === 1 ? COL.hot : '#fff', 'bold 18px sans-serif'); });
    }, [1.35, 1.95, -1.9]);
    chart.mesh.rotation.y = -0.12;

    let ang = 0, key = '', cs = null;
    const cut = (after = 0) => { cs = { wait: after, a: null, t: 0, pts: [], last: -1 }; };
    return {
      cut,
      update(dt, s) {
        dt = Math.max(0, dt);
        fitNarrow(stage, [lS, lT, lB]);
        reelBoards([[chart, [0.2, 2.4, -1.3], 0.95]]);
        const w = s.v / s.r, slow = Math.max(1, w / SHOW_MAX), F = law(s.m, s.v, s.r);
        const rb = 0.06 * Math.cbrt(s.m / 0.2) + 0.02;
        ball.scale.setScalar(rb);
        path.scale.set(s.r, s.r, 1);
        if (cs && cs.wait > 0) cs.wait -= dt;
        else if (cs) {
          if (cs.a === null) cs.a = ang;
          cs.t += dt;
          const vs = s.v / slow, a0 = cs.a;
          const dir = [-Math.sin(a0), 0, -Math.cos(a0)];
          const p = [s.r * Math.cos(a0) + dir[0] * vs * cs.t, Y, -s.r * Math.sin(a0) + dir[2] * vs * cs.t];
          ball.position.set(...p);
          if (cs.t - cs.last > 0.04) { cs.pts.push(p); cs.last = cs.t; flight.setPoints(cs.pts); }
          string.visible = scaleG.visible = bead.visible = false;
          aF.visible = false; aVb.visible = false;
          aV.aim(p, dir, 0.25 + s.v * 0.06);
          lF.position.set(p[0], Y + 0.3, p[2]); lF.element.innerHTML = 'no pull: <b>straight on</b>';
          lV.visible = lB.visible = lS.visible = false;
          if (cs.t > 1.8 || Math.hypot(p[0], p[2]) > 3.2) { cs = null; flight.setPoints([]); }
          return;
        }
        string.visible = scaleG.visible = bead.visible = true; lV.visible = true; lB.visible = stage.host.clientWidth >= 560 && s.r >= 0.6; lS.visible = stage.host.clientWidth >= 560;
        ang += (w / slow) * dt;
        const c = Math.cos(ang), sn = Math.sin(ang);
        arm.rotation.y = ang;
        const reach = s.r - rb;
        string.scale.set(1, reach, 1); string.position.set(reach / 2, 0, 0);
        scaleG.position.set(Math.min(0.3, reach * 0.4), 0, 0);
        needle.position.x = -0.08 + clamp(Math.log10(Math.max(F, 0.01)) + 2, 0, 5) * 0.032;
        bead.position.set(s.r / 2, 0, 0);
        ball.position.set(s.r * c, Y, -s.r * sn);
        const tan = [-sn, 0, -c], inward = [-c, 0, sn];
        aF.aim([s.r * c, Y + 0.02, -s.r * sn], inward, Math.min(alen(F), s.r * 0.75));
        aV.aim([s.r * c, Y + 0.02, -s.r * sn], tan, 0.25 + s.v * 0.06);
        aVb.visible = true; aVb.aim([(s.r / 2) * c, Y + 0.02, -(s.r / 2) * sn], tan, 0.12 + s.v * 0.03);
        lF.position.set(s.r * c * 0.5, Y + 0.3, -s.r * sn * 0.5); lF.element.innerHTML = `pull <b>${fmtN(F)}</b>`;
        lV.position.set(s.r * c * 1.18, Y + 0.18, -s.r * sn * 1.18); lV.element.innerHTML = `v = <b>${s.v.toFixed(1)} m/s</b>`;
        lB.position.set((s.r / 2) * c, Y - 0.12, -(s.r / 2) * sn); lB.element.innerHTML = `halfway: ${(s.v / 2).toFixed(1)} m/s`;
        const k = `${s.m}|${s.v}|${s.r}`; if (k !== key) { key = k; cur = { m: s.m, v: s.v, r: s.r }; chart.redraw(); }
      },
      readout: (s) => {
        const F = law(s.m, s.v, s.r), a = accel(s.v, s.r), w = s.v / s.r, T = periodOf(s.v, s.r), slow = Math.max(1, w / SHOW_MAX);
        return `<div class="big">F = ${fmtN(F)}</div>
          <div class="row"><span>m × v² ÷ r</span><b>${s.m.toFixed(2)} × ${s.v.toFixed(1)}² ÷ ${s.r.toFixed(2)}</b></div>
          <div class="row"><span>Acceleration a = v² ÷ r</span><b>${a.toFixed(a >= 100 ? 0 : 1)} m/s² (${fmtG(a / G)})</b></div>
          <div class="row"><span>Angular speed ω = v ÷ r</span><b>${w.toFixed(1)} rad/s</b></div>
          <div class="row"><span>One turn takes</span><b>${fmtT(T)} · ${fmtRpm(rpmOf(w))}</b></div>
          <small>${slow > 1.05 ? `Shown ${slow.toFixed(1)}× slower than real. ` : ''}Force arrows use a log scale; the board shows the real curve.</small>`;
      },
    };
  },
};
