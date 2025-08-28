interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  size?: "small" | "large";
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  size = "large" 
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${
      size === "small" ? "space-y-2" : "space-y-3"
    }`}>
      <div className="flex justify-between items-start">
        <span className={`${size === "small" ? "text-2xl" : "text-3xl"}`}>
          {icon}
        </span>
        {change !== undefined && (
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            isPositive 
              ? "text-green-700 bg-green-100" 
              : isNegative 
                ? "text-red-700 bg-red-100"
                : "text-gray-600 bg-gray-100"
          }`}>
            {isPositive && "+"}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className={`font-bold text-gray-900 ${
          size === "small" ? "text-xl" : "text-2xl"
        }`}>
          {value}
        </p>
      </div>
    </div>
  );
}