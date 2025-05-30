import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const { to, subject, html, text } = await request.json()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    })

    const mailOptions = {
      from: `"Share.io" <${process.env.GMAIL_USER}>`,  // sender name + email
      to,
      subject,
      text,
      html,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent info:', info)

    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
