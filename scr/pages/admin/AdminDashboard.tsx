import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, Category, Order, Review } from '../../types';
import { LayoutDashboard, Package, ShoppingCart, Star, Plus, Edit2, Trash2, X, Save, MessageCircle } from 'lucide-react';
import type { NavigateFunction } from '../../App';

interface AdminDashboardProps {
  navigate: NavigateFunction;
}

type Tab = 'products' | 'orders' | 'reviews';

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, categoriesRes, ordersRes, reviewsRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('orders').select('*, order_items(*, product:products(*))').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, product:products(*), profile:profiles(*)').order('created_at', { ascending: false })
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);
    setLoading(false);
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    await supabase.from('products').delete().eq('id', productId);
    fetchData();
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Yakin ingin menghapus ulasan ini?')) return;
    await supabase.from('reviews').delete().eq('id', reviewId);
    fetchData();
  }

  async function handleUpdateOrderStatus(orderId: string, status: Order['status']) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchData();
  }

  const stats = {
    products: products.length,
    orders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    reviews: reviews.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-cyan-500" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Total Produk" value={stats.products} color="cyan" />
          <StatCard icon={ShoppingCart} label="Total Pesanan" value={stats.orders} color="blue" />
          <StatCard icon={ShoppingCart} label="Menunggu Konfirmasi" value={stats.pendingOrders} color="yellow" />
          <StatCard icon={Star} label="Ulasan" value={stats.reviews} color="purple" />
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-800">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
            <Package className="w-4 h-4" />
            Produk
          </TabButton>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            <ShoppingCart className="w-4 h-4" />
            Pesanan
          </TabButton>
          <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            <Star className="w-4 h-4" />
            Ulasan
          </TabButton>
        </div>

        {activeTab === 'products' && (
          <div>
            <button
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg mb-6 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk
            </button>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Produk</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Kategori</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Harga</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Stok</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                              {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-600" />
                                </div>
                              )}
                            </div>
                            <span className="text-white font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{product.category?.name || '-'}</td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          Rp {product.price.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Tanggal</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white"
                        >
                          <option value="pending">Menunggu</option>
                          <option value="processing">Diproses</option>
                          <option value="shipped">Dikirim</option>
                          <option value="delivered">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-sm">
                        {order.order_items?.length || 0} item
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Belum ada ulasan
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-white">{review.profile?.full_name || 'Pengguna'}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{review.product?.name}</p>
                      {review.comment && <p className="text-white">{review.comment}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showProductModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setShowProductModal(false)}
            onSave={() => { setShowProductModal(false); fetchData(); }}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-500',
    blue: 'bg-blue-500/10 text-blue-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    purple: 'bg-purple-500/10 text-purple-500'
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
        active ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    price: product?.price?.toString() || '',
    original_price: product?.original_price?.toString() || '',
    processor: product?.processor || '',
    ram: product?.ram || '',
    storage: product?.storage || '',
    display: product?.display || '',
    gpu: product?.gpu || '',
    stock: product?.stock?.toString() || '0',
    image_url: product?.image_url || '',
    description: product?.description || '',
    is_featured: product?.is_featured || false
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      name: formData.name,
      category_id: formData.category_id || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      processor: formData.processor,
      ram: formData.ram,
      storage: formData.storage,
      display: formData.display || null,
      gpu: formData.gpu || null,
      stock: parseInt(formData.stock),
      image_url: formData.image_url || null,
      description: formData.description || null,
      is_featured: formData.is_featured
    };

    if (product) {
      await supabase.from('products').update(data).eq('id', product.id);
    } else {
      await supabase.from('products').insert(data);
    }

    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {product ? 'Edit Produk' : 'Tambah Produk'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Nama Produk *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Kategori</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Stok *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Harga (Rp) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Harga Asli (Rp)</label>
              <input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Prosesor *</label>
              <input
                type="text"
                value={formData.processor}
                onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                required
                placeholder="Intel Core i5-12400H"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">RAM *</label>
              <input
                type="text"
                value={formData.ram}
                onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                required
                placeholder="16GB DDR4"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Storage *</label>
              <input
                type="text"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                required
                placeholder="512GB SSD"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Display</label>
              <input
                type="text"
                value={formData.display}
                onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                placeholder='15.6" FHD 144Hz'
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">GPU</label>
              <input
                type="text"
                value={formData.gpu}
                onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                placeholder="RTX 4060 8GB"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">URL Gambar</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
                />
                <span className="text-slate-300">Tampilkan sebagai produk unggulan</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
