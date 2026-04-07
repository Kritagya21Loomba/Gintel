import { NextResponse } from "next/server";

// ─── Email via Resend ──────────────────────────────────────
// Set RESEND_API_KEY in your .env.local
// Set FEEDBACK_TO_EMAIL to your inbox (e.g. kritagya@example.com)
//
// Install: npm install resend

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const TO_EMAIL = process.env.FEEDBACK_TO_EMAIL || "kritagyaloomba@gmail.com";
const FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || "onboarding@resend.dev";

type FeedbackType = "review" | "bug" | "feature" | "other";

const TYPE_LABELS: Record<FeedbackType, string> = {
    review: "⭐ Review",
    bug: "🐛 Bug Report",
    feature: "💡 Feature Request",
    other: "✉️ Other",
};

const TYPE_COLORS: Record<FeedbackType, string> = {
    review: "#00ff88",
    bug: "#f87171",
    feature: "#60a5fa",
    other: "#a3a3a3",
};

function buildHtml(opts: {
    type: FeedbackType;
    name: string;
    email: string;
    message: string;
    submittedAt: string;
}): string {
    const { type, name, email, message, submittedAt } = opts;
    const label = TYPE_LABELS[type] ?? type;
    const color = TYPE_COLORS[type] ?? "#00ff88";
    const displayName = name.trim() || "Anonymous";
    const displayEmail = email.trim() || "—";

    // Escape HTML entities
    const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gintel Feedback</title>
</head>
<body style="margin:0;padding:0;background:#080c10;font-family:'JetBrains Mono',monospace,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080c10;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header bar -->
          <tr>
            <td style="background:#0d1117;border:1px solid #1e293b;border-bottom:3px solid ${color};border-radius:12px 12px 0 0;padding:20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:11px;letter-spacing:3px;color:#64748b;text-transform:uppercase;">APP</span><br/>
                    <span style="font-size:20px;font-weight:800;color:${color};letter-spacing:2px;">GINTEL</span>
                    <span style="font-size:10px;color:#64748b;margin-left:8px;">github intelligence analyzer</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:${color}18;border:1px solid ${color}44;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:${color};">
                      ${label}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Meta row -->
          <tr>
            <td style="background:#0a0f16;border:1px solid #1e293b;border-top:none;padding:16px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:24px;">
                    <span style="font-size:9px;letter-spacing:2px;color:#64748b;text-transform:uppercase;display:block;margin-bottom:3px;">FROM</span>
                    <span style="font-size:13px;color:#e2e8f0;">${esc(displayName)}</span>
                    ${displayEmail !== "—" ? `<br/><a href="mailto:${esc(displayEmail)}" style="font-size:11px;color:#60a5fa;text-decoration:none;">${esc(displayEmail)}</a>` : `<br/><span style="font-size:11px;color:#475569;">no email provided</span>`}
                  </td>
                  <td align="right">
                    <span style="font-size:9px;letter-spacing:2px;color:#64748b;text-transform:uppercase;display:block;margin-bottom:3px;">RECEIVED</span>
                    <span style="font-size:12px;color:#94a3b8;">${esc(submittedAt)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message body -->
          <tr>
            <td style="background:#0d1117;border:1px solid #1e293b;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px 28px;">
              <span style="font-size:9px;letter-spacing:2px;color:#64748b;text-transform:uppercase;display:block;margin-bottom:12px;">MESSAGE</span>
              <div style="background:#080c10;border:1px solid #1e293b;border-left:3px solid ${color};border-radius:8px;padding:16px 18px;font-size:14px;line-height:1.8;color:#cbd5e1;">
                ${esc(message)}
              </div>
              ${displayEmail !== "—" ? `
              <div style="margin-top:20px;text-align:center;">
                <a href="mailto:${esc(displayEmail)}?subject=Re: Your Gintel Feedback"
                   style="display:inline-block;background:${color};color:#080c10;font-weight:700;font-size:12px;letter-spacing:1px;text-decoration:none;padding:10px 24px;border-radius:8px;">
                  REPLY TO ${esc(displayName.toUpperCase())}
                </a>
              </div>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 4px 0;text-align:center;">
              <span style="font-size:10px;color:#334155;">Sent via Gintel Feedback · gintel.vercel.app</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type = "other", name = "", email = "", message = "" } = body as {
            type: FeedbackType;
            name: string;
            email: string;
            message: string;
        };

        if (!message.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (!RESEND_API_KEY) {
            // Dev fallback — log to console so local testing still works
            console.log("\n── Gintel Feedback (no RESEND_API_KEY set) ──");
            console.log("Type   :", TYPE_LABELS[type] ?? type);
            console.log("From   :", name || "Anonymous", email ? `<${email}>` : "");
            console.log("Message:", message);
            console.log("────────────────────────────────────────────\n");
            return NextResponse.json({ ok: true, dev: true });
        }

        const submittedAt = new Date().toLocaleString("en-AU", {
            timeZone: "Australia/Melbourne",
            dateStyle: "medium",
            timeStyle: "short",
        });

        const typeLabel = TYPE_LABELS[type] ?? type;
        const subject = `[Gintel] ${typeLabel} from ${name.trim() || "Anonymous"}`;

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject,
                html: buildHtml({ type, name, email, message, submittedAt }),
                reply_to: email.trim() || undefined,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Resend error:", err);
            return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Feedback route error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}