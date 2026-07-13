// Orbital Maintenance System - index.js
// Space station maintenance simulator - ULTIMATE COMPLETE EDITION v4.1

console.log("=".repeat(80));
console.log(" ".repeat(25) + "🚀 ORBITAL MAINTENANCE v4.1");
console.log(" ".repeat(18) + "ULTIMATE COMPLETE EDITION - Orbital Station Aurora");
console.log("=".repeat(80));
console.log("Low Earth Orbit • 412km altitude");
console.log("You are the sole Maintenance Engineer on duty.");
console.log("The fate of the station and its 42 crew members rests in your hands.\n");

// ========================
// CORE SYSTEMS
// ========================

class LifeSupportSystem {
  constructor() { this.oxygen = { level: 98, status: "nominal" }; }
  consume(amount = 9) { this.oxygen.level = Math.max(3, this.oxygen.level - amount); }
  generate(amount = 7) { this.oxygen.level = Math.min(100, this.oxygen.level + amount); }
  getStatus() { return this.oxygen; }
}

class PowerSystem {
  constructor() { this.power = { level: 87, status: "nominal", generation: 0 }; }
  consume(amount = 8) { this.power.level = Math.max(3, this.power.level - amount); }
  generate(amount = 9) { this.power.level = Math.min(100, this.power.level + amount); }
  getStatus() { return this.power; }
}

class HullSystem {
  constructor() { this.hull = { integrity: 94, status: "stable", breaches: 0 }; }
  takeDamage(amount) {
    this.hull.integrity = Math.max(4, this.hull.integrity - amount);
    if (Math.random() < 0.3) this.hull.breaches++;
  }
  repair(amount = 22) { this.hull.integrity = Math.min(100, this.hull.integrity + amount); }
  getStatus() { return this.hull; }
}

class CrewSystem {
  constructor() { this.crew = { population: 42, morale: 78 }; }
  consumeMorale(amount = 7) { this.crew.morale = Math.max(5, this.crew.morale - amount); }
  boostMorale(amount = 18) { this.crew.morale = Math.min(100, this.crew.morale + amount); }
  getStatus() { return this.crew; }
}

// ========================
// GAME ENGINE
// ========================

class OrbitalMaintenanceGame {
  constructor(difficulty = "normal") {
    this.difficulty = difficulty;
    this.lifeSupport = new LifeSupportSystem();
    this.power = new PowerSystem();
    this.hull = new HullSystem();
    this.crew = new CrewSystem();
    this.upgradesPurchased = 0;
    this.alertLog = [];
    this.cycle = 0;
    this.gameOver = false;
  }

  triggerAlert(level, message, emoji = "⚠️") {
    const alert = `[CYCLE ${this.cycle.toString().padStart(2,'0')}] ${emoji} ${level}: ${message}`;
    this.alertLog.push(alert);
    console.log(alert);
  }

  checkSystemHealth() {
    console.log("\n" + "─".repeat(72));
    console.log(`📡 SYSTEM STATUS — ${this.difficulty.toUpperCase()} MODE`);
    console.log("─".repeat(72));
    
    const o = this.lifeSupport.getStatus();
    const p = this.power.getStatus();
    const h = this.hull.getStatus();
    const c = this.crew.getStatus();

    console.log(`💨 OXYGEN   ${o.status.padEnd(8)} ${o.level.toString().padStart(3)}%`);
    console.log(`☀️  POWER    ${p.status.padEnd(8)} ${p.level.toString().padStart(3)}%`);
    console.log(`🛡️  HULL     ${h.status.padEnd(8)} ${h.integrity.toString().padStart(3)}%`);
    console.log(`👥 CREW     ${c.population} | Morale: ${c.morale}%`);
    console.log("─".repeat(72));
  }

  showCommands() {
    console.log("\n🛠️  Available Commands:");
    console.log("  oxygen / o2 → Emergency oxygen boost");
    console.log("  power       → Overcharge solar arrays");
    console.log("  repair      → Deploy repair drones");
    console.log("  boost       → Improve crew morale");
    console.log("  status      → Show full system status");
    console.log("  next        → Advance to next cycle");
    console.log("  help        → Show commands");
    console.log("  quit        → End current shift");
  }

  manualAction(action) {
    console.log(`\n> ${action.toUpperCase()}`);
    switch(action.toLowerCase()) {
      case "oxygen":
      case "o2":
        this.lifeSupport.generate(25);
        console.log("💨 Massive oxygen injection complete.");
        break;
      case "power":
        this.power.generate(22);
        console.log("☀️ Solar arrays overclocked.");
        break;
      case "repair":
        this.hull.repair(22);
        console.log("🛠️ Repair drones deployed.");
        break;
      case "boost":
        this.crew.boostMorale(18);
        console.log("👥 Crew morale restored.");
        break;
      case "status":
        this.checkSystemHealth();
        return;
      default:
        console.log("❌ Unknown command. Type 'help' for available commands.");
    }
  }

  runMaintenanceCycle() {
    this.cycle++;
    console.log(`\n🔧 === CYCLE ${this.cycle} ===`);

    const mult = this.difficulty === "hard" ? 1.4 : this.difficulty === "easy" ? 0.7 : 1.0;

    this.lifeSupport.consume(9 * mult);
    this.power.consume(8 * mult);
    this.lifeSupport.generate(7);
    this.power.generate(9);

    const roll = Math.random();
    if (roll < 0.28) {
      this.triggerAlert("WARNING", "Micrometeorite swarm detected", "💥");
      this.hull.takeDamage(9 * mult);
    } else if (roll < 0.48) {
      this.triggerAlert("WARNING", "Solar flare interference", "☀️");
      this.power.consume(14);
    } else if (roll < 0.65) {
      this.triggerAlert("INFO", "Crew reports unusual noises in sector 7", "👥");
      this.crew.consumeMorale(6);
    } else if (roll < 0.78) {
      this.triggerAlert("INFO", "Minor pressure fluctuation detected", "🌬️");
    }

    this.checkSystemHealth();

    const o = this.lifeSupport.getStatus();
    const p = this.power.getStatus();
    const h = this.hull.getStatus();
    const c = this.crew.getStatus();

    if (o.level <= 10 || p.level <= 8 || h.integrity <= 15 || c.morale <= 12) {
      this.gameOver = true;
      this.triggerAlert("CRITICAL", "CATASTROPHIC SYSTEM FAILURE", "🚨");
    }
  }

  calculateScore() {
    const o = this.lifeSupport.getStatus().level;
    const p = this.power.getStatus().level;
    const h = this.hull.getStatus().integrity;
    const m = this.crew.getStatus().morale;
    return Math.floor(o * 1.3 + p * 1.2 + h * 1.7 + m * 1.0 + this.upgradesPurchased * 35);
  }

  showEndReport() {
    const score = this.calculateScore();
    console.log("\n" + "=".repeat(75));
    console.log("           MISSION REPORT");
    console.log("=".repeat(75));
    console.log(`Difficulty       : ${this.difficulty.toUpperCase()}`);
    console.log(`Cycles Survived  : ${this.cycle}`);
    console.log(`Final Score      : ${score}/1200`);
    console.log(`Upgrades Bought  : ${this.upgradesPurchased}`);
    console.log(`Final Hull       : ${this.hull.getStatus().integrity}%`);
    console.log(`Final Morale     : ${this.crew.getStatus().morale}%`);
    console.log("=".repeat(75));
  }

  showCredits() {
    console.log("\n" + "=".repeat(75));
    console.log(" ".repeat(28) + "THANK YOU, ENGINEER");
    console.log("=".repeat(75));
    console.log("Station Aurora remains operational.");
    console.log("The crew is safe thanks to your dedication.");
    console.log("Thank you for playing Orbital Maintenance.");
    console.log("Built as a demonstration project for Base Layer 2.");
    console.log("=".repeat(75));
  }
}

// ========================
// GAME LAUNCH
// ========================

function selectDifficulty() {
  console.log("\nSelect Difficulty:");
  console.log("1. Easy");
  console.log("2. Normal");
  console.log("3. Hard");
  let choice = prompt("Enter 1, 2 or 3: ");
  switch(choice) {
    case "1": return "easy";
    case "3": return "hard";
    default: return "normal";
  }
}

function startGame() {
  const difficulty = selectDifficulty();
  const game = new OrbitalMaintenanceGame(difficulty);
  
  console.log(`\n=== SHIFT START — ${difficulty.toUpperCase()} MODE ===`);
  game.triggerAlert("INFO", "You are now in command of Orbital Station Aurora.", "🚀");
  game.showCommands();

  let running = true;

  while (running && !game.gameOver) {
    const input = prompt("\nEnter command: ");
    if (!input) continue;

    const cmd = input.trim().toLowerCase();

    if (cmd === "quit" || cmd === "exit") running = false;
    else if (cmd === "next") game.runMaintenanceCycle();
    else if (cmd === "help") game.showCommands();
    else game.manualAction(cmd);
  }

  if (game.gameOver) console.log("\n💥 STATION LOST - Mission Failed");
  else console.log("\n✅ Shift concluded.");

  game.showEndReport();
  game.showCredits();

  if (confirm("Start a new shift?")) {
    startGame();
  } else {
    console.log("\nThanks for playing Orbital Maintenance!");
    console.log("=== SIMULATION ENDED ===");
  }
}

// Launch the game
startGame();
