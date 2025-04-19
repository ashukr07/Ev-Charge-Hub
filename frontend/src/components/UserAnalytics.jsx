import { useEffect } from 'react';
import useAnalyticsStore from '../stores/analyticsStore';

export default function UserAnalytics() {
  const { userStats, fetchUserAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  if (!userStats) return <p>Loading stats...</p>;

  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Total Energy Consumed</div>
        <div className="stat-value">{userStats.totalEnergy.toFixed(2)} kWh</div>
      </div>
      <div className="stat">
        <div className="stat-title">Total Spent</div>
        <div className="stat-value text-primary">₹ {userStats.totalAmount.toFixed(2)}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Rewards Earned</div>
        <div className="stat-value text-accent">₹ {userStats.totalRewards.toFixed(2)}</div>
      </div>
    </div>
  );
}
