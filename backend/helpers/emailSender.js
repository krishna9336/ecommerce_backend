export const sendMail = async (
    content,
    toEmai,
    subject
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODE_MAILER_CLIENT_ID,
                pass: process.env.NODE_MAILER_CLIENT_SECRET,
            },
            logger: true,
        });

        await transporter.sendMail({
            from: process.env.NODE_MAILER_CLIENT_ID,
            to: toEmail,
            subject,
            html: content,
            headers: { "x-myheader": "test header" },
        });
        return true;
    } catch (error) {
        console.log(error)
        return false
    }
}