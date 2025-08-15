"use client";
import React, { useState } from "react";

function Page() {
  const [note, setNote] = useState("");

  const handleSave = () => {
    // Blob બનાવવું
    const blob = new Blob([note], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Download link create કરવું
    const link = document.createElement("a");
    link.href = url;
    link.download = "note.txt";
    link.click();

    // URL રિલીઝ કરવું
    URL.revokeObjectURL(url);

    // અહીં તમે upload logic મૂકી શકો છો
    // uploadFile(blob);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📝 My NotePad</h1>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your note here..."
        style={{
          width: "100%",
          height: "300px",
          fontSize: "16px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          resize: "vertical",
        }}
      />
      <br />
      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Save as TXT
      </button>
    </div>
  );
}

export default Page;
