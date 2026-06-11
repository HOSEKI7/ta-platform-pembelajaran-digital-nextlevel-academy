/**
 * Maps an in-app notification to the page it should open when clicked.
 *
 * Neutral module (no "use client" / "server-only") so both the client bell and
 * any server code can import it. `type` is taken as a plain string because the
 * notification DTO surfaces `NotificationType` as a string; unknown types
 * return `null` (the row stays non-clickable).
 *
 * Each `NotificationType` is created for exactly one recipient role, so a single
 * type→route table is unambiguous across the shared bell. Types whose `refId`
 * has no per-entity detail page (final grades, certificates) resolve to the
 * relevant list page instead.
 */
export function notificationHref(type: string, refId: string | null): string | null {
  switch (type) {
    // Peserta Magang — task detail (refId = Task.id)
    case "TASK_ASSIGNED":
    case "TASK_FEEDBACK":
      return refId ? `/internship/tasks/${refId}` : "/internship/tasks";

    // Peserta Magang — own final grade (refId = own userId, no detail page)
    case "FINAL_GRADE_POSTED":
      return "/internship/final-grade";

    // Mentor — task detail with submissions (refId = Task.id)
    case "TASK_SUBMITTED":
      return refId ? `/mentor/tasks/${refId}` : "/mentor/tasks";

    // Mentor — class grade list (refId = studentId, no per-student route)
    case "FINAL_GRADE_OVERRIDE":
      return "/mentor/grades";

    // Peserta Didik — order/invoice detail (refId = Order.id)
    case "PURCHASE_SUCCESS":
    case "PAYMENT_ACCEPTED":
    case "PAYMENT_REJECTED":
      return refId ? `/transactions/${refId}` : "/transactions";

    // Peserta Didik — certificate list (refId = Certificate.id, no per-cert page)
    case "CERTIFICATE_READY":
      return "/certificates";

    default:
      return null;
  }
}
