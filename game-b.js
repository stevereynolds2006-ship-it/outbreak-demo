function raid() {
  if (state.kits < 1 || state.scene === "horde") return false;
  state.kits -= 1; hud(); closeMenu();
  state.scene = "horde";
  state.hordeUntil = performance.now() + 9000;
  state.swingUntil = 0;
  state.x = 220; state.y = 430; state.facing = 1; state.walking = true;
  const spots = [[620,370,0.04,0.02],[700,400,-0.03,0.022],[760,430,0.035,-0.018],[820,390,-0.042,0.016],[660,460,0.028,-0.024]];
  walkers.forEach((z, i) => { z.x = spots[i][0]; z.y = spots[i][1]; z.vx = spots[i][2]; z.vy = spots[i][3]; z.hp = 3; });
  return true;
}
function finishRaid() {
  const i = roll();
  state.inventory[i] += 1; state.last = i; state.day += 1;
  state.scene = "yard"; state.x = 280; state.y = 400; state.walking = false;
  hud(); openMenu("reward", i);
}
function redeem(i) {
  const o = OUTCOMES[i];
  if (state.inventory[i] > 0 && o.reward > 0) { state.inventory[i] -= 1; state.rf += o.reward; hud(); return true; }
  return false;
}
document.getElementById("modal").addEventListener("click", (e) => {
  const t = e.target;
  if (t.id === "close" || t.id === "keep") closeMenu();
  if (t.id === "doBuy") { buy(1); openMenu("buy"); }
  if (t.id === "doBuy3") { buy(3); openMenu("buy"); }
  if (t.id === "doRaid" || t.id === "raidAgain") raid();
  if (t.dataset.buyw != null) {
    const i = Number(t.dataset.buyw), w = WEAPONS[i];
    if (!state.owned[i] && state.rf >= w.cost) { state.rf -= w.cost; state.owned[i] = 1; state.equipped = i; hud(); }
    openMenu("arms");
  }
  if (t.dataset.equip != null) { const i = Number(t.dataset.equip); if (state.owned[i]) state.equipped = i; hud(); openMenu("arms"); }
});
window.addEventListener("keydown", e => {
  const map = { ArrowUp:"up", ArrowDown:"down", ArrowLeft:"left", ArrowRight:"right", w:"up", a:"left", s:"down", d:"right", W:"up", A:"left", S:"down", D:"right" };
  if (map[e.key]) { keys.add(map[e.key]); e.preventDefault(); }
  if ((e.key === "e" || e.key === "E") && !state.menu) openMenu(near()?.id || "buy");
  if (e.key === "Escape") closeMenu();
});
window.addEventListener("keyup", e => {
  const map = { ArrowUp:"up", ArrowDown:"down", ArrowLeft:"left", ArrowRight:"right", w:"up", a:"left", s:"down", d:"right", W:"up", A:"left", S:"down", D:"right" };
  if (map[e.key]) keys.delete(map[e.key]);
});
canvas.addEventListener("pointerdown", e => {
  if (state.menu) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (960 / r.width);
  const y = (e.clientY - r.top) * (640 / r.height);
  if (state.scene === "horde") {
    const z = walkers.find(w => w.hp > 0 && Math.hypot(x - w.x, y - w.y) < 50);
    if (z) hitZombie(z);
    state.target = { x, y }; return;
  }
  const s = STATIONS.find(st => Math.hypot(x - st.x, y - st.y) < 90);
  if (s) { openMenu(s.id); return; }
  state.target = { x, y };
});
function blocked(x, y) {
  const nx = (x - 490) / 295, ny = (y - 352) / 148;
  if (Math.abs(nx) + Math.abs(ny) > 1.02) return true;
  return false;
}
let last = performance.now();
function tick(now) {
  const dt = Math.min(40, now - last); last = now;
  if (state.scene === "horde") {
    let vx = 0, vy = 0;
    if (keys.has("left")) vx -= 1; if (keys.has("right")) vx += 1;
    if (keys.has("up")) vy -= 1; if (keys.has("down")) vy += 1;
    if (state.target) {
      const dx = state.target.x - state.x, dy = state.target.y - state.y, d = Math.hypot(dx, dy);
      if (d < 8) state.target = null; else { vx = dx / d; vy = dy / d; }
    }
    const len = Math.hypot(vx, vy); state.walking = len > 0;
    if (len) {
      vx /= len; vy /= len; if (vx) state.facing = vx > 0 ? 1 : -1;
      const speed = 0.28 * dt;
      const nx = state.x + vx * speed, ny = state.y + vy * speed;
      if (nx > 80 && nx < 900) state.x = nx;
      if (ny > 280 && ny < 560) state.y = ny;
    }
    for (const z of walkers) {
      if (z.hp <= 0) continue;
      z.x += z.vx * dt; z.y += z.vy * dt;
      if (z.x < 520 || z.x > 880) z.vx *= -1;
      if (z.y < 340 || z.y > 500) z.vy *= -1;
      if (now > (state.swingUntil || 0) && Math.hypot(state.x - z.x, state.y - z.y) < 58) hitZombie(z);
    }
    if (walkers.every(z => z.hp <= 0) || now >= state.hordeUntil) finishRaid();
    draw(now); requestAnimationFrame(tick); return;
  }
  if (!state.menu) {
    let vx = 0, vy = 0;
    if (keys.has("left")) vx -= 1; if (keys.has("right")) vx += 1;
    if (keys.has("up")) vy -= 1; if (keys.has("down")) vy += 1;
    if (state.target) {
      const dx = state.target.x - state.x, dy = state.target.y - state.y, d = Math.hypot(dx, dy);
      if (d < 8) state.target = null; else { vx = dx / d; vy = dy / d; }
    }
    const len = Math.hypot(vx, vy); state.walking = len > 0;
    if (len) {
      vx /= len; vy /= len; if (vx) state.facing = vx > 0 ? 1 : -1;
      const speed = 0.28 * dt;
      const nx = state.x + vx * speed, ny = state.y + vy * speed;
      if (!blocked(nx, state.y)) state.x = nx;
      if (!blocked(state.x, ny)) state.y = ny;
    }
  } else state.walking = false;
  draw(now); requestAnimationFrame(tick);
}
