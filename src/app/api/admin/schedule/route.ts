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

    // Get available slots (one row per active day)
    const { data: slots } = await supabase
      .from("available_slots")
      .select("day_of_week, start_time, end_time, slot_duration_minutes")
      .eq("clinic_id", clinicId)
      .order("day_of_week");

    // Get blocked dates
    const { data: blockedDates } = await supabase
      .from("blocked_dates")
      .select("id, blocked_date, reason")
      .eq("clinic_id", clinicId)
      .order("blocked_date", { ascending: true });

    // Determine working days and time range from slots
    const workingDays: number[] = [];
    let startTime = "09:00";
    let endTime = "17:00";
    let slotDuration = 30;

    if (slots && slots.length > 0) {
      workingDays.push(...slots.map((s) => s.day_of_week));
      startTime = slots[0].start_time.substring(0, 5);
      endTime = slots[0].end_time.substring(0, 5);
      slotDuration = slots[0].slot_duration_minutes;
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

      // Insert one row per active working day
      const newSlots = working_days.map((day: number) => ({
        clinic_id: clinicId,
        day_of_week: day,
        start_time: start_time,
        end_time: end_time,
        slot_duration_minutes: slot_duration,
      }));

      if (newSlots.length > 0) {
        await supabase.from("available_slots").insert(newSlots);
      }
    }

    // Update blocked dates if provided
    if (blocked_dates !== undefined) {
      await supabase
        .from("blocked_dates")
        .delete()
        .eq("clinic_id", clinicId);

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
