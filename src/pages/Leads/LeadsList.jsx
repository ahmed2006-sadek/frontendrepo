/* LeadsList.jsx - مصغر وبتصميم داخلي بالدارك مود + ProgressBar */
import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects/all`);
  return res.ok ? await res.json() : [];
}
async function fetchLeads() {
  const res = await fetch(`${API_BASE}/leads/find-leads`);
  return res.ok ? await res.json() : [];
}
async function addLead(lead) {
  const res = await fetch(`${API_BASE}/leads/create-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });
  return res.ok ? await res.json() : null;
}

export const LeadStatus = {
  FRESH_LEAD: 'fresh_lead',
  FOLLOW_UP: 'follow_up',
  SCHEDULED_VISIT: 'scheduled_visit',
  OPEN_DEAL: 'open_deal',
  CANCELLATION: 'cancellation',
};

const statusOptions = Object.values(LeadStatus);

const statusProgressMap = {
  fresh_lead: { progress: 20, color: "#aaa" },
  follow_up: { progress: 40, color: "#ffa500" },
  scheduled_visit: { progress: 60, color: "#2196f3" },
  open_deal: { progress: 80, color: "#4caf50" },
  cancellation: { progress: 100, color: "#f44336" },
};

function ProgressBar({ status }) {
  const { progress, color } = statusProgressMap[status] || {};
  return (
    <div style={{ height: 5, background: "#333", borderRadius: 4, marginBottom: 6 }}>
      <div style={{ width: `${progress}%`, backgroundColor: color, height: "100%", transition: "width 0.3s ease" }}></div>
    </div>
  );
}

export default function LeadsList({ currentUser }) {
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects().then(setProjects);
    fetchLeads().then(setLeads);
  }, []);

  const role = currentUser?.role;
  const username = currentUser?.username;

  const canAddLead = ["admin", "sales_admin", "team_leader", "sales_rep"].includes(role);
  const canEditStatusOnly = role === "sales_rep";
  const canEditAll = role !== "sales_rep";

  const visibleLeads = leads.filter(lead => {
    if (["admin", "sales_admin"].includes(role)) return true;
    if (role === "team_leader") {
      if (lead.owner === username) return true;
      return currentUser?.teamMembers?.some(tm => [tm.username, tm.name, tm.email].includes(lead.owner));
    }
    return lead.owner === username;
  });

  const [form, setForm] = useState({
    name: "", contact: "", budget: "", project: "",
    source: "", status: statusOptions[0], owner: username,
    lastCall: "", lastVisit: "", calls: [], visits: []
  });

  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    const created = await addLead({ ...form });
    setForm({ name: "", contact: "", budget: "", project: "",
      source: "", status: statusOptions[0], owner: username,
      lastCall: "", lastVisit: "", calls: [], visits: [] });
    setShowAdd(false);
    if (created) fetchLeads().then(setLeads);
  };

  return (
    <div className="projects-page" style={{ padding: 20, width: 900, marginTop: 30, textAlign: "center", justifyContent: "center"}}>
      {canAddLead && (
        <div style={{ display: "flex", marginBottom: 10 }}>
          <button style={{ padding: "6px 12px", fontSize: 13, background: "blue", color: "white", border: "none", borderRadius: 4 }}
            onClick={() => setShowAdd(true)}>Add Lead</button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "90%", margin: "0 auto", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr>
              {["Name", "Contact", "Budget", "Project", "Source", "Status", "Owner", "Last Call", "Last Visit", "Actions"].map(h => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid #444", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleLeads.map((lead, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td colSpan={10}><ProgressBar status={lead.status} /></td>
                </tr>
                <tr style={{ borderBottom: "1px solid #333" }}>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.name}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.contact}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.budget}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{projects.find(p => p.id === lead.project)?.name || ""}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.source}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <select value={lead.status} onChange={e => {
                      const updated = [...leads];
                      if (canEditAll || (canEditStatusOnly && lead.owner === username)) {
                        updated[idx].status = e.target.value;
                        setLeads(updated);
                      }
                    }}
                      style={{ padding: 4, fontSize: 12, background: "#1f1f1f", color: "#eee", border: "1px solid #555" }}>
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.owner}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.lastCall}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{lead.lastVisit}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <button style={{ background: "#444", color: "white", border: "none", padding: "4px 8px", fontSize: 12, borderRadius: 4 }}>
                      Edit
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto', maxWidth: 200 }}>
            <span onClick={() => setShowAdd(false)} className="close-x">×</span>
            <h3 style={{ marginBottom: 12 }}>Add New Lead</h3>
            {["name", "contact", "budget", "source", "lastCall", "lastVisit"].map(key => (
              <input key={key} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: "100%", marginBottom: 8, padding: 6, background: "#2a2a2a", border: "1px solid #444", fontSize: 13, borderRadius: 4 }} />
            ))}

            <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}
              style={{ width: "100%", marginBottom: 8, padding: 6, background: "#2a2a2a", border: "1px solid #444", color: "#eee", fontSize: 13, borderRadius: 4 }}>
              <option value="">اختر مشروع</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ width: "100%", marginBottom: 8, padding: 6, background: "#2a2a2a", border: "1px solid #444", color: "#eee", fontSize: 13, borderRadius: 4 }}>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <button onClick={handleAdd}
              style={{ background: "blue", color: "white", padding: "6px 14px", border: "none", borderRadius: 5, fontSize: 13 }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
