"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LuCalendar,
  LuClock,
  LuUser,
  LuMail,
  LuPhone,
  LuCheck,
  LuInbox,
  LuChevronLeft,
  LuChevronRight,
  LuLoader,
  LuX,
  LuStethoscope,
} from "react-icons/lu";

interface ScheduleConfig {
  working_days: number[];
  booking_range_days: number;
  blocked_dates: { blocked_date: string }[];
}

interface Service {
  id: string;
  name: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingForm() {
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [selectedService, setSelectedService] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  // Fallback schedule for this clinic (Mon-Thu)
  const fallbackSchedule: ScheduleConfig = {
    working_days: [1, 2, 3, 4],
    booking_range_days: 14,
    blocked_dates: [],
  };

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch("/api/admin/schedule");
        if (res.ok) {
          const data = await res.json();
          setSchedule(data);
        } else {
          setSchedule(fallbackSchedule);
        }
      } catch {
        setSchedule(fallbackSchedule);
      }
      setLoading(false);
    }

    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch {
        /* services are optional */
      }
    }

    fetchSchedule();
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch {
      /* slots will remain empty */
    }
    setSlotsLoading(false);
  }, []);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    fetchSlots(dateStr);
    setStep(services.length > 0 ? 2 : 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedSlot,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_id: selectedService || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to book. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const config = schedule || fallbackSchedule;

  // Generate calendar days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + config.booking_range_days);

  const blockedSet = new Set(config.blocked_dates.map((b) => b.blocked_date));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isDateAvailable = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    if (d < today || d > maxDate) return false;
    if (!config.working_days.includes(d.getDay())) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (blockedSet.has(dateStr)) return false;
    return true;
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  if (success) {
    return (
      <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary)] rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <LuCheck className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)] mb-2">
          Appointment Requested!
        </h3>
        <p className="text-[var(--color-text-light)] mb-4">
          Your appointment for <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been submitted.
        </p>
        <div className="flex items-center justify-center gap-2 text-[var(--color-primary)] font-medium">
          <LuInbox className="w-5 h-5" />
          <span>Check your email for confirmation details</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  const hasServices = services.length > 0;
  const totalSteps = hasServices ? 4 : 3;
  const serviceName = selectedService ? services.find(s => s.id === selectedService)?.name || "General Visit" : "General Visit";

  const formatSelectedDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-[var(--color-primary)]" : "bg-gray-200"}`} />
        ))}
      </div>

      {/* Summary of previous selections */}
      {step > 1 && (
        <div className="flex flex-wrap gap-2">
          {selectedDate && (
            <button onClick={() => { setStep(1); setSelectedSlot(null); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-50)] text-[var(--color-primary)] rounded-full text-sm font-medium hover:bg-[var(--color-primary)]/20 transition-all">
              <LuCalendar className="w-3.5 h-3.5" />
              {formatSelectedDate(selectedDate)}
              <LuX className="w-3 h-3 opacity-60" />
            </button>
          )}
          {hasServices && step > 2 && (
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-50)] text-[var(--color-primary)] rounded-full text-sm font-medium hover:bg-[var(--color-primary)]/20 transition-all">
              <LuStethoscope className="w-3.5 h-3.5" />
              {serviceName}
              <LuX className="w-3 h-3 opacity-60" />
            </button>
          )}
          {selectedSlot && step > (hasServices ? 3 : 2) && (
            <button onClick={() => setStep(hasServices ? 3 : 2)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-50)] text-[var(--color-primary)] rounded-full text-sm font-medium hover:bg-[var(--color-primary)]/20 transition-all">
              <LuClock className="w-3.5 h-3.5" />
              {selectedSlot}
              <LuX className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>
      )}

      {/* Step 1: Select Date */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold font-[family-name:var(--font-jakarta)] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Select a Date
          </h4>
          <div className="flex items-center justify-between mb-6">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all"><LuChevronLeft className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
              <LuCalendar className="w-5 h-5 text-[var(--color-primary)]" />
              {MONTH_NAMES[month]} {year}
            </h3>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all"><LuChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-[var(--color-text-light)] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const available = isDateAvailable(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              return (
                <button key={day} disabled={!available} onClick={() => handleDateSelect(dateStr)}
                  className={`h-10 rounded-lg text-sm font-medium transition-all duration-300 ${isSelected ? "bg-[var(--color-primary)] text-white shadow-md" : available ? "hover:bg-[var(--color-primary-50)] text-[var(--color-text)]" : "text-gray-300 cursor-not-allowed"}`}
                >{day}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Reason for Visit */}
      {step === 2 && hasServices && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold font-[family-name:var(--font-jakarta)] mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            Reason for Visit
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button type="button" onClick={() => { setSelectedService(""); setStep(3); }}
              className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-[var(--color-surface)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)] hover:text-white">
              General Visit
            </button>
            {services.map((s) => (
              <button key={s.id} type="button" onClick={() => { setSelectedService(s.id); setStep(3); }}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-[var(--color-surface)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)] hover:text-white">
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Pick a Time */}
      {step === (hasServices ? 3 : 2) && selectedDate && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold font-[family-name:var(--font-jakarta)] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">{hasServices ? "3" : "2"}</span>
            Pick a Time
          </h4>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LuLoader className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-[var(--color-text-light)] text-center py-4">
              No available times for this date. Please select another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button key={slot} onClick={() => { setSelectedSlot(slot); setStep(hasServices ? 4 : 3); }}
                  className="py-2 px-3 rounded-xl text-sm font-medium transition-all bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white">
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Your Information */}
      {step === (hasServices ? 4 : 3) && selectedSlot && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-base font-bold font-[family-name:var(--font-jakarta)] mb-2 flex items-center gap-2">
            <span className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">{hasServices ? "4" : "3"}</span>
            Your Information
          </h4>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Full Name</label>
            <div className="relative">
              <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Email</label>
            <div className="relative">
              <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone</label>
            <div className="relative">
              <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(208) 555-0123"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <LuLoader className="w-5 h-5 animate-spin" />
            ) : (
              <LuCheck className="w-5 h-5" />
            )}
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}
