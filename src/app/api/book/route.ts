import { NextRequest } from "next/server";
import { supabase, getClinicId, getClinic } from "@/app/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function to24h(timeStr: string): string {
  const [time, period] = timeStr.split(" ");
  const [hoursStr, minutes] = time.split(":");
  let hours = parseInt(hoursStr);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, name, email, phone, service_id } = body;

    if (!date || !time || !name || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const time24 = to24h(time);

    // Check if slot is still available
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("appointment_date", date)
      .eq("appointment_time", time24)
      .in("status", ["pending", "confirmed"]);

    if (existing && existing.length > 0) {
      return Response.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    // Insert appointment
    const insertData: Record<string, unknown> = {
      clinic_id: clinicId,
      patient_name: name,
      patient_email: email,
      patient_phone: phone || null,
      appointment_date: date,
      appointment_time: time24,
      status: "pending",
    };

    if (service_id) {
      insertData.service_id = service_id;
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting appointment:", error);
      return Response.json({ error: "Failed to book appointment" }, { status: 500 });
    }

    // Send confirmation email (best-effort)
    try {
      const clinic = await getClinic();
      const clinicName = clinic?.name || "Chad W. Dodds D.D.S.";
      const fromEmail = process.env.RESEND_FROM || "booking@resend.dev";

      await resend.emails.send({
        from: `${clinicName} <${fromEmail}>`,
        to: email,
        subject: `Appointment Request - ${clinicName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #116dff;">Appointment Request Received</h2>
            <p>Hi ${name},</p>
            <p>We received your appointment request. Here are the details:</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Status:</strong> Pending confirmation</p>
            </div>
            <p>We will confirm your appointment shortly. If you have any questions, please call us at <a href="tel:+12087335814">(208) 733-5814</a>.</p>
            <p>Thank you,<br/>${clinicName}</p>
          </div>
        `,
      });

      // Send copy to admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("notification_email")
        .eq("clinic_id", clinicId)
        .single();

      if (adminUser?.notification_email) {
        await resend.emails.send({
          from: `${clinicName} Bookings <${fromEmail}>`,
          to: adminUser.notification_email,
          subject: `New Appointment Request - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #116dff;">New Appointment Request</h2>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Patient:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
              </div>
              <p>Log in to your <a href="https://chad-w-dodds-dds.vercel.app/admin">admin dashboard</a> to confirm or manage this appointment.</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Email send error (non-fatal):", emailError);
    }

    return Response.json({ success: true, appointment });
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
