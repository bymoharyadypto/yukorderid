const dns = require('dns').promises;
const validator = require('validator');
const isDisposableEmail = require('is-disposable-email');

async function isEmailValid(email) {
    if (!email) return false;
    if (email.length > 254) return false;

    const emailRegex =
        /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!emailRegex.test(email)) return false;

    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return false;
    if (localPart.length > 64) return false;

    const domainParts = domain.split(".");
    if (domainParts.some(part => part.length > 63)) return false;

    return true;
};

async function isEmailDeliverable(email) {
    if (typeof email !== 'string' || !validator.isEmail(email)) return false;
    if (isDisposableEmail(email)) return false;

    const domain = email.split('@')[1];
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch (err) {
        return false;
    }
};

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