/**
 * payments.ts — In-app purchase / subscription scaffold.
 *
 * Recommended library: RevenueCat
 *   npx expo install react-native-purchases
 *   (abstracts both App Store and Google Play in one API)
 *
 * Premium features to gate (examples):
 *   - Unlimited saved recipes (free tier: first 10)
 *   - AI-powered recipe generation
 *   - Advanced suggestion filters
 *
 * The User.isPremium flag in userStore is the runtime gate.
 * Always verify premium status server-side for sensitive operations.
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  currencyCode: string;
}

export interface PurchaseResult {
  transactionId: string;
  productId: string;
  purchasedAt: string;
}

export const paymentService = {
  getProducts: async (): Promise<Product[]> => {
    throw new Error('paymentService.getProducts — not implemented yet');
  },

  purchase: async (_productId: string): Promise<PurchaseResult> => {
    throw new Error('paymentService.purchase — not implemented yet');
  },

  /** Required by App Store guidelines */
  restorePurchases: async (): Promise<PurchaseResult[]> => {
    throw new Error('paymentService.restorePurchases — not implemented yet');
  },

  /** Call on app launch to gate premium features */
  checkSubscriptionStatus: async (): Promise<{ isPremium: boolean }> => {
    return { isPremium: false }; // scaffold: always returns false
  },
};
