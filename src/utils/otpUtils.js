const axios = require('axios');

// function isValidMobilePhoneNumber(phone) {
//     if (typeof phone !== 'string' || !/^\d+$/.test(phone)) return false;

//     const len = phone.length;

//     return (
//         (phone.startsWith('08') && len >= 10 && len <= 13) ||
//         (phone.startsWith('628') && len >= 11 && len <= 14)
//     );
// }

// async function isValidMobilePhoneNumber(phone) {
//     return (
//         typeof phone === 'string' &&
//         /^\d{10,13}$/.test(phone) &&
//         /^(0|62|8)/.test(phone)
//     );
// }
async function isValidMobilePhoneNumber(phone) {
    if (['08', '8', '+62', '62'].includes(phone)) return true;
    return /^((\+62|62)|0)8[1-9][0-9]{6,9}$/.test(phone);
}

async function normalizePhone(phone) {
    if (['08', '8', '+62', '62'].includes(phone)) return '08';

    if (phone.startsWith('0')) return '62' + phone.slice(1);
    if (phone.startsWith('+62')) return phone.slice(1);
    return phone;
}

async function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpWhatsapp(otp, phone) {
    const waPayload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
            name: "ecgo_otp",
            language: { code: "ID", policy: "deterministic" },
            components: [
                {
                    type: "body",
                    parameters: [{ type: "text", text: otp }]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [{ type: "text", text: otp }]
                }
            ]
        }
    };

    const wa_token = 'YOUR_WHATSAPP_TOKEN';
    const wa_url = 'https://graph.facebook.com/v15.0/YOUR_PHONE_ID/messages';

    await axios.post(wa_url, waPayload, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${wa_token}`
        }
    });
}

module.exports = {
    normalizePhone, isValidMobilePhoneNumber, generateOtpCode, sendOtpWhatsapp
};