import React, { useState, useRef, useEffect } from "react";

/* Options ---------------------------------------------------------- */
const MODES = [
  { id: "A", title: "From scratch", blurb: "Nothing chosen yet. Fit me a rod or a whole setup." },
  { id: "B", title: "Upgrade what I own", blurb: "I have a rod. What is worth improving?" },
  { id: "C", title: "Build around my rod", blurb: "I have a rod. Match the rest to it." },
];
const EXPERIENCE = [
  { id: "First-time", note: "Never cast a fly rod" },
  { id: "Beginner", note: "Fished a little; basics known" },
  { id: "Intermediate", note: "Competent; own kit" },
  { id: "Expert", note: "Very experienced; strong views" },
];
const WATERS = ["Small / chalk stream", "Freestone river", "Big river", "Stillwater / reservoir", "Lake", "Saltwater / flats"];
const TECHNIQUES = ["Dry fly", "Nymph", "Dry-dropper", "Streamer / lure", "Euro nymph", "Mixed"];
const RANGES = ["Short / intimate", "Medium", "Long"];
const FEELS = ["Relaxed / forgiving", "Balanced / all-round", "Crisp / punchy", "Not sure"];
const BUDGETS = ["Value", "Reasonable", "Premium"];
const SCOPE_A = ["Rod only", "Whole setup"];
const SCOPE_C = ["Line + reel only", "Full build"];

/* Markdown --------------------------------------------------------- */
function inline(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={i++}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function Markdown({ text }) {
  const lines = (text || "").split("\n");
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push({ t: "ul", items: list }); list = null; } };
  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, "");
    if (/^#{1,4}\s+/.test(line)) { flush(); blocks.push({ t: "h", text: line.replace(/^#+\s+/, "") }); }
    else if (/^[-*]\s+/.test(line)) { if (!list) list = []; list.push(line.replace(/^[-*]\s+/, "")); }
    else if (/^\d+\.\s+/.test(line)) { if (!list) list = []; list.push(line.replace(/^\d+\.\s+/, "")); }
    else if (line.trim() === "") { flush(); }
    else { flush(); blocks.push({ t: "p", text: line }); }
  });
  flush();
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b.t === "h") return <h4 key={i} className="md-h">{inline(b.text)}</h4>;
        if (b.t === "ul") return <ul key={i} className="md-ul">{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
        return <p key={i} className="md-p">{inline(b.text)}</p>;
      })}
    </div>
  );
}

/* UI pieces -------------------------------------------------------- */
function Label({ children, req }) {
  return <div className="lbl">{children}{req && <span className="req"> *</span>}</div>;
}
function Choice({ options, value, onChange, getNote }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const note = typeof o === "string" ? (getNote ? getNote(o) : null) : o.note;
        const active = value === id;
        return (
          <button key={id} className={"chip" + (active ? " on" : "")} onClick={() => onChange(id)}>
            <span>{id}</span>{note && <em>{note}</em>}
          </button>
        );
      })}
    </div>
  );
}
function MultiChoice({ options, values, onToggle, getNote }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const active = values.includes(o);
        const note = getNote ? getNote(o) : null;
        return (
          <button key={o} className={"chip" + (active ? " on" : "")} onClick={() => onToggle(o)}>
            <span>{o}</span>{note && <em>{note}</em>}
          </button>
        );
      })}
    </div>
  );
}

/* Main ------------------------------------------------------------- */
export default function App() {
  const [screen, setScreen] = useState("intake");
  const [mode, setMode] = useState(null);
  const [exp, setExp] = useState(null);

  const [country, setCountry] = useState("");
  const [waters, setWaters] = useState([]);
  const [dominant, setDominant] = useState("");
  const [species, setSpecies] = useState("");
  const [technique, setTechnique] = useState(null);
  const [ranges, setRanges] = useState([]);
  const [rangeSplit, setRangeSplit] = useState("");
  const [windy, setWindy] = useState(null);
  const [feel, setFeel] = useState(null);
  const [prefs, setPrefs] = useState("");
  const [budgets, setBudgets] = useState([]);

  const [scopeA, setScopeA] = useState(null);
  const [onlyGap, setOnlyGap] = useState("");
  const [rodModel, setRodModel] = useState("");
  const [ownedKit, setOwnedKit] = useState("");
  const [upgradeReason, setUpgradeReason] = useState("");
  const [feltCast, setFeltCast] = useState("");
  const [scopeC, setScopeC] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, loading]);

  const toggleWater = (w) => setWaters((p) => p.includes(w) ? p.filter((x) => x !== w) : [...p, w]);
  const toggleRange = (r) => setRanges((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]);
  const toggleBudget = (b) => setBudgets((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b]);
  const showDominant = waters.length > 1;
  const showRangeSplit = ranges.length > 1;

  const ready = (() => {
    if (!mode || !exp) return false;
    if (!country.trim() || waters.length === 0 || !species.trim() || !technique || ranges.length === 0 || budgets.length === 0) return false;
    if ((mode === "B" || mode === "C") && !rodModel.trim()) return false;
    return true;
  })();

  function buildBrief() {
    const L = [];
    L.push(`MODE: ${mode === "A" ? "A - recommend from scratch" : mode === "B" ? "B - upgrade what I own" : "C - build around my chosen rod"}`);
    L.push(`Experience: ${exp}`);
    L.push(`Country/region: ${country}`);
    L.push(`Home water: ${waters.join(", ")}${showDominant && dominant ? ` (dominant use: ${dominant})` : ""}`);
    L.push(`Target species: ${species}`);
    L.push(`Primary technique: ${technique}`);
    L.push(`Typical casting range: ${ranges.join(", ")}${showRangeSplit && rangeSplit ? ` (split: ${rangeSplit})` : ""}${windy ? `; often windy: ${windy}` : ""}`);
    if (feel) L.push(`Preferred feel: ${feel}`);
    if (prefs.trim()) L.push(`Preferences/constraints: ${prefs.trim()}`);
    L.push(`Budget tier(s) selected: ${budgets.join(", ")}`);
    if (mode === "A") {
      if (scopeA) L.push(`Recommend: ${scopeA}`);
      if (onlyGap.trim()) L.push(`Only/first rod or gap: ${onlyGap.trim()}`);
    }
    if (mode === "B") {
      L.push(`Rod owned (required): ${rodModel}`);
      if (ownedKit.trim()) L.push(`Reel/line/leader owned: ${ownedKit.trim()}`);
      if (upgradeReason.trim()) L.push(`What prompts the upgrade: ${upgradeReason.trim()}`);
    }
    if (mode === "C") {
      L.push(`Rod chosen (required): ${rodModel}`);
      if (feltCast.trim()) L.push(`How it casts to me: ${feltCast.trim()}`);
      if (scopeC) L.push(`Recommend: ${scopeC}`);
    }
    return L.join("\n");
  }

  async function callAdvisor(convo) {
    const res = await fetch("/api/fit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: convo }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text || "(No text returned.)";
  }

  async function start() {
    if (!ready) return;
    const brief = buildBrief();
    const convo = [{ role: "user", content: brief }];
    setMessages([{ role: "user", content: brief, brief: true }]);
    setScreen("chat");
    setLoading(true); setError("");
    try {
      const reply = await callAdvisor(convo);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  async function send() {
    const t = input.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput(""); setLoading(true); setError("");
    try {
      const convo = next.map((m) => ({ role: m.role, content: m.content }));
      const reply = await callAdvisor(convo);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  function reset() {
    setScreen("intake"); setMessages([]); setInput(""); setError(""); setLoading(false);
  }

  return (
    <div className="bench">
      <style>{CSS}</style>

      <header className="masthead">
        <div className="rule-fly">
          <svg viewBox="0 0 120 24" width="120" height="24" aria-hidden="true">
            <line x1="0" y1="12" x2="78" y2="12" stroke="currentColor" strokeWidth="1" />
            <path d="M78 12 q8 -7 16 0 q-8 7 -16 0Z" fill="currentColor" opacity="0.85" />
            <line x1="94" y1="12" x2="120" y2="6" stroke="currentColor" strokeWidth="1" />
            <line x1="94" y1="12" x2="120" y2="18" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <h1>The Fitting Bench</h1>
        <p className="kicker">Matched to your water</p>
      </header>

      {screen === "intake" && (
        <main className="intake">
          <section className="card stagger" style={{ animationDelay: "40ms" }}>
            <Label req>What do you need</Label>
            <div className="modes">
              {MODES.map((m) => (
                <button key={m.id} className={"mode" + (mode === m.id ? " on" : "")} onClick={() => setMode(m.id)}>
                  <span className="mode-t">{m.title}</span>
                  <span className="mode-b">{m.blurb}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card stagger" style={{ animationDelay: "100ms" }}>
            <Label req>Your experience</Label>
            <Choice options={EXPERIENCE} value={exp} onChange={setExp} />
          </section>

          <section className="card stagger" style={{ animationDelay: "160ms" }}>
            <Label req>Country or region</Label>
            <input className="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom" />

            <Label req>Home water <em className="hint">(choose all that apply)</em></Label>
            <MultiChoice options={WATERS} values={waters} onToggle={toggleWater} />
            {showDominant && (
              <>
                <Label>Dominant use, roughly</Label>
                <input className="text" value={dominant} onChange={(e) => setDominant(e.target.value)} placeholder="e.g. 70% chalk stream / 30% reservoir" />
              </>
            )}

            <Label req>Target species</Label>
            <input className="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. wild brown trout, grayling" />

            <Label req>Primary technique</Label>
            <Choice options={TECHNIQUES} value={technique} onChange={setTechnique} />

            <Label req>Typical casting range <em className="hint">(choose all that apply)</em></Label>
            <MultiChoice options={RANGES} values={ranges} onToggle={toggleRange} />
            {showRangeSplit && (
              <>
                <Label>Rough split, if it helps</Label>
                <input className="text" value={rangeSplit} onChange={(e) => setRangeSplit(e.target.value)} placeholder="e.g. mostly medium, some long on the reservoir" />
              </>
            )}

            <Label>Often windy where you fish</Label>
            <Choice options={["Yes", "No"]} value={windy} onChange={setWindy} />

            <Label>Preferred feel <em className="hint">(optional)</em></Label>
            <Choice options={FEELS} value={feel} onChange={setFeel} />

            <Label>Preferences or constraints <em className="hint">(optional)</em></Label>
            <textarea className="text area" value={prefs} onChange={(e) => setPrefs(e.target.value)} placeholder="handle style, weight, brands you like or avoid, warranty / local support, eco" />

            <Label req>Budget <em className="hint">(pick one or more; tiers become the comparison)</em></Label>
            <MultiChoice options={BUDGETS} values={budgets} onToggle={toggleBudget} />
          </section>

          {mode === "A" && (
            <section className="card stagger" style={{ animationDelay: "220ms" }}>
              <Label>What should I recommend</Label>
              <Choice options={SCOPE_A} value={scopeA} onChange={setScopeA} />
              <Label>Is this your only / first rod, or filling a gap</Label>
              <input className="text" value={onlyGap} onChange={(e) => setOnlyGap(e.target.value)} placeholder="e.g. first rod; or: filling a gap, I already own a 9ft #5" />
            </section>
          )}

          {mode === "B" && (
            <section className="card stagger" style={{ animationDelay: "220ms" }}>
              <Label req>Rod you own <em className="hint">(model, length, line weight - printed on the blank)</em></Label>
              <input className="text" value={rodModel} onChange={(e) => setRodModel(e.target.value)} placeholder="e.g. Orvis Clearwater 9ft #5, 4-piece" />
              <Label>Reel / line / leader you own <em className="hint">("not sure" is fine)</em></Label>
              <input className="text" value={ownedKit} onChange={(e) => setOwnedKit(e.target.value)} placeholder="e.g. some mid-arbor reel, an old WF5F floating line" />
              <Label>What is prompting the upgrade</Label>
              <input className="text" value={upgradeReason} onChange={(e) => setUpgradeReason(e.target.value)} placeholder="e.g. line sinks, want more delicacy, casts feel heavy" />
            </section>
          )}

          {mode === "C" && (
            <section className="card stagger" style={{ animationDelay: "220ms" }}>
              <Label req>Rod you have chosen <em className="hint">(model, length, line weight)</em></Label>
              <input className="text" value={rodModel} onChange={(e) => setRodModel(e.target.value)} placeholder="e.g. Redington Classic Trout 8'6 #4" />
              <Label>How does it cast to you <em className="hint">(optional; your feel beats the spec sheet)</em></Label>
              <input className="text" value={feltCast} onChange={(e) => setFeltCast(e.target.value)} placeholder="e.g. stiffer than its rating; soft and slow" />
              <Label>What should I build</Label>
              <Choice options={SCOPE_C} value={scopeC} onChange={setScopeC} />
            </section>
          )}

          <div className="actions stagger" style={{ animationDelay: "280ms" }}>
            <button className="go" disabled={!ready} onClick={start}>Fit my setup</button>
            {!ready && <span className="needed">Complete the starred fields to continue</span>}
          </div>
        </main>
      )}

      {screen === "chat" && (
        <main className="chat">
          <div className="convo" ref={scroller}>
            {messages.map((m, i) => (
              m.role === "user" ? (
                m.brief ? (
                  <div key={i} className="brief">
                    <div className="brief-tag">Your brief</div>
                    <pre>{m.content}</pre>
                  </div>
                ) : (
                  <div key={i} className="bubble-u"><Markdown text={m.content} /></div>
                )
              ) : (
                <div key={i} className="reply"><Markdown text={m.content} /></div>
              )
            ))}
            {loading && (
              <div className="reply thinking">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span className="thinking-t">Casting about for current models and prices</span>
              </div>
            )}
            {error && <div className="err">Something went wrong: {error}</div>}
          </div>

          <div className="composer">
            <input
              className="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Answer a follow-up, ask for another tier, or refine..."
              disabled={loading}
            />
            <button className="send" onClick={send} disabled={loading || !input.trim()}>Send</button>
            <button className="restart" onClick={reset}>Start over</button>
          </div>
        </main>
      )}
    </div>
  );
}

/* Style (placeholder aesthetic, pending design direction) ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
:root{--paper:#f3efe5;--paper2:#ece6d8;--ink:#20281f;--ink2:#3a4438;--moss:#3c5c4b;--moss2:#2c4538;--brass:#a9762f;--rule:#cfc6b1;--muted:#6f6856;}
*{box-sizing:border-box;}
html,body,#root{height:100%;margin:0;}
.bench{font-family:'Hanken Grotesk',sans-serif;color:var(--ink);background:radial-gradient(120% 90% at 50% -10%,rgba(60,92,75,.07),transparent 60%),var(--paper);min-height:100%;padding:28px 18px 40px;max-width:760px;margin:0 auto;}
.bench::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.5;z-index:0;background-image:radial-gradient(rgba(32,40,31,.035) 1px,transparent 1px);background-size:3px 3px;}
.masthead{text-align:center;position:relative;z-index:1;margin-bottom:22px;}
.rule-fly{color:var(--moss);display:flex;justify-content:center;margin-bottom:6px;}
.masthead h1{font-family:'Fraunces',serif;font-weight:600;font-size:40px;line-height:1;margin:0;letter-spacing:-.5px;color:var(--ink);}
.kicker{font-size:12.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:9px 0 0;}
.intake{position:relative;z-index:1;display:flex;flex-direction:column;gap:16px;}
.card{background:rgba(255,253,247,.7);border:1px solid var(--rule);border-radius:3px;padding:18px 18px 20px;box-shadow:0 1px 0 rgba(255,255,255,.6) inset;}
.stagger{opacity:0;transform:translateY(8px);animation:rise .5s ease forwards;}
@keyframes rise{to{opacity:1;transform:none;}}
.lbl{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--moss2);font-weight:600;margin:16px 0 9px;}
.card>.lbl:first-child{margin-top:0;}
.req{color:var(--brass);}
.hint{font-style:normal;text-transform:none;letter-spacing:0;color:var(--muted);font-weight:500;font-size:11px;}
.modes{display:grid;grid-template-columns:1fr;gap:9px;}
@media(min-width:560px){.modes{grid-template-columns:1fr 1fr 1fr;}}
.mode{text-align:left;background:var(--paper);border:1px solid var(--rule);border-radius:3px;padding:13px;cursor:pointer;transition:.18s;display:flex;flex-direction:column;gap:5px;}
.mode:hover{border-color:var(--moss);transform:translateY(-1px);}
.mode.on{background:var(--moss);border-color:var(--moss2);}
.mode.on .mode-t,.mode.on .mode-b{color:#f3efe5;}
.mode-t{font-family:'Fraunces',serif;font-weight:600;font-size:16px;}
.mode-b{font-size:12px;color:var(--muted);line-height:1.35;}
.chips{display:flex;flex-wrap:wrap;gap:7px;}
.chip{background:var(--paper);border:1px solid var(--rule);border-radius:999px;padding:7px 13px;font-size:13px;cursor:pointer;transition:.16s;color:var(--ink2);display:flex;align-items:baseline;gap:7px;font-family:inherit;}
.chip em{font-style:normal;font-size:11px;color:var(--muted);}
.chip:hover{border-color:var(--moss);}
.chip.on{background:var(--moss);color:#f3efe5;border-color:var(--moss2);}
.chip.on em{color:rgba(243,239,229,.8);}
.text{width:100%;background:var(--paper);border:1px solid var(--rule);border-radius:3px;padding:11px 12px;font-size:14px;font-family:inherit;color:var(--ink);outline:none;transition:.16s;}
.text:focus{border-color:var(--moss);box-shadow:0 0 0 3px rgba(60,92,75,.12);}
.area{min-height:64px;resize:vertical;line-height:1.45;}
.actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:4px;}
.go{font-family:'Fraunces',serif;font-weight:600;font-size:16px;background:var(--moss2);color:#f3efe5;border:none;border-radius:3px;padding:13px 26px;cursor:pointer;transition:.18s;}
.go:hover:not(:disabled){background:var(--ink);transform:translateY(-1px);}
.go:disabled{opacity:.4;cursor:not-allowed;}
.needed{font-size:12px;color:var(--muted);}
.chat{position:relative;z-index:1;display:flex;flex-direction:column;gap:14px;}
.convo{display:flex;flex-direction:column;gap:16px;max-height:62vh;overflow-y:auto;padding:4px 2px 8px;}
.brief{background:var(--paper2);border:1px solid var(--rule);border-radius:3px;padding:12px 14px;}
.brief-tag{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--moss2);font-weight:700;margin-bottom:6px;}
.brief pre{margin:0;font-family:inherit;font-size:12.5px;color:var(--ink2);white-space:pre-wrap;line-height:1.5;}
.bubble-u{align-self:flex-end;background:var(--moss);color:#f3efe5;border-radius:10px 10px 2px 10px;padding:10px 13px;max-width:85%;font-size:14px;}
.bubble-u .md-p{margin:0;}
.reply{background:rgba(255,253,247,.85);border:1px solid var(--rule);border-left:3px solid var(--brass);border-radius:3px;padding:15px 17px;}
.reply.thinking{display:flex;align-items:center;gap:7px;border-left-color:var(--moss);}
.dot{width:6px;height:6px;border-radius:50%;background:var(--moss);animation:pulse 1.1s infinite ease-in-out;}
.dot:nth-child(2){animation-delay:.18s;}.dot:nth-child(3){animation-delay:.36s;}
@keyframes pulse{0%,80%,100%{opacity:.25;}40%{opacity:1;}}
.thinking-t{font-size:13px;color:var(--muted);font-style:italic;margin-left:4px;}
.err{background:#f6e3d8;border:1px solid #d8a98a;color:#7a3b1d;padding:10px 13px;border-radius:3px;font-size:13px;}
.composer{display:flex;gap:9px;align-items:center;flex-wrap:wrap;}
.composer .text{flex:1;min-width:200px;}
.send{background:var(--moss2);color:#f3efe5;border:none;border-radius:3px;padding:11px 18px;cursor:pointer;font-family:inherit;font-weight:600;transition:.16s;}
.send:hover:not(:disabled){background:var(--ink);}
.send:disabled{opacity:.4;cursor:not-allowed;}
.restart{background:transparent;border:1px solid var(--rule);color:var(--muted);border-radius:3px;padding:11px 14px;cursor:pointer;font-family:inherit;font-size:13px;}
.restart:hover{border-color:var(--moss);color:var(--ink);}
.md>:first-child{margin-top:0;}
.md-h{font-family:'Fraunces',serif;font-weight:600;font-size:16px;color:var(--moss2);margin:16px 0 7px;}
.md-p{font-size:14px;line-height:1.6;margin:9px 0;color:var(--ink2);}
.md-ul{margin:9px 0;padding-left:20px;}
.md-ul li{font-size:14px;line-height:1.55;margin:5px 0;color:var(--ink2);}
.md strong{color:var(--ink);font-weight:600;}
`;
