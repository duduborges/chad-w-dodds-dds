import { NextRequest } from "next/server";
import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET() {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*, services(name)")
      .eq("clinic_id", clinicId)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }

    return Response.json({ appointments: appointments || [] });
  } catch (error) {
    console.error("Appointments error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json({ error: "id and status are required" }, { status: 400 });
    }

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .select()
      .single();

    if (error) {
      console.error("Error updating appointment:", error);
      return Response.json({ error: "Failed to update appointment" }, { status: 500 });
    }

    return Response.json({ success: true, appointment: data });
  } catch (error) {
    console.error("Appointment update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
