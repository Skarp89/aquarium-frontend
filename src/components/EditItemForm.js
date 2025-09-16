import React from "react";

const EditItemForm = ({ editValues, onChange, onSave, onDelete, onCancel }) => {
  // Ensure editValues always has defaults
  const values = {
    names: [],
    quantity: 1,
    photo: "",
    type: "fish",
    ...editValues,
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange("photo", reader.result); // Base64 string
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Photo preview with remove button */}
      {values.photo && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={values.photo}
            alt="Preview"
            style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
          />
          <button
            type="button"
            onClick={() => onChange("photo", "")}
            style={{
              padding: "5px 10px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#ff4d4f",
              color: "white",
            }}
          >
            Remove Image
          </button>
        </div>
      )}

      {/* Upload new photo */}
      <input type="file" accept="image/*" onChange={handlePhotoChange} />

      {/* Names input */}
      <input
        type="text"
        value={values.names.join(", ")}
        onChange={(e) =>
          onChange("names", e.target.value.split(",").map((n) => n.trim()))
        }
        placeholder="Individual Names (comma separated)"
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />

      {/* Quantity input */}
      <input
        type="number"
        value={values.quantity}
        onChange={(e) => onChange("quantity", parseInt(e.target.value) || 1)}
        placeholder="Quantity"
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />

      {/* Type select */}
      <select
        value={values.type}
        onChange={(e) => onChange("type", e.target.value)}
        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      >
        <option value="fish">Fish</option>
        <option value="invertebrates">Invertebrates</option>
        <option value="corals">Corals</option>
      </select>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={onSave}
          style={{
            padding: "5px 10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#0d6efd",
            color: "white",
          }}
        >
          Save
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "5px 10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#ff4d4f",
            color: "white",
          }}
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "5px 10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#6c757d",
            color: "white",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditItemForm;
