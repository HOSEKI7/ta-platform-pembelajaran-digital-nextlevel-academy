"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { MentorAttendanceData } from "@/lib/mentor-types";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useMentorAttendanceQuery } from "@/hooks/use-mentor-attendance";
import { AttendanceDateBar } from "@/components/mentor/attendance/attendance-date-bar";
import { AttendanceSummaryCard } from "@/components/mentor/attendance/attendance-summary-card";
import { AttendanceRoster } from "@/components/mentor/attendance/attendance-roster";
import { minISO, wibTodayISO } from "@/components/mentor/attendance/attendance-format";

type Props = {
  initialData: MentorAttendanceData;
  initialDateISO: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function MentorAttendanceView({ initialData, initialDateISO }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Bounds are constant across dates — derive from the stable SSR payload.
  const todayISO = wibTodayISO(initialData.serverNowISO);
  const maxISO = minISO(todayISO, initialData.period.endISO);

  // The selected date lives in the URL (?date=); fall back to the SSR date and
  // clamp the upper bound so a stale/hand-typed future date never fetches.
  const urlDate = searchParams.get("date");
  const candidate = urlDate && DATE_RE.test(urlDate) ? urlDate : initialDateISO;
  const dateISO = candidate > maxISO ? maxISO : candidate;

  const query = useMentorAttendanceQuery(
    dateISO,
    dateISO === initialDateISO ? initialData : undefined,
  );

  // keepPreviousData guarantees a value once the first page has loaded.
  const data = query.data ?? initialData;

  useEffect(() => {
    if (query.isError) {
      toast.error("Gagal memuat absensi", {
        description:
          query.error instanceof Error
            ? query.error.message
            : "Coba pilih tanggal lain.",
      });
    }
  }, [query.isError, query.error]);

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("date", next);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const { context } = data;
  const classLabel = `${context.batchLabel} · ${context.fieldLabel} · Kelas ${context.section}`;

  return (
    <StudentPageContainer>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Mentor · Absensi"
          title="Absensi"
          accent="Peserta"
          description={`Pantau kehadiran peserta magang di kelas bimbinganmu — ${context.classFullName}.`}
        />
        <AttendanceDateBar
          value={dateISO}
          minISO={data.period.startISO}
          maxISO={maxISO}
          todayISO={todayISO}
          onChange={onChange}
          isFetching={query.isFetching}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full lg:max-w-sm">
          <AttendanceSummaryCard day={data.day} />
        </div>
        <div className="min-w-0 flex-1">
          <AttendanceRoster
            day={data.day}
            classLabel={classLabel}
            isFetching={query.isFetching}
          />
        </div>
      </div>
    </StudentPageContainer>
  );
}
