import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Hero Section */}
      <div
        className="relative h-[70vh] bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/ev.jpg')" }}
      >
        <div className="bg-base-100 bg-opacity-50 p-10 rounded-lg text-center">
          <h1 className="text-5xl font-bold text-primary">Welcome to EV Charge Hub</h1>
          <p className="mt-3 text-lg text-base-content">
            Find, book, and manage your EV charging slots with ease.
          </p>
          <div className="mt-6 space-x-4">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 px-5 text-center">
        <h2 className="text-4xl font-bold text-primary">Why Choose EV Charge Hub?</h2>
        <p className="mt-3 max-w-2xl mx-auto text-neutral-content">
          A smart way to locate charging stations, book slots, and manage payments seamlessly.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-accent shadow-lg rounded-lg">
            <h3 className="text-2xl font-semibold text-accent-content">🔍 Locate Stations</h3>
            <p className="text-base-100 mt-2">Find charging stations near you on an interactive map.</p>
          </div>
          <div className="p-6 bg-accent shadow-lg rounded-lg">
            <h3 className="text-2xl font-semibold text-accent-content">⚡ Smart Booking</h3>
            <p className="text-base-100 mt-2">Book slots dynamically based on your EV’s battery charge.</p>
          </div>
          <div className="p-6 bg-accent shadow-lg rounded-lg">
            <h3 className="text-2xl font-semibold text-accent-content">💳 Easy Payments</h3>
            <p className="text-base-100 mt-2">Pay online or offline with flexible options.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
