'use client';
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const email = formData.get('email') as string;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();
    if (data.success) {
      router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div
        className="p-4 shadow-lg rounded w-full"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4 text-xl font-bold">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="block mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              id="username"
              name="username"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="block mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="block mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Register
          </button>
          <div className="text-center mt-3 text-sm">
            <span>Already have an account? </span>
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
