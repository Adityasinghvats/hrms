import nodemailer from 'nodemailer';
import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const emailLimiter = {
    ipRequests: new Map(),
    maxEmails : 100,
    windowMs : 1000 * 60 * 15, // 15 minutes
    isRateLimited: function (ip) {
        const now = Date.now();
        if (!this.ipRequests.has(ip)) {
            this.ipRequests.set(ip, { count: 0, resetTime: now + this.windowMs });
            return false;
          }
        const record = this.ipRequests.get(ip);
        if(now > record.resetTime){
            record.count = 0;
            record.resetTime = now + this.windowMs;
            return false;
        }
        return record.count >= this.maxEmails;
    },
    incrementCounter: function(ip) {
        if (!this.ipRequests.has(ip)) {
          this.ipRequests.set(ip, { 
            count: 1, 
            resetTime: Date.now() + this.windowMs 
          });
          return;
        }
        
        const record = this.ipRequests.get(ip);
        record.count += 1;
      }
}

const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
    }
});

// const transporter = nodemailer.createTransport({
//     pool: true,
//     service: 'gmail',
//     host : 'smtp.gmail.com',
//     port : 587,
//     host:'sandbox.smtp.mailtrap.io',
//     port: 2525,
//     secure:false,
//     auth: {
//         user: process.env.USER,
//         pass: process.env.PASS
//     },
//     maxConnections: 10,
//     maxMessages: Infinity
// })

//setup queue for sending emails 
// need to configure redis server in docker compose file
// export const emailQueue = new Queue('emailQueue', {
//     connection: {
//         host: 'localhost',
//         port: 6379,
//     },
// });

// const worker = new Worker('emailQueue', async (job) => {
//     const { to, username, password } = job.data;
//     const mailOptions = {
//         from: `Hi new employee 😶‍🌫️ <${process.env.USER_MAIL}>`,
//         to,
//         html: `
//         <h3>Welcome to the team!</h3>
//         <p>Your HRMS login details:</p>
//         <ul>
//           <li><strong>Username:</strong> ${username}</li>
//           <li><strong>Password:</strong> ${password}</li>
//         </ul>
//         <p>Please log in and change your password at your earliest convenience.</p>
//       `,
//     }
//     console.log('sending email')
//     await transporter.sendMail(mailOptions)
//     console.log('email sent')
// }, {
//     connection: {
//         host: 'localhost',
//         port: 6379,
//     },
// });
// worker.on('completed', job => {
//     console.log(`Job ${job.id} completed successfully`);
// });

// worker.on('failed', (job, err) => {
//     console.error(`Job ${job?.id} failed with error: ${err.message}`);
// });

export const sendEmail = async (to, username, password, ip = '127.0.0.1') => {
    if (emailLimiter.isRateLimited(ip)) {
        console.error('Email rate limit exceeded for IP:', ip);
        return {
            success: false,
            error: 'Rate limit exceeded. Too many emails sent from this IP address.'
        };
    }
    try {
        const mailOptions = {
            from: process.env.USER_MAIL,
            to,
            subject: 'Welcome to the team!',
            html: `
            <h3>Welcome to the team!</h3>
            <p>Your HRMS login details:</p>
            <ul>
              <li><strong>Username:</strong> ${username}</li>
              <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p><a href="https://hrms-platform.vercel.app/" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to your account</a></p>
            <p>Please log in and change your password at your earliest convenience.</p>
          `,
        }
        console.log('sending email')
        await transporter.sendMail(mailOptions)
        console.log('email sent')
        emailLimiter.incrementCounter(ip);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// mock queue named function
export const emailQueue = {
    add: async (jobName, data) => {
        const ip = data.ip || '127.0.0.1';
        return sendEmail(data.to, data.username, data.password, ip);
    }
};