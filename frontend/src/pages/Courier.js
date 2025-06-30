import React, { useEffect, useState } from 'react';
import { getOrders, markDelivered, getOptimizedRoute } from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Courier.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function Courier() {
  const [orders, setOrders] = useState([]);
  const [route, setRoute] = useState([]);
  const [optimized, setOptimized] = useState(false);

  const depot = { lat: 41.015137, lng: 28.97953 };

  const loadOrders = async () => {
    const data = await getOrders();
    const pendingOrders = data.filter(order => order.status === 'pending');
    setOrders(pendingOrders);
    setOptimized(false); // optimize tuşuna tekrar basılması için sıfırla
  };

  const handleOptimize = async () => {
    const data = await getOptimizedRoute();
    const optimizedOrders = data.filter(p => p.id); // depo olmayanları al
    setRoute(data);
    setOrders(optimizedOrders);
    setOptimized(true);
  };

  const handleDelivered = async (id) => {
    await markDelivered(id);
    loadOrders();
  };

  const positions = route.length > 0
    ? route.map(p => [p.lat, p.lng])
    : [];

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="courier-container">
      <h2>🚴‍♂️ Kurye Paneli</h2>

      <div className="courier-content">
        <div className="order-list">
          <h3>📦 Sipariş Listesi</h3>
          {orders.length === 0 && <p>Aktif sipariş yok.</p>}
          <ul>
            {(optimized ? orders : orders).map((order, index) => (
              <li key={order.id}>
                <strong>{index + 1}. {order.username}</strong><br />
                {order.address}<br />
                Durum: <span className={order.status}>{order.status}</span>
                {order.status === 'pending' && (
                  <button onClick={() => handleDelivered(order.id)}>✅ Teslim Et</button>
                )}
              </li>
            ))}
          </ul>
          <button onClick={handleOptimize}>🚀 Rota Hesapla (PSO)</button>
        </div>

        <div className="map-section">
          <MapContainer center={[depot.lat, depot.lng]} zoom={12} style={{ height: '500px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[depot.lat, depot.lng]} icon={L.divIcon({ className: 'depot-marker' })}>
              <Popup>🏢 Depo</Popup>
            </Marker>
            {orders.map(order => (
              <Marker key={order.id} position={[order.lat, order.lng]}>
                <Popup>
                  <strong>{order.username}</strong><br />
                  {order.address}<br />
                  {order.status}
                </Popup>
              </Marker>
            ))}
            {positions.length > 0 && <Polyline positions={positions} color="blue" />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Courier;
