# Todo — Admin Tambah/Edit Kursus + Kurikulum

Plan lengkap: `~/.claude/plans/frontend-design-frontend-design-create-happy-lighthouse.md`

## Phase A — Fondasi backend (skema + env + helper + webhook) ✅
- [x] Skema: enum `VideoStatus` + `Video.status`/`videoUrl` + `duration @default(0)`
- [x] Env: `BUNNY_WEBHOOK_SECRET` ke `.env.example` (+ ingatkan isi `.env.local` & `BUNNY_STREAM_API_KEY`)
- [x] Helper `src/lib/bunny-stream-admin.ts` (createBunnyVideo / signTusUpload / getBunnyVideo / deleteBunnyVideo / cdnPlaybackUrl)
- [x] Extend `src/lib/bunny-storage.ts` (uploadCourseAsset, uploadQuizImage)
- [x] Util `src/lib/slugify.ts`
- [x] Webhook `POST /api/webhooks/bunny`
- [ ] Ingatkan user: `npx prisma generate && npx prisma db push` + `npm i tus-js-client`

## Phase B — API general + loader + form General Info (alur draf)
- [x] Validations `src/lib/validations/admin-course.ts`
- [x] `POST /api/admin/courses` (create draft, multipart) + `PATCH [courseId]`
- [x] Helper `admin-course-write.ts` (parse/upload/isUniqueError) + resolver `resolveCourseImageUrl`
- [x] Loader `admin-course-edit-loader.ts` + types `admin-course-form-types.ts`
- [x] `RichTextEditor`, `ImageUploader`, benefit/FAQ repeater
- [x] Seksi General + Seksi Pengaturan Kursus (Status/Kategori/Instruktur)
- [x] Page `/new` + `/[id]/edit` + hooks `use-admin-course-form`

## Phase C — Kurikulum sprint/step ✅
- [x] API sprints + steps CRUD (sprints/[sprintId], steps/[stepId])
- [x] `curriculum-builder` / `sprint-card` / `step-row` + hook `use-admin-curriculum`

## Phase D — Upload video TUS + status ✅
- [x] `POST /api/admin/videos/create-upload`
- [x] `video-step-dialog` + `video-uploader` + `use-video-upload` (tus-js-client)

## Phase E — Editor quiz ✅
- [x] `POST /api/admin/quiz/images`
- [x] `quiz-step-dialog` + `quiz-question-editor` (soal + gambar + opsi)

## Phase F — Validasi Publish §6.11.3 ✅
- [x] `PATCH /api/admin/courses/[courseId]/status` (publish gate)
- [x] Status di seksi Pengaturan + orkestrasi simpan + error spesifik

## Verifikasi
- [x] tsc + lint bersih (0 error)
- [x] Smoke test browser: create draft → redirect edit (0 err); add sprint + quiz live; field persist; publish gate tolak tanpa thumbnail (400 + tetap Draft)
- [ ] Manual (user): upload video TUS dgn file nyata + webhook Bunny → READY
