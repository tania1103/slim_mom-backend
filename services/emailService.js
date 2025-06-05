const nodemailer = require('nodemailer');

// Validare email address
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Sanitize user input for email templates
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>&"']/g, (match) => {
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[match];
  });
};

// Configurează transportul email cu validare îmbunătățită
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Pentru producție (Gmail cu App Passwords)
    return nodemailer.createTransporter({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      secure: true,
      tls: {
        rejectUnauthorized: true
      }
    });
  } else {
    // Pentru development (Ethereal Email - test)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
};

const sendVerificationEmail = async (userEmail, verificationToken, userName) => {
  try {
    // Validate inputs
    if (!isValidEmail(userEmail)) {
      throw new Error('Invalid email address');
    }
    
    if (!verificationToken || verificationToken.length !== 64) {
      throw new Error('Invalid verification token');
    }

    const transporter = createTransporter();
    const sanitizedName = sanitizeInput(userName);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: {
        name: 'SlimMom Team',
        address: process.env.EMAIL_FROM || 'noreply@slimmom.com'
      },
      to: userEmail,
      subject: 'SlimMom - Email Verification Required',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; background: #ff6b35; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to SlimMom!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Hi ${sanitizedName},</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for registering with SlimMom! Please verify your email address to complete your registration and start your health journey.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666; background: #fff; padding: 10px; border-left: 3px solid #ff6b35;">${verificationUrl}</p>
            
            <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This link will expire in 24 hours. If you didn't create an account, please ignore this email.
                For security reasons, this email was sent from an automated system.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', userEmail, 'MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (userEmail, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@slimmom.com',
      to: userEmail,
      subject: 'SlimMom - Password Reset',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; background: #ff6b35; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1>Password Reset</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2>Hi ${userName},</h2>
            <p>You requested a password reset for your SlimMom account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};