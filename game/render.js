/* Original procedural naval art. Classic script, no assets or network required. */
(function () {
  'use strict';
  var KB = window.KB;
  var TAU = Math.PI * 2;
  var terrainCache = null;
  var C = { ink: '#071a23', foam: '#bddad1', lime: '#c3df86', enemy: '#e39879', gold: '#e2c78b' };
  var profiles = {
    player: { l: 78, w: 29, hull: '#a5c66a', deck: '#58694d', trim: '#d7e9ad', guns: 4 },
    brig: { l: 73, w: 28, hull: '#a76655', deck: '#715648', trim: '#d7aa8a', guns: 3 },
    cutter: { l: 59, w: 22, hull: '#c18e64', deck: '#73604a', trim: '#edc08b', guns: 2 },
    mortar: { l: 77, w: 35, hull: '#936954', deck: '#65554c', trim: '#dba877', guns: 2 },
    merchant: { l: 87, w: 33, hull: '#7ca5aa', deck: '#726e54', trim: '#c2e1d6', guns: 0 },
    boss: { l: 154, w: 55, hull: '#584a49', deck: '#3c4245', trim: '#e5a480', guns: 6 }
  };
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
  function outline(island, factor) {
    var points = [], seed = num(island.shape, 1) * 13.7;
    for (var i = 0; i < 36; i++) {
      var a = i / 36 * TAU;
      var r = island.r * factor * (0.94 + Math.sin(a * 3 + seed) * 0.045 + Math.sin(a * 7 + seed) * 0.025);
      points.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return points;
  }
  function roof(c, x, y, w, h, angle, warm) {
    c.save(); c.translate(x, y); c.rotate(angle);
    c.fillStyle = '#061a2170'; c.fillRect(-w / 2 + 4, -h / 2 + 5, w, h);
    c.fillStyle = warm ? '#7c5550' : '#596f69'; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = warm ? '#a06d58' : '#839187'; c.fillRect(-w / 2, -h / 2, w, h / 2);
    c.strokeStyle = '#b8bba366'; c.lineWidth = 1; c.strokeRect(-w / 2, -h / 2, w, h);
    line(c, -w / 2, 0, w / 2, 0, '#263e3e');
    for (var j = -w / 2 + 5; j < w / 2; j += 7) line(c, j, -h / 2 + 2, j, h / 2 - 2, '#172c333d');
    c.restore();
  }
  function palm(c, x, y, r, seed) {
    line(c, x + 3, y + 5, x, y, '#213e39', 3);
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * TAU + seed;
      polygon(c, [[x, y], [x + Math.cos(a - 0.28) * r * 0.6, y + Math.sin(a - 0.28) * r * 0.6],
        [x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a + 0.2) * r * 0.5, y + Math.sin(a + 0.2) * r * 0.5]], '#416d52');
    }
    circle(c, x, y, 2, '#779066');
  }
  function jetty(c, r, angle) {
    c.save(); c.rotate(angle);
    c.fillStyle = '#061c2460'; c.fillRect(r * 0.55 + 5, -12, r * 0.65, 26);
    c.fillStyle = '#6c7562'; c.fillRect(r * 0.55, -10, r * 0.65, 20);
    c.fillStyle = '#92937c'; c.fillRect(r * 1.1, -22, 10, 44);
    for (var x = r * 0.55 + 3; x < r * 1.2; x += 6) line(c, x, -9, x, 9, '#354c48');
    for (var i = 0; i < 4; i++) circle(c, r * 0.6 + i * r * 0.17, -12, 2.3, '#c0b797', '#3c4941');
    line(c, r * 0.62, 9, r * 1.15, 9, '#b6b298', 2);
    c.restore();
  }
  function fort(c, r, angle) {
    c.save(); c.rotate(angle);
    var w = r * 1.05, h = r * 0.62;
    c.fillStyle = '#07141e90'; c.fillRect(-w / 2 + 7, -h / 2 + 9, w, h);
    c.fillStyle = '#3c5057'; c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = '#94a4a0'; c.lineWidth = 5; c.strokeRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#243d47'; c.fillRect(-w * 0.37, -h * 0.31, w * 0.74, h * 0.62);
    for (var side = -1; side <= 1; side += 2) {
      for (var j = -w / 2; j <= w / 2; j += 13) {
        c.fillStyle = '#a0aaa0'; c.fillRect(j - 3, side * h / 2 - 4, 6, 8);
      }
      for (var k = -1; k <= 1; k += 2) {
        circle(c, k * w / 2, side * h / 2, 16, '#3b5056', '#8b9a95', 3);
        circle(c, k * w / 2, side * h / 2, 10, '#283f49');
      }
    }
    roof(c, 0, -4, w * 0.45, h * 0.5, 0, false);
    line(c, 0, -4, 0, -h * 0.6, '#d7d4b5', 2);
    polygon(c, [[0, -h * 0.6], [23, -h * 0.6 + 4], [0, -h * 0.6 + 10]], '#c48c70');
    c.restore();
  }
  function islandArt(c, island, mission, index, W, H) {
    var r = Math.max(1, num(island.r, 50));
    c.save(); c.translate(island.x, island.y);
    polygon(c, outline(island, 1.38), mission === 2 ? '#745b4438' : '#468d802c');
    polygon(c, outline(island, 1.2), mission === 2 ? '#96745d24' : '#66a79a2c', '#9abbb42c');
    c.save(); c.translate(4, 9); polygon(c, outline(island, 1.02), '#05192480'); c.restore();
    polygon(c, outline(island, 1.015), mission === 2 ? '#7b7262' : '#a0a48a', '#ccd1b36b');
    polygon(c, outline(island, 0.94), mission === 2 ? '#494b47' : '#5b7764');
    polygon(c, outline(island, 0.79), mission === 2 ? '#343d3d' : '#405e4b');
    for (var j = 0; j < Math.floor(r / 4); j++) {
      var a = noise(j + index * 87) * TAU;
      var d = Math.sqrt(noise(j * 1.6 + index * 31)) * r * 0.8;
      var x = Math.cos(a) * d, y = Math.sin(a) * d;
      var sz = 3 + noise(j * 3 + index) * 9;
      polygon(c, [[x - sz, y], [x - sz * 0.3, y - sz * 0.7], [x + sz * 0.6, y - sz * 0.5], [x + sz, y + sz * 0.4], [x, y + sz * 0.7]],
        mission === 2 ? '#59615b' : '#6a8067', '#bec4a925');
      line(c, x - sz * 0.3, y - sz * 0.7, x + sz * 0.6, y - sz * 0.5, '#bbc1a34a');
    }
    var inward = Math.atan2(H / 2 - island.y, W / 2 - island.x);
    if (mission === 0 && r > 70) {
      jetty(c, r, inward);
      for (var b = 0; b < 6; b++) {
        var bx = (b % 3 - 1) * r * 0.33, by = (Math.floor(b / 3) - 0.5) * r * 0.4;
        roof(c, bx, by, 23 + noise(b + index) * 12, 17, inward + Math.PI / 2, b % 2 === 0);
      }
      c.save(); c.rotate(inward); roof(c, r * 0.55, 0, 26, 31, 0, false); c.restore();
    } else if (mission === 1) {
      for (var p = 0; p < 9; p++) {
        var pa = noise(p + index * 19) * TAU, pd = noise(p * 4 + 8) * r * 0.68;
        palm(c, Math.cos(pa) * pd, Math.sin(pa) * pd, 10 + noise(p) * 6, pa);
      }
      if (index % 2 === 0) { roof(c, 0, 0, 29, 19, inward, true); jetty(c, r, inward); }
    } else if (mission === 2) {
      polygon(c, outline(island, 0.62), '#242f33', '#8c5b444d');
      polygon(c, outline(island, 0.36), '#17262c', '#b166434d', 3);
      for (var f = 0; f < 5; f++) {
        var fa = f * 1.7 + index, fr = r * (0.27 + noise(f) * 0.24);
        var fx = Math.cos(fa) * fr, fy = Math.sin(fa) * fr;
        line(c, fx, fy, fx + Math.cos(fa) * 17, fy + Math.sin(fa) * 14, '#ca734b', 3);
        line(c, fx, fy, fx + Math.cos(fa) * 11, fy + Math.sin(fa) * 9, '#edb46c', 1);
      }
    } else if (mission === 3 && r > 115) {
      fort(c, r, inward - Math.PI / 2);
      jetty(c, r, inward);
    }
    // A shore light belongs to the terrain; gun towers come only from state.enemies.
    if ((mission === 0 || mission === 1) && index === 0) {
      c.save(); c.rotate(inward); c.translate(r * 0.76, -r * 0.32);
      circle(c, 3, 4, 10, '#102c2a80'); circle(c, 0, 0, 7, '#c7c6a5', '#314c4b', 2);
      circle(c, 0, 0, 3, '#ecdf9e'); c.restore();
    }
    c.restore();
  }
  function terrain(c, sector, mission, W, H) {
    var key = mission + ':' + W + ':' + H + ':' + JSON.stringify(sector.land || []);
    if (!terrainCache || terrainCache.key !== key) {
      var layer = document.createElement('canvas'); layer.width = W; layer.height = H;
      var lc = layer.getContext('2d');
      (sector.land || []).forEach(function (island, index) { islandArt(lc, island, mission, index, W, H); });
      terrainCache = { key: key, layer: layer };
    }
    c.drawImage(terrainCache.layer, 0, 0);
  }
  function water(c, sector, mission, t, W, H) {
    var colors = sector.water || ['#164752', '#082a38'];
    var g = c.createLinearGradient(0, 0, W * 0.25, H);
    g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var glow = c.createRadialGradient(W * 0.43, H * 0.24, 20, W * 0.43, H * 0.24, W * 0.65);
    glow.addColorStop(0, '#72b3a312'); glow.addColorStop(1, '#03121d32');
    c.fillStyle = glow; c.fillRect(0, 0, W, H);
    c.lineWidth = 1;
    for (var row = 0; row < 22; row++) {
      var y = row * 39 + 8;
      c.beginPath();
      for (var x = -20; x <= W + 20; x += 20) {
        var yy = y + Math.sin(x * 0.012 + row * 0.84 + t * 0.36) * 5 + Math.cos(x * 0.005 + row) * 4;
        if (x === -20) c.moveTo(x, yy); else c.lineTo(x, yy);
      }
      c.strokeStyle = row % 3 === 0 ? '#a0cebd10' : '#a0cebd08'; c.stroke();
    }
    for (var i = 0; i < 145; i++) {
      var sx = noise(i * 7 + 3) * W;
      var sy = noise(i * 5 + 9) * H;
      var shimmer = 0.035 + (Math.sin(t * 0.75 + i * 2.1) + 1) * 0.023;
      c.globalAlpha = shimmer;
      line(c, sx, sy + Math.sin(t * 0.5 + i) * 2, sx + 7 + noise(i) * 22, sy, C.foam, 1);
      if (i % 7 === 0) line(c, sx + 3, sy + 4, sx + 14, sy + 4, C.foam, 1);
    }
    c.globalAlpha = 1;
    // Quiet cartographic frame leaves the action area ungridded.
    c.strokeStyle = '#b4d5ca1a'; c.lineWidth = 1; c.strokeRect(22, 22, W - 44, H - 44);
    for (var tick = 80; tick < W - 40; tick += 80) {
      line(c, tick, 22, tick, 27, '#b6d1c943'); line(c, tick, H - 22, tick, H - 27, '#b6d1c930');
    }
    for (var ty = 80; ty < H - 40; ty += 80) line(c, 22, ty, 27, ty, '#b6d1c930');
    label(c, sector.name || 'KEELBREAK', 39, 49, '#c0d6c4a6', 11);
    label(c, ['HARBOR APPROACH', 'REEF PASSAGE', 'VOLCANIC SOUND', 'FORTRESS WATERS'][mission] || 'OPEN WATER', 39, 65, '#9ebeb67d', 9);
  }
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
  KB.drawShip = function (ship) {
    drawShip(KB.ctx, ship, KB.reduced ? 0 : num(KB.state.time, 0));
  };
  KB.render = function () {
    var c = KB.ctx, canvas = KB.canvas, state = KB.state, view = KB.view || {};
    if (!c || !canvas || !state) return;
    var W = num(KB.W, 1280), H = num(KB.H, 800);
    var dpr = Math.max(0.1, num(view.dpr, 1)), scale = Math.max(0.001, num(view.scale, 1));
    var mission = clamp(Math.floor(num(state.mission, 0)), 0, 3);
    var sector = (KB.sectors || [])[mission] || { land: [], route: [] };
    var t = KB.reduced ? 0 : num(state.time, 0);
    var shake = KB.reduced ? 0 : Math.max(0, num(state.cameraShake, 0));
    // Reset every frame: resize and previous caller transforms cannot accumulate.
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.setLineDash([]);
    c.shadowBlur = 0; c.lineCap = 'round'; c.lineJoin = 'round';
    c.fillStyle = '#06141e'; c.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    c.save();
    c.translate(num(view.ox, 0) + Math.sin(t * 71) * shake, num(view.oy, 0) + Math.cos(t * 67) * shake);
    c.scale(scale, scale);
    c.beginPath(); c.rect(0, 0, W, H); c.clip();
    water(c, sector, mission, t, W, H);
    objectives(c, sector, state, t);
    (state.wakes || []).forEach(function (w) { wake(c, w); });
    broadside(c, state.ship, state);
    terrain(c, sector, mission, W, H);
    (state.salvage || []).forEach(function (s) { salvage(c, s, t); });
    (state.hazards || []).forEach(function (h) { hazard(c, h); });
    // Sort a copy for overlapping shadows. Simulation array order stays untouched.
    var vessels = (state.enemies || []).slice();
    if (state.convoy) vessels.push(state.convoy);
    if (state.ship) vessels.push(state.ship);
    vessels.sort(function (a, b) { return a.y - b.y; });
    vessels.forEach(function (s) { drawShip(c, s, t); });
    effects(c, state);
    compass(c, W); minimap(c, state, sector, W, H);
    c.restore();
  };
})();
