import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ImageLightbox from '../../components/ImageLightbox';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects/all`);
  return res.ok ? await res.json() : [];
}

async function fetchInventory() {
  const res = await fetch(`${API_BASE}/inventory/get-all`);
  return res.ok ? await res.json() : [];
}

async function addProject(project) {
  const res = await fetch(`${API_BASE}/projects/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  return res.ok ? await res.json() : null;
}

async function updateProject(id, data) {
  const res = await fetch(`${API_BASE}/projects/update/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok ? await res.json() : null;
}

function getInventoryItems() {
  const saved = localStorage.getItem('inventory_items');
  return saved ? JSON.parse(saved) : [];
}

function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1 });
    }
  }, [position, map]);
  return null;
}

async function urlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  useEffect(() => {
    fetchProjects().then(setProjects);
    fetchInventory().then(setAllInventory);
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    geoX: "",
    geoY: "",
    images: []
  });

  const [showView, setShowView] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    geoX: "",
    geoY: "",
    images: []
  });

  const [mapCenter, setMapCenter] = useState([30.033333, 31.233334]); 

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  const reloadAll = () => {
    fetchProjects().then(setProjects);
    fetchInventory().then(setAllInventory);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const handleAdd = async () => {
    setShowAdd(false);
    setForm({ name: "", description: "", geoX: "", geoY: "", images: [] });
    setImageInput("");
    const created = await addProject(form);
    if (created) {
      reloadAll();
    }
  };

  const handleView = (project) => {
    setViewProject(project);
    setShowView(true);
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
      geoX: project.geoX || "",
      geoY: project.geoY || "",
      images: project.images || []
    });
    setEditImageInput("");
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    await updateProject(editProject.id, editForm);
    setShowEdit(false);
    setEditProject(null);
    setEditImageInput("");
    reloadAll();
  };

  const [focusMarker, setFocusMarker] = useState(null);

  const handleProjectNameClick = (project, e) => {
    e.stopPropagation();
    const x = parseFloat(project.geoX);
    const y = parseFloat(project.geoY);
    if (!isNaN(x) && !isNaN(y)) {
      setMapCenter([x, y]);
      setFocusMarker({ x, y, label: project.name });
    }
  };

  const handleInventoryRowClick = (item) => {
    const x = parseFloat(item.geoX);
    const y = parseFloat(item.geoY);
    if (!isNaN(x) && !isNaN(y)) {
      setMapCenter([x, y]);
      setFocusMarker({ x, y, label: item.title });
    }
  };

  const [imageInput, setImageInput] = useState("");
  const [editImageInput, setEditImageInput] = useState("");

  const handleAddImage = async () => {
    if (imageInput.trim()) {
      try {
        const base64 = await urlToBase64(imageInput.trim());
        setForm({ ...form, images: [...form.images, base64] });
        setImageInput("");
      } catch (e) {
        alert("فشل تحميل الصورة من الرابط");
      }
    }
  };
  const handleEditAddImage = async () => {
    if (editImageInput.trim()) {
      try {
        const base64 = await urlToBase64(editImageInput.trim());
        setEditForm({ ...editForm, images: [...editForm.images, base64] });
        setEditImageInput("");
      } catch (e) {
        alert("فشل تحميل الصورة من الرابط");
      }
    }
  };

  const handleRemoveImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };
  const handleRemoveEditImage = (idx) => {
    setEditForm({ ...editForm, images: editForm.images.filter((_, i) => i !== idx) });
  };

  const openLightbox = (images, initialIndex = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(initialIndex);
    setLightboxOpen(true);
  };

  return (
    <div style={{ padding: 40 }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "220px",
          zIndex: 10,
          borderRadius: 0,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {allInventory.map((item) => {
            const x = parseFloat(item.geoX);
            const y = parseFloat(item.geoY);
            return (
              !isNaN(x) && !isNaN(y) && (
                <Marker key={item.id} position={[x, y]}>
                  <Popup>{item.title}</Popup>
                </Marker>
              )
            );
          })}
          {focusMarker && (
            <Marker position={[focusMarker.x, focusMarker.y]}>
              <Popup>{focusMarker.label}</Popup>
            </Marker>
          )}
          <FlyToMarker position={mapCenter} />
        </MapContainer>
      </div>

          <div 
          className="projects-page"
          style={{
            background: "",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: 20,
            margin: "210px auto",
            maxWidth: 1000,
            height: "120px",
            overflowX: "auto",
            justifyContent: "center",
            textAlign: "center"
          }}>
      <button className="add-btn" onClick={() => setShowAdd(true)} style={{ marginBottom: 12, padding: "6px 12px", fontSize: 13, background: "blue", color: "white", border: "none", borderRadius: 4 }}>Add Project</button>

      <div style={{ overflowX: "auto" }} className='table-container'>
        <table style={{ width: "80%", margin: "0 auto", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr>
              {[ "Project Name", "Description", "Inventory Count", "Actions" ].map(h => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid #444", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project, idx) => (
              <tr key={project.id || idx}
                  style={{
                    cursor: "pointer",
                    color: "#111",
                    background: idx % 2 === 0 ? "#fafbfc" : "#fff",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#eaf6ff"}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fafbfc" : "#fff"}
              >
                <td
                  style={{ padding: "10px 8px", borderBottom: "1px solid #eee", color: "#0890ff", cursor: "pointer", fontWeight: 600 }}
                  onClick={e => handleProjectNameClick(project, e)}
                  title="Show project location on map"
                >
                  {project.name}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{project.description}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                  {
                    allInventory.filter(inv => inv.projectId === project.id).length
                  }
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                  <button
                    className="view-btn"
                    style={{
                      backgroundColor: "#0890ff",
                      color: "white",
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: 8
                    }}
                    onClick={e => { e.stopPropagation(); handleView(project); }}>
                    View
                  </button>
                  <button
                    className="edit-btn"
                    style={{
                      backgroundColor: "#222",
                      color: "white",
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                    onClick={e => { e.stopPropagation(); handleEdit(project); }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
</div>
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto', maxWidth: 200 }}>
            <span className="close-x" onClick={() => setShowAdd(false)}>×</span>
            <h3>Add Project</h3>
            <input
              placeholder="Project Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
            />
            <input
              placeholder="Latitude (X)"
              value={form.geoX || ""}
              onChange={e => setForm({ ...form, geoX: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
              type="number"
              step="any"
            />
            <input
              placeholder="Longitude (Y)"
              value={form.geoY || ""}
              onChange={e => setForm({ ...form, geoY: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
              type="number"
              step="any"
            />
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <input
                placeholder="Image URL from Cloudinary"
                value={imageInput}
                onChange={e => setImageInput(e.target.value)}
                style={{ flex: 1, color: "#111" }}
              />
              <button
                type="button"
                onClick={handleAddImage}
                style={{
                  marginLeft: 6,
                  background: "#4caf50",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer"
                }}
                title="Add Image"
              >✔</button>
            </div>
            <div className="image-gallery">
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="image-thumbnail"
                  title="اضغط لحذف الصورة"
                  onClick={() => handleRemoveImage(i)}
                />
              ))}
            </div>
            <button onClick={handleAdd}>Save</button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="modal-overlay">
          <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto', minWidth: 320 }}>
            <span className="close-x" onClick={() => setShowEdit(false)}>×</span>
            <h3>Edit Project</h3>
            <input
              placeholder="Project Name"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
            />
            <input
              placeholder="Description"
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
            />
            <input
              placeholder="Latitude (X)"
              value={editForm.geoX || ""}
              onChange={e => setEditForm({ ...editForm, geoX: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
              type="number"
              step="any"
            />
            <input
              placeholder="Longitude (Y)"
              value={editForm.geoY || ""}
              onChange={e => setEditForm({ ...editForm, geoY: e.target.value })}
              style={{ marginBottom: 8, width: "100%", color: "#111" }}
              type="number"
              step="any"
            />
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <input
                placeholder="Image URL from Cloudinary"
                value={editImageInput}
                onChange={e => setEditImageInput(e.target.value)}
                style={{ flex: 1, color: "#111" }}
              />
              <button
                type="button"
                onClick={handleEditAddImage}
                style={{
                  marginLeft: 6,
                  background: "#4caf50",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer"
                }}
                title="Add Image"
              >✔</button>
            </div>
            <div className="image-gallery">
              {editForm.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="image-thumbnail"
                  title="اضغط لحذف الصورة"
                  onClick={() => handleRemoveEditImage(i)}
                />
              ))}
            </div>
            <button onClick={handleEditSave}>Save</button>
          </div>
        </div>
      )}

      {showView && viewProject && (
        <div className="modal-overlay">
          <div className="modal scrollable"
            style={{
              maxWidth: 500,
              minWidth: 320,
              padding: 24,
              background: "#fff",
              color: "#222",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)"
            }}>
            <span className="close-x" onClick={() => setShowView(false)}
              style={{
                fontSize: 22,
                cursor: "pointer",
                position: "absolute",
                top: 10,
                right: 20
              }}>×</span>
            <h2 style={{
              marginBottom: 18,
              color: "#0890ff",
              textAlign: "center",
              letterSpacing: 1
            }}>{viewProject.name}</h2>
            <div style={{ marginBottom: 16, color: "#444" }}>{viewProject.description}</div>
            {viewProject.images && viewProject.images.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ marginBottom: 12, color: "#333" }}>صور المشروع:</h4>
                <div className="image-gallery">
                  {viewProject.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="image-thumbnail"
                      style={{ cursor: "pointer" }}
                      onClick={() => openLightbox(viewProject.images, i)}
                      title="اضغط لعرض الصورة بحجم كامل"
                    />
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 12, color: "#333" }}>العقارات المرتبطة:</h4>
              {allInventory.filter(inv => inv.projectId === viewProject.id).map((item, idx) => (
                <div key={item.id || idx} style={{
                  padding: 12,
                  marginBottom: 8,
                  background: "#f8f9fa",
                  borderRadius: 8,
                  border: "1px solid #e9ecef"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: "#666" }}>{item.type} - {item.price}</div>
                  {item.images && item.images.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>صور العقار:</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {item.images.map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #ddd",
                              cursor: "pointer"
                            }}
                            onClick={() => openLightbox(item.images, imgIdx)}
                            title="اضغط لعرض الصورة بحجم كامل"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ImageLightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxInitialIndex}
      />
    </div>
  );
}