import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShieldAlert,
  Home,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  PlusCircle,
  FileSpreadsheet,
  BrainCircuit,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Disaster, Shelter, DisasterReport, ResponseAssignment, ReliefResource } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DisasterMap } from '../components/map/DisasterMap';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Data states
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [assignments, setAssignments] = useState<ResponseAssignment[]>([]);
  const [resources, setResources] = useState<ReliefResource[]>([]);
  const [userCount, setUserCount] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, sRes, rRes, resRes] = await Promise.all([
        api.get('/disasters'),
        api.get('/shelters'),
        api.get('/reports'),
        api.get('/resources'),
      ]);

      if (dRes.data.success) setDisasters(dRes.data.disasters || []);
      if (sRes.data.success) setShelters(sRes.data.shelters || []);
      if (rRes.data.success) setReports(rRes.data.reports || []);
      if (resRes.data.success) setResources(resRes.data.resources || []);

      if (user?.role === 'ADMIN' || user?.role === 'RESPONDER') {
        const aRes = await api.get('/assignments');
        if (aRes.data.success) setAssignments(aRes.data.assignments || []);
        if (user.role === 'ADMIN') {
          const uRes = await api.get('/users');
          if (uRes.data.success) setUserCount(uRes.data.count || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Gathering live disaster response telemetry..." />;
  }

  // Calculated Metrics
  const activeDisasters = disasters.filter((d) => ['Active', 'Verified', 'Pending'].includes(d.status));
  const criticalDisasters = disasters.filter((d) => d.severity === 'Critical');
  const openShelters = shelters.filter((s) => s.status === 'OPEN');
  const pendingReports = reports.filter((r) => r.status === 'Pending');
  const availableResources = resources.filter((res) => res.status === 'AVAILABLE');

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-white">
              Welcome Back, {user?.name}
            </h1>
            <Badge variant="role" value={user?.role || 'USER'} />
          </div>
          <p className="text-xs text-slate-400">
            Real-time emergency operational dashboard & AI threat intelligence overview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </Link>

          <Link
            to="/ai-insights"
            className="px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800 text-purple-300 font-semibold text-xs flex items-center space-x-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Hub</span>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADMIN DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Active Disasters"
              value={activeDisasters.length}
              subtitle={`${criticalDisasters.length} Critical Events`}
              icon={<Flame className="w-6 h-6" />}
              color="rose"
            />
            <StatCard
              title="Open Shelters"
              value={openShelters.length}
              subtitle={`${shelters.length} Total Facilities`}
              icon={<Home className="w-6 h-6" />}
              color="sky"
            />
            <StatCard
              title="Pending Reports"
              value={pendingReports.length}
              subtitle="Awaiting Verification"
              icon={<AlertTriangle className="w-6 h-6" />}
              color="amber"
            />
            <StatCard
              title="Relief Resources"
              value={availableResources.length}
              subtitle={`${resources.length} Total Items`}
              icon={<Package className="w-6 h-6" />}
              color="emerald"
            />
          </div>

          {/* Interactive Map & Rapid Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-white">Live Operations Map</h3>
                  <p className="text-xs text-slate-400">Interactive pins for active disaster events & shelters.</p>
                </div>
                <Link to="/disasters" className="text-xs text-sky-400 hover:underline flex items-center">
                  Full View <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
              <DisasterMap disasters={disasters} shelters={shelters} height="380px" />
            </div>

            {/* Pending Reports Quick Dispatch Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-white">Pending Incidents</h3>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {pendingReports.length} New
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {pendingReports.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                      No pending report verifications required.
                    </div>
                  ) : (
                    pendingReports.map((report) => (
                      <div key={report.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-200 truncate">{report.location}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 line-clamp-2 mb-2">{report.description}</p>
                        <Link
                          to="/disasters"
                          className="inline-flex items-center text-sky-400 hover:underline font-semibold text-[11px]"
                        >
                          Review & Assign Responder →
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                to="/assignments"
                className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold text-center block"
              >
                View Responder Assignments ({assignments.length})
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RESPONDER DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'RESPONDER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="My Assigned Tasks"
              value={assignments.filter((a) => a.responderId === user.id).length}
              subtitle="Total Incidents Dispatched"
              icon={<ShieldAlert className="w-6 h-6" />}
              color="sky"
            />
            <StatCard
              title="In Progress Rescues"
              value={assignments.filter((a) => a.responderId === user.id && a.status === 'In Progress').length}
              subtitle="Active Field Operations"
              icon={<Clock className="w-6 h-6" />}
              color="amber"
            />
            <StatCard
              title="Completed Rescues"
              value={assignments.filter((a) => a.responderId === user.id && a.status === 'Completed').length}
              subtitle="Resolved Incidents"
              icon={<CheckCircle className="w-6 h-6" />}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Active Assigned Tasks */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-base text-white mb-4">Assigned Rescue Missions</h3>
              <div className="space-y-4">
                {assignments.filter((a) => a.responderId === user.id).length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No active assignments assigned to your team.</p>
                ) : (
                  assignments
                    .filter((a) => a.responderId === user.id)
                    .map((a) => (
                      <div key={a.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{a.disaster?.title || 'Emergency Mission'}</span>
                          <Badge variant="status" value={a.status} />
                        </div>
                        <p className="text-xs text-slate-300">📍 {a.disaster?.location}</p>
                        {a.notes && <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">Notes: {a.notes}</p>}
                        <div className="flex justify-end">
                          <Link
                            to="/assignments"
                            className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500"
                          >
                            Update Progress Status
                          </Link>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Map Preview */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-base text-white mb-3">Rescue Area Map</h3>
              <DisasterMap disasters={disasters} shelters={shelters} height="300px" />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* USER / CITIZEN DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {user?.role === 'USER' && (
        <div className="space-y-8">
          {/* Active Emergency Alerts Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border border-red-800/50 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Active Emergency Alerts ({disasters.length})</h3>
                <p className="text-xs text-slate-300">Stay safe. View nearby open shelters if evacuation is advised.</p>
              </div>
            </div>
            <Link
              to="/shelters"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
            >
              Locate Shelters
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Submitted Disaster Reports */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-white">My Incident Reports</h3>
                  <p className="text-xs text-slate-400">Track verification status of reports submitted by you.</p>
                </div>
                <Link
                  to="/reports"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Report</span>
                </Link>
              </div>

              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    You have not submitted any disaster reports yet.
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-sm text-white">{report.location}</span>
                          <Badge variant="status" value={report.status} />
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">{report.description}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Reported on: {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nearby Shelters Summary */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-base text-white mb-3">Nearby Shelters</h3>
              <div className="space-y-3">
                {shelters.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-slate-200 mb-1">
                      <span>{s.name}</span>
                      <span className={s.status === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'}>{s.status}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{s.location}</p>
                    <div className="mt-2 text-[11px] text-sky-400 font-semibold">📞 {s.contactNumber}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/shelters"
                className="w-full mt-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold text-center block border border-slate-800"
              >
                View Map & All Shelters
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
