import { NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const slug = process.env.CLINIC_SLUG || "";

    // Get clinic by slug
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!clinic) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Get admin user
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, clinic_id, name, email, password_hash, notification_email")
      .eq("clinic_id", clinic.id)
      .eq("email", email)
      .single();

    if (!admin) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({
      success: true,
      clinic_id: admin.clinic_id,
      admin_name: admin.name,
      admin_email: admin.email,
      notification_email: admin.notification_email,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
