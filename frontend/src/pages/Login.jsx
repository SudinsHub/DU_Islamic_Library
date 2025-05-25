import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reader");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ email, password, role });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md md:max-w-2xl md:flex md:items-center md:gap-8 md:p-12">
        <div className="text-center md:text-left">
          <img src="/logo.png" alt="Logo" className="mx-auto mb-4 w-16 md:mx-0" />
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Login to access all features.</h2>
        </div>
        <form onSubmit={handleLogin} className="w-full max-w-sm md:w-1/2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
            placeholder="Enter email address"
            required
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
            placeholder="Enter password"
            required
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Login as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="reader">Reader</option>
            <option value="volunteer">Volunteer</option>
          </select>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-black p-3 text-white hover:bg-gray-800"
          >
            Login
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            <a href="#" className="text-gray-800 hover:underline">Forgot password?</a>
          </p>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account? <a href="#" className="text-green-500 hover:underline">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}
