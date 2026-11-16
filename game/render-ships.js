/* Original procedural naval art: render-ships.js. No external assets. */
(function () {
  'use strict';
  var KB = window.KB;
  var { TAU, C, num, clamp, polygon, line, circle, label } = KB.art;
  var profiles = {
    player: { l: 78, w: 29, hull: '#a5c66a', deck: '#58694d', trim: '#d7e9ad', guns: 4 },
    brig: { l: 73, w: 28, hull: '#a76655', deck: '#715648', trim: '#d7aa8a', guns: 3 },
    cutter: { l: 59, w: 22, hull: '#c18e64', deck: '#73604a', trim: '#edc08b', guns: 2 },
    mortar: { l: 77, w: 35, hull: '#936954', deck: '#65554c', trim: '#dba877', guns: 2 },
    merchant: { l: 87, w: 33, hull: '#7ca5aa', deck: '#726e54', trim: '#c2e1d6', guns: 0 },
    boss: { l: 154, w: 55, hull: '#584a49', deck: '#3c4245', trim: '#e5a480', guns: 6 }
  };
  function hullPoints(l, w) {
    return [[l * 0.54, 0], [l * 0.32, -w * 0.4], [l * 0.03, -w * 0.51], [-l * 0.43, -w * 0.45],
      [-l * 0.5, -w * 0.26], [-l * 0.5, w * 0.26], [-l * 0.43, w * 0.45], [l * 0.03, w * 0.51], [l * 0.32, w * 0.4]];
  }
  function sail(c, x, w, l, friendly, t) {
    line(c, x, -w * 0.7, x, w * 0.7, '#2a3d37', 3);
    var bow = 4 + Math.sin(t * 0.8 + x) * 0.8;
    c.beginPath(); c.moveTo(x - 1, -w * 0.68); c.quadraticCurveTo(x + bow + l * 0.14, 0, x - 1, w * 0.68);
    c.lineTo(x - l * 0.08, w * 0.58); c.quadraticCurveTo(x + bow, 0, x - l * 0.08, -w * 0.58); c.closePath();
    c.fillStyle = friendly ? '#e2e7bd' : '#d7bea0'; c.fill(); c.strokeStyle = '#344a40'; c.lineWidth = 0.8; c.stroke();
    line(c, x + 1, -w * 0.47, x + 5, w * 0.47, friendly ? '#91ad6a' : '#a4765a', 1.2);
    circle(c, x, 0, 2.6, '#d6d0a6', '#31453c');
  }
  function turret(c, x, y, r, angle, color, twin) {
    c.save(); c.translate(x, y); c.rotate(angle);
    circle(c, 2, 3, r + 1, '#07192280'); circle(c, 0, 0, r, '#596065', '#b2aca0', 1);
    if (twin) {
      line(c, 0, -3, r + 13, -3, '#12262e', 5); line(c, 0, 3, r + 13, 3, '#12262e', 5);
      line(c, 0, -3, r + 12, -3, color, 2); line(c, 0, 3, r + 12, 3, color, 2);
    } else { line(c, 0, 0, r + 13, 0, '#112832', 7); line(c, 0, -1, r + 12, -1, color, 3); }
    circle(c, -2, 0, r * 0.42, '#77827c'); c.restore();
  }
  function health(c, ship, p) {
    if (!Number.isFinite(ship.hp) || !Number.isFinite(ship.maxHp) || ship.maxHp <= 0) return;
    var ratio = clamp(ship.hp / ship.maxHp, 0, 1);
    if (ship.kind === 'player' && ratio > 0.5) return;
    var boss = ship.kind === 'boss', width = boss ? 114 : ship.kind === 'merchant' ? 67 : 42;
    var y = ship.y - Math.max(num(ship.r, 20), p.w * 0.7) - (boss ? 24 : 18);
    c.fillStyle = '#061821cf'; c.fillRect(ship.x - width / 2 - 3, y - 3, width + 6, 9);
    c.fillStyle = '#697e7540'; c.fillRect(ship.x - width / 2, y, width, 3);
    c.fillStyle = ship.kind === 'player' ? '#e9bc7c' : ship.kind === 'merchant' ? '#a5d4ca' : C.enemy;
    c.fillRect(ship.x - width / 2, y, width * ratio, 3);
    if (boss) label(c, 'COMMAND DREADNOUGHT', ship.x, y - 9, '#ecc1a3', 10, 'center');
    if (ship.kind === 'merchant') label(c, 'MERCHANT', ship.x, y - 8, '#c0e2d7', 9, 'center');
  }
  function drawShip(c, ship, t) {
    if (!ship || ship.hp <= 0) return;
    var kind = ship.kind || 'brig';
    var p = profiles[kind] || profiles.brig;
    var l = p.l, w = p.w, ours = kind === 'player', boss = kind === 'boss';
    c.save(); c.translate(ship.x, ship.y);
    if (kind === 'tower') {
      var tr = Math.max(16, num(ship.r, 24));
      c.fillStyle = '#07182290'; c.fillRect(-tr + 6, -tr + 8, tr * 2, tr * 2);
      polygon(c, [[-tr, -tr * 0.7], [-tr * 0.7, -tr], [tr * 0.7, -tr], [tr, -tr * 0.7], [tr, tr * 0.7], [tr * 0.7, tr], [-tr * 0.7, tr], [-tr, tr * 0.7]], '#46585b', '#a8aaa0', 2);
      circle(c, 0, 0, tr * 0.8, '#233c46', '#72867e');
      turret(c, 0, 0, tr * 0.45, num(ship.a, 0), C.enemy, false);
      if (ship.flash > 0) { c.globalAlpha = 0.4; circle(c, 0, 0, tr, '#fff1c8'); }
      c.restore(); health(c, ship, p); return;
    }
    c.rotate(num(ship.a, 0));
    c.save(); c.translate(-2, 9); c.beginPath(); c.ellipse(0, 0, l * 0.57, w * 0.7, 0, 0, TAU); c.fillStyle = '#04182285'; c.fill(); c.restore();
    if (Math.abs(num(ship.v, 0)) > 12) {
      c.save(); c.globalAlpha = 0.25;
      c.strokeStyle = C.foam; c.lineWidth = 1.5; c.beginPath();
      c.moveTo(l * 0.53, 0); c.quadraticCurveTo(l * 0.38, -w * 0.6, l * 0.08, -w * 0.66);
      c.moveTo(l * 0.53, 0); c.quadraticCurveTo(l * 0.38, w * 0.6, l * 0.08, w * 0.66); c.stroke(); c.restore();
    }
    polygon(c, hullPoints(l + 5, w + 5), '#172c2e', '#152e32', 2);
    polygon(c, hullPoints(l, w), ship.flash > 0 ? '#f4e9c4' : p.hull, p.trim, 1.4);
    polygon(c, hullPoints(l * 0.86, w * 0.76), p.deck, '#253d39', 1);
    c.save(); polygon(c, hullPoints(l * 0.86, w * 0.76)); c.clip();
    for (var px = -l / 2; px < l / 2; px += 5) line(c, px, -w, px, w, '#101f2642');
    line(c, -l / 2, 0, l / 2, 0, '#a0ac8250'); c.restore();
    for (var side = -1; side <= 1; side += 2) {
      for (var gun = 0; gun < p.guns; gun++) {
        var gx = -l * 0.29 + gun * l * 0.54 / Math.max(1, p.guns - 1);
        c.fillStyle = '#112831'; c.fillRect(gx - 3, side < 0 ? -w * 0.62 : w * 0.33, 6, w * 0.29);
        c.fillStyle = p.trim; c.fillRect(gx - 1.4, side < 0 ? -w * 0.61 : w * 0.46, 2.8, w * 0.14);
      }
    }
    if (boss) {
      polygon(c, [[-62, -12], [47, -12], [62, 0], [47, 12], [-62, 12]], '#6d7370', '#a4a89b');
      for (var vent = -39; vent <= 1; vent += 10) {
        c.fillStyle = '#23363e'; c.fillRect(vent, -8, 6, 16);
        line(c, vent + 1, -5, vent + 5, -5, '#9d9c83');
      }
      c.fillStyle = '#252e34'; c.fillRect(-9, -11, 22, 22);
      c.fillStyle = '#9b775e'; c.fillRect(-8, -10, 20, 5);
      circle(c, 0, 0, 6, '#1b2b33', '#c09b78', 2);
      turret(c, 41, 0, 11, 0, '#c1bda7', true);
      turret(c, -51, 0, 10, Math.PI, '#c1bda7', true);
      line(c, 12, -19, 12, 19, '#d4cbb0', 1.5);
      polygon(c, [[12, -19], [34, -18], [27, -11], [12, -12]], '#c37e61');
    } else if (kind === 'mortar') {
      c.fillStyle = '#273c40'; c.fillRect(-29, -10, 19, 20);
      for (var rack = 0; rack < 3; rack++) circle(c, -24 + rack * 5, 0, 2, '#c2a17a');
      circle(c, 13, 0, 13, '#313e40', '#b59e7e', 2);
      circle(c, 13, 0, 8, '#122b33', '#d9b17e', 2); circle(c, 13, 0, 3, '#0a202b');
      line(c, -18, -12, -18, 12, '#b9bba2', 1.4);
      polygon(c, [[-18, -12], [-3, -10], [-18, -6]], '#cb9b6e');
    } else if (kind === 'merchant') {
      for (var crate = 0; crate < 4; crate++) {
        var cx = -27 + (crate % 2) * 13, cy = -9 + Math.floor(crate / 2) * 10;
        c.fillStyle = crate % 2 ? '#9e9a6a' : '#a78d67'; c.fillRect(cx, cy, 11, 8);
        c.strokeStyle = '#4b5847'; c.lineWidth = 1; c.strokeRect(cx, cy, 11, 8);
        line(c, cx, cy, cx + 11, cy + 8, '#5d654d');
      }
      sail(c, 11, w, l, true, t);
      line(c, -33, -8, 31, 0, '#dce1c24a'); line(c, -33, 8, 31, 0, '#dce1c24a');
    } else {
      // Rigging sits below the sails so each vessel keeps a clean top-down silhouette.
      line(c, -l * 0.42, 0, l * 0.34, -w * 0.31, '#d4d5ab70');
      line(c, -l * 0.42, 0, l * 0.34, w * 0.31, '#d4d5ab70');
      c.fillStyle = '#233c39'; c.fillRect(-l * 0.35, -w * 0.24, l * 0.16, w * 0.48);
      sail(c, l * 0.07, w, l, ours, t);
      if (kind !== 'cutter') sail(c, -l * 0.2, w * 0.74, l * 0.72, ours, t);
      polygon(c, [[l * 0.22, 0], [l * 0.44, -w * 0.19], [l * 0.4, w * 0.17]], ours ? '#b2ce87' : '#b69174', '#30483d');
      line(c, -l * 0.44, 0, l * 0.57, 0, '#cdd1aa', 1);
      polygon(c, [[-l * 0.24, -w * 0.69], [-l * 0.47, -w * 0.72], [-l * 0.35, -w * 0.55], [-l * 0.24, -w * 0.55]], ours ? C.lime : C.enemy);
    }
    if (ours) {
      polygon(c, [[l * 0.73, 0], [l * 0.64, -4], [l * 0.64, 4]], C.lime);
      if (ship.inv > 0) {
        c.save(); c.setLineDash([5, 6]);
        c.beginPath(); c.ellipse(0, 0, l * 0.65, w * 1.03, 0, 0, TAU);
        c.strokeStyle = '#d4e8a99c'; c.lineWidth = 1.4; c.stroke(); c.restore();
      }
    }
    c.restore(); health(c, ship, p);
  }
  Object.assign(KB.art, { drawShip });
})();
