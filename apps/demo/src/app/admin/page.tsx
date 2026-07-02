"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type AdminEntry = {
  id: string;
  title: string;
  category: string;
  text: string;
  createdAt: string;
};

type HistorySnapshot = {
  id: string;
  createdAt: string;
  label: string;
  action: string;
  entries: AdminEntry[];
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("benefits");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [busy, setBusy] = useState("");

  const loadAll = useCallback(async () => {
    const [knowledge, historyRes] = await Promise.all([
      fetch("/api/admin/knowledge"),
      fetch("/api/admin/history"),
    ]);

    if (knowledge.ok) {
      const data = await knowledge.json();
      setEntries(data.entries || []);
      setAuthed(true);
    } else {
      setAuthed(false);
    }

    if (historyRes.ok) {
      const data = await historyRes.json();
      setHistory(data.snapshots || []);
    }
  }, []);

  useEffect(() => {
    const bridgeRaw = sessionStorage.getItem("jude_admin_bridge");
    if (bridgeRaw) {
      try {
        const bridge = JSON.parse(bridgeRaw) as { username: string; password: string; ts: number };
        if (Date.now() - bridge.ts < 60000) {
          void fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: bridge.username, password: bridge.password }),
          }).then(() => loadAll());
        }
      } finally {
        sessionStorage.removeItem("jude_admin_bridge");
      }
    }
    void loadAll();
  }, [loadAll]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      setLoginError("Invalid username or password.");
      return;
    }
    await loadAll();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setEntries([]);
    setHistory([]);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaveMessage("");
    const response = await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, text }),
    });
    if (!response.ok) {
      setSaveMessage("Could not save training data.");
      return;
    }
    setTitle("");
    setText("");
    setSaveMessage("Saved. Jude can use this immediately via RAG.");
    await loadAll();
  };

  const handleLearn = async () => {
    setBusy("Rebuilding Jude knowledge index…");
    setSaveMessage("");
    const response = await fetch("/api/admin/relearn", { method: "POST" });
    setBusy("");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setSaveMessage(data.error || "Learn failed.");
      return;
    }
    setSaveMessage("Learn complete — embeddings and index rebuilt.");
    await loadAll();
  };

  const handleRevert = async (snapshotId: string) => {
    setBusy("Reverting…");
    const response = await fetch("/api/admin/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId }),
    });
    setBusy("");
    if (!response.ok) {
      setSaveMessage("Revert failed.");
      return;
    }
    setSaveMessage("Reverted to selected snapshot.");
    await loadAll();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jude-admin-training.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (authed === null) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Loading admin…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <h1>Jude Admin</h1>
          <p className="admin-muted">Train Jude with new knowledge dumps.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="admin-btn admin-btn--primary">
              Sign in
            </button>
          </form>
          <Link href="/" className="admin-link">
            ← Back to Jude
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Jude Training Admin</h1>
          <p className="admin-muted">
            Paste facts, benefits, device notes, or scripts. Use Learn after big content changes.
          </p>
          {busy && <p className="admin-success">{busy}</p>}
          {saveMessage && <p className="admin-success">{saveMessage}</p>}
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn admin-btn--learn" onClick={handleLearn}>
            Learn
          </button>
          <button type="button" className="admin-btn" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="admin-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <form className="admin-card admin-form" onSubmit={handleSave}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hero dispenser integration benefits" required />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="benefits">Benefits</option>
            <option value="integrations">Integrations</option>
            <option value="devices">Devices</option>
            <option value="pricing">Pricing</option>
            <option value="scripts">Voice scripts</option>
            <option value="general">General</option>
          </select>
        </label>
        <label>
          Training text
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste markdown or plain text Jude should know…"
            required
          />
        </label>
        <button type="submit" className="admin-btn admin-btn--primary">
          Save to Jude knowledge
        </button>
      </form>

      <section className="admin-card">
        <h2>Change history ({history.length})</h2>
        {history.length === 0 ? (
          <p className="admin-muted">History appears after saves, relearns, or reverts.</p>
        ) : (
          <ul className="admin-entry-list">
            {history.slice(0, 15).map((snap) => (
              <li key={snap.id}>
                <strong>{snap.label}</strong>
                <span className="admin-muted">
                  {snap.action} · {snap.entries.length} entries · {new Date(snap.createdAt).toLocaleString()}
                </span>
                <button type="button" className="admin-btn admin-btn--small" onClick={() => handleRevert(snap.id)}>
                  Revert to this
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <h2>Recent dumps ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="admin-muted">No training entries yet.</p>
        ) : (
          <ul className="admin-entry-list">
            {entries.slice(0, 20).map((entry) => (
              <li key={entry.id}>
                <strong>{entry.title}</strong>
                <span className="admin-muted">
                  {entry.category} · {new Date(entry.createdAt).toLocaleString()}
                </span>
                <p>{entry.text.slice(0, 180)}{entry.text.length > 180 ? "…" : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/" className="admin-link">
        ← Back to Jude demo
      </Link>
    </div>
  );
}
