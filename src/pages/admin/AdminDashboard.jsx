import AdminLayout from "../../layouts/AdminLayout";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Manage Products
          </h3>
          <p className="text-gray-500 mb-4">
            Add new products with images, price, and stock.
          </p>
          <Link
            to="/admin/products"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
          >
            Manage Products
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Manage Categories
          </h3>
          <p className="text-gray-500 mb-4">
            Create and organize product categories.
          </p>
          <Link
            to="/admin/categories"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
          >
            Manage Categories
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;