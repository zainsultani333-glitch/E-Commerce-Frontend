import { useEffect, useState } from "react";
import API from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    image: null,
  });
  const [errors, setErrors] = useState({});

  // Fetch products and categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image: file }); // Keep the file to send in FormData
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock is required";
    } else if (isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!selectedProduct && !formData.image) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await API.post("/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({ name: "", price: "", stock: "", description: "", category: "", image: null });
      setImagePreview(null);
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Failed to add product" });
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (formData.image && formData.image instanceof File) {
        data.append("image", formData.image);
      }

      await API.put(`/products/${selectedProduct._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({ name: "", price: "", stock: "", description: "", category: "", image: null });
      setImagePreview(null);
      setShowForm(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Failed to update product" });
    } finally {
      setLoading(false);
    }
  };

  // View product
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete product. Please try again.");
    }
  };

  // Open edit modal
  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
      category: product.category?._id || product.category,
      image: null,
    });
    setImagePreview(product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : null);
    setSelectedProduct(product);
    setShowForm(true);
    setErrors({});
  };

  // Close modal
  const handleModalClose = () => {
    setShowForm(false);
    setShowViewModal(false);
    setSelectedProduct(null);
    setFormData({ name: "", price: "", stock: "", description: "", category: "", image: null });
    setImagePreview(null);
    setErrors({});
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Products</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          >
            + Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className={`transition-all duration-300 ${(showForm || showViewModal) ? 'opacity-40' : 'opacity-100'}`}>
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="text-gray-400 text-lg mb-2">No products found</div>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                + Add your first product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.image ? (
                            <img
                              src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.png";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.category && typeof product.category === 'object'
                              ? product.category.name
                              : product.category || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-blue-600 hover:text-blue-900 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-green-600 hover:text-green-900 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto"
          >
            <div
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-centerIn max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Fixed */}
              <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white rounded-t-xl flex-shrink-0">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedProduct ? "Update product information" : "Fill in the product details"}
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-1.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 p-5 custom-scrollbar">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {errors.submit}
                  </div>
                )}

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Laptop, Smartphone, Headphones"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm ${errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                        autoFocus
                      />
                      {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 99.99"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm ${errors.price ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="e.g., 100"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm ${errors.stock ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock}</p>}
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 ${errors.category ? "border-red-500" : "border-gray-300"
                          }`}
                      >
                        <option value="">Select a category</option>
                        {categories
                          .filter(cat => cat.status === "Active") // Only show active categories
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-600 text-xs mt-1">{errors.category}</p>
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Product Image {!selectedProduct && <span className="text-red-500">*</span>}
                      </label>

                      {/* File Input */}
                      <input
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm"
                      />

                      {/* Preview new image */}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      {/* Show error if exists */}
                      {errors.image && (
                        <p className="text-red-600 text-xs mt-1">{errors.image}</p>
                      )}

                      {/* Show current product image if editing and no new image selected */}
                      {selectedProduct && !imagePreview && selectedProduct.image && (
                        <div className="mt-2">
                          <img
                            src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `http://localhost:5000${selectedProduct.image}`}
                            alt="Current"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">Current image</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter product description (optional)"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 text-sm resize-none ${errors.description ? "border-red-500" : ""
                          }`}
                      />
                      {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                      <p className="text-gray-400 text-xs mt-1">
                        Max 1000 characters
                      </p>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedProduct ? handleEditProduct : handleAddProduct}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (selectedProduct ? "Updating..." : "Adding...") : (selectedProduct ? "Update Product" : "Add Product")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add custom scrollbar styles if not already present */}
        <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`}</style>

        {/* View Modal */}
        {showViewModal && selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto"
          >
            <div
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-centerIn max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Fixed */}
              <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white rounded-t-xl flex-shrink-0">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Complete product information</p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-1.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">
                {selectedProduct.image && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Product Image
                    </label>
                    <img
                      src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `http://localhost:5000${selectedProduct.image}`}
                      alt={selectedProduct.name}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Product Name
                    </label>
                    <div className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                      {selectedProduct.name}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Price
                    </label>
                    <div className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-green-600">
                      ${selectedProduct.price}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Stock
                    </label>
                    <div className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedProduct.stock > 10
                        ? 'bg-green-100 text-green-800'
                        : selectedProduct.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedProduct.stock} units
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <div className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeof selectedProduct.category === 'object' ? selectedProduct.category.name : selectedProduct.category || "No category assigned"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <div className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {selectedProduct.description || (
                        <span className="text-gray-400 italic">No description provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium text-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleModalClose();
                    openEditModal(selectedProduct);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Product
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add custom scrollbar styles */}
        <style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`}</style>
      </div>

      <style>{`
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

export default Products;