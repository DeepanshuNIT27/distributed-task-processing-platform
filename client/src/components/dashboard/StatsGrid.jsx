export const StatsGrid = ({ stats }) => {
  // 🔥 UPDATED: Added total and successRate defaults
  const data = stats || {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    successRate: 0,
  };

  const dynamicCards = [
    { title: "Queued Jobs", value: data.pending, color: "text-blue-400" },
    {
      title: "Processing Jobs",
      value: data.processing,
      color: "text-yellow-400",
    },
    { title: "Completed Jobs", value: data.completed, color: "text-green-400" },
    { title: "Failed Jobs", value: data.failed, color: "text-red-400" },
  ];

  // 🔥 UPDATED: Made Total Tasks and Success Rate dynamic based on DB!
  const staticCards = [
    { title: "Active Workers", value: "3 / 3", color: "text-indigo-400" },
    { title: "Total Tasks", value: data.total, color: "text-purple-400" },
    { title: "Throughput / hr", value: "86", color: "text-gray-400" },
    {
      title: "Success Rate",
      value: `${data.successRate}%`,
      color: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {dynamicCards.concat(staticCards).map((card, idx) => (
        <div
          key={idx}
          className="bg-[#11151c] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition"
        >
          <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
          <div className={`text-3xl font-bold mt-3 ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};
