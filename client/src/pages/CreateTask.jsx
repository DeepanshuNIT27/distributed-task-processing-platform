import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, X, Clock, Users, Check, Loader2 } from "lucide-react";
import { taskService } from "../services/task.service";

export default function CreateTask() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- TERA EXISTING LOGIC & STATES (Safe & Untouched) ---
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- NEW UI STATES (Target Design match karne ke liye) ---
  const [priority, setPriority] = useState("Medium");
  const [options, setOptions] = useState({
    thumbnail: true,
    medium: true,
    large: true,
    webp: true,
  });

  // --- TERA EXISTING SUBMIT FUNCTION (Surgically Fixed) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      return toast.error("Please select an image to process");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      // 🔥 FIX: Verified backend uses upload.single("image")
      formData.append("image", file);

      // 🔥 SURGICAL STRIKE: Ab priority aur options bhi backend ko jayenge
      formData.append("priority", priority);
      formData.append("options", JSON.stringify(options));

      await taskService.createTask(formData);
      toast.success("Task created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create task",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Phase 9.4 Strict Frontend Validation
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // 1. Check File Type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type! Only JPEG, PNG, and WEBP are allowed.");
      return;
    }

    // 2. Check File Size (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("File is too large! Maximum allowed size is 5MB.");
      return;
    }

    // If passed, set the file
    setFile(selectedFile);
  };

  // --- UI HELPERS ---
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile); // 🔥 Updated to use strict validation
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-slate-200 tracking-tight">
          Create New Task
        </h1>
        <p className="text-slate-400 text-sm">Dashboard &gt; Create Task</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* LEFT COLUMN: Upload & Options */}
        <div className="space-y-8">
          {/* Upload Box */}
          <div>
            <h2 className="text-sm font-medium text-slate-200 mb-3">
              Upload Image
            </h2>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                file
                  ? "border-[#7C3AED] bg-[#7C3AED]/10"
                  : "border-slate-600 bg-slate-800/50 hover:border-[#7C3AED]"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <UploadCloud className="text-slate-400 mb-4" size={48} />
                  <p className="text-slate-300 text-sm mb-1">
                    Drag & drop your image here
                  </p>
                  <p className="text-slate-500 text-xs mb-4">or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-700 hover:bg-slate-600 text-[#A855F7] border border-[#7C3AED]/30 px-6 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Browse Files
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-[#7C3AED]/20 text-[#A855F7] rounded-lg flex items-center justify-center shrink-0">
                      <UploadCloud size={20} />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-slate-400 hover:text-red-400 p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => validateAndSetFile(e.target.files[0])} // 🔥 Updated to use strict validation
                className="hidden"
                accept="image/jpeg, image/png, image/webp" // 🔥 Updated for stricter OS picker
              />
            </div>
          </div>

          {/* Processing Options */}
          <div>
            <h2 className="text-sm font-medium text-slate-200 mb-3">
              Processing Options
            </h2>
            <div className="space-y-3">
              {[
                { id: "thumbnail", label: "Generate Thumbnail (200x200)" },
                { id: "medium", label: "Generate Medium (800x800)" },
                { id: "large", label: "Generate Large (1200x1200)" },
                { id: "webp", label: "Generate WebP Optimized" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        [opt.id]: !prev[opt.id],
                      }))
                    }
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      options[opt.id]
                        ? "bg-[#7C3AED] border-[#7C3AED]"
                        : "bg-slate-800 border-slate-600 group-hover:border-[#A855F7]"
                    }`}
                  >
                    {options[opt.id] && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Config & Submit */}
        <div className="flex flex-col h-full justify-between gap-8">
          <div className="space-y-8">
            {/* Task Configuration */}
            <div>
              <h2 className="text-sm font-medium text-slate-200 mb-3">
                Task Configuration
              </h2>
              <p className="text-xs text-slate-400 mb-3">Priority</p>
              <div className="flex gap-3">
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      priority === p
                        ? p === "High"
                          ? "bg-red-500/10 border-red-500/50 text-red-400"
                          : p === "Medium"
                            ? "bg-[#7C3AED]/10 border-[#7C3AED]/50 text-[#A855F7]"
                            : "bg-slate-700 border-slate-500 text-slate-200"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Time */}
            <div>
              <h2 className="text-sm font-medium text-slate-200 mb-3">
                Estimated Processing Time
              </h2>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 text-slate-200 font-medium mb-1">
                  <Clock size={18} className="text-slate-400" />~ 45 - 60
                  seconds
                </div>
                <p className="text-xs text-slate-500 ml-7">
                  May vary based on queue load
                </p>
              </div>
            </div>

            {/* Queue Position */}
            <div>
              <h2 className="text-sm font-medium text-slate-200 mb-3">
                Queue Position
              </h2>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-200 font-medium mb-1">
                  <span className="text-lg"># 12</span>
                  <Users size={18} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">12 tasks ahead of you</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-medium py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Create Task 🚀"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
