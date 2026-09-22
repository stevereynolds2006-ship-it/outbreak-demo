function draw(now) {
  function zombie(x, y, t, tint) {
    const limp = Math.floor(t / 180) % 2;
    ctx.save(); ctx.translate(x, y - limp);
    ctx.fillStyle = tint || "#5a7a48"; ctx.fillRect(-14, -36, 28, 36);
    ctx.fillStyle = "#3a5230"; ctx.fillRect(-10, -32, 8, 8); ctx.fillRect(2, -32, 8, 8);
    ctx.fillStyle = "#8a2020"; ctx.fillRect(-6, -22, 12, 6);
    ctx.fillStyle = "#3a5230"; ctx.fillRect(-12, -2, 8, 14 + limp * 4); ctx.fillRect(4, -2, 8, 14 + (1 - limp) * 4);
    ctx.restore();
  }
  if (state.scene === "horde") {
    if (hordeImg.complete && hordeImg.naturalWidth) ctx.drawImage(hordeImg, 0, 0, 960, 640);
    else { ctx.fillStyle = "#2a0c0c"; ctx.fillRect(0, 0, 960, 640); }
    ctx.fillStyle = "#111"; ctx.fillRect(200, 588, 560, 36);
    ctx.strokeStyle = "#c8b48a"; ctx.strokeRect(200, 588, 560, 36);
    ctx.fillStyle = "#f3ead8"; ctx.font = "13px monospace"; ctx.textAlign = "center";
    ctx.fillText("Kill zombies to get haul", 480, 611);
    walkers.forEach((z, i) => {
      if (z.hp <= 0) {
        ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(1.2);
        ctx.fillStyle = z.tint; ctx.fillRect(-18, -8, 36, 16);
        ctx.fillStyle = "#3a5230"; ctx.fillRect(-16, -6, 8, 8); ctx.restore();
      } else zombie(z.x, z.y, now + i * 220, z.tint);
    });
  } else {
    if (yardImg.complete && yardImg.naturalWidth) ctx.drawImage(yardImg, 0, 0, 960, 640);
    else { ctx.fillStyle = "#1a1014"; ctx.fillRect(0, 0, 960, 640); }
    ctx.fillStyle = "#6a5040"; ctx.fillRect(102, 488, 54, 42);
    ctx.fillStyle = "#8a6a48"; ctx.fillRect(102, 481, 54, 12);
    ctx.strokeStyle = "#1a100c"; ctx.strokeRect(102, 481, 54, 49);
    const n = near();
    ctx.font = "11px monospace"; ctx.textAlign = "center";
    const marks = [{s:STATIONS[0], extraY:-78},{s:STATIONS[1], extraY:-78},{s:STATIONS[2], extraY:-62}];
    for (const m of marks) {
      const s = m.s;
      ctx.fillStyle = n === s ? "#ccff00" : "#f3ead8";
      const tw = Math.max(118, ctx.measureText(s.label).width + 16);
      ctx.fillRect(s.x - tw / 2, s.y + m.extraY, tw, 20);
      ctx.strokeStyle = "#111"; ctx.strokeRect(s.x - tw / 2, s.y + m.extraY, tw, 20);
      ctx.fillStyle = "#111"; ctx.fillText(s.label, s.x, s.y + m.extraY + 14);
    }
    ctx.fillStyle = "#111"; ctx.fillRect(200, 588, 560, 36);
    ctx.strokeStyle = "#c8b48a"; ctx.strokeRect(200, 588, 560, 36);
    ctx.fillStyle = "#f3ead8"; ctx.font = "13px monospace"; ctx.textAlign = "center";
    ctx.fillText("Tap locker  ·  gate  ·  weapons crate", 480, 611);
  }
  const px = Math.round(state.x), py = Math.round(state.y);
  const bob = state.walking && !state.reduced ? Math.floor(now / 110) % 2 : 0;
  ctx.save(); ctx.translate(px, py - 8 - bob); ctx.scale(state.facing, 1);
  ctx.fillStyle = "#fff"; ctx.fillRect(-16, -38, 32, 40);
  ctx.fillStyle = "#111";
  ctx.fillRect(-11, -33, 22, 9); ctx.fillRect(-9, -24, 18, 18);
  ctx.fillRect(-11, -6, 9, 13); ctx.fillRect(2, -6, 9, 13);
  ctx.fillRect(-11, 7, 9, state.walking ? 10 : 13);
  ctx.fillRect(2, state.walking ? 5 : 7, 9, 13);
  ctx.fillStyle = "#f3ead8"; ctx.fillRect(10, -8, 8, 8);
  if (state.equipped === 0) { ctx.fillStyle = "#8a7a62"; ctx.fillRect(16, -28, 6, 36); ctx.fillStyle = "#c8b48a"; ctx.fillRect(15, -6, 8, 8); }
  if (state.equipped === 1) { ctx.fillStyle = "#6a6e72"; ctx.fillRect(16, -32, 7, 40); ctx.fillRect(12, -34, 16, 7); ctx.fillStyle = "#c8b48a"; ctx.fillRect(15, -8, 8, 8); }
  if (state.equipped === 2) { ctx.fillStyle = "#6a4020"; ctx.fillRect(17, -10, 6, 22); ctx.fillStyle = "#b8bcc0"; ctx.beginPath(); ctx.moveTo(12, -28); ctx.lineTo(28, -16); ctx.lineTo(26, -8); ctx.lineTo(10, -20); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#c8b48a"; ctx.fillRect(15, -8, 8, 8); }
  if (state.equipped === 3) { ctx.fillStyle = "#1a1a18"; ctx.fillRect(14, -16, 34, 9); ctx.fillRect(16, -10, 8, 14); ctx.fillStyle = "#3a3a38"; ctx.fillRect(42, -18, 8, 13); ctx.fillStyle = "#c8b48a"; ctx.fillRect(15, -8, 8, 8); }
  ctx.restore();
}
hud();
requestAnimationFrame(tick);
