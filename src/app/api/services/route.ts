import { supabase, getClinicId } from "@/app/lib/supabase";

export async function GET() {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { data: services, error } = await supabase
      .from("services")
      .select("id, name, duration_minutes")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching services:", error);
      return Response.json({ error: "Failed to fetch services" }, { status: 500 });
    }

    return Response.json({ services: services || [] });
  } catch (error) {
    console.error("Services error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
