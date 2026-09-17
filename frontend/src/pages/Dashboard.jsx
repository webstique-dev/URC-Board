import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/boards").then((res) => setBoards(res.data));
  };

  useEffect(() => {
    load();
    setLoading(false);
  }, []);

  const createBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await api.post("/boards", { title });
    setBoards([res.data, ...boards]);
    setTitle("");
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === "admin" ? "Boards you manage" : "Boards you're a part of"}
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            + New project
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={createBoard} className="mb-8 flex gap-2 max-w-md">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project name"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <button className="bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg px-4 py-2">
            Create
          </button>
        </form>
      )}

      {!loading && boards.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-300 rounded-xl">
          <p className="text-slate-500">
            {user?.role === "admin"
              ? "No projects yet — create your first board above."
              : "You haven't been added to any projects yet."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board._id}
            to={`/boards/${board._id}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-accent/50 hover:shadow-sm transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg mb-4 flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: board.color || "#2A6F63" }}
            >
              {board.title[0]?.toUpperCase()}
            </div>
            <h3 className="font-medium text-ink group-hover:text-accent-dark transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{board.description}</p>
            )}
            <div className="flex items-center mt-4 -space-x-2">
              {board.members?.slice(0, 5).map((m) => (
                <span
                  key={m.user._id}
                  title={m.user.name}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ backgroundColor: m.user.avatarColor || "#2A6F63" }}
                >
                  {m.user.name?.[0]?.toUpperCase()}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
