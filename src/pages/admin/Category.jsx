import { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    details: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }

    if (formData.details && formData.details.length > 500) {
      newErrors.details = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await API.post("/categories", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({ name: "", details: "", status: "Active" });
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Failed to add category" });
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await API.put(`/categories/${selectedCategory._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({ name: "", details: "", status: "Active" });
      setShowForm(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Failed to update category" });
    } finally {
      setLoading(false);
    }
  };

  // View category
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token"); // get token from localStorage

      await API.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // pass token in headers
        },
      });

      await fetchCategories(); // refresh the list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete category. Please try again.");
    }
  };

  // Open edit modal
  const openEditModal = (category) => {
    setFormData({
      name: category.name,
      details: category.details || "",
      status: category.status,
    });
    setSelectedCategory(category);
    setShowForm(true);
    setErrors({});
  };

  // Close modal when clicking outside
  const handleModalClose = () => {
    setShowForm(false);
    setShowViewModal(false);
    setSelectedCategory(null);
    setFormData({ name: "", details: "", status: "Active" });
    setErrors({});
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-600 mt-1">Manage your product categories</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          >
            + Add Category
          </button>
        </div>

        {/* Categories Table */}
        <div className={`bg-white rounded-xl shadow-lg overflow-x-auto transition-all duration-300 ${(showForm || showViewModal) ? 'opacity-40' : 'opacity-100'}`}>
          {loading && categories.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading categories...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="text-gray-400 text-lg mb-2">No categories found</div>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                + Add your first category
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {cat.details || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cat.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewCategory(cat)}
                        className="text-blue-600 hover:text-blue-900 transition mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="text-green-600 hover:text-green-900 transition mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto"
          >
            {/* Modal with center animation */}
            <div
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-centerIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {errors.submit}
                  </div>
                )}
                <form onSubmit={selectedCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Electronics, Clothing, Books"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 ${errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                      autoFocus
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter category description (optional)"
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 ${errors.details ? "border-red-500" : ""
                        }`}
                    />
                    {errors.details && <p className="text-red-600 text-sm mt-1">{errors.details}</p>}
                    <p className="text-gray-400 text-xs mt-1">
                      Max 500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedCategory ? handleEditCategory : handleAddCategory}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (selectedCategory ? "Updating..." : "Adding...") : (selectedCategory ? "Update Category" : "Add Category")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCategory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto"
            onClick={handleModalClose}
          >
            <div
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-centerIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Category Details</h3>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedCategory.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">
                    {selectedCategory.details || "No description provided"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="inline-block">
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${selectedCategory.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}>
                      {selectedCategory.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                  <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedCategory._id}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleModalClose();
                    openEditModal(selectedCategory);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Edit Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add these styles to your CSS file or in a <style> tag */}
      <style jsx>{`
        @keyframes centerIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-centerIn {
          animation: centerIn 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
}

export default Categories;