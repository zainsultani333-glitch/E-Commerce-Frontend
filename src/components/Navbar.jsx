import { Link } from "react-router-dom";

function Navbar() {
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-400">
          E-Store
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">

          <Link className="hover:text-blue-400 transition" to="/">
            Home
          </Link>

          {!role && (
            <>
              <Link className="hover:text-blue-400 transition" to="/login">
                Login
              </Link>
              <Link className="hover:text-blue-400 transition" to="/register">
                Register
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition"
              to="/admin"
            >
              Dashboard
            </Link>
          )}

          {/* Logout Button */}
          {role && (
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;