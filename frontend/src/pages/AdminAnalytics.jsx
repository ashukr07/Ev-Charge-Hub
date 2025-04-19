import { useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import useAnalyticsStore from "../stores/analyticsStore";
import AnalyticsCard from "../components/AnalyticsCard";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];

export default function AdminAnalytics() {
  const { fetchAdminAnalytics, adminStats } = useAnalyticsStore();

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">📊 Admin Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsCard title="Booking Status Overview">
          <PieChart width={300} height={300}>
            <Pie
              data={Object.entries(adminStats.bookingStatusCount || {}).map(([status, count]) => ({ status, count }))}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {Object.entries(adminStats.bookingStatusCount || {}).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </AnalyticsCard>

        <AnalyticsCard title="Payment Method Distribution">
          <PieChart width={300} height={300}>
            <Pie
              data={Object.entries(adminStats.paymentMethodStats || {}).map(([method, count]) => ({ method, count }))}
              dataKey="count"
              nameKey="method"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {Object.entries(adminStats.paymentMethodStats || {}).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </AnalyticsCard>

        <AnalyticsCard title="Monthly Revenue (Bar)">
          <BarChart width={400} height={300} data={adminStats.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#22c55e" />
          </BarChart>
        </AnalyticsCard>

        <AnalyticsCard title="Monthly Revenue (Line)">
          <LineChart width={400} height={300} data={adminStats.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </AnalyticsCard>
      </div>
    </div>
  );
}
