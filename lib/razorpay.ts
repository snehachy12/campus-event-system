import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance - lazy initialization
let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
    if (!razorpayInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials are not configured in environment variables');
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    return razorpayInstance;
};

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, orderId: string, customerEmail: string) => {
    try {
        const instance = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: orderId,
            notes: {
                order_id: orderId,
                customer_email: customerEmail,
            },
        };

        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

// Verify Razorpay payment signature
export const verifyRazorpaySignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean => {
    try {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === razorpaySignature;
    } catch (error) {
        console.error('Error verifying Razorpay signature:', error);
        return false;
    }
};

// Get payment details
export const getRazorpayPayment = async (paymentId: string) => {
    try {
        const instance = getRazorpayInstance();
        const payment = await instance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching Razorpay payment:', error);
        throw error;
    }
};

// Refund payment
export const refundRazorpayPayment = async (paymentId: string, amount?: number) => {
    try {
        const instance = getRazorpayInstance();
        const refundOptions: any = {};
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Amount in paise
        }

        const refund = await instance.payments.refund(paymentId, refundOptions);
        return refund;
    } catch (error) {
        console.error('Error refunding Razorpay payment:', error);
        throw error;
    }
};