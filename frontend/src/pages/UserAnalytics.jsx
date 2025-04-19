import { useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import useAnalyticsStore from "../stores/analyticsStore";
import AnalyticsCard from "../components/AnalyticsCard";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function UserAnalytics() {
  const { fetchUserAnalytics, userStats } = useAnalyticsStore();

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  // Transform bookingStatus object into an array for PieChart
  const statusBreakdown = useMemo(() => {
    if (!userStats.bookingStatus) return [];
    return Object.entries(userStats.bookingStatus)
      .filter(([key, value]) => value !== null && value !== 0)
      .map(([key, value]) => ({
        status: key,
        count: value,
      }));
  }, [userStats.bookingStatus]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">📊 Your Booking Insights</h2>

      {/* Total Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Spent">
            <h1 className="text-2xl font-bold text-success mt-10 text-center">
                ₹{userStats.totalSpent?.toFixed(2) || 0}
            </h1>
        </AnalyticsCard>

        <AnalyticsCard title="Energy Consumed">
            <h1 className="text-2xl font-bold text-accent mt-10 text-center">
                {userStats.totalEnergyConsumed?.toFixed(2) || 0} kWh
            </h1>
        </AnalyticsCard>

<AnalyticsCard title="Total Rewards">
  <h1 className="text-2xl font-bold text-green-500 mt-10 text-center">
    ₹{userStats.totalRewards || 0}
  </h1>
</AnalyticsCard>

<AnalyticsCard title="Total Penalty">
  <h1 className="text-2xl font-bold text-red-500 mt-10 text-center">
    ₹{userStats.totalPenalty || 0}
  </h1>
</AnalyticsCard>
</div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <AnalyticsCard title="Bookings by Status">
          {statusBreakdown.length > 0 ? (
            <PieChart width={300} height={300}>
              <Pie
                data={statusBreakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <p>No data available</p>
          )}
        </AnalyticsCard>

        

      </div>
    </div>
  );
}
