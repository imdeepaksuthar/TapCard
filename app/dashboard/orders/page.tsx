'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { toast } from '@/components/toast';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  cart_items: OrderItem[];
  order_data: any;
  created_at: string;
  business_card?: {
    card_name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [orderToView, setOrderToView] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<{ orders: Order[] }>('/api/orders');
      setOrders(data.orders);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, newStatus: string) => {
    setIsUpdating(id);
    try {
      const data = await apiFetch<{ message: string, order: Order }>(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === id ? data.order : o));
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== id));
      if (orderToView?.id === id) setOrderToView(null);
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toString().includes(searchQuery);
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-gray-400 mt-2">Manage and fulfill your customer orders.</p>
        </div>
      </div>

      {/* Toolbar */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-lg">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, email, or Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-2xl pl-12 pr-4 py-3 text-white text-sm outline-none transition-all duration-300 shadow-inner"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0F1C35]/80 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-2xl px-5 py-3 text-sm font-semibold text-gray-300 outline-none transition-all duration-300 appearance-none pr-10 cursor-pointer shadow-inner"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="all" className="bg-[#0F1C35]">All Status</option>
            <option value="pending" className="bg-[#0F1C35]">Pending</option>
            <option value="completed" className="bg-[#0F1C35]">Completed</option>
            <option value="cancelled" className="bg-[#0F1C35]">Cancelled</option>
          </select>
        </div>
      )}

      {/* Loading & Error */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">No Orders Yet</h3>
          <p className="text-gray-400">When customers place orders from your card, they will appear here.</p>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && orders.length > 0 && (
        <div className="bg-[#0B1528]/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-gray-300 uppercase font-semibold text-xs border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Card</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-emerald-400">#{order.id.toString().padStart(5, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{order.customer_name}</div>
                        <div className="text-xs">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">
                          {order.business_card?.card_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ₹{parseFloat(order.total_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {isUpdating === order.id ? (
                          <div className="animate-pulse w-20 h-6 bg-white/10 rounded-full"></div>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer appearance-none ${getStatusBadge(order.status)}`}
                          >
                            <option value="pending" className="bg-[#0F1C35] text-amber-400">Pending</option>
                            <option value="completed" className="bg-[#0F1C35] text-emerald-400">Completed</option>
                            <option value="cancelled" className="bg-[#0F1C35] text-red-400">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => setOrderToView(order)} className="p-2.5 text-gray-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-lg transition-colors border border-white/5" title="View Order">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-2.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors border border-white/5" title="Delete Order">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      <AnimatePresence>
        {orderToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOrderToView(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1528] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] z-10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-start bg-[#070D1A]">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    Order #{orderToView.id.toString().padStart(5, '0')}
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(orderToView.status)}`}>
                      {orderToView.status}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{new Date(orderToView.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setOrderToView(null)} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3 bg-[#070D1A]/50 p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Details</h3>
                    <div>
                      <p className="text-white font-medium">{orderToView.customer_name}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {orderToView.customer_email}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {orderToView.customer_phone}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-3 bg-[#070D1A]/50 p-4 rounded-xl border border-white/5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Items Total</span>
                        <span className="text-white">₹{parseFloat(orderToView.total_amount.toString()).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-white">₹0.00</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-lg">
                        <span className="text-emerald-400">Total</span>
                        <span className="text-emerald-400">₹{parseFloat(orderToView.total_amount.toString()).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="bg-[#070D1A]/50 border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchased Items ({orderToView.cart_items?.length || 0})</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {orderToView.cart_items && orderToView.cart_items.map((item, idx) => (
                      <div key={idx} className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-500 text-sm">Qty: {item.quantity} x ₹{parseFloat(item.price.toString()).toFixed(2)}</p>
                        </div>
                        <div className="font-bold text-white">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#070D1A]">
                <button onClick={() => setOrderToView(null)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all duration-300">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
