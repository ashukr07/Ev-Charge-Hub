import { useEffect } from 'react';
import useAnalyticsStore from '../stores/analyticsStore';

export default function ManagerAnalytics() {
  const { managerStats, fetchManagerAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchManagerAnalytics();
  }, []);

  if (!managerStats) return <p>Loading stats...</p>;

  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Total Bookings</div>
        <div className="stat-value">{managerStats.totalBookings}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Total Energy Supplied</div>
        <div className="stat-value">{managerStats.totalEnergy.toFixed(2)} kWh</div>
      </div>
      <div className="stat">
        <div className="stat-title">Total Revenue</div>
        <div className="stat-value text-primary">₹ {managerStats.totalRevenue.toFixed(2)}</div>
      </div>
    </div>
  );
}