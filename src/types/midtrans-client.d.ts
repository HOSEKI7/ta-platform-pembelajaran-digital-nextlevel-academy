/**
 * Minimal ambient typings for `midtrans-client` (the package ships no types and
 * there is no @types entry). Only the surface we actually use is declared; the
 * Snap parameter is intentionally permissive because Midtrans accepts a large,
 * loosely-specified object. See https://github.com/midtrans/midtrans-nodejs-client
 */
declare module "midtrans-client" {
  export type MidtransConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  };

  /** Snap /transaction response. */
  export type SnapTransactionResult = {
    token: string;
    redirect_url: string;
  };

  /** Raw status payload returned by Midtrans (webhook body / status API). */
  export type MidtransStatusResponse = {
    order_id: string;
    status_code: string;
    gross_amount: string;
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
    signature_key?: string;
    transaction_id?: string;
    transaction_time?: string;
    [key: string]: unknown;
  };

  export class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResult>;
    createTransactionToken(parameter: Record<string, unknown>): Promise<string>;
    createTransactionRedirectUrl(parameter: Record<string, unknown>): Promise<string>;
    readonly transaction: {
      status(orderOrTransactionId: string): Promise<MidtransStatusResponse>;
      notification(notificationJson: unknown): Promise<MidtransStatusResponse>;
    };
  }

  export class CoreApi {
    constructor(config: MidtransConfig);
    charge(parameter: Record<string, unknown>): Promise<Record<string, unknown>>;
    readonly transaction: {
      status(orderOrTransactionId: string): Promise<MidtransStatusResponse>;
      notification(notificationJson: unknown): Promise<MidtransStatusResponse>;
    };
  }

  export class MidtransError extends Error {
    httpStatusCode?: number;
    ApiResponse?: unknown;
    rawHttpClientData?: unknown;
  }

  const Midtrans: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
    MidtransError: typeof MidtransError;
  };
  export default Midtrans;
}
