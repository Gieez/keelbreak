/* Original procedural naval art: render-chart.js. No external assets. */
(function () {
  'use strict';
  var KB = window.KB;
  var { TAU, C, num, clamp, polygon, line, circle, label } = KB.art;
  function buoy(c, x, y, color, t, index) {
    c.save(); c.translate(x, y);
    c.strokeStyle = '#bcd8cd30'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 4, 8, 3, 0, 0, TAU); c.stroke();
    polygon(c, [[-4, 3], [0, -7], [4, 3]], color, '#102e33');
    line(c, 0, -6, 0, -11, '#b3c9af');
    circle(c, 0, -11, 1.8, color);
    c.globalAlpha = 0.08 + (Math.sin(t * 1.5 + index) + 1) * 0.035;
    circle(c, 0, -10, 6, color); c.restore();
  }
  function objectives(c, sector, state, t) {
    var route = sector.route || [];
    if (route.length) {
      c.save(); c.setLineDash([4, 10]); c.strokeStyle = '#bedfd150'; c.lineWidth = 1.5;
      c.beginPath(); route.forEach(function (p, i) { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke(); c.restore();
      route.forEach(function (p, i) {
        buoy(c, p.x, p.y - 36, i === route.length - 1 ? C.lime : '#8dc7ba', t, i);
        buoy(c, p.x, p.y + 36, '#d6a47e', t, i + 1);
      });
    }
    var capture = sector.capture;
    if (!capture || !(state.mission === 2 || route.length)) return;
    var progress = clamp(num(state.objective && state.objective.capture, 0) / 100, 0, 1);
    var color = state.mission === 2 ? C.gold : '#a5d6c9';
    c.save();
    circle(c, capture.x, capture.y, capture.r, state.mission === 2 ? '#e2c78b08' : '#a5d6c908');
    c.setLineDash([9, 7]); circle(c, capture.x, capture.y, capture.r, null, state.mission === 2 ? '#e2c78b87' : '#a5d6c95c', 1.5);
    c.setLineDash([]);
    for (var j = 0; j < 4; j++) {
      var a = j * Math.PI / 2;
      line(c, capture.x + Math.cos(a) * (capture.r - 7), capture.y + Math.sin(a) * (capture.r - 7),
        capture.x + Math.cos(a) * (capture.r + 7), capture.y + Math.sin(a) * (capture.r + 7), color, 2);
    }
    if (progress > 0 && state.mission === 2) {
      c.beginPath(); c.arc(capture.x, capture.y, capture.r + 5, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
      c.strokeStyle = C.lime; c.lineWidth = 4; c.stroke();
    }
    label(c, state.mission === 2 ? 'SIGNAL ZONE / ' + Math.floor(progress * 100) + '%' : 'ESCORT EXIT', capture.x, capture.y - capture.r - 14, color, 10, 'center');
    c.restore();
  }
  function compass(c, W) {
    var x = W - 65, y = 73;
    c.save(); c.globalAlpha = 0.66;
    circle(c, x, y, 23, null, '#c0d1c73d');
    line(c, x - 28, y, x + 28, y, '#abc6ba4a'); line(c, x, y - 24, x, y + 24, '#abc6ba4a');
    polygon(c, [[x, y - 19], [x - 4, y + 8], [x, y + 3]], '#d6dfc5');
    polygon(c, [[x, y - 19], [x + 4, y + 8], [x, y + 3]], '#729088');
    label(c, 'N', x, y - 29, '#d7e0ca', 10, 'center');
    label(c, 'WIND', x, y + 39, '#a9c6b7', 8, 'center');
    // Wind is decorative atmosphere, never an invented engine speed or bearing.
    line(c, x - 10, y + 48, x + 10, y + 43, '#adc7b7');
    line(c, x + 10, y + 43, x + 6, y + 42, '#adc7b7'); c.restore();
  }
  function minimap(c, state, sector, W, H) {
    if (state.mode !== 'play' && state.mode !== 'paused') return;
    var mw = 164, mh = mw * H / W, x = W - mw - 36, y = H - mh - 42;
    c.save(); c.translate(x, y);
    c.fillStyle = '#081d27e8'; c.fillRect(-8, -22, mw + 16, mh + 38);
    c.strokeStyle = '#adc8b640'; c.lineWidth = 1; c.strokeRect(-8, -22, mw + 16, mh + 38);
    label(c, 'TACTICAL CHART', 0, -8, '#bacdb5', 8);
    c.save(); c.beginPath(); c.rect(0, 0, mw, mh); c.clip();
    c.scale(mw / W, mh / H);
    (sector.land || []).forEach(function (i) { circle(c, i.x, i.y, i.r, '#51695c'); });
    if ((sector.route || []).length) {
      c.strokeStyle = '#b2cbbc80'; c.lineWidth = 8; c.setLineDash([20, 25]);
      c.beginPath(); sector.route.forEach(function (p, i) { if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke(); c.setLineDash([]);
    }
    if (sector.capture && (state.mission === 2 || (sector.route || []).length)) circle(c, sector.capture.x, sector.capture.y, sector.capture.r, null, '#dfce9699', 8);
    (state.hazards || []).forEach(function (h) { circle(c, h.x, h.y, h.r, '#dc967641'); });
    function dot(s, color) {
      if (!s || s.hp <= 0) return;
      c.save(); c.translate(s.x, s.y); c.rotate(num(s.a, 0));
      if (s.kind === 'tower') { c.fillStyle = color; c.fillRect(-14, -14, 28, 28); }
      else polygon(c, [[24, 0], [-16, -16], [-9, 0], [-16, 16]], color);
      c.restore();
    }
    (state.enemies || []).forEach(function (e) { dot(e, C.enemy); });
    dot(state.convoy, '#b9e3df'); dot(state.ship, C.lime);
    c.restore(); c.strokeStyle = '#b1cbb52e'; c.strokeRect(0, 0, mw, mh);
    label(c, '0', 0, mh + 11, '#9eb8aa', 7);
    label(c, String(W), mw, mh + 11, '#9eb8aa', 7, 'right'); c.restore();
  }
  Object.assign(KB.art, { objectives, compass, minimap });
})();
