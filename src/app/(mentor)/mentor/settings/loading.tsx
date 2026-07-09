import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

import { SettingsSkeleton } from "@/components/dashboard/settings/settings-skeleton";

export default function Loading() {
  return (
    <StudentPageContainer>
      <SettingsSkeleton />
    </StudentPageContainer>
  );
}
