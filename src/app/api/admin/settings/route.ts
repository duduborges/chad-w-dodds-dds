import { NextRequest } from "next/server";
import { supabase, getClinicId } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, notification_email, new_password, current_password, admin_email } = body;

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Get current admin
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("clinic_id", clinicId)
      .eq("email", admin_email)
      .single();

    if (!admin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;
    if (notification_email !== undefined) updates.notification_email = notification_email;

    // Password change requires current password verification
    if (new_password) {
      if (!current_password) {
        return Response.json({ error: "Current password is required" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(current_password, admin.password_hash);
      if (!isValid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 401 });
      }
      updates.password_hash = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", admin.id);

    if (error) {
      console.error("Error updating settings:", error);
      return Response.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
