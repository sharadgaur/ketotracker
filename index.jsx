import { useState, useEffect } from "react";

const PROFILE = { calories: 1900, netCarbs: 25, protein: 150, fat: 120 };
const HEALTH = { stepsGoal: 10000, stepsAvg: 8614, rhr: 64, activeCalAvg: 612, workoutHRMax: 176 };

const DEFAULT_FOODS = [
  { name: "Boiled Egg", cal: 70, fat: 5, protein: 6, carbs: 0.5, emoji: "🥚" },
  { name: "Ghee (1 tsp)", cal: 40, fat: 4.5, protein: 0, carbs: 0, emoji: "🧈" },
  { name: "Cottage Cheese (1/2 cup)", cal: 110, fat: 5, protein: 12, carbs: 4, emoji: "🥛" },
  { name: "Almonds (10)", cal: 70, fat: 6, protein: 3, carbs: 2, emoji: "🌰" },
  { name: "Walnuts (10)", cal: 65, fat: 6, protein: 2, carbs: 1, emoji: "🫘" },
  { name: "Avocado (1/2)", cal: 120, fat: 11, protein: 1, carbs: 2, emoji: "🥑" },
  { name: "Paneer (100g)", cal: 265, fat: 20, protein: 18, carbs: 3, emoji: "🧀" },
  { name: "Chicken (150g)", cal: 248, fat: 5, protein: 47, carbs: 0, emoji: "🍗" },
  { name: "Salmon (150g)", cal: 280, fat: 13, protein: 39, carbs: 0, emoji: "🐟" },
  { name: "Keto Tortilla", cal: 70, fat: 2.5, protein: 3, carbs: 2, emoji: "🫓" },
  { name: "Quest Bar", cal: 170, fat: 6, protein: 20, carbs: 4, emoji: "🍫" },
  { name: "Bhindi Sabji (ghee)", cal: 120, fat: 9, protein: 2, carbs: 4, emoji: "🥬" },
  { name: "Lauki Sabji (ghee)", cal: 100, fat: 9, protein: 1, carbs: 2, emoji: "🥒" },
  { name: "Karela Sabji (ghee)", cal: 125, fat: 9, protein: 2, carbs: 4, emoji: "🌿" },
  { name: "Cauliflower (ghee)", cal: 115, fat: 9, protein: 2, carbs: 3, emoji: "🌸" },
  { name: "Eggplant (ghee)", cal: 110, fat: 9, protein: 1, carbs: 3, emoji: "🍆" },
  { name: "Cabbage (ghee)", cal: 110, fat: 9, protein: 1, carbs: 3, emoji: "🥗" },
  { name: "Zucchini (ghee)", cal: 100, fat: 9, protein: 1, carbs: 2, emoji: "🥗" },
  { name: "Egg Omelette (2egg+ghee+cheese)", cal: 340, fat: 29, protein: 19, carbs: 1.5, emoji: "🍳" },
  { name: "Egg Bhurji (3egg+ghee)", cal: 320, fat: 25, protein: 18, carbs: 2, emoji: "🍳" },
  { name: "Keto Pizza (tortilla+cheese)", cal: 344, fat: 22.5, protein: 18.6, carbs: 8.3, emoji: "🍕" },
  { name: "Jif PB No Sugar (2 tbsp)", cal: 190, fat: 17, protein: 8, carbs: 4, emoji: "🥜" },
  { name: "Beyond Meat Patty", cal: 160, fat: 10, protein: 12, carbs: 3, emoji: "🍔" },
  { name: "Zena Greens", cal: 35, fat: 0, protein: 3, carbs: 2, emoji: "🥗" },
  { name: "Black Coffee", cal: 5, fat: 0, protein: 0, carbs: 0, emoji: "☕" },
  { name: "Green Tea", cal: 2, fat: 0, protein: 0, carbs: 0, emoji: "🍵" },
];

const MEALS = ["Breakfast", "Pre-Gym", "Post-Workout", "Lunch", "Snack", "Dinner"];
const todayKey = () => new Date().toISOString().split("T")[0];

function Ring({ value, max, label, color, unit }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 26, cx = 30, cy = 30, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <svg width={60} height={60}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={5} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize={9} fontWeight="700">{Math.round(pct)}%</text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#f1f5f9", fontSize: 10, fontWeight: 700 }}>{label}</div>
        <div style={{ color: "#64748b", fontSize: 9 }}>{Math.round(value)}/{max}{unit}</div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{value.toLocaleString()}/{max.toLocaleString()}</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 4, height: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function KetoTracker() {
  const [entries, setEntries] = useState({});
  const [customFoods, setCustomFoods] = useState([]);
  const [tab, setTab] = useState("today");
  const [meal, setMeal] = useState("Breakfast");
  const [search, setSearch] = useState("");
  const [foodSection, setFoodSection] = useState("quick");
  const [showForm, setShowForm] = useState(false);
  const [custom, setCustom] = useState({ name: "", cal: "", fat: "", protein: "", carbs: "", emoji: "🍽️" });
  const [weight, setWeight] = useState({});
  const [bp, setBp] = useState({});
  const [steps, setSteps] = useState({});
  const [weightInput, setWeightInput] = useState("");
  const [bpInput, setBpInput] = useState({ sys: "", dia: "" });
  const [stepsInput, setStepsInput] = useState("");
  const [toast, setToast] = useState("");
  const [toastErr, setToastErr] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const e = await window.storage.get("kt_entries"); if (e) setEntries(JSON.parse(e.value));
        const w = await window.storage.get("kt_weight"); if (w) setWeight(JSON.parse(w.value));
        const b = await window.storage.get("kt_bp"); if (b) setBp(JSON.parse(b.value));
        const s = await window.storage.get("kt_steps"); if (s) setSteps(JSON.parse(s.value));
        const cf = await window.storage.get("kt_custom"); if (cf) setCustomFoods(JSON.parse(cf.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) window.storage.set("kt_entries", JSON.stringify(entries)).catch(() => {}); }, [entries, loaded]);
  useEffect(() => { if (loaded) window.storage.set("kt_weight", JSON.stringify(weight)).catch(() => {}); }, [weight, loaded]);
  useEffect(() => { if (loaded) window.storage.set("kt_bp", JSON.stringify(bp)).catch(() => {}); }, [bp, loaded]);
  useEffect(() => { if (loaded) window.storage.set("kt_steps", JSON.stringify(steps)).catch(() => {}); }, [steps, loaded]);
  useEffect(() => { if (loaded) window.storage.set("kt_custom", JSON.stringify(customFoods)).catch(() => {}); }, [customFoods, loaded]);

  const showToast = (msg, err = false) => { setToast(msg); setToastErr(err); setTimeout(() => setToast(""), 2500); };

  const today = todayKey();
  const todayEntries = entries[today] || [];
  const totals = todayEntries.reduce((a, e) => ({ cal: a.cal+e.cal, fat: a.fat+e.fat, protein: a.protein+e.protein, carbs: a.carbs+e.carbs }), { cal:0, fat:0, protein:0, carbs:0 });

  const addFood = (food) => {
    const entry = { ...food, meal, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setEntries(prev => ({ ...prev, [today]: [...(prev[today] || []), entry] }));
    showToast(`✅ ${food.name} → ${meal}`);
  };

  // BUG FIX: Save to customFoods library so it appears in My Foods tab
  const saveCustomFood = () => {
    if (!custom.name || !custom.cal) { showToast("⚠️ Name & calories required!", true); return; }
    const food = { name: custom.name, cal: +custom.cal, fat: +custom.fat||0, protein: +custom.protein||0, carbs: +custom.carbs||0, emoji: custom.emoji||"🍽️" };
    setCustomFoods(prev => [food, ...prev]); // Add to library
    addFood(food); // Also log today
    setCustom({ name: "", cal: "", fat: "", protein: "", carbs: "", emoji: "🍽️" });
    setShowForm(false);
    showToast(`⭐ "${food.name}" saved to My Foods!`);
  };

  const removeCustomFood = (i) => { setCustomFoods(prev => prev.filter((_, idx) => idx !== i)); showToast("🗑️ Removed from My Foods"); };
  const removeEntry = (id) => { setEntries(prev => ({ ...prev, [today]: (prev[today]||[]).filter(e => e.id !== id) })); showToast("🗑️ Removed", true); };
  const saveWeight = () => { if (!weightInput) return; setWeight(prev => ({ ...prev, [today]: +weightInput })); showToast(`⚖️ ${weightInput} lb saved!`); setWeightInput(""); };
  const saveBP = () => { if (!bpInput.sys||!bpInput.dia) return; setBp(prev => ({ ...prev, [today]: `${bpInput.sys}/${bpInput.dia}` })); showToast(`🩺 ${bpInput.sys}/${bpInput.dia} saved!`); setBpInput({ sys:"", dia:"" }); };
  const saveSteps = () => { if (!stepsInput) return; setSteps(prev => ({ ...prev, [today]: +stepsInput })); showToast(`👣 ${parseInt(stepsInput).toLocaleString()} steps saved!`); setStepsInput(""); };

  const mealGroups = MEALS.map(m => ({ meal: m, items: todayEntries.filter(e => e.meal === m) })).filter(g => g.items.length > 0);
  const filteredDefault = DEFAULT_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCustom = customFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().split("T")[0];
    const de = entries[k] || [];
    return { key: k, label: d.toLocaleDateString("en", { weekday: "short" }), cal: de.reduce((a,e) => a+e.cal, 0), weight: weight[k], bp: bp[k], steps: steps[k] };
  });

  const latestW = Object.values(weight).slice(-1)[0] || 187;
  const goalPct = Math.max(0, Math.min(((187 - latestW) / (187 - 168)) * 100, 100));

  const S = {
    app: { background: "#0a0f1e", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9", maxWidth: 480, margin: "0 auto", paddingBottom: 82 },
    header: { background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 100 },
    tabs: { display: "flex", background: "#0f172a", borderBottom: "1px solid #1e293b", position: "sticky", top: 63, zIndex: 99 },
    tab: (a) => ({ flex: 1, padding: "8px 2px 6px", fontSize: 9, fontWeight: a?700:400, color: a?"#22c55e":"#64748b", background: "none", border: "none", borderBottom: a?"2px solid #22c55e":"2px solid transparent", cursor: "pointer", lineHeight: 1.4 }),
    sec: { padding: "10px 14px" },
    card: { background: "#0f172a", borderRadius: 12, padding: 12, marginBottom: 10, border: "1px solid #1e293b" },
    input: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "9px 10px", color: "#f1f5f9", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" },
    btn: (c) => ({ background: c||"#22c55e", color: ["#ef4444","#3b82f6","#f59e0b"].includes(c)?"#fff":"#0a0f1e", border: "none", borderRadius: 8, padding: "9px 12px", fontWeight: 700, fontSize: 11, cursor: "pointer" }),
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
    fc: { background: "#1e293b", borderRadius: 10, padding: 10, cursor: "pointer", border: "1px solid #334155", transition: "border-color 0.15s", display: "flex", flexDirection: "column", gap: 2, position: "relative" },
    statBox: { flex: 1, background: "#1e293b", borderRadius: 10, padding: "10px 6px", textAlign: "center" },
    mhdr: { fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 0.8, margin: "10px 0 4px" },
    badge: (c) => ({ background: c+"22", color: c, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, border: `1px solid ${c}44`, display: "inline-block" }),
    pBar: { background: "#1e293b", borderRadius: 6, height: 7, overflow: "hidden" },
    pFill: (p,c) => ({ width: `${Math.min(p,100)}%`, height: "100%", background: c, borderRadius: 6, transition: "width 0.6s ease" }),
    toggle: (a) => ({ flex: 1, padding: "7px 4px", fontSize: 10, fontWeight: a?700:400, background: a?"#22c55e":"#1e293b", color: a?"#0a0f1e":"#64748b", border: "none", borderRadius: 8, cursor: "pointer" }),
    nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0f172a", borderTop: "1px solid #1e293b", display: "flex", zIndex: 100 },
    navBtn: (a) => ({ flex: 1, padding: "9px 2px 7px", fontSize: 9, fontWeight: a?700:400, color: a?"#22c55e":"#475569", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }),
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#22c55e" }}>🥗 KetoTrack</div>
            <div style={{ fontSize: 9, color: "#64748b" }}>{new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: totals.cal > PROFILE.calories ? "#ef4444" : "#22c55e" }}>{Math.round(totals.cal)}</div>
            <div style={{ fontSize: 9, color: "#64748b" }}>of {PROFILE.calories} cal</div>
          </div>
        </div>
        <div style={{ ...S.pBar, marginTop: 8 }}>
          <div style={S.pFill((totals.cal/PROFILE.calories)*100, totals.cal>PROFILE.calories?"#ef4444":"#22c55e")} />
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {[["today","📊","Today"],["add","➕","Add"],["log","📋","Log"],["health","❤️","Health"],["progress","📈","Progress"]].map(([id,icon,label]) => (
          <button key={id} style={S.tab(tab===id)} onClick={() => setTab(id)}>{icon}<br/>{label}</button>
        ))}
      </div>

      {/* TODAY */}
      {tab === "today" && (
        <div style={S.sec}>
          <div style={S.card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>TODAY'S MACROS</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Ring value={totals.cal} max={PROFILE.calories} label="Calories" color={totals.cal>PROFILE.calories?"#ef4444":"#22c55e"} unit="" />
              <Ring value={totals.carbs} max={PROFILE.netCarbs} label="Carbs" color={totals.carbs>PROFILE.netCarbs?"#ef4444":"#f59e0b"} unit="g" />
              <Ring value={totals.protein} max={PROFILE.protein} label="Protein" color="#3b82f6" unit="g" />
              <Ring value={totals.fat} max={PROFILE.fat} label="Fat" color="#a855f7" unit="g" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[
              { l: "Cal Left", v: Math.max(0,Math.round(PROFILE.calories-totals.cal)), c: "#22c55e" },
              { l: "Carbs Left", v: `${Math.max(0,Math.round(PROFILE.netCarbs-totals.carbs))}g`, c: "#f59e0b" },
              { l: "Foods", v: todayEntries.length, c: "#3b82f6" },
            ].map(x => (
              <div key={x.l} style={S.statBox}>
                <div style={{ fontSize: 17, fontWeight: 800, color: x.c }}>{x.v}</div>
                <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>LOG VITALS</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Weight (lb)" value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" />
              <button style={S.btn()} onClick={saveWeight}>⚖️ Save</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Systolic" value={bpInput.sys} onChange={e => setBpInput(p => ({ ...p, sys: e.target.value }))} type="number" />
              <input style={{ ...S.input, flex: 1 }} placeholder="Diastolic" value={bpInput.dia} onChange={e => setBpInput(p => ({ ...p, dia: e.target.value }))} type="number" />
              <button style={S.btn("#3b82f6")} onClick={saveBP}>🩺 Save</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Steps today" value={stepsInput} onChange={e => setStepsInput(e.target.value)} type="number" />
              <button style={S.btn("#f59e0b")} onClick={saveSteps}>👣 Save</button>
            </div>
            {(weight[today]||bp[today]||steps[today]) && (
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {weight[today] && <span style={S.badge("#60a5fa")}>⚖️ {weight[today]} lb</span>}
                {bp[today] && <span style={S.badge("#fca5a5")}>🩺 {bp[today]}</span>}
                {steps[today] && <span style={S.badge("#86efac")}>👣 {steps[today].toLocaleString()}</span>}
              </div>
            )}
          </div>

          {mealGroups.length > 0 ? (
            <div style={S.card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>TODAY'S MEALS</div>
              {mealGroups.map(g => (
                <div key={g.meal}>
                  <div style={S.mhdr}>{g.meal} · {g.items.reduce((a,e)=>a+e.cal,0)} cal</div>
                  {g.items.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{item.emoji}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 9, color: "#64748b" }}>{item.time} · F:{item.fat}g P:{item.protein}g C:{item.carbs}g</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>{item.cal}</span>
                        <button style={{ background: "none", border: "none", color: "#ef4444", fontSize: 18, cursor: "pointer" }} onClick={() => removeEntry(item.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#475569" }}>
              <div style={{ fontSize: 38 }}>🥗</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No food logged yet!</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Tap ➕ Add to get started</div>
            </div>
          )}
        </div>
      )}

      {/* ADD FOOD — BUG FIXED */}
      {tab === "add" && (
        <div style={S.sec}>
          <div style={S.card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>MEAL:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MEALS.map(m => (
                <button key={m} onClick={() => setMeal(m)} style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: meal===m?700:400, background: meal===m?"#22c55e":"#1e293b", color: meal===m?"#0a0f1e":"#94a3b8", border: "none", cursor: "pointer" }}>{m}</button>
              ))}
            </div>
          </div>

          <input style={{ ...S.input, marginBottom: 10 }} placeholder="🔍 Search all foods..." value={search} onChange={e => setSearch(e.target.value)} />

          <div style={{ display: "flex", gap: 6, marginBottom: 10, background: "#0f172a", padding: 4, borderRadius: 10, border: "1px solid #1e293b" }}>
            <button style={S.toggle(foodSection==="quick")} onClick={() => setFoodSection("quick")}>⚡ Quick Foods ({DEFAULT_FOODS.length})</button>
            <button style={S.toggle(foodSection==="mine")} onClick={() => setFoodSection("mine")}>
              ⭐ My Foods ({customFoods.length})
              {customFoods.length > 0 && <span style={{ marginLeft: 4, background: "#22c55e", color: "#0a0f1e", borderRadius: 10, padding: "0 5px", fontSize: 8, fontWeight: 800 }}>✓</span>}
            </button>
          </div>

          {/* Add custom food button */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{ width: "100%", background: "transparent", border: "1px dashed #334155", borderRadius: 10, padding: "10px", color: "#22c55e", fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 10 }}>
              ➕ Create New Custom Food & Save to My Foods
            </button>
          ) : (
            <div style={{ ...S.card, border: "1px solid #22c55e55", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 10 }}>⭐ NEW CUSTOM FOOD</div>
              <input style={{ ...S.input, marginBottom: 8 }} placeholder="Food name *" value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input style={S.input} placeholder="Calories *" value={custom.cal} onChange={e => setCustom(p => ({ ...p, cal: e.target.value }))} type="number" />
                <input style={S.input} placeholder="Fat (g)" value={custom.fat} onChange={e => setCustom(p => ({ ...p, fat: e.target.value }))} type="number" />
                <input style={S.input} placeholder="Protein (g)" value={custom.protein} onChange={e => setCustom(p => ({ ...p, protein: e.target.value }))} type="number" />
                <input style={S.input} placeholder="Net Carbs (g)" value={custom.carbs} onChange={e => setCustom(p => ({ ...p, carbs: e.target.value }))} type="number" />
              </div>
              <input style={{ ...S.input, marginBottom: 8 }} placeholder="Emoji icon (e.g. 🍜)" value={custom.emoji} onChange={e => setCustom(p => ({ ...p, emoji: e.target.value }))} />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn(), flex: 1 }} onClick={saveCustomFood}>Save to My Foods + Log Today ✅</button>
                <button style={S.btn("#ef4444")} onClick={() => setShowForm(false)}>✕</button>
              </div>
            </div>
          )}

          {/* MY FOODS — shows saved custom foods */}
          {foodSection === "mine" && (
            filteredCustom.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#475569" }}>
                <div style={{ fontSize: 36 }}>⭐</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No custom foods yet!</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Tap "Create New Custom Food" above</div>
              </div>
            ) : (
              <div style={S.grid}>
                {filteredCustom.map((f, i) => (
                  <div key={i} style={S.fc}
                    onMouseEnter={e => e.currentTarget.style.borderColor="#22c55e"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="#334155"}>
                    <button style={{ position: "absolute", top: 5, right: 5, background: "none", border: "none", color: "#ef4444", fontSize: 14, cursor: "pointer", lineHeight: 1 }} onClick={e => { e.stopPropagation(); removeCustomFood(i); }}>×</button>
                    <div style={{ fontSize: 20 }}>{f.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, paddingRight: 14, lineHeight: 1.3 }}>{f.name}</div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>F:{f.fat}g · P:{f.protein}g · C:{f.carbs}g</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>{f.cal} cal</span>
                      <button style={{ background: "#22c55e22", border: "1px solid #22c55e55", color: "#22c55e", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontWeight: 700 }} onClick={() => addFood(f)}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* QUICK FOODS */}
          {foodSection === "quick" && (
            <div style={S.grid}>
              {filteredDefault.map((f, i) => (
                <div key={i} style={S.fc} onClick={() => addFood(f)}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#22c55e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#334155"}>
                  <div style={{ fontSize: 20 }}>{f.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: "#64748b" }}>F:{f.fat}g · P:{f.protein}g · C:{f.carbs}g</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginTop: 4 }}>{f.cal} cal</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOG */}
      {tab === "log" && (
        <div style={S.sec}>
          {Object.keys(entries).sort().reverse().map(date => {
            const de = entries[date]||[];
            const dt = de.reduce((a,e) => ({ cal:a.cal+e.cal, carbs:a.carbs+e.carbs, protein:a.protein+e.protein, fat:a.fat+e.fat }), { cal:0, carbs:0, protein:0, fat:0 });
            const isToday = date===today;
            return (
              <div key={date} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isToday?"#22c55e":"#f1f5f9" }}>
                      {isToday ? "Today" : new Date(date+"T12:00:00").toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{de.length} foods logged</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: dt.cal>PROFILE.calories?"#ef4444":"#22c55e" }}>{Math.round(dt.cal)} cal</div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{Math.round(dt.carbs)}g carbs</div>
                  </div>
                </div>
                {(weight[date]||bp[date]||steps[date]) && (
                  <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                    {weight[date] && <span style={S.badge("#60a5fa")}>⚖️ {weight[date]} lb</span>}
                    {bp[date] && <span style={S.badge("#fca5a5")}>🩺 {bp[date]}</span>}
                    {steps[date] && <span style={S.badge("#86efac")}>👣 {steps[date].toLocaleString()}</span>}
                  </div>
                )}
                {de.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{item.emoji} {item.name} <span style={{ color: "#475569" }}>({item.meal})</span></span>
                    <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>{item.cal}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 6, paddingTop: 5, borderTop: "1px solid #1e293b" }}>
                  {[["F",dt.fat,"#a855f7"],["P",dt.protein,"#3b82f6"],["C",dt.carbs,"#f59e0b"]].map(([l,v,c]) => (
                    <span key={l} style={{ fontSize: 10, color: c, fontWeight: 600 }}>{l}: {Math.round(v)}g</span>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(entries).length===0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
              <div style={{ fontSize: 40 }}>📋</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No history yet</div>
            </div>
          )}
        </div>
      )}

      {/* HEALTH */}
      {tab === "health" && (
        <div style={S.sec}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>📱 FROM iPHONE HEALTH · Sep 2025 – Mar 2026</div>

          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>👣 Steps</div>
              <span style={S.badge("#22c55e")}>{HEALTH.stepsAvg.toLocaleString()} daily avg</span>
            </div>
            <MiniBar label="6-month average" value={HEALTH.stepsAvg} max={HEALTH.stepsGoal} color="#22c55e" />
            <MiniBar label="Today logged" value={steps[today]||0} max={HEALTH.stepsGoal} color="#3b82f6" />
            <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 6 }}>⚠️ {(HEALTH.stepsGoal-HEALTH.stepsAvg).toLocaleString()} steps short of 10K. Add 10 min treadmill!</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>✅ Great rebound in March — keep it up!</div>
          </div>

          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>❤️ Heart Rate</div>
              <span style={S.badge("#22c55e")}>Excellent</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { l: "Resting Avg", v: `${HEALTH.rhr} BPM`, c: "#ef4444" },
                { l: "Min (sleep)", v: "40 BPM", c: "#22c55e" },
                { l: "Workout Max", v: `${HEALTH.workoutHRMax} BPM`, c: "#f59e0b" },
              ].map(x => (
                <div key={x.l} style={S.statBox}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: x.c }}>{x.v}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>🏋️ Fat burn zone (age 49): <span style={{ color: "#22c55e", fontWeight: 700 }}>130–155 BPM</span></div>
              <div style={{ fontSize: 10, color: "#f59e0b" }}>⚠️ Your max (176 BPM) is above theoretical max (171). Try to stay in fat burn zone for better results!</div>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>🔥 Active Energy</div>
              <span style={S.badge("#f59e0b")}>Very Good</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { l: "6M Daily Avg", v: `${HEALTH.activeCalAvg}`, c: "#f59e0b" },
                { l: "Last 7 Days", v: "648", c: "#22c55e" },
                { l: "Cal Budget", v: "1,900", c: "#3b82f6" },
              ].map(x => (
                <div key={x.l} style={S.statBox}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: x.c }}>{x.v}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>💡 Your 612 cal active burn = updated budget of <span style={{ color: "#22c55e", fontWeight: 700 }}>1,900 cal/day</span> (was 1,700)</div>
            </div>
          </div>

          <div style={{ ...S.card, border: "1px solid #ef444433" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🩺 BP Status</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { l: "Medication", v: "Losartan 50mg", c: "#ef4444" },
                { l: "RHR", v: `${HEALTH.rhr} BPM`, c: "#22c55e" },
              ].map(x => (
                <div key={x.l} style={{ ...S.statBox }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: x.c }}>{x.v}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#ef4444", background: "#3b1f1f", padding: "8px 10px", borderRadius: 8 }}>⚠️ Never stop Losartan without doctor approval. Discuss dose reduction as weight drops.</div>
          </div>

          <div style={{ ...S.card, background: "linear-gradient(135deg, #0f2027, #1a3a2a)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>⭐ Fitness Scores</div>
            {[
              { l: "Resting Heart Rate (64 BPM)", s: 85, note: "Excellent for age 49!" },
              { l: "Daily Activity (612 cal)", s: 78, note: "Very Good!" },
              { l: "Step Count (8,614/day)", s: 72, note: "Good — aim for 10K" },
              { l: "Workout Intensity (176 BPM max)", s: 82, note: "High intensity — great!" },
            ].map(x => (
              <div key={x.l} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</span>
                  <span style={{ fontSize: 10, color: x.s>=80?"#22c55e":"#f59e0b", fontWeight: 700 }}>{x.s}/100</span>
                </div>
                <div style={S.pBar}><div style={S.pFill(x.s, x.s>=80?"#22c55e":"#f59e0b")} /></div>
                <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{x.note}</div>
              </div>
            ))}
            <div style={{ marginTop: 6, padding: "8px 10px", background: "#22c55e22", borderRadius: 8, border: "1px solid #22c55e44" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>Overall: Very Fit for Age 49! 💪</div>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS */}
      {tab === "progress" && (
        <div style={S.sec}>
          <div style={{ ...S.card, background: "linear-gradient(135deg, #0f2027, #1a3a2a)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🎯 Weight Goal Progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#64748b" }}>Start: 187 lb</span>
              <span style={{ fontSize: 10, color: "#f1f5f9", fontWeight: 700 }}>Now: {latestW} lb</span>
              <span style={{ fontSize: 10, color: "#22c55e" }}>Goal: 168 lb</span>
            </div>
            <div style={S.pBar}><div style={S.pFill(goalPct, "#22c55e")} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Lost: {Math.max(0, 187-latestW).toFixed(1)} lb</span>
              <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>To go: {Math.max(0, latestW-168).toFixed(1)} lb</span>
              <span style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700 }}>{goalPct.toFixed(0)}% done!</span>
            </div>
          </div>

          {[
            { title: "🔥 Calories (7 days)", key: "cal", max: PROFILE.calories, color: "#22c55e", fmt: v => v>0?Math.round(v):"-" },
            { title: "⚖️ Weight lbs (7 days)", key: "weight", max: 195, color: "#3b82f6", fmt: v => v?`${v}lb`:"-" },
            { title: "👣 Steps (7 days)", key: "steps", max: HEALTH.stepsGoal, color: "#f59e0b", fmt: v => v?v.toLocaleString():"-" },
          ].map(ch => (
            <div key={ch.title} style={S.card}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>{ch.title}</div>
              {last7.map(d => (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8", width: 26, textAlign: "center" }}>{d.label}</span>
                  <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${Math.min(((d[ch.key]||0)/ch.max)*100,100)}%`, height: "100%", background: ch.color, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748b", width: 45, textAlign: "right" }}>{ch.fmt(d[ch.key])}</span>
                </div>
              ))}
            </div>
          ))}

          <div style={S.card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>🩺 BP Log (7 days)</div>
            {last7.map(d => (
              <div key={d.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{d.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.bp?"#fca5a5":"#334155" }}>{d.bp||"—"}</span>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>📅 MILESTONES</div>
            {[
              { w: "Week 2", t: "184-185 lb", done: latestW<=185 },
              { w: "Week 4", t: "181-182 lb", done: latestW<=182 },
              { w: "Week 8", t: "176-177 lb", done: latestW<=177 },
              { w: "Week 12", t: "172-173 lb", done: latestW<=173 },
              { w: "Week 16 🎯", t: "167-168 lb", done: latestW<=168 },
            ].map(m => (
              <div key={m.w} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ fontSize: 11, color: m.done?"#22c55e":"#94a3b8", fontWeight: m.done?700:400 }}>{m.done?"✅":"⏳"} {m.w}</span>
                <span style={{ fontSize: 11, color: m.done?"#22c55e":"#64748b", fontWeight: m.done?700:400 }}>{m.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: toastErr?"#ef4444":"#22c55e", color: toastErr?"#fff":"#0a0f1e", padding: "10px 20px", borderRadius: 20, fontWeight: 700, fontSize: 12, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}

      {/* NAV */}
      <div style={S.nav}>
        {[["today","📊","Today"],["add","➕","Add"],["log","📋","Log"],["health","❤️","Health"],["progress","📈","Progress"]].map(([id,icon,label]) => (
          <button key={id} style={S.navBtn(tab===id)} onClick={() => setTab(id)}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
