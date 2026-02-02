import crypto from 'crypto';

interface PaymentData {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    salt: string;
}

export function generatePaymentHash(data: PaymentData): string {
    const { key, txnid, amount, productinfo, firstname, email, salt } = data;
    // hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

export function verifyPaymentResponse(params: any, salt: string): boolean {
    // hash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const { status, email, firstname, productinfo, amount, txnid, key, hash } = params;
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return calculatedHash === hash;
}
