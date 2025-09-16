import React from "react";
import EditItemForm from "./EditItemForm";

const EditModal = ({ isOpen, onClose, editValues, onChange, onSave, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          minWidth: "300px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        <EditItemForm
          editValues={editValues}
          onChange={onChange}
          onSave={() => {
            onSave();
            onClose();
          }}
          onDelete={() => {
            onDelete();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default EditModal;
