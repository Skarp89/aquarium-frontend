import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "https://aquarium-backend-5mo3.onrender.com";

const App = () => {
  const [stock, setStock] = useState({ fish: [], invertebrates: [], corals: [] });
  const [editingItem, setEditingItem] = useState(null); // { originalType, index }
  const [editValues, setEditValues] = useState({ name: "", quantity: 1, type: "fish" });
  const [newItem, setNewItem] = useState({ type: "fish", name: "", quantity: 1 });
  const [notification, setNotification] = useState("");

  // ---------------- Fetch stock ----------------
  useEffect(() => {
    fetch(`${API_URL}/stock`)
      .then((res) => res.json())
      .then((data) => setStock(sortStock(data)))
      .catch((err) => console.error("Error fetching stock:", err));
  }, []);

  // ---------------- Sorting ----------------
  const sortStock = (data) => {
    const sorted = { ...data };
    Object.keys(sorted).forEach((type) => {
      sorted[type].sort((a, b) => a.name.localeCompare(b.name));
    });
    return sorted;
  };

  // ---------------- Notifications ----------------
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  // ---------------- Save Stock ----------------
  const saveStock = (updatedStock, msg) => {
    fetch(`${API_URL}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStock),
    })
      .then((res) => res.json())
      .then(() => {
        setStock(sortStock(updatedStock));
        if (msg) showNotification(msg);
      })
      .catch((err) => console.error("Error saving stock:", err));
  };

  // ---------------- Edit Handlers ----------------
  const handleEditClick = (type, index) => {
    const item = stock[type][index];
    setEditingItem({ originalType: type, index });
    setEditValues({ name: item.name, quantity: item.quantity, type });
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: field === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleEditSave = async () => {
    const { originalType, index } = editingItem;
    const originalItem = stock[originalType][index];

    try {
      const res = await fetch(`${API_URL}/stock/${encodeURIComponent(originalItem.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newName: editValues.name,
          newType: editValues.type,
          quantity: editValues.quantity,
        }),
      });

      const updatedStock = await res.json();
      setStock(sortStock(updatedStock));
      setEditingItem(null);
      showNotification("Item updated!");
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  // ---------------- Add Handlers ----------------
  const handleAddChange = (field, value) => {
    setNewItem({ ...newItem, [field]: field === "quantity" ? parseInt(value) || 1 : value });
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const updatedStock = { ...stock };
    updatedStock[newItem.type].push({ name: newItem.name, quantity: newItem.quantity });
    saveStock(updatedStock, "Item added!");
    setNewItem({ type: "fish", name: "", quantity: 1 });
  };

  // ---------------- Delete Handler ----------------
  const handleDelete = (type, index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const updatedStock = { ...stock };
    updatedStock[type].splice(index, 1);
    saveStock(updatedStock, "Item deleted!");
  };

  // ---------------- Render Column ----------------
  const renderColumn = (type) => (
    <div style={{ flex: 1, margin: "0 10px" }}>
      <h2 style={{ textAlign: "center" }}>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      {stock[type].map((item, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            background: "#cfe2ff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
          }}
        >
          {/* Delete Button */}
          <button
            onClick={() => handleDelete(type, index)}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              border: "none",
              background: "#ff4d4f",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ×
          </button>

          {editingItem && editingItem.originalType === type && editingItem.index === index ? (
            <>
              <input
                type="text"
                value={editValues.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                style={{ flex: 2, marginRight: "5px" }}
              />
              <input
                type="number"
                value={editValues.quantity}
                onChange={(e) => handleEditChange("quantity", e.target.value)}
                style={{ width: "60px", marginRight: "5px" }}
              />
              <select
                value={editValues.type}
                onChange={(e) => handleEditChange("type", e.target.value)}
                style={{ marginRight: "5px" }}
              >
                <option value="fish">Fish</option>
                <option value="invertebrates">Invertebrates</option>
                <option value="corals">Corals</option>
              </select>
              <button onClick={handleEditSave}>Save</button>
            </>
          ) : (
            <>
              <span>{item.name} ({item.quantity})</span>
              <Pencil
                size={16}
                style={{ cursor: "pointer" }}
                onClick={() => handleEditClick(type, index)}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );

  // ---------------- Render ----------------
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Aquarium Stock</h1>

      {notification && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "#0d6efd",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {notification}
        </div>
      )}

      {/* Add Item */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          borderRadius: "8px",
          background: "#e7f1ff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <select
          value={newItem.type}
          onChange={(e) => handleAddChange("type", e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="fish">Fish</option>
          <option value="invertebrates">Invertebrates</option>
          <option value="corals">Corals</option>
        </select>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => handleAddChange("name", e.target.value)}
          style={{ marginRight: "10px", flex: 2 }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => handleAddChange("quantity", e.target.value)}
          style={{ width: "60px", marginRight: "10px" }}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>

      {/* Columns */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
        {renderColumn("fish")}
        {renderColumn("invertebrates")}
        {renderColumn("corals")}
      </div>
    </div>
  );
};

export default App;
