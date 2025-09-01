import { useState } from "react";
import { Rnd } from "react-rnd";
import type { InteractiveElement } from "../types";

interface EditableCardProps {
  element: InteractiveElement;
  onUpdate: (id: string, updates: Partial<InteractiveElement>) => void;
}

const EditableCard: React.FC<EditableCardProps> = ({ element, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const toggleStyle = (key: keyof InteractiveElement) => {
    onUpdate(element.id, { [key]: !element[key] });
  };

  return (
    <Rnd
      size={{ width: element.width || 200, height: element.height || 100 }}
      position={{ x: element.x, y: element.y }}
      onDragStop={(e, d) => onUpdate(element.id, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) =>
        onUpdate(element.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...position,
        })
      }
      bounds="parent"
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        padding: "8px",
        overflow: "hidden",
      }}
    >
      {/* Floating Toolbar */}
      {showToolbar && (
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "0",
            display: "flex",
            gap: "6px",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "4px 6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          <button onClick={() => toggleStyle("bold")}>
            <b>B</b>
          </button>
          <button onClick={() => toggleStyle("italic")}>
            <i>I</i>
          </button>
          <button onClick={() => toggleStyle("underline")}>
            <u>U</u>
          </button>
          <select
            value={element.fontSize || 16}
            onChange={(e) =>
              onUpdate(element.id, { fontSize: parseInt(e.target.value) })
            }
          >
            {[12, 14, 16, 18, 20, 24, 28].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
          <input
            type="color"
            value={element.color || "#000000"}
            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
          />
        </div>
      )}

      {/* Content */}
      {element.type === "image" ? (
        element.url ? (
          <img
            src={element.url}
            alt={element.content}
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
            <div className="text-center">
              <i className="fas fa-plus text-3xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-500 font-medium">No Image</p>
              <p className="text-xs text-gray-400">Add URL in Inspector</p>
            </div>
          </div>
        )
      ) : isEditing ? (
        <textarea
          autoFocus
          defaultValue={element.content}
          onBlur={(e) => {
            onUpdate(element.id, { content: e.target.value });
            setIsEditing(false);
            setShowToolbar(false);
          }}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            resize: "none",
            outline: "none",
            fontWeight: element.bold ? "bold" : "normal",
            fontStyle: element.italic ? "italic" : "normal",
            textDecoration: element.underline ? "underline" : "none",
            fontSize: element.fontSize || 16,
            color: element.color || "#000",
          }}
        />
      ) : (
        <div
          onDoubleClick={() => {
            setIsEditing(true);
            setShowToolbar(true);
          }}
          style={{
            fontWeight: element.bold ? "bold" : "normal",
            fontStyle: element.italic ? "italic" : "normal",
            textDecoration: element.underline ? "underline" : "none",
            fontSize: element.fontSize || 16,
            color: element.color || "#000",
            width: "100%",
            height: "100%",
            cursor: "text",
          }}
        >
          {element.content}
        </div>
      )}
    </Rnd>
  );
};

export default EditableCard;
