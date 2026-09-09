import { useState } from "react";
import { Armchair, CircleCheck, Clapperboard, DoorOpen, ScanLine, TriangleAlert } from "lucide-react";
import "./staff.css";

export default function CheckIn() {
  const [code, setCode] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState(false);

  const handleScan = (e) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      setCheckedIn(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Check-In</h1>
          <p className="kc-subtitle">Validate tickets at the entrance by scanning the booking code.</p>
        </div>
      </div>

      <form className="kc-search-box" onSubmit={handleScan}>
        <span className="kc-search-icon"><ScanLine size={18} /></span>
        <input
          placeholder="Scan or type ticket code..."
          value={code}
          onChange={(e) => { setCode(e.target.value); setCheckedIn(false); setError(false); }}
        />
        <button type="submit" className="kc-btn kc-btn-success">Validate</button>
      </form>

      {error && (
        <div className="kc-card" style={{ background: "rgba(229,9,20,0.08)", borderColor: "rgba(229,9,20,0.3)" }}>
          <div style={{ textAlign: "center", padding: "30px 0", color: "#e50914", fontWeight: 700 }}>
            <TriangleAlert size={18} /> Please enter a ticket code to check in.
          </div>
        </div>
      )}

      {checkedIn && (
        <div className="kc-card" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" }}>
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: "54px", marginBottom: "10px" }}><CircleCheck size={54} /></div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#22c55e" }}>Check-in Successful</div>
            <p style={{ color: "#a0a0a0", marginTop: "8px" }}>
              Ticket <b style={{ color: "#f5f5f5" }}>{code.toUpperCase()}</b> is valid.
            </p>
            <div className="kc-detail" style={{ justifyContent: "center", marginTop: "16px" }}>
              <span className="kc-chip"><Clapperboard size={13} /> The Last Emperor</span>
              <span className="kc-chip"><DoorOpen size={13} /> Hall 1</span>
              <span className="kc-chip"><Armchair size={13} /> A3, A4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}