import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Sales Admin", value: "SALES_ADMIN" },
  { label: "Team Leader", value: "TEAM_LEADER" },
  { label: "Sales Rep", value: "SALES_REP" }
];

export default function AddUser({ open, onClose, onAddUser }) {
  const [form, setForm] = useState({ name: "", password: "", email: "", role: roles[0].value });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (form.name && form.password && form.email) {
      onAddUser({ ...form, id: Date.now() });
      setForm({ name: "", password: "", email: "", role: roles[0].value });
      onClose();
    }
  };

  return (
    <div>
      {open && (
        <div>
          <div>

            <span className="close-x" onClick={onClose}>×</span>
            <h3>Add User</h3>
            <input
              type="text"
              name="name"
              placeholder="User Name"
              value={form.name}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
            />
            <select
              className="role-dropdown"
              name="role"
              value={form.role}
              onChange={handleInputChange}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <button className="add-btn" onClick={handleAdd}>Add</button>

          </div>
          </div>
      )}
    </div>
  );
}