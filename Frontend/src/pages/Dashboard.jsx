import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  // =========================
  // USER & TODOS
  // =========================
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);

  // =========================
  // ADD TODO
  // =========================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // =========================
  // EDIT TODO
  // =========================
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // =========================
  // UI
  // =========================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================
  // SEARCH
  // =========================
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const userResponse = await API.get("/auth/me");
        setUser(userResponse.data.user);

        const todoResponse = await API.get("/todos");
        setTodos(todoResponse.data.todos);
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);

        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // =========================
  // ADD TODO
  // =========================

  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Todo title is required");
      return;
    }

    try {
      setError("");

      const response = await API.post("/todos", {
        title: title.trim(),
        description: description.trim(),
      });

      setTodos((prev) => [response.data.todo, ...prev]);

      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("ADD TODO ERROR:", error);

      setError(error.response?.data?.message || "Failed to add todo");
    }
  };

  // =========================
  // TOGGLE TODO
  // =========================

  const handleToggle = async (todo) => {
    try {
      setError("");

      const response = await API.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });

      setTodos((prev) =>
        prev.map((item) => (item._id === todo._id ? response.data.todo : item)),
      );
    } catch (error) {
      console.error("TOGGLE TODO ERROR:", error);

      setError(error.response?.data?.message || "Failed to update todo");
    }
  };

  // =========================
  // DELETE TODO
  // =========================

  const handleDelete = async (id) => {
    try {
      setError("");

      await API.delete(`/todos/${id}`);

      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("DELETE TODO ERROR:", error);

      setError(error.response?.data?.message || "Failed to delete todo");
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // =========================
  // UPDATE TODO
  // =========================

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) {
      setError("Todo title is required");
      return;
    }

    try {
      setError("");

      const response = await API.put(`/todos/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });

      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? response.data.todo : todo)),
      );

      cancelEdit();
    } catch (error) {
      console.error("UPDATE TODO ERROR:", error);

      setError(error.response?.data?.message || "Failed to update todo");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearch = () => {
    setSearchText(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchText("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (!searchText) return true;

    const text = searchText.toLowerCase();

    return (
      todo.title?.toLowerCase().includes(text) ||
      todo.description?.toLowerCase().includes(text)
    );
  });

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }

    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <nav className="h-[97px] bg-white border-b border-gray-200">
        <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>

            <p className="text-sm text-gray-500">Manage your tasks</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}

      <main className="h-[calc(100vh-97px)] max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-hidden">
        {/* USER INFO */}

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h2>

          <p className="text-gray-500 mt-1">{user?.email}</p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <p>{error}</p>

            <button onClick={() => setError("")} className="text-xl font-bold">
              ×
            </button>
          </div>
        )}

        {/* ========================= */}
        {/* TWO COLUMNS */}
        {/* ========================= */}

        <div className="h-[calc(100%-90px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================= */}
          {/* LEFT SIDE */}
          {/* ========================= */}

          <div className="lg:col-span-4 h-full min-h-0">
            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* HEADER */}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Todo</h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Create a new task
                  </p>
                </div>

                {/* SLIDER */}

                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    sidebarOpen ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      sidebarOpen ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* FORM */}

              {sidebarOpen && (
                <form onSubmit={handleAddTodo} className="space-y-5">
                  {/* TITLE */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter todo title"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      rows="6"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ADD BUTTON */}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    + Add Todo
                  </button>
                </form>
              )}

              {!sidebarOpen && (
                <div className="py-8 text-center">
                  <p className="text-gray-500 text-sm">
                    Add Todo panel is hidden
                  </p>

                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-3 text-blue-600 font-medium text-sm"
                  >
                    Open panel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================= */}
          {/* RIGHT SIDE */}
          {/* ========================= */}

          <div className="lg:col-span-8 h-full min-h-0">
            <div className="h-full min-h-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              {/* HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Todos</h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage all your tasks
                  </p>
                </div>

                <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">
                  {filteredTodos.length}{" "}
                  {filteredTodos.length === 1 ? "Todo" : "Todos"}
                </div>
              </div>

              {/* SEARCH */}

              <div className="flex gap-2 mb-4 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search todos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  Search
                </button>
              </div>

              {/* SEARCH RESULT */}

              {searchText && (
                <div className="mb-4 text-sm text-gray-500 flex-shrink-0">
                  Search:
                  <span className="font-semibold text-gray-800 ml-1">
                    "{searchText}"
                  </span>
                  <button
                    onClick={handleClearSearch}
                    className="ml-3 text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* ========================= */}
              {/* ONLY THIS PART SCROLLS */}
              {/* ========================= */}

              <div
                className="
                  flex-1
                  min-h-0
                  overflow-y-auto
                  pr-3
                  space-y-4

                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-gray-100
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
                "
              >
                {filteredTodos.length === 0 ? (
                  <div className="py-16 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {searchText ? "No todos found" : "No todos yet"}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      {searchText
                        ? "Try another search."
                        : "Create your first todo from the left panel."}
                    </p>
                  </div>
                ) : (
                  filteredTodos.map((todo) => (
                    <div
                      key={todo._id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                    >
                      {/* EDIT MODE */}

                      {editingId === todo._id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                          />

                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-blue-500"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdate(todo._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium"
                            >
                              Save
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL TODO */

                        <div className="flex items-start gap-4">
                          {/* CHECKBOX */}

                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggle(todo)}
                            className="w-5 h-5 mt-1.5 cursor-pointer flex-shrink-0"
                          />

                          {/* CONTENT */}

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-lg font-semibold break-words ${
                                todo.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {todo.title}
                            </h3>

                            {todo.description && (
                              <p
                                className={`text-sm mt-1 break-words ${
                                  todo.completed
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {todo.description}
                              </p>
                            )}
                          </div>

                          {/* ACTIONS */}

                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEdit(todo)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(todo._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
