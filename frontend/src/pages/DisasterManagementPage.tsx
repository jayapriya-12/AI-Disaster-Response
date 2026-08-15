import React, { useState, useEffect } from 'react';
import { Flame, Search, Filter, Plus, ShieldCheck, UserPlus, MapPin, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Disaster, User } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DisasterMap } from '../components/map/DisasterMap';

export const DisasterManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [responders, setResponders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Modals
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [newDisaster, setNewDisaster] = useState({
    title: '',
    description: '',
    type: 'Flood',
    severity: 'Medium',
    location: '',
    latitude: '37.7749',
    longitude: '-122.4194',
    status: 'Pending',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/disasters');
      if (res.data.success) {
        setDisasters(res.data.disasters || []);
      }

      if (user?.role === 'ADMIN') {
        const uRes = await api.get('/users?role=RESPONDER');
        if (uRes.data.success) {
          setResponders(uRes.data.users || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleVerifyStatus = async (status: 'Verified' | 'Rejected') => {
    if (!selectedDisaster) return;
    try {
      await api.put(`/disasters/${selectedDisaster.id}`, { status: status === 'Verified' ? 'Active' : 'Rejected' });
      setVerifyModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAssignResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisaster || !selectedResponderId) return;

    try {
      await api.post('/assignments', {
        disasterId: selectedDisaster.id,
        responderId: selectedResponderId,
        notes: assignmentNotes,
      });
      setAssignModalOpen(false);
      setSelectedResponderId('');
      setAssignmentNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleCreateDisaster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/disasters', newDisaster);
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Creation failed');
    }
  };

  const filteredDisasters = disasters.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || d.type === typeFilter;
    const matchesSeverity = !severityFilter || d.severity === severityFilter;
    const matchesStatus = !statusFilter || d.status === statusFilter;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading disaster events database..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-rose-500" /> Disaster Incidents Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor, verify, track severity, and dispatch emergency response units.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'map' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map View
            </button>
          </div>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Disaster Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, type, location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Flood">Flood</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Fire">Fire</option>
            <option value="Landslide">Landslide</option>
            <option value="Tsunami">Tsunami</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'map' ? (
        <DisasterMap disasters={filteredDisasters} height="550px" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisasters.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-panel rounded-2xl text-slate-500 text-sm">
              No disasters found matching your filter criteria.
            </div>
          ) : (
            filteredDisasters.map((d) => (
              <div
                key={d.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-sky-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="severity" value={d.severity} />
                    <Badge variant="status" value={d.status} />
                  </div>

                  <h3 className="font-bold text-base text-white mb-2 line-clamp-1">{d.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">{d.description}</p>

                  <div className="text-xs text-slate-400 space-y-1 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{d.location}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Type: <strong className="text-slate-300">{d.type}</strong> | Reported:{' '}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions for Admin / Responder */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  {user?.role === 'ADMIN' && (
                    <div className="flex space-x-2 w-full">
                      <button
                        onClick={() => {
                          setSelectedDisaster(d);
                          setVerifyModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verify</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDisaster(d);
                          setAssignModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Verify Modal */}
      <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Disaster Incident">
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Confirm authenticity of reported incident: <strong>{selectedDisaster?.title}</strong>
          </p>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => handleVerifyStatus('Verified')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify & Activate Event</span>
            </button>
            <button
              onClick={() => handleVerifyStatus('Rejected')}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center justify-center space-x-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Report</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Dispatch Responder Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Dispatch Emergency Responders">
        <form onSubmit={handleAssignResponder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Responder</label>
            <select
              value={selectedResponderId}
              onChange={(e) => setSelectedResponderId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            >
              <option value="">-- Choose Emergency Responder Unit --</option>
              {responders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dispatch Instructions / Notes</label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Deploy 2 medical evacuation teams and inflatable boats."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500 shadow-lg shadow-sky-600/30"
          >
            Confirm Responder Dispatch
          </button>
        </form>
      </Modal>

      {/* Create Disaster Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Disaster Record">
        <form onSubmit={handleCreateDisaster} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Disaster Title</label>
            <input
              type="text"
              value={newDisaster.title}
              onChange={(e) => setNewDisaster({ ...newDisaster, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={newDisaster.type}
                onChange={(e) => setNewDisaster({ ...newDisaster, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Flood">Flood</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Landslide">Landslide</option>
                <option value="Tsunami">Tsunami</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={newDisaster.severity}
                onChange={(e) => setNewDisaster({ ...newDisaster, severity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address</label>
            <input
              type="text"
              value={newDisaster.location}
              onChange={(e) => setNewDisaster({ ...newDisaster, location: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              value={newDisaster.description}
              onChange={(e) => setNewDisaster({ ...newDisaster, description: e.target.value })}
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500"
          >
            Save Disaster Record
          </button>
        </form>
      </Modal>
    </div>
  );
};
