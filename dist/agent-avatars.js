function ut(T) {
  let n = 0;
  for (let P = 0; P < T.length; P++)
    n = (n << 5) - n + T.charCodeAt(P), n |= 0;
  return Math.abs(n) || 1;
}
function W(T) {
  let n = (T % 2147483647 + 2147483647) % 2147483647;
  return n === 0 && (n = 1), () => (n = n * 16807 % 2147483647, (n - 1) / 2147483646);
}
function X(T, n, P) {
  if (n === 0) {
    const g = Math.round(P * 255);
    return [g, g, g];
  }
  const u = P < 0.5 ? P * (1 + n) : P + n - P * n, $ = 2 * P - u, M = (g, w, s) => (s < 0 && (s += 1), s > 1 && (s -= 1), s < 1 / 6 ? g + (w - g) * 6 * s : s < 1 / 2 ? w : s < 2 / 3 ? g + (w - g) * (2 / 3 - s) * 6 : g);
  return [
    Math.round(M($, u, T + 1 / 3) * 255),
    Math.round(M($, u, T) * 255),
    Math.round(M($, u, T - 1 / 3) * 255)
  ];
}
function U(T, n) {
  return n !== "dark" ? T : Math.max(0.15, Math.min(0.72, 0.88 - T * 0.78));
}
function V(T, n) {
  const P = W(T), u = Math.floor(P() * 360), $ = 30 + Math.floor(P() * 25), M = n === "dark", g = Math.max($ - 15, 8), w = 6, s = M ? { bg: 0.1, lighter: 0.18, light: 0.3, primary: 0.45, dark: 0.58, darker: 0.7, greyLight: 0.5, greyDark: 0.22 } : { bg: 0.95, lighter: 0.9, light: 0.83, primary: 0.75, dark: 0.62, darker: 0.48, greyLight: 0.82, greyDark: 0.45 };
  return {
    primary: `hsl(${u}, ${$}%, ${s.primary * 100}%)`,
    light: `hsl(${u}, ${$}%, ${s.light * 100}%)`,
    lighter: `hsl(${u}, ${$}%, ${s.lighter * 100}%)`,
    dark: `hsl(${u}, ${$}%, ${s.dark * 100}%)`,
    darker: `hsl(${u}, ${$}%, ${s.darker * 100}%)`,
    bg: `hsl(${u}, ${g}%, ${s.bg * 100}%)`,
    greyLight: `hsl(${u}, ${w}%, ${s.greyLight * 100}%)`,
    greyDark: `hsl(${u}, ${w}%, ${s.greyDark * 100}%)`,
    hue: u,
    sat: $,
    mode: M ? "dark" : "light",
    primaryRgb: X(u / 360, $ / 100, s.primary),
    lightRgb: X(u / 360, $ / 100, s.light),
    darkRgb: X(u / 360, $ / 100, s.dark),
    darkerRgb: X(u / 360, $ / 100, s.darker),
    bgRgb: X(u / 360, g / 100, s.bg),
    greyLightRgb: X(u / 360, w / 100, s.greyLight),
    greyDarkRgb: X(u / 360, w / 100, s.greyDark)
  };
}
const ot = /* @__PURE__ */ new Set();
let z = null;
function Pt(T) {
  for (const n of ot)
    n(T);
  ot.size > 0 ? z = requestAnimationFrame(Pt) : z = null;
}
function K(T) {
  return ot.add(T), z === null && (z = requestAnimationFrame(Pt)), () => {
    ot.delete(T), ot.size === 0 && z !== null && (cancelAnimationFrame(z), z = null);
  };
}
const Ct = 800, It = 1500, bt = 1e3 / 60, wt = typeof window < "u" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
function G(T) {
  return Math.min(Math.max(Math.round(T * wt), 32), 200);
}
function Z(T, n, P, u, $) {
  const M = document.createElement("canvas");
  M.style.width = P + "px", M.style.height = P + "px", M.style.borderRadius = "50%", M.style.flexShrink = "0", M.style.display = "block", T.appendChild(M);
  const g = ($ == null ? void 0 : $.fps) ?? 60, w = g < 60 ? Math.round(60 / g) : 1;
  let s = !1, o = 0, e = 0, i = null, y = 0, r = 0, t = null, m = u;
  function v() {
    const C = G(P);
    M.width = C, M.height = C, o = 0, e = 0, i = null, y = 0, m(M, 0, 0);
  }
  function b(C) {
    const x = i !== null ? C - i : 16;
    i = C;
    const R = x > 200 ? bt : Math.min(x, 50), k = s ? 1 : 0;
    if (Math.abs(e - k) > 3e-3) {
      const d = k > e ? R / Ct : R / It;
      e = Math.max(0, Math.min(1, e + (k > e ? 1 : -1) * d));
    } else
      e = k;
    if (e === 0 && !s)
      return m(M, o, 0), "done";
    y += R, r++, !(r < w) && (r = 0, o += y / bt, y = 0, m(M, o, e));
  }
  function l() {
    if (t) return;
    i = null, t = K((x) => {
      b(x) === "done" && t && (t(), t = null);
    });
  }
  function S() {
    t && (t(), t = null);
  }
  return v(), {
    canvas: M,
    setActive(C) {
      s = C, s || e > 0 ? l() : m(M, o, 0);
    },
    setDrawFn(C) {
      m = C;
    },
    reinit() {
      S(), v(), s && l();
    },
    destroy() {
      S(), M.parentNode && M.parentNode.removeChild(M);
    }
  };
}
function At(T, n, P, u) {
  const $ = V(n, u), { hue: M, sat: g, bgRgb: w } = $, s = W(n), o = 4 + Math.floor(s() * 3), e = Array.from({ length: o }, () => ({
    baseX: 0.2 + s() * 0.6,
    baseY: 0.2 + s() * 0.6,
    strength: 0.5 + s() * 0.9,
    orbitRx: 0.06 + s() * 0.14,
    orbitRy: 0.06 + s() * 0.14,
    speed: 0.03 + s() * 0.04,
    phase: s() * Math.PI * 2
  }));
  function i(y, r, t) {
    const m = y.getContext("2d"), v = y.width, b = 3, l = m.createImageData(v, v), S = l.data;
    for (let C = 0; C < v; C += b)
      for (let x = 0; x < v; x += b) {
        const R = x / v, k = C / v, d = R - 0.5, p = k - 0.5, f = Math.sqrt(d * d + p * p);
        let a, c, h, A;
        if (f > 0.5)
          a = c = h = A = 0;
        else {
          let D = 0;
          for (const q of e) {
            const L = q.baseX + Math.sin(r * q.speed + q.phase) * q.orbitRx * t, N = q.baseY + Math.cos(r * q.speed * 0.8 + q.phase * 1.3) * q.orbitRy * t;
            D += q.strength / ((R - L) ** 2 + (k - N) ** 2 + 8e-3);
          }
          const I = Math.min((0.5 - f) * 10, 1);
          if (D > 5.5) {
            const q = Math.min((D - 5.5) / 15, 1), L = X(M / 360, g / 100, U(0.58 + q * 0.3, u));
            a = L[0], c = L[1], h = L[2], A = Math.min(q * 2, 1) * I * 255;
          } else
            a = w[0], c = w[1], h = w[2], A = I * 255;
        }
        for (let D = 0; D < b && C + D < v; D++)
          for (let I = 0; I < b && x + I < v; I++) {
            const q = ((C + D) * v + (x + I)) * 4;
            S[q] = a, S[q + 1] = c, S[q + 2] = h, S[q + 3] = A | 0;
          }
      }
    m.putImageData(l, 0, 0);
  }
  return Z(T, n, P, i, { fps: 30 });
}
function St(T) {
  const n = T.length, P = T[0].length;
  return T.map(
    (u, $) => u.map((M, g) => {
      let w = 0;
      for (let s = -1; s <= 1; s++)
        for (let o = -1; o <= 1; o++)
          !s && !o || T[($ + s + n) % n][(g + o + P) % P] && w++;
      return M && w === 2 || w === 3;
    })
  );
}
function pt(T) {
  let n = "", P = 0, u = 0;
  for (const $ of T)
    for (const M of $)
      M && (P |= 1 << u), ++u === 8 && (n += String.fromCharCode(P), P = 0, u = 0);
  return u > 0 && (n += String.fromCharCode(P)), n;
}
function kt(T) {
  let n = 0;
  for (const P of T)
    for (const u of P)
      u && n++;
  return n;
}
function gt(T, n) {
  const P = W(T), u = Array.from({ length: n }, () => Array(n).fill(!1)), $ = [
    [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]],
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [2, 1], [3, 1], [4, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 2], [1, 3], [2, 1], [2, 2]]
  ];
  for (let e = 0; e < 2; e++) {
    const i = $[Math.floor(P() * $.length)], y = 3 + Math.floor(P() * (n - 6)), r = 3 + Math.floor(P() * (n - 6)), t = Math.floor(P() * 4);
    for (let [m, v] of i) {
      for (let b = 0; b < t; b++) {
        const l = v;
        v = -m, m = l;
      }
      u[(r + m + n) % n][(y + v + n) % n] = !0;
    }
  }
  const M = [
    [[0, -1], [0, 0], [0, 1]],
    // blinker
    [[0, 0], [0, 1], [1, 0], [1, 1]]
    // block (still life)
  ];
  for (let e = 0; e < 3; e++) {
    const i = M[Math.floor(P() * M.length)], y = 2 + Math.floor(P() * (n - 4)), r = 2 + Math.floor(P() * (n - 4));
    for (const [t, m] of i)
      u[(r + t + n) % n][(y + m + n) % n] = !0;
  }
  const g = [u], w = /* @__PURE__ */ new Map();
  w.set(pt(u), 0);
  let s = u;
  for (let e = 1; e <= 500; e++) {
    s = St(s);
    const i = pt(s);
    if (w.has(i)) break;
    w.set(i, e), g.push(s);
  }
  const o = g.filter((e, i) => i === 0 || kt(e) > 6);
  return o.length > 10 ? o : g.slice(0, Math.max(g.length, 20));
}
const et = 14, Tt = 800, Dt = 1500, yt = 130;
function qt(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, g = [$.darkerRgb, $.darkRgb, $.primaryRgb], w = [0.5, 0.7, 1], s = gt(n, et), o = gt(n + 7919, et), e = gt(n + 16661, et), i = document.createElement("canvas");
  i.style.width = P + "px", i.style.height = P + "px", i.style.borderRadius = "50%", i.style.flexShrink = "0", i.style.display = "block", T.appendChild(i);
  const y = G(P);
  i.width = y, i.height = y;
  const r = i.getContext("2d");
  function t(k, d) {
    const p = k.length * 2 - 2;
    if (p <= 0) return 0;
    const f = d % p;
    return f < k.length ? f : p - f;
  }
  function m(k, d) {
    const p = y / et, f = Math.max(0.3, p * 0.08), a = p * 0.1;
    r.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, r.fillRect(0, 0, y, y);
    const c = [
      s[t(s, k)],
      o[t(o, k + 3)],
      e[t(e, k + 7)]
    ];
    for (let h = 0; h < 3; h++) {
      const A = c[h], D = g[h], I = w[h];
      r.fillStyle = `rgba(${D[0]},${D[1]},${D[2]},${I})`;
      for (let q = 0; q < et; q++)
        for (let L = 0; L < et; L++) {
          if (!A[q][L]) continue;
          const N = L * p + f / 2, F = q * p + f / 2, Y = p - f, O = p - f;
          a > 0 ? (r.beginPath(), r.moveTo(N + a, F), r.lineTo(N + Y - a, F), r.quadraticCurveTo(N + Y, F, N + Y, F + a), r.lineTo(N + Y, F + O - a), r.quadraticCurveTo(N + Y, F + O, N + Y - a, F + O), r.lineTo(N + a, F + O), r.quadraticCurveTo(N, F + O, N, F + O - a), r.lineTo(N, F + a), r.quadraticCurveTo(N, F, N + a, F), r.fill()) : r.fillRect(N, F, Y, O);
        }
    }
    r.globalCompositeOperation = "destination-in", r.beginPath(), r.arc(y / 2, y / 2, y / 2, 0, Math.PI * 2), r.fill(), r.globalCompositeOperation = "source-over";
  }
  let v = !1, b = 0, l = 0, S = null, C = 0, x = null;
  m(0);
  function R() {
    x || (S = null, C = 0, x = K((k) => {
      const d = S !== null ? k - S : 16;
      S = k;
      const p = v ? 1 : 0;
      let f = !1;
      if (Math.abs(b - p) > 3e-3) {
        const a = p > b ? d / Tt : d / Dt;
        b = Math.max(0, Math.min(1, b + (p > b ? 1 : -1) * a)), f = !0;
      } else b !== p && (b = p, f = !0);
      if (b === 0 && !v) {
        f && m(l), x && (x(), x = null);
        return;
      }
      C += d, C >= yt && (C -= yt, l++, f = !0), f && m(l);
    }));
  }
  return {
    canvas: i,
    setActive(k) {
      v = k, (v || b > 0) && R();
    },
    destroy() {
      x && (x(), x = null), i.parentNode && i.parentNode.removeChild(i);
    }
  };
}
const Nt = 800, Ot = 1500, Mt = 22;
function _t(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, g = $.lightRgb, w = [$.darkRgb, $.primaryRgb, $.lightRgb], s = W(n), o = 2 + Math.floor(s() * 2), e = Array.from({ length: o }, (k, d) => {
    const p = Array.from({ length: 40 }, () => s() * 0.12 - 0.06);
    return {
      baseRadius: 7 + d * 11 + s() * 2,
      wobbles: p,
      strokeWidth: 1.5 + s() * 2.5,
      shadeRgb: w[d % w.length],
      breatheSpeed: 0.09 + s() * 0.08,
      breatheAmp: 2 + s() * 2.5,
      phase: s() * Math.PI * 2,
      wobbleSpeed: 0.045 + s() * 0.04
    };
  }), i = document.createElement("canvas");
  i.style.width = P + "px", i.style.height = P + "px", i.style.borderRadius = "50%", i.style.flexShrink = "0", i.style.display = "block", T.appendChild(i);
  const y = G(P);
  i.width = y, i.height = y;
  const r = i.getContext("2d"), t = y / 100;
  function m(k, d) {
    r.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, r.fillRect(0, 0, y, y);
    const p = (2 + Math.sin(k * 0.07) * d) * t;
    r.beginPath(), r.arc(50 * t, 50 * t, p, 0, Math.PI * 2), r.fillStyle = `rgba(${g[0]},${g[1]},${g[2]},0.8)`, r.fill();
    for (const f of e) {
      const a = Math.sin(k * f.breatheSpeed + f.phase) * f.breatheAmp * d, c = 0.45 + Math.sin(k * f.breatheSpeed * 0.5 + f.phase + 1) * 0.25 * d;
      r.beginPath();
      for (let h = 0; h < f.wobbles.length; h++) {
        const A = h / f.wobbles.length * Math.PI * 2, D = Math.sin(k * f.wobbleSpeed + h * 0.6 + f.phase) * 2.5 * d, I = Math.min(f.baseRadius + a + f.wobbles[h] * f.baseRadius + D, 38), q = (50 + Math.cos(A) * I) * t, L = (50 + Math.sin(A) * I) * t;
        h === 0 ? r.moveTo(q, L) : r.lineTo(q, L);
      }
      r.closePath(), r.strokeStyle = `rgba(${f.shadeRgb[0]},${f.shadeRgb[1]},${f.shadeRgb[2]},${c})`, r.lineWidth = f.strokeWidth * t, r.lineJoin = "round", r.stroke();
    }
    r.globalCompositeOperation = "destination-in", r.beginPath(), r.arc(y / 2, y / 2, y / 2, 0, Math.PI * 2), r.fill(), r.globalCompositeOperation = "source-over";
  }
  let v = !1, b = 0, l = 0, S = null, C = 0, x = null;
  m(0, 0);
  function R() {
    x || (S = null, C = 0, x = K((k) => {
      const d = S !== null ? k - S : 16;
      S = k;
      const p = v ? 1 : 0;
      let f = !1;
      if (Math.abs(b - p) > 3e-3) {
        const a = p > b ? d / Nt : d / Ot;
        b = Math.max(0, Math.min(1, b + (p > b ? 1 : -1) * a)), f = !0;
      } else b !== p && (b = p, f = !0);
      if (b === 0 && !v) {
        f && m(l, 0), x && (x(), x = null);
        return;
      }
      C += d, C >= Mt && (C -= Mt, l++, f = !0), f && m(l, b);
    }));
  }
  return {
    canvas: i,
    setActive(k) {
      v = k, (v || b > 0) && R();
    },
    destroy() {
      x && (x(), x = null), i.parentNode && i.parentNode.removeChild(i);
    }
  };
}
const Lt = 800, Et = 1500, mt = 45;
function Ft(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, { hue: g, sat: w } = $, s = $.lightRgb, o = $.primaryRgb, e = $.darkRgb, i = 9, y = 9, r = 5, t = W(n), m = Array.from({ length: y }, () => Array(i).fill(null));
  for (let a = 0; a < y; a++)
    for (let c = 0; c < r; c++)
      if (t() > 0.38) {
        const h = Math.abs(c - 4) + Math.abs(a - 4);
        m[a][c] = h < 3 ? s : h < 5 ? o : e, m[a][i - 1 - c] = m[a][c];
      }
  const v = document.createElement("canvas");
  v.style.width = P + "px", v.style.height = P + "px", v.style.borderRadius = "50%", v.style.flexShrink = "0", v.style.display = "block", T.appendChild(v);
  const b = G(P);
  v.width = b, v.height = b;
  const l = v.getContext("2d");
  function S(a, c) {
    const h = b / 9, A = (b - i * h) / 2, D = (b - y * h) / 2;
    l.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, l.fillRect(0, 0, b, b);
    for (let I = 0; I < y; I++) {
      const q = (Math.sin(a * 0.18 + I * 1.8) * h * 0.7 + Math.sin(a * 0.07 + I) * h * 0.3) * c;
      for (let L = 0; L < i; L++) {
        const N = m[I][L];
        if (!N) continue;
        const F = 1 - (1 - (0.75 + Math.sin(a * 0.14 + L * 0.9 + I * 0.6) * 0.25)) * c, Y = h * F, O = A + L * h + (h - Y) / 2 + q, E = D + I * h + (h - Y) / 2;
        l.fillStyle = `rgb(${N[0]},${N[1]},${N[2]})`;
        const _ = 1, B = Y - 0.5, j = Y - 0.5;
        l.beginPath(), l.moveTo(O + _, E), l.lineTo(O + B - _, E), l.quadraticCurveTo(O + B, E, O + B, E + _), l.lineTo(O + B, E + j - _), l.quadraticCurveTo(O + B, E + j, O + B - _, E + j), l.lineTo(O + _, E + j), l.quadraticCurveTo(O, E + j, O, E + j - _), l.lineTo(O, E + _), l.quadraticCurveTo(O, E, O + _, E), l.fill();
      }
    }
    l.globalCompositeOperation = "destination-in", l.beginPath(), l.arc(b / 2, b / 2, b / 2, 0, Math.PI * 2), l.fill(), l.globalCompositeOperation = "source-over";
  }
  let C = !1, x = 0, R = 0, k = null, d = 0, p = null;
  S(0, 0);
  function f() {
    p || (k = null, d = 0, p = K((a) => {
      const c = k !== null ? a - k : 16;
      k = a;
      const h = C ? 1 : 0;
      let A = !1;
      if (Math.abs(x - h) > 3e-3) {
        const D = h > x ? c / Lt : c / Et;
        x = Math.max(0, Math.min(1, x + (h > x ? 1 : -1) * D)), A = !0;
      } else x !== h && (x = h, A = !0);
      if (x === 0 && !C) {
        A && S(R, 0), p && (p(), p = null);
        return;
      }
      d += c, d >= mt && (d -= mt, R++, A = !0), A && S(R, x);
    }));
  }
  return {
    canvas: v,
    setActive(a) {
      C = a, (C || x > 0) && f();
    },
    destroy() {
      p && (p(), p = null), v.parentNode && v.parentNode.removeChild(v);
    }
  };
}
const Xt = 800, Yt = 1500, xt = 35;
function Wt(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, g = $.lightRgb, w = $.primaryRgb, s = $.darkRgb, o = 7, e = 4, i = W(n), y = Array.from({ length: o }, () => Array(o).fill(null));
  for (let d = 0; d < o; d++)
    for (let p = 0; p < e; p++) {
      const f = Math.abs(p - 3) + Math.abs(d - 3);
      f > 4 || i() > 0.35 && (y[d][p] = f < 2 ? g : f < 4 ? w : s, y[d][o - 1 - p] = y[d][p]);
    }
  const r = document.createElement("canvas");
  r.style.width = P + "px", r.style.height = P + "px", r.style.borderRadius = "50%", r.style.flexShrink = "0", r.style.display = "block", T.appendChild(r);
  const t = G(P);
  r.width = t, r.height = t;
  const m = r.getContext("2d");
  function v(d, p) {
    const f = t / o;
    m.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, m.fillRect(0, 0, t, t), m.save(), m.translate(t / 2, t / 2), m.rotate(Math.PI / 4), m.translate(-t / 2, -t / 2);
    for (let a = 0; a < o; a++) {
      const c = Math.sin(d * 0.16 + a * 1.5) * f * 0.55 * p;
      for (let h = 0; h < o; h++) {
        const A = y[a][h];
        if (!A) continue;
        const D = 1 - (1 - (0.7 + Math.sin(d * 0.12 + h + a * 0.8) * 0.3)) * p, I = f * D * 0.42, q = h * f + f / 2 + c, L = a * f + f / 2;
        m.beginPath(), m.arc(q, L, I, 0, Math.PI * 2), m.fillStyle = `rgb(${A[0]},${A[1]},${A[2]})`, m.fill();
      }
    }
    m.restore(), m.globalCompositeOperation = "destination-in", m.beginPath(), m.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2), m.fill(), m.globalCompositeOperation = "source-over";
  }
  let b = !1, l = 0, S = 0, C = null, x = 0, R = null;
  v(0, 0);
  function k() {
    R || (C = null, x = 0, R = K((d) => {
      const p = C !== null ? d - C : 16;
      C = d;
      const f = b ? 1 : 0;
      let a = !1;
      if (Math.abs(l - f) > 3e-3) {
        const c = f > l ? p / Xt : p / Yt;
        l = Math.max(0, Math.min(1, l + (f > l ? 1 : -1) * c)), a = !0;
      } else l !== f && (l = f, a = !0);
      if (l === 0 && !b) {
        a && v(S, 0), R && (R(), R = null);
        return;
      }
      x += p, x >= xt && (x -= xt, S++, a = !0), a && v(S, l);
    }));
  }
  return {
    canvas: r,
    setActive(d) {
      b = d, (b || l > 0) && k();
    },
    destroy() {
      R && (R(), R = null), r.parentNode && r.parentNode.removeChild(r);
    }
  };
}
function Vt(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = W(n), w = 3 + Math.floor(g() * 2), s = Array.from({ length: w }, () => ({
    baseX: 0.15 + g() * 0.7,
    baseY: 0.15 + g() * 0.7,
    freq: 10 + g() * 18,
    orbitR: 0.08 + g() * 0.18,
    orbitSpeed: 0.025 + g() * 0.03,
    phase: g() * Math.PI * 2
  }));
  function o(e, i, y) {
    const r = e.getContext("2d"), t = e.width, m = 3, v = r.createImageData(t, t), b = v.data;
    for (let l = 0; l < t; l += m)
      for (let S = 0; S < t; S += m) {
        const C = S / t, x = l / t, R = C - 0.5, k = x - 0.5, d = Math.sqrt(R * R + k * k);
        if (d > 0.5) continue;
        let p = 0;
        for (const c of s) {
          const h = c.baseX + Math.cos(i * c.orbitSpeed + c.phase) * c.orbitR * y, A = c.baseY + Math.sin(i * c.orbitSpeed * 1.3 + c.phase) * c.orbitR * y;
          p += Math.sin(Math.sqrt((C - h) ** 2 + (x - A) ** 2) * c.freq * Math.PI * 2);
        }
        p /= s.length;
        const f = X($ / 360, M / 100, U(0.55 + (p + 1) / 2 * 0.35, u)), a = Math.min((0.5 - d) * 10, 1);
        for (let c = 0; c < m && l + c < t; c++)
          for (let h = 0; h < m && S + h < t; h++) {
            const A = ((l + c) * t + (S + h)) * 4;
            b[A] = f[0], b[A + 1] = f[1], b[A + 2] = f[2], b[A + 3] = a * 255 | 0;
          }
      }
    r.putImageData(v, 0, 0);
  }
  return Z(T, n, P, o, { fps: 30 });
}
function st(T) {
  const n = W(T);
  return {
    scaleX: 2 + n() * 4,
    scaleY: 2 + n() * 4,
    offsetX: n() * 100,
    offsetY: n() * 100,
    twist: 0.6 + n() * 1.4,
    attractors: Array.from({ length: 2 + Math.floor(n() * 2) }, () => ({
      orbitCx: 0.3 + n() * 0.4,
      orbitCy: 0.3 + n() * 0.4,
      orbitR: 0.1 + n() * 0.2,
      orbitSpeed: 4e-3 + n() * 6e-3,
      strength: 0.3 + n() * 0.5,
      phase: n() * Math.PI * 2
    }))
  };
}
function rt(T, n, P, u, $) {
  let M = Math.sin(T * u.scaleX + u.offsetX) * Math.cos(n * u.scaleY + u.offsetY) * Math.PI * 2 * u.twist;
  for (const g of u.attractors) {
    const w = g.orbitCx + Math.cos(P * g.orbitSpeed + g.phase) * g.orbitR * $, s = g.orbitCy + Math.sin(P * g.orbitSpeed * 1.3 + g.phase) * g.orbitR * $, o = T - w, e = n - s, i = Math.sqrt(o * o + e * e) + 0.01;
    M += Math.atan2(e, o) * g.strength / (i * 8 + 0.5) * $;
  }
  return M;
}
const Ut = 800, Bt = 1500, jt = 30;
function Kt(T, n, P, u) {
  const $ = V(n, u), M = st(n), { bgRgb: g, primaryRgb: w, darkRgb: s } = $, o = document.createElement("canvas");
  o.style.width = P + "px", o.style.height = P + "px", o.style.borderRadius = "50%", o.style.flexShrink = "0", o.style.display = "block", T.appendChild(o);
  const e = G(P);
  o.width = e, o.height = e;
  const i = o.getContext("2d"), y = W(n + 999), r = Array.from({ length: 90 }, () => ({
    x: y() * e,
    y: y() * e,
    life: Math.floor(y() * 50),
    maxLife: 25 + Math.floor(y() * 40),
    shade: y() > 0.5 ? w : s
  }));
  let t = 0, m = 0;
  const v = `rgb(${g[0]},${g[1]},${g[2]})`;
  function b() {
    i.fillStyle = v, i.fillRect(0, 0, e, e);
    const f = W(n + 500);
    for (let a = 0; a < 60; a++) {
      let c = f() * e, h = f() * e;
      const A = f() > 0.5 ? w : s;
      i.beginPath(), i.moveTo(c, h);
      for (let D = 0; D < 30; D++) {
        const I = rt(c / e, h / e, 0, M, 0);
        c += Math.cos(I) * 2, h += Math.sin(I) * 2, i.lineTo(c, h);
      }
      i.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},.3)`, i.lineWidth = 1.5, i.stroke();
    }
    i.globalCompositeOperation = "destination-in", i.beginPath(), i.arc(e / 2, e / 2, e / 2, 0, Math.PI * 2), i.fill(), i.globalCompositeOperation = "source-over";
  }
  b();
  const l = document.createElement("canvas");
  l.width = e, l.height = e;
  const S = l.getContext("2d");
  S.fillStyle = v, S.fillRect(0, 0, e, e);
  function C() {
    const f = S.getImageData(0, 0, e, e), a = f.data, c = g[0], h = g[1], A = g[2];
    for (let D = 0; D < a.length; D += 4)
      Math.abs(a[D] - c) <= 3 && Math.abs(a[D + 1] - h) <= 3 && Math.abs(a[D + 2] - A) <= 3 && (a[D] = c, a[D + 1] = h, a[D + 2] = A, a[D + 3] = 255);
    S.putImageData(f, 0, 0);
  }
  let x = !1, R = 0, k = null, d = null;
  function p() {
    d || (k = null, d = K((f) => {
      const a = k !== null ? f - k : 16;
      k = f;
      const c = a > 200 ? 1e3 / 60 : Math.min(a, 50), h = x ? 1 : 0;
      if (Math.abs(R - h) > 3e-3) {
        const q = h > R ? c / Ut : c / Bt;
        R = Math.max(0, Math.min(1, R + (h > R ? 1 : -1) * q));
      } else
        R = h;
      if (R === 0 && !x) {
        b(), d && (d(), d = null);
        return;
      }
      const A = c / (1e3 / 60);
      t += A, m++;
      const D = R, I = (0.08 + 0.08 * (1 - D)) * A;
      S.fillStyle = `rgba(${g[0]},${g[1]},${g[2]},${I})`, S.fillRect(0, 0, e, e), m % jt === 0 && C();
      for (const q of r) {
        const L = rt(q.x / e, q.y / e, t, M, D);
        q.x += Math.cos(L) * 3 * Math.max(D, 0.1) * A, q.y += Math.sin(L) * 3 * Math.max(D, 0.1) * A, q.life++;
        const N = q.x - e / 2, F = q.y - e / 2, Y = Math.sqrt(N * N + F * F);
        if (q.life > q.maxLife || Y > e / 2 - 2) {
          const O = W(n + q.life + (q.x | 0) + t);
          q.x = O() * e, q.y = O() * e, q.life = 0;
        }
        if (Y < e / 2 - 2) {
          const O = Math.min(q.life / 5, 1) * Math.min((q.maxLife - q.life) / 5, 1) * Math.max(D, 0.05);
          S.beginPath(), S.arc(q.x, q.y, 1.5, 0, Math.PI * 2), S.fillStyle = `rgba(${q.shade[0]},${q.shade[1]},${q.shade[2]},${O * 0.7})`, S.fill();
        }
      }
      i.clearRect(0, 0, e, e), i.drawImage(l, 0, 0), i.globalCompositeOperation = "destination-in", i.beginPath(), i.arc(e / 2, e / 2, e / 2, 0, Math.PI * 2), i.fill(), i.globalCompositeOperation = "source-over";
    }));
  }
  return {
    canvas: o,
    setActive(f) {
      x = f, (x || R > 0) && p();
    },
    destroy() {
      d && (d(), d = null), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
const Gt = 800, Ht = 1500, Qt = 30;
function Zt(T, n, P, u) {
  const $ = V(n, u), M = [
    st(n),
    st(n + 4219),
    st(n + 8831)
  ], { bgRgb: g } = $, w = [$.darkerRgb, $.darkRgb, $.primaryRgb], s = document.createElement("canvas");
  s.style.width = P + "px", s.style.height = P + "px", s.style.borderRadius = "50%", s.style.flexShrink = "0", s.style.display = "block", T.appendChild(s);
  const o = G(P);
  s.width = o, s.height = o;
  const e = s.getContext("2d"), i = [1, 1.5, 2.2], y = [0.4, 0.6, 0.85], r = [50, 40, 30], t = M.map((a, c) => {
    const h = W(n + 1e3 + c * 3331);
    return Array.from({ length: r[c] }, () => ({
      x: h() * o,
      y: h() * o,
      life: Math.floor(h() * 40),
      maxLife: 20 + Math.floor(h() * 35)
    }));
  });
  let m = 0, v = 0;
  const b = `rgb(${g[0]},${g[1]},${g[2]})`;
  function l() {
    e.fillStyle = b, e.fillRect(0, 0, o, o), M.forEach((a, c) => {
      const h = W(n + 500 + c * 777), A = w[c];
      for (let D = 0; D < 30; D++) {
        let I = h() * o, q = h() * o;
        e.beginPath(), e.moveTo(I, q);
        for (let L = 0; L < 25; L++) {
          const N = rt(I / o, q / o, 0, a, 0);
          I += Math.cos(N) * 2, q += Math.sin(N) * 2, e.lineTo(I, q);
        }
        e.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},${y[c] * 0.35})`, e.lineWidth = i[c], e.stroke();
      }
    }), e.globalCompositeOperation = "destination-in", e.beginPath(), e.arc(o / 2, o / 2, o / 2, 0, Math.PI * 2), e.fill(), e.globalCompositeOperation = "source-over";
  }
  l();
  const S = document.createElement("canvas");
  S.width = o, S.height = o;
  const C = S.getContext("2d");
  C.fillStyle = b, C.fillRect(0, 0, o, o);
  function x() {
    const a = C.getImageData(0, 0, o, o), c = a.data, h = g[0], A = g[1], D = g[2];
    for (let I = 0; I < c.length; I += 4)
      Math.abs(c[I] - h) <= 3 && Math.abs(c[I + 1] - A) <= 3 && Math.abs(c[I + 2] - D) <= 3 && (c[I] = h, c[I + 1] = A, c[I + 2] = D, c[I + 3] = 255);
    C.putImageData(a, 0, 0);
  }
  let R = !1, k = 0, d = null, p = null;
  function f() {
    p || (d = null, p = K((a) => {
      const c = d !== null ? a - d : 16;
      d = a;
      const h = c > 200 ? 1e3 / 60 : Math.min(c, 50), A = R ? 1 : 0;
      if (Math.abs(k - A) > 3e-3) {
        const L = A > k ? h / Gt : h / Ht;
        k = Math.max(0, Math.min(1, k + (A > k ? 1 : -1) * L));
      } else
        k = A;
      if (k === 0 && !R) {
        l(), p && (p(), p = null);
        return;
      }
      const D = h / (1e3 / 60);
      m += D, v++;
      const I = k, q = (0.08 + 0.08 * (1 - I)) * D;
      C.fillStyle = `rgba(${g[0]},${g[1]},${g[2]},${q})`, C.fillRect(0, 0, o, o), v % Qt === 0 && x(), t.forEach((L, N) => {
        const F = M[N], Y = w[N], O = i[N], E = y[N];
        for (const _ of L) {
          const B = rt(_.x / o, _.y / o, m, F, I);
          _.x += Math.cos(B) * (1.8 + N * 0.6) * Math.max(I, 0.1) * D, _.y += Math.sin(B) * (1.8 + N * 0.6) * Math.max(I, 0.1) * D, _.life++;
          const j = _.x - o / 2, nt = _.y - o / 2, tt = Math.sqrt(j * j + nt * nt);
          if (_.life > _.maxLife || tt > o / 2 - 2) {
            const J = W(n + _.life + (_.x | 0) + m + N * 100);
            _.x = J() * o, _.y = J() * o, _.life = 0;
          }
          if (tt < o / 2 - 2) {
            const J = Math.min(_.life / 4, 1) * Math.min((_.maxLife - _.life) / 4, 1) * E * Math.max(I, 0.05);
            C.beginPath(), C.arc(_.x, _.y, O, 0, Math.PI * 2), C.fillStyle = `rgba(${Y[0]},${Y[1]},${Y[2]},${J})`, C.fill();
          }
        }
      }), e.clearRect(0, 0, o, o), e.drawImage(S, 0, 0), e.globalCompositeOperation = "destination-in", e.beginPath(), e.arc(o / 2, o / 2, o / 2, 0, Math.PI * 2), e.fill(), e.globalCompositeOperation = "source-over";
    }));
  }
  return {
    canvas: s,
    setActive(a) {
      R = a, (R || k > 0) && f();
    },
    destroy() {
      p && (p(), p = null), s.parentNode && s.parentNode.removeChild(s);
    }
  };
}
function at(T, n, P, u, $, M = 3, g) {
  let w = V(n, g), s = o(n, u);
  function o(y, r) {
    const t = W(y);
    return Array.from({ length: r }, () => ({
      baseX: t(),
      baseY: t(),
      driftRx: 0.03 + t() * 0.06,
      driftRy: 0.03 + t() * 0.05,
      speed: 0.02 + t() * 0.025,
      phase: t() * Math.PI * 2,
      shade: Math.floor(t() * 5)
    }));
  }
  function e(y, r, t) {
    const m = y.getContext("2d"), v = y.width, b = v <= 48 ? Math.max(M, 4) : M, l = m.createImageData(v, v), S = l.data, C = s.map((R) => ({
      x: R.baseX + Math.sin(r * R.speed + R.phase) * R.driftRx * t,
      y: R.baseY + Math.cos(r * R.speed * 0.8 + R.phase * 1.3) * R.driftRy * t,
      shade: R.shade
    })), x = C.length;
    for (let R = 0; R < v; R += b) {
      const k = R / v, d = k - 0.5, p = d * d;
      for (let f = 0; f < v; f += b) {
        const a = f / v, c = a - 0.5, h = c * c + p;
        if (h > 0.25) continue;
        let A = 1 / 0, D = 0, I = 1 / 0;
        for (let O = 0; O < x; O++) {
          const E = a - C[O].x, _ = k - C[O].y, B = E * E + _ * _;
          B < A ? (I = A, A = B, D = O) : B < I && (I = B);
        }
        const q = Math.sqrt(A), L = Math.sqrt(I), N = Math.min((0.5 - Math.sqrt(h)) * 10, 1), F = $(q, L, D, C, w), Y = N * 255 | 0;
        for (let O = 0; O < b && R + O < v; O++)
          for (let E = 0; E < b && f + E < v; E++) {
            const _ = ((R + O) * v + (f + E)) * 4;
            S[_] = F[0], S[_ + 1] = F[1], S[_ + 2] = F[2], S[_ + 3] = Y;
          }
      }
    }
    m.putImageData(l, 0, 0);
  }
  const i = Z(T, n, P, e, { fps: 30 });
  return {
    canvas: i.canvas,
    setActive(y) {
      i.setActive(y);
    },
    setSeed(y) {
      w = V(y), s = o(y, u), i.reinit();
    },
    destroy() {
      i.destroy();
    }
  };
}
function Jt(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = [
    X($ / 360, M / 100, U(0.58, u)),
    X($ / 360, M / 100, U(0.65, u)),
    X($ / 360, M / 100, U(0.72, u)),
    X($ / 360, M / 100, U(0.8, u)),
    X($ / 360, M / 100, U(0.87, u))
  ];
  function w(s, o, e, i) {
    const y = Math.min((o - s) * 12, 1), r = g[i[e].shade], t = 0.6 + y * 0.4;
    return [r[0] * t | 0, r[1] * t | 0, r[2] * t | 0];
  }
  return at(T, n, P, 10, w, 3, u);
}
function zt(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u);
  function g(w, s) {
    const o = Math.max(0, 1 - (s - w) * 35);
    return X($ / 360, M / 100, U(0.82 - o * 0.3, u));
  }
  return at(T, n, P, 12, g, 3, u);
}
const te = [0.62, 0.7, 0.8, 0.66, 0.75];
function ee(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u);
  function g(w, s, o, e) {
    const i = Math.min(w * 8, 1);
    return X($ / 360, M / 100, U(te[e[o].shade] * (1 - i * 0.3), u));
  }
  return at(T, n, P, 9, g, 3, u);
}
function ne(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = W(n), w = Array.from({ length: 5 }, () => ($ + Math.floor(g() * 40) - 20 + 360) % 360);
  function s(o, e, i, y) {
    return e - o < 0.02 ? X($ / 360, M * 0.3 / 100, U(0.4, u)) : X(
      w[y[i].shade] / 360,
      M / 100,
      U(0.62 + (1 - Math.min(o * 6, 1)) * 0.25, u)
    );
  }
  return at(T, n, P, 10, s, 2, u);
}
function oe(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u);
  function g(w, s, o, e) {
    const i = Math.sin(w * 40 * Math.PI * 2), y = Math.max(0, i) ** 3;
    return X($ / 360, M / 100, U(0.55 + y * 0.3 + e[o].shade * 0.03, u));
  }
  return at(T, n, P, 8, g, 3, u);
}
function ae(T, n, P, u) {
  const $ = V(n, u), { hue: M, sat: g, bgRgb: w } = $, s = W(n), o = {
    arms: 2 + Math.floor(s() * 4),
    tightness: 0.08 + s() * 0.12,
    dotSize: 1.2 + s() * 1.5,
    rotSpeed: 0.016 + s() * 0.02,
    armCurve: 0.5 + s() * 1.5,
    dir: s() > 0.5 ? 1 : -1
  };
  function e(i, y, r) {
    const t = i.getContext("2d"), m = i.width;
    t.fillStyle = `rgb(${w[0]},${w[1]},${w[2]})`, t.fillRect(0, 0, m, m);
    const v = m / 2, b = m / 2, l = m / 2 - 2, S = y * o.rotSpeed * o.dir * r;
    for (let x = 0; x < o.arms; x++) {
      const R = x / o.arms * Math.PI * 2;
      for (let k = 0; k < 120; k++) {
        const d = k / 120, p = d * l, f = R + d * o.armCurve * Math.PI * 2 * o.tightness * 10 + S, a = v + Math.cos(f) * p, c = b + Math.sin(f) * p;
        if (Math.sqrt((a - v) ** 2 + (c - b) ** 2) > l) continue;
        const h = X(M / 360, g / 100, U(0.55 + d * 0.3, u));
        t.beginPath(), t.arc(a, c, o.dotSize * (1 - d * 0.5), 0, Math.PI * 2), t.fillStyle = `rgba(${h[0]},${h[1]},${h[2]},${(1 - d) * 0.9})`, t.fill();
      }
    }
    const C = X(M / 360, g / 100, U(0.92, u));
    t.beginPath(), t.arc(v, b, 3 + Math.sin(y * 0.05) * r, 0, Math.PI * 2), t.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},.9)`, t.fill(), t.globalCompositeOperation = "destination-in", t.beginPath(), t.arc(v, b, l + 2, 0, Math.PI * 2), t.fill(), t.globalCompositeOperation = "source-over";
  }
  return Z(T, n, P, e, { fps: 45 });
}
function se(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = W(n), w = {
    scaleA: 3 + g() * 5,
    scaleB: 4 + g() * 6,
    scaleC: 2 + g() * 4,
    scaleD: 3 + g() * 5,
    speed: 0.04 + g() * 0.05,
    offsetA: g() * 10,
    offsetB: g() * 10
  };
  function s(o, e, i) {
    const y = o.getContext("2d"), r = o.width, t = 2, m = e * i, v = y.createImageData(r, r), b = v.data;
    for (let l = 0; l < r; l += t)
      for (let S = 0; S < r; S += t) {
        const C = S / r, x = l / r, R = C - 0.5, k = x - 0.5, d = Math.sqrt(R * R + k * k);
        if (d > 0.5) continue;
        const p = (Math.sin(C * w.scaleA + w.offsetA + m * w.speed) + Math.sin(x * w.scaleB + w.offsetB + m * w.speed * 0.7) + Math.sin(C * w.scaleC + x * w.scaleD + m * w.speed * 1.3) + Math.sin(Math.sqrt((R * 8) ** 2 + (k * 8) ** 2) + m * w.speed * 0.5)) / 4, f = X($ / 360, M / 100, U(0.55 + (p + 1) / 2 * 0.35, u)), a = Math.min((0.5 - d) * 10, 1);
        for (let c = 0; c < t && l + c < r; c++)
          for (let h = 0; h < t && S + h < r; h++) {
            const A = ((l + c) * r + (S + h)) * 4;
            b[A] = f[0], b[A + 1] = f[1], b[A + 2] = f[2], b[A + 3] = a * 255 | 0;
          }
      }
    y.putImageData(v, 0, 0);
  }
  return Z(T, n, P, s, { fps: 30 });
}
const Q = 11, re = 800, le = 1500, $t = 30;
function ie(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, g = $.primaryRgb, w = $.darkRgb, s = $.darkerRgb, o = W(n), e = Array.from({ length: Q }, () => Array(Q).fill(!0)), i = Array.from({ length: Q }, () => Array(Q).fill(!1)), y = [[0, -2], [0, 2], [-2, 0], [2, 0]], r = [[1, 1]];
  for (e[1][1] = !1, i[1][1] = !0; r.length > 0; ) {
    const [p, f] = r[r.length - 1], a = y.map((h) => ({ d: h, r: o() })).sort((h, A) => h.r - A.r).map((h) => h.d);
    let c = !1;
    for (const [h, A] of a) {
      const D = p + h, I = f + A;
      if (D > 0 && D < Q - 1 && I > 0 && I < Q - 1 && !i[I][D]) {
        e[f + A / 2][p + h / 2] = !1, e[I][D] = !1, i[I][D] = !0, r.push([D, I]), c = !0;
        break;
      }
    }
    c || r.pop();
  }
  const t = document.createElement("canvas");
  t.style.width = P + "px", t.style.height = P + "px", t.style.borderRadius = "50%", t.style.flexShrink = "0", t.style.display = "block", T.appendChild(t);
  const m = G(P);
  t.width = m, t.height = m;
  const v = t.getContext("2d");
  function b(p, f) {
    const a = m / Q;
    v.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, v.fillRect(0, 0, m, m);
    for (let c = 0; c < Q; c++)
      for (let h = 0; h < Q; h++) {
        if (!e[c][h]) continue;
        const A = Math.sin(p * 0.14 - (h + c) * 0.4) * f, D = Math.max(0.3, 0.5 + A * 0.5), I = D > 0.6 ? g : D > 0.4 ? w : s;
        v.fillStyle = `rgba(${I[0]},${I[1]},${I[2]},${D})`, v.fillRect(h * a, c * a, a, a);
      }
    v.globalCompositeOperation = "destination-in", v.beginPath(), v.arc(m / 2, m / 2, m / 2, 0, Math.PI * 2), v.fill(), v.globalCompositeOperation = "source-over";
  }
  let l = !1, S = 0, C = 0, x = null, R = 0, k = null;
  b(0, 0);
  function d() {
    k || (x = null, R = 0, k = K((p) => {
      const f = x !== null ? p - x : 16;
      x = p;
      const a = l ? 1 : 0;
      let c = !1;
      if (Math.abs(S - a) > 3e-3) {
        const h = a > S ? f / re : f / le;
        S = Math.max(0, Math.min(1, S + (a > S ? 1 : -1) * h)), c = !0;
      } else S !== a && (S = a, c = !0);
      if (S === 0 && !l) {
        c && b(C, 0), k && (k(), k = null);
        return;
      }
      R += f, R >= $t && (R -= $t, C++, c = !0), c && b(C, S);
    }));
  }
  return {
    canvas: t,
    setActive(p) {
      l = p, (l || S > 0) && d();
    },
    destroy() {
      k && (k(), k = null), t.parentNode && t.parentNode.removeChild(t);
    }
  };
}
const ce = 800, he = 1500, Rt = 25;
function fe(T, n, P, u) {
  const $ = V(n, u), M = $.bgRgb, g = $.lightRgb, w = $.darkerRgb, s = [$.lightRgb, $.primaryRgb, $.darkRgb], o = W(n), e = 3 + Math.floor(o() * 3), i = Array.from({ length: e }, (d, p) => ({
    rx: 12 + p * 8 + o() * 4,
    ry: 6 + o() * (8 + p * 3),
    tilt: o() * 180,
    dots: 1 + Math.floor(o() * 3),
    speed: (0.04 + o() * 0.05) * (o() > 0.5 ? 1 : -1),
    dotR: 1.5 + o() * 1.5,
    shadeRgb: s[p % 3],
    phase: o() * Math.PI * 2
  })), y = document.createElement("canvas");
  y.style.width = P + "px", y.style.height = P + "px", y.style.borderRadius = "50%", y.style.flexShrink = "0", y.style.display = "block", T.appendChild(y);
  const r = G(P);
  y.width = r, y.height = r;
  const t = y.getContext("2d"), m = r / 100;
  function v(d, p) {
    t.fillStyle = `rgb(${M[0]},${M[1]},${M[2]})`, t.fillRect(0, 0, r, r);
    const f = (3 + Math.sin(d * 0.06) * 0.8 * p) * m;
    t.beginPath(), t.arc(50 * m, 50 * m, f, 0, Math.PI * 2), t.fillStyle = `rgba(${g[0]},${g[1]},${g[2]},0.85)`, t.fill();
    for (let a = 0; a < i.length; a++) {
      const c = i[a], h = (c.tilt + d * 0.3 * (a % 2 === 0 ? 1 : -1) * p) * Math.PI / 180;
      t.save(), t.translate(50 * m, 50 * m), t.rotate(h), t.beginPath(), t.ellipse(0, 0, c.rx * m, c.ry * m, 0, 0, Math.PI * 2), t.strokeStyle = `rgba(${w[0]},${w[1]},${w[2]},0.3)`, t.lineWidth = 0.6 * m, t.stroke();
      for (let A = 0; A < c.dots; A++) {
        const D = c.phase + A / c.dots * Math.PI * 2 + d * c.speed * p, I = Math.cos(D) * c.rx * m, q = Math.sin(D) * c.ry * m;
        t.beginPath(), t.arc(I, q, c.dotR * m, 0, Math.PI * 2), t.fillStyle = `rgba(${c.shadeRgb[0]},${c.shadeRgb[1]},${c.shadeRgb[2]},0.9)`, t.fill();
      }
      t.restore();
    }
    t.globalCompositeOperation = "destination-in", t.beginPath(), t.arc(r / 2, r / 2, r / 2, 0, Math.PI * 2), t.fill(), t.globalCompositeOperation = "source-over";
  }
  let b = !1, l = 0, S = 0, C = null, x = 0, R = null;
  v(0, 0);
  function k() {
    R || (C = null, x = 0, R = K((d) => {
      const p = C !== null ? d - C : 16;
      C = d;
      const f = b ? 1 : 0;
      let a = !1;
      if (Math.abs(l - f) > 3e-3) {
        const c = f > l ? p / ce : p / he;
        l = Math.max(0, Math.min(1, l + (f > l ? 1 : -1) * c)), a = !0;
      } else l !== f && (l = f, a = !0);
      if (l === 0 && !b) {
        a && v(S, 0), R && (R(), R = null);
        return;
      }
      x += p, x >= Rt && (x -= Rt, S++, a = !0), a && v(S, l);
    }));
  }
  return {
    canvas: y,
    setActive(d) {
      b = d, (b || l > 0) && k();
    },
    destroy() {
      R && (R(), R = null), y.parentNode && y.parentNode.removeChild(y);
    }
  };
}
function ge(T, n, P, u) {
  const $ = V(n, u), { hue: M, sat: g, bgRgb: w } = $, s = W(n), o = [[1, 2], [2, 3], [3, 4], [1, 3], [3, 5], [2, 5], [1, 4], [4, 5]], e = o[Math.floor(s() * o.length)], i = s() > 0.5, y = {
    freqX: i ? e[1] : e[0],
    freqY: i ? e[0] : e[1],
    phaseX: s() * Math.PI * 2,
    phaseY: s() * Math.PI * 2,
    decay: 6e-3 + s() * 6e-3,
    drift: 7e-3 + s() * 8e-3
  };
  function r(t, m, v) {
    const b = t.getContext("2d"), l = t.width;
    b.fillStyle = `rgb(${w[0]},${w[1]},${w[2]})`, b.fillRect(0, 0, l, l);
    const S = l / 2, C = l / 2, x = l / 2 - 4, R = m * v * y.drift, k = X(M / 360, g / 100, U(0.65, u)), d = X(M / 360, g / 100, U(0.52, u)), p = 400;
    b.beginPath();
    for (let f = 0; f <= p; f++) {
      const a = f / p, c = a * Math.PI * 2 * 3, h = Math.exp(-a * y.decay * 200), A = S + Math.sin(c * y.freqX + y.phaseX + R) * x * 0.8 * h, D = C + Math.sin(c * y.freqY + y.phaseY + R * 1.3) * x * 0.8 * h;
      f === 0 ? b.moveTo(A, D) : b.lineTo(A, D);
    }
    b.strokeStyle = `rgba(${k[0]},${k[1]},${k[2]},0.7)`, b.lineWidth = 1.5, b.stroke(), b.beginPath();
    for (let f = 0; f <= p; f++) {
      const a = f / p, c = a * Math.PI * 2 * 3, h = Math.exp(-a * y.decay * 200), A = S + Math.sin(c * y.freqX + y.phaseX + R + 0.4) * x * 0.75 * h, D = C + Math.sin(c * y.freqY + y.phaseY + R * 1.3 + 0.4) * x * 0.75 * h;
      f === 0 ? b.moveTo(A, D) : b.lineTo(A, D);
    }
    b.strokeStyle = `rgba(${d[0]},${d[1]},${d[2]},0.35)`, b.lineWidth = 1, b.stroke(), b.globalCompositeOperation = "destination-in", b.beginPath(), b.arc(S, C, x + 4, 0, Math.PI * 2), b.fill(), b.globalCompositeOperation = "source-over";
  }
  return Z(T, n, P, r, { fps: 45 });
}
const de = 800, ue = 1500, be = 0.01, pe = 0.12 * 0.12, ye = 0.04 * 0.04;
function Me(T, n, P, u) {
  const $ = V(n, u), { bgRgb: M, primaryRgb: g, lightRgb: w, darkRgb: s } = $, o = document.createElement("canvas");
  o.style.width = P + "px", o.style.height = P + "px", o.style.borderRadius = "50%", o.style.flexShrink = "0", o.style.display = "block", T.appendChild(o);
  const e = G(P);
  o.width = e, o.height = e;
  const i = o.getContext("2d"), y = W(n), r = 35 + Math.floor(y() * 20), t = Array.from({ length: r }, () => {
    const d = y() * Math.PI * 2;
    return {
      x: 0.2 + y() * 0.6,
      y: 0.2 + y() * 0.6,
      vx: Math.cos(d) * 3e-3,
      vy: Math.sin(d) * 3e-3,
      shade: y() < 0.33 ? s : y() < 0.66 ? g : w,
      size: 1 + y() * 1.5
    };
  }), m = `rgb(${M[0]},${M[1]},${M[2]})`;
  function v() {
    i.fillStyle = m, i.fillRect(0, 0, e, e);
    for (const d of t) {
      const p = d.x - 0.5, f = d.y - 0.5;
      p * p + f * f > 0.2304 || (i.beginPath(), i.arc(d.x * e, d.y * e, d.size, 0, Math.PI * 2), i.fillStyle = `rgba(${d.shade[0]},${d.shade[1]},${d.shade[2]},.7)`, i.fill());
    }
    i.globalCompositeOperation = "destination-in", i.beginPath(), i.arc(e / 2, e / 2, e / 2, 0, Math.PI * 2), i.fill(), i.globalCompositeOperation = "source-over";
  }
  v();
  const b = document.createElement("canvas");
  b.width = e, b.height = e;
  const l = b.getContext("2d");
  l.fillStyle = m, l.fillRect(0, 0, e, e);
  let S = !1, C = 0, x = null, R = null;
  function k() {
    R || (x = null, R = K((d) => {
      const p = x !== null ? d - x : 16;
      x = d;
      const f = p > 200 ? 1e3 / 60 : Math.min(p, 50), a = S ? 1 : 0;
      if (Math.abs(C - a) > 3e-3) {
        const D = a > C ? f / de : f / ue;
        C = Math.max(0, Math.min(1, C + (a > C ? 1 : -1) * D));
      } else
        C = a;
      if (C === 0 && !S) {
        v(), R && (R(), R = null);
        return;
      }
      const c = C, h = f / (1e3 / 60), A = (0.08 + 0.15 * (1 - c)) * h;
      l.fillStyle = `rgba(${M[0]},${M[1]},${M[2]},${A})`, l.fillRect(0, 0, e, e);
      for (let D = 0; D < t.length; D++) {
        const I = t[D];
        let q = 0, L = 0, N = 0, F = 0, Y = 0, O = 0, E = 0;
        for (let H = 0; H < t.length; H++) {
          if (D === H) continue;
          const ct = t[H].x - I.x, ht = t[H].y - I.y, ft = ct * ct + ht * ht;
          if (ft < ye) {
            const dt = Math.sqrt(ft);
            q -= ct / dt, L -= ht / dt;
          }
          ft < pe && (N += t[H].vx, F += t[H].vy, Y += t[H].x, O += t[H].y, E++);
        }
        E > 0 && (N /= E, F /= E, Y = Y / E - I.x, O = O / E - I.y);
        const _ = 0.5 - I.x, B = 0.5 - I.y, j = Math.sqrt(_ * _ + B * B) + 0.01, nt = Math.max(0, j - 0.3) * 0.02;
        I.vx += (q * 0.05 + N * 0.03 + Y * 0.01 + _ / j * nt) * c, I.vy += (L * 0.05 + F * 0.03 + O * 0.01 + B / j * nt) * c;
        const tt = Math.sqrt(I.vx * I.vx + I.vy * I.vy), J = be * Math.max(c, 0.15);
        tt > J && (I.vx = I.vx / tt * J, I.vy = I.vy / tt * J), I.x += I.vx * h, I.y += I.vy * h;
        const lt = I.x - 0.5, it = I.y - 0.5;
        lt * lt + it * it > 0.2116 && (I.x = 0.5 - lt * 0.3, I.y = 0.5 - it * 0.3), l.beginPath(), l.arc(I.x * e, I.y * e, I.size, 0, Math.PI * 2), l.fillStyle = `rgba(${I.shade[0]},${I.shade[1]},${I.shade[2]},${0.5 + c * 0.4})`, l.fill();
      }
      i.clearRect(0, 0, e, e), i.drawImage(b, 0, 0), i.globalCompositeOperation = "destination-in", i.beginPath(), i.arc(e / 2, e / 2, e / 2, 0, Math.PI * 2), i.fill(), i.globalCompositeOperation = "source-over";
    }));
  }
  return {
    canvas: o,
    setActive(d) {
      S = d, (S || C > 0) && k();
    },
    destroy() {
      R && (R(), R = null), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
function me(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = W(n), w = Array.from({ length: 3 + Math.floor(g() * 3) }, () => ({
    cx: 0.2 + g() * 0.6,
    cy: 0.2 + g() * 0.6,
    freq: 20 + g() * 30,
    speed: 0.03 + g() * 0.035,
    phase: g() * Math.PI * 2,
    strength: 0.5 + g() * 0.5
  }));
  function s(o, e, i) {
    const y = o.getContext("2d"), r = o.width, t = 2, m = y.createImageData(r, r), v = m.data;
    for (let b = 0; b < r; b += t)
      for (let l = 0; l < r; l += t) {
        const S = l / r, C = b / r, x = S - 0.5, R = C - 0.5, k = Math.sqrt(x * x + R * R);
        if (k > 0.5) continue;
        let d = 0;
        for (const a of w) {
          const c = Math.sqrt((S - a.cx) ** 2 + (C - a.cy) ** 2), h = Math.sin(c * a.freq - e * a.speed * i + a.phase), A = Math.exp(-c * 4);
          d += h * A * a.strength;
        }
        d /= w.length;
        const p = X($ / 360, M / 100, U(0.55 + (d + 1) / 2 * 0.35, u)), f = Math.min((0.5 - k) * 10, 1);
        for (let a = 0; a < t && b + a < r; a++)
          for (let c = 0; c < t && l + c < r; c++) {
            const h = ((b + a) * r + (l + c)) * 4;
            v[h] = p[0], v[h + 1] = p[1], v[h + 2] = p[2], v[h + 3] = f * 255 | 0;
          }
      }
    y.putImageData(m, 0, 0);
  }
  return Z(T, n, P, s, { fps: 30 });
}
function xe(T, n, P, u) {
  const { hue: $, sat: M } = V(n, u), g = W(n), w = Array.from({ length: 5 + Math.floor(g() * 4) }, (o, e) => ({
    offset: g() * Math.PI * 2,
    freq: 2 + g() * 4,
    amp: 0.06 + g() * 0.1,
    width: 0.03 + g() * 0.04,
    horiz: e % 2 === 0,
    speed: 0.02 + g() * 0.035,
    lum: 0.6 + g() * 0.25
  }));
  function s(o, e, i) {
    const y = o.getContext("2d"), r = o.width, t = 2, m = y.createImageData(r, r), v = m.data;
    for (let b = 0; b < r; b += t)
      for (let l = 0; l < r; l += t) {
        const S = l / r, C = b / r, x = S - 0.5, R = C - 0.5, k = Math.sqrt(x * x + R * R);
        if (k > 0.5) continue;
        let d = -1, p = 0;
        for (let h = 0; h < w.length; h++) {
          const A = w[h], D = A.horiz ? S : C, I = A.horiz ? C : S, q = 0.1 + h / w.length * 0.8 + Math.sin(D * A.freq * Math.PI * 2 + A.offset + e * A.speed * i) * A.amp, L = Math.abs(I - q);
          if (L < A.width) {
            const N = 1 - L / A.width;
            N > p && (p = N, d = h);
          }
        }
        let f = 0.5;
        d >= 0 && (f = w[d].lum * p);
        const a = X($ / 360, M / 100, U(f, u)), c = Math.min((0.5 - k) * 10, 1);
        for (let h = 0; h < t && b + h < r; h++)
          for (let A = 0; A < t && l + A < r; A++) {
            const D = ((b + h) * r + (l + A)) * 4;
            v[D] = a[0], v[D + 1] = a[1], v[D + 2] = a[2], v[D + 3] = c * 255 | 0;
          }
      }
    y.putImageData(m, 0, 0);
  }
  return Z(T, n, P, s, { fps: 30 });
}
function $e(T, n, P, u) {
  const $ = V(n, u), { hue: M, sat: g, bgRgb: w } = $, s = W(n), o = {
    warpPoints: Array.from({ length: 4 + Math.floor(s() * 3) }, () => ({
      x: 0.15 + s() * 0.7,
      y: 0.15 + s() * 0.7,
      strength: 0.3 + s() * 0.7,
      freq: 3 + s() * 5,
      orbitR: 0.05 + s() * 0.12,
      orbitSpeed: 0.012 + s() * 0.018,
      phase: s() * Math.PI * 2
    })),
    gridSpacing: 0.06 + s() * 0.04
  };
  function e(i, y, r) {
    const t = i.getContext("2d"), m = i.width;
    t.fillStyle = `rgb(${w[0]},${w[1]},${w[2]})`, t.fillRect(0, 0, m, m);
    const v = o.gridSpacing, b = o.warpPoints.map((l) => ({
      x: l.x + Math.cos(y * l.orbitSpeed + l.phase) * l.orbitR * r,
      y: l.y + Math.sin(y * l.orbitSpeed * 1.3 + l.phase) * l.orbitR * r,
      strength: l.strength,
      freq: l.freq
    }));
    for (let l = 0; l <= 1; l += v) {
      const S = [];
      for (let x = 0; x <= 1.01; x += 0.01) {
        let R = 0, k = 0;
        for (const d of b) {
          const p = l - d.x, f = x - d.y, a = Math.sqrt(p * p + f * f) + 0.01;
          R += Math.sin(a * d.freq * Math.PI * 2) * d.strength * 0.02 / a, k += Math.cos(a * d.freq * Math.PI * 2) * d.strength * 0.02 / a;
        }
        S.push([(l + R) * m, (x + k) * m]);
      }
      t.beginPath(), S.forEach((x, R) => R === 0 ? t.moveTo(x[0], x[1]) : t.lineTo(x[0], x[1]));
      const C = U(0.5 + l * 0.3, u);
      t.strokeStyle = `rgba(${X(M / 360, g / 100, C).join(",")},0.4)`, t.lineWidth = 0.8, t.stroke();
    }
    for (let l = 0; l <= 1; l += v) {
      const S = [];
      for (let x = 0; x <= 1.01; x += 0.01) {
        let R = 0, k = 0;
        for (const d of b) {
          const p = x - d.x, f = l - d.y, a = Math.sqrt(p * p + f * f) + 0.01;
          R += Math.sin(a * d.freq * Math.PI * 2) * d.strength * 0.02 / a, k += Math.cos(a * d.freq * Math.PI * 2) * d.strength * 0.02 / a;
        }
        S.push([(x + R) * m, (l + k) * m]);
      }
      t.beginPath(), S.forEach((x, R) => R === 0 ? t.moveTo(x[0], x[1]) : t.lineTo(x[0], x[1]));
      const C = U(0.5 + l * 0.3, u);
      t.strokeStyle = `rgba(${X(M / 360, g / 100, C).join(",")},0.4)`, t.lineWidth = 0.8, t.stroke();
    }
    t.globalCompositeOperation = "destination-in", t.beginPath(), t.arc(m / 2, m / 2, m / 2, 0, Math.PI * 2), t.fill(), t.globalCompositeOperation = "source-over";
  }
  return Z(T, n, P, e, { fps: 30 });
}
const vt = {
  blob: At,
  "triple-gol": qt,
  "organic-rings": _t,
  pixel: Ft,
  "pixel-diamond": Wt,
  interference: Vt,
  "flow-field": Kt,
  "layered-flow": Zt,
  voronoi: Jt,
  "voronoi-wire": zt,
  "voronoi-gradient": ee,
  "voronoi-stained": ne,
  "voronoi-topo": oe,
  spiral: ae,
  plasma: se,
  maze: ie,
  orbital: fe,
  lissajous: ge,
  boids: Me,
  ripple: me,
  weave: xe,
  warp: $e
}, Re = Object.keys(vt);
function Pe(T, n) {
  const P = n.style, u = n.size ?? 48;
  let $ = n.active ?? !1, M = n.mode ?? "light";
  const g = vt[P];
  if (!g)
    throw new Error(`Unknown avatar style "${P}". Available: ${Re.join(", ")}`);
  let w = typeof n.seed == "number" ? n.seed : ut(String(n.seed)), s = g(T, w, u, M);
  $ && s.setActive(!0);
  function o() {
    s.destroy(), s = g(T, w, u, M), $ && s.setActive(!0);
  }
  return {
    setActive(e) {
      $ = e, s.setActive(e);
    },
    setSeed(e) {
      const i = typeof e == "number" ? e : ut(String(e));
      i !== w && (w = i, o());
    },
    setMode(e) {
      e !== M && (M = e, o());
    },
    destroy() {
      s.destroy();
    }
  };
}
export {
  Pe as create,
  Re as styles
};
