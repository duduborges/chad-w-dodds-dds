"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LuLock,
  LuLogOut,
  LuSettings,
  LuCalendar,
  LuClock,
  LuUser,
  LuMail,
  LuPhone,
  LuStethoscope,
  LuCheck,
  LuX,
  LuLoader,
  LuChevronLeft,
  LuChevronRight,
  LuPencil,
  LuBell,
  LuShield,
  LuPlus,
  LuTrash2,
  LuCalendarOff,
  LuCircleCheck,
  LuCircleAlert,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";

/* ─── Types ─── */
interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "cancelled";
  services?: { name: string } | null;
}

interface ScheduleConfig {
  working_days: number[];
  start_time: string;
  end_time: string;
  slot_duration: number;
  booking_range_days: number;
  blocked_dates: { id?: string; blocked_date: string; reason?: string }[];
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

/* ─── Constants ─── */
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};
const AVATAR_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
};

/* ─── Helpers ─── */
function formatTime(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/* ─── Toast Component ─── */
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease] ${
            t.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {t.type === "success" ? <LuCircleCheck className="w-4 h-4" /> : <LuCircleAlert className="w-4 h-4" />}
          {t.message}
          <button onClick={() => onDismiss(t.id)} className="ml-2 hover:opacity-70">
            <LuX className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Settings Modal ─── */
function SettingsModal({
  onClose,
  adminEmail,
  adminName,
  notificationEmail,
  addToast,
}: {
  onClose: () => void;
  adminEmail: string;
  adminName: string;
  notificationEmail: string;
  addToast: (type: "success" | "error", message: string) => void;
}) {
  const [tab, setTab] = useState<"account" | "schedule" | "insurance">("account");
  const [saving, setSaving] = useState(false);

  // Account state
  const [displayName, setDisplayName] = useState(adminName);
  const [notifEmail, setNotifEmail] = useState(notificationEmail);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCurrPw, setShowCurrPw] = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  // Insurance state
  const [plans, setPlans] = useState<string[]>([]);
  const [newPlan, setNewPlan] = useState("");
  const [insuranceLoading, setInsuranceLoading] = useState(false);

  useEffect(() => {
    if (tab === "schedule" && !schedule) {
      setScheduleLoading(true);
      fetch("/api/admin/schedule")
        .then((r) => r.json())
        .then((data) => setSchedule(data))
        .catch(() => addToast("error", "Failed to load schedule"))
        .finally(() => setScheduleLoading(false));
    }
    if (tab === "insurance" && plans.length === 0) {
      setInsuranceLoading(true);
      fetch("/api/insurance?clinic_slug=chad-w-dodds-dds")
        .then((r) => r.json())
        .then((data) => {
          if (data.plans && data.plans.length > 0) {
            setPlans(data.plans.map((p: { name: string }) => p.name));
          } else {
            setPlans(["Medicaid", "Delta Dental", "Cigna", "Aetna", "MetLife", "United Healthcare", "Guardian", "CareCredit"]);
          }
        })
        .catch(() => setPlans(["Medicaid", "Delta Dental", "Cigna", "Aetna", "MetLife", "United Healthcare", "Guardian", "CareCredit"]))
        .finally(() => setInsuranceLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const saveAccount = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = { admin_email: adminEmail };
      if (displayName !== adminName) body.name = displayName;
      if (notifEmail !== notificationEmail) body.notification_email = notifEmail;
      if (newPassword) {
        body.new_password = newPassword;
        body.current_password = currentPassword;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast("success", "Settings saved");
        setNewPassword("");
        setCurrentPassword("");
      } else {
        const data = await res.json();
        addToast("error", data.error || "Failed to save");
      }
    } catch {
      addToast("error", "Failed to save settings");
    }
    setSaving(false);
  };

  const saveSchedule = async () => {
    if (!schedule) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (res.ok) addToast("success", "Schedule updated");
      else addToast("error", "Failed to update schedule");
    } catch {
      addToast("error", "Failed to update schedule");
    }
    setSaving(false);
  };

  const saveInsurance = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/insurance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans }),
      });
      if (res.ok) addToast("success", "Insurance plans updated");
      else addToast("error", "Failed to update insurance");
    } catch {
      addToast("error", "Failed to update insurance");
    }
    setSaving(false);
  };

  const toggleWorkingDay = (day: number) => {
    if (!schedule) return;
    const days = schedule.working_days.includes(day)
      ? schedule.working_days.filter((d) => d !== day)
      : [...schedule.working_days, day].sort();
    setSchedule({ ...schedule, working_days: days });
  };

  const addBlockedDate = () => {
    if (!schedule || !newBlockedDate) return;
    setSchedule({
      ...schedule,
      blocked_dates: [...schedule.blocked_dates, { blocked_date: newBlockedDate, reason: newBlockedReason }],
    });
    setNewBlockedDate("");
    setNewBlockedReason("");
  };

  const removeBlockedDate = (index: number) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      blocked_dates: schedule.blocked_dates.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
            <LuSettings className="w-5 h-5 text-[var(--color-primary)]" />
            Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {(["account", "schedule", "insurance"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-light)] hover:text-[var(--color-text)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "account" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <div className="relative">
                  <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1"><LuBell className="w-4 h-4" /> Notification Email</label>
                <input type="email" value={notifEmail} onChange={(e) => setNotifEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNewPw ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}</button>
                </div>
              </div>
              {newPassword && (
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password (required)</label>
                  <div className="relative">
                    <input type={showCurrPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" />
                    <button type="button" onClick={() => setShowCurrPw(!showCurrPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCurrPw ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}</button>
                  </div>
                </div>
              )}
              <button onClick={saveAccount} disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                Save Account
              </button>
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-6">
              {scheduleLoading ? (
                <div className="flex justify-center py-8"><LuLoader className="w-6 h-6 animate-spin text-[var(--color-primary)]" /></div>
              ) : schedule ? (
                <>
                  {/* Working Days */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Working Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAY_LABELS.map((label, i) => (
                        <button key={i} onClick={() => toggleWorkingDay(i)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${schedule.working_days.includes(i) ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input type="time" value={schedule.start_time} onChange={(e) => setSchedule({ ...schedule, start_time: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <input type="time" value={schedule.end_time} onChange={(e) => setSchedule({ ...schedule, end_time: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                    </div>
                  </div>
                  {/* Slot Duration & Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Slot Duration (min)</label>
                      <input type="number" value={schedule.slot_duration} onChange={(e) => setSchedule({ ...schedule, slot_duration: parseInt(e.target.value) || 30 })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Booking Range (days)</label>
                      <input type="number" value={schedule.booking_range_days} onChange={(e) => setSchedule({ ...schedule, booking_range_days: parseInt(e.target.value) || 14 })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" />
                    </div>
                  </div>
                  {/* Blocked Dates */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1"><LuCalendarOff className="w-4 h-4" /> Blocked Dates</label>
                    <div className="flex gap-2 mb-2">
                      <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                      <input type="text" value={newBlockedReason} onChange={(e) => setNewBlockedReason(e.target.value)} placeholder="Reason (optional)" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                      <button onClick={addBlockedDate} className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]"><LuPlus className="w-4 h-4" /></button>
                    </div>
                    {schedule.blocked_dates.length > 0 && (
                      <div className="space-y-1">
                        {schedule.blocked_dates.map((bd, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                            <span>{bd.blocked_date} {bd.reason && `- ${bd.reason}`}</span>
                            <button onClick={() => removeBlockedDate(i)} className="text-red-500 hover:text-red-700"><LuTrash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={saveSchedule} disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    Save Schedule
                  </button>
                </>
              ) : null}
            </div>
          )}

          {tab === "insurance" && (
            <div className="space-y-4">
              {insuranceLoading ? (
                <div className="flex justify-center py-8"><LuLoader className="w-6 h-6 animate-spin text-[var(--color-primary)]" /></div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input type="text" value={newPlan} onChange={(e) => setNewPlan(e.target.value)} placeholder="Add insurance plan..." className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]" onKeyDown={(e) => { if (e.key === "Enter" && newPlan.trim()) { setPlans([...plans, newPlan.trim()]); setNewPlan(""); } }} />
                    <button onClick={() => { if (newPlan.trim()) { setPlans([...plans, newPlan.trim()]); setNewPlan(""); } }} className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] flex items-center gap-1"><LuPlus className="w-4 h-4" /> Add</button>
                  </div>
                  <div className="space-y-1">
                    {plans.map((plan, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-lg">
                        <span className="flex items-center gap-2 text-sm"><LuShield className="w-4 h-4 text-[var(--color-primary)]" /> {plan}</span>
                        <button onClick={() => setPlans(plans.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><LuTrash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveInsurance} disabled={saving} className="w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    Save Insurance Plans
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clinicId, setClinicId] = useState("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aptsLoading, setAptsLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingDate, setEditingDate] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem("admin_session");
    if (session) {
      try {
        const s = JSON.parse(session);
        setAdminName(s.admin_name);
        setAdminEmail(s.admin_email);
        setNotificationEmail(s.notification_email || "");
        setClinicId(s.clinic_id);
        setIsLoggedIn(true);
      } catch { /* invalid session */ }
    }
    setAuthChecked(true);
  }, []);

  const fetchAppointments = useCallback(async () => {
    setAptsLoading(true);
    try {
      const res = await fetch("/api/admin/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch {
      addToast("error", "Failed to load appointments");
    }
    setAptsLoading(false);
  }, [addToast]);

  useEffect(() => {
    if (isLoggedIn) fetchAppointments();
  }, [isLoggedIn, fetchAppointments]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_session", JSON.stringify(data));
        setAdminName(data.admin_name);
        setAdminEmail(data.admin_email);
        setNotificationEmail(data.notification_email || "");
        setClinicId(data.clinic_id);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    setIsLoggedIn(false);
    setAdminName("");
    setAdminEmail("");
    setClinicId("");
  };

  const handleAction = async (apt: Appointment, action: "confirm" | "cancel") => {
    const newStatus = action === "confirm" ? "confirmed" : "cancelled";
    setActionLoading(apt.id);

    try {
      // Update status
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apt.id, status: newStatus }),
      });

      if (res.ok) {
        // Send notification email
        const timeDisplay = formatTime(apt.appointment_time);
        await fetch("/api/admin/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: apt.patient_email,
            patient_name: apt.patient_name,
            date: apt.appointment_date,
            time: timeDisplay,
            action,
          }),
        }).catch(() => { /* email is best-effort */ });

        addToast("success", `Appointment ${newStatus}`);
        fetchAppointments();
      } else {
        addToast("error", "Failed to update appointment");
      }
    } catch {
      addToast("error", "Failed to update appointment");
    }
    setActionLoading(null);
  };

  // Filter appointments
  const getDateRange = () => {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    if (viewMode === "day") {
      return { start: new Date(d), end: new Date(d) };
    } else if (viewMode === "week") {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    } else {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start, end };
    }
  };

  const { start, end } = getDateRange();
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((a) => {
    if (a.appointment_date < startStr || a.appointment_date > endStr) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  // Group by date for week/month view
  const grouped = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.appointment_date]) acc[apt.appointment_date] = [];
    acc[apt.appointment_date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(grouped).sort();

  // KPI counts
  const dateRangeApts = appointments.filter((a) => a.appointment_date >= startStr && a.appointment_date <= endStr);
  const kpis = {
    total: dateRangeApts.length,
    pending: dateRangeApts.filter((a) => a.status === "pending").length,
    confirmed: dateRangeApts.filter((a) => a.status === "confirmed").length,
    cancelled: dateRangeApts.filter((a) => a.status === "cancelled").length,
  };

  const navigateDate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  // Loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <LuLoader className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center mx-auto mb-4">
              <LuLock className="w-7 h-7 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-jakarta)]">Admin Login</h1>
            <p className="text-sm text-[var(--color-text-light)] mt-1">Chad W. Dodds D.D.S.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" placeholder="admin@clinic.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" placeholder="Password" />
              </div>
            </div>
            {loginError && <p className="text-red-500 text-sm flex items-center gap-1"><LuCircleAlert className="w-4 h-4" /> {loginError}</p>}
            <button type="submit" disabled={loginLoading} className="w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loginLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuLock className="w-4 h-4" />}
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          adminEmail={adminEmail}
          adminName={adminName}
          notificationEmail={notificationEmail}
          addToast={addToast}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold font-[family-name:var(--font-jakarta)] text-lg text-[var(--color-text)]">
            Welcome, {adminName || "Admin"}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
              <LuSettings className="w-5 h-5 text-[var(--color-text-light)]" />
              <span className="hidden sm:inline sr-only">Settings</span>
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500" title="Sign Out">
              <LuLogOut className="w-5 h-5" />
              <span className="hidden sm:inline sr-only">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification email banner */}
      {!notificationEmail && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-amber-800 text-sm">
            <LuBell className="w-4 h-4 shrink-0" />
            <span>Set up your notification email in <button onClick={() => setShowSettings(true)} className="font-semibold underline">Settings</button> to receive booking alerts.</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: kpis.total, color: "bg-blue-50 text-blue-700" },
            { label: "Pending", value: kpis.pending, color: "bg-yellow-50 text-yellow-700" },
            { label: "Confirmed", value: kpis.confirmed, color: "bg-green-50 text-green-700" },
            { label: "Cancelled", value: kpis.cancelled, color: "bg-red-50 text-red-700" },
          ].map((kpi) => (
            <div key={kpi.label} className={`${kpi.color} rounded-xl p-4 border`}>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm font-medium opacity-80">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border shadow-sm">
          {/* View mode & date navigation */}
          <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["day", "week", "month"] as const).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${viewMode === mode ? "bg-white shadow text-[var(--color-primary)]" : "text-[var(--color-text-light)] hover:text-[var(--color-text)]"}`}>
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><LuChevronLeft className="w-4 h-4" /></button>
              <div className="relative">
                {editingDate ? (
                  <input
                    type="date"
                    value={currentDate.toISOString().split("T")[0]}
                    onChange={(e) => { setCurrentDate(new Date(e.target.value + "T00:00:00")); setEditingDate(false); }}
                    onBlur={() => setEditingDate(false)}
                    autoFocus
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  />
                ) : (
                  <button onClick={() => setEditingDate(true)} className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm font-medium">
                    {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <LuPencil className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><LuChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Status filters */}
          <div className="px-4 pb-4 border-t pt-3 flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", count: kpis.total },
              { key: "pending", label: "Pending", count: kpis.pending },
              { key: "confirmed", label: "Confirmed", count: kpis.confirmed },
              { key: "cancelled", label: "Cancelled", count: kpis.cancelled },
            ].map((f) => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${statusFilter === f.key ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-text-light)] border-gray-200 hover:border-gray-300"}`}>
                {f.label} <span className="ml-1 opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Appointments */}
        {aptsLoading ? (
          <div className="flex justify-center py-12"><LuLoader className="w-8 h-8 text-[var(--color-primary)] animate-spin" /></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-light)]">
            <LuCalendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No appointments found</p>
            <p className="text-sm">Try a different date range or filter.</p>
          </div>
        ) : viewMode === "day" ? (
          <div className="space-y-3">
            {filteredAppointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} actionLoading={actionLoading} onAction={handleAction} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="font-semibold text-sm text-[var(--color-text-light)] mb-2 flex items-center gap-2">
                  <LuCalendar className="w-4 h-4" />
                  {formatDate(date)}
                </h3>
                <div className="space-y-3 pl-4 border-l-2 border-[var(--color-primary)]/20">
                  {grouped[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Appointment Card Component ─── */
function AppointmentCard({
  apt,
  actionLoading,
  onAction,
}: {
  apt: Appointment;
  actionLoading: string | null;
  onAction: (apt: Appointment, action: "confirm" | "cancel") => void;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${AVATAR_COLORS[apt.status]}`}>
          {apt.patient_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[var(--color-text)]">{apt.patient_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_COLORS[apt.status]}`}>
              {apt.status}
            </span>
          </div>

          {/* Details */}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-light)]">
            <span className="flex items-center gap-1">
              <LuClock className="w-3.5 h-3.5" />
              {formatTime(apt.appointment_time)}
            </span>
            {apt.services?.name && (
              <span className="flex items-center gap-1">
                <LuStethoscope className="w-3.5 h-3.5" />
                {apt.services.name}
              </span>
            )}
            <a href={`mailto:${apt.patient_email}`} className="flex items-center gap-1 hover:text-[var(--color-primary)]">
              <LuMail className="w-3.5 h-3.5" />
              {apt.patient_email}
            </a>
            {apt.patient_phone && (
              <a href={`tel:${apt.patient_phone}`} className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                <LuPhone className="w-3.5 h-3.5" />
                {apt.patient_phone}
              </a>
            )}
          </div>

          {/* Actions */}
          {apt.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onAction(apt, "confirm")}
                disabled={actionLoading === apt.id}
                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-all disabled:opacity-60 flex items-center gap-1"
              >
                {actionLoading === apt.id ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCheck className="w-3.5 h-3.5" />}
                Confirm & Notify
              </button>
              <button
                onClick={() => onAction(apt, "cancel")}
                disabled={actionLoading === apt.id}
                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-all disabled:opacity-60 flex items-center gap-1"
              >
                <LuX className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
