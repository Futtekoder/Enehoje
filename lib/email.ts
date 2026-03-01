import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      // You must use a verified domain here, e.g. "noreply@enehoje.com".
      // For testing, Resend allows you to send emails ONLY to the email address
      // associated with your Resend account, using "onboarding@resend.dev".
      from: 'Enehøje <noreply@enehoje.com>',
      to: [email],
      subject: 'Nulstil din adgangskode til Enehøje',
      html: `
        <div>
          <h2>Nulstil adgangskode</h2>
          <p>Du har anmodet om at nulstille din adgangskode til Enehøje.</p>
          <p>Klik på linket herunder for at oprette en ny adgangskode. Linket er kun gyldigt i 1 time.</p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;margin-bottom:20px;">
            Nulstil Adgangskode
          </a>
          <p>Hvis du ikke har anmodet om dette, kan du trygt se bort fra denne e-mail.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error("Failed to send email via Resend API");
    }

    return true;
  } catch (error) {
    console.error("Email sending failure:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendAdminRegistrationNotification(
  userName: string,
  userEmail: string,
  shareName: string,
  approveLink: string,
  rejectLink: string
) {
  try {
    const { data, error } = await resend.emails.send({
      // You must use a verified domain here, e.g. "noreply@enehoje.com".
      from: 'Enehøje System <noreply@enehoje.com>',
      to: ['s.scagensstierne@gmail.com'],
      subject: `Ny Bruger Anmodning: ${userName} (${shareName})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #1e3a8a;">Ny Bruger Anmodning</h2>
          <p>En ny bruger har anmodet om at blive oprettet på Enehøje platformen.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Navn:</strong> ${userName}</p>
            <p style="margin: 0 0 10px 0;"><strong>E-mail:</strong> ${userEmail}</p>
            <p style="margin: 0;"><strong>Tilknyttet Andel:</strong> ${shareName}</p>
          </div>
          
          <p>Du kan godkende eller afvise brugeren direkte via knapperne herunder. Der er ikke behov for at logge ind.</p>
          
          <div style="margin-top: 30px; display: flex; gap: 15px;">
            <a href="${approveLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px;">
              ✅ Godkend Bruger
            </a>
            
            <a href="${rejectLink}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ❌ Afvis Bruger
            </a>
          </div>
          
          <p style="margin-top: 40px; font-size: 12px; color: #6b7280;">Dette er en automatisk genereret besked fra Enehøje systemet.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error (Admin Notification):", error);
    }
  } catch (error) {
    console.error("Failed to send admin notification:", error);
  }
}
