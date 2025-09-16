import React, { useState, useEffect } from "react";
import Card from "./components/Card";
import EditModal from "./components/EditModal";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://aquarium-backend-5mo3.onrender.com";

const App = () => {
  const [stock, setStock] = useState({
    fish: [],
    invertebrates: [],
    corals: [],
  });

  const [newItem, setNewItem] = useState({
    type: "fish",
    name: "",
    quantity: 1,
  });

  const [notification, setNotification] = useState("");

  // Modal & editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { type, index }
  const [editValues, setEditValues] = useState({
    name: "",
    quantity: 1,
    type: "fish",
    names: [],
    photo: "",
  });

  // Fetch stock
  useEffect(() => {
    fetch(`${API_URL}/stock`)
      .then((res) => res.json())
      .then((data) => setStock(sortStock(data)))
      .catch((err) => console.error("Error fetching stock:", err));
  }, []);

  // Sorting
  const sortStock = (data) => {
    const sorted = { ...data };
    Object.keys(sorted).forEach((type) => {
      sorted[type].sort((a, b) => a.name.localeCompare(b.name));
    });
    return sorted;
  };

  // Notifications
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  // Save stock to backend
  const saveStock = async (updatedStock, msg) => {
    try {
      const res = await fetch(`${API_URL}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStock),
      });
      if (!res.ok) throw new Error("Failed to save stock");
      setStock(sortStock(updatedStock));
      if (msg) showNotification(msg);
      return true;
    } catch (err) {
      console.error("Error saving stock:", err);
      showNotification("Failed to save stock");
      return false;
    }
  };

  // Add handlers
  const handleAddChange = (field, value) => {
    setNewItem({
      ...newItem,
      [field]: field === "quantity" ? parseInt(value) || 1 : value,
    });
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const updatedStock = { ...stock };
    updatedStock[newItem.type].push({
      name: newItem.name,
      quantity: newItem.quantity,
      names: [],
      photo: "",
    });
    saveStock(updatedStock, "Item added!");
    setNewItem({ type: "fish", name: "", quantity: 1 });
  };

  // Render column
  const renderColumn = (type) => (
    <div style={{ flex: 1, margin: "0 10px" }}>
      <h2 style={{ textAlign: "center" }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h2>
      {stock[type].map((item, index) => (
        <Card
          key={index}
          item={{ ...item, type }}
          onSelect={() => {
            setEditingItem({ type, index });
            const currentItem = stock[type][index];
            setEditValues({
              name: currentItem.name,
              quantity: currentItem.quantity,
              type,
              names: currentItem.names || [],
              photo: currentItem.photo || "",
            });
            setIsModalOpen(true);
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Aquarium Stock
      </h1>

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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {renderColumn("fish")}
        {renderColumn("invertebrates")}
        {renderColumn("corals")}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editValues={editValues}
        onChange={(field, value) =>
          setEditValues((prev) => ({
            ...prev,
            [field]: field === "quantity" ? parseInt(value) || 1 : value,
          }))
        }
        onSave={async () => {
          if (!editingItem) return;
          const { type, index } = editingItem;
          const updatedStock = { ...stock };
          updatedStock[type][index] = { ...updatedStock[type][index], ...editValues };
          const success = await saveStock(updatedStock, "Item updated!");
          if (success) setIsModalOpen(false);
        }}
        onDelete={async () => {
          if (!editingItem) return;
          const { type, index } = editingItem;
          const updatedStock = { ...stock };
          updatedStock[type].splice(index, 1);
          const success = await saveStock(updatedStock, "Item deleted!");
          if (success) setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
