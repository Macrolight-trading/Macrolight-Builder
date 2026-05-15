"use client";

import { useCallback, useRef, useState } from "react";

const CATEGORIES = [
  { value: "", label: "General" },
  { value: "logo", label: "Logo" },
  { value: "team", label: "Team Photos" },
  { value: "property", label: "Property / Location" },
  { value: "work", label: "Our Work" },
  { value: "other", label: "Other" },
];

type MediaFileRecord = {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  category: string | null;
  createdAt: string;
};

type Props = {
  initialFiles: MediaFileRecord[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaUploader({ initialFiles }: Props) {
  const [files, setFiles] = useState<MediaFileRecord[]>(initialFiles);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (category) fd.append("category", category);

      const res = await fetch("/api/portal/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setFiles((f) => [{ ...data, createdAt: data.createdAt }, ...f]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [category] // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function deleteFile(id: string) {
    if (!confirm("Remove this file?")) return;
    const res = await fetch(`/api/portal/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((f) => f.filter((x) => x.id !== id));
    }
  }

  // Group by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: files.filter((f) =>
      cat.value === "" ? !f.category : f.category === cat.value
    ),
  })).filter((g) => g.items.length > 0 || g.value === "");

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-violet-500 bg-violet-50"
            : "border-gray-300 hover:border-violet-400 hover:bg-gray-50"
        }`}
      >
        <svg
          className="mx-auto h-10 w-10 text-gray-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          {uploading ? "Uploading…" : "Drop images here or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF, SVG — up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 shrink-0">
          Upload as:
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === cat.value
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Gallery */}
      {files.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          No files uploaded yet.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) =>
            group.items.length === 0 ? null : (
              <div key={group.value}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  {group.label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {group.items.map((file) => (
                    <div
                      key={file.id}
                      className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-square"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/portal/media/${file.id}/img`}
                        alt={file.filename}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full p-2">
                          <p className="text-white text-[11px] font-medium truncate">
                            {file.filename}
                          </p>
                          <p className="text-white/70 text-[10px]">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteFile(file.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
