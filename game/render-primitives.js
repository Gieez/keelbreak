/* Original procedural naval art: render-primitives.js. No external assets. */
(function () {
  'use strict';
  var KB = window.KB;
  KB.art = {};
  var TAU = Math.PI * 2;
  var C = { ink: '#071a23', foam: '#bddad1', lime: '#c3df86', enemy: '#e39879', gold: '#e2c78b' };
  function num(n, fallback) { return Number.isFinite(n) ? n : fallback; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function noise(n) { var v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }
  function polygon(c, points, fill, stroke, width) {
    c.beginPath();
    for (var i = 0; i < points.length; i++) {
      if (i) c.lineTo(points[i][0], points[i][1]); else c.moveTo(points[i][0], points[i][1]);
    }
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.stroke(); }
  }
  function line(c, x1, y1, x2, y2, color, width) {
    c.strokeStyle = color; c.lineWidth = width || 1;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }
  function circle(c, x, y, r, fill, stroke, width) {
    if (r <= 0) return;
    c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.stroke(); }
  }
  function label(c, text, x, y, color, size, align) {
    c.font = (size || 10) + 'px Consolas, monospace';
    c.textAlign = align || 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = color; c.fillText(text, x, y);
  }
  Object.assign(KB.art, { TAU, C, num, clamp, noise, polygon, line, circle, label });
})();
