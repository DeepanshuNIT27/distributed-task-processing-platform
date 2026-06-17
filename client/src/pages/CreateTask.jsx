import UploadCard from "../components/UploadCard";

export default function CreateTask() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-200">Create New Task</h2>
        <p className="text-slate-400 mt-1 text-sm">
          Upload an image to add it to the processing queue.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: The Upload Engine (Takes 2 columns) */}
        <div className="col-span-1 lg:col-span-2">
          <UploadCard />
        </div>

        {/* Right: Task Configuration (UI Placeholder to match Figma) */}
        <div className="col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-lg font-semibold text-slate-200">
            Task Configuration
          </h3>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 border border-slate-600 rounded-lg text-center text-sm text-slate-400 opacity-50 cursor-not-allowed">
                Low
              </div>
              <div className="p-2 border border-blue-500 bg-blue-500/10 rounded-lg text-center text-sm text-blue-400">
                Normal
              </div>
              <div className="p-2 border border-slate-600 rounded-lg text-center text-sm text-slate-400 opacity-50 cursor-not-allowed">
                High
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">
              Processing Options
            </label>
            <div className="space-y-2">
              {[
                "Generate Thumbnail (150x150)",
                "Generate Medium (500px)",
                "Generate Large (1000px)",
                "Generate WebP Optimized",
              ].map((opt, i) => (
                <div key={i} className="flex items-center gap-3 opacity-70">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-blue-500 w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-300">{opt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Configuration options will be active in later phases. Currently,
              all tasks run on default settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
