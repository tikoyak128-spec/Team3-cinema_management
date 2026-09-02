import { Armchair, QrCode } from "lucide-react";
import "./staff.css";

export default function TicketDetails() {
  return (
    <div className="kc-page">
      <div className="kc-head">
        <div>
          <h1>Ticket Details</h1>
          <p className="kc-subtitle">View full details for a single ticket.</p>
        </div>
      </div>

      <div className="kc-card">
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Left: QR / Poster */}
          <div style={{ minWidth: "180px", flexShrink: 0 }}>
            <div style={{
              width: "180px", height: "180px", background: "#181818", borderRadius: "14px",
              border: "2px dashed #2a2a2a", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "6px"
            }}>
              <QrCode size={56} color="#e50914" />
              <span style={{ fontSize: "12px", color: "#707070" }}>QR Code</span>
            </div>
            <span className="kc-badge" style={{ marginTop: "12px" }}>BK-0001</span>
          </div>

          {/* Right: Details */}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div className="kc-result-box">
              <div className="kc-result-row">
                <span className="kc-result-label">Customer</span>
                <span className="kc-result-value">Sok Vannak</span>
              </div>
              <div className="kc-result-row">
                <span className="kc-result-label">Email</span>
                <span className="kc-result-value">sok@email.com</span>
              </div>
              <div className="kc-result-row">
                <span className="kc-result-label">Movie</span>
                <span className="kc-result-value">The Last Emperor</span>
              </div>
              <div className="kc-result-row">
                <span className="kc-result-label">Cinema</span>
                <span className="kc-result-value">Cinema Phnom Penh · Hall 1</span>
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
                <span className="kc-result-label">Ticket Type</span>
                <span className="kc-result-value"><span className="kc-badge kc-badge-gray">Standard</span></span>
              </div>
              <div className="kc-result-row">
                <span className="kc-result-label">Total Paid</span>
                <span className="kc-result-value" style={{ fontSize: "18px", color: "#e50914" }}>$10.00</span>
              </div>
              <div className="kc-result-row">
                <span className="kc-result-label">Status</span>
                <span className="kc-result-value"><span className="kc-badge kc-badge-green">Confirmed</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}