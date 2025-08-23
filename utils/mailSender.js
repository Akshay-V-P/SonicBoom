const nodemailer = require('nodemailer')

const mailSender = async (email, otp)=>{
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
            subject: "SonicBoom Login OTP",
            html:`<!DOCTYPE html>
                    <html>
                    <head>
                    <meta charset="UTF-8">
                    <title>SonicBoom OTP Verification</title>
                    </head>
                    <body style="margin:0; padding:0; background-color:#0F0F0F; font-family:Arial, sans-serif; color:#FFFFFF;">

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1A1A1A; padding:20px; border-radius:8px;">

                            <!-- Header -->
                            <tr>
                                <td style="text-align:left; font-size:24px; font-weight:bold; color:#FFFFFF;">
                                SonicBoom
                                </td>
                            </tr>

                            <!-- Title -->
                            <tr>
                                <td style="padding:30px 0; text-align:center;">
                                <h2 style="color:#FFFFFF; font-size:26px;">OTP Verification</h2>
                                <p style="color:#B0B0B0; font-size:16px;">Use the following OTP to verify your account:</p>
                                </td>
                            </tr>

                            <!-- OTP Code Box -->
                            <tr>
                                <td style="text-align:center; padding:20px 0;">
                                <div style="display:inline-block; padding:15px 30px; background-color:#0F0F0F; border:2px dashed #00FF85; border-radius:8px; font-size:28px; font-weight:bold; color:#00FF85;">
                                    ${otp}
                                </div>
                                </td>
                            </tr>

                            <!-- Instruction -->
                            <tr>
                                <td style="padding:20px 0; text-align:center; color:#B0B0B0; font-size:14px;">
                                This OTP is valid for the next 1 minutes. Please do not share it with anyone.
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="text-align:center; color:#555555; font-size:12px; padding-top:30px;">
                                © 2025 SonicBoom. All rights reserved.
                                </td>
                            </tr>

                            </table>
                        </td>
                        </tr>
                    </table>

                    </body>
                    </html>`
        })
        return info
    } catch (error) {
        console.log(error)
    }
}

module.exports = mailSender

