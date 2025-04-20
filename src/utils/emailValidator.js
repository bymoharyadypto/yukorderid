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

module.exports = { isEmailValid, isEmailDeliverable };