import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("clinic_slug") || process.env.CLINIC_SLUG || "";

    // Get clinic by slug
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!clinic) {
      return Response.json({ plans: [] });
    }

    const { data: plans } = await supabase
      .from("insurance_plans")
      .select("id, name")
      .eq("clinic_id", clinic.id)
      .order("name", { ascending: true });

    return Response.json({ plans: plans || [] });
  } catch (error) {
    console.error("Insurance error:", error);
    return Response.json({ plans: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { plans } = await request.json();
    const slug = process.env.CLINIC_SLUG || "";

    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Delete existing plans
    await supabase
      .from("insurance_plans")
      .delete()
      .eq("clinic_id", clinic.id);

    // Insert new plans
    if (plans && plans.length > 0) {
      const newPlans = plans.map((name: string) => ({
        clinic_id: clinic.id,
        name,
      }));
      await supabase.from("insurance_plans").insert(newPlans);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Insurance update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
