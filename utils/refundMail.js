const nodemailer = require('nodemailer')

const refundMailer = async (email, refundDetails)=>{
    try {
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        let info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Refund - Order Cancellation",
            html:`<!doctype html>
                    <html lang="en">
                    <head>
                    <meta charset="utf-8">
                    <title>Refund Credited</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <style>
                        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                        table { border-collapse: collapse !important; }
                        body { margin: 0; padding: 0; width: 100% !important; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif; }
                        .btn {
                        display: inline-block;
                        padding: 12px 20px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        }
                        @media screen and (max-width: 600px) {
                        .container { width: 100% !important; padding: 16px !important; }
                        .two-col { display: block !important; width: 100% !important; }
                        .sm-hide { display: none !important; }
                        }
                    </style>
                    </head>
                    <body style="background-color:#f3f4f6; padding:20px;">

                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                        <td align="center">

                            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; width:100%; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.06);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="padding:20px 24px; background:linear-gradient(90deg,#0ea5e9,#6366f1); color:#fff;">
                                <table width="100%" role="presentation">
                                    <tr>
                                    <td style="vertical-align:middle;">
                                        <img src="{{logoUrl}}" alt="SonicBoom" width="40" height="40" style="display:inline-block; vertical-align:middle; border-radius:6px;"/>
                                        <span style="font-size:18px; font-weight:700; margin-left:10px; vertical-align:middle;">SonicBoom</span>
                                    </td>
                                    <td style="text-align:right; vertical-align:middle;" class="sm-hide">
                                        <span style="font-size:14px; opacity:0.95;">Refund Processed</span>
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:28px 24px 18px 24px; color:#111827;">
                                <h1 style="margin:0 0 12px 0; font-size:20px; font-weight:700; color:#0f172a;">Your refund has been credited</h1>
                                <p style="margin:0 0 18px 0; color:#374151; line-height:1.5;">
                                    Hi <strong>${refundDetails.name}</strong>,<br/>
                                    We have credited a refund of <strong>${refundDetails.refundAmount}</strong> to your original payment method on <strong>${refundDetails.date}</strong>.
                                </p>

                                <!-- Refund details -->
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 10px 0; border:1px solid #e6e9ef; border-radius:8px; overflow:hidden;">
                                    <tr>
                                    <td style="padding:12px 14px; background:#fafafa; font-weight:600; color:#111827; width:40%;">Order ID</td>
                                    <td style="padding:12px 14px; color:#374151;">${refundDetails.orderId}</td>
                                    </tr>
                                    <tr>
                                    <td style="padding:12px 14px; background:#ffffff; font-weight:600; color:#111827;">Refund Amount</td>
                                    <td style="padding:12px 14px; color:#374151;">${refundDetails.refundAmount}</td>
                                    </tr>
                                    <tr>
                                    <td style="padding:12px 14px; background:#fafafa; font-weight:600; color:#111827;">Refund Reason</td>
                                    <td style="padding:12px 14px; color:#374151;">Order Cancellation</td>
                                    </tr>
                                </table>

                                <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.45;">
                                    It may take 3–7 business days for the refund to show on your bank/UPI/CARD statement depending on your bank.  
                                    If you have any questions, reply to this email
                                </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding:18px 24px; background:#f8fafc; color:#6b7280; font-size:13px;">
                                <table width="100%" role="presentation">
                                    <tr>
                                    <td style="vertical-align:middle;">
                                        <div style="font-weight:600; color:#111827;">SonicBoom</div>
                                        <div style="margin-top:4px;">SonicBoom</div>
                                    </td>
        
                                    </tr>
                                </table>
                                </td>
                            </tr>

                            </table>

                        </td>
                        </tr>
                    </table>

                    </body>
                    </html>
`
        })
        return info
    } catch (error) {
        console.log(error)
    }
}

module.exports = refundMailer

