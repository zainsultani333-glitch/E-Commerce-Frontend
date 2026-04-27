// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
      if (!user?.token) return setCart([]);
      const res = await API.get("/cart", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCart(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
      if (!user?.token) return alert("Please login first");
      await API.post("/cart/add", { productId }, { headers: { Authorization: `Bearer ${user.token}` } });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await API.post("/cart/remove", { productId });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const increaseQty = async (productId) => {
    try {
      await API.post("/cart/add", { productId });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const decreaseQty = async (productId, quantity) => {
    if (quantity <= 1) return removeFromCart(productId);
    try {
      await API.post("/cart/decrease", { productId });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, increaseQty, decreaseQty }}>
      {children}
    </CartContext.Provider>
  );
};