import { getAdminDb } from "@/lib/firebase/admin";

type ActivityInput = {
  adminUid: string;
  adminEmail?: string | null;
  action: string;
  businessId?: string | null;
  businessName?: string | null;
  summary: string;
  details?: Record<string, unknown>;
};

export async function logAdminActivity(input: ActivityInput) {
  try {
    await getAdminDb().collection("adminActivityLogs").add({
      adminUid: input.adminUid,
      adminEmail: input.adminEmail || "",
      action: input.action,
      businessId: input.businessId || null,
      businessName: input.businessName || null,
      summary: input.summary,
      details: input.details || {},
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Admin activity log failed", error);
  }
}
