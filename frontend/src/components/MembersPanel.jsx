import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MembersPanel({ board, onClose, onChanged }) {
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    api.get("/auth/users").then((res) => setAllUsers(res.data));
  }, []);

  const memberIds = board.members.map((m) => m.user._id);
  const nonMembers = allUsers.filter((u) => !memberIds.includes(u._id));

  const addMember = async () => {
    if (!selected) return;
    const res = await api.post(`/boards/${board._id}/members`, { userId: selected, role: "member" });
    onChanged(res.data);
    setSelected("");
  };

  const removeMember = async (userId) => {
    const res = await api.delete(`/boards/${board._id}/members/${userId}`);
    onChanged({ ...board, members: res.data.members });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Team on {board.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink">✕</button>
        </div>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {board.members.map((m) => (
            <div key={m.user._id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ backgroundColor: m.user.avatarColor || "#2A6F63" }}
                >
                  {m.user.name?.[0]?.toUpperCase()}
                </span>
                <span className="text-ink">{m.user.name}</span>
                {m.role === "manager" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent-dark font-medium">
                    Manager
                  </span>
                )}
              </div>
              <button onClick={() => removeMember(m.user._id)} className="text-slate-400 hover:text-red-500 text-xs">
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 text-sm rounded-lg border border-slate-200 px-2 py-1.5"
          >
            <option value="">Add an employee…</option>
            {nonMembers.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <button onClick={addMember} className="text-sm bg-accent text-white rounded-lg px-3">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
