import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { email, lovedOneName, tributeUrl } = req.body;

    const response = await resend.emails.send({
      from: "EverTrace <hello@evertrace.life>",
      to: email,
      subject: `Your tribute for ${lovedOneName} is ready`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Your EverTrace tribute is ready</h2>

          <p>
            Thank you for creating a tribute for
            <strong>${lovedOneName}</strong>.
          </p>

          <p>
            View your tribute here:
          </p>

          <p>
            <a href="${tributeUrl}">
              ${tributeUrl}
            </a>
          </p>

          <p>
            You can continue editing or share this page with family and friends.
          </p>

          <br />

          <p>
            — EverTrace
          </p>
        </div>
      `,
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to send email",
    });
  }
}
