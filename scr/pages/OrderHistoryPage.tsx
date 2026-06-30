import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { Package, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { NavigateFunction } from '../App';

interface OrderHistoryPageProps {
  navigate: NavigateFunction;
}

export default function OrderHistoryPage({ navigate }: OrderHistoryPageProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  async function fetchOrders() {
    if (!user) return;

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.pending;
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: 'Menunggu Pembayaran',
      processing: 'Diproses',
      shipped: 'Dalam Pengiriman',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Riwayat Pesanan</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Belum Ada Pesanan</h2>
            <p className="text-slate-400 mb-6">Anda belum melakukan pemesanan</p>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-800">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">{order.order_items?.length || 0} item</span>
                    <span className="text-white font-bold">
                      Rp {order.total_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-lg w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-slate-900 flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">Detail Pesanan</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">Alamat Pengiriman</div>
                  <div className="text-white">{selectedOrder.shipping_address}</div>
                </div>

                {selectedOrder.phone && (
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Nomor Telepon</div>
                    <div className="text-white">{selectedOrder.phone}</div>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-4">
                  <div className="text-sm text-slate-400 mb-3">Produk</div>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.product?.image_url ? (
                            <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">{item.product?.name}</div>
                          <div className="text-slate-400 text-xs">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-cyan-400 font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>Rp {selectedOrder.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
