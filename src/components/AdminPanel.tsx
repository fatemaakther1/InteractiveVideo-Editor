import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminToolbar from "./admin/AdminToolbar";
import ElementSidebar from "./admin/ElementSidebar";
import VideoCanvas from "./admin/VideoCanvas";
import InspectorPanel from "./admin/InspectorPanel";
import ElementTypeSelector from "./elements/ElementTypeSelector";
import type { ElementType } from "../types";
import { useElements } from "../hooks/useElements";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [showElementModal, setShowElementModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    loadProject,
    saveProject,
  } = useElements(currentTime);

  const handleSaveProject = useCallback(async () => {
    setIsSaving(true);
    try {
      saveProject();
      // Brief delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsSaving(false);
    }
  }, [saveProject]);

  const goToPreview = useCallback(async () => {
    await handleSaveProject();
    navigate("/preview");
  }, [handleSaveProject, navigate]);

  const handleAddElementClick = useCallback(() => {
    setShowElementModal(true);
  }, []);

  const handleElementTypeSelect = useCallback(
    (elementType: ElementType) => {
      addElement(elementType);
    },
    [addElement]
  );

  const onAddElement = useCallback((x: number, y: number) => {
    setShowElementModal(true);
  }, []);
 
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      <AdminToolbar
        onLoadProject={loadProject}
        onSaveProject={handleSaveProject}
        onPreview={goToPreview}
        isSaving={isSaving}
      />

      <main className="flex flex-1 overflow-hidden">
        <ElementSidebar
          elements={elements}
          selectedElement={selectedElement}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddElement={handleAddElementClick}
          onSelectElement={selectElement}
          onDeleteElement={deleteElement}
        />

        <VideoCanvas
          elements={elements}
          selectedElement={selectedElement}
          currentTime={currentTime}
          onAddElement={onAddElement}
          onUpdateElement={updateElement}
          onSelectElement={selectElement}
          onTimeUpdate={setCurrentTime}
        />

        <InspectorPanel
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
        />
      </main>

      <ElementTypeSelector
        isOpen={showElementModal}
        onClose={() => setShowElementModal(false)}
        onSelectType={handleElementTypeSelect}
      />
    </div>
  );
};

export default AdminPanel;
