// components/AnalyticsCard.jsx
export default function AnalyticsCard({ title, children }) {
    return (
      <div className="bg-base-100 shadow-lg rounded-xl p-4">
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <div className="w-full h-72">{children}</div>
      </div>
    );
  }
  