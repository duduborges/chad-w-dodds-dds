import { NextRequest } from "next/server";
import { getClinic } from "@/app/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, patient_name, date, time, action } = await request.json();

    if (!to || !patient_name || !date || !time || !action) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clinic = await getClinic();
    const clinicName = clinic?.name || "Chad W. Dodds D.D.S.";
    const fromEmail = process.env.RESEND_FROM || "booking@resend.dev";

    const isConfirm = action === "confirm";
    const subject = isConfirm
      ? `Appointment Confirmed - ${clinicName}`
      : `Appointment Cancelled - ${clinicName}`;

    const html = isConfirm
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #116dff;">Appointment Confirmed!</h2>
          <p>Hi ${patient_name},</p>
          <p>Great news! Your appointment has been confirmed.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #22c55e;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Location:</strong> 1415 Fillmore St, Suite 700, Twin Falls, ID 83301</p>
          </div>
          <p>If you need to reschedule, please call us at <a href="tel:+12087335814">(208) 733-5814</a>.</p>
          <p>See you soon!<br/>${clinicName}</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ef4444;">Appointment Cancelled</h2>
          <p>Hi ${patient_name},</p>
          <p>Your appointment has been cancelled.</p>
          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
          </div>
          <p>If you would like to reschedule, please call us at <a href="tel:+12087335814">(208) 733-5814</a> or book a new appointment online.</p>
          <p>Thank you,<br/>${clinicName}</p>
        </div>
      `;

    await resend.emails.send({
      from: `${clinicName} <${fromEmail}>`,
      to,
      subject,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Notify error:", error);
    return Response.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
