import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('jonathan_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('jonathan_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (service) => {
    setCart((prev) => {
      if (prev.find((item) => item._id === service._id)) {
        return prev; // Already in cart
      }
      return [...prev, service];
    });
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => prev.filter((item) => item._id !== serviceId));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
