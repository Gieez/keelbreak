/* Original procedural naval art: render-effects.js. No external assets. */
(function () {
  'use strict';
  var KB = window.KB;
  var { TAU, C, num, clamp, polygon, line, circle, label } = KB.art;
  function broadside(c, ship, state) {
    if (!ship || state.mode !== 'play' || ship.hp <= 0) return;
    c.save(); c.translate(ship.x, ship.y); c.rotate(num(ship.a, 0));
    for (var side = -1; side <= 1; side += 2) {
      c.beginPath(); c.moveTo(-8, side * 22); c.lineTo(-98, side * 250);
      c.quadraticCurveTo(0, side * 278, 98, side * 250); c.lineTo(8, side * 22); c.closePath();
      c.fillStyle = '#c3df8605'; c.fill(); c.setLineDash([4, 13]); c.strokeStyle = '#c3df8626'; c.lineWidth = 1; c.stroke();
    }
    c.restore();
  }
  function wake(c, w) {
    var life = clamp(num(w.life, 0) / 1.6, 0, 1), r = Math.max(4, num(w.r, 15));
    if (!life) return;
    c.save(); c.translate(w.x, w.y); c.rotate(num(w.a, 0)); c.globalAlpha = life * 0.22;
    c.lineWidth = 1.7; c.strokeStyle = C.foam;
    c.beginPath(); c.moveTo(-30 - (1 - life) * 17, -r * 1.5); c.quadraticCurveTo(-14, -r * 0.7, 4, -r * 0.5);
    c.moveTo(-30 - (1 - life) * 17, r * 1.5); c.quadraticCurveTo(-14, r * 0.7, 4, r * 0.5); c.stroke();
    c.globalAlpha = life * 0.09; line(c, -32, 0, 0, 0, C.foam, r * 0.6); c.restore();
  }
  function hazard(c, h) {
    var r = Math.max(1, num(h.r, 35)), fraction = clamp(num(h.timer, 0) / Math.max(0.001, num(h.maxTimer, 1)), 0, 1);
    c.save();
    circle(c, h.x, h.y, r, '#e3987916', '#e8a285c4', 1.5);
    circle(c, h.x, h.y, r * fraction, null, '#ecc79ba6', 1);
    c.setLineDash([3, 5]); circle(c, h.x, h.y, r + 5, null, '#e3987966'); c.setLineDash([]);
    line(c, h.x - 8, h.y, h.x + 8, h.y, '#ffd5b8', 1.5);
    line(c, h.x, h.y - 8, h.x, h.y + 8, '#ffd5b8', 1.5);
    c.restore();
  }
  function salvage(c, item, t) {
    if (item.life <= 0) return;
    c.save(); c.translate(item.x, item.y);
    c.globalAlpha = item.life < 2 ? clamp(item.life / 2, 0, 1) : 1;
    circle(c, 0, 0, 18 + Math.sin(t * 1.5) * 1.5, '#b4d77d0c', '#c3df864d');
    polygon(c, [[-9, -6], [5, -9], [10, -3], [8, 7], [-7, 8]], '#59754c', '#d2e8a0', 1.3);
    line(c, -6, -5, 7, 6, '#9db777'); line(c, 6, -6, -6, 6, '#9db777');
    label(c, 'SALVAGE', 0, -23, '#d5e6aa', 8, 'center'); c.restore();
  }
  function effects(c, state) {
    (state.bullets || []).forEach(function (b) {
      if (b.life <= 0) return;
      var color = b.team === 'player' ? '#eee5b9' : '#f0ac8a';
      c.save(); c.globalAlpha = 0.35;
      line(c, b.x - num(b.vx, 0) * 0.038, b.y - num(b.vy, 0) * 0.038, b.x, b.y, color, b.chain ? 2 : 3);
      c.globalAlpha = 1;
      if (b.chain) {
        var a = Math.atan2(num(b.vy, 0), num(b.vx, 0));
        var dx = Math.sin(a) * 4, dy = Math.cos(a) * 4;
        line(c, b.x - dx, b.y + dy, b.x + dx, b.y - dy, '#c9d2b5', 1);
        circle(c, b.x - dx, b.y + dy, 2.2, color); circle(c, b.x + dx, b.y - dy, 2.2, color);
      } else { circle(c, b.x, b.y, 3.1, '#183039', color, 1.4); circle(c, b.x - 0.6, b.y - 0.6, 1.3, '#fff4d8'); }
      c.restore();
    });
    (state.particles || []).forEach(function (p) {
      if (p.life <= 0) return;
      c.save(); var fraction = clamp(p.life / Math.max(0.01, num(p.maxLife, 1)), 0, 1);
      c.globalAlpha = fraction;
      circle(c, p.x, p.y, Math.max(0.1, num(p.size, 2) * (0.45 + fraction * 0.55)), p.color || C.foam);
      c.restore();
    });
    (state.smoke || []).forEach(function (s) {
      if (s.life <= 0) return;
      var r = Math.max(1, num(s.r, 18));
      c.save(); c.globalAlpha = clamp(s.life * 0.45, 0, 0.6);
      for (var i = 0; i < 4; i++) circle(c, s.x + Math.cos(i * 2.3) * r * 0.35, s.y + Math.sin(i * 2.3) * r * 0.25, r * (0.65 + i * 0.08), i % 2 ? '#8c9a91' : '#b5bbb099');
      c.restore();
    });
  }
  Object.assign(KB.art, { broadside, wake, hazard, salvage, effects });
})();
