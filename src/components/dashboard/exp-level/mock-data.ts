import { expProgress, type ExpProgress } from "@/lib/game-formula";

export type BadgeIconKey =
  | "sparkles"
  | "trophy"
  | "flame"
  | "crown"
  | "award"
  | "star"
  | "rocket"
  | "graduation-cap";

export type BadgeItem = {
  id: string;
  name: string;
  description: string;
  trigger: "LEVEL_REACHED" | "COURSES_COMPLETED" | "COURSE_SPECIFIC";
  threshold: number;
  iconKey: BadgeIconKey;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  earnedAt: Date | null;
};

export type RewardMilestone = {
  targetLevel: 5 | 10 | 15;
  discountPct: 20 | 35 | 50;
  voucherCode: string;
  expiresAt: Date;
};

export type GameProfileMock = {
  level: number;
  exp: number;
  totalExp: number;
  expToNext: ExpProgress;
  badgeTitle: string;
};

function badgeTitleForLevel(level: number): string {
  if (level >= 15) return "Master";
  if (level >= 10) return "Scholar";
  if (level >= 5) return "Explorer";
  return "Beginner";
}

const MOCK_LEVEL = 7;
const MOCK_EXP = 472;

export const MOCK_GAME_PROFILE: GameProfileMock = {
  level: MOCK_LEVEL,
  exp: MOCK_EXP,
  totalExp: 4_780,
  expToNext: expProgress({ level: MOCK_LEVEL, exp: MOCK_EXP }),
  badgeTitle: badgeTitleForLevel(MOCK_LEVEL),
};

export const MOCK_BADGES: BadgeItem[] = [
  {
    id: "explorer",
    name: "Explorer",
    description: "Capai level 5 untuk membuka badge ini.",
    trigger: "LEVEL_REACHED",
    threshold: 5,
    iconKey: "rocket",
    gradientFrom: "from-orange-400",
    gradientTo: "to-rose-500",
    glowColor: "rgba(251,113,133,0.55)",
    earnedAt: new Date("2026-05-18T09:14:00+07:00"),
  },
  {
    id: "course-champion",
    name: "Course Champion",
    description: "Selesaikan 3 kursus berbeda dengan sempurna.",
    trigger: "COURSES_COMPLETED",
    threshold: 3,
    iconKey: "trophy",
    gradientFrom: "from-amber-300",
    gradientTo: "to-amber-600",
    glowColor: "rgba(245,158,11,0.55)",
    earnedAt: new Date("2026-05-12T15:42:00+07:00"),
  },
  {
    id: "streak",
    name: "Streak Belajar",
    description: "Belajar 7 hari berturut-turut tanpa absen.",
    trigger: "COURSES_COMPLETED",
    threshold: 7,
    iconKey: "flame",
    gradientFrom: "from-rose-400",
    gradientTo: "to-fuchsia-600",
    glowColor: "rgba(232,121,249,0.55)",
    earnedAt: new Date("2026-05-02T19:30:00+07:00"),
  },
  {
    id: "beginner",
    name: "Beginner",
    description: "Selamat datang! Kamu mulai perjalanan di level 1.",
    trigger: "LEVEL_REACHED",
    threshold: 1,
    iconKey: "sparkles",
    gradientFrom: "from-sky-400",
    gradientTo: "to-blue-600",
    glowColor: "rgba(59,130,246,0.55)",
    earnedAt: new Date("2026-04-22T08:01:00+07:00"),
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Capai level 10 untuk membuka badge ini.",
    trigger: "LEVEL_REACHED",
    threshold: 10,
    iconKey: "graduation-cap",
    gradientFrom: "from-violet-400",
    gradientTo: "to-indigo-600",
    glowColor: "rgba(99,102,241,0.55)",
    earnedAt: null,
  },
  {
    id: "marathoner",
    name: "Marathoner",
    description: "Selesaikan 10 kursus berbeda.",
    trigger: "COURSES_COMPLETED",
    threshold: 10,
    iconKey: "award",
    gradientFrom: "from-emerald-400",
    gradientTo: "to-teal-600",
    glowColor: "rgba(16,185,129,0.55)",
    earnedAt: null,
  },
  {
    id: "quiz-perfect",
    name: "Quiz Perfectionist",
    description: "Dapatkan nilai 100 di 5 kuis berbeda.",
    trigger: "COURSES_COMPLETED",
    threshold: 5,
    iconKey: "star",
    gradientFrom: "from-fuchsia-400",
    gradientTo: "to-purple-600",
    glowColor: "rgba(217,70,239,0.55)",
    earnedAt: null,
  },
  {
    id: "master",
    name: "Master",
    description: "Capai level 15 — pencapaian tertinggi.",
    trigger: "LEVEL_REACHED",
    threshold: 15,
    iconKey: "crown",
    gradientFrom: "from-amber-400",
    gradientTo: "to-yellow-600",
    glowColor: "rgba(234,179,8,0.55)",
    earnedAt: null,
  },
];

export const MOCK_MILESTONES: RewardMilestone[] = [
  {
    targetLevel: 5,
    discountPct: 20,
    voucherCode: "NLA-LV5-K9eRT3pX",
    expiresAt: new Date("2026-08-31T23:59:59+07:00"),
  },
  {
    targetLevel: 10,
    discountPct: 35,
    voucherCode: "NLA-LV10-Mq2BfH8w",
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
  },
  {
    targetLevel: 15,
    discountPct: 50,
    voucherCode: "NLA-LV15-XyL7Nv4j",
    expiresAt: new Date("2027-06-30T23:59:59+07:00"),
  },
];
