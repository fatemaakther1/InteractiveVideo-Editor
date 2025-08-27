import React, { useState } from "react";
import { Rnd } from "react-rnd";
import type { InteractiveElement } from "../../types";

interface ResizableDraggableElementProps {
  element: InteractiveElement;
  onUpdate: (element: InteractiveElement) => void;
  onSelect: (element: InteractiveElement | null) => void;
  isSelected: boolean;
}

const ResizableDraggableElement: React.FC<ResizableDraggableElementProps> = ({
  element,
  onUpdate,
  onSelect,
  isSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    // Select element when starting to drag
    onSelect(element);
  };

  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false);
    onUpdate({
      ...element,
      x: data.x,
      y: data.y,
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: any,
    delta: any,
    position: any
  ) => {
    setIsResizing(false);
    console.log(ref, position);
    onUpdate({
      ...element,
      x: position.x,
      y: position.y,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.stopPropagation();
    
    // Only select if we're not currently dragging or resizing
    if (!isDragging && !isResizing) {
      onSelect(element);
    }
  };

  const getElementStyle = () => {
    const baseStyle: React.CSSProperties = {
      border: isSelected
        ? "3px solid #2563eb"
        : "2px dashed rgba(255, 255, 255, 0.9)",
      background: "rgba(37, 99, 235, 0.95)", // primary-600 with opacity
      color: "white",
      padding: "14px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: isSelected
        ? "0 8px 25px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.1)",
      cursor: isDragging || isResizing ? "grabbing" : "grab",
      userSelect: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      wordBreak: "break-word",
      transition:
        isDragging || isResizing
          ? "none"
          : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(8px)",
    };

    // Type-specific styling with blue theme variations
    switch (element.type) {
      case "interactive-button":
        baseStyle.background = "rgba(14, 165, 233, 0.95)"; // accent-500
        baseStyle.border = isSelected
          ? "3px solid #0ea5e9"
          : "2px solid rgba(14, 165, 233, 0.8)";
        baseStyle.boxShadow = isSelected
          ? "0 8px 25px rgba(14, 165, 233, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 6px 20px rgba(0, 0, 0, 0.15)";
        break;
      case "interactive-question":
        baseStyle.background = "rgba(59, 130, 246, 0.95)"; // blue-500
        baseStyle.border = isSelected
          ? "3px solid #3b82f6"
          : "2px solid rgba(59, 130, 246, 0.8)";
        baseStyle.minWidth = "220px";
        baseStyle.boxShadow = isSelected
          ? "0 8px 25px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 6px 20px rgba(0, 0, 0, 0.15)";
        break;
      case "image":
        baseStyle.background = "rgba(16, 185, 129, 0.95)"; // emerald-500
        baseStyle.border = isSelected
          ? "3px solid #10b981"
          : "2px solid rgba(16, 185, 129, 0.8)";
        baseStyle.boxShadow = isSelected
          ? "0 8px 25px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 6px 20px rgba(0, 0, 0, 0.15)";
        break;
      case "pointer":
        baseStyle.background = "rgba(245, 158, 11, 0.95)"; // amber-500
        baseStyle.border = isSelected
          ? "3px solid #f59e0b"
          : "2px solid rgba(245, 158, 11, 0.8)";
        baseStyle.boxShadow = isSelected
          ? "0 8px 25px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 6px 20px rgba(0, 0, 0, 0.15)";
        break;
      case "text":
        baseStyle.background = "rgba(37, 99, 235, 0.95)"; // primary-600
        baseStyle.border = isSelected
          ? "3px solid #2563eb"
          : "2px solid rgba(37, 99, 235, 0.8)";
        break;
      default:
        // Default blue styling
        break;
    }

    return baseStyle;
  };

  return (
    <Rnd
      size={{
        width: element.width || 120,
        height: element.height || 50,
      }}
      position={{
        x: element.x,
        y: element.y,
      }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={handleResizeStop}
      minWidth={80}
      minHeight={30}
      bounds="parent"
      enableResizing={
        isSelected
          ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
          : false
      }
      disableDragging={false}
      dragHandleClassName="drag-handle"
      resizeHandleStyles={{
        top: {
          background: "#2563eb",
          border: "2px solid white",
          borderRadius: "4px",
          width: "20px",
          height: "6px",
          top: "-3px",
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
        },
        right: {
          background: "#2563eb",
          border: "2px solid white",
          borderRadius: "4px",
          width: "6px",
          height: "20px",
          right: "-3px",
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
        },
        bottom: {
          background: "#2563eb",
          border: "2px solid white",
          borderRadius: "4px",
          width: "20px",
          height: "6px",
          bottom: "-3px",
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
        },
        left: {
          background: "#2563eb",
          border: "2px solid white",
          borderRadius: "4px",
          width: "6px",
          height: "20px",
          left: "-3px",
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
        },
        bottomRight: {
          background: "#2563eb",
          border: "3px solid white",
          borderRadius: "50%",
          width: "14px",
          height: "14px",
          right: "-7px",
          bottom: "-7px",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
        },
        bottomLeft: {
          background: "#2563eb",
          border: "3px solid white",
          borderRadius: "50%",
          width: "14px",
          height: "14px",
          left: "-7px",
          bottom: "-7px",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
        },
        topRight: {
          background: "#2563eb",
          border: "3px solid white",
          borderRadius: "50%",
          width: "14px",
          height: "14px",
          right: "-7px",
          top: "-7px",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
        },
        topLeft: {
          background: "#2563eb",
          border: "3px solid white",
          borderRadius: "50%",
          width: "14px",
          height: "14px",
          left: "-7px",
          top: "-7px",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
        },
      }}
      resizeHandleClasses={{
        top: "resize-handle-top",
        right: "resize-handle-right",
        bottom: "resize-handle-bottom",
        left: "resize-handle-left",
        bottomRight: "resize-handle-corner",
        bottomLeft: "resize-handle-corner",
        topRight: "resize-handle-corner",
        topLeft: "resize-handle-corner",
      }}
    >
      <div
        className="drag-handle"
        style={{ ...getElementStyle(), height: "100%", width: "100%" }}
        onClick={handleClick}
        data-element-id={element.id}
      >
        {element.type === "image" && element.url ? (
          <img
            src={element.url}
            alt={element.content}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            draggable={false}
          />
        ) : (
          <div>
            {element.content}
            {isSelected && (
              <div
                style={{
                  position: "absolute",
                  top: "-25px",
                  left: "0",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "400",
                  whiteSpace: "nowrap",
                }}
              >
                {element.type}
              </div>
            )}
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default ResizableDraggableElement;
