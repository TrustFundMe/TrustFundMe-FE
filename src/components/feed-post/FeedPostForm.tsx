"use client";

import { useState, useEffect } from "react";
import type { FeedPost, CreateFeedPostRequest, UpdateFeedPostRequest } from "@/types/feedPost";

interface FeedPostFormProps {
  initialData?: FeedPost;
  onSubmit: (data: CreateFeedPostRequest | UpdateFeedPostRequest) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function FeedPostForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Post",
  isEdit = false,
}: FeedPostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "UPDATE",
    visibility: initialData?.visibility || "PUBLIC",
    status: initialData?.status || "PUBLISHED",
    budgetId: initialData?.budgetId || null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content,
        type: initialData.type,
        visibility: initialData.visibility,
        status: initialData.status,
        budgetId: initialData.budgetId || null,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateFeedPostRequest | UpdateFeedPostRequest = {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        type: formData.type,
        visibility: formData.visibility,
        status: formData.status,
        ...(formData.budgetId && { budgetId: formData.budgetId }),
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feed-post-form">
      {error && (
        <div
          className="mb-4 p-3"
          style={{
            background: "rgba(248, 77, 67, 0.1)",
            border: "1px solid #F84D43",
            borderRadius: 8,
            color: "#F84D43",
          }}
        >
          {error}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="title"
          className="d-block mb-2 fw-bold"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="form-control"
          placeholder="Enter post title..."
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.10)",
            fontSize: 16,
            fontFamily: "var(--font-dm-sans)",
          }}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="content"
          className="d-block mb-2 fw-bold"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Content <span style={{ color: "#F84D43" }}>*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="form-control"
          placeholder="Write your post content..."
          rows={10}
          required
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.10)",
            fontSize: 16,
            fontFamily: "var(--font-dm-sans)",
            resize: "vertical",
          }}
        />
        <div className="text-sm mt-1" style={{ opacity: 0.6 }}>
          {formData.content.length} / 2000 characters
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label
            htmlFor="type"
            className="d-block mb-2 fw-bold"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="form-select"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.10)",
              fontSize: 16,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <option value="UPDATE">Update</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="NEWS">News</option>
          </select>
        </div>

        <div className="col-md-4">
          <label
            htmlFor="visibility"
            className="d-block mb-2 fw-bold"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Visibility
          </label>
          <select
            id="visibility"
            value={formData.visibility}
            onChange={(e) =>
              setFormData({ ...formData, visibility: e.target.value })
            }
            className="form-select"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.10)",
              fontSize: 16,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="FOLLOWERS">Followers Only</option>
          </select>
        </div>

        <div className="col-md-4">
          <label
            htmlFor="status"
            className="d-block mb-2 fw-bold"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="form-select"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.10)",
              fontSize: 16,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="theme-btn"
            style={{
              background: "transparent",
              border: "2px solid rgba(0,0,0,0.10)",
              color: "#202426",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="theme-btn"
          style={{
            background: isEdit ? "#1A685B" : "#F84D43",
            border: "none",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
