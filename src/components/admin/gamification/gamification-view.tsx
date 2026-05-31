"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { BadgeIconOption } from "@/lib/badge-icons";
import type { BadgeCourseOption } from "@/lib/admin-badges-query";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ExpRulesPanel } from "./exp-rules-panel";
import { BadgeManagementView } from "./badge-management-view";

type TabValue = "rules" | "badges";

type Props = {
  courseOptions: BadgeCourseOption[];
  iconPresets: BadgeIconOption[];
};

function parseTab(value: string | null): TabValue {
  return value === "badges" ? "badges" : "rules";
}

export function GamificationView({ courseOptions, iconPresets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseTab(searchParams.get("tab"));

  const setTab = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "badges") sp.set("tab", "badges");
    else sp.delete("tab");
    // Changing tab clears badge-list pagination/search state.
    sp.delete("page");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Manajemen"
        title="Gamifikasi"
        accent="EXP & Badge"
        description="Lihat aturan perolehan EXP & level, lalu kelola badge penghargaan peserta didik."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="rules">Aturan EXP</TabsTrigger>
          <TabsTrigger value="badges">Manajemen Badge</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <ExpRulesPanel />
        </TabsContent>
        <TabsContent value="badges">
          <BadgeManagementView
            courseOptions={courseOptions}
            iconPresets={iconPresets}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
