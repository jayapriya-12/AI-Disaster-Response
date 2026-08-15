import React, { useState, useEffect } from 'react';
import { Home, Plus, MapPin, Phone, Users, Trash2, Edit, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shelter } from '../types';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DisasterMap } from '../components/map/DisasterMap';

export const ShelterManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '37.7749',
    longitude: '-122.4194',
    capacity: 200,
    currentOccupancy: 0,
    contactNumber: '',
    status: 'OPEN',
  });

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shelters');
      if (res.data.success) {
        setShelters(res.data.shelters || []);
      }
    } catch (err) {
      console.error('Failed to fetch shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const openCreateModal = () => {
    setEditingShelter(null);
    setFormData({
      name: '',
      location: '',
      latitude: '37.7749',
      longitude: '-122.4194',
      capacity: 200,
      currentOccupancy: 0,
      contactNumber: '',
      status: 'OPEN',
    });
    setModalOpen(true);
  };

  const openEditModal = (shelter: Shelter) => {
    setEditingShelter(shelter);
    setFormData({
      name: shelter.name,
      location: shelter.location,
      latitude: shelter.latitude.toString(),
      longitude: shelter.longitude.toString(),
      capacity: shelter.capacity,
      currentOccupancy: shelter.currentOccupancy,
      contactNumber: shelter.contactNumber,
      status: shelter.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShelter) {
        await api.put(`/shelters/${editingShelter.id}`, formData);
      } else {
        await api.post('/shelters', formData);
      }
      setModalOpen(false);
      fetchShelters();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this shelter?')) return;
    try {
      await api.delete(`/shelters/${id}`);
      fetchShelters();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpdateOccupancy = async (shelter: Shelter, delta: number) => {
    const newOccupancy = Math.max(0, Math.min(shelter.capacity, shelter.currentOccupancy + delta));
    try {
      await api.put(`/shelters/${shelter.id}`, { currentOccupancy: newOccupancy });
      fetchShelters();
    } catch (err) {
      console.error('Failed to update occupancy:', err);
    }
  };

  const filteredShelters = shelters.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading shelter registry..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Home className="w-7 h-7 text-sky-400" /> Emergency Shelters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy tracking, capacity management & emergency housing finder.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shelter</span>
          </button>
        )}
      </div>

      {/* Shelters Map Overview */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-sm text-white mb-3">Shelter Locations Map</h3>
        <DisasterMap shelters={shelters} height="320px" />
      </div>

      {/* Grid of Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelters.map((s) => {
          const occPct = Math.round((s.currentOccupancy / s.capacity) * 100);
          return (
            <div key={s.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-white">{s.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      s.status === 'OPEN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center space-x-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{s.location}</span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 mb-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="text-sky-400">
                      {s.currentOccupancy} / {s.capacity} ({occPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        occPct >= 90 ? 'bg-rose-500' : occPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occPct)}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-300 flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.contactNumber}</span>
                </div>
              </div>

              {/* Admin Occupancy Adjustment Buttons */}
              {user?.role === 'ADMIN' && (
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleUpdateOccupancy(s, -10)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleUpdateOccupancy(s, +10)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      +10
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingShelter ? 'Edit Shelter' : 'Add New Shelter'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Shelter Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Occupancy</label>
              <input
                type="number"
                value={formData.currentOccupancy}
                onChange={(e) => setFormData({ ...formData, currentOccupancy: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500"
          >
            Save Shelter Details
          </button>
        </form>
      </Modal>
    </div>
  );
};
