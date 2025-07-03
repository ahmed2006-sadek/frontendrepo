import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

export default function UsersList({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const reloadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers?.();
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateUser({ id: editUser.id, ...form });
      if (response && response.ok) {
        setShowEdit(false);
        reloadUsers();
      } else {
        alert('Error updating user');
      }
    } catch (error) {
      alert('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      const response = await authAPI.deleteUser(id);
      if (response && response.ok) reloadUsers();
      else alert('Error deleting user');
    } catch (error) {
      alert('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const response = await authAPI.addUser(form);
      if (response && response.ok) {
        const result = await response.json();
        setUsers([...users, result]);
        setForm({ name: "", email: "", password: "", role: "" });
        setShowAdd(false);
      } else {
        const errorText = await response.text();
        alert(`Error adding user: ${errorText}`);
      }
    } catch (error) {
      alert('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    admin: "ADMIN",
    sales_admin: "SALES_ADMIN",
    team_leader: "TEAM_LEADER",
    sales_rep: "SALES_REP"
  };

  return (
    <div className="projects-page" style={{ maxWidth: 900, margin: "0 auto", padding: 10 }}>
      {isAdmin && (
        <button onClick={() => setShowAdd(true)} disabled={loading}>
          {loading ? "Loading..." : "Add User"}
        </button>
      )}

      <table style={{ width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            {["Name", "Email", "Password", "Role", ...(isAdmin ? ["Edit", "Delete"] : [])].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 4}>{loading ? "Loading users..." : "No users found"}</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>******</td>
                <td>{roleLabels[user.role] || user.role}</td>
                {isAdmin && (
                  <>
                    <td><button onClick={() => handleEdit(user)}>Edit</button></td>
                    <td><button onClick={() => handleDelete(user.id)}>Delete</button></td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {(showEdit || showAdd) && (
        <div className="modal-overlay">
          <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto', maxWidth: 200 }}>
            <span onClick={() => { setShowEdit(false); setShowAdd(false); }} className='close-x'>×</span>
            <h3>{showEdit ? "Edit User" : "Add New User"}</h3>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="">Select Role</option>
              <option value="admin">ADMIN</option>
              <option value="sales_admin">SALES_ADMIN</option>
              <option value="team_leader">TEAM_LEADER</option>
              <option value="sales_rep">SALES_REP</option>
            </select>
            <button onClick={showEdit ? handleEditSave : handleAddUser}>
              {loading ? "Processing..." : (showEdit ? "Save" : "Add")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
