/* Original procedural naval art: render-terrain.js. No external assets. */
(function () {
  'use strict';
  var KB = window.KB;
  var { TAU, C, num, noise, polygon, line, circle, label } = KB.art;
  var terrainCache = null;
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
  Object.assign(KB.art, { water, terrain });
})();
