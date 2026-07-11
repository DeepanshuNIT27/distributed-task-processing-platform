import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { api } from "../services/api";

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null); // 🔥 Pure state reset function

  const resetUpload = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setMessage(null);
  }; // Memory Leak Cleanup on unmount

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      setMessage({ type: "error", text: error.message });
      return;
    }

    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    multiple: false,
  });

  const clearSelection = (e) => {
    e.stopPropagation();
    resetUpload();
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ type: "success", text: "Task queued successfully! 🚀" });
      console.log("Task Created:", response.data); // Reset UI cleanly after 2.5 seconds

      setTimeout(() => {
        resetUpload();
      }, 2500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Upload failed. Server error.",
      });
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col h-full min-h-[400px]">
      {" "}
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        Upload Image{" "}
      </h3>{" "}
      <div
        {...getRootProps()}
        className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
        }`}
      >
        <input {...getInputProps()} />{" "}
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {" "}
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full rounded-lg object-contain shadow-lg border border-slate-700"
            />{" "}
            <button
              onClick={clearSelection}
              className="absolute -top-3 -right-3 p-1.5 bg-slate-900 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500 transition-colors"
            >
              <X size={16} />{" "}
            </button>{" "}
            <span className="mt-4 text-sm font-medium text-slate-400 truncate max-w-[250px]">
              {file.name}{" "}
            </span>{" "}
          </div>
        ) : (
          <>
            <UploadCloud size={52} className="text-blue-500 mb-4" />{" "}
            <p className="text-slate-200 font-medium mb-1">
              Drag & drop your image here{" "}
            </p>{" "}
            <p className="text-slate-500 text-sm">
              or click to browse (Max 5MB){" "}
            </p>{" "}
          </>
        )}{" "}
      </div>{" "}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}{" "}
        </div>
      )}{" "}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-4 w-full py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
          !file || isUploading
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25"
        }`}
      >
        {" "}
        {isUploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Queuing Task...{" "}
          </>
        ) : (
          <>
            <ImageIcon size={18} /> Create Task{" "}
          </>
        )}{" "}
      </button>{" "}
    </div>
  );
}
