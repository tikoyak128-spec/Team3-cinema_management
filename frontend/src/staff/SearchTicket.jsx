import { useState } from "react";
import { Armchair, Search, Ticket } from "lucide-react";
import "./staff.css";

export default function SearchTicket() {
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState(false);

  const found = code.trim().length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Search Ticket</h1>
          <p className="kc-subtitle">Find a ticket by its booking reference.</p>
        </div>
      </div>

      <form className="kc-search-box" onSubmit={handleSearch}>
        <span className="kc-search-icon"><Search size={18} /></span>
        <input
          placeholder="Enter ticket or booking code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="kc-btn kc-btn-primary">Search</button>
      </form>

      {searched && found && (
        <div className="kc-card">
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Result</h2>
          <div style={{
            display: "flex", alignItems: "center", gap: "14px", padding: "16px",
            background: "#181818", borderRadius: "12px", border: "1px solid #272727", marginBottom: "16px"
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(229,9,20,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "18px"
            }}><Ticket size={20} /></div>
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: 800, fontSize: "16px" }}>Booking #{code.toUpperCase()}</div>
              <div style={{ fontSize: "13px", color: "#a0a0a0" }}>The Last Emperor · Cinema Phnom Penh · Hall 1</div>
            </div>
            <span className="kc-badge kc-badge-green">Valid</span>
          </div>

          <div className="kc-result-box">
            <div className="kc-result-row">
              <span className="kc-result-label">Customer</span>
              <span className="kc-result-value">Sok Vannak</span>
            </div>
            <div className="kc-result-row">
              <span className="kc-result-label">Showtime</span>
              <span className="kc-result-value">2026-08-31 · 14:00</span>
            </div>
            <div className="kc-result-row">
              <span className="kc-result-label">Seats</span>
              <span className="kc-result-value">
                <span className="kc-detail" style={{ justifyContent: "flex-end" }}>
                  <span className="kc-chip"><Armchair size={13} /> A3</span>
                  <span className="kc-chip"><Armchair size={13} /> A4</span>
                </span>
              </span>
            </div>
            <div className="kc-result-row">
              <span className="kc-result-label">Total Paid</span>
              <span className="kc-result-value">$10.00</span>
            </div>
            <div className="kc-result-row">
              <span className="kc-result-label">Ticket Type</span>
              <span className="kc-result-value"><span className="kc-badge kc-badge-gray">Standard</span></span>
            </div>
          </div>
        </div>
      )}

      {searched && !found && (
        <div className="kc-card">
          <div className="kc-empty" style={{ textAlign: "center", padding: "40px 0", color: "#a0a0a0" }}>
            <div style={{ fontSize: "44px", marginBottom: "10px" }}><Ticket size={44} /></div>
            <p>Enter a booking code to search for a ticket.</p>
          </div>
        </div>
      )}
    </div>
  );
}