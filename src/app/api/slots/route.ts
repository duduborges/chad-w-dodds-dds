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

    // Get available slots for this day
    const { data: availableSlots } = await supabase
      .from("available_slots")
      .select("time_slot")
      .eq("clinic_id", clinicId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .order("time_slot", { ascending: true });

    if (!availableSlots || availableSlots.length === 0) {
      return Response.json({ slots: [] });
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

    // Filter out booked slots and format for display
    const slots = availableSlots
      .filter((s: { time_slot: string }) => !bookedTimes.has(s.time_slot))
      .map((s: { time_slot: string }) => {
        // Convert 24h to 12h format
        const [hours, minutes] = s.time_slot.split(":");
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
