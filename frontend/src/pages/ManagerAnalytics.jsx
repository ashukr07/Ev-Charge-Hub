import { useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import useAnalyticsStore from "../stores/analyticsStore";
import AnalyticsCard from "../components/AnalyticsCard";

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"];

export default function ManagerAnalytics() {
  const { fetchManagerAnalytics, managerStats } = useAnalyticsStore();

  useEffect(() => {
    fetchManagerAnalytics();
  }, []);

  const statusData = Object.entries(managerStats.bookingStatus || {}).map(([status, count]) => ({ status, count }));
  const trendData = Object.entries(managerStats.monthlyBookings || {}).map(([month, bookings]) => ({ month, bookings }));
  const paymentData = Object.entries(managerStats.paymentMethods || {}).map(([method, count]) => ({ method, count }));
  const energyByStation = managerStats.energyData || [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">📈 Manager Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsCard title="Booking Status">
          <PieChart width={300} height={300}>
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </AnalyticsCard>

        <AnalyticsCard title="Monthly Booking Trends">
          <LineChart width={400} height={300} data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </AnalyticsCard>

        <AnalyticsCard title="Revenue by Payment Method">
          <BarChart width={400} height={300} data={paymentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </AnalyticsCard>

        <AnalyticsCard title="Energy Consumed per Station">
          <BarChart width={400} height={300} data={energyByStation}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="station" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="energy" fill="#f59e0b" />
          </BarChart>
        </AnalyticsCard>
      </div>
    </div>
  );
}
