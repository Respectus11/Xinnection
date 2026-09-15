const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (rgb) => {
  const f = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
};
const blend = (fg, bg, a) => fg.map((c, i) => Math.round(a * c + (1 - a) * bg[i]));
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const check = (name, fgHex, bgHex, alpha, need) => {
  const fg = alpha >= 1 ? hex(fgHex) : blend(hex(fgHex), hex(bgHex), alpha);
  const r = ratio(lum(fg), lum(hex(bgHex)));
  console.log((r >= need ? 'PASS ' : 'FAIL ') + r.toFixed(2) + ':1 (need ' + need + ') ' + name);
};
const MIST = '#EDEFE4', INK = '#10161F', DUSK = '#1B2A3D', WHITE = '#FFFFFF';
console.log('--- light surfaces (current token usage) ---');
check('body ink/mist', INK, MIST, 1, 4.5);
check('kicker/labels ink65/mist', INK, MIST, 0.65, 4.5);
check('meta ink60/mist', INK, MIST, 0.6, 4.5);
check('timestamps+placeholder ink60/white', INK, WHITE, 0.6, 4.5);
check('empty-body ink65/white', INK, WHITE, 0.65, 4.5);
check('pill eucalyptus-deep/mist', '#3A5D50', MIST, 1, 4.5);
check('flag/white', '#B4432F', WHITE, 1, 4.5);
check('flag/mist', '#B4432F', MIST, 1, 4.5);
check('cta ink/gold', INK, '#C9A227', 1, 4.5);
console.log('--- dusk surfaces ---');
check('nav mist/dusk', MIST, DUSK, 1, 4.5);
check('inactive nav mist65/dusk', MIST, DUSK, 0.65, 4.5);
check('caseload+footer-fine mist55/dusk', MIST, DUSK, 0.55, 4.5);
check('footer note mist60/dusk', MIST, DUSK, 0.6, 4.5);
