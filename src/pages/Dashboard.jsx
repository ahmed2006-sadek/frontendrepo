import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserCircle } from "lucide-react";
import { LayoutDashboard, Users, Boxes, Eye, Phone, TrendingUp  , UserPlus, LogOut, FolderKanban, Menu, X } from "lucide-react";

export default function Dashboard({ currentUser }) {
  const [projectsCount, setProjectsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const projectsRes = await axios.get("/projects/all");
        setProjectsCount(projectsRes.data.length || 0);
      } catch {
        setProjectsCount(0);
      }

      try {
        const leadsRes = await axios.get("/leads/find-leads");
        setLeadsCount(leadsRes.data.length || 0);
      } catch {
        setLeadsCount(0);
      }

      try {
        const inventoryRes = await axios.get("/inventory/get-all");
        setInventoryCount(inventoryRes.data.length || 0);
      } catch {
        setInventoryCount(0);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="main-center fade-in">
      {/* ✅ Box بيانات المستخدم */}
      <div className="dashboard-profile">
        <div className="profile-avatar">
        <UserCircle size={92} color="#ffff" strokeWidth={1.4} />
        </div>
        <div className="profile-info">
          <h2>{currentUser?.username || "User"}</h2>
          <p>Role: <strong>{currentUser?.role || "N/A"}</strong></p>
          <p>Email: <strong>{currentUser?.email || "example@email.com"}</strong></p>
        </div>
      </div>

      {/* ✅ البوكسات الثلاثة */}
      <div className="flex gap-2 mt-3">
        <StatBox  label="Projects" count={projectsCount} color="var(--primary-color)" />
        <StatBox  label="Leads" count={leadsCount} color="var(--accent-color)" />
        <StatBox  label="Inventory" count={inventoryCount} color="#ff6b6b" />
      </div>
    </div>
  );
}

function StatBox({ label, count, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--card-background)",
        border: "1px solid var(--border-color)",
        borderRadius: "20px",
        padding: "24px",
        textAlign: "center",
        boxShadow: "var(--shadow-lg)",
        transition: "var(--transition)",
      }}
    >
      <TrendingUp />
      <h3 style={{ color, fontSize: "2rem", marginBottom: "10px" }}>{count}</h3>
      <p style={{ color: "var(--text-secondary)", fontWeight: "600", fontSize: "1.1rem" }}>{label}</p>
    </div>
  );
}
