import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createOrder, getOrders, cancelOrder } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './User.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function LocationSelector({ setLatLng, setAddress }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        setAddress(data.display_name || '');
      } catch (error) {
        console.error('Adres alınamadı:', error);
        setAddress('');
      }
    },
  });
  return null;
}

function User() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ username: '' });
  const [latlng, setLatLng] = useState(null);
  const [address, setAddress] = useState('');

  const loadOrders = async () => {
    const data = await getOrders();
    const pendingOrders = data.filter(order => order.status === 'pending');
    setOrders(pendingOrders);
  };

  const handleSubmit = async () => {
    if (!latlng || !address || !form.username) {
      alert('Lütfen tüm alanları doldurun ve haritadan bir konum seçin.');
      return;
    }

    await createOrder({ ...form, address, lat: latlng.lat, lng: latlng.lng });
    setForm({ username: '' });
    setLatLng(null);
    setAddress('');
    loadOrders();
  };

  const handleCancel = async (id) => {
    await cancelOrder(id);
    loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="user-container">
      <h2>🛒 Sipariş Oluştur</h2>
      <div className="form-section">
        <input
          placeholder="İsminiz"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <p><strong>Seçilen Adres:</strong> {address || 'Henüz seçilmedi'}</p>
        <button onClick={handleSubmit}>📤 Sipariş Ver</button>
      </div>

      <MapContainer center={[41.015137, 28.979530]} zoom={12} style={{ height: '300px', width: '100%', marginTop: '20px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector setLatLng={setLatLng} setAddress={setAddress} />
        {latlng && <Marker position={latlng} />}
      </MapContainer>

      <h3>📋 Aktif Siparişlerim</h3>
      <ul className="order-list">
        {orders.length === 0 && <p>Aktif siparişiniz bulunmamaktadır.</p>}
        {orders.map((order) => (
          <li key={order.id}>
            <strong>{order.username}</strong><br />
            {order.address}<br />
            Durum: <span className={order.status}>{order.status}</span>
            {order.status === 'pending' && (
              <button onClick={() => handleCancel(order.id)}>❌ İptal Et</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default User;
