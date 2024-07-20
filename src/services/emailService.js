// src/services/emailService.js
import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_20cnorp';
const USER_ID = 'SF_Mf5rPsbaV133ly';
const NOTIFICATION_TEMPLATE_ID = 'template_b1bw9vn';

export const sendNotificationEmail = async (type, email = null, name = null) => {
  const templateParams = {
    notification_type: type,
    to_email: 'kitchan98@gmail.com',
    user_email: email,
    user_name: name
  };

  try {
    await emailjs.send(SERVICE_ID, NOTIFICATION_TEMPLATE_ID, templateParams, USER_ID);
    console.log(`Notification email sent: ${type}`);
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
};