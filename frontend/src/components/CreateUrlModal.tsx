import { useState, type FormEvent } from "react";
import { useCreateUrl } from "../hooks/useUrls";
import { getErrorMessage } from "../lib/getErrorMessage";

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateUrlModal = ({ isOpen, onClose }: CreateUrlModalProps) => {
  const [title, setTitle] = useState("");
  const [orignalUrl, setOrignalUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createUrl = useCreateUrl();

  if (!isOpen) return null;

  const resetAndClose = () => {
    setTitle("");
    setOrignalUrl("");
    setFormError(null);
    createUrl.reset();
    onClose();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !orignalUrl.trim()) {
      setFormError("Both fields are required.");
      return;
    }

    try {
      // Basic sanity check before hitting the server
      new URL(orignalUrl);
    } catch {
      setFormError("Enter a full URL, including https://");
      return;
    }

    createUrl.mutate(
      { title: title.trim(), orignalUrl: orignalUrl.trim() },
      { onSuccess: resetAndClose }
    );
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New short code</h2>
            <p className="modal-subtitle">
              Give it a title and paste the link you want to shorten.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="modal-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Portfolio link"
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="orignalUrl" className="form-label">
              Destination URL
            </label>
            <input
              id="orignalUrl"
              type="text"
              value={orignalUrl}
              onChange={(e) => setOrignalUrl(e.target.value)}
              placeholder="https://example.com/very/long/path"
              className="form-input"
            />
          </div>

          {(formError || createUrl.isError) && (
            <p className="form-error">
              {formError ?? getErrorMessage(createUrl.error)}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" onClick={resetAndClose} className="btn-text">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUrl.isPending}
              className="btn-primary"
              style={{ width: "auto" }}
            >
              {createUrl.isPending ? "Creating…" : "Create short code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUrlModal;