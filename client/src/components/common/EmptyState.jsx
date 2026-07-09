import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";

export const EmptyState = ({
  title = "No Data Found",
  description,
  actionText,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-800 rounded-2xl bg-[#11151c]/50">
      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <Inbox size={32} />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      )}
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};
