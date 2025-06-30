import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createOrder = async (order) => {
  await axios.post(`${API_URL}/orders`, order);
};

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const cancelOrder = async (id) => {
  await axios.delete(`${API_URL}/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
  await axios.patch(`${API_URL}/orders/${id}`, { status });
};

export const getOptimizedRoute = async () => {
  const response = await axios.get(`${API_URL}/optimize`);
  return response.data;
};

export const markDelivered = async (id) => {
  try {
    await axios.put(`${API_URL}/orders/${id}/delivered`);
  } catch (error) {
    console.error('Teslimat işaretlenemedi:', error);
  }
};
