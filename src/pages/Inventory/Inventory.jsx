import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ImageLightbox from '../../components/ImageLightbox'; 

// Helper: fetch image as base64 and compress
async function urlToBase64(url, quality = 0.5) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // always jpeg for compression
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// تأكد أن جميع الـ endpoints لا تكرر /api
async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects/all`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Projects API fetch failed:", err.message);
    return [];
  }
}

async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory/get-all`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Inventory API fetch failed:", err.message);
    return [];
  }
}

async function addInventory(item) {
  const res = await fetch(`${API_BASE}/inventory/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  return res.ok ? await res.json() : null;
}
async function updateInventory(id, data) {
  const res = await fetch(`${API_BASE}/inventory/update/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok ? await res.json() : null;
}
async function deleteInventory(id) {
  await fetch(`${API_BASE}/inventory/delete/${id}`, { method: 'DELETE' });
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

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: '', type: '', price: '', location: '',
    area: '', bedrooms: '', bathrooms: '', parking: '',
    amenities: '', geoX: '', geoY: '', projectId: '',
    images: []
  });
  const [showAdd, setShowAdd] = useState(false);
  
  const [imageInput, setImageInput] = useState("");
  const [editImageInput, setEditImageInput] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [showView, setShowView] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [mapCenter, setMapCenter] = useState([30.033333, 31.233334]); 

  // Image Lightbox states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

const reloadAll = () => {
  setError("");
  Promise.all([fetchProjects(), fetchInventory()])
    .then(([projectsData, inventoryData]) => {
      setProjects(projectsData);
      setItems(inventoryData);
    })
    .catch(err => {
      console.warn("Reload failed:", err.message);
      setProjects([]);
      setItems([]);
    });
};


  useEffect(() => {
    reloadAll();
  }, []);

  const handleAdd = async () => {
    setShowAdd(false);
    setForm({
      title: '', type: '', price: '', location: '',
      area: '', bedrooms: '', bathrooms: '', parking: '',
      amenities: '', geoX: '', geoY: '', projectId: '',
      images: []
    });
    setImageInput("");
    const created = await addInventory(form);
    if (created) {
      reloadAll();
    }
  };

  const handleDelete = async (id) => {
    await deleteInventory(id);
    reloadAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({ ...item, images: item.images || [] });
    setEditImageInput("");
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    await updateInventory(editItem.id, form);
    reloadAll();
    setShowEdit(false);
    setEditItem(null);
    setEditImageInput("");
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowView(true);
  };

  const handleRowClick = (item) => {
    const x = parseFloat(item.geoX);
    const y = parseFloat(item.geoY);
    if (!isNaN(x) && !isNaN(y)) {
      setMapCenter([x, y]);
    }
  };

  const handleAddImage = async () => {
    if (imageInput.trim()) {
      try {
        const base64 = await urlToBase64(imageInput.trim(), 0.5); // compress
        setForm({ ...form, images: [...(form.images || []), base64] });
        setImageInput("");
      } catch (e) {
        alert("فشل تحميل الصورة من الرابط");
      }
    }
  };
  const handleEditAddImage = async () => {
    if (editImageInput.trim()) {
      try {
        const base64 = await urlToBase64(editImageInput.trim(), 0.5); // compress
        setForm({ ...form, images: [...(form.images || []), base64] });
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
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  // Function to open lightbox
  const openLightbox = (images, initialIndex = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(initialIndex);
    setLightboxOpen(true);
  };

  return (
    <>

          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "220px", 
              zIndex: 100,
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {items.map((item, idx) => {
                const x = parseFloat(item.geoX);
                const y = parseFloat(item.geoY);
                return (
                  !isNaN(x) && !isNaN(y) && (
                    <Marker key={item.id || idx} position={[x, y]}>
                      <Popup>
                        <div style={{ background: "#23272f", color: "#fff", borderRadius: 8, padding: 8 }}>
                          {item.title}
                        </div>
                      </Popup>
                    </Marker>
                  )
                );
              })}
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
            margin: "250px auto",
            maxWidth: 1000,
            height: "120px",
            overflowX: "auto",
            justifyContent: "center",
            textAlign: "center"
          }}>
          <button className="add-btn" onClick={() => setShowAdd(true)} style={{ marginBottom: 12, padding: "6px 12px", fontSize: 13, background: "blue", color: "white", border: "none", borderRadius: 4 }}>Add Inventory</button>
          <div style={{ overflowX: "auto" }} className='table-container'>
          <table style={{ width: "80%", margin: "0 auto", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr>
              {[ "Title", "Type", "Price", "Location", "Area", "Bedrooms", "Bathrooms", "Parking", "Actions" ].map(h => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid #444", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id || idx}
                      onClick={e => {
                        if (e.target.tagName === "BUTTON") return;
                        handleRowClick(item);
                      }}
                      style={{
                        cursor: "pointer",
                        color: "#111",
                        background: idx % 2 === 0 ? "#fafbfc" : "#fff",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#eaf6ff"}
                      onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fafbfc" : "#fff"}
                  >
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.title}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.type}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.price}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.location}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.area}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.bedrooms}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.bathrooms}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.parking}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{item.amenities}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                      <button
                        className="edit-btn"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginRight: "6px"
                        }}
                        onClick={e => { e.stopPropagation(); handleEdit(item); }}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        style={{
                          backgroundColor: "#e74c3c",
                          color: "white",
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginRight: "6px"
                        }}
                        onClick={e => { e.stopPropagation(); handleDelete(item.id); }}>
                        Delete
                      </button>
                      <button
                        className="view-btn"
                        style={{
                          backgroundColor: "#0890ff",
                          color: "white",
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                        onClick={e => { e.stopPropagation(); handleView(item); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAdd && (
            <div className="modal-overlay">
              <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto', width: 200 }}>
                <span className="close-x" onClick={() => setShowAdd(false)}>×</span>
                <h3>Add Inventory</h3>
                {Object.entries(form).map(([key, value]) => {
                  if (key === "projectId") {
                    return (
                      <select
                        key={key}
                        value={value}
                        onChange={e => setForm({ ...form, projectId: e.target.value })}
                        style={{ marginBottom: 8, color: "#111", width: "100%" }}
                      >
                        <option value="">اختر مشروع</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    );
                  }
                  if (key === "images") return null;
                  return (
                    <input
                      key={key}
                      placeholder={key}
                      value={value}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ marginBottom: 8, color: "#111" }}
                    />
                  );
                })}
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
                  {(form.images || []).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="image-thumbnail"
                      title="Click to remove"
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
              <div className="modal scrollable" style={{ maxHeight: 400, overflowY: 'auto' }}>
                <span className="close-x" onClick={() => setShowEdit(false)}>×</span>
                <h3>Edit Inventory</h3>
                {Object.entries(form).map(([key, value]) => {
                  if (key === "images" || key === "projectId") return null;
                  return (
                    <input
                      key={key}
                      placeholder={key}
                      value={value}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ marginBottom: 8 }}
                    />
                  );
                })}
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
                  {(form.images || []).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="image-thumbnail"
                      title="Click to remove"
                      onClick={() => handleRemoveEditImage(i)}
                    />
                  ))}
                </div>
                <button onClick={handleEditSave}>Save</button>
              </div>
            </div>
          )}

          {showView && viewItem && (
            <div className="modal-overlay">
              <div className="modal scrollable"
                style={{
                  maxWidth: 420,
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
                }}>Inventory Details</h2>
                <div>
                  {Object.entries(viewItem)
                    .filter(([k]) => k !== "id" && k !== "geoX" && k !== "geoY" && k !== "images")
                    .map(([key, value]) => (
                      <div key={key}
                        style={{
                          marginBottom: 14,
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #eee",
                          paddingBottom: 6,
                          fontSize: 16
                        }}>
                        <span style={{
                          fontWeight: 600,
                          textTransform: "capitalize",
                          color: "#555"
                        }}>{key}:</span>
                        <span style={{ color: "#333" }}>{value || "N/A"}</span>
                      </div>
                    ))}
                  
                  {/* صور العقار */}
                  {viewItem.images && viewItem.images.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ marginBottom: 12, color: "#333" }}>صور العقار:</h4>
                      <div className="image-gallery">
                        {viewItem.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="image-thumbnail"
                            style={{ cursor: "pointer" }}
                            onClick={() => openLightbox(viewItem.images, i)}
                            title="اضغط لعرض الصورة بحجم كامل"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Lightbox */}
          <ImageLightbox
            images={lightboxImages}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            initialIndex={lightboxInitialIndex}
          />
    </div>
    </>
  );
}