import { useAuthStore } from "../stores/authStore.js";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <div className="bg-white p-6 rounded shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-3">Admin Dashboard</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        </div>
    </div>
  );
}
