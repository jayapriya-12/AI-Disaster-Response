import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, ShieldCheck, Edit, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResponseAssignment, Disaster, User } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ResponderAssignmentPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ResponseAssignment[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [responders, setResponders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [selectedAssignment, setSelectedAssignment] = useState<ResponseAssignment | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'Assigned' | 'In Progress' | 'Completed'>('In Progress');
  const [notes, setNotes] = useState('');

  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState('');
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const aRes = await api.get('/assignments');
      if (aRes.data.success) {
        setAssignments(aRes.data.assignments || []);
      }

      if (user?.role === 'ADMIN') {
        const [dRes, uRes] = await Promise.all([
          api.get('/disasters'),
          api.get('/users?role=RESPONDER'),
        ]);
        if (dRes.data.success) setDisasters(dRes.data.disasters || []);
        if (uRes.data.success) setResponders(uRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const openUpdateModal = (a: ResponseAssignment) => {
    setSelectedAssignment(a);
    setNewStatus(a.status as any);
    setNotes(a.notes || '');
    setUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      await api.put(`/assignments/${selectedAssignment.id}`, {
        status: newStatus,
        notes,
      });
      setUpdateModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisasterId || !selectedResponderId) return;

    try {
      await api.post('/assignments', {
        disasterId: selectedDisasterId,
        responderId: selectedResponderId,
        notes: dispatchNotes,
      });
      setDispatchModalOpen(false);
      setSelectedDisasterId('');
      setSelectedResponderId('');
      setDispatchNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Dispatch failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading responder mission roster..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" /> Rescue Team Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track deployed search & rescue squads, medical units, and mission status.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setDispatchModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Responder Unit</span>
          </button>
        )}
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel rounded-2xl text-slate-500 text-xs">
            No active responder assignments logged in system.
          </div>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-white">{a.disaster?.title || 'Emergency Mission'}</span>
                  <Badge variant="status" value={a.status} />
                </div>

                <div className="text-xs text-slate-300 space-y-1 mb-3">
                  <p>📍 Location: <strong>{a.disaster?.location}</strong></p>
                  <p>🚒 Responder Unit: <strong className="text-cyan-300">{a.responder?.name}</strong> ({a.responder?.phone})</p>
                  <p className="text-[10px] text-slate-500">Dispatched: {new Date(a.assignedAt).toLocaleString()}</p>
                </div>

                {a.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Operational Field Log</span>
                    <p className="line-clamp-3">{a.notes}</p>
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              {(user?.role === 'ADMIN' || (user?.role === 'RESPONDER' && a.responderId === user.id)) && (
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => openUpdateModal(a)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Update Mission Progress</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for Status Update */}
      <Modal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Update Mission Status">
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rescue Mission Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            >
              <option value="Assigned">Assigned (Unit En Route)</option>
              <option value="In Progress">In Progress (Evacuation / Medical Support)</option>
              <option value="Completed">Completed (Incident Resolved & Evacuated)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Field Operation Log / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Record casualties rescued, supplies deployed, or shelter transfers..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500"
          >
            Save Status & Log
          </button>
        </form>
      </Modal>

      {/* Dispatch Modal for Admin */}
      <Modal isOpen={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} title="Dispatch Emergency Unit">
        <form onSubmit={handleCreateDispatch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Incident</label>
            <select
              value={selectedDisasterId}
              onChange={(e) => setSelectedDisasterId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            >
              <option value="">-- Select Active Disaster --</option>
              {disasters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.severity}) - {d.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Responder</label>
            <select
              value={selectedResponderId}
              onChange={(e) => setSelectedResponderId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            >
              <option value="">-- Select Responder Unit --</option>
              {responders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dispatch Instructions</label>
            <textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Bring medical trauma kits and 50 inflatable life jackets."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500"
          >
            Dispatch Unit Now
          </button>
        </form>
      </Modal>
    </div>
  );
};
