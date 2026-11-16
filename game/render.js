/* Compose independent terrain, vessels, effects and tactical charts. */
(function () {
  'use strict';
  var KB = window.KB;
  var { num, clamp, water, terrain, objectives, wake, broadside,
    salvage, hazard, drawShip, effects, compass, minimap } = KB.art;
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