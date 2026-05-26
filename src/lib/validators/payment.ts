import { z } from "zod";

/**
 * Shape of a Midtrans payment notification (webhook) body. Only the fields we
 * read are validated; unknown fields pass through. The signature is verified
 * separately (see verifyMidtransSignature in src/lib/midtrans.ts).
 */
export const midtransWebhookSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
  transaction_status: z.string().min(1),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  transaction_id: z.string().optional(),
  transaction_time: z.string().optional(),
});

export type MidtransWebhookBody = z.infer<typeof midtransWebhookSchema>;
