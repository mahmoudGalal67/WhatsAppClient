import { Copy, Flag, Forward, Reply, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import DeletePopup from "./DeletePopup";
import { useChatUI } from "../../context/ChatUIContext";

export default function SelectionBar({ handleClick }) {
  const { selectionMode, selectedMessages, clearSelection } = useChatUI();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCase = () => {
    switch (selectionMode) {
      case 'delete':
        setConfirmDelete(true);
        break;
      case 'copy':
        handleClick();
        break;
    }
  }
  return (
    <div className="h-14 bg-[#202c33] flex items-center justify-between px-4 border-b border-[#2a3942] absolute bottom-0 left-0 right-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={clearSelection} className="cursor-pointer">
          <X />
        </button>
        <span>{selectedMessages.length} selected</span>
      </div>

      <button
        onClick={handleCase}
        className="text-red-400 hover:text-red-600 transition cursor-pointer"
      >
        {selectionMode === 'delete' && <Trash2 size={25} color="red" />}
        {selectionMode === 'copy' && <Copy size={25} color="blue" />}
        {selectionMode === 'forward' && selectedMessages.length !== 0 && <Forward size={25} color="green" />}
        {selectionMode === 'star' && <Star size={25} color="yellow" />}
        {selectionMode === 'report' && <Flag size={25} color="orange" />}
        {selectionMode === 'reply' && <Reply size={25} color="purple" />}
      </button>


      {
        confirmDelete && (
          <DeletePopup onClose={() => setConfirmDelete(false)} handleDelete={handleClick} />
        )
      }
    </div>
  );
}
