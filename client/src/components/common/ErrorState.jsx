import { AlertCircle } from "lucide-react";

export const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-red-900/30 bg-red-900/10 rounded-2xl">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-400 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-red-400/80 mb-6 max-w-md">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg border border-red-500/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
