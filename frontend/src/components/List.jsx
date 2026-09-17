import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api/axios.js";
import Card from "./Card.jsx";

export default function List({ list, onAddCard, onOpenCard, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const submitCard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddCard(list._id, title);
    setTitle("");
    setAdding(false);
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    if (listTitle.trim() && listTitle !== list.title) {
      await api.patch(`/lists/${list._id}`, { title: listTitle });
      onChanged();
    }
  };

  const removeList = async () => {
    if (!confirm(`Delete "${list.title}" and all its cards?`)) return;
    await api.delete(`/lists/${list._id}`);
    onChanged();
  };

  return (
    <div className="w-72 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {editingTitle ? (
          <input
            autoFocus
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            className="text-sm font-medium bg-white rounded px-2 py-1 w-full mr-2"
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className="text-sm font-medium text-ink cursor-text"
          >
            {list.title}
            <span className="text-slate-400 font-normal ml-1.5">{list.cards.length}</span>
          </h3>
        )}
        <button onClick={removeList} className="text-slate-400 hover:text-red-500 text-xs">
          ✕
        </button>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2 space-y-2 pb-2 min-h-[8px] rounded-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/5" : ""
            }`}
          >
            {list.cards.map((card, index) => (
              <Draggable key={card._id} draggableId={card._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <Card card={card} dragging={dragSnapshot.isDragging} onClick={() => onOpenCard(card._id)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="px-2 pb-2">
        {adding ? (
          <form onSubmit={submitCard}>
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitCard(e);
                }
              }}
              placeholder="Card title"
              rows={2}
              className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <div className="flex gap-2 mt-1.5">
              <button className="text-sm bg-accent text-white rounded-lg px-3 py-1">Add</button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm text-slate-500">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-left text-sm text-slate-500 hover:bg-slate-200 rounded-lg px-2 py-1.5"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
