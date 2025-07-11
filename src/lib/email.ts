// 邮件服务
// 这里使用 nodemailer 作为示例，实际使用时需要安装：npm install nodemailer @types/nodemailer

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// 邮件模板
export const emailTemplates = {
  // 邮箱验证邮件模板
  verifyEmail: (verificationUrl: string, userName: string) => ({
    subject: '验证您的邮箱地址 - 思维笔记',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .content {
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .button:hover {
              background-color: #2563eb;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
            .link {
              color: #3b82f6;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">思维笔记</div>
            </div>
            <div class="content">
              <h2>验证您的邮箱地址</h2>
              <p>您好 ${userName}，</p>
              <p>感谢您注册思维笔记！请点击下面的按钮验证您的邮箱地址：</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">验证邮箱</a>
              </div>
              <p>或者，您也可以复制以下链接到浏览器中打开：</p>
              <p class="link">${verificationUrl}</p>
              <p>此链接将在 24 小时后失效。</p>
              <p>如果您没有注册思维笔记账号，请忽略此邮件。</p>
            </div>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿回复。</p>
              <p>&copy; ${new Date().getFullYear()} 思维笔记</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
验证您的邮箱地址

您好 ${userName}，

感谢您注册思维笔记！请访问以下链接验证您的邮箱地址：

${verificationUrl}

此链接将在 24 小时后失效。

如果您没有注册思维笔记账号，请忽略此邮件。

此邮件由系统自动发送，请勿回复。
© ${new Date().getFullYear()} 思维笔记
    `
  }),

  // 密码重置邮件模板
  resetPassword: (resetUrl: string, userName: string) => ({
    subject: '重置密码 - 思维笔记',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* 使用相同的样式 */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .content {
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
            .link {
              color: #3b82f6;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">思维笔记</div>
            </div>
            <div class="content">
              <h2>重置您的密码</h2>
              <p>您好 ${userName}，</p>
              <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">重置密码</a>
              </div>
              <p>或者，您也可以复制以下链接到浏览器中打开：</p>
              <p class="link">${resetUrl}</p>
              <p>此链接将在 1 小时后失效。</p>
              <p>如果您没有请求重置密码，请忽略此邮件，您的密码不会改变。</p>
            </div>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿回复。</p>
              <p>&copy; ${new Date().getFullYear()} 思维笔记</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
重置您的密码

您好 ${userName}，

我们收到了您的密码重置请求。请访问以下链接重置您的密码：

${resetUrl}

此链接将在 1 小时后失效。

如果您没有请求重置密码，请忽略此邮件，您的密码不会改变。

此邮件由系统自动发送，请勿回复。
© ${new Date().getFullYear()} 思维笔记
    `
  })
}

// 发送邮件函数
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // 在实际应用中，这里应该使用真实的邮件服务
    // 例如：SendGrid, AWS SES, Postmark, Resend 等
    
    // 示例：使用 nodemailer（需要配置 SMTP）
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"思维笔记" <noreply@example.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    */

    // 开发环境下，只打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('---')
      return true
    }

    // 生产环境下，应该调用真实的邮件服务
    // throw new Error('Email service not configured')
    
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// 发送验证邮件
export async function sendVerificationEmail(
  email: string, 
  userName: string, 
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
  const template = emailTemplates.verifyEmail(verificationUrl, userName)
  
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(
  email: string, 
  userName: string, 
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  const template = emailTemplates.resetPassword(resetUrl, userName)
  
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}