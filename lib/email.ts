import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    try {
        const { data, error } = await resend.emails.send({
            // You must use a verified domain here, e.g. "noreply@enehoje.com".
            // For testing, Resend allows you to send emails ONLY to the email address
            // associated with your Resend account, using "onboarding@resend.dev".
            from: 'Enehøje <onboarding@resend.dev>',
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
