import { NextRequest } from "next/server";
import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET() {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Get clinic settings
    const { data: clinic } = await supabase
      .from("clinics")
      .select("booking_range_days")
      .eq("id", clinicId)
      .single();

    // Get available slots grouped by day
    const { data: slots } = await supabase
      .from("available_slots")
      .select("day_of_week, time_slot, is_active")
      .eq("clinic_id", clinicId)
      .order("day_of_week")
      .order("time_slot");

    // Get blocked dates
    const { data: blockedDates } = await supabase
      .from("blocked_dates")
      .select("id, blocked_date, reason")
      .eq("clinic_id", clinicId)
      .order("blocked_date", { ascending: true });

    // Determine working days and time range from slots
    const workingDays: number[] = [];
    let startTime = "08:00";
    let endTime = "17:00";
    let slotDuration = 30;

    if (slots && slots.length > 0) {
      const activeDays = new Set(
        slots.filter((s: { is_active: boolean }) => s.is_active).map((s: { day_of_week: number }) => s.day_of_week)
      );
      workingDays.push(...Array.from(activeDays).sort() as number[]);

      const times = slots
        .filter((s: { is_active: boolean }) => s.is_active)
        .map((s: { time_slot: string }) => s.time_slot)
        .sort();

      if (times.length > 0) {
        startTime = times[0].substring(0, 5);
        endTime = times[times.length - 1].substring(0, 5);
      }

      // Estimate slot duration from gap between first two slots
      if (times.length >= 2) {
        const [h1, m1] = times[0].split(":").map(Number);
        const [h2, m2] = times[1].split(":").map(Number);
        slotDuration = (h2 * 60 + m2) - (h1 * 60 + m1);
      }
    }

    return Response.json({
      working_days: workingDays,
      start_time: startTime,
      end_time: endTime,
      slot_duration: slotDuration,
      booking_range_days: clinic?.booking_range_days || 14,
      blocked_dates: blockedDates || [],
    });
  } catch (error) {
    console.error("Schedule error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { working_days, start_time, end_time, slot_duration, booking_range_days, blocked_dates } = body;

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Update booking_range_days
    if (booking_range_days !== undefined) {
      await supabase
        .from("clinics")
        .update({ booking_range_days })
        .eq("id", clinicId);
    }

    // Regenerate available_slots if schedule params changed
    if (working_days && start_time && end_time && slot_duration) {
      // Delete existing slots
      await supabase
        .from("available_slots")
        .delete()
        .eq("clinic_id", clinicId);

      // Generate new slots
      const newSlots: { clinic_id: string; day_of_week: number; time_slot: string; is_active: boolean }[] = [];

      for (let day = 0; day <= 6; day++) {
        const isActive = working_days.includes(day);
        const [startH, startM] = start_time.split(":").map(Number);
        const [endH, endM] = end_time.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        for (let m = startMinutes; m < endMinutes; m += slot_duration) {
          const h = Math.floor(m / 60);
          const min = m % 60;
          newSlots.push({
            clinic_id: clinicId,
            day_of_week: day,
            time_slot: `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`,
            is_active: isActive,
          });
        }
      }

      if (newSlots.length > 0) {
        await supabase.from("available_slots").insert(newSlots);
      }
    }

    // Update blocked dates if provided
    if (blocked_dates !== undefined) {
      // Remove all existing blocked dates
      await supabase
        .from("blocked_dates")
        .delete()
        .eq("clinic_id", clinicId);

      // Insert new blocked dates
      if (blocked_dates.length > 0) {
        const newBlocked = blocked_dates.map((bd: { blocked_date: string; reason?: string }) => ({
          clinic_id: clinicId,
          blocked_date: bd.blocked_date,
          reason: bd.reason || null,
        }));
        await supabase.from("blocked_dates").insert(newBlocked);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Schedule update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
