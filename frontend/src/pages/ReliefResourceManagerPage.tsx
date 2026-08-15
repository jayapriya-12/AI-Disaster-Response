import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Sparkles, Trash2, Edit, AlertCircle, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReliefResource } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReliefResourceManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<ReliefResource[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ReliefResource | null>(null);

  // AI Calculator state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [affectedPeople, setAffectedPeople] = useState('250');
  const [aiDisasterType, setAiDisasterType] = useState('Flood');
  const [aiSeverity, setAiSeverity] = useState('Critical');
  const [aiRecs, setAiRecs] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    quantity: 100,
    unit: 'packs',
    location: 'Central Warehouse A',
    status: 'AVAILABLE',
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources');
      if (res.data.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      category: 'Food',
      quantity: 100,
      unit: 'packs',
      location: 'Central Warehouse A',
      status: 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const openEditModal = (res: ReliefResource) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      category: res.category,
      quantity: res.quantity,
      unit: res.unit,
      location: res.location,
      status: res.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, formData);
      } else {
        await api.post('/resources', formData);
      }
      setModalOpen(false);
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resource item?')) return;
    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleRunAiCalculator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/ai/recommend-relief', {
        disasterType: aiDisasterType,
        severity: aiSeverity,
        estimatedAffectedPeople: affectedPeople,
      });

      if (res.data.success) {
        setAiRecs(res.data.recommendations);
      }
    } catch (err) {
      console.error('AI error:', err);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) return <LoadingSpinner message="Loading emergency inventory..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-400" /> Relief Supply Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track emergency food, water, medical kits, tents & blanket reserves.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800 hover:bg-purple-900 text-purple-300 font-bold text-xs flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Supply Allocator</span>
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items or locations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs"
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Water">Water</option>
          <option value="Medicine">Medicine</option>
          <option value="Blankets">Blankets</option>
          <option value="Clothing">Clothing</option>
          <option value="Emergency Kits">Emergency Kits</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Resource Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity Available</th>
                <th className="p-4">Depot Location</th>
                <th className="p-4">Stock Status</th>
                {user?.role === 'ADMIN' && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredResources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-white">{r.name}</td>
                  <td className="p-4">{r.category}</td>
                  <td className="p-4 font-bold text-sky-400">
                    {r.quantity} {r.unit}
                  </td>
                  <td className="p-4 text-slate-400">📍 {r.location}</td>
                  <td className="p-4">
                    <Badge variant="status" value={r.status} />
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingResource ? 'Edit Supply Item' : 'Add Relief Resource'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Medicine">Medicine</option>
                <option value="Blankets">Blankets</option>
                <option value="Clothing">Clothing</option>
                <option value="Emergency Kits">Emergency Kits</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit (e.g. liters, packs)</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Depot Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500"
          >
            Save Resource Item
          </button>
        </form>
      </Modal>

      {/* AI Relief Calculator Modal */}
      <Modal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} title="AI Relief Supply Calculator">
        <form onSubmit={handleRunAiCalculator} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={aiDisasterType}
                onChange={(e) => setAiDisasterType(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-900 text-white text-xs border border-slate-800"
              >
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={aiSeverity}
                onChange={(e) => setAiSeverity(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-900 text-white text-xs border border-slate-800"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected People</label>
              <input
                type="number"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-900 text-white text-xs border border-slate-800"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
            Calculate Recommended Allocations
          </button>

          {aiRecs && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-purple-300">Recommended Stock Dispatch:</h4>
              <ul className="space-y-1 text-slate-300">
                <li>💧 Water: <strong>{aiRecs.water.quantity} {aiRecs.water.unit}</strong></li>
                <li>🍞 Food: <strong>{aiRecs.food.quantity} {aiRecs.food.unit}</strong></li>
                <li>🩺 Medical: <strong>{aiRecs.medicine.quantity} {aiRecs.medicine.unit}</strong></li>
                <li>⛺ Tents: <strong>{aiRecs.shelter.quantity} {aiRecs.shelter.unit}</strong></li>
              </ul>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
