import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUrls } from "../hooks/useUrls";
import CreateUrlModal from "../components/CreateUrlModal";
import { getErrorMessage } from "../lib/getErrorMessage";

const SHORT_URL_BASE =
  import.meta.env.VITE_SHORT_URL_BASE ?? "http://localhost:5000";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: urls, isLoading, isError, error } = useUrls();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleCopy = async (shortCode: string, id: string) => {
    await navigator.clipboard.writeText(`${SHORT_URL_BASE}/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Your short codes</h1>
            {user && <p className="dashboard-user">Signed in as {user.email}</p>}
          </div>
          <div className="header-actions">
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: "auto" }}>
              + New short code
            </button>
            <button onClick={handleLogout} className="btn-secondary">
              Log out
            </button>
          </div>
        </header>

        {isLoading && <p className="status-text">Loading your links…</p>}

        {isError && <p className="form-error">{getErrorMessage(error)}</p>}

        {!isLoading && !isError && urls?.length === 0 && (
          <div className="empty-state">
            <p>You haven&apos;t created any short codes yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: "auto" }}>
              Create your first one
            </button>
          </div>
        )}

        <ul className="url-list">
          {urls?.map((url) => (
            <li key={url.id} className="url-item">
              <div className="url-info">
                <p className="url-title">{url.title}</p>
                <p className="url-original">{url.orignalUrl}</p>
                <p className="url-short">
                  {SHORT_URL_BASE}/{url.shortCode}
                </p>
              </div>
              <button
                onClick={() => handleCopy(url.shortCode, url.id)}
                className="btn-copy"
              >
                {copiedId === url.id ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <CreateUrlModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;