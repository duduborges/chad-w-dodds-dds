import { NextRequest } from "next/server";
import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return Response.json({ error: "date parameter required" }, { status: 400 });
    }

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Get clinic settings for booking_range_days
    const { data: clinic } = await supabase
      .from("clinics")
      .select("booking_range_days")
      .eq("id", clinicId)
      .single();

    const bookingRange = clinic?.booking_range_days || 14;

    // Check if date is within booking range
    const targetDate = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + bookingRange);

    if (targetDate < today || targetDate > maxDate) {
      return Response.json({ slots: [] });
    }

    // Check if date is blocked
    const { data: blocked } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("blocked_date", dateStr);

    if (blocked && blocked.length > 0) {
      return Response.json({ slots: [] });
    }

    // Get day of week (0=Sunday, 1=Monday, ...)
    const dayOfWeek = targetDate.getDay();

    // Get available_slots config for this day (one row with start_time, end_time, slot_duration_minutes)
    const { data: slotConfig } = await supabase
      .from("available_slots")
      .select("start_time, end_time, slot_duration_minutes")
      .eq("clinic_id", clinicId)
      .eq("day_of_week", dayOfWeek)
      .single();

    if (!slotConfig) {
      return Response.json({ slots: [] });
    }

    // Generate time slots from start_time to end_time
    const [startH, startM] = slotConfig.start_time.split(":").map(Number);
    const [endH, endM] = slotConfig.end_time.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = slotConfig.slot_duration_minutes;

    const allSlots: string[] = [];
    for (let m = startMinutes; m < endMinutes; m += duration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const time24 = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`;
      allSlots.push(time24);
    }

    // Get existing appointments for this date to exclude booked slots
    const { data: appointments } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("clinic_id", clinicId)
      .eq("appointment_date", dateStr)
      .in("status", ["pending", "confirmed"]);

    const bookedTimes = new Set(
      (appointments || []).map((a: { appointment_time: string }) => a.appointment_time)
    );

    // Filter out booked slots and format for display (12h)
    const slots = allSlots
      .filter((time24) => !bookedTimes.has(time24))
      .map((time24) => {
        const [hours, minutes] = time24.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${minutes} ${ampm}`;
      });

    return Response.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
