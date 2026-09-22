const OUTCOMES = [
  { name:"Empty Can", chance:15, chanceBps:1500, reward:0, mark:"C" },
  { name:"Scrap Metal", chance:28, chanceBps:2800, reward:0.25, mark:"S" },
  { name:"Medkit", chance:22, chanceBps:2200, reward:0.50, mark:"+" },
  { name:"Ammo Cache", chance:14, chanceBps:1400, reward:0.75, mark:"A" },
  { name:"Fuel Drum", chance:9, chanceBps:900, reward:1.50, mark:"F" },
  { name:"Safehouse Key", chance:6, chanceBps:600, reward:2.50, mark:"K" },
  { name:"Gold Tooth", chance:4, chanceBps:400, reward:5, mark:"G" },
  { name:"Genesis Relic", chance:2, chanceBps:200, reward:10, mark:"R" }
];
const PRICE = 1, MAX = 10;
const state = {
  x: 280, y: 400, facing: 1, walking: false, target: null,
  rf: 50, kits: 3, stake: 500, inventory: OUTCOMES.map(() => 0),
  muted: true, reduced: false,
  day: 19, menu: null, last: null, scene: "yard", hordeUntil: 0,
  owned: [1, 0, 0, 0], equipped: 0
};
const WEAPONS = [
  { name: "Pipe", cost: 0, mark: "|" },
  { name: "Crowbar", cost: 2, mark: "c" },
  { name: "Hatchet", cost: 4, mark: "h" },
  { name: "Shotgun", cost: 8, mark: "s" }
];
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const keys = new Set();
const STATIONS = [
  { id:"buy", label:"Supply locker", x:190, y:410, r:140 },
  { id:"raid", label:"Outbreak gate", x:800, y:270, r:140 },
  { id:"arms", label:"Weapons crate", x:130, y:505, r:120 }
];
const yardImg = new Image(); yardImg.src = "yard.jpg";
const hordeImg = new Image(); hordeImg.src = "horde.jpg";
const walkers = [
  { x: 620, y: 370, vx: 0.04, vy: 0.02, tint: "#6a8a50", hp: 3 },
  { x: 700, y: 400, vx: -0.03, vy: 0.022, tint: "#4a6238", hp: 3 },
  { x: 760, y: 430, vx: 0.035, vy: -0.018, tint: "#5a7040", hp: 3 },
  { x: 820, y: 390, vx: -0.042, vy: 0.016, tint: "#6e7a40", hp: 3 },
  { x: 660, y: 460, vx: 0.028, vy: -0.024, tint: "#3e5a30", hp: 3 }
];
function dmg() { return [1, 1, 2, 3][state.equipped] || 1; }
function hitZombie(z) { if (!z || z.hp <= 0) return; z.hp -= dmg(); state.swingUntil = performance.now() + 280; }
function near() { return STATIONS.find(s => Math.hypot(state.x - s.x, state.y - s.y) <= s.r) || null; }
function fmt(n) { return Number(n).toLocaleString(undefined, { minimumFractionDigits: n%1 ? 2 : 0, maximumFractionDigits: 2 }); }
function hud() {
  document.getElementById("stat").textContent =
    "Simulated · " + fmt(state.rf) + " RF · " + state.kits + " kits · " + WEAPONS[state.equipped].name;
}
function roll() {
  let n = Math.random() * 100, acc = 0;
  for (let i = 0; i < OUTCOMES.length; i++) { acc += OUTCOMES[i].chance; if (n < acc) return i; }
  return OUTCOMES.length - 1;
}
function openMenu(kind, extra) {
  state.menu = kind; state.target = null;
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  let body = "";
  if (kind === "buy") {
    body = "<h2>Supply locker</h2><p>Raid Kit = 1 RF</p><button class='primary' id='doBuy'>Buy one · 1 RF</button><button id='doBuy3'>Buy three · 3 RF</button><button id='close'>Close</button>";
  } else if (kind === "arms") {
    const rows = WEAPONS.map((w,i) => {
      const have = state.owned[i], on = state.equipped === i;
      const btn = on ? "<button disabled>Equipped</button>" : have ? "<button data-equip='"+i+"'>Equip</button>" : "<button data-buyw='"+i+"'>Buy · "+w.cost+" RF</button>";
      return "<div class='item'><span><strong>"+w.name+"</strong></span>"+btn+"</div>";
    }).join("");
    body = "<h2>Weapons crate</h2>"+rows+"<button id='close'>Close</button>";
  } else if (kind === "raid") {
    body = "<h2>Outbreak gate</h2><p>"+state.kits+" kits ready. Kill walkers, then haul rolls.</p><button class='primary' id='doRaid'>Send Friend through the gate</button><button id='close'>Close</button>";
  } else if (kind === "reward") {
    const o = OUTCOMES[extra];
    body = "<div class='reward'><h2>"+o.name+"</h2><p>"+fmt(o.reward)+" RF</p><button class='primary' id='keep'>Keep haul</button><button id='raidAgain'>Raid again</button></div>";
  } else {
    body = "<h2>"+kind+"</h2><button id='close'>Close</button>";
  }
  modal.innerHTML = "<div class='sheet'>"+body+"</div>";
}
function closeMenu() {
  state.menu = null;
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modal").innerHTML = "";
}
function buy(n) {
  n = Math.min(n, Math.floor(state.rf / PRICE));
  if (n < 1) return;
  state.rf -= n * PRICE; state.kits += n; hud();
}
