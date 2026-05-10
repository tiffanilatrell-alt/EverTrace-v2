import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, lovedOneName, tributeUrl } = req.body;

    if (!email || !lovedOneName || !tributeUrl) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { email, lovedOneName, tributeUrl },
      });
    }

    const subject = `Your tribute for ${lovedOneName} is ready`;

    const html = `
      <div style="margin:0;padding:0;background:#f7f3ee;font-family:Georgia,serif;color:#2f2437;">
        <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #eadfd4;">
            <p style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7c5f8f;margin:0 0 16px;">
              EverTrace
            </p>

            <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;color:#2f2437;">
              Your tribute for ${lovedOneName} is ready
            </h1>

            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;color:#4a3c52;">
              Thank you for creating a space to remember ${lovedOneName}. Your private tribute page is now available.
            </p>

            <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#4a3c52;">
              You can return to it anytime, continue adding details, or share it with family and friends.
            </p>

            <a href="${tributeUrl}" style="display:inline-block;background:#4b245f;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:16px;font-family:Arial,sans-serif;">
              View Tribute
            </a>

            <p style="font-size:14px;line-height:1.6;margin:28px 0 0;color:#6f6575;">
              If the button does not work, copy and paste this private link into your browser:<br />
              <a href="${tributeUrl}" style="color:#4b245f;">${tributeUrl}</a>
            </p>

            <hr style="border:none;border-top:1px solid #eadfd4;margin:28px 0;" />

            <p style="font-size:14px;line-height:1.6;margin:0;color:#6f6575;">
              EverTrace helps families preserve memories through digital tributes and lasting memorials.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Your tribute for ${lovedOneName} is ready.

Thank you for creating a space to remember ${lovedOneName}. Your private tribute page is now available.

View your tribute here:
${tributeUrl}

You can return to it anytime, continue adding details, or share it with family and friends.

— EverTrace
    `;

    const data = await resend.emails.send({
      from: "EverTrace <hello@evertrace.life>",
      to: email,
      subject,
      html,
      text,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Resend email error:", error);
    return res.status(500).json({
      error: "Failed to send tribute email",
      details: error?.message || String(error),
    });
  }
}