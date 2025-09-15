import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "https://aquarium-backend-5mo3.onrender.com";

const App = () => {
  const [stock, setStock] = useState({ fish: [], invertebrates: [], corals: [] });
  const [editingItem, setEditingItem] = useState(null); // { originalType, index }
  const [editValues, setEditValues] = useState({ name: "", quantity: 1, type: "fish" });
  const [newItem, setNewItem] = useState({ type: "fish", name: "", quantity: 1 });

  // Fetch stock from backend on load
  useEffect(() => {
    fetch(`${API_URL}/stock`)
      .then((res) => res.json())
      .then((data) => setStock(data))
      .catch((err) => console.error("Error fetching stock:", err));
  }, []);

  // Save stock to backend (used for adding new items)
  const saveStock = (updatedStock) => {
    fetch(`${API_URL}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStock),
    })
      .then((res) => res.json())
      .then(() => setStock(updatedStock))
      .catch((err) => console.error("Error saving stock:", err));
  };

  // ---------------- Edit Handlers ----------------
  const handleEditClick = (type, index) => {
    const item = stock[type][index];
    setEditingItem({ originalType: type, index });
    setEditValues({ name: item.name, quantity: item.quantity, type });
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: field === "quantity" ? parseInt(value) || 0 : value
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
        quantity: editValues.quantity
      })
    });

    const updatedStock = await res.json();
    setStock(updatedStock);
    setEditingItem(null);
  } catch (err) {
    console.error("Error updating item:", err);
  }
};

  // ---------------- Add Handlers ----------------
  const handleAddChange = (field, value) => {
    setNewItem({ ...newItem, [field]: field === "quantity" ? parseInt(value) || 1 : value });
  };

  const handleAddItem = () => {
    const updatedStock = { ...stock };
    updatedStock[newItem.type].push({ name: newItem.name, quantity: newItem.quantity });
    saveStock(updatedStock);
    setNewItem({ type: "fish", name: "", quantity: 1 });
  };

  // ---------------- Render ----------------
  const renderColumn = (type) => (
    <div style={{ flex: 1, margin: "0 10px" }}>
      <h2 style={{ textAlign: "center" }}>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      {stock[type].map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Aquarium Stock</h1>

      {/* Add Item */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
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
      <div style={{ display: "flex" }}>
        {renderColumn("fish")}
        {renderColumn("invertebrates")}
        {renderColumn("corals")}
      </div>
    </div>
  );
};

export default App;
