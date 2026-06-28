export const EVENT_REMINDER_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 40px; color: white; text-align: center; }
        .logo { font-weight: 900; font-size: 24px; letter-spacing: -1px; }
        .content { padding: 40px; }
        .tag { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #6366f1; margin-bottom: 8px; display: block; }
        h1 { font-size: 24px; font-weight: 900; margin: 0 0 16px; letter-spacing: -0.5px; }
        p { line-height: 1.6; color: #64748b; font-weight: 500; font-size: 14px; }
        .details { background: #f1f5f9; padding: 24px; border-radius: 16px; margin-top: 32px; }
        .detail-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 13px; font-weight: 700; }
        .footer { padding: 40px; text-align: center; border-top: 1px solid #f1f5f9; }
        .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Tankonomics</div>
        </div>
        <div class="content">
            <span class="tag">Technical Session Sync</span>
            <h1>Technical Alert: {{eventName}}</h1>
            <p>This is a synchronized briefing for your upcoming industrial session. Our records indicate you are scheduled to participate in the follow technical gathering in 24 hours.</p>
            
            <div class="details">
                <div class="detail-item">📅 {{eventDate}}</div>
                <div class="detail-item">📍 {{eventLocation}}</div>
                <div class="detail-item">⏰ Participation required</div>
            </div>

            <p style="margin-top: 32px;">Please ensure all technical documentation is reviewed and site safety protocols are observed if participating in a physical tour.</p>
            
            <a href="{{eventLink}}" class="btn">Access Session Logistics</a>
        </div>
        <div class="footer">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 900; color: #cbd5e1;">© 2026 Tankonomics Industrial Network</p>
        </div>
    </div>
</body>
</html>
`;
