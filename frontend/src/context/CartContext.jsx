// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Dynamic storage key based on logged-in user ID
  const getStorageKey = () => (user?.id ? `cart_user_${user.id}` : 'cart_guest');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : [];
  });

  // Whenever user changes (login, logout, switch account), load their specific cart
  useEffect(() => {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    setCart(saved ? JSON.parse(saved) : []);
  }, [user?.id]);

  // Whenever cart changes, save to the active user's key
  useEffect(() => {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?.id]);

  const addToCart = (product) => {
    // Prevent vendors from adding items to cart
    if (user?.role === 'VENDOR') return;

    setCart((prevCart) => {
      const variantId = product.variant?.id || null;
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && (item.variant?.id || null) === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === productId && (item.variant?.id || null) === variantId)
      )
    );
  };

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId && (item.variant?.id || null) === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(getStorageKey());
  };

  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.price || item.effective_price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};