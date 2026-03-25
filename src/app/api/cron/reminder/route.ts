import { supabase, getClinicId, getClinic } from "@/app/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const clinic = await getClinic();
    const clinicName = clinic?.name || "Chad W. Dodds D.D.S.";
    const fromEmail = process.env.RESEND_FROM || "booking@resend.dev";

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Fetch confirmed appointments for tomorrow
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*, services(name)")
      .eq("clinic_id", clinicId)
      .eq("appointment_date", tomorrowStr)
      .eq("status", "confirmed");

    if (error) {
      console.error("Error fetching appointments:", error);
      return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }

    let remindersSent = 0;

    for (const apt of appointments || []) {
      try {
        // Convert time for display
        const [hours, minutes] = apt.appointment_time.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const displayTime = `${h12}:${minutes} ${ampm}`;

        await resend.emails.send({
          from: `${clinicName} <${fromEmail}>`,
          to: apt.patient_email,
          subject: `Appointment Reminder - Tomorrow at ${displayTime}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #116dff;">Appointment Reminder</h2>
              <p>Hi ${apt.patient_name},</p>
              <p>This is a friendly reminder about your appointment tomorrow.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Date:</strong> ${tomorrowStr}</p>
                <p><strong>Time:</strong> ${displayTime}</p>
                ${apt.services?.name ? `<p><strong>Service:</strong> ${apt.services.name}</p>` : ""}
              </div>
              <p><strong>Location:</strong> 1415 Fillmore St, Suite 700, Twin Falls, ID 83301</p>
              <p>If you need to reschedule, please call us at <a href="tel:+12087335814">(208) 733-5814</a>.</p>
              <p>See you tomorrow!<br/>${clinicName}</p>
            </div>
          `,
        });
        remindersSent++;
      } catch (emailError) {
        console.error(`Failed to send reminder to ${apt.patient_email}:`, emailError);
      }
    }

    return Response.json({ success: true, reminders_sent: remindersSent });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
