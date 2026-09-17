import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CardModal({ cardId, boardMembers, onClose, onChanged }) {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [description, setDescription] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [comment, setComment] = useState("");

  const load = () => api.get(`/cards/${cardId}`).then((res) => {
    setCard(res.data);
    setDescription(res.data.description || "");
  });

  useEffect(() => { load(); }, [cardId]);

  const save = async (patch) => {
    const res = await api.patch(`/cards/${cardId}`, patch);
    setCard(res.data);
    onChanged();
  };

  const toggleAssignee = (userId) => {
    const current = card.assignees.map((a) => a._id);
    const next = current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId];
    save({ assignees: next });
  };

  const toggleChecklistItem = (index) => {
    const next = [...card.checklist];
    next[index] = { ...next[index], done: !next[index].done };
    save({ checklist: next });
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    save({ checklist: [...card.checklist, { text: newChecklistItem, done: false }] });
    setNewChecklistItem("");
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await api.post(`/cards/${cardId}/comments`, { text: comment });
    setCard(res.data);
    setComment("");
  };

  const deleteCard = async () => {
    if (!confirm("Delete this card?")) return;
    await api.delete(`/cards/${cardId}`);
    onChanged();
    onClose();
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto py-10 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <input
            value={card.title}
            onChange={(e) => setCard({ ...card, title: e.target.value })}
            onBlur={() => save({ title: card.title })}
            className="text-lg font-semibold text-ink w-full mr-4 -ml-1 px-1 rounded hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-ink">✕</button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">Description</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => save({ description })}
                placeholder="Add a more detailed description…"
                rows={4}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
              />
            </div>

            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">
                Checklist {card.checklist.length > 0 && `(${card.checklist.filter(c => c.done).length}/${card.checklist.length})`}
              </h4>
              <div className="space-y-1.5">
                {card.checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(i)} className="accent-accent" />
                    <span className={item.done ? "line-through text-slate-400" : "text-ink"}>{item.text}</span>
                  </label>
                ))}
              </div>
              <form onSubmit={addChecklistItem} className="mt-2">
                <input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add an item"
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </form>
            </div>

            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">Comments</h4>
              <div className="space-y-3 mb-3">
                {card.comments.map((c, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-ink">{c.user?.name || "Someone"}</span>{" "}
                    <span className="text-slate-400 text-xs">
                      {new Date(c.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <p className="text-slate-600 mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button className="text-sm bg-accent text-white rounded-lg px-3">Post</button>
              </form>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">Assignees</h4>
              <div className="space-y-1.5">
                {boardMembers.map((m) => {
                  const active = card.assignees.some((a) => a._id === m.user._id);
                  return (
                    <button
                      key={m.user._id}
                      onClick={() => toggleAssignee(m.user._id)}
                      className={`w-full flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 transition-colors ${
                        active ? "bg-accent/10" : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-medium"
                        style={{ backgroundColor: m.user.avatarColor || "#2A6F63" }}
                      >
                        {m.user.name?.[0]?.toUpperCase()}
                      </span>
                      {m.user.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">Priority</h4>
              <select
                value={card.priority}
                onChange={(e) => save({ priority: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-200 px-2 py-1.5"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1.5">Due date</h4>
              <input
                type="date"
                value={card.dueDate ? card.dueDate.slice(0, 10) : ""}
                onChange={(e) => save({ dueDate: e.target.value || null })}
                className="w-full text-sm rounded-lg border border-slate-200 px-2 py-1.5"
              />
            </div>

            <button onClick={deleteCard} className="text-sm text-red-500 hover:text-red-600">
              Delete card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
