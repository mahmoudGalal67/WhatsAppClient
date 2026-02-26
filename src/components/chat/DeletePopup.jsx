import { useEffect, useRef } from "react";
import { useChatUI } from "../../context/ChatUIContext";

export default function DeletePopup({ onClose, handleDelete }) {
  const { clearSelection, setSelectedMessages } = useChatUI();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const DeleteFunction = () => {
    handleDelete();
    clearSelection();
    setSelectedMessages([])
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" >
      <div className="bg-[#202c33] p-6 rounded-lg max-w-[480px] w-[90%] flex flex-col gap-12" ref={menuRef}>
        <h2 className="text-lg mb-4 text-left">
          Delete ?
        </h2>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-green-400 cursor-pointer hover:text-green-500 transition-colors hover:bg-green-500/10 px-4 py-2 rounded-3xl">
            Cancel
          </button>
          <button onClick={DeleteFunction} className="text-black font-semibold bg-green-500 px-8 py-2 rounded-3xl cursor-pointer hover:bg-green-600 transition-colors">
            Delete for me
          </button>
        </div>
      </div>
    </div>
  );
}
