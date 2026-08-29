**PENGEMBANGAN PLATFORM PEMBELAJARAN DIGITAL BERBASIS WEB DENGAN GAMIFIKASI DAN SISTEM MAGANG TERINTEGRASI: STUDI KASUS NEXTLEVEL ACADEMY**

# Abstrak

_NextLevel Academy adalah lembaga keterampilan digital yang seluruh proses pembelajaran, pengelolaan materi, dan administrasi sertifikat masih dilaksanakan secara manual dan luring, dengan jangkauan program terbatas secara geografis dan tanpa infrastruktur magang yang memadai; penelitian ini bertujuan merancang dan mengimplementasikan platform pembelajaran digital berbasis web yang menggabungkan sistem gamifikasi dan magang daring sebagai penyelesaian ketiga permasalahan sekaligus. Platform dikembangkan dengan metode Waterfall menggunakan Next.js App Router, Supabase PostgreSQL, Prisma ORM, Bunny, dan Midtrans, mencakup manajemen kursus berbasis video, kuis otomatis, progress tracking, Learning Analytics Dashboard, gamifikasi (EXP, leveling, badges), e-sertifikat digital, payment gateway, serta sistem magang daring yang meliputi absensi, distribusi tugas, dan penilaian mentor; pengujian fungsional dilakukan melalui black box testing terhadap 88 skenario uji pada lima kelompok aktor. Platform berhasil diimplementasikan dan dapat diakses secara publik melalui nextlevelacademy.id, dengan seluruh 88 skenario uji mencapai tingkat keberhasilan 100% yang dikonfirmasi oleh kuesioner responden; sistem gamifikasi berlapis terintegrasi ke dalam alur pembelajaran, serta sistem magang daring berfungsi penuh mencakup manajemen hierarki program, absensi, dan evaluasi tugas dengan umpan balik terstruktur, sehingga ketiga tujuan penelitian dinyatakan tercapai._

**Kata kunci:** _Platform Pembelajaran Digital, Learning Management System, Gamifikasi, Sistem Magang Daring, Black Box Testing, Next.js, Waterfall_

**Abstract**

_NextLevel Academy is a digital skills institution that ran all learning activities, course material management, and certificate administration manually and offline, with limited geographic reach and no internship infrastructure; this research designed and implemented a web-based digital learning platform combining a gamification system and online internship management to address all three problems in one system. The platform was developed using the Waterfall method on Next.js App Router, Supabase PostgreSQL, Prisma ORM, Bunny, and Midtrans, covering video-based course management, automated quizzes, progress tracking, a Learning Analytics Dashboard, gamification (EXP, leveling, badges), digital e-certificates, a payment gateway, and an online internship system for attendance, task distribution, and mentor assessment; functional testing used black box testing across 88 test scenarios for five actor groups. The platform was deployed and is publicly accessible at nextlevelacademy.id, with all 88 test scenarios achieving a 100% success rate confirmed by respondent questionnaires; a layered gamification system was integrated into the learning flow, and the online internship system covers program hierarchy management, attendance, and structured task evaluation with feedback, fulfilling all three research objectives._

**Keywords:** _Digital Learning Platform, Learning Management System, Gamification, Online Internship System, Black Box Testing, Next.js, Waterfall_

# KATA PENGANTAR

Puji dan syukur penulis panjatkan kepada Tuhan Yang Maha Esa atas segala berkat, rahmat, dan karunia-Nya sehingga penulis dapat menyelesaikan skripsi ini dengan judul "Pengembangan Platform Pembelajaran Digital Berbasis Web dengan Gamifikasi dan Sistem Magang Terintegrasi Studi Kasus: NextLevel Academy".

Skripsi ini dilatarbelakangi oleh kebutuhan NextLevel Academy sebagai lembaga pendidikan rintisan yang belum memiliki platform pembelajaran digital mandiri, sehingga seluruh kegiatan pembelajaran masih berlangsung secara konvensional dan terbatas jangkauannya. Penelitian ini mengembangkan sebuah platform berbasis web yang mengintegrasikan manajemen kursus digital, gamifikasi, _learning analytics_, serta sistem magang daring, guna mendukung transformasi digital lembaga mitra sekaligus menghadirkan pengalaman belajar yang lebih interaktif, terstruktur, dan inklusif bagi para peserta didiknya.

Dalam proses penyelesaian skripsi ini, penulis telah mendapat bimbingan, bantuan, dan dukungan dari berbagai pihak. Oleh karena itu, pada kesempatan ini penulis menyampaikan terima kasih yang sebesar-besarnya kepada:

1. Bapak Arwin Halim, S.Kom., M.Kom. selaku Dosen Pembimbing I.
2. Bapak Mirza Ilhami, S.Kom., M.TI selaku Dosen Pembimbing II.
3. Bapak Hardy, S.Kom., M.Sc., Ph.D. selaku Rektor Universitas Mikroskil Medan.
4. Bapak Sunaryo Winardi, S.Kom., M.T. selaku Dekan Fakultas Informatika Universitas Mikroskil Medan.
5. Bapak Carles Juliandy, S.Kom., M.Kom. selaku Ketua Program Studi S-1 Teknik Informatika Fakultas Informatika Universitas Mikroskil Medan.
6. Bapak Sunario Megawan, S.Kom., M.Kom. selaku Dosen Wali penulis yang telah memberikan arahan, bimbingan, dan motivasi selama masa perkuliahan.
7. Pihak NextLevel Academy, yang telah memberikan kesempatan, kepercayaan, dan dukungan kepada penulis untuk melaksanakan penelitian, serta telah bersedia menjadi mitra dalam pengembangan platform pembelajaran digital ini.
8. Orang tua dan keluarga penulis yang senantiasa memberikan doa, dukungan moral, dan semangat yang tak ternilai selama penulis menempuh pendidikan hingga terselesaikannya skripsi ini.
9. Bapak dan Ibu dosen serta seluruh staf pengajar Universitas Mikroskil yang telah memberikan ilmu pengetahuan, bimbingan, arahan, pelayanan, serta bantuan kepada penulis selama menempuh pendidikan.
10. Seluruh rekan-rekan mahasiswa Program Studi S-1 Teknik Informatika Universitas Mikroskil Medan, khususnya angkatan 2022, yang telah memberikan semangat, dukungan, dan kebersamaan selama proses penyelesaian skripsi ini.

Penulis menyadari bahwa skripsi ini masih memiliki keterbatasan dan kekurangan, baik dari sisi teknis maupun penulisan. Oleh karena itu, penulis sangat terbuka dan mengharapkan kritik serta saran yang bersifat membangun dari semua pihak demi penyempurnaan penelitian ini di masa mendatang. Penulis berharap skripsi ini dapat memberikan manfaat bagi pembaca, pihak mitra, maupun bagi perkembangan ilmu pengetahuan di bidang teknologi pendidikan dan pengembangan platform pembelajaran digital berbasis web.

Medan, 7 Juli 2026

Penulis,

Farid Zahran

# BAB I

PENDAHULUAN

## 1.1 Latar Belakang

Perkembangan teknologi digital telah mendorong transformasi sistem pendidikan menuju pembelajaran yang lebih efektif, efisien, dan mudah diakses, di mana platform berbasis website berperan penting dalam meningkatkan keterlibatan dan konsistensi belajar peserta didik \[1\]. Mitra studi kasus, NextLevel Academy, adalah lembaga pendidikan rintisan yang berfokus pada pengembangan keterampilan digital pemuda dengan visi menghadirkan pengalaman belajar yang seru, interaktif, dan progresif. Namun seluruh kegiatan pembelajaran saat ini masih dilakukan secara konvensional melalui seminar dan workshop luring, sehingga pengelolaan materi, tugas, dan sertifikat dikerjakan secara manual, jangkauan program terbatas secara geografis, dan pemantauan progres belajar peserta tidak dapat dilakukan. Metode ini juga membebani operasional secara langsung melalui biaya pengadaan properti acara, transportasi, pencetakan dokumen, hingga _prize pool_ yang harus disiapkan pada setiap penyelenggaraan. Pendekatan yang statis tersebut juga belum mampu menghadirkan pengalaman belajar yang seru, interaktif, dan progresif sesuai karakteristik pemuda masa kini, sehingga minat, motivasi, dan konsistensi belajar peserta belum dapat ditumbuhkan secara optimal. Selain itu, salah satu sekolah mitra telah menyampaikan kebutuhan program magang praktis di bidang digital, namun NextLevel Academy belum memiliki infrastruktur yang memadai untuk menyelenggarakannya, sehingga kebutuhan tersebut belum dapat terpenuhi secara efektif dan terstruktur.

Kajian literatur menunjukkan bahwa implementasi _Learning Management System_ (LMS) yang terintegrasi menjadi fondasi utama transformasi digital pendidikan melalui penyatuan fungsi pedagogis dan manajerial dalam satu ekosistem terpusat \[2\], dengan otomatisasi administrasi yang terbukti meningkatkan efektivitas pelayanan hingga skor praktikalitas 86,40% \[3\]. Integrasi _Learning Analytics Dashboard_ (LAD) memungkinkan pemantauan progres belajar secara _real-time_ guna menjaga ritme dan konsistensi belajar peserta \[4\]. Penerapan elemen gamifikasi seperti poin, lencana, dan papan peringkat terbukti secara empiris meningkatkan motivasi intrinsik serta retensi pengetahuan peserta didik \[5\]. Sementara itu, sistem magang berbasis web menjadi solusi fundamental untuk mengatasi keterbatasan infrastruktur fisik melalui ekosistem kerja virtual yang meningkatkan efisiensi operasional dan transparansi pengawasan melalui absensi digital serta pelaporan terstruktur \[6,7\].

Berdasarkan permasalahan yang dihadapi mitra dan landasan teoritis yang telah dipaparkan, penelitian ini mengusulkan pengembangan platform pembelajaran digital berbasis website untuk NextLevel Academy. Platform dikembangkan dengan mengintegrasikan materi berbasis video, sistem gamifikasi (EXP, _leveling_, dan _exclusive_ _badges_), _Learning Analytics Dashboard_, kuis evaluasi otomatis, _progress tracking_, serta _payment gateway_ guna memperluas jangkauan program tanpa batasan geografis. Sebagai respons atas kebutuhan magang mitra, dikembangkan pula fitur magang berbasis web yang memungkinkan peserta melakukan absensi, mengerjakan dan mengumpulkan tugas, serta memperoleh penilaian dan umpan balik dari mentor melalui hak akses yang sesuai.

Implementasi seluruh solusi tersebut diproyeksikan dapat mentransformasi operasional NextLevel Academy secara menyeluruh, mereduksi beban pengelolaan manual, memperluas jangkauan pembelajaran, menghadirkan pengalaman belajar yang interaktif dan progresif sesuai karakteristik pemuda masa kini, serta menyediakan wadah magang yang terstruktur dan dapat diakses secara daring tanpa bergantung pada ketersediaan infrastruktur fisik.

## 1.2 Rumusan Masalah

Berdasarkan uraian latar belakang yang telah dijelaskan, maka rumusan masalah dalam penelitian ini adalah sebagai berikut:

1. Seluruh kegiatan pembelajaran NextLevel Academy masih dilakukan secara konvensional melalui _workshop_ dan seminar, sehingga pengelolaan materi, tugas, dan sertifikat masih dikerjakan secara manual, jangkauan program terbatas secara geografis, serta pemantauan progres belajar peserta tidak dapat dilakukan, kondisi ini menyebabkan beban operasional meningkat dan kontinuitas pembelajaran sulit dijaga.
2. Pendekatan pembelajaran yang diterapkan NextLevel Academy belum mampu menghadirkan pengalaman belajar yang seru, interaktif, dan progresif sesuai karakteristik pemuda masa kini, sehingga minat, motivasi, serta konsistensi belajar peserta belum dapat ditumbuhkan secara optimal.
3. NextLevel Academy belum memiliki infrastruktur yang memadai untuk menyelenggarakan program magang secara konvensional, sehingga kebutuhan sekolah mitra dalam menyediakan wadah magang praktis di bidang digital bagi siswanya belum dapat terpenuhi secara efektif dan terstruktur.

## 1.3 Tujuan

Berdasarkan rumusan masalah yang telah dijelaskan, penelitian ini bertujuan untuk mencapai beberapa sasaran berikut:

1. Merancang dan mengimplementasikan platform pembelajaran digital berbasis web yang mengintegrasikan manajemen kursus berbasis video dan sistem sertifikasi digital, sehingga pengelolaan materi, tugas, dan sertifikat NextLevel Academy dapat dilakukan secara digital dan terpusat, jangkauan program dapat diperluas tanpa batasan geografis, dan progres belajar peserta dapat dipantau secara terstruktur guna mereduksi beban operasional lembaga.
2. Merancang dan mengimplementasikan sistem gamifikasi berupa mekanisme leveling dengan mengumpulkan EXP (_experience points_), dan lencana (_badges_) pada platform NextLevel Academy, sehingga tercipta pengalaman belajar yang interaktif dan progresif guna meningkatkan minat, motivasi, dan konsistensi belajar peserta didik.
3. Merancang dan mengimplementasikan sistem magang daring yang mencakup absensi digital, distribusi dan pengumpulan tugas, serta penilaian oleh mentor pada platform NextLevel Academy, sehingga tersedia wadah magang yang terstruktur dan dapat diakses secara fleksibel bagi sekolah mitra.

## 1.4 Manfaat Penelitian

Penelitian ini diharapkan dapat memberikan manfaat yang terukur dan dapat dirasakan secara langsung. Adapun manfaat yang diharapkan dari penelitian ini adalah sebagai berikut:

1. Bagi NextLevel Academy

Menjadi solusi platform pembelajaran digital berbasis web yang meningkatkan efisiensi pengelolaan pembelajaran, mengurangi beban operasional manual, memperluas akses peserta terhadap pembelajaran tanpa batasan geografis, serta mendukung proses administrasi yang lebih terstruktur dan terpusat. Selain itu, platform ini juga memungkinkan NextLevel Academy untuk menyelenggarakan program magang secara daring tanpa bergantung pada ketersediaan infrastruktur fisik, sehingga dapat membuka peluang kerja sama yang lebih luas dengan sekolah-sekolah mitra.

1. Bagi Pengguna atau Peserta Didik

Memberikan akses pembelajaran yang lebih fleksibel, interaktif, progresif, dan menyenangkan sehingga dapat mendukung peningkatan motivasi, konsistensi, dan keterlibatan dalam proses belajar. Selain itu, peserta juga memperoleh rekognisi digital atas pencapaian kompetensi yang dapat digunakan sebagai bukti hasil belajar yang terstruktur.

1. Bagi Peserta Magang

Memberikan wadah magang daring yang terstruktur dan dapat diakses secara fleksibel, sehingga siswa dari sekolah mitra dapat memperoleh pengalaman praktis di bidang digital tanpa terkendala keterbatasan lokasi. Peserta magang juga mendapatkan umpan balik dan penilaian dari mentor secara sistematis melalui platform, yang mendukung perkembangan kompetensi secara terarah dan terukur.

1. Bagi Dunia Pendidikan dan Penelitian

Menjadi referensi dalam pengembangan platform pembelajaran digital berbasis web, khususnya yang mengintegrasikan elemen gamifikasi, pemantauan progres belajar, sistem administrasi pembelajaran terpusat, serta sistem magang berbasis web sebagai bagian dari ekosistem pendidikan digital yang komprehensif.

1. Bagi Penulis

Menambah pengalaman serta pemahaman dalam merancang dan mengimplementasikan sistem berbasis web yang komprehensif, khususnya pada bidang teknologi pendidikan, pengembangan platform pembelajaran digital, serta pengelolaan sistem magang secara daring yang terintegrasi dalam satu ekosistem platform.

## 1.5 Ruang Lingkup

Untuk menjaga fokus penelitian, ruang lingkup ditetapkan sebagai berikut:

1. Platform

Berbasis _web-responsive_ (tidak mencakup aplikasi _mobile_ _native_).

1. **Aktor Sistem**

**Sistem ini melibatkan empat aktor utama, yaitu Administrator sebagai pengelola utama platform, Peserta Didik sebagai pengguna yang mengikuti kursus secara mandiri, Peserta Magang sebagai pengguna yang mengikuti program magang daring, serta Mentor sebagai pembimbing yang memantau, mengevaluasi, dan memberikan penilaian terhadap peserta magang. Masing-masing aktor memiliki peran dan hak akses yang berbeda sesuai dengan fungsi dan kebutuhan penggunaannya dalam sistem.**

Fitur Berdasarkan Aktor

1. Administrator
   a. Mengelola data kursus, termasuk konfigurasi kurikulum materi berisi video dan kuis
   b. Mengelola Kategori Kursus
   c. Mengelola data pengguna, termasuk pembuatan akun berupa penetapan peran (_role_) sistem, serta pengisian informasi yang diperlukan sesuai dengan peran pengguna
   d. Mengelola penerbitan e-sertifikat digital
   e. Memantau dan mengelola transaksi pembayaran kursus melalui integrasi _payment gateway_
   f. Mengelola _voucher_ diskon untuk pembelian kursus
   g. Mengelola konfigurasi sistem gamifikasi yaitu pembuatan _exclusive_ _badges_
   h. Memantau dan mengelola absensi peserta magang dan mentor
   i. Memantau dan mengelola tugas magang
   j. Memantau dan mengelola nilai akhir peserta magang
   k. Mengelola konfigurasi magang (batch, bidang, dan kelas)
   l. Mengelola jam kerja dan tanggal libur untuk magang
   m. Mengelola akun administrator lewat metode tautan undangan yang aman
2. Peserta Didik
   a. Mendaftar akun, melihat katalog serta detail kursus yang tersedia
   b. Melakukan pembelian kursus untuk mendapatkan akses materi belajar
   c. Mengakses dan menonton materi pembelajaran berbasis video
   d. Mengerjakan kuis evaluasi dan melihat hasil penilaian secara otomatis
   e. Mengunduh e-sertifikat digital setelah menyelesaikan seluruh rangkaian kursus
   f. Memantau dan mendapatkan _Experience Points_ (EXP) untuk naik _level_ dan mendapatkan hadiah, serta mengumpulkan _exclusive badges_ sebagai bentuk rekognisi atas pencapaian belajar
3. Peserta Magang
   a. Melakukan absensi harian secara digital yang tercatat dan tersimpan secara sistematis dalam sistem
   b. Melihat dan mengumpulkan hasil pengerjaan tugas atau proyek dalam bentuk tautan atau berkas untuk kemudian ditinjau oleh mentor
   c. Mendapatkan nilai akhir magang dari mentor
4. Mentor
   a. Melakukan absensi harian secara digital yang tercatat dan tersimpan secara sistematis dalam sistem
   b. Melihat daftar peserta magang yang berada di bawah bimbingannya
   c. Memantau dan memeriksa rekap absensi harian seluruh peserta magang
   d. Mengelola dan mendistribusikan tugas atau proyek kepada peserta magang beserta penetapan tenggat waktu penyelesaiannya
   e. Meninjau hasil pengumpulan tugas peserta magang, dapat mengembalikan tugas disertai _feedback_
   f. Memberikan nilai akhir kepada peserta magang
   g. Pengujian: Pengujian yang dilakukan berfokus pada pengujian fungsionalitas sistem menggunakan metode _black-box testing_ untuk memastikan seluruh fitur berjalan sesuai kebutuhan mitra.
   h. Batasan Penelitian: Penelitian ini tidak mencakup analisis komersialisasi penuh, perumusan model bisnis, atau pengukuran dampak pedagogis jangka panjang dari platform yang dikembangkan. Selain itu, penelitian ini juga tidak mencakup pengembangan fitur penilaian kinerja magang secara kuantitatif yang bersifat analitik mendalam di luar fungsi pemberian nilai dan penerbitan sertifikat yang telah ditetapkan.

# BAB II

KAJIAN LITERATUR

1.
2.

## 2.1 Konsep Platform Pembelajaran Digital

Pendidikan terus mengalami perkembangan seiring dengan kemajuan teknologi digital yang membawa perubahan signifikan dalam metode pembelajaran dan pengajaran. Transformasi ini tidak hanya memperluas akses terhadap pendidikan, tetapi juga menciptakan pengalaman belajar yang lebih fleksibel, personal, dan interaktif bagi peserta didik. Pemanfaatan teknologi digital mencakup penggunaan internet serta berbagai aplikasi pembelajaran yang terintegrasi dalam sistem _Learning Management System_ (LMS), sehingga memungkinkan peserta didik untuk belajar secara mandiri sesuai dengan kebutuhan dan kecepatan masing-masing. Di era Revolusi Industri 4.0, teknologi dimanfaatkan untuk mendukung proses pembelajaran yang lebih adaptif terhadap tuntutan kompetensi abad ke-21 \[8\].

Transformasi digital juga menjadi isu penting dalam modernisasi sistem pendidikan. Perkembangan teknologi informasi dan komunikasi (TIK) tidak hanya berperan sebagai alat bantu pembelajaran, tetapi telah mengubah secara fundamental cara pendidik mengajar dan cara peserta didik belajar. Hal ini menunjukkan adanya pergeseran paradigma dari pendekatan pembelajaran konvensional menuju pendekatan yang lebih dinamis, fleksibel, serta berorientasi pada kebutuhan peserta didik. Dengan demikian, teknologi berperan sebagai katalisator dalam mewujudkan sistem pendidikan yang lebih efektif, berbasis kompetensi, dan relevan dengan perkembangan zaman \[9\].

## 2.1.1 Pembelajaran Digital

Perkembangan teknologi digital pada abad ke-21 telah membawa perubahan dalam proses pembelajaran di bidang pendidikan. Lingkungan belajar yang sebelumnya terbatas pada ruang kelas fisik kini berkembang ke ruang digital yang memungkinkan pembelajaran berlangsung tanpa batasan ruang dan waktu. Pembelajaran merupakan proses penting dalam meningkatkan pengetahuan dan kemampuan peserta didik, di mana pemanfaatan teknologi berperan dalam mendukung efektivitas pembelajaran di era digital \[10\].

Pembelajaran digital merujuk pada proses pendidikan yang memanfaatkan teknologi digital, seperti komputer, internet, dan perangkat lunak, untuk mendukung serta memodifikasi pengalaman belajar \[11\]. Bentuk pembelajaran ini sering dikenal sebagai _e-learning_, yaitu sistem pembelajaran berbasis jaringan yang memungkinkan peserta didik mengakses materi pembelajaran secara fleksibel. Materi pembelajaran digital dapat disajikan dalam berbagai format, seperti teks, visual, audio, dan multimedia interaktif, sehingga mendukung variasi gaya belajar peserta didik \[12\].

Pemanfaatan pembelajaran digital memiliki beberapa potensi utama, yaitu sebagai sarana komunikasi, akses informasi, serta media pendidikan dan pembelajaran. Pemahaman terhadap konsep pembelajaran digital menjadi dasar penting dalam mengoptimalkan pemanfaatan teknologi untuk meningkatkan mutu pendidikan dan menyesuaikan sistem pembelajaran dengan kondisi masyarakat modern.

## 2.1.2 Platform Pembelajaran Digital

Transformasi pendidikan pada era digital mendorong pendidik untuk memanfaatkan platform pembelajaran digital sebagai bagian dari perencanaan, pelaksanaan, dan evaluasi pembelajaran. Platform pembelajaran digital berperan sebagai sarana pendukung yang mengintegrasikan teknologi dalam proses belajar mengajar, sehingga kegiatan pembelajaran dapat berlangsung secara lebih terstruktur dan terdokumentasi dengan baik \[13\].

Platform pembelajaran digital memiliki keunggulan dalam mengatasi keterbatasan geografis dan waktu, sehingga peserta didik dapat mengakses pembelajaran tanpa harus hadir secara fisik di ruang kelas. Selain itu, platform digital menyediakan fitur analitik yang memungkinkan pendidik memantau kemajuan belajar peserta didik secara _real-time_ dan memberikan umpan balik yang tepat waktu. Dengan adanya fitur tersebut, pendidik dapat menyesuaikan metode pembelajaran agar lebih efektif dan sesuai dengan kebutuhan peserta didik \[14\].

Peningkatan pemanfaatan platform pembelajaran _online_ dipengaruhi oleh beberapa faktor, antara lain kemudahan akses yang memungkinkan pembelajar mengakses materi kapan saja dan di mana saja selama tersedia koneksi internet. Faktor fleksibilitas juga menjadi alasan utama, karena platform pembelajaran digital memberikan kebebasan bagi pembelajar dalam memilih materi, metode, serta tempo belajar sesuai dengan kemampuan masing-masing. Selain itu, platform pembelajaran digital mampu menyajikan pengalaman belajar yang berbeda melalui penyampaian materi secara interaktif dan dukungan fitur kolaborasi yang mendorong partisipasi aktif pembelajar \[15\].

Platform pembelajaran digital berperan dalam mendukung peningkatan mutu pembelajaran. Platform digital digunakan untuk menunjang efektivitas proses pembelajaran, tingkat literasi digital pendidik dan peserta didik, serta mengidentifikasi kendala yang muncul dalam proses implementasinya. Pemahaman terhadap aspek-aspek tersebut memberikan gambaran mengenai peran platform pembelajaran digital berbasis web dalam mendukung proses pembelajaran yang lebih terstruktur serta menjadi dasar dalam upaya optimalisasi pemanfaatannya \[14\].

## 2.1.3 _Learning Management System_ (LMS)

Perkembangan teknologi informasi dan komunikasi telah mendorong perubahan dalam proses pembelajaran, khususnya melalui pemanfaatan media digital berbasis web. Transformasi ini sejalan dengan upaya digitalisasi pendidikan yang mengarah pada penggunaan platform pembelajaran digital sebagai sarana utama dalam mendukung proses belajar mengajar. Salah satu bentuk implementasinya adalah penggunaan _Learning Management System_ (LMS) dalam pembelajaran daring (_online learning_) \[16\].

LMS merupakan platform berbasis web yang dirancang untuk mengelola, menyampaikan, dan memantau kegiatan pembelajaran secara terintegrasi. Melalui LMS, pendidik dapat mengorganisasi materi, memberikan tugas, serta melakukan evaluasi pembelajaran secara sistematis. Di sisi lain, peserta didik dapat mengakses materi pembelajaran, mengikuti aktivitas belajar, serta memantau perkembangan belajarnya secara mandiri. Meskipun demikian, keberhasilan penggunaan LMS tidak hanya bergantung pada aspek teknis, tetapi juga pada kemampuannya dalam menciptakan pengalaman belajar yang mendorong keterlibatan aktif dan kemandirian pengguna. Oleh karena itu, platform pembelajaran digital perlu dirancang dengan memperhatikan kebutuhan pengguna agar mampu mendukung proses belajar yang efektif \[17\].

Pemanfaatan LMS dalam pembelajaran digital berbasis web memberikan berbagai manfaat, seperti fleksibilitas akses, kemudahan dalam pengelolaan pembelajaran, serta dukungan terhadap proses evaluasi yang lebih terstruktur. Selain itu, sistem ini memungkinkan penyampaian materi secara lebih variatif dan interaktif, sehingga dapat meningkatkan keterlibatan peserta didik. Dari sisi pengelolaan, LMS juga membantu efisiensi administrasi melalui fitur otomatisasi. Dengan demikian, penerapan LMS dalam platform pembelajaran digital berbasis web menjadi solusi yang relevan dalam mendukung proses pembelajaran yang lebih efektif, terstruktur, dan sesuai dengan perkembangan teknologi \[18\].

## 2.2 _Video-Based Learning_

_Video-Based Learning_ (VBL) hadir sebagai inovasi transformatif dalam ekosistem pendidikan digital yang memanfaatkan teknologi audiovisual sebagai instrumen utama untuk memperkaya pengalaman instruksional. Berbeda dengan pendekatan konvensional yang cenderung terpaku pada literatur tekstual atau ceramah satu arah, VBL mengoptimalkan stimulasi visual dan auditori untuk mendistribusikan informasi secara lebih dinamis \[19\]. Melalui integrasi video, pendidik mampu mengeksplorasi potensi ruang digital secara luas sekaligus mereduksi berbagai hambatan praktis yang sering ditemui pada pembelajaran tatap muka. Sebagai media pendidikan, VBL memfasilitasi transmisi konsep, pengetahuan, dan keterampilan teknis secara efektif melalui lingkungan belajar virtual yang terstruktur \[19\].

Dalam konteks implementasinya, platform pembelajaran digital seperti NextLevel Academy dapat memanfaatkan VBL untuk menyederhanakan pemahaman atas konsep-konsep yang bersifat kompleks. Keunggulan utama dari metode ini terletak pada kapasitasnya dalam meningkatkan keterlibatan pengguna serta menyediakan materi suplemen yang memperdalam wawasan siswa. Fleksibilitas VBL memungkinkan metode ini diterapkan pada berbagai spektrum pendidikan, mulai dari lingkungan sekolah formal, kursus berbasis daring, hingga program pengembangan profesional di tingkat perusahaan \[19\]. Dengan demikian, video bukan sekadar media penyimpanan informasi, melainkan alat strategis dalam menciptakan suasana belajar yang interaktif.

Penerapan pembelajaran berbasis video terbukti memberikan dampak signifikan terhadap peningkatan hasil belajar, khususnya pada ranah kognitif yang mencakup kemampuan intelektual dalam menganalisis dan memecahkan masalah \[20\]. Media ini membantu siswa retensi materi lebih lama karena kombinasi visualisasi dan narasi suara yang menarik mampu mencegah kejenuhan selama proses studi. Selain itu, VBL tetap dapat mendukung interaksi sosial melalui model kerja kelompok dan diskusi terbimbing, di mana siswa dapat bertukar pikiran untuk menghasilkan luaran pembelajaran yang lebih berkualitas \[20\]. Dengan memanfaatkan platform digital, siswa didorong untuk menjadi lebih proaktif dalam mengeksplorasi sumber informasi di luar buku teks, sehingga pengalaman dan kompetensi yang dihimpun menjadi lebih komprehensif \[20\].

## 2.3 _Self-Regulated Learning_

_Self-regulated learning_ (SRL) merupakan kemampuan individu untuk mengelola pengalaman belajarnya secara efektif melalui proses proaktif yang memanfaatkan kapasitas akademik untuk mencapai hasil yang optimal. Dalam praktiknya, SRL melibatkan serangkaian tindakan strategis seperti penetapan tujuan pembelajaran, pemilihan serta penyusunan strategi yang tepat, hingga pemantauan terhadap efektivitas diri secara mandiri \[21\]. Pendekatan ini memegang peranan krusial dalam aktivitas pendidikan, terutama dalam mendorong siswa untuk mengeksplorasi pengetahuan baru dan menentukan sumber literatur yang relevan secara mandiri \[21\]. Dengan demikian, SRL memfokuskan pada bagaimana setiap peserta didik mampu memodifikasi dan mengorganisasi praktik belajar mereka guna mengubah potensi mental menjadi prestasi akademik yang nyata \[22\].

Sebagai sebuah strategi belajar yang komprehensif, SRL beroperasi melalui siklus berulang yang mencakup perencanaan tugas, pengawasan kinerja secara berkala, hingga refleksi mendalam terhadap hasil yang telah dicapai \[22\]. Proses reflektif ini memungkinkan siswa untuk melakukan penyesuaian pada metode belajar mereka saat menghadapi tugas berikutnya, sehingga menciptakan pola pengembangan diri yang berkelanjutan. Implementasi pengaturan diri ini sangat penting dalam mendukung visi pendidikan jangka panjang, yaitu membentuk keterampilan belajar sepanjang hayat dan meningkatkan kemandirian siswa secara signifikan \[22\]. Hal ini sejalan dengan pengembangan platform NextLevel Academy yang menuntut partisipasi aktif pengguna dalam mengarahkan ritme belajar mereka sendiri.

Dalam platform NextLevel Academy, prinsip SRL diwujudkan melalui fitur _progress tracking_ dan _sequential learning_ yang memungkinkan peserta didik mengelola ritme belajarnya secara mandiri.

## 2.4 _Learning Analytics_

_Learning Analytics_ secara umum didefinisikan sebagai upaya sistematis dalam pengukuran, pengumpulan, analisis, dan pelaporan data terkait peserta didik untuk mengoptimalkan proses serta lingkungan pembelajaran. Analisis ini berfokus pada aktivitas siswa, konteks yang melingkupinya, hingga hasil yang dicapai, yang mencakup data pendaftaran, interaksi dalam sistem, penilaian, serta hasil belajar akhir \[23\]. Dengan memanfaatkan jejak digital yang dihasilkan dalam platform _Learning Management System_ (LMS), analitik pembelajaran memungkinkan pendidik dan institusi untuk memperoleh pemahaman mendalam tentang perilaku peserta didik serta pola interaksi yang terjadi selama proses instruksional berlangsung \[24\]. Melalui kajian terhadap informasi pendidikan ini, pengelola dapat mengidentifikasi siswa yang berprestasi baik maupun mereka yang memerlukan dukungan tambahan guna meningkatkan pengalaman belajar secara keseluruhan \[25\].

Dalam tataran teknis, LA memanfaatkan berbagai metodologi seperti statistik, penambangan data, pembelajaran mesin, dan visualisasi data untuk melacak pola kesuksesan atau kesulitan siswa secara daring \[23\]. Tren penelitian saat ini menunjukkan peningkatan fokus pada pemodelan prediktif, peramalan prestasi akademik, serta analisis keterlibatan dan retensi mahasiswa untuk mendukung pengambilan keputusan berbasis bukti di pendidikan tinggi \[24\]. Tujuan utama dari analisis ini adalah menyediakan mekanisme bagi guru untuk memantau keterlibatan siswa secara _real-time_, melacak tren kinerja, dan mendeteksi tanda peringatan dini terkait performa akademik yang kurang memuaskan \[25\].

Penerapan _Learning Analytics_ dalam platform digital seperti NextLevel Academy memfasilitasi intervensi tepat waktu, seperti pemberian bimbingan tambahan atau penyusunan rencana pembelajaran adaptif yang disesuaikan dengan kebutuhan individu \[25\]. Proses ini bersifat iteratif, di mana seiring bertambahnya volume data yang dikumpulkan, model analisis dapat terus disempurnakan untuk menghasilkan prediksi dan wawasan yang lebih akurat \[23\]. Dengan mengintegrasikan teknik analisis data, sistem ini tidak hanya mengidentifikasi pola kinerja tetapi juga berkontribusi pada perbaikan berkelanjutan dalam ekosistem pembelajaran digital \[25\].

Pada platform ini, _Learning Analytics_ diimplementasikan melalui _Learning Analytics Dashboard_ (LAD) yang memungkinkan Administrator memantau progres dan aktivitas belajar seluruh peserta secara _real-time_.

## 2.5 Gamifikasi

Gamifikasi merupakan konsep yang mengadopsi elemen-elemen permainan, seperti poin, lencana, papan peringkat, serta berbagai bentuk tantangan, ke dalam konteks pembelajaran. Pendekatan ini bertujuan untuk mendukung proses belajar dengan cara yang lebih menarik serta membantu meningkatkan pemahaman dan kebiasaan belajar peserta didik. Dalam implementasinya, gamifikasi menghadirkan aktivitas belajar dalam bentuk misi atau tantangan yang dapat divisualisasikan melalui media digital, sehingga menciptakan pengalaman belajar yang lebih interaktif dan sesuai dengan kebutuhan pembelajaran modern \[26\].

Dalam konteks pendidikan digital, penerapan gamifikasi terbukti mampu menciptakan lingkungan belajar yang lebih menarik dan interaktif. Penggunaan elemen permainan mendorong peserta didik untuk lebih aktif berpartisipasi dalam proses pembelajaran, sehingga dapat meningkatkan motivasi belajar. Oleh karena itu, integrasi gamifikasi dalam platform pembelajaran digital tidak hanya berfungsi sebagai pelengkap, tetapi juga sebagai strategi untuk meningkatkan kualitas pembelajaran yang lebih adaptif terhadap perkembangan teknologi dan kebutuhan peserta didik \[27\].

Berdasarkan hal tersebut, penerapan gamifikasi dalam pembelajaran menjadi salah satu pendekatan yang efektif untuk meningkatkan minat dan keterlibatan peserta didik. Gamifikasi mampu menjembatani kebutuhan belajar dengan perkembangan teknologi yang terus berkembang, sehingga proses pembelajaran menjadi lebih relevan, menarik, dan mendukung tercapainya tujuan pembelajaran secara lebih optimal \[26\].

## 2.6 Website

Website merupakan kumpulan halaman web yang saling terhubung dalam satu domain dan berfungsi untuk menyajikan informasi dalam bentuk teks, gambar, maupun suara. Setiap tautan yang menghubungkan satu halaman web dengan halaman web lainnya biasanya disebut dengan _hyperlink_. Sementara itu, teks yang mengandung _hyperlink_ sehingga memungkinkan pengguna untuk berpindah ke halaman atau dokumen lain secara langsung disebut _hypertext_. Website dipublikasikan pada jaringan internet dan memiliki alamat unik berupa _Uniform Resource Locator_ (URL) yang dapat diakses oleh pengguna melalui _web browser_ \[28\].

Keberadaan website didukung oleh teknologi _World Wide Web_ (WWW) sebagai salah satu layanan utama pada internet yang memungkinkan penyediaan dan pertukaran informasi secara global \[29\]. Halaman website umumnya disusun menggunakan _Hyper Text Markup Language_ (HTML) dan diakses melalui protokol HTTP atau HTTPS, yang berfungsi untuk mengirimkan data dari _server_ agar dapat ditampilkan kepada pengguna secara terstruktur dan aman melalui web browser \[28\].

Aplikasi berbasis website memiliki keunggulan berupa kemudahan akses, fleksibilitas penggunaan pada berbagai perangkat, serta tidak memerlukan instalasi tambahan pada sisi pengguna. Sistem informasi berbasis web mampu mengelola data secara terstruktur, cepat, dan efisien, serta mendukung tampilan antarmuka yang adaptif \[30\].

Pemanfaatan aplikasi berbasis website dalam pendidikan berperan dalam meningkatkan efisiensi pengelolaan pembelajaran, memperluas akses belajar, serta mendukung transformasi sistem pembelajaran menuju digitalisasi. Oleh karena itu, pemanfaatan aplikasi berbasis website menjadi solusi yang relevan dalam pengembangan platform pembelajaran digital berbasis web seperti yang diterapkan pada NextLevel Academy.

## 2.7 Sistem Magang

Magang merupakan program pelatihan strategis yang memberikan pengalaman kerja nyata bagi mahasiswa maupun lulusan baru sebagai jembatan sebelum memasuki dunia profesional. Program ini memfasilitasi peserta untuk mengimplementasikan keterampilan akademik dalam lingkungan kerja nyata, sekaligus memahami budaya perusahaan serta mengasah kemampuan teknis dan interpersonal \[31\]. Secara konseptual, magang atau praktik kerja lapangan adalah bentuk implementasi sistematis yang menyinkronkan program pendidikan di sekolah atau kampus dengan penguasaan keahlian yang diperoleh melalui kegiatan kerja langsung di industri \[32\]. Melalui pendampingan dan pengawasan dari pihak berwenang, mahasiswa berkesempatan menerapkan pengetahuan teoritis yang telah diperoleh selama perkuliahan ke dalam praktik kerja yang nyata di sebuah instansi \[33\].

Selain sebagai sarana penguatan keterampilan praktis, kegiatan magang memberikan manfaat luas dalam meningkatkan relasi di lingkungan profesional, memupuk kepercayaan diri, serta melatih kemampuan kolaborasi dalam tim \[32\]. Keterlibatan langsung dalam dinamika organisasi ini berperan penting dalam meningkatkan kesiapan kerja, di mana pengalaman tersebut membantu mahasiswa membangun jaringan profesional dan mengembangkan sikap profesionalisme sejak dini \[33\]. Dengan semakin banyaknya lulusan sarjana, program magang menjadi instrumen krusial bagi perusahaan untuk merekrut tenaga kerja terdidik baru, sekaligus meningkatkan daya saing individu dalam menghadapi berbagai tantangan kompleks di dunia kerja setelah menyelesaikan pendidikan tinggi \[32\]\[31\].

## 2.7.1 _Virtual Internship_ (Magang Daring)

Sistem magang daring didefinisikan sebagai platform teknologi informasi berbasis web yang dirancang untuk memfasilitasi program magang tanpa terkendala batasan geografis \[34\]. Model ini mengintegrasikan seluruh proses bisnis magang, mulai dari registrasi hingga pelaporan akhir dalam satu sistem yang utuh \[32\]. Implementasi sistem informasi ini menjadi solusi fundamental untuk mengatasi keterbatasan infrastruktur fisik melalui penyediaan ekosistem kerja virtual \[35\]. Transformasi digital tersebut secara signifikan meningkatkan efisiensi waktu dan biaya operasional bagi institusi maupun peserta \[34\]. Selain itu, sistem ini mendukung keberlangsungan proses belajar profesional yang tetap terjaga meskipun tidak terjadi interaksi tatap muka secara konvensional \[36\].

Secara fungsional, sistem ini menyediakan fitur _log_ harian elektronik yang memungkinkan peserta mencatat aktivitas harian secara mandiri \[34\]. Dokumentasi kegiatan yang tersimpan secara digital dalam basis data pusat bertujuan untuk menjamin keamanan serta integritas data administrasi \[32\]. Pihak pembimbing dapat memantau kehadiran dan progres tugas peserta secara _real-time_ melalui _dashboard_ pemantauan yang tersedia \[35\]. Otomatisasi rekapitulasi data dalam sistem ini membantu mempercepat proses seleksi dan evaluasi kinerja peserta secara objektif \[36\]. Penggunaan hak akses yang berbeda bagi admin, pembimbing, dan peserta memastikan keamanan sistem dalam mengelola informasi sensitif \[32\].

## 2.7.2 _Monitoring_ dan Penilaian Kinerja Peserta Magang

_Monitoring_ dan penilaian kinerja peserta magang merupakan aspek krusial dalam pengelolaan program magang yang efektif, namun sering kali masih dilaksanakan secara manual sehingga menimbulkan berbagai kendala seperti keterlambatan pencatatan data, potensi duplikasi informasi, serta kurangnya transparansi antara peserta magang dan pembimbing. Untuk mengatasi permasalahan tersebut, pengembangan sistem informasi monitoring magang berbasis web menjadi solusi yang relevan, di mana peserta magang dapat mengisi laporan kegiatan harian serta mengunggah laporan akhir secara digital, sementara pembimbing (_Person in Charge_) dapat memantau seluruh aktivitas peserta, memberikan penilaian, dan melakukan verifikasi sertifikat melalui satu platform yang terintegrasi. Pendekatan ini terbukti lebih efisien, transparan, dan mudah digunakan dibandingkan sistem manual yang memiliki banyak keterbatasan operasional \[37\].

Proses evaluasi kinerja peserta magang yang objektif dan terukur juga menjadi kebutuhan mendasar untuk memastikan setiap peserta memperoleh penilaian yang adil berdasarkan capaian kompetensinya. Tanpa mekanisme penilaian yang terstruktur, evaluasi yang dilakukan oleh pembimbing lapangan cenderung bersifat subjektif dan tidak konsisten antarsatu periode dengan periode lainnya. Oleh karena itu, implementasi sistem penilaian berbasis web yang mengintegrasikan kriteria evaluasi multidimensi terbukti mampu menghasilkan nilai agregat yang mencerminkan kinerja peserta secara objektif dan konsisten. Sistem semacam ini juga menyediakan fitur visualisasi hasil penilaian dan pelaporan otomatis yang mempermudah proses pengambilan keputusan oleh pembimbing maupun pengelola program \[38\].

## 2.8 Teknologi Pengembangan Aplikasi Web

## 2.8.1 Next.Js sebagai _Full-Stack Framework_

_Framework_ merupakan kerangka kerja perangkat lunak yang menyediakan struktur, komponen, dan konvensi yang dapat digunakan kembali dalam proses pengembangan aplikasi. Penggunaan _framework_ bertujuan untuk meningkatkan efisiensi pengembangan dengan menyediakan fungsi dan pola yang telah terorganisasi, sehingga pengembang tidak perlu membangun sistem dari awal \[39\].

Next.js merupakan _framework_ berbasis React yang dikembangkan oleh Vercel dan dirancang untuk mendukung pengembangan aplikasi _web modern_ secara _full-stack_, yakni mengintegrasikan lapisan _frontend_ dan _backend_ dalam satu _codebase_ yang kohesif \[39,40\]. Dengan pendekatan ini, pengembang tidak memerlukan dua _framework_ terpisah untuk membangun sebuah aplikasi web yang lengkap \[40\]. Dalam sisi _frontend_, Next.js memanfaatkan arsitektur berbasis komponen React untuk membangun antarmuka pengguna yang responsif dan interaktif. Sementara itu, pada sisi _backend_, Next.js menyediakan fitur _Route Handlers (API Routes)_ yang memungkinkan pembuatan _endpoint_ REST API secara langsung di dalam proyek, sehingga menggantikan kebutuhan akan _framework_ server terpisah.

Salah satu keunggulan utama Next.js adalah dukungan terhadap berbagai strategi rendering, meliputi _Server-Side Rendering_ (SSR), _Static Site Generation_ (SSG), dan _Incremental Static Regeneration_ (ISR). Pendekatan SSR terbukti menghasilkan waktu muat awal yang lebih optimal serta pengalaman pengguna yang lebih baik, khususnya pada aplikasi yang membutuhkan data dinamis seperti platform pembelajaran daring \[41\]. Selain itu, Next.js menerapkan sistem routing berbasis struktur _file_ (_file-based routing_) yang menyederhanakan proses pengelolaan halaman tanpa konfigurasi tambahan.

Dalam pengembangan antarmuka, Next.js dikombinasikan dengan Tailwind CSS yang mendukung perancangan tampilan melalui pendekatan berbasis utilitas (_utility-first_), sehingga mempercepat proses pembuatan antarmuka yang responsif dan konsisten \[39\]. Pemilihan Next.js sebagai _framework_ _full-stack_ dalam penelitian ini didasarkan pada kemampuannya untuk menyatukan pengembangan _frontend_ dan _backend_ dalam satu ekosistem yang terintegrasi, sehingga sesuai dengan kebutuhan pengembangan platform pembelajaran digital NextLevel Academy yang memerlukan pengelolaan antarmuka, logika aplikasi, dan komunikasi data secara terpadu.

## 2.8.2 _Object Relational Mapping_ (ORM)

_Object Relational Mapping_ (ORM) merupakan teknik yang digunakan untuk memetakan struktur basis data relasional ke dalam bentuk objek pada kode program. Penerapan ORM bertujuan untuk mempermudah pengelolaan data dengan merepresentasikan setiap tabel sebagai model, termasuk pendefinisian relasi antar tabel. Melalui pendekatan ini, pengembang dapat mengelola hubungan data, seperti relasi _one-to-many_, secara terstruktur tanpa harus menulis kueri SQL secara langsung. Penggunaan ORM membantu mengurangi kompleksitas pengelolaan basis data, menurunkan potensi kesalahan pada kode, serta meningkatkan aspek keamanan dengan meminimalkan risiko serangan injeksi SQL melalui penggunaan objek sebagai perantara akses data \[42\].

Prisma merupakan ORM modern yang dirancang khusus untuk lingkungan Node.js dan mendukung pengembangan aplikasi berbasis TypeScript. Prisma menyediakan mekanisme pemodelan data yang jelas serta memudahkan proses migrasi skema basis data \[43\]. Dalam implementasinya, Prisma memungkinkan pengembang untuk mengakses dan memanipulasi data melalui objek yang telah dipetakan dari model basis data, sehingga pengelolaan data menjadi lebih konsisten dan terkontrol. Integrasi Prisma dengan arsitektur _RESTful API_ mendukung pengelolaan data yang aman dan terstruktur, karena setiap operasi data dilakukan melalui model yang telah didefinisikan sebelumnya \[42\].

Selain itu, Prisma ORM menawarkan fitur keamanan tipe dan _query builder_ intuitif untuk mendukung efisiensi proses pengembangan aplikasi. Tingkat abstraksi yang disediakan ORM juga memungkinkan fleksibilitas dalam pengelolaan infrastruktur basis data serta memudahkan adaptasi terhadap perubahan sistem. Beberapa kajian menunjukkan bahwa penggunaan ORM dapat meningkatkan produktivitas pengembang dan mempercepat proses pengembangan aplikasi, terutama pada proyek yang mengalami perubahan skema basis data secara berkala \[46,47\].

Penerapan ORM seperti Prisma mendukung pengelolaan data yang lebih terstruktur dan konsisten, sehingga mempermudah pengembangan dan pemeliharaan sistem platform pembelajaran digital yang membutuhkan pengelolaan data secara dinamis dan berkelanjutan.

## 2.8.3 Basis Data

Basis data merupakan kumpulan data yang disusun secara sistematis untuk mendukung proses penyimpanan, pengelolaan, dan akses data secara terstruktur. Sistem basis data terdiri atas model data, skema, serta bahasa kueri, dan dikelola oleh Sistem Manajemen Basis Data (_Database Management System_ atau DBMS) yang berfungsi mengatur akses, menjaga keamanan, serta memastikan integritas dan kinerja data. Penerapan basis data mendukung efisiensi pengelolaan informasi dengan mengurangi redundansi, menjaga konsistensi data, serta memungkinkan analisis data yang lebih akurat sebagai dasar pengambilan keputusan dan pengembangan strategi berbasis data \[45\].

Penggunaan basis data bertujuan untuk mendukung pengelolaan dan pengarsipan data secara terstruktur, menghasilkan informasi yang akurat, serta mempermudah penyelesaian aktivitas yang bersifat berulang. Basis data berfungsi untuk menyimpan, mengorganisasi, memperbarui, dan menelusuri data sehingga proses pencarian dapat dilakukan dengan lebih cepat dan risiko kesalahan dapat diminimalkan. Selain itu, penggunaan aplikasi basis data memungkinkan efisiensi ruang penyimpanan dan biaya operasional, sehingga berperan penting dalam mendukung kegiatan manajemen, termasuk dalam pengelolaan pendidikan \[46\].

Berikut merupakan beberapa manfaat penerapan sistem basis data dalam pengembangan aplikasi berbasis web \[46\]:

1. Mengurangi redundansi data, sistem basis data membantu meminimalkan pengulangan data yang sama pada berbagai penyimpanan dengan mengelola data secara terpusat.
2. Menjaga integritas data, basis data memastikan keakuratan, konsistensi, keteraksesan, dan kualitas data melalui mekanisme pengelolaan dan validasi yang terstruktur.
3. Menjamin independensi data, basis data memungkinkan data tetap terlindungi dari perubahan yang tidak berwenang meskipun dapat diakses oleh pengguna tertentu sesuai dengan hak akses.
4. Mendukung kemudahan berbagi data, penggunaan perangkat lunak basis data memungkinkan pertukaran data atau informasi antar pengguna secara terkontrol dalam satu sistem.
5. Meningkatkan keamanan data, basis data menyediakan mekanisme pengamanan seperti pengaturan hak akses untuk melindungi data dari akses yang tidak sah.
6. Mempermudah akses data, struktur basis data yang terorganisasi dengan baik memudahkan proses pencarian, pengambilan, dan pengelolaan data secara efisien.

Dalam mendukung penerapan sistem basis data yang terstruktur dan andal, salah satu sistem manajemen basis data relasional yang banyak digunakan adalah PostgreSQL. PostgreSQL merupakan DBMS bersifat _open-source_ yang dikenal memiliki stabilitas, keamanan, dan performa yang baik, sehingga sesuai digunakan dalam pengolahan data berskala besar. Keunggulan PostgreSQL terletak pada kemampuannya dalam mengelola data dalam jumlah besar, dukungan terhadap standar SQL secara komprehensif, serta fitur optimasi kueri yang mendukung proses analisis data secara lebih efisien. Beberapa penelitian menunjukkan bahwa PostgreSQL dapat menjadi pilihan yang tepat dalam pengembangan sistem pengolahan data yang membutuhkan keandalan dan konsistensi \[47\].

Penggunaan sistem basis data relasional yang andal seperti PostgreSQL mendukung penyimpanan dan pengelolaan data pembelajaran secara aman dan konsisten, sehingga dapat menunjang keberlangsungan operasional platform pembelajaran digital berbasis web.

## 2.8.4 _Payment Gateway_

_Payment gateway_ merupakan layanan teknologi finansial yang menjembatani transaksi pembayaran daring antara pelanggan, _merchant_, dan penyedia layanan finansial seperti bank atau _e-wallet_, dengan memvalidasi, memproses, dan mengonfirmasi status pembayaran secara otomatis dan aman. Midtrans adalah salah satu penyedia _payment gateway_ yang banyak digunakan di Indonesia dan mendukung lebih dari dua puluh metode pembayaran, termasuk transfer bank, kartu kredit/debit, _e-wallet_, dan QRIS, dengan dua model integrasi utama yaitu Snap sebagai antarmuka pembayaran siap pakai dan Core API sebagai opsi integrasi yang dapat dikustomisasi sepenuhnya \[48\].

Penerapan Midtrans pada pengembangan aplikasi berbasis _web_ terbukti mempermudah proses pembayaran pelanggan, mengingat sebelumnya proses transaksi pada banyak usaha kecil dan menengah masih ditangani secara langsung atau manual sehingga membutuhkan waktu lebih lama dan rentan terhadap kesalahan pencatatan \[49\]. Dalam pengembangan platform NextLevel Academy, Midtrans diimplementasikan menggunakan model integrasi Snap untuk memfasilitasi transaksi pembelian kursus, sehingga proses pembayaran dan pemberian akses konten kepada peserta didik dapat berlangsung secara otomatis tanpa intervensi manual dari pihak Administrator.

## 2.9 _Black Box Testing_

_Black box testing_ merupakan metode pengujian perangkat lunak yang dilakukan tanpa melihat atau menganalisis kode sumber program. Pengujian ini berfokus pada fungsi sistem dengan mengamati hubungan antara input yang diberikan dan output yang dihasilkan. Dengan demikian, penguji hanya mengevaluasi apakah sistem telah berjalan sesuai dengan kebutuhan dan spesifikasi yang ditetapkan, tanpa memperhatikan struktur internalnya. Metode ini juga dikenal sebagai _behavioral testing, functional testing,_ atau _input/output testing_ \[50\].

Salah satu keunggulan _black box testing_ adalah kemampuannya dalam mengidentifikasi kesalahan pada fungsi sistem tanpa bergantung pada implementasi kode. Pendekatan ini sangat efektif untuk menguji antarmuka pengguna serta interaksi antar komponen dalam sistem. Namun, metode ini memiliki keterbatasan karena tidak dapat mendeteksi kesalahan yang terjadi pada tingkat kode program. Oleh karena itu, _black box testing_ sering dikombinasikan dengan metode pengujian lain agar hasil pengujian menjadi lebih menyeluruh dan akurat \[51\].

Tahapan pengujian _black box testing_ pada aplikasi edukasi berbasis website dimulai dari identifikasi fitur-fitur fungsional yang akan diuji, kemudian dilanjutkan dengan perancangan _test case_ berdasarkan skenario penggunaan, pelaksanaan pengujian dengan memasukkan data _input_ pada sistem, lalu membandingkan _output_ aktual dengan _output_ yang diharapkan, dan diakhiri dengan pencatatan hasil pengujian. Dalam konteks pengembangan platform pembelajaran digital NextLevel Academy, tahapan ini diterapkan untuk memverifikasi fungsionalitas fitur-fitur utama seperti _login_ pengguna, pengelolaan materi pembelajaran, sistem gamifikasi, dan alur pendaftaran magang terintegrasi \[50\].

Metode ini dipilih karena pengujian berfokus pada validasi fungsionalitas fitur dari perspektif pengguna akhir, sesuai dengan tujuan pengujian platform NextLevel Academy.

## 2.10 Gambaran Umum NextLevel Academy

NextLevel Academy merupakan sebuah perusahaan rintisan di bidang teknologi pendidikan (_educational technology_) yang berfokus pada pengembangan keterampilan, peningkatan kompetensi, dan pemberdayaan karier generasi muda di Indonesia. Didirikan pada awal tahun 2025 oleh Kevin Arya Swardhana bersama sekelompok mahasiswa Informatika, lembaga ini secara administratif berkedudukan di Jl. Sederhana Komplek Graha Swadaya, Tembung, Kecamatan Percut Sei Tuan, Kabupaten Deli Serdang, Sumatera Utara. Sebagai entitas yang adaptif terhadap komunikasi digital, lembaga ini dapat diakses melalui layanan koordinasi pada nomor +6282122701170. Pembentukan lembaga ini didasari oleh adanya kesenjangan (_gap_) aksesibilitas terhadap platform pembelajaran yang terjangkau, relevan dengan industri, serta mampu membangun konsistensi belajar di kalangan pelajar dan mahasiswa.

Dalam upaya mencapai tujuan institusionalnya, NextLevel Academy didukung oleh struktur organisasi yang terdiri dari 12 orang anggota internal yang memiliki fokus pada pengembangan sistem dan manajemen komunitas. Aspek instruksional atau tenaga pengajar pada lembaga ini dikelola melalui pendekatan kolaboratif. Dalam berbagai kegiatan luring seperti seminar dan lokakarya (_workshop_), fungsi pemateri dijalankan oleh anggota internal yang memiliki kepakaran terkait, maupun melalui kemitraan strategis dengan praktisi profesional yang berpengalaman di bidangnya. Sinergi ini bertujuan untuk menjamin kualitas materi yang disampaikan agar tetap mutakhir dan sesuai dengan standar kebutuhan industri kreatif.

Urgensi pengembangan NextLevel Academy diperkuat oleh hasil riset awal terhadap 500 responden, di mana 85% di antaranya mengeluhkan sulitnya menemukan platform multimedia yang terstruktur. Selain itu, 78% responden menekankan pentingnya sistem penghargaan (_reward_) untuk menjaga motivasi. Temuan ini menjadi landasan bagi NextLevel Academy untuk bertransformasi dari sekadar komunitas media sosial menjadi ekosistem digital komprehensif. Visi utama lembaga adalah menjadi pelopor ekosistem belajar berbasis komunitas dan gamifikasi yang mampu mencetak talenta unggul. Untuk mewujudkan hal tersebut, misi yang diusung meliputi: (1) penyediaan akses pelatihan berkualitas, (2) pembangunan lingkungan belajar interaktif berbasis teknologi, serta (3) pengintegrasian dampak sosial melalui program beasiswa bagi generasi muda dengan keterbatasan finansial di bidang multimedia.

Secara strategis, NextLevel Academy bertujuan menciptakan pendapatan berkelanjutan melalui model bisnis inklusif yang memberikan dampak sosial nyata. Melalui transformasi ke arah platform digital mandiri, lembaga ini berupaya memastikan keberlanjutan edukasi yang tidak terbatas oleh ruang dan waktu, serta memfasilitasi distribusi ilmu pengetahuan secara lebih luas dan merata bagi seluruh generasi muda Indonesia.

Gambar 2.1 Struktur Organisasi NextLevel Academy

Gambar 2.2 Peta Lokasi NextLevel Academy

## 2.11 Analisis Kesenjangan (_Gap_) dan Urgensi Pengembangan Platform

Pada kondisi saat ini, NextLevel Academy telah berhasil membangun eksistensi merek melalui media sosial dan memiliki dasar komunitas yang aktif. Namun, secara operasional, entitas ini masih menghadapi tantangan fundamental terkait ketiadaan infrastruktur teknologi mandiri untuk proses pembelajaran. Meskipun memposisikan diri sebagai perusahaan _educational technology_, kegiatan pendidikan yang dijalankan masih didominasi oleh metode konvensional berbasis luring, seperti seminar, lokakarya, dan pelatihan tatap muka. Ketergantungan pada metode fisik ini menyebabkan tingginya biaya operasional, pemborosan sumber daya waktu, serta keterbatasan jangkauan geografis dalam mendistribusikan materi kepada peserta di luar jangkauan lokasi kegiatan.

Permasalahan utama yang diidentifikasi adalah belum terealisasinya platform digital yang seharusnya menjadi identitas dan instrumen utama NextLevel Academy dalam menjalankan misi pendidikannya. Tanpa adanya platform web mandiri, sinkronisasi materi dan pelacakan progres belajar peserta tidak dapat dilakukan secara terukur dan sistematis. Hal ini menghambat efektivitas pembelajaran serta membatasi kemampuan NextLevel Academy untuk melakukan skalabilitas bisnis guna menjangkau audiens yang lebih luas di seluruh Indonesia. Kondisi ini menciptakan kesenjangan antara visi institusi sebagai pelopor ekosistem digital dengan realitas praktik pengajaran yang masih bersifat analog dan sporadis. Permasalahan lain juga dialami mitra dikarenakan adanya penyampaian kebutuhan oleh pihak sekolah yang sempat telah membangun kerja sama dengan pihak mitra, yaitu agar dapat menjadi wadah bagi siswa/siswi dari sekolah tersebut untuk magang di tempat mitra untuk meningkatkan pengalaman praktis siswa/siswi. Permasalahan ada karena mitra belum menjalankan program magang, serta belum adanya infrastruktur maupun fasilitas kantor yang memadai untuk menampung peserta magang secara langsung, khususnya dalam melibatkan pihak eksternal di luar tim internal. Oleh karena itu, diperlukan suatu sistem atau program magang baru yang mampu mengakomodasi aktivitas tersebut secara efektif.

Sebagai upaya untuk mengatasi kendala tersebut, penelitian ini dilakukan melalui kolaborasi strategis dengan NextLevel Academy untuk merancang dan mengimplementasikan platform pembelajaran digital berbasis web. Peran penulis dalam penelitian ini adalah sebagai pengembang sistem yang memberikan solusi teknis terhadap hambatan infrastruktur yang dialami mitra. Platform yang dikembangkan dirancang untuk mentransformasi sistem pembelajaran konvensional menjadi ekosistem digital yang komprehensif. Solusi ini mencakup integrasi berbagai fitur esensial seperti manajemen kursus mandiri, penyajian video tutorial interaktif, sistem evaluasi otomatis melalui kuis, pelacakan progres belajar (_progress tracking_), hingga gamifikasi untuk meningkatkan semangat serta konsistensi belajar para peserta dengan pembelajaran yang seru dan progresif. Selain sebagai pengembangan platform pembelajaran digital dengan kursus-kursus, penelitian ini juga merespons kebutuhan mitra untuk menyediakan wadah magang yang dapat diakses secara daring, terstruktur, dan tetap terintegrasi dalam satu sistem. Oleh karena itu, dikembangkan fitur magang berbasis web yang memungkinkan siswa magang melakukan absensi, mengerjakan dan mengumpulkan tugas, serta memperoleh penilaian dan umpan balik dari mentor melalui hak akses yang sesuai.

Melalui pengembangan platform ini, diharapkan NextLevel Academy dapat beralih sepenuhnya ke sistem pembelajaran yang lebih profesional, efisien, dan inklusif. Implementasi platform web ini tidak hanya berfungsi sebagai alat bantu ajar, tetapi juga sebagai pusat keunggulan bagi komunitas pembelajar di bawah naungan NextLevel Academy. Dengan demikian, penelitian ini menjadi langkah krusial dalam mewujudkan jati diri NextLevel Academy sebagai platform _Edutech_ yang sesungguhnya, sekaligus memberikan kontribusi nyata dalam upaya digitalisasi pendidikan bagi generasi muda Indonesia.

Tabel 2.1 Perbandingan Existing System

| **No** | **Fitur**            | **WPU Course** | **Dicoding** | **Udemy** | **NextLevel Academy** |
| ------ | -------------------- | -------------- | ------------ | --------- | --------------------- |
| 1      | Video Pembelajaran   | Ya             | Ya           | Ya        | Ya                    |
| 2      | Kuis                 | Ya             | Ya           | Ya        | Ya                    |
| 3      | _Progress Tracking_  | Ya             | Ya           | Ya        | Ya                    |
| 4      | Sertifikat           | Ya             | Ya           | Ya        | Ya                    |
| 5      | Sistem Pembayaran    | Ya             | Ya           | Ya        | Ya                    |
| 6      | Gamifikasi           | Tidak          | Ya           | Tidak     | Ya                    |
| 7      | Sistem Magang Daring | Tidak          | Tidak        | Tidak     | Ya                    |

Tabel 2.1 disusun berdasarkan hasil observasi langsung oleh peneliti terhadap masing-masing platform pada April 2026 dalam kapasitas sebagai pengguna terdaftar. Fitur Video Pembelajaran, Kuis, _Progress Tracking_, Sertifikat, dan Sistem Pembayaran telah diimplementasikan oleh seluruh platform yang dibandingkan, sehingga tidak menjadi faktor pembeda yang signifikan dalam penelitian ini.

Perbedaan ditemukan pada fitur Gamifikasi. WPU Course tidak menyediakan mekanisme gamifikasi apapun dalam alur belajarnya; satu-satunya bentuk pengakuan yang diberikan adalah sertifikat penyelesaian kursus, yang tidak dikategorikan sebagai elemen gamifikasi karena tidak mendorong keterlibatan peserta secara progresif dan berkelanjutan \[52\]. Dicoding menyediakan sistem pengumpulan poin dan EXP, namun tanpa mekanisme _leveling_ yang bermakna maupun _reward_ progresif sebagai konsekuensi dari akumulasi poin tersebut, sehingga belum memenuhi konsep gamifikasi yang utuh \[53\]. Udemy tidak mengimplementasikan sistem gamifikasi pada platform konsumennya; fitur _badge_ yang tersedia merupakan lencana reputasi instruktur dan sertifikasi profesional pihak ketiga yang bersifat validasi kompetensi industri, bukan mekanisme gamifikasi intrinsik dalam ekosistem belajar \[54\].

Pada fitur Sistem Magang Daring, ketiga platform pembanding tidak menyediakan fitur pengelolaan magang yang terintegrasi dalam satu ekosistem platform pembelajaran, mencakup absensi digital, distribusi tugas dari mentor, pengumpulan dan penilaian hasil kerja, hingga penerbitan sertifikat magang \[52,53,55\]. Program magang yang diselenggarakan platform-platform tersebut, apabila ada, umumnya merupakan kolaborasi dengan perusahaan mitra eksternal yang terpisah dari ekosistem platform utama. Hal ini menegaskan kebaruan (_novelty_) fitur Sistem Magang Daring yang dikembangkan dalam penelitian ini.

## 2.12 Penelitian Terkait

Kajian terhadap penelitian terdahulu yang relevan dilakukan untuk memperkuat landasan teoritis dan memberikan gambaran mengenai perkembangan penelitian di bidang pengembangan platform pembelajaran digital berbasis web, penerapan gamifikasi dalam _e-learning,_ serta implementasi _Learning Management System_. Berikut adalah ringkasan beberapa penelitian sejenis yang menjadi referensi dalam penelitian ini.

Tabel 2.2 Penelitian Terkait

| **No** | **Peneliti & Tahun**                  | **Judul**                                                                                               | **Metode & Teknologi**                                        | **Hasil**                                                                                                                                                                          | **Persamaan**                                                                                                                                             | **Perbedaan**                                                                                                                                                                                                                                                                                                                                   |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Daniswara & Voutama (2025) \[56\]     | Perancangan Platform Kreatikode sebagai Media Pembelajaran Pemrograman _Online_ Gratis Berbasis Website | SDLC Waterfall, MERN stack                                    | Platform pembelajaran pemrograman terstruktur (dasar-lanjutan) dengan fitur registrasi, _progress tracking_, kuis, dan manajemen pengguna seluruh fitur lulus _Black Box Testing_. | Sama-sama mengembangkan platform pembelajaran digital berbasis website yang mendukung proses belajar terstruktur dan terpusat.                            | Penelitian ini berfokus pada NextLevel Academy dengan integrasi video _learning_, gamifikasi (EXP, _leveling_, _badges_), _Learning Analytics Dashboard_, _payment gateway_, dan sistem magang daring sedangkan Kreatikode berfokus pada pembelajaran pemrograman gratis tanpa fitur tersebut.                                                  |
| 2      | Nisa, Waworuntu & Lumba (2023) \[57\] | Integrasi Gamifikasi dalam Perancangan dan Pembangunan Website Pembelajaran Kosakata Bahasa Asing       | _Framework_ Octalysis, React, Node.js, MySQL, pengujian HMSAM | _Behavioral intention to use_ 82,29% dan immersion 80,53%; gamifikasi efektif meningkatkan keterlibatan dan motivasi pengguna.                                                     | Sama-sama mengembangkan platform pembelajaran berbasis web yang mengintegrasikan elemen gamifikasi untuk meningkatkan motivasi dan keterlibatan pengguna. | Penelitian ini berfokus pada NextLevel Academy dengan gamifikasi EXP, _leveling_, dan _badges_, dilengkapi video _learning_, _Learning Analytics Dashboard_, _progress tracking_, _payment gateway_, dan sistem magang daring sedangkan penelitian Nisa et al. berfokus pada kosakata bahasa asing dengan _reward_, _leaderboard_, dan _timer_. |

# BAB III

TAHAPAN PELAKSANAAN

1.

## 3.1 Metode Pengembangan Sistem

Dalam penelitian ini digunakan metode _Waterfall_ sebagai pendekatan dalam proses perancangan dan pembangunan sistem. Metode _Waterfall_ dipilih sebagai metode pengembangan sistem dalam penelitian ini karena beberapa pertimbangan yang relevan dengan karakteristik proyek. Pertama, kebutuhan sistem platform pembelajaran digital NextLevel Academy telah dapat didefinisikan secara jelas dan komprehensif sejak awal melalui proses analisis kebutuhan bersama mitra, sehingga potensi perubahan kebutuhan di tengah proses pengembangan dapat diminimalkan. Kedua, metode _Waterfall_ menyediakan tahapan pengembangan yang terstruktur dan berurutan mulai dari analisis kebutuhan, perancangan sistem, implementasi, hingga pengujian, sehingga memudahkan pemantauan kemajuan dan pengendalian kualitas pada setiap fase. Ketiga, pendekatan ini menghasilkan dokumentasi yang sistematis pada setiap tahapan, sehingga mendukung kemudahan pemeliharaan sistem di masa mendatang. Selain itu, metode _Waterfall_ telah terbukti digunakan secara luas dalam penelitian pengembangan sistem berbasis web dengan cakupan kebutuhan yang terdefinisi, sehingga dinilai sesuai untuk diterapkan dalam penelitian ini.

Gambar 3.1 Metode Waterfall

Penjelasan dari setiap tahapan dalam metode _Waterfall_ yang digunakan dalam penelitian ini adalah sebagai berikut:

1. _Requirements Analysis_ (Analisis Kebutuhan)

Pada fase ini dilakukan identifikasi dan pendokumentasian kebutuhan sistem secara sistematis. Kegiatan yang dilakukan meliputi studi literatur terkait platform pembelajaran digital, _Learning Management System_ (LMS), serta sistem magang berbasis web. Selain itu dilakukan analisis permasalahan yang dihadapi oleh mitra NextLevel Academy serta identifikasi kebutuhan fungsional dan non fungsional sistem. Hasil dari fase ini berupa dokumen analisis kebutuhan sistem, daftar fitur berdasarkan aktor yaitu Administrator, Peserta Didik, Peserta Magang, dan Mentor, serta gambaran sistem yang berjalan saat ini.

1. _System Design_ (Perancangan Sistem)

Fase perancangan bertujuan untuk menerjemahkan kebutuhan yang telah diidentifikasi ke dalam rancangan teknis sistem. Kegiatan pada fase ini mencakup perancangan _Use Case Diagram_ beserta narasi _use case_ yang mendeskripsikan interaksi antara aktor dan sistem secara terstruktur. Selain itu, dilakukan perancangan antarmuka pengguna atau _User Interface_ untuk seluruh halaman pada platform. Perancangan basis data juga dilakukan pada fase ini, yang meliputi pembuatan _Entity Relationship Diagram_ (ERD) untuk menggambarkan entitas-entitas yang terlibat serta relasi antar entitas dalam sistem, serta pendefinisian tabel atribut setiap entitas yang memuat nama kolom, tipe data, dan keterangan masing-masing _field_ sebagai acuan dalam implementasi struktur basis data.

1. _Implementation_ (Implementasi)

Pada fase ini, rancangan sistem yang telah dibuat diimplementasikan menjadi sistem yang dapat digunakan. Pengembangan dilakukan menggunakan Next.js sebagai _framework full-stack_ yang mengintegrasikan antarmuka pengguna dan logika bisnis _server_ dalam satu arsitektur terpadu, tanpa memerlukan _server_ _backend_ terpisah. TypeScript digunakan sebagai bahasa pemrograman utama guna memastikan keamanan tipe data sepanjang proses pengembangan, sementara Tailwind CSS digunakan untuk penyusunan antarmuka yang responsif dan konsisten. PostgreSQL digunakan sebagai sistem manajemen basis data relasional dengan Prisma sebagai ORM yang mengelola skema, migrasi, dan kueri basis data. Better Auth digunakan untuk penanganan autentikasi berbasis sesi dan otorisasi akses berdasarkan peran pengguna. Bunny.net dimanfaatkan sebagai layanan penyimpanan _file_ sekaligus streaming video yang dilindungi dengan mekanisme URL bertanda tangan. _Midtrans Snap_ digunakan sebagai _payment gateway_ untuk memproses transaksi pembelian kursus secara daring dengan dukungan berbagai metode pembayaran. Resend bersama React Email digunakan untuk pengiriman email transaksional, mencakup verifikasi akun, notifikasi pembayaran, dan pemberitahuan sistem lainnya.

1. _Testing_ (Pengujian)

Fase pengujian dilakukan untuk memastikan bahwa fitur dan fungsionalitas sistem berjalan sesuai dengan kebutuhan yang telah ditetapkan. Metode yang digunakan adalah _Black Box Testing_ yaitu pengujian yang berfokus pada keluaran sistem berdasarkan masukan tanpa meninjau struktur internal kode program. Pengujian dilakukan berdasarkan skenario penggunaan masing masing aktor.

## 3.2 Analisis Kebutuhan Sistem

Analisis kebutuhan sistem dilakukan untuk memperoleh pemahaman yang komprehensif terhadap kondisi operasional mitra sebelum sistem dikembangkan, serta untuk mengidentifikasi kebutuhan fungsional dan non-fungsional yang harus dipenuhi oleh sistem yang akan dibangun. Proses analisis ini menjadi dasar bagi seluruh tahapan perancangan dan implementasi yang dilakukan pada penelitian ini.

## 3.2.1 Analisis Sistem Berjalan

Analisis sistem berjalan dilakukan melalui dua metode pengumpulan data, yaitu wawancara langsung dengan pihak NextLevel Academy dan observasi terhadap proses operasional yang sedang berjalan. Wawancara dilakukan untuk menggali informasi mengenai alur proses pembelajaran, pengelolaan peserta, serta kondisi program magang yang dijalankan secara konvensional oleh mitra. Observasi dilakukan untuk memvalidasi informasi yang diperoleh dari wawancara serta mendokumentasikan kondisi nyata operasional mitra.

Berdasarkan hasil wawancara dan observasi, ditemukan bahwa seluruh kegiatan pembelajaran NextLevel Academy masih dijalankan secara konvensional tanpa dukungan platform digital yang terintegrasi. Terdapat dua kondisi utama yang dianalisis, yaitu proses penyelenggaraan pembelajaran beserta pengelolaan sertifikatnya, serta kondisi program magang.

1. Proses Penyelenggaraan Pembelajaran dan Pengelolaan Sertifikat

Kegiatan pembelajaran yang diselenggarakan NextLevel Academy berbasis pada program seminar dan workshop yang dilaksanakan secara luring melalui kerja sama dengan pihak sekolah. Alur proses penyelenggaraan pembelajaran hingga penerbitan sertifikat yang berjalan saat ini dapat diuraikan sebagai berikut.

1. NextLevel Academy menjalin kerja sama dengan pihak sekolah sebagai mitra penyelenggara. Pihak sekolah kemudian berperan sebagai penyebar informasi mengenai jadwal dan tema seminar atau _workshop_ kepada siswa-siswinya. Pendaftaran peserta dilakukan dengan cara pengumpulan data secara manual terhadap siswa yang berminat untuk mengikuti kegiatan tersebut.
2. Pada hari pelaksanaan kegiatan, materi pembelajaran disiapkan secara manual oleh mentor atau pemateri yang ditugaskan, kemudian didistribusikan kepada peserta melalui grup percakapan WhatsApp yang telah dibuat khusus untuk kegiatan tersebut. Setelah kegiatan selesai, tim internal NextLevel Academy membagikan tautan _form_ _feedback_ melalui grup percakapan WhatsApp yang sama. Pengisian _form_ tersebut berfungsi sekaligus sebagai bukti kehadiran peserta dan syarat untuk memperoleh sertifikat keikutsertaan.
3. Setelah kegiatan selesai, tim internal NextLevel Academy membuat sertifikat secara manual menggunakan perangkat desain untuk setiap peserta yang memenuhi syarat kehadiran. Sertifikat yang telah dibuat dikumpulkan dalam sebuah _folder_ di layanan Google Drive, kemudian tautan menuju _folder_ tersebut dibagikan melalui grup percakapan WhatsApp agar peserta dapat mengunduh sertifikat masing-masing secara mandiri.

Gambar 3.2 Sistem Berjalan NextLevel Academy

Gambar 3.3 Activity Diagram Sistem Berjalan NextLevel Academy

Berdasarkan alur tersebut, terdapat beberapa kelemahan mendasar yang teridentifikasi. Jangkauan program terbatas secara geografis karena seluruh kegiatan mengharuskan kehadiran fisik peserta. Distribusi materi yang bergantung pada grup WhatsApp tidak terstruktur dan tidak memungkinkan pemantauan terhadap akses serta pemahaman peserta atas materi yang diberikan. Tidak terdapat mekanisme evaluasi yang mengukur pemahaman peserta secara sistematis, serta tidak ada pencatatan progres belajar yang dapat dipantau oleh pengelola. Dari sisi pengelolaan sertifikat, proses pembuatan secara manual membutuhkan waktu dan sumber daya yang signifikan, sementara tidak terdapat mekanisme verifikasi keaslian sertifikat yang dapat diakses oleh pihak luar.

1. Kondisi Program Magang

Berdasarkan hasil wawancara, NextLevel Academy belum memiliki program magang yang berjalan secara formal. Kebutuhan terhadap program magang muncul dari adanya permintaan salah satu sekolah mitra agar NextLevel Academy dapat menjadi wadah bagi siswa-siswinya untuk memperoleh pengalaman praktis di bidang digital. Namun demikian, kondisi yang ada saat ini menunjukkan bahwa NextLevel Academy belum memiliki infrastruktur maupun fasilitas fisik yang memadai untuk menampung peserta magang secara langsung. Akibatnya, kebutuhan tersebut belum dapat dipenuhi secara efektif dan terstruktur.

## 3.2.2 Analisis Kebutuhan Fungsional

Analisis kebutuhan fungsional merupakan tahapan identifikasi dan pendefinisian seluruh fungsi atau layanan yang harus disediakan oleh sistem kepada penggunanya. Kebutuhan fungsional mendeskripsikan perilaku sistem dalam merespons masukan tertentu serta tindakan yang harus dilakukan sistem dalam situasi tertentu, sehingga menjadi acuan utama dalam proses perancangan dan implementasi. Pada penelitian ini, identifikasi kebutuhan fungsional dilakukan berdasarkan hasil analisis sistem yang berjalan, yaitu kondisi operasional NextLevel Academy. Seluruh kebutuhan yang teridentifikasi kemudian diorganisasikan berdasarkan peran atau aktor yang terlibat dalam sistem, sehingga menghasilkan cakupan fungsional yang komprehensif dan tepat sasaran. Berdasarkan hasil analisis kebutuhan sistem, ditetapkan empat aktor utama yang berinteraksi dengan platform pembelajaran digital NextLevel Academy.

Keseluruhan interaksi antara aktor dan sistem dimodelkan secara visual menggunakan _Use Case Diagram_. _Use Case Diagram_ adalah diagram dalam notasi _Unified Modeling Language_ (UML) yang menggambarkan hubungan fungsional antara aktor dengan _use case_, sehingga memberikan gambaran tingkat tinggi mengenai fungsionalitas sistem dari perspektif pengguna.

Gambar 3.4 Use Case Diagram

Setiap _use case_ yang terdapat dalam _Use Case Diagram_ selanjutnya dijabarkan secara rinci melalui narasi _use case_ yang disajikan dalam bentuk tabel. Narasi _use case_ mendeskripsikan alur interaksi antara aktor dan sistem secara terstruktur, penjabaran narasi _use case_ secara terstruktur ini bertujuan untuk memastikan bahwa seluruh skenario penggunaan sistem, berikut tabel narasi untuk setiap _use case_ yang teridentifikasi disajikan secara berurutan.

Tabel 3.1 Narasi Use Case Login

| _Use Case_ | _Login_ | |
| --- | --- | | --- |
| Deskripsi | Pengguna yang telah memiliki akun dapat masuk ke dalam sistem dengan menggunakan alamat email dan kata sandi yang terdaftar untuk mengakses fitur sesuai dengan perannya. | |
| Aktor | Peserta Didik, Peserta Magang, Mentor, Administrator | |
| Kondisi Awal | Pengguna belum masuk ke dalam sistem dan berada pada halaman "_Login_". | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna memasukkan alamat email dan kata sandi pada formulir _login_, kemudian menekan tombol "Masuk". | 2\. Sistem memvalidasi format _input_ serta mencocokkan kredensial yang dimasukkan dengan data pengguna pada basis data. |
| 3\. Pengguna menunggu proses autentikasi selesai. | 4\. Jika kredensial _valid_, sistem membuat sesi autentikasi, menyimpan sesi pengguna, dan mengarahkan pengguna ke halaman _dashboard_ sesuai dengan perannya. |
| Kondisi Akhir | Pengguna berhasil masuk ke dalam sistem dan berada pada halaman "_Dashboard_" sesuai dengan perannya dengan sesi autentikasi yang aktif. | |
| Aksi Alternatif | 1\. Jika kombinasi alamat email dan kata sandi tidak sesuai, sistem menampilkan pesan kesalahan tanpa mengungkapkan data yang tidak valid.<br><br>2\. Jika alamat email belum diverifikasi, sistem menampilkan pemberitahuan dan menyediakan opsi untuk mengirim ulang email verifikasi.<br><br>3\. Jika akun pengguna berstatus nonaktif, sistem menampilkan pesan pemberitahuan dan menyarankan pengguna untuk menghubungi administrator.<br><br>4\. Jika terjadi lima kali percobaan _login_ gagal dalam rentang waktu 15 menit dari alamat IP yang sama, sistem menerapkan pembatasan akses sementara. | |

Tabel 3.2 Narasi Use Case Melihat Katalog dan Detail Kursus

| _Use Case_ | Melihat Katalog dan Detail Kursus | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik dapat menelusuri daftar kursus yang tersedia melalui fitur pencarian, penyaringan, dan pengurutan, serta melihat informasi lengkap mengenai kursus yang diminati. | |
| Aktor | Peserta Didik | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Didik. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna mengakses halaman katalog kursus melalui halaman "_Dashboard_" atau menu "Kursus". | 2\. Sistem menampilkan daftar kursus yang berstatus dipublikasikan beserta informasi ringkas pada setiap kartu kursus, meliputi thumbnail, judul, kategori, harga, dan jumlah peserta. Sistem juga menempatkan kursus yang telah dimiliki pengguna pada bagian teratas daftar. |
| 3\. Pengguna memasukkan kata kunci pencarian, memilih kategori, atau menentukan opsi pengurutan kursus. | 4\. Sistem memfilter dan mengurutkan daftar kursus secara dinamis sesuai dengan parameter yang dipilih pengguna. |
| 5\. Pengguna memilih salah satu kursus dari daftar yang ditampilkan. | 6\. Sistem menampilkan halaman detail kursus yang memuat deskripsi lengkap, _thumbnail_, informasi instruktur, struktur kurikulum, harga, manfaat kursus, status kursus, dan FAQ (_Frequently Asked Questions_). |
| Kondisi Akhir | Pengguna memperoleh informasi lengkap mengenai kursus yang diminati. | |
| Aksi Alternatif | 1\. Jika tidak terdapat kursus yang sesuai dengan kata kunci pencarian atau _filter_ yang dipilih, sistem menampilkan pesan informasi bahwa tidak ada kursus yang ditemukan.<br><br>2\. Jika data kursus gagal dimuat, sistem menampilkan pesan kesalahan dan menyediakan opsi untuk memuat ulang halaman. | |

Tabel 3.3 Narasi Use Case Melakukan Pembelian Kursus

| _Use Case_ | Melakukan Pembelian Kursus | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik dapat membeli kursus yang diminati melalui proses _checkout_ yang terintegrasi dengan layanan pembayaran Midtrans Snap, dengan opsi penggunaan voucher diskon. | |
| Aktor | Peserta Ddik | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Didik dan belum memiliki akses terhadap kursus yang akan dibeli. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol "Beli Kursus" pada halaman detail kursus. | 2\. Sistem memverifikasi bahwa pengguna belum memiliki kursus tersebut dan tidak memiliki pesanan berstatus _pending_ untuk kursus yang sama. Sistem kemudian menampilkan halaman _checkout_ yang berisi ringkasan pesanan dan harga kursus. |
| 3\. Pengguna memasukkan kode voucher diskon (opsional) dan meng-klik tombol "Terapkan". | 4\. Sistem memvalidasi voucher. Jika valid, sistem menampilkan potongan harga dan harga akhir yang harus dibayar. Jika tidak valid, sistem menampilkan pesan kesalahan. |
| 5\. Pengguna meng-klik tombol "_Checkout_ & Bayar Sekarang". | 6\. Sistem membuat data pesanan dengan status _pending_ dan menampilkan antarmuka pembayaran Midtrans Snap. |
| 7\. Pengguna memilih metode pembayaran dan menyelesaikan proses pembayaran melalui antarmuka Midtrans Snap. | 8\. Sistem menerima notifikasi pembayaran (_webhook_) dari Midtrans dan melakukan validasi status transaksi. |
| 9\. Pengguna menyelesaikan transaksi dan kembali ke aplikasi. | 10\. Jika pembayaran berhasil, sistem mengubah status pesanan menjadi berhasil, memberikan akses ke kursus, mengirim email konfirmasi pembelian, menampilkan notifikasi dalam aplikasi, serta mengarahkan pengguna ke halaman "Riwayat Transaksi". |
| Kondisi Akhir | Pembayaran berhasil diproses, pengguna terdaftar sebagai peserta kursus, dan dapat mengakses seluruh materi pembelajaran. | |
| Aksi Alternatif | 1\. Jika voucher yang dimasukkan tidak valid, sistem menampilkan pesan kesalahan dan proses _checkout_ tetap dapat dilanjutkan tanpa menggunakan voucher.<br><br>2\. Jika pengguna menutup antarmuka pembayaran sebelum transaksi selesai, pesanan tetap berstatus _pending_ dan pembayaran dapat dilanjutkan melalui halaman "Riwayat Transaksi".<br><br>3\. Jika pengguna membatalkan pembayaran, sistem meminta konfirmasi pembatalan dan mengubah status pesanan menjadi dibatalkan.<br><br>4\. Jika batas waktu pembayaran terlampaui tanpa adanya pembayaran yang berhasil, sistem secara otomatis mengubah status pesanan menjadi kedaluwarsa.<br><br>5\. Jika pembayaran gagal divalidasi oleh Midtrans, sistem mengubah status pesanan menjadi gagal dan tidak memberikan akses ke kursus. | |

Tabel 3.4 Narasi Use Case Mengakses dan Menonton Materi Video

| _Use Case_ | Mengakses dan Menonton Materi Video | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik yang telah memiliki akses ke suatu kursus dapat menonton materi pembelajaran berbasis video melalui _course player_, melacak progres pembelajaran, memperoleh EXP dari penyelesaian materi, serta membuat catatan pribadi yang tersimpan secara otomatis. | |
| Aktor | Peserta Didik | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Didik dan memiliki akses terhadap kursus yang akan dipelajari. Tahap video yang dipilih telah terbuka sesuai urutan progres pembelajaran. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka kursus dan memilih tahap pembelajaran bertipe video melalui kurikulum yang tersedia pada _sidebar_. | 2\. Sistem memverifikasi kepemilikan akses kursus dan menampilkan halaman _course player_ yang berisi pemutar video, struktur kurikulum pada _sidebar_, serta fitur catatan pembelajaran. |
| 3\. Pengguna memilih dan memulai pemutaran video pembelajaran. | 4\. Sistem menghasilkan _Signed URL_ sementara dari Bunny.net untuk video yang dipilih dan menampilkan video pada pemutar media. |
| 5\. Pengguna menonton video hingga selesai atau meng-klik tombol "Tandai Selesai". | 6\. Sistem mencatat penyelesaian materi, memperbarui progres kursus, memberikan +15 EXP pada penyelesaian pertama, serta membuka tahap pembelajaran berikutnya yang sebelumnya terkunci. |
| Kondisi Akhir | Video berhasil ditandai selesai, progres kursus diperbarui, EXP diberikan kepada pengguna, tahap berikutnya terbuka, dan catatan pembelajaran tersimpan di basis data. | |
| Aksi Alternatif | 1\. Jika pengguna tidak memiliki akses terhadap kursus yang dipilih, sistem menampilkan pesan bahwa akses tidak tersedia dan mengarahkan pengguna ke halaman detail kursus.<br><br>2\. Jika pengguna mencoba mengakses tahap yang masih terkunci, sistem menampilkan informasi bahwa tahap sebelumnya harus diselesaikan terlebih dahulu.<br><br>3\. Jika koneksi terputus saat proses penyimpanan catatan, sistem menampilkan status gagal dan mencoba menyimpan kembali data secara otomatis ketika koneksi tersedia.<br><br>4\. Jika video gagal dimuat atau _Signed URL_ telah kedaluwarsa, sistem menampilkan pesan kesalahan dan menyediakan opsi untuk memuat ulang video. | |

Tabel 3.5 Narasi Use Case Mengerjakan Kuis

| _Use Case_ | Mengerjakan Kuis | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik dapat mengerjakan kuis evaluasi yang tersedia pada tahap tertentu dalam kursus sebagai sarana untuk mengukur pemahaman materi. Kuis memiliki nilai kelulusan minimal 80, batas maksimal tiga percobaan, serta mekanisme _cooldown_ setelah tiga kali kegagalan berturut-turut. | |
| Aktor | Peserta Didik | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Didik dan telah menyelesaikan tahap sebelumnya sehingga tahap kuis yang dituju telah terbuka. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka tahap kuis melalui daftar kurikulum pada _sidebar_ _course player_. | 2\. Sistem menampilkan antarmuka kuis yang berisi seluruh soal pilihan ganda, pilihan jawaban, serta informasi mengenai ketentuan pengerjaan. |
| 3\. Pengguna menjawab seluruh soal pilihan ganda yang ditampilkan. | 4\. Sistem menyimpan pilihan jawaban pengguna selama proses pengerjaan kuis berlangsung. |
| Hasil kuis berhasil direkam. Jika pengguna memperoleh nilai lulus, progres kursus diperbarui, EXP diberikan, dan tahap pembelajaran berikutnya terbuka. | 6\. Sistem menghitung skor berdasarkan jawaban yang diberikan dan menampilkan hasil kuis kepada pengguna. Jika skor mencapai 80 atau lebih, sistem menandai kuis sebagai lulus, memberikan EXP sesuai ketentuan sistem, memperbarui progres kursus, dan membuka tahap berikutnya. Jika skor di bawah 80, sistem menampilkan informasi bahwa pengguna belum lulus. |
| Kondisi Akhir | Hasil kuis berhasil direkam. Jika pengguna memperoleh nilai lulus, progres kursus diperbarui, EXP diberikan, dan tahap pembelajaran berikutnya terbuka. | |
| Aksi Alternatif | 1\. Jika terdapat soal yang belum dijawab saat pengguna meng-klik tombol "Kirim Jawaban", sistem menampilkan peringatan dan meminta pengguna melengkapi jawaban terlebih dahulu.<br><br>2\. Jika skor di bawah 80 pada percobaan pertama atau kedua, sistem menampilkan hasil kuis, informasi jumlah sisa percobaan, serta opsi "Coba Lagi".<br><br>3\. Jika skor di bawah 80 pada percobaan ketiga secara berturut-turut, sistem menerapkan _cooldown_ selama 30 menit dan menampilkan hitung mundur waktu tunggu.<br><br>4\. Setelah masa _cooldown_ berakhir, sistem mengatur ulang jumlah percobaan sehingga pengguna dapat mengerjakan kuis kembali. | |

Tabel 3.6 Narasi Use Case Mengklaim dan Mengunduh Sertifikat

| _Use Case_ | Mengklaim dan Mengunduh Sertifikat | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik yang telah menyelesaikan seluruh tahap pembelajaran dalam suatu kursus dapat mengklaim sertifikat digital dengan melakukan konfirmasi nama penerima, kemudian mengunduh sertifikat tersebut dalam format PDF. Setiap sertifikat memiliki nomor unik dan dapat diverifikasi melalui halaman verifikasi publik. | |
| Aktor | Peserta Didik | |
| Kondisi Awal | Pengguna telah menyelesaikan seluruh tahap pembelajaran dalam kursus sehingga progres pembelajaran mencapai 100% dan sertifikat tersedia untuk diklaim. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Sertifikat" melalui menu navigasi. | 2\. Sistem menampilkan daftar sertifikat yang dimiliki pengguna. Sertifikat yang belum diklaim ditandai dengan tombol "Klaim Sertifikat". |
| 3\. Pengguna meng-klik tombol "Klaim Sertifikat", meninjau nama yang akan dicetak pada sertifikat, melakukan perubahan apabila diperlukan, kemudian meng-klik tombol "Klaim". | 4\. Sistem memverifikasi kelayakan penerbitan sertifikat, menyimpan nama penerima secara permanen, mencatat waktu klaim, menghasilkan sertifikat digital yang memuat nama penerima, nama kursus, tanggal penerbitan, nomor sertifikat unik, serta tautan verifikasi publik. Sistem kemudian menyimpan data sertifikat ke dalam basis data dan menampilkan sertifikat pada halaman "Sertifikat". |
| 5\. Pengguna meng-klik tombol "Unduh PDF" pada sertifikat yang telah diklaim. | 6\. Sistem menghasilkan dan menyajikan _file_ sertifikat dalam format PDF untuk diunduh oleh pengguna. |
| Kondisi Akhir | Sertifikat berhasil diklaim, tersimpan pada akun pengguna, dan dapat diunduh kapan saja dalam format PDF. | |
| Aksi Alternatif | 1\. Jika progres kursus belum mencapai 100%, sistem tidak menampilkan opsi "Klaim Sertifikat" dan memberikan informasi bahwa sertifikat belum dapat diklaim.<br><br>2\. Jika proses _rendering_ sertifikat masih berlangsung saat halaman dibuka, sistem menampilkan indikator pemuatan hingga proses selesai.<br><br>3\. Setelah sertifikat diklaim, nama penerima tidak dapat diubah kembali.<br><br>4\. Keaslian sertifikat dapat diverifikasi oleh siapa pun melalui halaman verifikasi publik tanpa perlu masuk ke dalam sistem. | |

Tabel 3.7 Narasi Use Case Melihat EXP, Level, Badge, dan Klaim Voucher Reward

| _Use Case_ | Melihat EXP, _Level_, _Badge_, dan Klaim Voucher _Reward_ | |
| --- | --- | | --- |
| Deskripsi | Peserta Didik dapat memantau perkembangan gamifikasi yang dimiliki, meliputi jumlah EXP, _level_ saat ini, progres menuju _level_ berikutnya, _badge_ yang telah diperoleh, serta hadiah berupa voucher diskon pada _level-level milestone_ tertentu. Peserta Didik juga dapat mengklaim voucher _reward_ yang telah terbuka sesuai dengan _level_ yang dicapai. | |
| Aktor | Peserta Didik | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Didik. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "EXP & _Level_" melalui menu navigasi. | 2\. Sistem menampilkan informasi gamifikasi pengguna yang meliputi _level_ saat ini, _title_ atau _badge_ aktif, jumlah EXP yang dimiliki, progres menuju _level_ berikutnya, daftar _badge_ yang telah diperoleh, serta _reward roadmap_ yang berisi hadiah pada setiap _level milestone_. |
| 3\. Pengguna meninjau _reward roadmap_ dan meng-klik tombol "Klaim" pada hadiah voucher yang tersedia. | 4\. Sistem memverifikasi bahwa _level_ yang dipersyaratkan telah tercapai, kemudian membuat kode voucher unik, menetapkan masa berlaku selama 180 hari, dan menampilkan kode voucher kepada pengguna untuk digunakan saat proses _checkout_. |
| Kondisi Akhir | Pengguna memperoleh informasi mengenai status gamifikasi terkini dan voucher _reward_ berhasil diklaim sehingga siap digunakan. | |
| Aksi Alternatif | 1\. Jika pengguna belum memiliki aktivitas pembelajaran, sistem menampilkan kondisi awal gamifikasi berupa _level_ 1 dengan EXP 0.<br><br>2\. Jika _level_ yang dipersyaratkan belum tercapai, sistem menampilkan hadiah dalam kondisi terkunci dan tombol "Klaim" tidak tersedia.<br><br>3\. Jika _reward_ pada level tertentu telah diklaim sebelumnya, sistem tidak menampilkan tombol "Klaim" dan menampilkan kode voucher yang telah diperoleh beserta statusnya.<br><br>4\. Jika voucher tidak digunakan hingga masa berlakunya berakhir, sistem menandai voucher tersebut sebagai kedaluwarsa. | |

Tabel 3.8 Narasi Use Case Melihat dan Melakukan Absensi

| _Use Case_ | Melihat dan Melakukan Absensi | |
| --- | --- | | --- |
| Deskripsi | Peserta Magang dapat melakukan _check-in_ kehadiran harian secara digital dalam jendela waktu yang telah ditentukan serta memantau rekap kehadiran melalui tampilan kalender. | |
| Aktor | Peserta Magang | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Magang, hari ini merupakan hari kerja dalam periode aktif program magang, dan pengguna belum melakukan _check-in_ pada hari tersebut. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna mengakses menu "Absensi" melalui navigasi magang. | 2\. Sistem menampilkan halaman absensi yang memuat kalender kehadiran bulan berjalan, status kehadiran setiap hari, informasi jendela waktu absensi, serta ringkasan kehadiran pengguna. |
| 3\. Pengguna meng-klik tombol "_Check-In_ Sekarang" yang tersedia pada waktu absensi yang telah ditentukan. | 4\. Sistem merekam waktu _check-in_ berdasarkan waktu _server_, menyimpan data kehadiran, menetapkan status kehadiran hari tersebut sebagai hadir, dan memperbarui tampilan kalender. |
| 5\. Pengguna menavigasikan kalender untuk melihat rekap kehadiran pada bulan lainnya. | 6\. Sistem menampilkan data kehadiran pada bulan yang dipilih beserta ringkasan jumlah hari hadir dan tidak hadir. |
| Kondisi Akhir | Kehadiran pengguna pada hari tersebut berhasil tercatat dan pengguna dapat memantau rekap kehadiran selama periode magang. | |
| Aksi Alternatif | 1\. Jika waktu saat ini berada di luar jendela absensi, tombol "_Check-In_ Sekarang" tidak aktif dan sistem menampilkan informasi mengenai waktu absensi yang berlaku.<br><br>2\. Jika pengguna telah melakukan _check-in_ pada hari yang sama, tombol "_Check-In_ Sekarang" tidak tersedia dan sistem menampilkan status bahwa absensi telah dilakukan.<br><br>3\. Jika hari tersebut merupakan hari libur resmi, sistem tidak menyediakan opsi _check-in_ dan kalender menampilkan status libur.<br><br>4\. Jika hari yang ditampilkan berada di luar periode program magang, sistem menampilkan penanda bahwa tanggal tersebut tidak termasuk dalam periode magang aktif.<br><br>5\. Jika pengguna belum memiliki riwayat kehadiran, sistem tetap menampilkan kalender dan ringkasan kehadiran dengan nilai awal 0 hari hadir dan 0 hari tidak hadir. | |

Tabel 3.9 Narasi Use Case Melihat dan Mengumpulkan Tugas

| _Use Case_ | Melihat dan Mengumpulkan Tugas | |
| --- | --- | | --- |
| Deskripsi | Peserta Magang dapat melihat daftar tugas yang didistribusikan oleh Mentor, mengakses detail tugas, mengumpulkan hasil pengerjaan dalam bentuk berkas atau tautan URL, serta melakukan revisi dan pengumpulan ulang apabila tugas dikembalikan oleh Mentor sebelum tenggat waktu berakhir. | |
| Aktor | Peserta Magang | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Magang dan terdapat minimal satu tugas yang telah didistribusikan oleh Mentor. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Tugas" dan memilih tugas yang ingin dilihat atau dikumpulkan. | 2\. Sistem menampilkan daftar tugas beserta status masing-masing serta halaman detail tugas yang dipilih, termasuk instruksi pengerjaan, tenggat waktu, dan lampiran referensi dari Mentor. |
| 3\. Pengguna mengisi formulir pengumpulan dengan mengunggah berkas atau memasukkan tautan URL sesuai ketentuan tugas, kemudian meng-klik tombol "Konfirmasi Pengumpulan". | 4\. Sistem memvalidasi data pengumpulan, menyimpan hasil tugas, mengubah status tugas menjadi terkumpul, dan mengirimkan notifikasi kepada Mentor untuk melakukan peninjauan. |
| Kondisi Akhir | Tugas berhasil dikumpulkan, status tugas diperbarui menjadi terkumpul, dan Mentor menerima notifikasi untuk melakukan peninjauan. | |
| Aksi Alternatif | 1\. Jika tenggat waktu telah terlampaui sebelum pengumpulan dilakukan, sistem menampilkan informasi bahwa pengumpulan tugas tidak dapat dilakukan.<br><br>2\. Jika tugas berstatus dikembalikan oleh Mentor dan tenggat waktu belum berakhir, sistem menampilkan umpan balik dari Mentor serta mengaktifkan kembali formulir pengumpulan untuk proses revisi.<br><br>3\. Jika tugas berstatus dikembalikan oleh Mentor tetapi tenggat waktu telah terlewati, sistem tidak mengizinkan pengumpulan ulang.<br><br>4\. Jika format atau ukuran berkas yang diunggah tidak sesuai dengan ketentuan, sistem menolak pengunggahan dan menampilkan pesan kesalahan yang sesuai.<br><br>5\. Jika pengumpulan dilakukan menggunakan tautan URL dan format URL tidak valid, sistem menampilkan pesan kesalahan dan meminta pengguna memperbaiki data yang dimasukkan. | |

Tabel 3.10 Narasi Use Case Melihat Nilai Akhir Magang

| _Use Case_ | Melihat Nilai Akhir Magang | |
| --- | --- | | --- |
| Deskripsi | Peserta Magang dapat melihat hasil penilaian akhir program magang yang diberikan oleh Mentor melalui halaman nilai akhir, yang mencakup nilai numerik, predikat nilai, dan catatan evaluasi apabila tersedia. | |
| Aktor | Peserta Magang | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Peserta Magang. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna mengakses halaman "Nilai Akhir" melalui menu navigasi magang. | 2\. Sistem menampilkan nilai akhir program magang yang meliputi nilai numerik dalam skala 0-100, predikat nilai (A sampai E), serta catatan dari Mentor apabila tersedia. |
| | 3\. Pengguna meninjau informasi nilai akhir yang ditampilkan. | 4\. Sistem menampilkan informasi dalam mode baca-saja sehingga nilai hanya dapat diubah oleh Mentor atau Administrator. |
| Kondisi Akhir | Pengguna mengetahui nilai akhir program magang beserta predikat dan catatan evaluasi yang diberikan oleh Mentor. | |
| Aksi Alternatif | 1\. Jika Mentor belum memberikan nilai akhir, sistem menampilkan informasi bahwa nilai akhir belum tersedia.<br><br>2\. Jika Mentor telah memberikan nilai akhir tetapi belum menambahkan catatan evaluasi, sistem hanya menampilkan nilai numerik dan predikat yang tersedia. | |

Tabel 3.11 Narasi Use Case Melakukan Absensi Harian (Check-In Pribadi)

| _Use Case_ | Melakukan Absensi Harian (_Check-In_ Pribadi) | |
| --- | --- | | --- |
| Deskripsi | Mentor melakukan _check-in_ kehadiran pribadi secara mandiri dalam jendela waktu yang sama dengan peserta magang dan memantau rekap kehadiran pribadinya. | |
| Aktor | Mentor | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Mentor. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Absensi" melalui menu mentor dan meng-klik tombol "_Check-In_ Sekarang". | 2\. Sistem merekam waktu _check-in_ berdasarkan waktu _r_, menyimpan data kehadiran, dan memperbarui kalender sehingga tanggal hari tersebut ditandai sebagai hadir. |
| 3\. Pengguna menavigasikan kalender untuk melihat rekap kehadiran pada bulan lainnya. | 4\. Sistem menampilkan rekap kehadiran pribadi mentor secara bulanan beserta ringkasan kehadiran yang telah tercatat. |
| Kondisi Akhir | _Check-in_ mentor berhasil dicatat dan tercermin pada kalender absensi pribadi. | |
| Aksi Alternatif | 1\. Jika waktu di luar jendela absensi, tombol _check-in_ tidak aktif dan sistem menampilkan keterangan jendela waktu yang berlaku.<br><br>2\. Jika sudah _check-in_ hari ini, sistem menampilkan waktu _check-in_ yang telah tercatat. | |

Tabel 3.12 Narasi Use Case Melihat Absensi Peserta Magang

| _Use Case_ | Melihat Absensi Peserta Magang | |
| --- | --- | | --- |
| Deskripsi | Mentor dapat memantau dan melihat rekap kehadiran peserta magang yang berada dalam batch, bidang, dan kelas bimbingannya berdasarkan tanggal yang dipilih. | |
| Aktor | Mentor | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Mentor dan memiliki kelas magang yang aktif. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Absensi Peserta" melalui menu mentor. | 2\. Sistem menampilkan tabel kehadiran peserta magang pada tanggal hari ini secara _default_ yang memuat nama peserta, waktu _check-in_, dan status kehadiran. |
| 3\. Pengguna memilih tanggal tertentu menggunakan pemilih tanggal untuk melihat rekap kehadiran. | 4\. Sistem memuat dan menampilkan data kehadiran seluruh peserta magang pada tanggal yang dipilih. |
| Kondisi Akhir | Mentor berhasil melihat rekap kehadiran peserta magang yang dibimbingnya sesuai dengan tanggal yang dipilih. | |
| Aksi Alternatif | 1\. Jika tidak terdapat peserta magang dalam _batch_, bidang, dan kelas yang menjadi tanggung jawab mentor, sistem menampilkan informasi bahwa belum ada peserta magang yang terdaftar.<br><br>2\. Jika tanggal yang dipilih merupakan hari libur atau akhir pekan, sistem menampilkan informasi bahwa tidak terdapat aktivitas magang pada tanggal tersebut.<br><br>3\. Jika tidak terdapat data kehadiran pada tanggal yang dipilih, sistem menampilkan informasi bahwa belum ada data absensi yang tersedia. | |

Tabel 3.13 Narasi Use Case Mendistribusikan dan Mengelola Tugas

| _Use Case_ | Mendistribusikan dan Mengelola Tugas | |
| --- | --- | | --- |
| Deskripsi | Mentor dapat membuat tugas baru untuk peserta magang yang berada pada kelas bimbingannya, mengubah informasi tugas yang telah dibuat, serta menghapus tugas beserta seluruh data pengumpulan yang terkait. | |
| Aktor | Mentor | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Mentor dan memiliki kelas magang yang aktif. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Tugas" dan meng-klik tombol "Buat Tugas Baru". Pengguna kemudian mengisi judul, deskripsi, tenggat waktu, serta lampiran opsional berupa berkas atau tautan URL. | 2\. Sistem memvalidasi seluruh data yang dimasukkan. Jika valid, sistem menyimpan tugas, mendistribusikannya kepada peserta magang yang menjadi penerima, dan mengirimkan notifikasi kepada peserta terkait. |
| 3\. Pengguna membuka tugas yang telah dibuat, meng-klik tombol "Edit", melakukan perubahan pada informasi tugas, kemudian menyimpan perubahan tersebut. | 4\. Sistem memperbarui data tugas dan menyimpan seluruh perubahan yang dilakukan. |
| 5\. Pengguna meng-klik tombol "Hapus" pada tugas tertentu dan mengonfirmasi tindakan tersebut. | 6\. Sistem menghapus tugas beserta seluruh data pengumpulan yang terkait dan membersihkan berkas yang tersimpan pada media penyimpanan sistem. |
| Kondisi Akhir | Tugas berhasil dibuat dan didistribusikan kepada peserta magang yang relevan, atau perubahan tugas berhasil disimpan, atau tugas beserta seluruh data terkait berhasil dihapus dari sistem. | |
| Aksi Alternatif | 1\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan tugas.<br><br>2\. Jika format atau ukuran berkas lampiran tidak sesuai dengan ketentuan, sistem menolak unggahan dan menampilkan pesan kesalahan.<br><br>3\. Jika tidak terdapat peserta magang yang menjadi penerima tugas, sistem tetap menyimpan tugas, tetapi tidak mengirimkan notifikasi kepada peserta.<br><br>4\. Jika pengguna membatalkan proses penghapusan pada dialog konfirmasi, sistem tidak menghapus tugas dan tetap menampilkan data tugas yang dipilih. | |

Tabel 3.14 Narasi Use Case Meninjau dan Memberikan Feedback Tugas

| _Use Case_ | Meninjau dan Memberikan _Feedback_ Tugas | |
| --- | --- | | --- |
| Deskripsi | Mentor dapat meninjau hasil pengumpulan tugas dari Peserta Magang dan mengembalikan tugas yang memerlukan perbaikan dengan menyertakan umpan balik sebagai bahan revisi. | |
| Aktor | Mentor | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Mentor dan terdapat minimal satu pengumpulan tugas dengan status terkumpul. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman detail tugas dan memilih hasil pengumpulan dari peserta yang ingin ditinjau. | 2\. Sistem menampilkan daftar pengumpulan tugas yang memuat nama peserta, status pengumpulan, waktu pengumpulan, serta hasil tugas berupa berkas atau tautan URL. |
| 3\. Pengguna meninjau hasil tugas yang dikumpulkan peserta. | 4\. Sistem menampilkan detail hasil pengumpulan beserta informasi pendukung yang tersedia. |
| 5\. Jika tugas memerlukan perbaikan, pengguna meng-klik tombol "Kembalikan", mengisi umpan balik, kemudian mengonfirmasi tindakan tersebut. | 6\. Sistem mengubah status pengumpulan menjadi dikembalikan, menyimpan umpan balik, dan mengirimkan notifikasi kepada peserta magang. |
| Kondisi Akhir | Status pengumpulan tugas diperbarui menjadi dikembalikan, umpan balik tersimpan, dan peserta magang menerima notifikasi untuk melakukan revisi. | |
| Aksi Alternatif | 1\. Jika kolom umpan balik dikosongkan saat pengguna meng-klik tombol "Kembalikan", sistem menampilkan pesan kesalahan dan menolak proses pengembalian tugas.<br><br>2\. Jika hasil pengumpulan tidak dapat diakses karena berkas atau tautan tidak tersedia, sistem menampilkan informasi bahwa hasil tugas tidak dapat ditinjau.<br><br>3\. Jika peserta magang menerima notifikasi pengembalian tugas sebelum tenggat waktu berakhir, peserta dapat melakukan revisi dan mengumpulkan ulang tugas tersebut. | |

Tabel 3.15 Narasi Use Case Memberikan Nilai Akhir Peserta Magang

| _Use Case_ | Memberikan Nilai Akhir Peserta Magang | |
| --- | --- | | --- |
| Deskripsi | Mentor dapat memberikan atau memperbarui nilai akhir kepada setiap Peserta Magang sebagai penilaian menyeluruh terhadap kinerja selama program magang. Penilaian dapat disertai catatan evaluasi yang akan ditampilkan kepada peserta. | |
| Aktor | Mentor | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Mentor dan memiliki peserta magang aktif pada kelas bimbingannya. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Nilai Akhir" melalui menu mentor. | 2\. Sistem menampilkan daftar seluruh Peserta Magang di bawah bimbingan Mentor beserta status nilai akhir masing-masing. |
| 3\. Pengguna meng-klik tombol "Beri Nilai" atau "Edit Nilai" pada peserta yang dipilih, kemudian mengisi nilai akhir dalam rentang 0-100 dan catatan evaluasi apabila diperlukan, lalu meng-klik tombol "Simpan Nilai". | 4\. Sistem memvalidasi data yang dimasukkan, menyimpan nilai akhir, menentukan predikat nilai yang sesuai, memperbarui data penilaian apabila sebelumnya telah ada nilai, dan mengirimkan notifikasi kepada peserta magang. |
| Kondisi Akhir | Nilai akhir berhasil disimpan atau diperbarui, dan peserta magang menerima notifikasi bahwa penilaian telah ditetapkan. | |
| Aksi Alternatif | 1\. Jika nilai yang dimasukkan berada di luar rentang 0-100, sistem menampilkan pesan kesalahan dan menolak proses penyimpanan.<br><br>2\. Jika catatan evaluasi tidak diisi, sistem tetap menyimpan nilai akhir dan hanya menampilkan informasi nilai kepada peserta.<br><br>3\. Jika nilai akhir yang telah diberikan diperbarui oleh mentor, sistem menyimpan nilai terbaru dan mengirimkan notifikasi pembaruan kepada peserta magang. | |

Tabel 3.16 Narasi Use Case Mengelola Data Kursus dan Kurikulum

| _Use Case_ | Mengelola Data Kursus dan Kurikulum | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat membuat, mengubah, menghapus, dan mengelola data kursus beserta kurikulumnya. Pengelolaan kurikulum mencakup pengaturan _sprint_, langkah pembelajaran, materi video, dan kuis hingga kursus siap dipublikasikan ke katalog. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen kursus. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol "Tambah Kursus", mengisi informasi dasar kursus seperti judul, kategori, dan harga, kemudian meng-klik tombol "Buat Kursus". | 2\. Sistem membuat data kursus dengan status _draft_, menghasilkan _slug_ URL berdasarkan judul kursus, dan mengarahkan pengguna ke halaman pengelolaan kursus. |
| 3\. Pengguna melengkapi informasi kursus yang meliputi deskripsi, _thumbnail_, informasi instruktur, manfaat pembelajaran, dan FAQ. | 4\. Sistem menyimpan setiap perubahan data kursus secara bertahap. |
| 5\. Pengguna membuka _tab_ "Kurikulum", kemudian menambah, mengubah, mengurutkan, atau menghapus _sprint_ dan langkah pembelajaran. Untuk langkah bertipe video, pengguna mengunggah video. Untuk langkah bertipe kuis, pengguna menambahkan soal dan pilihan jawaban. | 6\. Sistem menyimpan perubahan struktur kurikulum. Untuk langkah video, sistem mengunggah video ke Bunny.net dan memperbarui status video menjadi siap digunakan setelah proses selesai. Untuk langkah kuis, sistem menyimpan soal, pilihan jawaban, dan jawaban yang benar. |
| 7\. Pengguna mengubah status kursus atau meng-klik tombol "Publikasikan Kursus" setelah seluruh konten selesai disusun. | 8\. Sistem memvalidasi kelengkapan kursus, meliputi _thumbnail_, harga, struktur kurikulum, materi video yang siap digunakan, dan soal kuis yang diperlukan. Jika valid, sistem mengubah status kursus menjadi dipublikasikan sehingga kursus tampil pada katalog. |
| Kondisi Akhir | Data kursus dan kurikulum berhasil disimpan sesuai konfigurasi yang ditetapkan, dan kursus dapat dipublikasikan untuk diakses oleh Peserta Didik. | |
| Aksi Alternatif | 1\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan atau publikasi.<br><br>2\. Jika syarat publikasi belum terpenuhi, sistem menampilkan daftar komponen yang masih harus dilengkapi dan status kursus tetap _draft_.<br><br>3\. Jika proses unggah video gagal, sistem menampilkan informasi kegagalan dan meminta pengguna mengunggah ulang video.<br><br>4\. Jika pengguna menghapus kursus yang belum memiliki peserta maupun transaksi, sistem menghapus data kursus beserta seluruh kurikulumnya.<br><br>5\. Jika kursus yang akan dihapus telah memiliki peserta aktif atau transaksi yang tercatat, sistem menolak proses penghapusan dan menampilkan informasi bahwa kursus tidak dapat dihapus. | |

Tabel 3.17 Narasi Use Case Mengelola Kategori Kursus

| _Use Case_ | Mengelola Kategori Kursus | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat menambah, mengubah, dan menghapus kategori kursus yang digunakan untuk mengelompokkan kursus pada platform. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen kategori. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol "Tambah Kategori", mengisi nama kategori dan deskripsi apabila diperlukan, kemudian meng-klik tombol "Simpan". | 2\. Sistem memvalidasi data yang dimasukkan. Jika valid, sistem menyimpan kategori baru dan menampilkannya pada daftar kategori. |
| 3\. Pengguna meng-klik tombol "Edit" pada kategori tertentu, melakukan perubahan data, kemudian menyimpan perubahan tersebut. | 4\. Sistem memvalidasi perubahan data dan memperbarui informasi kategori. |
| 5\. Pengguna meng-klik tombol "Hapus" pada kategori yang tidak lagi diperlukan dan mengonfirmasi tindakan tersebut. | 6\. Sistem memeriksa keterkaitan kategori dengan data lain. Jika kategori tidak digunakan, sistem menghapus kategori dari sistem. |
| Kondisi Akhir | Kategori berhasil ditambahkan, diperbarui, atau dihapus sesuai dengan tindakan yang dilakukan Administrator. | |
| Aksi Alternatif | 1\. Jika nama kategori yang dimasukkan sudah digunakan oleh kategori lain, sistem menampilkan pesan kesalahan dan menolak proses penyimpanan.<br><br>2\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan.<br><br>3\. Jika kategori masih digunakan oleh kursus atau voucher yang aktif, sistem menolak proses penghapusan dan menampilkan informasi bahwa kategori masih digunakan.<br><br>4\. Jika pengguna membatalkan proses penghapusan pada dialog konfirmasi, sistem tidak menghapus kategori dan tetap menampilkan daftar kategori. | |

Tabel 3.18 Narasi Use Case Mengelola Data Pengguna

| _Use Case_ | Mengelola Data Pengguna | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat membuat akun pengguna baru, mengubah data pengguna, mengelola kata sandi, menonaktifkan akun, serta menghapus akun yang tidak diperlukan. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen pengguna. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna mengakses daftar pengguna dan menggunakan _filter_ berdasarkan peran untuk mempersempit tampilan data. | 2\. Sistem menampilkan daftar pengguna dalam bentuk tabel yang memuat nama, email, peran, status akun, dan tanggal pendaftaran sesuai _filter_ yang diterapkan. |
| 3\. Pengguna meng-klik tombol "Tambah Pengguna", memilih peran pengguna, mengisi data yang diperlukan, kemudian menyimpan data tersebut. | 4\. Sistem memvalidasi data yang dimasukkan dan membuat akun baru. Untuk akun Peserta Magang dan Mentor, sistem menyimpan informasi _batch_, bidang, dan kelas. Untuk akun Peserta Didik, sistem mengaktifkan mekanisme wajib mengganti kata sandi saat _login_ pertama. |
| 5\. Pengguna meng-klik tombol "Edit" pada akun yang dipilih, melakukan perubahan data atau mengatur ulang kata sandi, kemudian menyimpan perubahan. | 6\. Sistem memvalidasi perubahan dan memperbarui data pengguna. Jika kata sandi diubah, sistem menerapkan kebijakan perubahan kata sandi sesuai peran pengguna. |
| 7\. Pengguna meng-klik tombol "Nonaktifkan" atau "Hapus" pada akun tertentu dan mengonfirmasi tindakan tersebut. | 8\. Sistem menonaktifkan akun dengan mencabut sesi aktif pengguna atau melakukan _soft delete_ sehingga data historis tetap tersimpan untuk keperluan audit. |
| Kondisi Akhir | Data pengguna berhasil dibuat, diperbarui, dinonaktifkan, atau dihapus sesuai dengan tindakan yang dilakukan Administrator. | |
| Aksi Alternatif | 1\. Jika alamat email yang dimasukkan telah terdaftar pada sistem, sistem menampilkan pesan kesalahan dan menolak proses penyimpanan.<br><br>2\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan.<br><br>3\. Jika kapasitas kelas telah mencapai batas yang ditentukan, sistem menolak penambahan akun Peserta Magang pada kelas tersebut dan menampilkan informasi yang sesuai.<br><br>4\. Jika pengguna membatalkan proses penonaktifan atau penghapusan pada dialog konfirmasi, sistem tidak melakukan perubahan terhadap akun yang dipilih. | |

Tabel 3.19 Narasi Use Case Mengelola Transaksi

| _Use Case_ | Mengelola Transaksi | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat memantau seluruh riwayat transaksi pembelian kursus, melihat detail transaksi, serta melakukan pengelolaan transaksi sesuai kewenangan yang tersedia pada sistem. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen transaksi. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman Transaksi dan menggunakan pencarian atau _filter_ berdasarkan status, rentang tanggal, kursus, atau pengguna. | 2\. Sistem menampilkan daftar transaksi sesuai _filter_ yang diterapkan, meliputi informasi pembeli, kursus, jumlah pembayaran, tanggal transaksi, dan status transaksi. |
| 3\. Pengguna memilih salah satu transaksi untuk melihat informasi secara rinci. | 4\. Sistem menampilkan informasi lengkap transaksi yang dipilih, termasuk detail pesanan dan riwayat status transaksi. |
| 5\. Pengguna melakukan tindakan yang tersedia pada transaksi, seperti menambahkan catatan, membatalkan transaksi, atau menghapus data transaksi sesuai kebutuhan. | 6\. Sistem memproses tindakan yang dipilih pengguna dan memperbarui data transaksi sesuai ketentuan yang berlaku pada sistem. |
| Kondisi Akhir | Data transaksi berhasil ditampilkan atau dikelola sesuai tindakan yang dilakukan oleh Administrator. | |
| Aksi Alternatif | 1\. Jika transaksi telah berstatus Berhasil, sistem menolak perubahan status transaksi dan menampilkan informasi bahwa status tersebut bersifat _final_.<br><br>2\. Jika data transaksi yang dicari tidak ditemukan, sistem menampilkan informasi bahwa tidak terdapat transaksi yang sesuai dengan kriteria pencarian. | |

Tabel 3.20 Narasi Use Case Mengelola Voucher Diskon

| _Use Case_ | Mengelola Voucher Diskon | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat membuat, mengubah, mengaktifkan, menonaktifkan, dan menghapus voucher diskon yang dapat digunakan oleh Peserta Didik saat melakukan pembelian kursus. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen voucher. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol "Buat Voucher", kemudian mengisi kode voucher, jenis diskon, nilai diskon, batas penggunaan, periode berlaku, dan pembatasan lain yang tersedia. | 2\. Sistem memvalidasi data yang dimasukkan dan menampilkan formulir pembuatan voucher. |
| 3\. Pengguna meng-klik tombol "Simpan" untuk menyimpan konfigurasi voucher. | 4\. Sistem memvalidasi keunikan kode voucher dan menyimpan data voucher ke dalam basis data. |
| 5\. Pengguna meng-klik tombol "Edit", "Aktifkan", "Nonaktifkan", atau "Hapus" pada voucher yang dipilih, kemudian mengonfirmasi tindakan tersebut. | 6\. Sistem memperbarui konfigurasi atau status voucher sesuai tindakan yang dilakukan. Jika voucher dihapus, sistem menghapus data voucher yang dipilih. |
| Kondisi Akhir | Data voucher berhasil dibuat, diperbarui, diaktifkan, dinonaktifkan, atau dihapus sesuai tindakan Administrator. | |
| Aksi Alternatif | 1\. Jika kode voucher yang dimasukkan telah digunakan oleh voucher lain, sistem menampilkan pesan kesalahan dan menolak proses penyimpanan.<br><br>2\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan.<br><br>3\. Jika voucher telah digunakan pada transaksi, sistem menolak proses penghapusan dan menampilkan informasi bahwa voucher tidak dapat dihapus.<br><br>4\. Jika pengguna membatalkan tindakan pada dialog konfirmasi, sistem tidak melakukan perubahan terhadap voucher yang dipilih. | |

Tabel 3.21 Narasi Use Case Mengelola Sertifikat

| _Use Case_ | Mengelola Sertifikat | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat memantau sertifikat yang telah diterbitkan oleh sistem, mengunduh atau memverifikasi sertifikat tertentu, serta mengatur masa berlaku sertifikat secara global. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen sertifikat. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Sertifikat" dan menggunakan fitur pencarian atau _filter_ untuk menemukan sertifikat yang diinginkan. | 2\. Sistem menampilkan daftar sertifikat yang telah diterbitkan beserta informasi nomor sertifikat, nama penerima, nama kursus, tanggal terbit, dan status validitas sertifikat. |
| 3\. Pengguna meng-klik tombol "Unduh PDF" atau "Verifikasi" pada sertifikat yang dipilih. | 4\. Sistem mengunduh _file_ PDF sertifikat atau menampilkan halaman verifikasi sertifikat sesuai tindakan yang dipilih. |
| | 5\. Pengguna mengubah konfigurasi masa berlaku sertifikat dan menyimpan perubahan. | 6\. Sistem menyimpan konfigurasi masa berlaku sertifikat dan menerapkannya pada sertifikat yang diterbitkan setelah konfigurasi tersebut disimpan. |
| Kondisi Akhir | Administrator berhasil memantau data sertifikat dan konfigurasi masa berlaku sertifikat berhasil diperbarui. | |
| Aksi Alternatif | 1\. Jika pencarian atau _filter_ tidak menemukan sertifikat yang sesuai, sistem menampilkan informasi bahwa tidak terdapat data yang cocok.<br><br>2\. Jika pengguna membatalkan perubahan konfigurasi sebelum disimpan, sistem tidak melakukan perubahan pada pengaturan masa berlaku sertifikat. | |

Tabel 3.22 Narasi Use Case Mengelola Gamifikasi (EXP Rules dan Badge)

| _Use Case_ | Mengelola Gamifikasi (EXP _rules_ dan _Badge_) | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat meninjau aturan gamifikasi yang berlaku pada sistem serta mengelola _badge_ yang dapat diperoleh Peserta Didik berdasarkan aktivitas tertentu. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen gamifikasi. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman "Aturan EXP" untuk meninjau aturan pemberian poin dan _level_ yang berlaku pada sistem. | 2\. Sistem menampilkan informasi aturan pemberian EXP, _level_, dan hadiah yang berlaku dalam mode baca saja. |
| 3\. Pengguna membuka halaman "Manajemen _Badge_", kemudian meng-klik tombol "Tambah _Badge_" dan mengisi informasi _badge_ yang diperlukan, seperti nama, deskripsi, jenis pemicu, ambang batas, dan ikon. | 4\. Sistem memvalidasi data yang dimasukkan dan menyimpan _badge_ baru. _Badge_ akan diberikan secara otomatis kepada pengguna yang memenuhi ketentuan yang ditetapkan. |
| 5\. Pengguna meng-klik tombol "Edit" atau "Hapus" pada _badge_ yang dipilih dan mengonfirmasi tindakan tersebut. | 6\. Sistem memperbarui atau menghapus data _badge_ sesuai tindakan yang dilakukan. |
| | 7\. Pengguna melihat data gamifikasi pengguna yang tersedia pada sistem. | 8\. Sistem menampilkan informasi EXP, _level_, dan _badge_ yang dimiliki oleh pengguna. |
| Kondisi Akhir | Data _badge_ berhasil dikelola sesuai kebutuhan dan aturan gamifikasi berhasil ditinjau oleh Administrator. | |
| Aksi Alternatif | 1\. Jika data badge yang dimasukkan tidak lengkap, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan.<br><br>2\. Jika ikon _badge_ yang diunggah tidak memenuhi ketentuan format atau ukuran yang ditetapkan, sistem menolak unggahan dan menampilkan pesan kesalahan.<br><br>3\. Jika pengguna membatalkan proses penghapusan pada dialog konfirmasi, sistem tidak menghapus _badge_ yang dipilih. | |

Tabel 3.23 Narasi _Use Case_ Memantau dan Mengedit Data Absensi Magang

| _Use Case_ | Memantau dan Mengedit Data Absensi Magang | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat memantau rekap kehadiran Mentor dan Peserta Magang dari seluruh kelas, serta melakukan koreksi status kehadiran secara manual apabila diperlukan. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman manajemen absensi magang. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman absensi Mentor atau absensi Peserta Magang, kemudian memilih tanggal dan menerapkan _filter_ berdasarkan _batch_, bidang, atau kelas apabila diperlukan. | 2\. Sistem menampilkan data kehadiran sesuai _filter_ yang dipilih, yang memuat nama pengguna, kelas, waktu _check-in_, dan status kehadiran. |
| 3\. Pengguna memilih data absensi tertentu yang perlu dikoreksi dan mengubah statusnya secara manual. | 4\. Sistem menyimpan perubahan status absensi beserta mencatat identitas Administrator yang melakukan perubahan sebagai bagian dari _audit log_. |
| Kondisi Akhir | Data kehadiran berhasil diperbarui dan seluruh perubahan tercatat pada _audit log_. | |
| Aksi Alternatif | 1\. Jika tidak terdapat data kehadiran yang sesuai dengan _filter_ yang dipilih, sistem menampilkan informasi bahwa data tidak ditemukan.<br><br>2\. Jika Administrator mencoba mengubah data kehadiran pada tanggal yang akan datang, sistem tidak menyediakan opsi pengeditan dan menampilkan informasi bahwa koreksi hanya dapat dilakukan pada hari kerja yang telah berlalu. | |

Tabel 3.24 Narasi Use Case Mengelola Konfigurasi Magang (Batch, Bidang, dan Kelas)

| _Use Case_ | Mengelola Konfigurasi Magang (_Batch_, Bidang, dan Kelas) | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat mengelola data _Batch_, Bidang, dan Kelas yang digunakan sebagai struktur program magang serta sebagai dasar pengelompokan Peserta Magang dan Mentor. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman konfigurasi magang. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman konfigurasi magang dan mengelola data _Batch_ dengan menambah atau mengubah informasi yang diperlukan. | 2\. Sistem menampilkan daftar _Batch_ yang tersedia serta menyimpan perubahan data _Batch_ yang dilakukan. |
| 3\. Pengguna mengelola data Bidang dengan memilih _Batch_ yang terkait, kemudian menambah atau mengubah data Bidang. | 4\. Sistem menyimpan data Bidang dan mengaitkannya dengan _Batch_ yang dipilih. |
| 5\. Pengguna mengelola data Kelas dengan memilih _Batch_ dan Bidang yang terkait, kemudian menambah atau mengubah data Kelas. | 6\. Sistem menyimpan data Kelas dan mengaitkannya dengan _Batch_ serta Bidang yang dipilih. |
| 7\. Pengguna meng-klik tombol "Hapus" pada data _Batch_, Bidang, atau Kelas yang tidak diperlukan dan mengonfirmasi tindakan tersebut. | 8\. Sistem memeriksa keterkaitan data yang akan dihapus. Jika tidak terdapat data aktif yang bergantung, sistem menghapus data tersebut. |
| Kondisi Akhir | Data _Batch_, Bidang, dan Kelas berhasil dikelola dan tersedia untuk digunakan dalam pengelompokan Peserta Magang dan Mentor. | |
| Aksi Alternatif | 1\. Jika nama Bidang yang dimasukkan sudah digunakan pada _Batch_ yang sama, sistem menampilkan pesan kesalahan dan menolak penyimpanan.<br><br>2\. Jika data yang akan dihapus masih digunakan oleh Peserta Magang, Mentor, atau data aktif lainnya, sistem menolak penghapusan dan menampilkan informasi keterkaitan data tersebut.<br><br>3\. Jika terdapat data wajib yang belum diisi, sistem menampilkan pesan kesalahan dan tidak memproses penyimpanan. | |

Tabel 3.25 Narasi Use Case Memantau dan Mengelola Tugas Magang

| _Use Case_ | Memantau dan Mengelola Tugas Magang | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat memantau tugas magang dari berbagai kelas, mengubah informasi tugas, menghapus tugas, serta menyesuaikan status pengumpulan peserta apabila diperlukan. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman pemantauan tugas magang. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman tugas magang dan menerapkan _filter_ berdasarkan _batch_, bidang, kelas, atau status tugas untuk menemukan data yang diinginkan. | 2\. Sistem menampilkan daftar tugas sesuai _filter_ yang dipilih beserta informasi judul tugas, kelas, tenggat waktu, dan status tugas. |
| 3\. Pengguna memilih salah satu tugas untuk melihat detail tugas dan rekap pengumpulan peserta. | 4\. Sistem menampilkan detail tugas beserta data pengumpulan peserta. |
| 5\. Pengguna memilih tindakan yang diperlukan, seperti mengubah data tugas, menyesuaikan status pengumpulan peserta, atau menghapus tugas. | 6\. Sistem memproses tindakan yang dipilih dan menyimpan perubahan pada data tugas atau data pengumpulan peserta. |
| Kondisi Akhir | Administrator berhasil memantau dan mengelola data tugas magang sesuai kebutuhan. | |
| Aksi Alternatif | Jika status pengumpulan peserta diubah menjadi terkumpul namun peserta belum mengunggah berkas atau tautan, sistem tetap menyimpan perubahan status dan menampilkan keterangan "tanpa berkas". | |

Tabel 3.26 Narasi Use Case Mengelola Nilai Akhir Magang

| _Use Case_ | Mengelola Nilai Akhir Magang | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat memantau nilai akhir seluruh Peserta Magang serta melakukan perubahan terhadap nilai yang telah ditetapkan oleh Mentor dengan menyertakan alasan perubahan. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman nilai akhir magang. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna membuka halaman nilai akhir magang dan menggunakan fitur pencarian atau _filter_ untuk menemukan peserta yang akan diubah nilainya, kemudian meng-klik tombol "Edit Nilai". | 2\. Sistem menampilkan daftar nilai akhir seluruh Peserta Magang serta menampilkan formulir perubahan nilai yang memuat nilai saat ini, nilai baru, catatan, alasan perubahan, dan _toggle_ opsi penguncian nilai. |
| 3\. Pengguna mengisi nilai baru, catatan apabila diperlukan, alasan perubahan wajib, serta memilih status kunci nilai (secara _default_ tercentang/aktif), kemudian meng-klik tombol "Simpan". | 4\. Sistem memperbarui data nilai akhir peserta, menyimpan status penguncian nilai (isLocked), menyimpan alasan perubahan terakhir, mengirimkan notifikasi kepada Mentor terkait perubahan nilai, dan mencatat seluruh perubahan ke dalam _audit log_. |
| Kondisi Akhir | Nilai akhir peserta berhasil diperbarui, status penguncian nilai diterapkan (mencegah Mentor mengubah nilai kembali), dan seluruh perubahan tercatat dalam _audit log_. | |
| Aksi Alternatif | 1\. Jika alasan perubahan tidak diisi, sistem menampilkan pesan kesalahan dan tidak memproses perubahan nilai.<br><br>2\. Jika pengguna membatalkan proses perubahan sebelum disimpan, sistem tidak melakukan perubahan pada data nilai peserta.<br><br>3\. Jika Mentor mencoba mengubah nilai peserta yang statusnya telah dikunci oleh Administrator, sistem menolak request dengan respons 403 _Forbidden_ dan pada antarmuka Mentor tombol edit digantikan oleh indikator "_Overridden!"._ | |

Tabel 3.27 Narasi Use Case Konfigurasi Jam Kerja dan Tanggal Libur

| _Use Case_ | Konfigurasi Jam Kerja dan Tanggal Libur | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat mengelola daftar tanggal libur yang berlaku pada program magang. Tanggal yang ditetapkan sebagai hari libur akan dikecualikan dari perhitungan kehadiran peserta magang dan mentor. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman konfigurasi jam kerja, _tab_ Tanggal Libur. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol Tambah Libur, kemudian mengisi keterangan, jumlah hari libur, dan tanggal mulai, lalu menyimpan data. | 2\. Sistem menghitung tanggal berakhir secara otomatis berdasarkan tanggal mulai dan jumlah hari libur, kemudiann menyimpan data. Hari yang berada dalam rentang tersebut akan dikecualikan dari perhitungan kehadiran. |
| 3\. Pengguna meng-klik tombol Edit pada data libur yang berstatus Akan Datang untuk mengubah informasi yang diperlukan, atau meng-klik tombol Akhiri Lebih Awal pada data libur yang berstatus Sedang Berjalan untuk menentukan tanggal berakhir yang baru. | 4\. Sistem mmenyimpan perubahan data libur. Untuk tindakan Akhiri Lebih Awal, sistem hanya memperbolehkan pengurangan rentang waktu libur dan tidak memperbolehkan perpanjangan periode yang telah ditetapkan. Data libur yang berstatus Sudah Selesai tidak dapat diubah. |
| 5\. Pengguna meng-klik tombol Hapus pada data libur yang berstatus Akan Datang, kemudian mengkonfirmasi penghapusan. | 6\. Sistem menghapus data libur yang dipilih. Hari yang sebelumnya ditetapkan sebagai hari libur akan kembali dihitung sebagai hari kerja. |
| Kondisi Akhir | Data tanggal libur berhasil dikelola dan perubahan yang dilakukan akan diterapkan pada sistem absensi peserta magang dan mentor. | |
| Aksi Alternatif | 1\. Jika tanggal mulai yang dimasukkan lebih awal dari tanggal saat ini, sistem menolak penyimpanan dan menampilkan pesan bahwa tanggal libur tidak dapat dibuat untuk periode yang telah berlalu.<br><br>2\. Jika data libur berstatus Sudah Selesai, sistem tidak menampilkan opsi Edit ataupun Hapus. | |

Tabel 3.28 Narasi Use Case Mengelola Akun Administrator

| _Use Case_ | Mengelola Akun Administrator | |
| --- | --- | | --- |
| Deskripsi | Administrator dapat mengundang administrator baru melalui tautan undangan yang memiliki batas waktu penggunaan, serta mengelola akun administrator yang telah terdaftar dalam sistem. | |
| Aktor | Administrator | |
| Kondisi Awal | Pengguna telah masuk ke dalam sistem sebagai Administrator dan berada pada halaman pengelolaan akun administrator. | |
| Aksi Utama | Tindakan Aktor | Reaksi Sistem |
| 1\. Pengguna meng-klik tombol Undang Administrator, kemudian memasukkan alamat email calon administrator dan mengirimkan undangan. | 2\. Sistem membuat tautan undangan yang berlaku selama 24 jam dan mengirimkannya ke alamat email yang ditentukan. |
| 3\. Calon administrator membuka tautan undangan yang diterima melalui email, mengisi data akun yang diperlukan, lalu mengonfirmasi pendaftaran. | 4\. Sistem memverifikasi validitas tautan undangan. Jika valid, sistem membuat akun administrator baru dan mengarahkan pengguna ke halaman _Login_. |
| 5\. Pengguna memilih akun administrator yang ingin dikelola, kemudian melakukan tindakan Nonaktifkan, Hapus, atau Batalkan Undangan. | 6\. Sistem memverifikasi bahwa masih terdapat minimal satu administrator aktif dalam sistem. Jika syarat terpenuhi, sistem memproses tindakan yang dipilih dan memperbarui status akun yang bersangkutan. |
| Kondisi Akhir | Administrator baru berhasil ditambahkan ke dalam sistem, atau data akun administrator berhasil dikelola sesuai tindakan yang dilakukan. | |
| Aksi Alternatif | 1\. Jika tindakan penonaktifan atau penghapusan menyebabkan tidak ada administrator aktif yang tersisa, sistem menolak tindakan tersebut dan menampilkan pesan peringatan.<br><br>2\. Jika tautan undangan telah kedaluwarsa atau sudah digunakan sebelumnya, sistem menampilkan pesan bahwa undangan tidak lagi valid dan pengguna harus meminta undangan baru. | |

Untuk memberikan gambaran yang lebih mendetail mengenai rancangan sistem yang diusulkan, digunakan _activity diagram_ sebagai alat pemodelan proses pada platform pembelajaran digital NextLevel Academy. Pemodelan ini dilakukan dengan terlebih dahulu mengidentifikasi seluruh aktor yang terlibat dalam sistem, yakni Peserta Didik, Peserta Magang, Mentor, dan Administrator, kemudian memetakan alur kerja masing-masing fungsionalitas secara sistematis mencakup titik awal aktivitas, perpindahan antar aktor, rangkaian aktivitas yang terjadi selama proses berlangsung, hingga kondisi yang menandai berakhirnya suatu alur. Berikut _activity diagram_ dari platform pembelajaran digital NextLevel Academy:

1. _Login_

Gambar 3.5 Activity Diagram Login

1. Melihat Katalog dan Detail Kursus

Gambar 3.6 Activity Diagram Melihat Katalog dan Detail Kursus

1. Melakukan Pembelian Kursus

Gambar 3.7 Activity Diagram Melakukan Pembelian Kursus

1. Mengakses dan Menonton Materi Video

Gambar 3.8 Activity Diagram Mengakses dan Menonton Materi Video

1. Mengerjakan Kuis

Gambar 3.9 Activity Diagram Mengerjakan Kuis

1. Mengklaim dan Mengunduh Sertifikat

Gambar 3.10 Activity Diagram Mengklaim dan Mengunduh Sertifikat

1. Melihat EXP, _Level_, _Badge_, dan Klaim Voucher _Reward_

Gambar 3.11 Activity Diagram Melihat EXP, Level, Badge, dan Klaim Voucher Reward

1. Melihat dan Melakukan Absensi

Gambar 3.12 Activity Diagram Melihat dan Melakukan Absensi

1. Melihat dan Mengumpulkan Tugas

Gambar 3.13 Activity Diagram Melihat dan Mengumpulkan Tugas

1. Melihat Nilai Akhir Magang

Gambar 3.14 Activity Diagram Melihat Nilai Akhir Magang

1. Melakukan Absensi Harian (_Check-In_ Pribadi)

Gambar 3.15 Activity Diagram Melakukan Absensi Harian (Check-In Pribadi)

1. Melihat Absensi Peserta Magang

Gambar 3.16 Activity Diagram Melihat Absensi Peserta Magang

1. Mendistribusikan dan Mengelola Tugas

Gambar 3.17 Activity Diagram Mendistribusikan dan Mengelola Tugas

1. Meninjau dan Memberikan _Feedback_ Tugas

Gambar 3.18 Activity Diagram Meninjau dan Memberikan Feedback Tugas

1. Memberikan Nilai Akhir Peserta Magang

Gambar 3.19 Activity Diagram Memberikan Nilai Akhir Peserta Magang

1. Mengelola Data Kursus dan Kurikulum

Gambar 3.20 Activity Diagram Mengelola Data Kursus dan Kurikulum

1. Mengelola Kategori Kursus

Gambar 3.21 Activity Diagram Mengelola Kategori Kursus

1. Mengelola Data Pengguna

Gambar 3.22 Activity Diagram Mengelola Data Pengguna

1. Mengelola Transaksi

Gambar 3.23 Activity Diagram Mengelola Transaksi

1. Mengelola Voucher Diskon

Gambar 3.24 Activity Diagram Mengelola Voucher Diskon

1. Mengelola Sertifikat

Gambar 3.25 Activity Diagram Mengelola Sertifikat

1. Mengelola Gamifikasi (EXP _Rules_ dan _Badge_)

Gambar 3.26 Activity Diagram Mengelola Gamifikasi (EXP Rules dan Badge)

1. Memantau dan Mengedit Data Absensi Magang

Gambar 3.27 Activity Diagram Memantau dan Mengedit Data Absensi Magang

1. Mengelola Konfigurasi Magang (_Batch_, Bidang, dan Kelas)

Gambar 3.28 Activity Diagram Mengelola Konfigurasi Magang (Batch, Bidang, dan Kelas)

1. Memantau dan Mengelola Tugas Magang

Gambar 3.29 Activity Diagram Memantau dan Mengelola Tugas Magang

1. Mengelola Nilai Akhir Magang

Gambar 3.30 Activity Diagram Mengelola Nilai Akhir Magang

1. Konfigurasi Jam Kerja dan Tanggal Libur

Gambar 3.31 Activity Diagram Konfigurasi Jam Kerja dan Tanggal Libur

1. Mengelola Akun Administrator

Gambar 3.32 Activity Diagram Mengelola Akun Administrator

## 3.3 Analisis Kebutuhan Non-Fungsional

Kebutuhan non-fungsional merupakan spesifikasi yang mendefinisikan standar kualitas yang harus dipenuhi oleh sistem, mencakup bagaimana sistem beroperasi, bukan hanya apa yang sistem lakukan. Analisis kebutuhan non-fungsional pada penelitian ini menggunakan standar ISO/IEC 25010 yang merupakan standar internasional untuk kualitas produk perangkat lunak. Standar ini dipilih karena dirancang secara khusus untuk menspesifikasikan karakteristik kualitas sistem perangkat lunak secara terstruktur dan terukur, sehingga sesuai dengan kebutuhan pengembangan platform pembelajaran digital berbasis web ini.

Dari delapan karakteristik yang didefinisikan dalam ISO/IEC 25010, dipilih enam karakteristik yang relevan dengan kebutuhan dan ruang lingkup sistem yang dikembangkan, yaitu _Performance Efficiency, Usability, Reliability, Security, Portability,_ dan _Compatibility_. Kebutuhan non-fungsional sistem dijabarkan pada Tabel 3.26 berikut.

Tabel 3.29 Kebutuhan Non-Fungsional

| **Karakteristik**        | **Penjelasan**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _Performance Efficiency_ | Sistem mampu menampilkan halaman kepada pengguna dengan waktu muat yang cepat, dengan target halaman dapat ditampilkan dalam waktu kurang dari 2,5 detik. Konten video pembelajaran dapat diputar dengan lancar tanpa memerlukan waktu tunggu yang lama. Sistem juga mampu memproses permintaan dari pengguna dan memberikan respons secara tepat waktu.                                                                                                                                                                                                                                 |
| _Usability_              | Sistem menyediakan antarmuka yang intuitif dan mudah digunakan oleh keempat aktor sistem sesuai dengan peran dan kebutuhan masing-masing. Sistem memberikan umpan balik yang jelas kepada pengguna atas setiap tindakan yang dilakukan, termasuk pesan validasi, notifikasi keberhasilan, dan pesan kesalahan yang deskriptif. Tampilan antarmuka dirancang responsif sehingga dapat digunakan dengan nyaman pada perangkat desktop maupun _mobile_.                                                                                                                                     |
| _Reliability_            | Sistem mampu menjalankan seluruh fungsi utama secara konsisten dan tersedia untuk diakses oleh pengguna tanpa gangguan yang berarti. Sistem mampu menangani alur kritis seperti proses transaksi pembayaran, pencatatan absensi harian, dan pengumpulan tugas secara andal tanpa kehilangan atau duplikasi data.                                                                                                                                                                                                                                                                         |
| _Security_               | Sistem menerapkan autentikasi dan otorisasi berbasis peran untuk memastikan setiap aktor hanya dapat mengakses fitur dan data sesuai dengan haknya. Akses terhadap konten video pembelajaran dilindungi sehingga konten tidak dapat diakses secara langsung tanpa verifikasi kepemilikan kursus. Sistem menerapkan pembatasan percobaan _login_ untuk mencegah akses tidak sah. Validasi input diterapkan pada sisi _frontend_ maupun _backend_ untuk mencegah serangan injeksi dan manipulasi data. Seluruh komunikasi antara pengguna dan sistem dilakukan melalui protokol yang aman. |
| _Portability_            | Sistem dapat diakses dan berfungsi dengan baik pada berbagai perangkat, termasuk komputer desktop, laptop, dan perangkat _mobile_ dengan berbagai ukuran layar. Seluruh halaman dirancang menggunakan pendekatan _web-responsive_ sehingga tata letak antarmuka menyesuaikan diri secara otomatis terhadap ukuran layar perangkat yang digunakan.                                                                                                                                                                                                                                        |
| _Compatibility_          | Sistem dapat berjalan dengan baik pada berbagai browser utama yang umum digunakan, yaitu Google Chrome, Microsoft Edge, Brave, dan browser bawaan perangkat mobile. Sistem tidak memerlukan instalasi perangkat lunak tambahan pada sisi pengguna karena seluruh fungsionalitas diakses melalui _web_ _browser_ standar.                                                                                                                                                                                                                                                                 |

## 3.4 Perancangan Sistem

Tahapan selanjutnya setelah menganalisis masalah pada sistem yang berjalan adalah tahapan perancangan sistem yang bertujuan untuk mengatasi permasalahan yang ada dan usulan rancangan sistem.

## 3.4.1 Perancangan Antarmuka Pengguna

Perancangan tampilan atau antar muka merupakan tahapan untuk membuat tampilan atau desain dari sistem yang akan dibuat. Perancangan tampilan dari sistem yang akan dibangun adalah tampilan untuk _web_.

## 3.4.1.1 Perancangan Antarmuka Pengguna Semua Aktor

Perancangan antarmuka pengguna semua aktor pada aplikasi ini adalah sebagai berikut:

1. Halaman _Login_

Halaman ini berfungsi sebagai antarmuka utama bagi pengguna untuk memverifikasi identitas mereka dan mengakses sistem, baik melalui kredensial standar (email dan kata sandi) maupun melalui otentikasi pihak ketiga.

Gambar 3.33 Perancangan Halaman _Login_

Keterangan:

1. Kolom input email.
2. Kolom input _password_ untuk autentikasi.
3. _Icon button_ untuk menampilkan atau menyembunyikan karakter _password_.
4. Tautan untuk menuju halaman lupa _password_.
5. _Primary button_ untuk masuk ke akun.
6. Tautan untuk menuju halaman registrasi akun baru.
7. Halaman Lupa _Password_

Halaman ini berfungsi untuk membantu pengguna memulihkan akses akun melalui pengiriman tautan reset ke email terdaftar.

Gambar 3.34 Perancangan Halaman Lupa _Password_

Keterangan:

1. Kolom input email untuk mengirim tautan reset _password_.
2. _Primary button_ untuk mengirim _link_ reset ke email.
3. Informasi panduan untuk memeriksa _folder_ _Spam_ atau Promosi jika email tidak ditemukan di kotak masuk.
4. Tautan untuk kembali ke halaman _login._
5. Halaman Pengaturan

Halaman pengaturan berfungsi sebagai pusat kontrol untuk mengelola identitas pribadi, keamanan akun, dan preferensi notifikasi pada sistem LMS, sehingga pengguna dapat menyesuaikan akun sesuai kebutuhan secara mandiri.

Gambar 3.35 Perancangan Halaman Pengaturan

Keterangan:

1. Tombol untuk mengunggah atau mengubah foto profil.
2. Tombol untuk menghapus foto profil.
3. Kolom input untuk memperbarui informasi profil _username_.
4. Kolom input untuk memperbarui informasi profil nama lengkap.
5. Kolom email yang bersifat _read-only_ karena terhubung ke akun utama.
6. Kolom input untuk memperbarui informasi profil nomor telepon.
7. _Form_ ganti kata sandi yang terdiri dari input kata sandi saat ini, kata sandi baru, dan konfirmasi kata sandi baru.
8. Tombol untuk menyimpan perubahan sandi.
9. _Toggle_ untuk mengaktifkan atau menonaktifkan preferensi notifikasi email.
10. _Toggle_ untuk mengaktifkan atau menonaktifkan preferensi pengingat belajar.
11. _Primary button_ untuk menyimpan seluruh perubahan profil.

## 3.4.1.2 Perancangan Antarmuka Pengguna Peserta Didik

Perancangan antarmuka pengguna peserta didik pada aplikasi ini adalah sebagai berikut:

1. Halaman _Dashboard_

Halaman _dashboard_ berfungsi sebagai pusat informasi utama setelah pengguna masuk ke sistem LMS dengan menampilkan ringkasan progres belajar, rekomendasi kursus, serta akses cepat untuk melanjutkan pembelajaran. Tata letak dirancang dengan navigasi _sidebar_ dan informasi utama di bagian utama untuk memudahkan pengguna dalam memantau aktivitas dan berpindah fitur secara efisien.

Gambar 3. Perancangan Halaman _Dashboard_

Keterangan:

1. Tombol menu navigasi menuju _Dashboard._
2. Tombol menu navigasi menuju Kursus Saya.
3. Tombol menu navigasi menuju Sertifikat.
4. Tombol menu navigasi menuju _Level & Badges._
5. Tombol menu navigasi menuju Transaksi.
6. Tombol menu navigasi menuju Pengaturan.
7. Tombol untuk _logout_ dari akun.
8. Indikator _level_ saat ini, hover untuk melihat progres EXP pengguna (EXP saat ini / EXP yang dibutuhkan untuk naik _level_).
9. _Icon button_ untuk mengubah mode tampilan _dark/light._
10. _Icon button_ untuk membuka panel notifikasi.
11. Nama dan _role_ pengguna yang sedang _login_, beserta avatar sebagai akses menuju profil.
12. Kartu ringkasan yang menampilkan total kursus dimiliki.
13. Kartu ringkasan yang menampilkan jumlah kursus yang sedang dikerjakan.
14. Kartu ringkasan yang menampilkan jumlah sertifikat yang diperoleh.
15. Kartu kursus yang sedang dikerjakan, menampilkan _progress bar_ persentase penyelesaian kursus beserta _sprint_ yang sedang aktif.
16. Tombol untuk melanjutkan belajar.
17. Kartu kursus pada bagian rekomendasi, menampilkan _thumbnail_, kategori, judul, dan harga kursus.
18. Tombol navigasi menuju halaman detail kursus.
19. Tautan untuk menuju halaman katalog kursus lengkap.
20. Halaman Kursus Saya

Halaman Kursus Saya berfungsi untuk menampilkan dan mengelola seluruh kursus yang diikuti pengguna, dilengkapi dengan fitur pencarian dan _filter_ berdasarkan status progres. Setiap kursus disajikan dalam bentuk kartu yang menampilkan informasi ringkas serta tombol aksi untuk melanjutkan atau meninjau ulang pembelajaran, sehingga pengguna dapat mengakses dan mengontrol proses belajar secara efisien dan

terarah.

Gambar 3.37 Perancangan Halaman Kursus Saya

Keterangan:

1. Input pencarian untuk menyaring kursus berdasarkan judul.
2. Tombol _filter_ untuk menampilkan kursus berdasarkan status: Semua, _In-Progress_, atau Selesai.
3. Kartu kursus yang menampilkan _thumbnail_, kategori, judul, dan _sprint_ yang sedang aktif.
4. _Progress bar_ persentase penyelesaian.
5. Tombol untuk melanjutkan belajar.
6. Tombol meninjau ulang kursus.
7. _Badge_ status "Selesai" pada kursus yang telah diselesaikan.
8. Tautan untuk menuju halaman katalog kursus lengkap.
9. Halaman Katalog Kursus

Halaman katalog kursus berfungsi sebagai pusat eksplorasi dan pencarian kursus pada platform LMS, dilengkapi fitur _filter_ kategori dan pencarian untuk mempermudah pengguna menemukan kursus yang relevan. Setiap kursus disajikan secara ringkas untuk mendukung proses perbandingan dan pengambilan keputusan secara cepat dan tepat.

Gambar 3.38 Perancangan Halaman Katalog Kursus

Keterangan:

1. Tombol _filter_ kategori untuk menyaring kursus berdasarkan kategori.
2. Kartu kursus yang menampilkan _thumbnail_, _badge_ kategori, judul, dan harga. Untuk kursus baru ditandai dengan _badge_ "Baru".
3. Input pencarian untuk menyaring kursus berdasarkan judul.
4. Halaman _Pop-up_ Katalog Kursus

_Pop-up_ katalog kursus berfungsi untuk menampilkan informasi ringkas kursus yang dipilih tanpa berpindah halaman, sehingga pengguna dapat melakukan evaluasi awal dan mengambil keputusan dengan cepat. _Pop-up_ ini dilengkapi tombol aksi untuk melihat detail kursus atau langsung melanjutkan ke proses pembelian.

Gambar 3.39 Perancangan Halaman _Pop-up_ Katalog Kursus

Keterangan:

1. Modal _pop-up_ yang muncul saat kartu kursus diklik, menampilkan _thumbnail_, kategori, judul, deskripsi singkat, dan harga kursus.
2. Tombol untuk menuju halaman detail kursus.
3. _Primary button_ untuk langsung melanjutkan ke halaman _checkout._
4. Halaman Transaksi

Halaman transaksi berfungsi sebagai antarmuka penyelesaian pembelian kursus dengan menampilkan ringkasan pesanan dan rincian biaya secara transparan, serta menyediakan berbagai metode pembayaran. Tata letak dua kolom digunakan untuk memisahkan informasi pesanan dan opsi pembayaran, sehingga memudahkan pengguna dalam meninjau dan menyelesaikan transaksi secara cepat dan terstruktur.

Gambar 3.40 Perancangan Halaman Transaksi

Keterangan:

1. Tautan untuk kembali ke halaman detail kursus.
2. Kartu ringkasan pesanan yang menampilkan _thumbnail_, kategori, judul kursus, nama instruktur, jumlah modul, dan total durasi.
3. Input kode promo/voucher.
4. Tombol untuk menerapkan kode promo/voucher.
5. Rincian harga yang memuat harga asli, potongan diskon, potongan voucher, dan total pembayaran akhir.
6. Pilihan metode pembayaran: QRIS, Dompet Digital (GoPay, OVO, DANA, ShopeePay), dan Transfer Bank Virtual Account.
7. _Checkbox_ persetujuan syarat dan ketentuan sebelum melanjutkan pembayaran.
8. _Primary button_ untuk memproses pembayaran.
9. Halaman _Learning_

Halaman _learning_ berfungsi sebagai antarmuka utama untuk mengikuti materi kursus dengan menempatkan video pembelajaran sebagai fokus utama, serta dilengkapi panel navigasi materi dan kontrol progres. Struktur ini memungkinkan pengguna untuk mengakses, memantau, dan menyelesaikan pembelajaran secara terarah dan berkelanjutan.

Gambar 3.41 Perancangan Halaman _Learning_

Keterangan:

1. _Icon button_ untuk kembali ke halaman sebelumnya.
2. Indikator progres kursus yang menampilkan jumlah modul yang telah diselesaikan dari total keseluruhan.
3. _Video player_ untuk menampilkan materi video pembelajaran.
4. _Primary button_ untuk menandai materi video sebagai selesai.
5. _Tab_ untuk beralih antara Deskripsi Materi dan Lampiran Pendukung.
6. _Sidebar_ konten kursus yang menampilkan daftar seluruh modul (_sprint_) beserta tahap-tahapnya. Setiap tahap menampilkan judul, durasi, dan status (selesai, sedang ditonton, atau terkunci).
7. Ikon kunci pada modul yang belum dapat diakses.
8. Halaman Sertifikat

Halaman sertifikat berfungsi sebagai pusat pengelolaan sertifikat yang telah diperoleh pengguna, dengan penyajian terstruktur untuk memudahkan pencarian dan akses. Pengguna dapat melihat dan mengunduh sertifikat secara langsung, sehingga pengelolaan dan pemanfaatan sertifikat menjadi lebih praktis dan efisien.

Gambar 3.42 Perancangan Halaman Sertifikat

Keterangan:

1. _Dropdown_ untuk memilih jumlah data yang ditampilkan per halaman.
2. Tabel daftar sertifikat yang dimiliki pengguna, memuat ID unik sertifikat, nama kursus, tanggal penerbitan, dan tanggal kedaluwarsa.
3. Tombol untuk membuka atau mengunduh sertifikat dalam format PDF.
4. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.
5. Halaman _Level_ dan _Badges_

Halaman _Level_ dan _Badges_ berfungsi sebagai pusat pemantauan progres dan pencapaian pengguna melalui mekanisme gamifikasi, dengan menampilkan _level_, EXP, _reward_, dan koleksi _badge_. Penyajian ini bertujuan untuk meningkatkan motivasi pengguna dalam menyelesaikan pembelajaran melalui sistem penghargaan yang terukur dan progres yang terlihat secara jelas.

Gambar 3.43 Perancangan Halaman _Level_ dan _Badges_

Keterangan:

1. Kartu utama yang menampilkan _level_ saat ini, _title/badge_ aktif, EXP saat ini, dan _progress bar_ menuju _level_ berikutnya.
2. Kartu _roadmap_ target _level_ dan _reward._
3. Tampilan daftar _milestone level_ beserta voucher _reward_ yang didapat.
4. _Milestone_ yang sudah dicapai menampilkan kode voucher.
5. Tombol klaim hadiah.
6. Tombol yang belum dicapai ditampilkan dalam kondisi terkunci.
7. _Grid_ koleksi _badge_ yang dimiliki pengguna, setiap kartu menampilkan ikon, nama _badge_, dan deskripsi cara memperolehnya.
8. _Badge_ yang belum diperoleh ditampilkan dalam kondisi terkunci atau bewarna abu-abu.
9. Halaman Riwayat Transaksi

Halaman riwayat transaksi berfungsi sebagai pusat pemantauan seluruh aktivitas pembelian pengguna pada platform, dengan penyajian data yang terstruktur dan status transaksi yang jelas. Halaman ini memungkinkan pengguna untuk meninjau detail transaksi secara mudah, sehingga meningkatkan transparansi dan kontrol terhadap proses pembelian.

Gambar 3.44 Perancangan Halaman Riwayat Transaksi

Keterangan:

1. Tabel daftar riwayat transaksi yang memuat ID transaksi, nama kursus.
2. _Badge_ status pembayaran (Berhasil, Menunggu Pembayaran, atau Dibatalkan).
3. Tombol aksi untuk melihat detail transaksi.
4. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.

## 3.4.1.3 Perancangan Antarmuka Pengguna Peserta Magang

Perancangan antarmuka pengguna peserta magang pada aplikasi ini adalah sebagai berikut:

1. Halaman _Dashboard_

Halaman _dashboard_ peserta magang berfungsi sebagai pusat kontrol aktivitas utama, dengan menampilkan informasi penting seperti absensi harian dan tugas yang perlu diselesaikan. Elemen pengingat absensi dan kartu ringkasan dirancang untuk memberikan akses cepat terhadap tindakan utama, sehingga membantu peserta dalam mengelola kehadiran dan pekerjaan secara tepat waktu dan terarah.

Gambar 3.45 Perancangan Halaman _Dashboard_

Keterangan:

1. Tombol menu navigasi menuju _Dashboard._
2. Tombol menu navigasi menuju Kehadiran.
3. Tombol menu navigasi menuju Tugas disertai _badge_ notifikasi jika ada tugas baru.
4. Tombol menu navigasi menuju Nilai Akhir.
5. _Banner_ pengingat absensi harian yang menampilkan tanggal saat ini dan batas waktu _check-in._
6. Tombol untuk melakukan _check-in._
7. Kartu status kehadiran saat ini.
8. Tautan menuju halaman kehadiran lengkap.
9. Kartu ringkasan tugas yang menunggu diselesaikan.
10. Tautan menuju halaman daftar tugas.
11. _Badge_ jumlah tugas baru.
12. Halaman Absensi

Halaman absensi berfungsi sebagai antarmuka pencatatan kehadiran harian peserta magang, dilengkapi tombol konfirmasi dan rekap kehadiran berbasis kalender. Fitur ini dirancang untuk memastikan kedisiplinan dan memudahkan pemantauan kehadiran secara berkala.

Gambar 3.46 Perancangan Halaman Absensi

Keterangan:

1. _Primary button_ untuk melakukan konfirmasi _check-in_ kehadiran hari ini.
2. Kartu panduan absensi yang menjelaskan aturan jendela waktu _check-in_ dan ketentuan kehadiran.
3. Kalender kehadiran bulanan yang menampilkan status kehadiran per hari dengan kode warna hijau untuk hadir dan merah untuk absen atau alpha.
4. Tombol navigasi untuk berpindah antar bulan.
5. Halaman Tugas

Halaman tugas berfungsi sebagai pusat pengelolaan tugas peserta magang dengan pengelompokan berdasarkan status dan tenggat waktu. Halaman ini memudahkan peserta dalam memantau, mencari, dan menyelesaikan tugas secara terstruktur dan tepat waktu.

Gambar 3.47 Perancangan Halaman Tugas

Keterangan:

1. _Tab_ _filter_ untuk menampilkan tugas berdasarkan status: Akan Datang, Terlewat, dan Selesai.
2. _List item_ tugas yang menampilkan judul dan tenggat waktu.
3. Input pencarian untuk menyaring tugas berdasarkan nama.
4. _Badge not submitted_ jika tugas yang belum diselesaikan.
5. Tombol navigasi untuk berpindah ke halaman detail intruksi tugas.
6. Panel detail tugas yang menampilkan nama mentor, _badge_ tenggat waktu, dan instruksi lengkap tugas.
7. Area _upload_ pengumpulan tugas dengan dukungan _drag and drop file_.
8. Tombol untuk mengumpulkan tugas.
9. Halaman Detail Instruksi Tugas

Halaman detail instruksi tugas berfungsi sebagai pusat informasi dan pengumpulan tugas dengan menyajikan deskripsi tugas serta panel unggah dalam satu antarmuka. Struktur ini memungkinkan peserta memahami instruksi dan langsung mengumpulkan hasil kerja secara terintegrasi, sehingga proses penyelesaian tugas menjadi lebih efisien dan terarah.

Gambar 3.48 Perancangan Halaman Detail Instruksi Tugas

Keterangan:

1. Tautan untuk kembali ke halaman daftar tugas.
2. _Badge_ status pengumpulan tugas saat ini.
3. _Item_ lampiran dari mentor yang dapat diunduh, menampilkan nama _file_ dan ukurannya.
4. Area _upload_ pengumpulan tugas dengan dukungan _drag and drop_ _file_.
5. Tombol untuk mengumpulkan tugas.
6. Halaman Nilai Akhir

Halaman nilai akhir berfungsi sebagai antarmuka pemantauan hasil evaluasi peserta magang dengan menampilkan status ketersediaan nilai dan rekap penilaian secara keseluruhan. Halaman ini memberikan kejelasan mengenai proses penilaian, sehingga peserta dapat mengetahui apakah evaluasi telah selesai dan memantau hasilnya secara transparan.

Gambar 3.49 Perancangan Halaman Nilai Akhir

Keterangan:

1. _Banner_ peringatan yang menginformasikan bahwa nilai akhir belum tersedia karena proses evaluasi mentor masih berlangsung.
2. Tabel penilaian akhir magang yang menampilkan total akumulasi nilai.
3. Kolom nilai _final_ tampil kosong hingga mentor mengisi penilaian.

## 3.4.1.4 Perancangan Antarmuka Pengguna Mentor

Perancangan antarmuka pengguna mentor pada aplikasi ini adalah sebagai berikut:

1. Halaman _Dashboard_

Halaman _dashboard_ mentor berfungsi sebagai pusat pemantauan aktivitas peserta dengan menyajikan ringkasan data seperti jumlah peserta, status tugas, dan kehadiran harian. Informasi ini membantu mentor dalam mengevaluasi kondisi peserta dan menentukan tindakan yang perlu dilakukan secara cepat dan tepat.

Gambar 3.50 Perancangan Halaman Dashboard

Keterangan:

1. Tombol menu navigasi menuju _Dashboard._
2. Tombol menu navigasi menuju Absensi.
3. Tombol menu navigasi menuju Daftar Peserta.
4. Tombol menu navigasi menuju Absensi Peserta.
5. Tombol menu navigasi menuju Kelola Tugas.
6. Tombol menu navigasi menuju Nilai Akhir.
7. Kartu ringkasan yang menampilkan total peserta magang yang dibimbing.
8. Kartu tugas aktif yang menampilkan jumlah tugas yang menunggu pengumpulan.
9. Tautan menuju halaman Kelola Tugas.
10. Kartu kehadiran hari ini yang menampilkan jumlah peserta yang telah _check-in_ dari total keseluruhan.
11. Tautan menuju halaman Absensi Peserta.
12. Halaman Absensi Mentor

Halaman absensi mentor berfungsi sebagai sarana pencatatan kehadiran pribadi mentor setiap hari kerja, dengan jendela waktu _check-in_ dan kalender riwayat yang tersedia secara ringkas. Halaman ini memungkinkan mentor untuk mencatat kehadirannya sendiri secara mandiri, sehingga keterlibatan mentor dalam mendampingi peserta magang dapat terpantau secara konsisten.

Gambar 3.51 Perancangan Halaman Absensi Mentor

Keterangan:

1. _Primary button_ untuk melakukan konfirmasi _check-in_ kehadiran hari ini.
2. Kartu panduan absensi yang menjelaskan aturan jendela waktu _check-in_ dan ketentuan kehadiran.
3. Kalender kehadiran bulanan yang menampilkan status kehadiran per hari dengan kode warna hijau untuk hadir dan merah untuk absen atau alpha.
4. Tombol navigasi untuk berpindah antar bulan.
5. Halaman Daftar Peserta

Halaman daftar peserta berfungsi sebagai pusat informasi peserta yang berada di bawah bimbingan mentor, dengan penyajian data yang terstruktur untuk memudahkan identifikasi dan pemantauan. Informasi ini membantu mentor dalam memahami konteks kelas serta menjadi dasar dalam proses evaluasi dan pengelolaan peserta.

Gambar 3.52 Perancangan Halaman Daftar Peserta

Keterangan:

1. Tabel daftar peserta magang yang menampilkan nomor urut, avatar, nama lengkap, dan asal universitas/instansi.
2. _Badge_ yang menampilkan bidang dan kelas.
3. _Badge_ total jumlah peserta yang berada di bawah bimbingan mentor.
4. Halaman Absensi Peserta

Halaman absensi peserta berfungsi sebagai antarmuka pemantauan kehadiran harian dengan penyajian status kehadiran dan waktu _check-in_ secara terstruktur. Fitur ini membantu mentor dalam mengidentifikasi peserta yang tidak hadir serta melakukan evaluasi berdasarkan periode waktu tertentu melalui _filter_ tanggal.

Gambar 3.53 Perancangan Halaman Absensi Peserta

Keterangan:

1. Tabel rekap absensi seluruh peserta yang menampilkan nama dan waktu _check-in._
2. _Date picker_ untuk memilih tanggal rekap absensi yang ingin ditampilkan.
3. _Badge_ status kehadiran (Hadir, Tidak Hadir, atau Belum).
4. Halaman Kelola Tugas

Halaman kelola tugas berfungsi sebagai pusat pengaturan dan pemantauan tugas magang oleh mentor, dengan penyajian tugas berdasarkan status dan progres pengumpulan. Halaman ini memungkinkan mentor untuk membuat, mengelola, dan mengevaluasi tugas secara terstruktur, sehingga proses pengawasan dan pengendalian tugas dapat dilakukan secara efektif.

Gambar 3.54 Perancangan Halaman Kelola Tugas

Keterangan:

1. _Tab_ _filter_ untuk menampilkan tugas berdasarkan status: akan datang dan selesai.
2. _List item_ tugas yang menampilkan judul dan tenggat waktu, dan progres pengumpulan tugas (jumlah siswa yang telah mengumpulkan dari total).
3. Tombol navigasi menuju halaman detail submisi.
4. Input pencarian untuk menyaring tugas berdasarkan nama.
5. _Primary button_ untuk membuat tugas baru.
6. Halaman Buat Tugas Baru

Halaman buat tugas baru berfungsi sebagai antarmuka penyusunan dan penerbitan tugas oleh mentor dengan menyediakan pengaturan instruksi dan batas waktu pengumpulan. Halaman ini memungkinkan mentor merancang tugas secara terstruktur dan menetapkan deadline secara tepat, sehingga proses pemberian tugas menjadi jelas dan terkontrol.

Gambar 3.55 Perancangan Halaman Buat Tugas Baru

Keterangan:

1. _Icon button_ untuk kembali ke halaman sebelumnya.
2. Kolom input judul tugas.
3. Kolom input deskripsi tugas, dengan _rich text editor_ pada kolom deskripsi untuk memformat instruksi.
4. Area _upload_ lampiran pendukung opsional dengan dukungan _drag and drop_ _file_.
5. Input pengaturan batas waktu pengumpulan berupa _date picker_ untuk tanggal.
6. Input pengaturan batas waktu pengumpulan berupa _time picker_ untuk jam _deadline._
7. _Primary button_ untuk menerbitkan tugas ke seluruh peserta.
8. Tombol batal untuk membatalkan pembuatan tugas.
9. Halaman Detail Tugas

Halaman detail tugas berfungsi sebagai pusat pemantauan dan evaluasi pelaksanaan tugas oleh mentor dengan menampilkan progres pengumpulan peserta dan hasil pekerjaan. Halaman ini memungkinkan mentor untuk meninjau, memberikan koreksi, serta mengelola tugas, sehingga proses pengawasan dan penilaian dapat dilakukan secara menyeluruh dan terkontrol.

Gambar 3.56 Perancangan Halaman Detail Tugas

Keterangan:

1. _Icon button_ Tautan untuk kembali ke halaman Kelola Tugas.
2. Tombol untuk mengedit tugas.
3. Tombol untuk menghapus tugas.
4. Tabel pengumpulan tugas per peserta yang menampilkan nama peserta.
5. _Badge_ status pengumpulan.
6. Tombol untuk mengunduh _file_ submisi.
7. Tombol untuk memberikan koreksi, tombol koreksi hanya aktif pada peserta yang sudah mengumpulkan.
8. Halaman Nilai Akhir

Halaman nilai akhir berfungsi sebagai antarmuka evaluasi akhir peserta magang dengan menampilkan hasil penilaian secara terstruktur. Halaman ini memungkinkan mentor untuk memberikan dan memperbarui nilai, sehingga proses penilaian dapat dilakukan secara objektif, terkontrol, dan menjadi dasar penentuan hasil akhir peserta.

Gambar 3.57 Perancangan Halaman Nilai Akhir

Keterangan:

1. Tabel penilaian akhir seluruh peserta yang menampilkan nama dan nilai akhir.
2. Tombol "Edit Nilai" untuk mengubah nilai yang telah diinput untuk peserta yang sudah dinilai.
3. Tombol "Beri Nilai" untuk peserta yang belum dinilai.

## 3.4.1.5 Perancangan Antarmuka Pengguna Administrator

Perancangan antarmuka pengguna administrator pada aplikasi ini adalah sebagai berikut:

1. Halaman _Dashboard_

Halaman _dashboard_ administrator berfungsi sebagai pusat pemantauan performa platform secara menyeluruh dengan menyajikan ringkasan metrik utama seperti pendapatan, aktivitas pengguna, dan transaksi. Informasi ini membantu administrator dalam menganalisis kondisi sistem dan mengambil keputusan operasional secara cepat dan tepat.

Gambar 3.58 Perancangan Halaman Dashboard Admin

Keterangan:

1. Tombol menu navigasi menuju _Dashboard._
2. Tombol menu navigasi menuju _Course_.
3. Tombol menu navigasi menuju Pengguna.
4. Tombol menu navigasi menuju Sertifikat.
5. Tombol menu navigasi menuju Keuangan.
6. Tombol menu navigasi menuju Gamifikasi.
7. Tombol menu navigasi menuju Program Magang.
8. Tombol menu navigasi menuju Akun Admin.
9. Empat kartu metrik utama yang menampilkan total pendapatan, total pengguna aktif, jumlah transaksi berhasil, dan total kursus aktif disertai indikator persentase perubahan pada beberapa metrik.
10. Grafik batang pendapatan bulanan menampilkan data 12 bulan penuh dalam satu tahun.
11. Panel transaksi terbaru yang menampilkan nama pengguna, nama kursus, tanggal transaksi, nominal, dan _badge_ status transaksi (Berhasil, Pending, Gagal).
12. Halaman Manajemen Kursus

Halaman manajemen kursus berfungsi sebagai pusat pengelolaan seluruh kursus pada platform yang memungkinkan administrator mengatur siklus hidup kursus, mulai dari pembuatan, publikasi, hingga pengarsipan. Halaman ini dilengkapi fitur pencarian dan _filter_ untuk memudahkan pengelolaan dalam skala besar, sehingga administrator dapat mengontrol ketersediaan dan kualitas kursus secara terstruktur.

Gambar 3.59 Perancangan Halaman Manajemen Kursus

Keterangan:

1. Input pencarian untuk menyaring kursus berdasarkan judul.
2. _Primary button_ untuk membuat kursus baru.
3. _Dropdown_ _filter_ berdasarkan kategori.
4. _Dropdown_ _filter_ berdasarkan status kursus.
5. Tabel daftar kursus yang menampilkan _thumbnail_, judul, kode ID kursus, kategori, instruktur, harga, tanggal dibuat, dan _badge_ status (_Published, Draft, Archived_).
6. _Icon button_ untuk mengedit.
7. _Icon button_ untuk menghapus kursus.
8. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.
9. Halaman Detail Kursus

Halaman detail kursus berfungsi sebagai pusat pemantauan dan pengelolaan satu kursus secara menyeluruh oleh administrator, dengan menyajikan informasi umum serta statistik performa seperti jumlah peserta, pendapatan, dan status. Halaman ini memungkinkan administrator untuk mengevaluasi kinerja kursus dan mengatur statusnya melalui tindakan seperti edit, publikasi, atau pengarsipan, sehingga kualitas dan keberlanjutan kursus dapat terkontrol.

Gambar 3.60 Perancangan Halaman Detail Kursus

Keterangan:

1. Tautan untuk kembali ke halaman Manajemen Kursus.
2. Tombol untuk mengedit kursus.
3. Tombol untuk mengarsipkan.
4. Tombol untuk menghapus kursus.
5. Empat kartu metrik kursus yang menampilkan jumlah pendaftar, jumlah pengunjung halaman, dan total pendapatan.
6. _Tab_ navigasi untuk beralih antara Overview, Kurikulum Lengkap, dan Peserta Terdaftar.
7. Panel informasi kursus yang menampilkan _thumbnail_, status, kategori, instruktur, tanggal dibuat, dan harga.
8. Halaman Buat Kursus Baru

Halaman buat kursus baru berfungsi sebagai antarmuka perancangan dan pengelolaan kursus oleh administrator dengan menyediakan pengaturan informasi, struktur materi, dan status publikasi. Halaman ini memungkinkan administrator menyusun konten pembelajaran secara terstruktur serta mengontrol kesiapan kursus sebelum dipublikasikan, sehingga kualitas dan konsistensi materi dapat terjaga.

Gambar 3.61 Perancangan Halaman Buat Kursus Baru

Keterangan:

1. Kolom input judul kursus pada _form_ informasi umum kursus.
2. Kolom input deskripsi singkat.
3. Kolom input deskripsi lengkap.
4. Kolom input harga.
5. Kolom input harga coret.
6. Area _upload_ _thumbnail_ dengan dukungan _drag and drop._
7. Item _sprint_ yang dapat diurutkan _dilengkapi icon button expand/collapse_.
8. Item tahap di dalam _Sprint_ yang menampilkan tipe (video/kuis), judul, dan durasi atau jumlah soal, beserta _icon button_ untuk menghapus.
9. Tombol untuk menambah tahap Video.
10. Tombol untuk menambah tahap Kuis di dalam _Sprint._
11. Tombol untuk menambah _Sprint_ baru pada bagian materi kursus.
12. _Dropdown_ pengaturan kursus untuk memilih status (_Draft, Published, Archived_), kategori, dan instruktur.
13. Tombol batal untuk kembali ke halaman Manajemen Kursus.
14. _Primary button_ untuk menyimpan kursus.
15. Halaman _Pop-up_ Menambah Video

_Pop-up_ menambah video berfungsi sebagai antarmuka penambahan materi video pada struktur kursus yang memungkinkan administrator menyusun konten pembelajaran secara terorganisir. Fitur ini mendukung pengelolaan materi secara efisien dalam setiap modul, sehingga konsistensi dan kualitas penyajian konten dapat terjaga.

Gambar 3.62 Perancangan Halaman Pop-Up Menambah Video

Keterangan:

1. Modal dialog untuk menambah video materi.
2. Kolom input judul video.
3. Kolom input deskripsi materi.
4. Area _upload_ _file_ video dengan dukungan _drag and drop._
5. Tombol batal untuk menutup modal dan _primary button_ untuk menyimpan video.
6. Halaman _Pop-up_ Menambah Kuis

_Pop-up_ menambah kuis berfungsi sebagai antarmuka penambahan materi evaluasi dalam kursus yang memungkinkan administrator menyusun pertanyaan dan jawaban secara terstruktur. Fitur ini mendukung pengukuran pemahaman peserta serta meningkatkan interaktivitas pembelajaran, sehingga kualitas proses evaluasi dalam kursus dapat terjaga.

Gambar 3.63 Perancangan Halaman Pop-Up Menambah Kuis

Keterangan:

1. Modal dialog untuk menambah tahap kuis.
2. Kolom input judul kuis.
3. Kolom input deskripsi materi.
4. Form pertanyaan pilihan ganda yang memuat input teks soal.
5. Tombol untuk menyisipkan gambar pada soal.
6. Opsi jawaban dengan _radio button_ untuk menentukan jawaban benar dan _icon button_ hapus per opsi.
7. Tombol untuk menambah opsi jawaban tambahan.
8. Tombol untuk menambah pertanyaan baru.
9. Tombol batal dan _primary button_ untuk menyimpan kuis.
10. Halaman Manajemen Pengguna

Halaman manajemen pengguna berfungsi sebagai pusat pengelolaan akun pada platform yang memungkinkan administrator mengatur data, peran, dan status pengguna secara terstruktur. Halaman ini mendukung pengendalian akses dan aktivitas pengguna, sehingga operasional sistem dapat berjalan secara aman dan terkendali.

Gambar 3.64 Perancangan Halaman Manajemen Pengguna

Keterangan:

1. Input pencarian untuk menyaring pengguna berdasarkan nama atau email.
2. _Primary button_ untuk membuat akun pengguna baru.
3. _Dropdown_ _filter_ berdasarkan _role_ pengguna.
4. Tabel daftar pengguna yang menampilkan ID, nama, email, _role_, tanggal dibuat, dan _badge_ status (aktif/nonaktif).
5. _Icon button_ untuk mengedit, menonaktifkan, dan menghapus akun.
6. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.
7. Halaman Membuat Pengguna Baru

Halaman membuat pengguna baru berfungsi sebagai antarmuka pembuatan dan pengaturan akun pengguna oleh administrator dengan menyediakan penentuan peran dan informasi dasar pengguna. Halaman ini memungkinkan administrator mengontrol hak akses sejak awal, sehingga setiap pengguna dapat terintegrasi ke dalam sistem secara terstruktur dan sesuai dengan perannya.

Gambar 3.65 Perancangan Halaman Membuat Pengguna Baru

Keterangan:

1. _Dropdown_ untuk memilih _role_ akun yang akan dibuat (Peserta Didik, Peserta Magang, atau Mentor).
2. Kolom input nama lengkap.
3. Kolom input email.
4. Kolom input _password_ awal.
5. _Dropdown_ kelas yang muncul khusus saat _role_ yang dipilih adalah Peserta Magang atau Mentor.
6. Tombol batal dan _primary button_ untuk menyimpan akun baru.
7. Halaman Manajemen Sertifikat

Halaman manajemen sertifikat berfungsi sebagai pusat pemantauan seluruh sertifikat yang telah diterbitkan oleh sistem, dengan penyajian data yang dapat dicari dan disaring berdasarkan kursus maupun status keabsahan. Halaman ini memungkinkan administrator untuk mengatur masa berlaku sertifikat secara global, sehingga keabsahan dan kredibilitas sertifikat yang diterima peserta didik tetap terjaga.

Gambar 3.66 Perancangan Halaman Manajemen Sertifikat

Keterangan:

1. Input pencarian untuk menyaring sertifikat berdasarkan nomor sertifikat, nama penerima, atau nama kursus.
2. _Dropdown filter_ berdasarkan status sertifikat (Valid / Kedaluwarsa).
3. Tabel daftar sertifikat yang menampilkan avatar inisial penerima, nama, email, nama kursus, tanggal terbit, nomor sertifikat unik, dan badge status (Valid, Kedaluwarsa).
4. Icon _button_ untuk mengunduh _file_ sertifikat.
5. Icon _button_ untuk membuka _link_ publik sertifikat.
6. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.
7. Input angka untuk mengatur masa berlaku _default_ sertifikat baru dalam satuan tahun (kosong = tanpa masa berlaku).
8. _Primary button_ untuk menyimpan konfigurasi masa berlaku sertifikat.
9. Halaman Manajemen Transaksi

Halaman manajemen transaksi berfungsi sebagai pusat pemantauan dan pengawasan seluruh aktivitas pembelian pada platform, dengan penyajian data transaksi secara terstruktur. Halaman ini memungkinkan administrator untuk memverifikasi status pembayaran, menelusuri riwayat transaksi, serta melakukan pengendalian operasional keuangan secara lebih terkontrol dan transparan.

Gambar 3.67 Perancangan Halaman Manajemen Transaksi

Keterangan:

1. Tombol sub-menu navigasi menuju Transaksi.
2. Tombol sub-menu navigasi menuju Voucher.
3. Input pencarian untuk menyaring transaksi berdasarkan ID, nama pengguna, atau nama kursus.
4. Tabel daftar transaksi yang menampilkan ID, tanggal, nama pengguna, nama kursus, jumlah pembayaran, dan _badge_ status (Berhasil, _Pending_, Gagal, atau Dibatalkan).
5. _Dropdown_ _filter_ berdasarkan status transaksi.
6. _Dropdown_ _filter_ berdasarkan urutan tanggal terbaru.
7. Tombol untuk melihat detail transaksi.
8. Kontrol navigasi _pagination_ untuk berpindah antar halaman data.
9. Halaman Detail Transaksi

Halaman detail transaksi berfungsi sebagai antarmuka verifikasi dan audit transaksi dengan menyajikan informasi pembayaran secara lengkap serta riwayat proses transaksi secara kronologis. Halaman ini memungkinkan administrator untuk memvalidasi status pembayaran, menelusuri alur transaksi, dan mengidentifikasi potensi permasalahan, sehingga pengelolaan keuangan dapat dilakukan secara akurat dan transparan.

Gambar 3.68 Perancangan Halaman Detail Transaksi

Keterangan:

1. Panel _invoice_ yang menampilkan ID transaksi, _badge_ status, data penagihan (nama dan email pengguna), metode pembayaran, nama kursus, rincian harga (subtotal, biaya admin, dan total).
2. Panel _log_ transaksi yang menampilkan riwayat perubahan status secara kronologis beserta _timestamp_ dan sumber perubahannya (_System_ atau _Payment Gateway_).
3. Halaman Manajemen Absensi Mentor

Halaman manajemen absensi mentor berfungsi sebagai pusat pemantauan dan pengendalian kehadiran mentor secara lintas kelas, dengan penyajian data yang terstruktur dan dapat disaring berdasarkan _batch_, bidang, dan kelas. Halaman ini memungkinkan administrator untuk memverifikasi dan mengoreksi status kehadiran mentor, sehingga proses pengawasan terhadap konsistensi pendampingan mentor dapat dilakukan secara akurat dan terkendali.

Gambar 3.69 Perancangan Halaman Manajemen Absensi Mentor

Keterangan:

1. Tombol sub-menu navigasi menuju Absensi Mentor.
2. Tombol sub-menu navigasi menuju Absensi Peserta.
3. Tombol sub-menu navigasi menuju Tugas.
4. Tombol sub-menu navigasi menuju Nilai Akhir.
5. Tombol sub-menu navigasi menuju Konfigurasi Magang.
6. Tombol sub-menu navigasi menuju Konfigurasi Jam Kerja.
7. Input pencarian untuk menyaring mentor berdasarkan nama.
8. _Date picker_ untuk memilih tanggal absensi yang ingin dipantau atau dikoreksi.
9. _Dropdown filter_ berdasarkan _batch_ magang.
10. _Dropdown filter_ berdasarkan bidang magang.
11. _Dropdown filter_ berdasarkan kelas.
12. Tabel daftar absensi mentor yang menampilkan nama, kelas (_batch_ - bidang - kelas), waktu absen (WIB), dan _badge_ status kehadiran (Belum, Hadir, Tidak Hadir).
13. _Button_ untuk mencatat atau mengoreksi kehadiran mentor menjadi Hadir/Tidak Hadir.
14. Halaman Manajemen Absensi Magang

Halaman manajemen absensi magang berfungsi sebagai pusat pemantauan dan pengendalian kehadiran peserta magang secara menyeluruh, dengan penyajian data yang terstruktur dan dapat di _filter_. Halaman ini memungkinkan administrator untuk memverifikasi dan memperbarui status kehadiran, sehingga proses pengawasan dan pencatatan absensi dapat dilakukan secara akurat dan terkendali.

Gambar 3.70 Perancangan Halaman Manajemen Absensi Magang

Keterangan:

1. Input pencarian untuk menyaring peserta berdasarkan nama.
2. _Date picker_ untuk memilih tanggal absensi yang ingin dipantau atau dikoreksi.
3. _Dropdown filter_ berdasarkan _batch_ magang.
4. _Dropdown filter_ berdasarkan bidang magang.
5. _Dropdown filter_ berdasarkan kelas.
6. Tabel daftar absensi peserta yang menampilkan nama, kelas (_batch_ - bidang - kelas), waktu absen (WIB), dan _badge_ status kehadiran (Belum, Hadir, Tidak Hadir).
7. Button untuk mencatat atau mengoreksi kehadiran peserta menjadi Hadir/Tidak Hadir.
8. Halaman Manajemen Tugas Magang

Halaman manajemen tugas magang berfungsi sebagai pusat pengelolaan dan pengendalian distribusi tugas kepada peserta magang, dengan penyajian tugas berdasarkan status pelaksanaan. Halaman ini memungkinkan administrator untuk mengatur, memantau, dan mengoordinasikan pemberian tugas secara terstruktur, sehingga proses pelaksanaan tugas dapat berjalan secara konsisten dan terkendali.

Gambar 3.71 Perancangan Halaman Manajemen Tugas Magang

Keterangan:

1. _Primary button_ untuk membuat tugas baru.
2. Input pencarian untuk menyaring tugas berdasarkan judul.
3. _List item_ tugas yang menampilkan judul, bidang, kelas, dan tenggat waktu, beserta tombol navigasi menuju halaman detail tugas.
4. Halaman Detail Tugas Magang

Halaman detail tugas magang berfungsi sebagai pusat pemantauan dan evaluasi pelaksanaan tugas secara menyeluruh dengan menyajikan informasi tugas serta progres pengumpulan peserta. Halaman ini memungkinkan administrator untuk mengidentifikasi ketercapaian tugas, meninjau hasil pengumpulan, serta mengambil tindakan terhadap peserta yang belum memenuhi kewajiban, sehingga proses pengawasan tugas dapat dilakukan secara terstruktur dan terkendali.

Gambar 3.72 Perancangan Halaman Detail Tugas Magang

Keterangan:

1. _Banner_ informasi yang menampilkan tenggat waktu dan tanggal pembuatan tugas.
2. Panel deskripsi tugas beserta item lampiran yang dapat diunduh.
3. Kartu ringkasan pengumpulan yang menampilkan total peserta, jumlah yang sudah mengumpulkan, dan jumlah yang belum mengumpulkan.
4. Tabel pengumpulan tugas per peserta yang menampilkan ID, nama, bidang, kelas, _badge_ status, tanggal pengumpulan, dan nama _file_.
5. Tombol untuk melihat _file_ submisi.
6. Halaman Nilai Akhir Magang

Halaman nilai akhir magang berfungsi sebagai pusat pemantauan hasil evaluasi peserta secara menyeluruh dengan menyajikan rekap nilai akhir yang telah ditetapkan oleh mentor. Halaman ini bersifat _read-only_, sehingga menjaga integritas data penilaian, serta memungkinkan administrator untuk melakukan pengawasan dan pelaporan hasil secara transparan dan terstruktur.

Gambar 3.73 Perancangan Halaman Nilai Akhir Magang

Keterangan:

1. _Banner_ informasi yang menjelaskan bahwa nilai akhir diisi oleh mentor dan admin hanya dapat melihat data.
2. Tabel nilai akhir seluruh peserta magang yang menampilkan ID, nama, bidang, kelas, dan nilai akhir peserta yang belum dinilai menampilkan teks "Belum dinilai".
3. Halaman Konfigurasi Magang

Halaman konfigurasi magang berfungsi untuk admin dalam mengelola _field batch_, bidang, dan kelas yang nanti akan dipilih saat membuat akun peserta magang dan mentor sebagai parameter untuk menyatukan peserta magang dan mentor sesuai kelasnya.

Gambar 3.74 Perancangan Halaman Konfigurasi Magang

Keterangan:

1. Tombol untuk menambah _batch_ baru.
2. Tabel daftar _batch_ berupa nama _batch_ dan keterangan.
3. _Dropdown_ untuk memilih _batch_.
4. Tombol untuk menambah bidang berdasarkan _batch_ yang telah dipilih.
5. Daftar bidang berupa _batch_ yang dihubungkan, nama kelas dan tombol hapus bidang.
6. _Dropdown_ untuk memilih kelas.
7. Tombol untuk menambah kelas baru.
8. Tabel daftar kelas berupa nama kelas, jumlah peserta kelas tersebut dan tombol hapus kelas.
9. Tombol batal untuk membatalkan pembuatan _batch._
10. _Primary button_ untuk menyimpan perubahan _batch._
11. Halaman Manajemen Voucher

Halaman manajemen voucher berfungsi sebagai pusat pengelolaan program promosi dan diskon pada platform yang memungkinkan administrator mengatur pembuatan, masa berlaku, dan status voucher. Halaman ini mendukung pengendalian penggunaan voucher serta pengelolaan strategi pemasaran secara terstruktur, sehingga distribusi insentif kepada pengguna dapat dilakukan secara tepat dan terkendali.

Gambar 3.75 Perancangan Halaman Manajemen Voucher

Keterangan:

1. _Primary button_ untuk membuat voucher baru.
2. Input pencarian untuk menyaring voucher berdasarkan kode.
3. _Dropdown_ _filter_ berdasarkan status dan urutan tanggal berlaku.
4. Tabel daftar voucher yang menampilkan ID, kode, besaran diskon, jumlah penggunaan dari batas maksimal, tanggal kedaluwarsa, dan _badge_ status (Aktif, Kedaluwarsa, Diarsipkan).
5. _Icon button_ untuk mengedit, mengarsipkan, dan menghapus voucher.
6. Halaman Membuat Voucher Baru

Halaman membuat voucher baru berfungsi sebagai antarmuka pembuatan dan pengaturan awal voucher oleh administrator dengan menyediakan konfigurasi nilai diskon, periode berlaku, dan batas penggunaan. Halaman ini memungkinkan administrator menetapkan aturan penggunaan voucher secara terstruktur, sehingga distribusi promosi dapat dilakukan secara terkendali dan sesuai strategi pemasaran.

Gambar 3.76 Perancangan Halaman Membuat Voucher Baru

Keterangan:

1. Kolom input kode voucher.
2. _Dropdown_ tipe diskon (persentase/nominal).
3. Kolom input nilai diskon.
4. Kolom input batas maksimal penggunaan.
5. _Dropdown_ status (aktif/nonaktif)
6. _Date picker_ untuk tanggal mulai dan berakhir berlakunya voucher.
7. Tombol batal untuk kembali ke halaman voucher.
8. _Primary button_ untuk menyimpan voucher baru.
9. Halaman Manajemen Gamifikasi

Halaman manajemen gamifikasi berfungsi sebagai pusat pengaturan sistem motivasi dan penghargaan pengguna pada platform, dengan mengelola aturan perolehan EXP dan kriteria pemberian _badge_. Halaman ini memungkinkan administrator mengontrol mekanisme progres dan insentif pengguna, sehingga dapat meningkatkan keterlibatan dan mendorong aktivitas belajar secara berkelanjutan.

Gambar 3.77 Perancangan Halaman Manajemen Gamifikasi

Keterangan:

1. Tombol sub-menu navigasi menuju Aturan EXP & _Badge_
2. Tabel aturan EXP yang menampilkan daftar aksi beserta jumlah EXP yang diberikan untuk setiap aktivitas.
3. Tombol untuk menambah _badge_ baru.
4. _Banner_ catatan yang menjelaskan keterbatasan konfigurasi jenis _trigger badge._
5. Tabel daftar _badge_ yang menampilkan nama, deskripsi, jenis _trigger_, _threshold_, dan minimum EXP yang dibutuhkan.
6. _Icon button_ untuk mengedit dan menghapus _badge._
7. Halaman Membuat _Badge_ Baru

_Pop-up_ buat _badge_ baru berfungsi sebagai antarmuka penambahan elemen penghargaan dalam sistem gamifikasi yang memungkinkan administrator menetapkan kriteria dan nilai _reward_ bagi pengguna. Fitur ini mendukung pengelolaan mekanisme motivasi secara terstruktur, sehingga keterlibatan pengguna dapat ditingkatkan melalui pemberian penghargaan yang terarah.

Gambar 3.78 Perancangan Halaman Membuat Badge Baru

Keterangan:

1. Modal dialog untuk menambah _badge_ baru, berisi _form_ input nama _badge_, deskripsi, _dropdown_ jenis _trigger,_ input _threshold,_ dan input EXP minimum yang dibutuhkan.
2. _Primary button_ untuk menyimpan _badge._
3. Halaman Konfigurasi Jam Kerja dan Libur

Halaman konfigurasi jam kerja dan libur berfungsi sebagai pusat pengaturan jadwal operasional program magang, dengan kemampuan menambahkan hari libur mendadak yang belum tercakup dalam kalender nasional. Halaman ini memungkinkan administrator untuk menjaga keakuratan kalender absensi, sehingga pencatatan kehadiran peserta magang dan mentor tidak salah tercatat akibat adanya hari libur yang belum terkonfigurasi.

Gambar 3.79 Perancangan Halaman Konfigurasi Jam Kerja dan Libur

Keterangan:

1. _Tab_ navigasi untuk berpindah antara sub-halaman Tanggal Libur dan Window Absen.
2. _Primary button_ untuk menambah tanggal libur baru.
3. Tabel daftar tanggal libur yang menampilkan nomor urut, nama libur, keterangan, tanggal, dan durasi (hari).
4. _Icon button_ untuk mengedit data tanggal libur.
5. _Icon button_ untuk menghapus data tanggal libur.
6. Halaman Akun Administrator

Halaman akun administrator berfungsi sebagai pusat pengelolaan akun-akun dengan hak akses tertinggi pada platform, dengan mekanisme undangan yang menjaga keamanan proses penambahan administrator baru. Halaman ini memungkinkan administrator untuk mengatur status keaktifan administrator lain, sehingga kendali atas hak akses platform tetap terjaga dan tidak disalahgunakan.

Gambar 3.80 Perancangan Halaman Akun Administrator

Keterangan:

1. _Primary button_ untuk menambah akun admin baru dengan mengisi nama dan email, lalu sistem mengirimkan _link_ undangan login ke email tersebut.
2. Tabel daftar akun admin yang menampilkan avatar inisial, nama, email, _badge_ status (Aktif / Nonaktif), tanggal akun dibuat, dan tanggal _login_ terakhir.
3. _Icon button_ untuk mengedit data akun admin.
4. _Button_ untuk mengubah status akun admin yang sedang aktif menjadi nonaktif.
5. _Button_ untuk mengaktifkan kembali akun admin yang sedang nonaktif.

## 3.4.2 Perancangan Basis Data

Perancangan basis data sangat penting dalam pengembangan sebuah sistem karena merupakan salah satu bagian terpenting yang menentukan tamplan dan penyesuaian data API untuk aplikasi. Perancangan basis data dalam aplikasi ini diimpleementasikan dengan menggunakan PostgreSQL yang terintegerasi dengan Javascript. Perancangan basis data pada aplikasi ini digambarkan dengan _Entitiy Relationship Diagram_ (ERD). Tahapan yang dilakukan adalah mengidetentifikasi entitias dan menggambarkan entitas tersebut ke dalam ERD.

## 3.4.2.1 Identifikasi Entitas

Pada tahap ini, penulis melakukan identifikasi dan penetapan tipe entitas yang akan digunakan dalam perancangan sistem. Berikut adalah tabel beserta penjelasan dari hasil identifikasi tersebut.

Tabel 3.30 Tabel Identifikasi Entitas

| **No** | **Nama Entitas**      | **Deskripsi**                                                                                                                                                                  |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.     | Account               | Entitas utama yang menyimpan data metode autentikasi pengguna melalui email/_password_ maupun OAuth dari _provider_ eksternal seperti Google.                                  |
| 2.     | Admin_Invite          | Entitas yang merepresentasikan undangan resmi untuk menambah administrator baru ke dalam platform melalui mekanisme token berbasis email.                                      |
| 3.     | Attendance            | Entitas yang merepresentasikan catatan kehadiran harian peserta magang dan mentor dalam program magang.                                                                        |
| 4.     | Audit_Log             | Entitas yang merepresentasikan rekam jejak aksi kritis yang dilakukan administrator sebagai dasar akuntabilitas dan keamanan sistem.                                           |
| 5.     | Badge                 | Entitas yang mendefinisikan penghargaan virtual dalam sistem gamifikasi yang dapat diperoleh pengguna berdasarkan pencapaian tertentu.                                         |
| 6.     | Batch                 | Entitas yang merepresentasikan angkatan atau periode pelaksanaan program magang beserta rentang tanggalnya.                                                                    |
| 7.     | Category              | Entitas yang merepresentasikan kategori pengelompokan kursus di katalog platform.                                                                                              |
| 8.     | Certificate           | Entitas yang merepresentasikan sertifikat digital penyelesaian kursus yang diterbitkan otomatis kepada pengguna.                                                               |
| 9.     | Class                 | Entitas yang merepresentasikan kelas magang sebagai unit terkecil pengelompokan peserta dalam suatu bidang dan batch tertentu.                                                 |
| 10.    | Course                | Entitas inti yang merepresentasikan kursus yang tersedia di platform, mencakup konten, harga, instruktur, dan status publikasi.                                                |
| 11.    | Course_Benefits       | Entitas yang merepresentasikan poin-poin manfaat atau hal yang akan dipelajari dari suatu kursus.                                                                              |
| 12.    | Course_Faq            | Entitas yang merepresentasikan pasangan pertanyaan dan jawaban umum terkait suatu kursus.                                                                                      |
| 13.    | Course_Slug_History   | Entitas yang menyimpan riwayat perubahan slug pada suatu kursus, sehingga URL lama tetap dapat diarahkan ke halaman kursus yang benar meskipun slug aktifnya telah diperbarui. |
| 14.    | Enrollment            | Entitas yang merepresentasikan kepemilikan akses pengguna terhadap suatu kursus sekaligus wadah pelacakan progres belajar.                                                     |
| 15.    | Exp_Log               | Entitas yang merepresentasikan catatan transaksi pemberian EXP kepada pengguna sebagai bagian dari sistem gamifikasi.                                                          |
| 16.    | Field                 | Entitas yang merepresentasikan bidang keahlian atau konsentrasi yang tersedia dalam suatu batch magang.                                                                        |
| 17.    | Final_Grade           | Entitas yang merepresentasikan nilai akhir magang peserta yang ditetapkan oleh mentor penanggung jawab.                                                                        |
| 18.    | Holiday               | Entitas yang merepresentasikan hari libur yang berlaku secara global bagi seluruh peserta dan mentor dalam sistem magang.                                                      |
| 19.    | Internship_Profile    | Entitas yang menyimpan data tambahan khusus Peserta Magang yang tidak tercakup dalam entitas user, yaitu kelas yang diikuti dan institusi asal.                                |
| 20.    | Mentor_Profile        | Entitas yang menyimpan data tambahan khusus Mentor yang tidak tercakup dalam entitas user, yaitu kelas yang dibimbing dan jenis kelamin.                                       |
| 21.    | Notification          | Entitas yang merepresentasikan notifikasi _in-app_ yang dikirim kepada pengguna berdasarkan aktivitas atau perubahan status tertentu di platform.                              |
| 22.    | Order                 | Entitas yang merepresentasikan transaksi pembelian kursus oleh pengguna, mencakup rincian harga dan status pembayaran.                                                         |
| 23.    | Payment_Webhook_Event | Entitas yang merepresentasikan _event webhook_ yang diterima dari _payment gateway_ sebagai _log_ pembayaran dan jaminan _idempotency_.                                        |
| 24.    | Platform_Setting      | Entitas yang menyimpan konfigurasi global platform dalam format _key-value_ yang dapat dikelola oleh administrator.                                                            |
| 25.    | Quiz                  | Entitas yang menyimpan konfigurasi dasar kuis pada suatu _step_, khususnya nilai minimum kelulusan.                                                                            |
| 26.    | Quiz_Question         | Entitas yang merepresentasikan soal pilihan ganda beserta pilihan jawaban dan kunci jawaban dalam sebuah kuis.                                                                 |
| 27.    | Session               | Entitas yang merepresentasikan sesi autentikasi aktif pengguna.                                                                                                                |
| 28.    | Sprint                | Entitas yang merepresentasikan modul dalam struktur kurikulum suatu kursus sebagai wadah kumpulan _step_ pembelajaran.                                                         |
| 29.    | Step                  | Entitas yang merepresentasikan unit pembelajaran terkecil dalam sebuah _sprint_, berupa konten video atau kuis.                                                                |
| 30.    | Step_Note             | Entitas yang merepresentasikan catatan pribadi pengguna pada suatu _step_ kursus yang sedang dipelajari.                                                                       |
| 31.    | Step_Progress         | Entitas yang merepresentasikan catatan progres penyelesaian setiap _step_ oleh pengguna dalam konteks _enrollment_ tertentu.                                                   |
| 32.    | Task                  | Entitas yang merepresentasikan tugas yang dibuat mentor untuk didistribusikan kepada seluruh peserta magang di kelasnya.                                                       |
| 33.    | Task_Submission       | Entitas yang merepresentasikan pengumpulan tugas oleh peserta magang, mencakup _file_ yang dikirim dan _feedback_ dari mentor.                                                 |
| 34.    | User                  | Entitas utama yang menyimpan data akun seluruh pengguna platform dari semua peran yang ada dalam sistem.                                                                       |
| 35.    | User_Badge            | Entitas yang merepresentasikan _badge_ yang telah diperoleh pengguna beserta _snapshot_ datanya untuk menjaga integritas riwayat pencapaian.                                   |
| 36.    | User_Game_Profile     | Entitas yang menyimpan data profil gamifikasi pengguna, mencakup _level_ aktif, EXP saat ini, dan total EXP yang diperoleh.                                                    |
| 37.    | Verification          | Entitas yang menyimpan token sementara untuk keperluan verifikasi email dan _reset password_ dengan masa berlaku terbatas.                                                     |
| 38.    | Video                 | Entitas yang menyimpan metadata video pembelajaran yang diunggah ke Bunny.net dan berelasi dengan _step_ bertipe video.                                                        |
| 39.    | Video_Archive         | Entitas yang menyimpan riwayat identitas video lama di Bunny.net sebagai rekam jejak ketika admin mengganti _file_ video suatu _step_.                                         |
| 40.    | Voucher               | Entitas yang merepresentasikan kode diskon yang dapat digunakan saat _checkout_, dengan opsi pembatasan berdasarkan pengguna, kursus, atau kategori.                           |
| 41.    | Voucher_Usage         | Entitas yang merepresentasikan riwayat penggunaan voucher oleh pengguna pada setiap transaksi pembelian kursus.                                                                |

## 3.4.2.2 _Entity Relationship Diagram_ (ERD)

Dalam tahap ini, penulis menggambarkan ERD sistem beserta atribut yang dimiliki oleh setiap entitasnya. Berikut adalah ERD dari platform pembelajaran digital berbasis web studik kasus: NextLevel Academy.

Gambar 3.81 ERD Platform Pembelajaran Digital Berbasis Web NextLevel Academy (Bagian 1)

Gambar 3.82 ERD Platform Pembelajaran Digital Berbasis Web NextLevel Academy (Bagian 2)

Gambar 3.83 ERD Platform Pembelajaran Digital Berbasis Web NextLevel Academy (Bagian 3)

Setiap atribut yang ditampilkan pada ERD dari gambar 3.81 hingga 3.83 penulis menjabarkan keterangan dari atribut-atribut tersebut ke dalam tabel 3.31 hingga 3.71 dan dilengkapi informasi tujuan penggunaan tabel tersebut dalam sistem.

1. Atribut Pada Account

Tujuan penggunaan atribut pada account untuk menyimpan data kredensial dan informasi _provider_ autentikasi pengguna, mencakup token OAuth dan _password_ _hash_ yang dikelola oleh sistem autentikasi Better Auth.

Tabel 3.31 Atribut Pada Account

| **Nama Atribut**      | **Tipe Data** | **Constraint**                 | **Keterangan**                                                          |
| --------------------- | ------------- | ------------------------------ | ----------------------------------------------------------------------- |
| id                    | Text          | _Primary Key_                  | _Identifier_ unik akun autentikasi                                      |
| userId                | Text          | _Foreign Key (user), Not Null_ | Referensi ke akun pengguna pemilik                                      |
| accountId             | Text          | _Not Null_                     | _Identifier_ unik dari sisi _provider_                                  |
| providerId            | Text          | _Not Null_                     | Nama _provider_ autentikasi yang digunakan                              |
| accessToken           | Text          |                                | Token akses OAuth yang diterima dari _provider_                         |
| refreshToken          | Text          |                                | Token _refresh_ OAuth untuk memperbarui _access_ token yang kedaluwarsa |
| idToken               | Text          |                                | ID token Oauth yang diterima dari _provider_                            |
| accessTokenExpiresAt  | Timestamp     |                                | Waktu kedaluwarsa _access_ token OAuth                                  |
| refreshTokenExpiresAt | Timestamp     |                                | Waktu kedaluwarsa _refresh_ token OAuth                                 |
| scope                 | Text          |                                | Cakupan akses OAuth yang diizinkan oleh pengguna                        |
| password              | Text          |                                | _Password hash_ untuk autentikasi                                       |
| createdAt             | Timestamp     | _Not Null_                     | Waktu akun autentikasi pertama kali dibuat                              |
| updatedAt             | Timestamp     | _Not Null_                     | Waktu terakhir data akun autentikasi diperbarui                         |

1. Atribut Pada Admin_Invite

Tujuan penggunaan atribut pada admin_invite untuk menyimpan data undangan penambahan administrator baru berbasis email yang bersifat sekali pakai dengan masa berlaku terbatas, guna mengamankan proses penambahan akun administrator.

Tabel 3.32 Atribut Pada Admin_Invite

| **Nama Atribut** | **Tipe Data** | **Constraint**               | **Keterangan**                                                           |
| ---------------- | ------------- | ---------------------------- | ------------------------------------------------------------------------ |
| id               | Text          | Primary Key                  | Identifier unik undangan administrator                                   |
| email            | Text          | Not Null                     | Alamat email penerima undangan yang akan menjadi administrator           |
| name             | Text          |                              | Nama penerima undangan (opsional, dapat diisi setelah akun dibuat)       |
| tokenHash        | Text          | Unique, Not Null             | Hash SHA-256 dari token undangan, token asli hanya dikirim melalui email |
| invitedById      | Text          | Foreign Key (user), Not Null | ID administrator yang membuat dan mengirim undangan                      |
| expiresAt        | Timestamp     | Not Null                     | Waktu kedaluwarsa undangan (24 jam sejak undangan dibuat)                |
| acceptedAt       | Timestamp     |                              | Waktu undangan diterima dan akun administrator berhasil dibuat           |
| acceptedUserId   | Text          |                              | ID pengguna yang menerima undangan dan menjadi administrator baru        |
| revokedAt        | Timestamp     |                              | Waktu undangan dicabut oleh administrator sebelum sempat diterima        |
| revokedById      | Text          |                              | ID administrator yang melakukan pencabutan undangan                      |
| createdAt        | Timestamp     | Not Null                     | Waktu undangan pertama kali dibuat                                       |
| updatedAt        | Timestamp     | Not Null                     | Waktu terakhir data undangan diperbarui                                  |

1. Atribut Pada Attendance

Tujuan penggunaan atribut pada attendance untuk mencatat data absensi harian peserta magang dan mentor, mencakup status kehadiran dan waktu _check-in_ yang hanya dapat dikoreksi oleh administrator.

Tabel 3.33 Atribut Pada Attendance

| **Nama Atribut** | **Tipe Data**    | **Constraint**                 | **Keterangan**                                                    |
| ---------------- | ---------------- | ------------------------------ | ----------------------------------------------------------------- |
| id               | Text             | _Primary Key_                  | _Identifier_ unik catatan absensi harian                          |
| userId           | Text             | _Foreign Key (user), Not Null_ | ID pengguna (peserta magang atau mentor) yang melakukan absensi   |
| date             | Date             | _Not Null_                     | Tanggal absensi dicatat                                           |
| status           | AttendanceStatus | _Not Null_                     | Status kehadiran, _PRESENT_ jika hadir, _ABSENT_ jika tidak hadir |
| checkedInAt      | Timestamp        |                                | Waktu pengguna berhasil melakukan _check-in_ harian               |
| editedById       | Text             | _Foreign Key (user)_           | ID administrator yang melakukan koreksi data absensi              |
| createdAt        | Timestamp        | _Not Null_                     | Waktu catatan absensi pertama kali dibuat                         |
| updatedAt        | Timestamp        | _Not Null_                     | Waktu terakhir data absensi diperbarui                            |

1. Atribut Pada Audit_Log

Tujuan penggunaan atribut pada audit_log untuk menyimpan rekam jejak aksi kritis yang dilakukan administrator, mencakup jenis aksi, entitas yang terdampak, dan konteks perubahan untuk keperluan keamanan dan akuntabilitas.

Tabel 3.34 Atribut Pada Audit_Log

| **Nama Atribut** | **Tipe Data** | **Constraint**     | **Keterangan**                                                        |
| ---------------- | ------------- | ------------------ | --------------------------------------------------------------------- |
| id               | Text          | Primary Key        | Identifier unik entri audit log                                       |
| actorId          | Text          | Foreign Key (user) | ID pengguna (biasanya administrator) yang melakukan aksi              |
| action           | Text          | Not Null           | Nama aksi yang dilakukan (misal: ORDER_ACCEPT, ATTENDANCE_EDIT)       |
| entityType       | Text          |                    | Jenis entitas yang terdampak oleh aksi (misal: Order, User)           |
| entityId         | Text          |                    | ID entitas yang terdampak oleh aksi                                   |
| metadata         | JSONB         |                    | Data kontekstual tambahan seperti nilai sebelum dan sesudah perubahan |
| ipAddress        | Text          |                    | Alamat IP perangkat aktor saat aksi dilakukan                         |
| userAgent        | Text          |                    | Informasi browser dan perangkat aktor saat aksi dilakukan             |
| createdAt        | Timestamp     | Not Null           | Waktu aksi dicatat ke dalam audit log                                 |

1. Atribut Pada Badge

Tujuan penggunaan atribut pada badge untuk mendefinisikan _badge_ dalam sistem gamifikasi, mencakup jenis _trigger_, nilai ambang batas, dan informasi visual _badge_ yang dapat diperoleh pengguna melalui pencapaian tertentu.

Tabel 3.35 Atribut Pada Badge

| **Nama Atribut** | **Tipe Data** | **Constraint**       | **Keterangan**                                                                         |
| ---------------- | ------------- | -------------------- | -------------------------------------------------------------------------------------- |
| id               | Text          | Primary Key          | Identifier unik badge                                                                  |
| name             | Text          | Not Null             | Nama badge yang ditampilkan kepada pengguna                                            |
| description      | Text          |                      | Deskripsi cara mendapatkan atau makna dari badge ini                                   |
| trigger          | BadgeTrigger  | Not Null             | Kondisi pemicu pemberian badge; LEVEL_REACHED, COURSES_COMPLETED, atau COURSE_SPECIFIC |
| threshold        | Integer       | Not Null             | Nilai ambang batas pemicu berupa nomor level, jumlah kursus, atau ID kursus terkait    |
| courseId         | Text          | Foreign Key (course) | ID kursus terkait, hanya diisi jika trigger bernilai COURSE_SPECIFIC                   |
| expMinimum       | Integer       | Not Null             | Nilai minimum EXP informatif yang terkait dengan pencapaian badge                      |
| logoUrl          | Text          |                      | URL gambar ikon badge yang tersimpan di layanan storage                                |
| createdAt        | Timestamp     | Not Null             | Waktu badge pertama kali dibuat                                                        |

1. Atribut Pada Batch

Tujuan penggunaan atribut pada batch untuk menyimpan data angkatan program magang beserta rentang tanggal pelaksanaannya sebagai acuan struktur organisasi peserta dan kalender absensi.

Tabel 3.36 Atribut Pada Batch

| **Nama Atribut** | **Tipe Data** | **Constraint**     | **Keterangan**                                                               |
| ---------------- | ------------- | ------------------ | ---------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_      | _Identifier_ unik _batch_ atau angkatan magang                               |
| name             | Text          | _Unique, Not Null_ | Nama _batch_ yang bersifat unik secara global                                |
| description      | Text          | _Not Null_         | Keterangan periode _batch_ (misal: Periode November 2025 - Januari 2026)     |
| createdAt        | Timestamp     | _Not Null_         | Waktu data _batch_ magang pertama kali dibuat                                |
| startDate        | Date          | _Not Null_         | Tanggal mulai periode program magang _batch_                                 |
| endDate          | Date          | _Not Null_         | Tanggal berakhir periode program magang _batch_                              |
| batchCode        | Text          | _Not Null_         | Kode unik _batch_ magang yang menjadi komponen pembentuk nomor induk peserta |

1. Atribut Pada Category

Tujuan penggunaan atribut pada category untuk menyimpan daftar kategori kursus yang digunakan sebagai pengelompokan konten di katalog platform sekaligus pembatas cakupan voucher promosi.

Tabel 3.37 Atribut Pada Category

| **Nama Atribut** | **Tipe Data** | **Constraint**   | **Keterangan**                                                        |
| ---------------- | ------------- | ---------------- | --------------------------------------------------------------------- |
| id               | Text          | Primary Key      | Identifier unik kategori kursus                                       |
| name             | Text          | Unique, Not Null | Nama kategori yang bersifat unik (misal: Multimedia, Web Programming) |
| createdAt        | Timestamp     | Not Null         | Waktu kategori pertama kali dibuat                                    |
| updatedAt        | Timestamp     | Not Null         | Waktu terakhir data kategori diperbarui                               |
| description      | Text          |                  | Deskripsi singkat kategori (opsional)                                 |

1. Atribut Pada Certificate

Tujuan penggunaan atribut pada certificate untuk menyimpan data sertifikat penyelesaian kursus, mencakup nomor sertifikat unik, waktu penerbitan, dan _snapshot_ nama penerima yang bersifat _immutable_ setelah diklaim.

Tabel 3.38 Atribut Pada Certificate

| **Nama Atribut** | **Tipe Data** | **Constraint**                               | **Keterangan**                                                                |
| ---------------- | ------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                                | _Identifier_ unik sertifikat                                                  |
| userId           | Text          | _Foreign Key (user), Not Null_               | ID pengguna penerima sertifikat                                               |
| courseId         | Text          | _Foreign Key (course), Not Null_             | ID kursus yang berhasil diselesaikan pengguna                                 |
| enrollmentId     | Text          | _Foreign Key (enrollment), Unique, Not Null_ | ID _enrollment_ terkait; satu sertifikat per _enrollment_                     |
| certificateNo    | Text          | _Unique, Not Null_                           | Nomor sertifikat unik dengan format NLA-XXXXXXXXXXXX                          |
| issuedAt         | Timestamp     | _Not Null_                                   | Waktu sertifikat diterbitkan saat progres pengguna mencapai 100%              |
| expiresAt        | Timestamp     |                                              | Waktu kedaluwarsa sertifikat sesuai konfigurasi global platform               |
| claimedAt        | Timestamp     |                                              | Waktu sertifikat diklaim dan nama penerima dikunci secara permanen            |
| imageUrl         | Text          |                                              | URL permanen _file_ PNG sertifikat yang tersimpan di Bunny Storage            |
| recipientName    | Text          |                                              | _Snapshot_ nama penerima saat klaim yang bersifat _immutable_ setelah dikunci |

1. Atribut Pada Class

Tujuan penggunaan atribut pada class untuk menyimpan data kelas magang sebagai unit terkecil pengelompokan peserta, mencakup kapasitas maksimal dan relasi ke bidang yang menaunginya.

Tabel 3.39 Atribut Pada Class

| **Nama Atribut** | **Tipe Data** | **Constraint**                  | **Keterangan**                                                                             |
| ---------------- | ------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| id               | Text          | _Primary Key_                   | _Identifier_ unik kelas magang                                                             |
| fieldId          | Text          | _Foreign Key (field), Not Null_ | ID bidang magang yang menaungi kelas ini                                                   |
| name             | Text          | _Unique, Not Null_              | Nama komposit kelas yang unik secara global (format: \[_Batch_\] - \[Bidang\] - \[Huruf\]) |
| maxStudents      | Integer       | _Not Null_                      | Kapasitas maksimal peserta magang yang dapat bergabung dalam satu kelas                    |
| createdAt        | Timestamp     | _Not Null_                      | Waktu kelas magang pertama kali dibuat                                                     |
| updatedAt        | Timestamp     | _Not Null_                      | Waktu terakhir data kelas magang diperbarui                                                |

1. Atribut Pada Course

Tujuan penggunaan atribut pada course untuk menyimpan seluruh informasi kursus di katalog platform, mencakup konten, harga, informasi instruktur, status publikasi, dan metadata SEO.

Tabel 3.40 Atribut Pada Course

| **Nama Atribut**  | **Tipe Data** | **Constraint**                     | **Keterangan**                                                                            |
| ----------------- | ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| id                | Text          | _Primary Key_                      | _Identifier_ unik kursus                                                                  |
| title             | Text          | _Not Null_                         | Judul kursus yang ditampilkan di katalog dan halaman detail                               |
| slug              | Text          | _Unique, Not Null_                 | _Identifier_ _URL-friendly_ kursus yang digunakan untuk navigasi halaman (_SEO-friendly_) |
| description       | Text          | _Not Null_                         | Deskripsi lengkap kursus yang ditampilkan di halaman detail                               |
| categoryId        | Text          | _Foreign Key (category), Not Null_ | ID kategori yang mengelompokkan kursus ini di katalog                                     |
| thumbnailUrl      | Text          | _Not Null_                         | URL gambar thumbnail kursus yang ditampilkan di katalog                                   |
| price             | Integer       | _Not Null_                         | Harga kursus dalam satuan Rupiah (IDR)                                                    |
| fakePrice         | Integer       |                                    | Harga coret yang ditampilkan sebagai harga sebelum diskon (opsional)                      |
| estimatedDuration | Integer       |                                    | Estimasi total durasi kursus dalam menit yang diisi manual oleh admin                     |
| instructor        | Text          | _Not Null_                         | Nama pengajar atau instruktur kursus                                                      |
| instructorBio     | Text          | _Not Null_                         | Biografi singkat instruktur yang ditampilkan di halaman detail kursus                     |
| instructorImg     | Text          | _Not Null_                         | URL foto instruktur yang ditampilkan di halaman detail kursus                             |
| status            | CourseStatus  | _Not Null_                         | Status publikasi kursus; _DRAFT, PUBLISHED,_ atau _ARCHIVED_                              |
| createdAt         | Timestamp     | _Not Null_                         | Waktu kursus pertama kali dibuat                                                          |
| updatedAt         | Timestamp     | _Not Null_                         | Waktu terakhir data kursus diperbarui                                                     |
| shortDescription  | Varchar       |                                    | Deskripsi singkat kursus untuk tampilan _preview_ di katalog                              |
| isFeatured        | Boolean       | _Not Null_                         | Penanda apakah kursus ditampilkan sebagai kursus unggulan di beranda platform             |
| publishedAt       | Timestamp     |                                    | Waktu pertama kali kursus diubah ke status _Published_                                    |

1. Atribut Pada Course_Benefit

Tujuan penggunaan atribut pada course_benefits untuk menyimpan daftar poin manfaat kursus yang ditampilkan pada halaman detail sebagai informasi pendukung keputusan pembelian bagi calon peserta.

Tabel 3.41 Atribut Pada Course_Benefit

| **Nama Atribut** | **Tipe Data** | **Constraint**                   | **Keterangan**                                                        |
| ---------------- | ------------- | -------------------------------- | --------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                    | _Identifier_ unik poin benefit kursus                                 |
| courseId         | Text          | _Foreign Key (course), Not Null_ | ID kursus yang memiliki poin benefit ini                              |
| text             | Text          | _Not Null_                       | Teks deskripsi poin benefit yang akan dipelajari pengguna dari kursus |
| order            | Integer       | _Not Null_                       | Urutan tampil poin benefit dalam halaman detail kursus                |

1. Atribut Pada Course_Faq

Tujuan penggunaan atribut pada course_faq untuk menyimpan pasangan pertanyaan dan jawaban yang sering diajukan terkait kursus, yang ditampilkan pada halaman detail untuk membantu calon pembeli sebelum melakukan transaksi.

Tabel 3.42 Atribut Pada Course_Faq

| **Nama Atribut** | **Tipe Data** | **Constraint**                   | **Keterangan**                                     |
| ---------------- | ------------- | -------------------------------- | -------------------------------------------------- |
| id               | Text          | _Primary Key_                    | _Identifier_ unik FAQ kursus                       |
| courseId         | Text          | _Foreign Key (course), Not Null_ | ID kursus yang memiliki FAQ ini                    |
| question         | Text          | _Not Null_                       | Pertanyaan yang sering diajukan terkait kursus ini |
| answer           | Text          | _Not Null_                       | Jawaban atas pertanyaan FAQ                        |
| order            | Integer       | _Not Null_                       | Urutan tampil FAQ dalam halaman detail kursus      |

1. Atribut Pada Course_Slug_History

Tujuan penggunaan atribut pada course*slug_history untuk menyimpan riwayat perubahan \_slug* kursus beserta waktu dan pelaku perubahannya, sehingga sistem dapat menangani pengalihan URL lama ke _slug_ aktif secara otomatis tanpa memutus akses pengguna yang menyimpan tautan sebelumnya.

Tabel 3.43 Atribut Pada Course_Slug_History

| **Nama Atribut** | **Tipe Data** | **Constraint** | **Keterangan**                                                                                           |
| ---------------- | ------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_  | _Identifier_ unik FAQ kursus                                                                             |
| courseId         | Text          | _Not Null_     | Referensi ke kursus yang mengalami perubahan _slug_                                                      |
| slug             | Text          | _Not Null_     | Nilai _slug_ lama kursus sebelum diperbarui yang digunakan sebagai acuan pengalihan URL otomatis         |
| changedById      | Text          |                | ID pengguna yang melakukan perubahan _slug_; kosong jika perubahan dilakukan oleh sistem secara otomatis |
| changedAt        | Timestamp     | _Not Null_     | Waktu perubahan _slug_ kursus dilakukan                                                                  |

1. Atribut Pada Enrollment

Tujuan penggunaan atribut pada enrollment untuk menyimpan data kepemilikan akses kursus pengguna setelah pembayaran berhasil, sekaligus melacak persentase progres dan status penyelesaian kursus.

Tabel 3.44 Atribut Pada Enrollment

| **Nama Atribut** | **Tipe Data** | **Constraint**                   | **Keterangan**                                                         |
| ---------------- | ------------- | -------------------------------- | ---------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                    | _Identifier_ unik _enrollment_ atau kepemilikan kursus pengguna        |
| userId           | Text          | _Foreign Key (user), Not Null_   | ID pengguna yang memiliki akses kursus                                 |
| courseId         | Text          | _Foreign Key (course), Not Null_ | ID kursus yang dimiliki pengguna                                       |
| enrolledAt       | Timestamp     | _Not Null_                       | Waktu pengguna mendapatkan akses kursus setelah pembayaran berhasil    |
| completedAt      | Timestamp     |                                  | Waktu pengguna menyelesaikan seluruh materi kursus dengan progres 100% |
| progressPct      | Float         | _Not Null_                       | Persentase progres penyelesaian kursus dalam rentang 0.0 hingga 100.0  |
| lastAccessedAt   | Timestamp     |                                  | Waktu terakhir pengguna mengakses dan membuka kursus                   |

1. Atribut Pada Exp_Log

Tujuan penggunaan atribut pada exp_log untuk menyimpan riwayat setiap transaksi pemberian EXP kepada pengguna, mencakup sumber aktivitas dan jumlah poin sebagai dasar audit sistem gamifikasi.

Tabel 3.45 Atribut Pada Exp_Log

| **Nama Atribut** | **Tipe Data** | **Constraint**                 | **Keterangan**                                                                      |
| ---------------- | ------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                  | _Identifier_ unik entri _log_ EXP                                                   |
| userId           | Text          | _Foreign Key (user), Not Null_ | ID pengguna yang menerima EXP                                                       |
| amount           | Integer       | _Not Null_                     | Jumlah EXP yang diberikan pada transaksi ini                                        |
| source           | ExpSource     | _Not Null_                     | Sumber aktivitas pemberian EXP; _VIDEO_COMPLETE, QUIZ_PASS,_ atau _COURSE_COMPLETE_ |
| refId            | Text          | _Not Null_                     | ID entitas sumber EXP seperti ID _step_ video, _step_ _quiz_, atau kursus           |
| createdAt        | Timestamp     | _Not Null_                     | Waktu EXP diberikan kepada pengguna                                                 |

1. Atribut Pada Field

Tujuan penggunaan atribut pada field untuk menyimpan data bidang keahlian dalam setiap _batch_ magang sebagai tingkat pengelompokan di atas kelas dalam hierarki struktur program magang.

Tabel 3.46 Atribut Pada Field

| **Nama Atribut** | **Tipe Data** | **Constraint**                  | **Keterangan**                                                              |
| ---------------- | ------------- | ------------------------------- | --------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                   | _Identifier_ unik bidang magang                                             |
| batchId          | Text          | _Foreign Key (batch), Not Null_ | ID _batch_ magang yang menaungi bidang ini                                  |
| name             | Text          | _Not Null_                      | Nama bidang magang (misal: Web Programming, Data Analyst)                   |
| createdAt        | Timestamp     | _Not Null_                      | Waktu data bidang magang pertama kali dibuat                                |
| fieldCode        | Text          | _Not Null_                      | Kode unik bidang magang yang menjadi komponen pembentuk nomor induk peserta |

1. Atribut Pada Final_Grade

Tujuan penggunaan atribut pada final_grade untuk menyimpan nilai akhir magang peserta yang diberikan mentor, mencakup catatan penilaian dan pencatatan pengguna yang terakhir mengubah nilai untuk akuntabilitas.

Tabel 3.47 Atribut Pada Final_Grade

| **Nama Atribut** | **Tipe Data** | **Constraint**                         | **Keterangan**                                                                     |
| ---------------- | ------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                          | _Identifier_ unik catatan nilai akhir magang                                       |
| studentId        | Text          | _Foreign Key (user), Unique, Not Null_ | ID peserta magang yang dinilai; satu nilai akhir per peserta                       |
| mentorId         | Text          | _Foreign Key (user), Not Null_         | ID mentor penanggung jawab penilaian akhir peserta                                 |
| grade            | Integer       |                                        | Nilai akhir magang dalam skala 0 hingga 100; kosong berarti belum dinilai          |
| gradedAt         | Timestamp     |                                        | Waktu nilai akhir pertama kali diisi oleh mentor                                   |
| lastEditedById   | Text          | _Foreign Key (user)_                   | ID pengguna yang terakhir kali mengubah nilai akhir peserta                        |
| updatedAt        | Timestamp     | _Not Null_                             | Waktu terakhir data nilai akhir diperbarui                                         |
| note             | Text          |                                        | Catatan penilaian dari mentor untuk peserta magang                                 |
| isLocked         | Boolean       | _Not Null, Default: false_             | Status penguncian nilai oleh admin: jika _true_, mentor tidak dapat mengedit nilai |
| lockedAt         | Timestamp     |                                        | Waktu saat nilaii akhir dikunci oleh administrator                                 |
| lockedById       | Text          | _Foreign Key (user)_                   | ID administrator yang melakukan penguncian nilai akhir                             |
| overrideReason   | Text          |                                        | Alasan administrator dari perubahan/_override_ nilai akhir terakhir oleh admin     |

1. Atribut Pada Holiday

Tujuan penggunaan atribut pada holiday untuk menyimpan daftar hari libur yang berlaku secara global bagi seluruh peserta dan mentor sehingga tidak dihitung sebagai ketidakhadiran dalam rekap absensi.

Tabel 3.48 Atribut Pada Holiday

| **Nama Atribut** | **Tipe Data** | **Constraint** | **Keterangan**                                                                   |
| ---------------- | ------------- | -------------- | -------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_  | _Identifier_ unik data hari libur                                                |
| startDate        | Date          | _Not Null_     | Tanggal hari pertama periode libur                                               |
| days             | Integer       | _Not Null_     | Durasi hari libur dalam jumlah hari                                              |
| endDate          | Date          | _Not Null_     | Tanggal hari terakhir libur, dihitung otomatis dari _start_date_ dan jumlah hari |
| description      | Text          | _Not Null_     | Keterangan nama atau alasan hari libur                                           |
| createdAt        | Timestamp     | _Not Null_     | Waktu data hari libur pertama kali dibuat                                        |
| updatedAt        | Timestamp     | _Not Null_     | Waktu terakhir data hari libur diperbarui                                        |

1. Atribut Pada Internship_Profile

Tujuan penggunaan atribut pada internship_profile untuk menyimpan informasi tambahan Peserta Magang yang tidak terdapat pada tabel user, yaitu kelas magang yang diikuti dan institusi asal peserta.

Tabel 3.49 Atribut Pada Internship_Profile

| **Nama Atribut**   | **Tipe Data** | **Constraint**                       | **Keterangan**                                                                                  |
| ------------------ | ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| id                 | Text          | Primary Key                          | Identifier unik profil peserta magang                                                           |
| userId             | Text          | Foreign Key (user), Unique, Not Null | ID pengguna pemilik profil; satu profil magang per pengguna                                     |
| classId            | Text          | Foreign Key (class), Not Null        | ID kelas magang yang diikuti oleh peserta                                                       |
| institution        | Text          |                                      | Nama institusi asal peserta seperti universitas atau SMK (opsional)                             |
| registrationNumber | Text          | Not Null                             | Nomor induk peserta magang yang dibentuk dari kombinasi kode batch, kode bidang, dan nomor urut |

1. Atribut Pada Mentor_Profile

Tujuan penggunaan atribut pada mentor*profile untuk menyimpan informasi tambahan Mentor yang tidak terdapat pada tabel \_user*, yaitu kelas yang dibimbing dan jenis kelamin untuk keperluan sapaan honorifik di dashboard.

Tabel 3.50 Atribut Pada Mentor_Profile

| **Nama Atribut** | **Tipe Data** | **Constraint**                         | **Keterangan**                                                                          |
| ---------------- | ------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                          | _Identifier_ unik profil mentor                                                         |
| userId           | Text          | _Foreign Key (user), Unique, Not Null_ | ID pengguna pemilik profil; satu profil mentor per pengguna                             |
| classId          | Text          | _Foreign Key (class), Not Null_        | ID kelas magang yang dibimbing oleh mentor                                              |
| gender           | Gender        |                                        | Jenis kelamin mentor (_MALE_ atau _FEMALE_) untuk keperluan sapaan honorifik (opsional) |

1. Atribut Pada Notification

Tujuan penggunaan atribut pada notification untuk menyimpan notifikasi _in-app_ yang dikirim kepada pengguna berdasarkan aktivitas di platform, mencakup judul, pesan, jenis notifikasi, dan status keterbacaan.

Tabel 3.51 Atribut Pada Notification

| **Nama Atribut** | **Tipe Data**    | **Constraint**               | **Keterangan**                                                                            |
| ---------------- | ---------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| id               | Text             | Primary Key                  | Identifier unik notifikasi                                                                |
| userId           | Text             | Foreign Key (user), Not Null | ID pengguna penerima notifikasi                                                           |
| title            | Text             | Not Null                     | Judul notifikasi yang ditampilkan kepada pengguna                                         |
| message          | Text             | Not Null                     | Isi pesan notifikasi yang memberikan detail informasi kepada pengguna                     |
| type             | NotificationType | Not Null                     | Jenis atau kategori notifikasi (TASK_ASSIGNED, PURCHASE_SUCCESS, CERTIFICATE_READY, dll.) |
| refId            | Text             |                              | ID entitas terkait notifikasi seperti ID tugas atau order (opsional)                      |
| isRead           | Boolean          | Not Null                     | Status apakah notifikasi sudah dibaca oleh pengguna                                       |
| createdAt        | Timestamp        | Not Null                     | Waktu notifikasi dibuat dan dikirimkan kepada pengguna                                    |

1. Atribut Pada Order

Tujuan penggunaan atribut pada order untuk menyimpan data transaksi pembelian kursus, mencakup rincian harga, status pembayaran, dan data integrasi dengan Midtrans _payment gateway_.

Tabel 3.52 Atribut Pada Order

| **Nama Atribut**   | **Tipe Data** | **Constraint**                   | **Keterangan**                                                                   |
| ------------------ | ------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| id                 | Text          | _Primary Key_                    | _Identifier_ unik transaksi pembelian kursus                                     |
| userId             | Text          | _Foreign Key (user), Not Null_   | ID pengguna yang melakukan pembelian kursus                                      |
| courseId           | Text          | _Foreign Key (course), Not Null_ | ID kursus yang dibeli oleh pengguna                                              |
| voucherId          | Text          | _Foreign Key (voucher)_          | ID voucher yang digunakan saat _checkout_; kosong jika tidak menggunakan voucher |
| originalPrice      | Integer       | _Not Null_                       | Harga asli kursus sebelum diskon dalam satuan Rupiah                             |
| discountAmount     | Integer       | _Not Null_                       | Jumlah potongan harga dari voucher; bernilai 0 jika tidak menggunakan voucher    |
| finalPrice         | Integer       | _Not Null_                       | Harga _final_ yang harus dibayar pengguna setelah diskon voucher                 |
| status             | OrderStatus   | _Not Null_                       | Status pembayaran; _PENDING, SUCCESS, FAILED, EXPIRED,_ atau _CANCELED_          |
| paymentInvoiceId   | Text          | _Unique_                         | ID _invoice_ dari Midtrans yang digunakan sebagai referensi pembayaran           |
| paymentMethod      | Text          |                                  | Metode pembayaran yang digunakan, diisi berdasarkan data dari Midtrans           |
| expiresAt          | Timestamp     | _Not Null_                       | Waktu kedaluwarsa _order_ (60 menit sejak _pop-up_ pembayaran dibuka)            |
| paidAt             | Timestamp     |                                  | Waktu pembayaran dikonfirmasi berhasil oleh _webhook_ Midtrans                   |
| createdAt          | Timestamp     | _Not Null_                       | Waktu _order_ pertama kali dibuat                                                |
| updatedAt          | Timestamp     | _Not Null_                       | Waktu terakhir data _order_ diperbarui                                           |
| paymentRedirectUrl | Text          |                                  | URL _redirect_ dari _payment gateway_ setelah proses pembayaran selesai          |
| paymentToken       | Text          |                                  | Token Snap dari Midtrans untuk membuka _pop-up_ pembayaran kepada pengguna       |
| deletedAt          | Timestamp     |                                  | Waktu _order_ dihapus secara _soft delete_; data tetap tersimpan di _database_   |
| customerPhone      | Text          |                                  | Nomor telepon pembeli dalam format E.164 (opsional)                              |

1. Atribut Pada Payment_Webhook_Event

Tujuan penggunaan atribut pada payment*webhook_event untuk menyimpan \_log event* _webhook_ dari Midtrans sebagai dasar audit pembayaran dan jaminan _idempotency_ agar tidak terjadi pemrosesan transaksi secara ganda.

Tabel 3.53 Atribut Pada Payment_Webhook_Event

| **Nama Atribut** | **Tipe Data** | **Constraint**        | **Keterangan**                                                        |
| ---------------- | ------------- | --------------------- | --------------------------------------------------------------------- |
| id               | Text          | _Primary Key_         | _Identifier_ unik _event_ _webhook_ pembayaran                        |
| orderId          | Text          | _Foreign Key (order)_ | ID _order_ yang terkait dengan _event_ _webhook_ ini                  |
| provider         | Text          | _Not Null_            | Nama _payment gateway_ pengirim _webhook_ (misal: midtrans)           |
| externalId       | Text          |                       | ID transaksi dari sisi _payment gateway_ sebagai referensi eksternal  |
| signature        | Text          |                       | Tanda tangan digital untuk validasi keabsahan _webhook_ yang diterima |
| payload          | JSONB         | _Not Null_            | Data lengkap _payload_ _webhook_ yang diterima dari _payment gateway_ |
| receivedAt       | Timestamp     | _Not Null_            | Waktu _server_ berhasil menerima _webhook_ dari _payment gateway_     |
| processedAt      | Timestamp     |                       | Waktu _webhook_ selesai diproses oleh sistem platform                 |
| processingErr    | Text          |                       | Pesan _error_ jika terjadi kegagalan saat memproses _webhook_         |

1. Atribut Pada Platform_Setting

Tujuan penggunaan atribut pada platform*setting untuk menyimpan konfigurasi global platform dalam format \_key-value* yang dapat diubah administrator, seperti pengaturan masa berlaku sertifikat dan informasi publik platform.

Tabel 3.54 Atribut Pada Platform_Setting

| **Nama Atribut** | **Tipe Data** | **Constraint**       | **Keterangan**                                                           |
| ---------------- | ------------- | -------------------- | ------------------------------------------------------------------------ |
| id               | Text          | _Primary Key_        | _Identifier_ unik pengaturan platform                                    |
| key              | Text          | _Unique, Not Null_   | Kunci unik pengaturan (misal: _CERTIFICATE_EXPIRY_YEARS, PLATFORM_INFO_) |
| value            | Text          | _Not Null_           | Nilai pengaturan dalam bentuk _string_ atau JSON yang diserialisasi      |
| updatedAt        | Timestamp     | _Not Null_           | Waktu terakhir pengaturan ini diperbarui                                 |
| updatedBy        | Text          | _Foreign Key (user)_ | ID administrator yang terakhir kali mengubah pengaturan ini              |

1. Atribut Pada Quiz

Tujuan penggunaan atribut pada quiz untuk menyimpan konfigurasi dasar kuis pada _step_ bertipe _quiz_, khususnya nilai minimum kelulusan yang menjadi acuan evaluasi hasil pengerjaan pengguna.

Tabel 3.55 Atribut Pada Quiz

| **Nama Atribut** | **Tipe Data** | **Constraint**                       | **Keterangan**                                                        |
| ---------------- | ------------- | ------------------------------------ | --------------------------------------------------------------------- |
| id               | Text          | Primary Key                          | Identifier unik kuis                                                  |
| stepId           | Text          | Foreign Key (step), Unique, Not Null | ID step yang berisi kuis ini; satu kuis per step                      |
| passingScore     | Integer       | Not Null                             | Nilai minimum yang diperlukan untuk lulus kuis (default: 80 dari 100) |

1. Atribut Pada Quiz_Question

Tujuan penggunaan atribut pada quiz*question untuk menyimpan soal pilihan ganda dalam sebuah kuis, mencakup teks atau gambar pertanyaan, \_array* pilihan jawaban, dan indeks jawaban yang benar.

Tabel 3.56 Atribut Pada Quiz_Question

| **Nama Atribut** | **Tipe Data** | **Constraint**                 | **Keterangan**                                                   |
| ---------------- | ------------- | ------------------------------ | ---------------------------------------------------------------- |
| id               | Text          | _Primary Key_                  | _Identifier_ unik soal kuis                                      |
| quizId           | Text          | _Foreign Key (quiz), Not Null_ | ID kuis yang memiliki soal ini                                   |
| question         | Text          |                                | Teks pertanyaan soal; kosong jika soal menggunakan format gambar |
| questionImageUrl | Text          |                                | URL gambar pertanyaan; kosong jika soal berupa teks              |
| options          | JSONB         | _Not Null_                     | _Array_ pilihan jawaban yang tersedia dalam format JSON          |
| answer           | Integer       | _Not Null_                     | Indeks jawaban benar dalam _array_ pilihan (berbasis indeks 0)   |
| order            | Integer       | _Not Null_                     | Urutan tampil soal dalam kuis                                    |

1. Atribut Pada Session

Tujuan penggunaan atribut pada session untuk menyimpan data sesi autentikasi aktif pengguna, mencakup token unik yang disimpan di _HTTP-only cookie_ beserta informasi perangkat dan masa berlaku sesi.

Tabel 3.57 Atribut Pada Session

| **Nama Atribut** | **Tipe Data** | **Constraint**               | **Keterangan**                                               |
| ---------------- | ------------- | ---------------------------- | ------------------------------------------------------------ |
| id               | Text          | Primary Key                  | Identifier unik sesi autentikasi                             |
| userId           | Text          | Foreign Key (user), Not Null | ID pengguna pemilik sesi autentikasi ini                     |
| token            | Text          | Unique, Not Null             | Token sesi unik yang disimpan di HTTP-only cookie pengguna   |
| expiresAt        | Timestamp     | Not Null                     | Waktu kedaluwarsa sesi login pengguna                        |
| ipAddress        | Text          |                              | Alamat IP perangkat saat sesi autentikasi dibuat             |
| userAgent        | Text          |                              | Informasi browser dan perangkat saat sesi autentikasi dibuat |
| createdAt        | Timestamp     | Not Null                     | Waktu sesi autentikasi pertama kali dibuat                   |
| updatedAt        | Timestamp     | Not Null                     | Waktu terakhir data sesi diperbarui                          |

1. Atribut Pada Sprint

Tujuan penggunaan atribut pada sprint untuk menyimpan data modul atau bab dalam struktur kurikulum kursus sebagai wadah bagi tahap-tahap pembelajaran yang diurutkan secara sekuensial.

Tabel 3.58 Atribut Pada Sprint

| **Nama Atribut** | **Tipe Data** | **Constraint**                   | **Keterangan**                                                   |
| ---------------- | ------------- | -------------------------------- | ---------------------------------------------------------------- |
| id               | Text          | _Primary Key_                    | _Identifier_ unik _sprint_ atau modul kursus                     |
| courseId         | Text          | _Foreign Key (course), Not Null_ | ID kursus yang memiliki _sprint_ ini                             |
| title            | Text          | _Not Null_                       | Judul _sprint_ atau modul yang ditampilkan kepada pengguna       |
| order            | Integer       | _Not Null_                       | Urutan tampil _sprint_ dalam kursus yang menentukan alur belajar |

1. Atribut Pada Step

Tujuan penggunaan atribut pada step untuk menyimpan unit pembelajaran terkecil dalam _sprint_, mencakup jenis konten (video atau kuis), urutan tampil, dan deskripsi materi yang membentuk alur belajar terstruktur.

Tabel 3.59 Atribut Pada Step

| **Nama Atribut** | **Tipe Data** | **Constraint**                   | **Keterangan**                                                                        |
| ---------------- | ------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                    | _Identifier_ unik tahap atau _step_ kursus                                            |
| sprintId         | Text          | _Foreign Key (sprint), Not Null_ | ID _sprint_ yang memiliki _step_ ini                                                  |
| title            | Text          | _Not Null_                       | Judul tahap atau _step_ yang ditampilkan kepada pengguna                              |
| type             | StepType      | _Not Null_                       | Jenis konten tahap; VIDEO untuk video pembelajaran atau _QUIZ_ untuk kuis             |
| order            | Integer       | _Not Null_                       | Urutan tampil _step_ dalam _sprint_ yang menentukan alur belajar                      |
| description      | Text          | _Not Null_                       | Deskripsi atau catatan materi tahap yang ditampilkan di _tab_ Deskripsi pada _player_ |

1. Atribut Pada Step_Note

Tujuan penggunaan atribut pada step*note untuk menyimpan catatan pribadi pengguna pada setiap tahap kursus yang tersinkronisasi lintas perangkat dengan mekanisme \_autosave* berbasis _debounce_.

Tabel 3.60 Atribut Pada Step_Note

| **Nama Atribut** | **Tipe Data** | **Constraint**                     | **Keterangan**                                                  |
| ---------------- | ------------- | ---------------------------------- | --------------------------------------------------------------- |
| id               | Text          | Primary Key                        | Identifier unik catatan step pengguna                           |
| enrollmentId     | Text          | Foreign Key (enrollment), Not Null | ID enrollment pengguna sebagai identifikasi kepemilikan catatan |
| stepId           | Text          | Foreign Key (step), Not Null       | ID step tempat catatan dibuat oleh pengguna                     |
| content          | Text          | Not Null                           | Isi catatan yang ditulis pengguna pada step tersebut            |
| createdAt        | Timestamp     | Not Null                           | Waktu catatan pertama kali disimpan oleh pengguna               |
| updatedAt        | Timestamp     | Not Null                           | Waktu terakhir catatan diperbarui melalui mekanisme autosave    |

1. Atribut Pada Step_Progress

Tujuan penggunaan atribut pada step*progress untuk melacak status penyelesaian setiap tahap kursus oleh pengguna, mencakup skor kuis, jumlah percobaan, dan waktu \_cooldown* setelah kegagalan berulang.

Tabel 3.61 Atribut Pada Step_Progress

| **Nama Atribut** | **Tipe Data** | **Constraint**                       | **Keterangan**                                                         |
| ---------------- | ------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                        | _Identifier_ unik catatan progres tahap                                |
| enrollmentId     | Text          | _Foreign Key (enrollment), Not Null_ | ID _enrollment_ pengguna                                               |
| stepId           | Text          | _Foreign Key (step), Not Null_       | ID _step_ yang dipantau progresnya                                     |
| isCompleted      | Boolean       | _Not Null_                           | Status apakah _step_ telah berhasil diselesaikan oleh pengguna         |
| completedAt      | Timestamp     |                                      | Waktu _step_ berhasil diselesaikan oleh pengguna                       |
| quizScore        | Float         |                                      | Skor terakhir pengerjaan kuis; hanya diisi untuk _step_ bertipe _QUIZ_ |
| quizAttempts     | Integer       | _Not Null_                           | Jumlah total percobaan mengerjakan kuis oleh pengguna                  |
| cooldownUntil    | Timestamp     |                                      | Waktu berakhirnya _cooldown_ setelah tiga kali gagal kuis              |

1. Atribut Pada Task

Tujuan penggunaan atribut pada task untuk menyimpan tugas yang dibuat mentor bagi peserta magang di kelasnya, mencakup instruksi pengerjaan, tenggat waktu, dan lampiran pendukung yang bersifat opsional.

Tabel 3.62 Atribut Pada Task

| **Nama Atribut** | **Tipe Data** | **Constraint**                  | **Keterangan**                                                     |
| ---------------- | ------------- | ------------------------------- | ------------------------------------------------------------------ |
| id               | Text          | _Primary Key_                   | _Identifier_ unik tugas magang                                     |
| mentorId         | Text          | _Foreign Key (user), Not Null_  | ID mentor yang membuat dan mendistribusikan tugas                  |
| batchId          | Text          | _Foreign Key (batch), Not Null_ | ID _batch_ magang yang menjadi konteks tugas                       |
| fieldId          | Text          | _Foreign Key (field), Not Null_ | ID bidang magang yang menjadi konteks tugas                        |
| classId          | Text          | _Foreign Key (class), Not Null_ | ID kelas magang yang menjadi target distribusi tugas               |
| title            | Text          | _Not Null_                      | Judul tugas yang ditampilkan kepada peserta magang                 |
| description      | Text          | _Not Null_                      | Deskripsi atau instruksi pengerjaan tugas secara lengkap           |
| attachmentUrl    | Text          |                                 | URL lampiran _file_ atau tautan eksternal terkait tugas (opsional) |
| deadline         | Timestamp     | _Not Null_                      | Batas waktu pengumpulan tugas oleh peserta magang                  |
| createdAt        | Timestamp     | _Not Null_                      | Waktu tugas pertama kali dibuat oleh mentor                        |
| updatedAt        | Timestamp     | _Not Null_                      | Waktu terakhir data tugas diperbarui                               |
| attachmentName   | Text          |                                 | Nama _file_ lampiran tugas untuk ditampilkan kepada peserta        |
| attachmentSize   | Integer       |                                 | Ukuran _file_ lampiran dalam byte                                  |

1. Atribut Pada Task_Submission

Tujuan penggunaan atribut pada task*submission untuk menyimpan data pengumpulan tugas peserta magang, mencakup \_file* yang dikirim, status pengumpulan, dan _feedback_ yang diberikan mentor.

Tabel 3.63 Atribut Pada Task_Submission

| **Nama Atribut**   | **Tipe Data**    | **Constraint**                 | **Keterangan**                                                               |
| ------------------ | ---------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| id                 | Text             | _Primary Key_                  | _Identifier_ unik pengumpulan tugas                                          |
| taskId             | Text             | _Foreign Key (task), Not Null_ | ID tugas yang dikumpulkan oleh peserta                                       |
| studentId          | Text             | _Foreign Key (user), Not Null_ | ID peserta magang yang mengumpulkan tugas                                    |
| submissionUrl      | Text             |                                | URL _file_ atau tautan hasil pengerjaan tugas yang dikumpulkan               |
| notes              | Text             |                                | Catatan tambahan dari peserta saat mengumpulkan tugas                        |
| status             | SubmissionStatus | _Not Null_                     | Status pengumpulan tugas; _NOT_SUBMITTED_ jika belum, _SUBMITTED_ jika sudah |
| feedbackText       | Text             |                                | Teks _feedback_ dari mentor saat mengembalikan tugas untuk direvisi          |
| reviewedAt         | Timestamp        |                                | Waktu mentor memberikan keputusan atau _feedback_ atas pengumpulan tugas     |
| submittedAt        | Timestamp        | _Not Null_                     | Waktu terakhir peserta melakukan pengumpulan tugas                           |
| updatedAt          | Timestamp        | _Not Null_                     | Waktu terakhir data pengumpulan tugas diperbarui                             |
| submissionFileName | Text             |                                | Nama _file_ yang dikumpulkan peserta untuk ditampilkan di antarmuka          |
| submissionFileSize | Integer          |                                | Ukuran _file_ yang dikumpulkan peserta dalam byte                            |

1. Atribut Pada User

Tujuan penggunaan atribut pada user untuk menyimpan data akun seluruh pengguna platform, mencakup identitas, email, peran, dan status akun sebagai entitas utama yang direferensi oleh hampir seluruh tabel lainnya dalam sistem.

Tabel 3.64 Atribut Pada User

| **Nama Atribut**   | **Tipe Data** | **Constraint**     | **Keterangan**                                                                                                    |
| ------------------ | ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| id                 | Text          | _Primary Key_      | _Identifier_ unik pengguna                                                                                        |
| email              | Text          | _Unique, Not Null_ | Alamat email pengguna yang digunakan untuk _login_ dan komunikasi                                                 |
| emailVerified      | Boolean       | _Not Null_         | Status apakah alamat email pengguna sudah diverifikasi                                                            |
| name               | Text          | _Not Null_         | Nama lengkap pengguna                                                                                             |
| image              | Text          |                    | URL foto profil pengguna                                                                                          |
| createdAt          | Timestamp     | _Not Null_         | Waktu akun pengguna pertama kali dibuat                                                                           |
| updatedAt          | Timestamp     | _Not Null_         | Waktu terakhir data pengguna diperbarui                                                                           |
| role               | Role          | _Not Null_         | Peran pengguna yang menentukan hak akses dalam sistem (PESERTA_DIDIK, PESERTA_MAGANG, MENTOR, atau ADMINISTRATOR) |
| username           | Text          | _Unique_           | _Username_ unik pengguna yang dapat diatur secara opsional                                                        |
| bio                | Text          |                    | Biografi singkat pengguna (opsional)                                                                              |
| isActive           | Boolean       | _Not Null_         | Status aktif akun; bernilai _false_ jika akun dinonaktifkan oleh administrator                                    |
| deletedAt          | Timestamp     |                    | Waktu akun dihapus secara _soft delete_; data tetap tersimpan di _database_                                       |
| mustChangePassword | Boolean       | _Not Null_         | Penanda apakah pengguna diwajibkan mengganti _password_ pada _login_ berikutnya                                   |

1. Atribut Pada User_Badge

Tujuan penggunaan atribut pada user*badge untuk menyimpan catatan \_badge* yang diperoleh pengguna beserta _snapshot_ nama _badge_ saat perolehan, guna menjaga integritas riwayat pencapaian meskipun data _badge_ asli dihapus.

Tabel 3.65 Atribut Pada User_Badge

| **Nama Atribut** | **Tipe Data** | **Constraint**                 | **Keterangan**                                                                 |
| ---------------- | ------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| id               | Text          | _Primary Key_                  | _Identifier_ unik catatan perolehan _badge_ pengguna                           |
| userId           | Text          | _Foreign Key (user), Not Null_ | ID pengguna pemilik _badge_ yang diperoleh                                     |
| badgeId          | Text          | _Foreign Key (badge)_          | ID _badge_ yang diperoleh; dapat kosong jika _badge_ telah dihapus dari sistem |
| badgeSnapshot    | Text          | _Not Null_                     | _Snapshot_ nama _badge_ saat diperoleh untuk menjaga riwayat historis pengguna |
| earnedAt         | Timestamp     | _Not Null_                     | Waktu _badge_ berhasil diperoleh oleh pengguna                                 |

1. Atribut Pada User_Game_Profile

Tujuan penggunaan atribut pada user*game_profile untuk menyimpan data profil gamifikasi pengguna, mencakup \_level* aktif, EXP dalam _level_ saat ini, dan total akumulasi EXP sepanjang waktu yang tidak pernah diatur ulang.

Tabel 3.66 Atribut Pada User_Game_Profile

| **Nama Atribut** | **Tipe Data** | **Constraint**                         | **Keterangan**                                                                        |
| ---------------- | ------------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                          | _Identifier_ unik profil gamifikasi pengguna                                          |
| userId           | Text          | _Foreign Key (user), Unique, Not Null_ | ID pengguna pemilik profil gamifikasi; satu profil per pengguna                       |
| exp              | Integer       | _Not Null_                             | EXP saat ini dalam _level_ aktif; diatur ulang ke 0 setiap kali pengguna naik _level_ |
| level            | Integer       | _Not Null_                             | _Level_ aktif pengguna dalam sistem gamifikasi; dimulai dari _level_ 1                |
| totalExp         | Integer       | _Not Null_                             | Total akumulasi EXP pengguna sepanjang waktu yang tidak pernah diatur ulang           |
| updatedAt        | Timestamp     | _Not Null_                             | Waktu terakhir profil gamifikasi pengguna diperbarui                                  |

1. Atribut Pada Verification

Tujuan penggunaan atribut pada verification untuk menyimpan token sementara yang digunakan dalam proses verifikasi email dan _reset password_, dengan masa berlaku terbatas untuk menjaga keamanan autentikasi.

Tabel 3.67 Atribut Pada Verification

| **Nama Atribut** | **Tipe Data** | **Constraint** | **Keterangan**                                                    |
| ---------------- | ------------- | -------------- | ----------------------------------------------------------------- |
| id               | Text          | _Primary Key_  | _Identifier_ unik token verifikasi                                |
| identifier       | Text          | _Not Null_     | Pengenal target verifikasi, biasanya berupa alamat email pengguna |
| value            | Text          | _Not Null_     | Token atau kode verifikasi yang dikirimkan ke email pengguna      |
| expiresAt        | Timestamp     | _Not Null_     | Waktu kedaluwarsa token verifikasi                                |
| createdAt        | Timestamp     | _Not Null_     | Waktu token verifikasi pertama kali dibuat                        |
| updatedAt        | Timestamp     | _Not Null_     | Waktu terakhir data verifikasi diperbarui                         |

1. Atribut Pada Video

Tujuan penggunaan atribut pada video untuk menyimpan metadata video pembelajaran yang diunggah ke Bunny.net, mencakup ID video, durasi konten, dan status pemrosesan yang diperbarui secara otomatis melalui _webhook_.

Tabel 3.68 Atribut Pada Video

| **Nama Atribut** | **Tipe Data** | **Constraint**                         | **Keterangan**                                                                             |
| ---------------- | ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| id               | Text          | _Primary Key_                          | _Identifier_ unik data video pembelajaran                                                  |
| stepId           | Text          | _Foreign Key (step), Unique, Not Null_ | ID _step_ yang memiliki video ini; satu video per _step_                                   |
| bunnyVideoId     | Text          | _Not Null_                             | ID video di Bunny.net yang digunakan untuk manajemen dan _embed player_                    |
| duration         | Integer       | _Not Null_                             | Durasi video dalam satuan detik; diperbarui setelah _webhook_ Bunny diterima               |
| status           | VideoStatus   | _Not Null_                             | Status pemrosesan video di Bunny.net; _PROCESSING, READY,_ atau _FAILED_                   |
| videoUrl         | Text          |                                        | URL CDN HLS _playback_ video; _player_ kursus menggunakan _signed iframe embed_ dari Bunny |
| lastSyncedAt     | Timestamp     |                                        | Waktu terakhir durasi dan status video disinkronisasi dari Bunny API                       |

1. Atribut Pada Video_Archive

Tujuan penggunaan atribut pada video*archive untuk menyimpan riwayat identitas video lama di Bunny.net ketika admin mengganti \_file* video pada sebuah _step_, sebagai rekam jejak audit dan acuan penghapusan terjadwal.

Tabel 3.69 Atribut Pada Video_Archive

| **Nama Atribut** | **Tipe Data** | **Constraint**                  | **Keterangan**                                                                  |
| ---------------- | ------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| id               | Text          | _Primary Key_                   | _Identifier_ unik arsip video lama                                              |
| videoId          | Text          | _Foreign Key (video), Not Null_ | ID data video yang telah mengalami penggantian _file_                           |
| bunnyVideoId     | Text          | _Not Null_                      | ID video lama di Bunny.net yang telah dihapus atau digantikan dengan video baru |
| deletedAt        | Timestamp     | _Not Null_                      | Waktu video lama dihapus dari Bunny.net setelah proses penggantian selesai      |

1. Atribut Pada Voucher

Tujuan penggunaan atribut pada voucher untuk menyimpan data kode diskon yang dapat digunakan saat checkout, mencakup tipe dan nilai diskon, masa berlaku, batas penggunaan, serta pembatasan target pengguna dan kursus.

Tabel 3.70 Atribut Pada Voucher

| **Nama Atribut**  | **Tipe Data**       | **Constraint**           | **Keterangan**                                                                          |
| ----------------- | ------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| id                | Text                | _Primary Key_            | _Identifier_ unik voucher                                                               |
| code              | Text                | _Unique, Not Null_       | Kode voucher yang diinput pengguna saat _checkout_ _(case-sensitive)_                   |
| description       | Text                |                          | Deskripsi atau catatan internal voucher yang hanya terlihat oleh administrator          |
| discountPct       | Integer             | _Not Null_               | Persentase diskon voucher dalam rentang 1 hingga 100 (untuk tipe _PERCENTAGE_)          |
| startDate         | Timestamp           | _Not Null_               | Tanggal dan waktu mulai berlakunya voucher                                              |
| endDate           | Timestamp           | _Not Null_               | Tanggal dan waktu berakhirnya voucher                                                   |
| maxUsage          | Integer             |                          | Batas maksimal total penggunaan voucher; kosong berarti tidak ada batasan               |
| usageCount        | Integer             | _Not Null_               | Jumlah total voucher yang telah digunakan hingga saat ini                               |
| maxUsagePerUser   | Integer             | _Not Null_               | Batas penggunaan voucher per pengguna (_default_: 1 kali per pengguna)                  |
| allowedRole       | VoucherAudience     | _Not Null_               | _Role_ pengguna yang diizinkan menggunakan voucher ini                                  |
| allowedCategoryId | Text                | _Foreign Key (category)_ | ID kategori yang dibatasi; kosong berarti berlaku untuk semua kategori kursus           |
| allowedUserId     | Text                | _Foreign Key (user)_     | ID pengguna spesifik yang diizinkan; kosong berarti berlaku untuk semua pengguna        |
| allowedCourseId   | Text                | _Foreign Key (course)_   | ID kursus yang dibatasi; kosong berarti berlaku untuk semua kursus                      |
| isActive          | Boolean             | _Not Null_               | Status aktif voucher yang dapat dinonaktifkan administrator kapan saja                  |
| isSystemGenerated | Boolean             | _Not Null_               | Penanda voucher dibuat otomatis oleh sistem sebagai _reward_ gamifikasi naik _level_    |
| createdAt         | Timestamp           | _Not Null_               | Waktu voucher pertama kali dibuat                                                       |
| discountAmount    | Integer             |                          | Nilai diskon tetap dalam Rupiah untuk tipe _FIXED_; kosong untuk tipe _PERCENTAGE_      |
| discountType      | VoucherDiscountType | _Not Null_               | Tipe perhitungan diskon; _PERCENTAGE_ untuk persentase atau _FIXED_ untuk nominal tetap |

1. Atribut Pada Voucher_Usage

Tujuan penggunaan atribut pada voucher_usage untuk menyimpan riwayat penggunaan voucher oleh pengguna pada setiap transaksi, sebagai dasar validasi sisa kuota dan audit penggunaan voucher oleh administrator.

Tabel 3.71 Atribut Pada Voucher_Usage

| **Nama Atribut** | **Tipe Data** | **Constraint**                    | **Keterangan**                                           |
| ---------------- | ------------- | --------------------------------- | -------------------------------------------------------- |
| id               | Text          | _Primary Key_                     | _Identifier_ unik catatan penggunaan voucher             |
| voucherId        | Text          | _Foreign Key (voucher), Not Null_ | ID voucher yang digunakan dalam transaksi pembelian      |
| userId           | Text          | _Foreign Key (user), Not Null_    | ID pengguna yang menggunakan voucher                     |
| orderId          | Text          | _Foreign Key (order), Not Null_   | ID _order_ di mana voucher digunakan                     |
| usedAt           | Timestamp     | _Not Null_                        | Waktu voucher digunakan dalam transaksi pembelian kursus |

# BAB IV

HASIL DAN PEMBAHASAN

1.

## 4.1 Hasil

Bab ini memaparkan hasil dari dua fase terakhir dalam siklus pengembangan sistem menggunakan metode _waterfall_, yaitu fase _implementation_ dan fase _testing_. Subbab 4.1.1 menguraikan lingkungan teknis yang menjadi dasar seluruh proses implementasi, mencakup spesifikasi perangkat keras pengembangan, teknologi dan perangkat lunak yang digunakan, infrastruktur produksi, serta konfigurasi lingkungan pengujian. Subbab 4.1.2 menyajikan antarmuka pengguna yang telah diimplementasikan, diorganisasikan berdasarkan aktor sistem sesuai pendekatan perancangan pada Bab 3. Subbab 4.1.3 menyajikan skenario dan hasil pengujian fungsional menggunakan metode _black box testing_, yang juga disusun berdasarkan kelompok aktor. Seluruh hasil tersebut dianalisis pada subbab 4.2 untuk mengevaluasi kesesuaiannya terhadap rumusan masalah dan tujuan penelitian yang ditetapkan pada Bab 1.

## 4.1.1 Lingkungan Implementasi

Lingkungan implementasi mendeskripsikan kondisi teknis yang menjadi dasar proses pengembangan dan operasional platform NextLevel Academy. Pendefinisian lingkungan ini diperlukan dalam kerangka metode _waterfall_, khususnya pada fase implementasi, karena deklarasi _tech stack_ aktual yang digunakan menjadi prasyarat sebelum hasil implementasi dapat disajikan dan diverifikasi. Lingkungan implementasi dalam penelitian ini mencakup empat aspek utama, yaitu perangkat keras pengembangan, teknologi dan perangkat lunak yang digunakan, infrastruktur produksi, dan konfigurasi lingkungan pengujian.

1. Perangkat Keras Pengembangan

Pengembangan platform NextLevel Academy dilaksanakan secara kolaboratif oleh tiga anggota tim menggunakan perangkat keras masing-masing yang berbeda. Meskipun spesifikasinya tidak seragam, seluruh mesin menjalankan Windows 11, sehingga konsistensi lingkungan pengembangan tetap terjaga. Spesifikasi lengkap disajikan pada Tabel 4.1.

Tabel 4.1 Spesifikasi Perangkat Keras Pengembangan

| **No.** | **Pengembang** | **Prosesor**      | **RAM** | **Sistem Operasi** |
| ------- | -------------- | ----------------- | ------- | ------------------ |
| 1.      | Farid Zahran   | AMD Ryzen 5 5600X | 16 GB   | Windows 11         |

1. Teknologi dan Perangkat Lunak yang Digunakan

Platform NextLevel Academy dikembangkan menggunakan arsitektur _fullstack_ berbasis Next.js dengan pendekatan _App Router_, di mana lapisan _frontend_ dan logika bisnis _backend_ diintegrasikan dalam satu _codebase_ tanpa memerlukan _server_ terpisah. Fungsi API _layer_ diimplementasikan menggunakan Route Handlers bawaan Next.js yang beroperasi di sisi _server_, menggantikan peran _server_ _backend_ konvensional dalam satu arsitektur yang kohesif. Seluruh teknologi yang digunakan diorganisasikan berdasarkan fungsi dan lapisannya sebagaimana disajikan pada Tabel 4.2.

Tabel 4.2 Teknologi dan Perangkat Lunak yang Digunakan

| **No.** | **Lapisan/Fungsi**  | **Teknologi**              | **Versi**  | **Keterangan**                                                                                                                                |
| ------- | ------------------- | -------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.      | Framework           | Next.js                    | 16.2.6     | _Fullstack framework_ berbasis App Router, mengintegrasikan frontend dan Route Handlers API dalam satu arsitektur terpadu.                    |
| 2.      | Bahasa Pemrograman  | TypeScript                 | 5          | Superset JavaScript dengan pengetikan statis untuk memastikan keamanan tipe data sepanjang proses pengembangan.                               |
| 3.      | Styling             | Tailwind CSS               | 4          | _Utility-first_ CSS _framework_ untuk pembangunan antarmuka yang responsif dan konsisten.                                                     |
| 4.      | Komponen UI         | shadcn/ui                  | 4.7.0      | Koleksi komponen antarmuka berbasis Radix UI yang dapat dikustomisasi sepenuhnya ke dalam _codebase_ proyek.                                  |
| 5.      | Manajemen State     | TanStack Query             | 5.100.10   | Pengelolaan _server_ _state_, _caching_, dan data _fetching_ di sisi klien secara deklaratif.                                                 |
| 6.      | Validasi Input      | Zod                        | 4.4.3      | Validasi skema data secara _type-safe_ di sisi _frontend_ maupun Route Handlers.                                                              |
| 7.      | Autentikasi         | Better Auth                | 1.6.11     | Manajemen sesi pengguna, verifikasi email, dan kontrol akses berbasis peran (_role-based access_).                                            |
| 8.      | ORM                 | Prisma                     | 7.8        | _Object-Relational Mapper_ untuk pengelolaan skema basis data, migrasi, dan kueri secara _type-safe._                                         |
| 9.      | Basis Data          | PostgreSQL                 | 17.6.1.127 | Sistem manajemen basis data relasional yang dikelola melalui layanan hosting Supabase.                                                        |
| 10.     | Hosting Video & CDN | Bunny.net                  |            | Layanan hosting dan streaming video dengan pemrosesan encoding otomatis, distribusi melalui CDN, serta perlindungan akses melalui signed URL. |
| 11.     | Payment Gateway     | Midtrans (midtrans-client) | 1.4.3      | Integrasi payment gateway lokal Indonesia untuk pemrosesan transaksi pembelian kursus secara daring.                                          |
| 12.     | Layanan Email       | Resend                     | 6.12.3     | Pengiriman email transaksional melalui API modern dengan kemampuan deliverability tinggi.                                                     |
| 13.     | Template Email      | React Email                | 6.1.3      | Pembuatan template email transaksional berbasis komponen React/JSX yang dirender menjadi HTML pada saat pengiriman.                           |

1. Infrastruktur Produksi

Platform NextLevel Academy telah _di-deploy_ pada infrastruktur produksi dan dapat diakses secara publik. Proses _deployment_ dilakukan di atas layanan _Virtual Private Server_ (VPS) yang disediakan oleh RumahWeb Indonesia. Spesifikasi lengkap infrastruktur produksi disajikan pada Tabel 4.3.

Tabel 4.3 Spesifikasi Infrastruktur Produksi

| **Komponen**     | **Keterangan**                 |
| ---------------- | ------------------------------ |
| Penyedia Layanan | VPS RumahWeb                   |
| CPU              | 1 Core                         |
| RAM              | 2 GB                           |
| Penyimpanan      | 40 GB                          |
| Sistem Operasi   | Ubuntu 24.04 LTS               |
| URL Publik       | <https://nextlevelacademy.id/> |

1. Lingkunan Pengujian

Pengujian fungsional platform dilakukan menggunakan dua peramban web berbasis Chromium, yaitu Brave dan Google Chrome, untuk memastikan konsistensi perilaku dan tampilan sistem pada peramban yang umum digunakan. Daftar peramban yang digunakan disajikan pada Tabel 4.4.

Tabel 4.4 Peramban yang Digunakan dalam Pengujian

| **No.** | **Peramban**  | **Keterangan**                                                 |
| ------- | ------------- | -------------------------------------------------------------- |
| 1.      | Brave         | Peramban berbasis Chromium dengan perlindungan privasi bawaan. |
| 2.      | Google Chrome | Peramban berbasis Chromium yang dikembangkan oleh Google.      |

Pengujian responsivitas antarmuka dilakukan mengacu pada sistem breakpoint yang diterapkan dalam platform, yang terdiri dari _breakpoint_ bawaan Tailwind CSS 4 dan _breakpoint arbitrer_ kustom untuk penanganan lebar konten pada _landing page_. Seluruh _breakpoint_ yang menjadi acuan pengujian tampilan lintas ukuran layar disajikan pada Tabel 4.5.

Tabel 4.5 Breakpoint Responsivitas yang Digunakan dalam Pengujian

| **No.** | **_Breakpoint_** | **Lebar Minimum** | **Target Perangkat/Keterangan**                                                                                |
| ------- | ---------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| 1.      | sm               | 640 px            | Ponsel orientasi _landscape_                                                                                   |
| 2.      | md               | 768 px            | Tablet orientasi portrait, sekaligus menjadi referensi deteksi perangkat _mobile_ dalam hook use-mobile.ts     |
| 3.      | lg               | 1024 px           | Tablet orientasi _landscape_ / ponsel layar besar                                                              |
| 4.      | xl               | 1280 px           | Desktop layar sempit                                                                                           |
| 5.      | 2xl              | 1536 px           | Desktop layar lebar                                                                                            |
| 6.      | min-\[1280px\]   | 1280 px           | Konten _landing page_ melebar hingga 1360 px (_breakpoint_ kustom)                                             |
| 7.      | min-\[1536px\]   | 1536 px           | Konten _landing page_ melebar hingga 1480 px (_breakpoint_ kustom)                                             |
| 8.      | min-\[1920px\]   | 1920 px           | Layar Full HD / QHD besa,; tinggi navbar naik menjadi 72 px; konten melebar hingga 1600 px (breakpoint kustom) |
| 9.      | min-\[2560px\]   | 2560 px           | Layar _ultrawide_, konten melebar hingga 1840 px (breakpoint kustom)                                           |

## 4.1.2 Implementasi Antarmuka Pengguna

Berikut hasil implementasi antarmuka pengguna yang telah dibangun sesuai dengan rancangan yang telah ditentukan sebelumnya. Implementasi antarmuka pengguna pada aplikasi ini terbagi berdasarkan hak akses masing-masing aktor, yaitu Peserta Didik, Peserta Magang, Mentor, dan Administrator.

## 4.1.2.1 Antarmuka Semua Aktor

1. Halaman _Login_

Halaman ini ditampilkan ketika pengguna membuka tautan _website_ namun belum _login_ ke dalam sistem. Tersedia _field_ email dan _password_ yang harus diisi pengguna pada halaman ini. Setelah itu, pengguna dapat meng-klik tombol "Masuk" untuk _login_ ke dalam sistem, sistem memverifikasi kredensial dan mengarahkan pengguna ke _dashboard_ sesuai perannya masing-masing sesuai peran akunnya. Hasil tampilan _login_ untuk semua aktor dapat dilihat pada gambar 4.1 berikut:

Gambar 4.1 Hasil Tampilan Login

1. Halaman Lupa _Password_

Halaman ini terbuka apabila pengguna meng-klik tautan "Lupa _password_?" pada halaman _login_. Tersedia _field_ email terdaftar yang harus diisi pengguna pada halaman ini. Pengguna kemudian dapat meng-klik tombol "Kirim _Link Reset_" untuk menerima tautan atur ulang _password_ melalui email yang berlaku selama satu jam, atau meng-klik "Kembali ke Masuk" apabila ingin membatalkan dan kembali ke halaman _login_. Hasil tampilan lupa _password_ untuk semua aktor dapat dilihat pada gambar 4.2 berikut:

Gambar 4.2 Hasil Tampilan Lupa Password

1. _Landing Page_

Halaman ini ditampilkan sebagai halaman pertama yang dilihat pengunjung ketika mengakses _website_ NextLevel Academy, bagi yang sudah memiliki akun ataupun yang belum. Halaman ini menampilkan navigasi ke Beranda, Tentang Kami, Kursus, _Blog_, dan Kontak, _headline_ ajakan belajar beserta ringkasan jumlah kursus tersedia dan peserta terdaftar, serta ilustrasi bertema gamifikasi pada sisi kanan. Pengunjung dapat meng-klik tombol "Mulai Gratis" untuk mendaftar, "Lihat Kursus" untuk menuju katalog, atau "Masuk" pada bagian kanan atas apabila sudah memiliki akun. Hasil tampilan _landing page_ untuk semua aktor dapat dilihat pada gambar 4.3 berikut:

Gambar 4.3 Hasil Tampilan Landing Page

1. Halaman Pengaturan

Halaman ini terbuka apabila pengguna meng-klik menu Pengaturan, dan dapat diakses oleh seluruh peran pengguna. Halaman ini menampilkan _tab_ Profil berisi foto, nama lengkap, dan _username_, serta _tab_ Keamanan untuk mengubah kata sandi dan alamat email. Khusus pengaturan pada administrator, tersedia tambahan _tab_ Informasi Platform dan Status Integrasi. Pengguna dapat mengubah _field_ pada _tab_ terkait, kemudian meng-klik tombol "Simpan Profil" untuk memperbarui datanya. Hasil tampilan pengaturan untuk semua aktor dapat dilihat pada gambar 4.4 berikut:

Gambar 4.4 Hasil Tampilan Pengaturan

## 4.1.2.2 Antarmuka Peserta Didik

1. Halaman _Register_

Halaman ini terbuka apabila pengunjung meng-klik tombol "Daftar Gratis" pada halaman beranda. Tersedia _field_ nama lengkap, email, _password_, konfirmasi _password_, serta kotak persetujuan Kebijakan Privasi yang harus diisi pengunjung pada halaman ini. Pengunjung kemudian dapat meng-klik tombol "Buat Akun" untuk mendaftarkan diri ke dalam sistem, atau meng-klik "Masuk" apabila sudah memiliki akun. Hasil tampilan _register_ untuk peserta didik dapat dilihat pada gambar 4.5 berikut:

Gambar 4.5 Hasil Tampilan Register

1. Halaman _Dashboard_ Peserta Didik

Halaman ini akan ditampilkan apabila peserta didik telah mengisi _form login_ dan berhasil masuk ke dalam sistem. Halaman ini tersedia ringkasan berupa jumlah kursus yang dimiliki, jumlah sertifikat, progres yang sedang berjalan, serta bagian "Rekomendasi Untukmu" berisi kursus lain yang belum diambil. Peserta didik dapat meng-klik tombol "Lanjutkan Belajar" pada kartu kursus untuk langsung diarahkan ke _course player_, atau meng-klik "Semua Kursus" maupun "Jelajahi Katalog" untuk melihat kursus lainnya. Hasil tampilan _dashboard_ untuk peserta didik dapat dilihat pada gambar 4.6 berikut:

Gambar 4.6 Hasil Tampilan Dashboard Peserta Didik

1. Halaman Jelajah Katalog

Halaman ini terbuka apabila peserta didik meng-klik "Jelajahi Katalog" pada menu _dashboard_ maupun kursus saya. Halaman ini menampilkan kursus dalam bentuk kartu yang memuat _thumbnail_, judul, kategori, dan harga, dilengkapi kolom pencarian, serta penyaring kategori. Pada pengurutan _default_, kursus yang sudah dimiliki ditempatkan lebih dahulu sebelum kursus terbaru lainnya. Ketika salah satu kartu dipilih, sistem membuka jendela detail kursus tanpa berpindah halaman. Hasil tampilan jelajah katalog untuk peserta didik dapat dilihat pada gambar 4.7 berikut:

Gambar 4.7 Hasil Tampilan Jelajah Katalog

1. Halaman _Pop-Up Courses_

Halaman ini muncul saat peserta didik meng-klik salah satu kursus pada halaman katalog dan menampilkan informasi lengkap sebuah kursus dalam bentuk jendela (dialog) yang terbuka di atas halaman katalog. Di dalamnya terdapat deskripsi kursus, daftar materi, harga, serta tombol aksi yang menyesuaikan kondisi pengguna. Jika kursus belum dimiliki, tombol mengarahkan pengguna ke proses _checkout_. Hasil tampilan _pup-up courses_ untuk peserta didik dapat dilihat pada gambar 4.8 berikut:

Gambar 4.8 Hasil Tampilan Pop-Up Courses

1. Halaman _Checkout_

Halaman ini digunakan untuk menyelesaikan pembelian sebuah kursus. Setelah memilih kursus dari jendela detail, pengguna dibawa ke halaman ringkasan pesanan yang memuat data kursus, harga, kolom kode voucher, serta data pembeli berupa email dan nama yang bersifat _read-only_ dan nomor telepon yang opsional. Pengguna dapat meng-klik tombol "_Checkout_ & Bayar Sekarang" untuk melakukan pembelian sekaligus memunculkan _pop-up_ pembayaran. Apabila pengguna sudah memiliki pesanan aktif yang belum dibayar, halaman beralih ke mode "Lanjutkan" agar pengguna meneruskan pembayaran yang sama tanpa membuat pesanan baru. Hasil tampilan _checkout_ untuk peserta didik dapat dilihat pada gambar 4.9 berikut:

Gambar 4.9 Hasil Tampilan Checkout

1. Halaman _Checkout_ dengan Voucher

Tampilan ini berada pada halaman _checkout_ dan digunakan untuk menerapkan kode voucher diskon sebelum pembayaran dilakukan. Setelah peserta didik memasukkan kode voucher yang _valid_, bagian ini menampilkan nama promo yang aktif beserta keterangan diskon, dan rincian harga pada panel "Detail Pembayaran" otomatis diperbarui menampilkan potongan diskon serta total pembayaran akhir. Hasil tampilan _checkout_ dengan voucher untuk peserta didik dapat dilihat pada gambar 4.10 berikut:

Gambar 4.10 Hasil Tampilan Checkout dengan Voucher

1. Halaman Metode Pembayaran

Tampilan ini merupakan jendela pembayaran yang muncul di atas halaman _checkout_ untuk menuntaskan transaksi. Di dalam _pop-up_, pengguna memilih metode pembayaran dari seluruh kanal yang diaktifkan. Hasil tampilan metode pembayaran untuk peserta didik dapat dilihat pada gambar 4.11 berikut:

Gambar 4.11 Hasil Tampilan Metode Pembayaran

1. Halaman Menunggu Pembayaran

Tampilan ini muncul secara otomatis setelah pengguna meng-klik tombol "_Checkout_ & Bayar Sekarang" pada halaman _checkout_. _Pop-up_ ini menampilkan total pembayaran, batas waktu pembayaran untuk menyelesaikan transaksi. Peserta didik dapat menyelesaikan pembayaran sesuai instruksi yang ditampilkan. Terdapat penghitung waktu mundur yang membatasi masa berlaku pembayaran. Pengguna dapat meng-klik tombol "_Check_ Status" untuk memeriksa status transaksi secara manual. Hasil tampilan menunggu pembayaran untuk peserta didik dapat dilihat pada gambar 4.12 berikut:

Gambar 4.12 Hasil Tampilan Menunggu Pembayaran

1. Halaman Pembayaran Berhasil

Tampilan ini muncul setelah pembayaran berhasil dikonfirmasi, _pop-up_ berubah menampilkan notifikasi "_Payment Successful_" beserta nominal dan ID pesanan, lalu otomatis tertutup dan mengarahkan pengguna kembali ke halaman transaksi. Hasil tampilan pembayaran berhasil untuk peserta didik dapat dilihat pada gambar 4.13 berikut:

Gambar 4.13 Hasil Tampilan Pembayaran Berhasil

1. Halaman Transaksi

Halaman ini ditampilkan apabila peserta didik meng-klik menu transaksi dan dapat juga diakses apabila pengguna meng-klik salah satu transaksi pada daftar transaksinya. Halaman ini menampilkan riwayat seluruh transaksi milik pengguna beserta statusnya, seperti menunggu pembayaran, berhasil, gagal, kedaluwarsa, dan dibatalkan. Ketika sebuah transaksi dipilih, sistem membuka halaman detail berisi satu kartu _invoice_. Hasil tampilan transaksi untuk peserta didik dapat dilihat pada gambar 4.14 berikut:

Gambar 4.14 Hasil Tampilan Transaksi

1. Halaman Detail Transaksi

Halaman ini menampilkan _invoice_ lengkap berisi nomor _invoice_, tanggal terbit, tanggal bayar, metode pembayaran, rincian kursus yang dibeli, subtotal, potongan voucher, dan total pembayaran. Peserta didik dapat meng-klik tombol "Unduh _Invoice_ (Gambar)" untuk menyimpan _invoice_ tersebut, atau "Kembali ke Transaksi" untuk kembali ke daftar transaksi. Hasil tampilan detail transaksi untuk peserta didik dapat dilihat pada gambar 4.15 berikut:

Gambar 4.15 Hasil Tampilan Detail Transaksi

1. Halaman Kursus Saya

Halaman ini ditampilkan apabila peserta didik meng-klik menu kursus saya dan digunakan peserta didik untuk menelusuri seluruh kursus yang tersedia di platform. Halaman menampilkan kursus dalam bentuk kartu yang memuat _thumbnail_, judul, kategori, dan harga, dilengkapi kolom pencarian, serta penyaring kategori. Pada pengurutan _default_, kursus yang sudah dimiliki ditempatkan lebih dahulu sebelum kursus terbaru lainnya. Ketika salah satu kartu dipilih, sistem membuka jendela detail kursus tanpa berpindah halaman. Hasil tampilan kursus saya untuk peserta didik dapat dilihat pada gambar 4.16 berikut:

Gambar 4.16 Hasil Tampilan Kursus Saya

1. Halaman _Video Learning_

Halaman ini merupakan ruang belajar tempat peserta didik menonton materi video kursus yang sudah dimiliki. Pada bagian utama ditampilkan pemutar video, sedangkan di sisi samping terdapat daftar kurikulum yang dikelompokkan per bagian (_sprint_) lengkap dengan penanda langkah yang sudah diselesaikan. Di bawah pemutar tersedia dua _tab_, yaitu deskripsi yang memuat informasi materi serta durasi video dan catatan tempat pengguna menulis catatan pribadi per langkah yang tersimpan otomatis. Hasil tampilan _video learning_ untuk peserta didik dapat dilihat pada gambar 4.17 berikut:

Gambar 4.17 Hasil Tampilan Video Learning

1. Halaman Progres Pembelajaran Video

Halaman ini merupakan tampilan ketika peserta didik klik pemutar video dan menonton video hingga selesai atau meng-klik tombol "Materi Selanjutnya" untuk melanjutkan ke tahap berikutnya dan dapat meng-klik tombol "Tandai Selesai" untuk mendapatkan EXP dan membuka tahap berikutnya. Hasil tampilan progres pembelajaran video untuk peserta didik dapat dilihat pada gambar 4.18 berikut:

Gambar 4.18 Hasil Tampilan Progres Pembelajaran Video

1. Halaman _Quiz Learning_

Tampilan ini digunakan peserta didik untuk mengerjakan kuis yang menjadi bagian dari kurikulum kursus. Kuis muncul saat peserta didik membuka tahap yang berjenis kuis pada _course player_. Soal pilihan ganda ditampilkan satu per satu pada tampilan ini. Setelah itu, peserta didik dapat meng-klik tombol "Submit" untuk mengirimkan jawaban dan melihat skor hasil pengerjaan kuis tersebut. Kelulusan kuis pada percobaan pertama memberikan tambahan EXP, sementara percobaan yang gagal dibatasi dengan aturan jumlah percobaan dan masa tunggu. Hasil tampilan _quiz learning_ untuk peserta didik dapat dilihat pada gambar 4.19 berikut:

Gambar 4.19 Hasil Tampilan Quiz Learning

1. Halaman Sertifikat

Halaman ini ditampilkan apabila peserta didik meng-klik menu sertifikat. Halaman ini menampilkan daftar sertifikat yang dimiliki peserta didik atas kursus yang telah diselesaikan hingga seratus persen. Sertifikat yang baru terbit ditandai sebagai belum diklaim, sedangkan yang sudah diklaim menampilkan pratinjau gambar sertifikat beserta opsi unduhan. Tombol "Klaim" membuka dialog konfirmasi yang memungkinkan peserta didik memeriksa dan menyunting nama yang akan tercetak pada sertifikat sebelum ditetapkan. Setelah diklaim, nama tersebut bersifat tetap dan tidak dapat diubah kembali. Hasil tampilan sertifikat untuk peserta didik dapat dilihat pada gambar 4.20 berikut:

Gambar 4.20 Hasil Tampilan Sertifikat

1. Halaman Verifikasi Sertifikat Publik

Halaman ini digunakan untuk memverifikasi keaslian sebuah sertifikat dan dapat diakses tanpa _login_. Halaman ini menampilkan gambar sertifikat beserta nama penerima, nama kursus, tanggal terbit, dan status keabsahan sertifikat. Tautan menuju halaman ini umumnya diakses melalui kode QR yang tercetak pada sertifikat. Hasil tampilan verifikasi sertifikat publik untuk peserta didik dapat dilihat pada gambar 4.21 berikut:

Gambar 4.21 Hasil Tampilan Verifikasi Sertifikat Publik

1. Halaman EXP & _Level_

Halaman ini ditampilkan apabila pengguna meng-klik menu EXP & _Level_ sebagai capaian gamifikasi peserta didik. Di bagian atas terdapat kartu yang menampilkan _level_ saat ini, perolehan EXP, dan progres menuju _level_ berikutnya. Di bawahnya ditampilkan peta jalan hadiah voucher pada _level_ lima, sepuluh, dan lima belas, masing-masing dilengkapi tombol "Klaim" yang aktif saat _level_ tercapai. Hasil tampilan EXP & _level_ untuk peserta didik dapat dilihat pada gambar 4.22 berikut:

Gambar 4.22 Hasil Tampilan EXP & Level

1. Halaman Koleksi _Badge_

Halaman ini menampilkan seluruh _badge_ yang dapat diperoleh peserta didik beserta jumlah _badge_ yang sudah terbuka. _Badge_ yang sudah diraih ditampilkan berwarna penuh beserta nama, deskripsi syarat perolehan, dan tanggal diraih, sedangkan _badge_ yang belum diraih ditampilkan dalam keadaan abu-abu dengan label "Terkunci". Peserta didik dapat melihat koleksi tersebut sebagai bentuk pencapaian dari aktivitas belajar yang telah diselesaikan. Hasil tampilan koleksi _badge_ untuk peserta didik dapat dilihat pada gambar 4.23 berikut:

Gambar 4.23 Hasil Tampilan Koleksi Badge

## 4.1.2.3 Antarmuka Peserta Magang

1. Halaman _Dashboard_ Peserta Magang

Halaman ini tampil sebagai tujuan awal setelah peserta magang berhasil _login_ ke dalam sistem. Tersedia kartu status absensi hari ini serta kartu pengingat jumlah tugas yang harus diselesaikan. Peserta magang kemudian dapat meng-klik tombol "_Check-In_" untuk melakukan absensi pada hari tersebut. Hasil tampilan _dashboard_ untuk peserta magang dapat dilihat pada gambar 4.24 berikut:

Gambar 4.24 Hasil Tampilan Dashboard Peserta Magang

1. Halaman Absensi Magang

Halaman ini terbuka apabila peserta magang meng-klik menu absensi. Peserta magang dapat melakukan _check-in_ harian sekaligus memantau riwayat kehadirannya. Di bagian atas terdapat kartu _check-in_ yang menampilkan jendela waktu absensi dan tombol untuk merekam kehadiran pada hari berjalan. Di bawahnya terdapat kalender bulanan yang menandai status kehadiran setiap tanggal, disertai panel panduan yang menjelaskan periode magang. Navigasi bulan pada kalender dibatasi pada rentang periode magang. Hasil tampilan absensi untuk peserta magang dapat dilihat pada gambar 4.25 berikut:

Gambar 4.25 Hasil Tampilan Absensi Peserta Magang

1. Halaman Daftar Tugas Magang

Halaman ini muncul apabila peserta magang meng-klik menu tugas. Halaman ini menampilkan daftar tugas yang diberikan oleh mentor berdasarkan kelas yang diikuti peserta magang. Setiap tugas ditampilkan dengan judul, tenggat, dan status pengerjaan seperti belum dikumpulkan, terkumpul, dikembalikan, dan terlewat. Peserta magang dapat memilih salah satu tugas untuk membuka halaman detailnya. Hasil tampilan daftar tugas untuk peserta magang dapat dilihat pada gambar 4.26 berikut:

Gambar 4.26 Hasil Tampilan Daftar Tugas Magang

1. Halaman Detail Tugas Magang

Halaman ini ditampilkan ketika pengguna meng-klik salah satu tugas pada daftar tugas. Halaman ini berisi instruksi tugas, tenggat waktu, serta _field_ unggah berkas atau tautan URL. Peserta Magang dapat meng-klik tombol Kumpulkan untuk mengirimkan hasil pekerjaan atau mengunggah ulang revisi apabila tugas dikembalikan mentor. Hasil tampilan detail tugas untuk peserta magang dapat dilihat pada gambar 4.27 berikut:

Gambar 4.27 Hasil Tampilan Detail Tugas Magang

1. Halaman Nilai Akhir Magang

Halaman ini dapat diakses apabila peserta magang meng-klik menu nilai akhir. Halaman ini menampilkan nilai akhir magang yang diberikan mentor kepada peserta magang. Tampilan memuat nilai dalam bentuk angka skala 0 sampai 100 beserta padanan hurufnya, dan catatan dari mentor bila ada. Nilai tersebut akan tetap kosong selama mentor belum mengisinya. Hasil tampilan nilai akhir untuk peserta magang dapat dilihat pada gambar 4.28 berikut:

Gambar 4.28 Hasil Tampilan Nilai Akhir Magang

## 4.1.2.4 Antarmuka Mentor

1. Halaman _Dashboard_ Mentor

Halaman ini tampil sebagai tujuan awal setelah mentor berhasil _login_ ke dalam sistem. Pada halaman ini ditampilkan jam _realtime_, jendela waktu absen, dan tombol "_Check-In_ Sekarang", tiga kartu ringkasan berupa peserta bimbingan, tugas aktif, dan menunggu _review_, serta dua panel berisi rekap kehadiran hari ini dan daftar tugas aktif beserta tenggat waktunya. Mentor dapat meng-klik tombol "_Check-In_ Sekarang" untuk melakukan absensi. Hasil tampilan _dashboard_ untuk mentor dapat dilihat pada gambar 4.29 berikut:

Gambar 4.29 Hasil Tampilan Dashboard Mentor

1. Halaman Absensi Magang

Halaman ini terbuka apabila mentor meng-klik menu absensi. Halaman ini digunakan mentor untuk melakukan _check-in_ kehadiran pribadinya. Tampilannya menyerupai absensi peserta magang, dengan kartu _check-in_ yang menampilkan jendela waktu absensi serta tombol untuk merekam kehadiran pada hari berjalan. Kehadiran mentor disimpan terpisah sehingga tidak tercampur dengan rekap kehadiran peserta magang. Hasil tampilan absensi magang untuk mentor dapat dilihat pada gambar 4.30 berikut:

Gambar 4.30 Hasil Tampilan Absensi Mentor Magang

1. Halaman Daftar Peserta Magang

Halaman ini terbuka apabila mentor meng-klik menu daftar peserta. Halaman ini menampilkan daftar peserta magang yang berada dalam bimbingan mentor pada kelas tersebut, lengkap dengan foto, nama, dan asal universitas masing-masing peserta magang. Mentor dapat menggunakan halaman ini sebagai rujukan data peserta magang sebelum meninjau absensi, tugas, atau nilai akhir peserta pada menu lainnya. Hasil tampilan daftar peserta magang untuk mentor dapat dilihat pada gambar 4.31 berikut:

Gambar 4.31 Hasil Tampilan Daftar Peserta Magang

1. Halaman Absensi Peserta

Halaman ini muncul apabila mentor meng-klik menu absensi peserta. Halaman ini menampilkan rekap kehadiran peserta magang yang berada dalam kelas mentor bersangkutan. Tampilan bersifat _read-only_ dan memuat daftar peserta beserta status kehadirannya. Cakupan data dibatasi secara otomatis pada kelas yang menjadi tanggung jawab mentor. Hasil tampilan absensi peserta magang untuk mentor dapat dilihat pada gambar 4.32 berikut:

Gambar 4.32 Hasil Tampilan Absensi Peserta

1. Halaman Kelola Tugas

Halaman ini ditampilkan apabila mentor meng-klik menu tugas. Halaman ini digunakan mentor untuk mengelola tugas yang diberikan kepada peserta magang di kelasnya. Halaman menampilkan daftar tugas yang sudah dibuat beserta tombol untuk menambah tugas baru. Setiap baris menyediakan akses menuju detail, penyuntingan, dan penghapusan tugas. Hasil tampilan kelola tugas untuk mentor dapat dilihat pada gambar 4.33 berikut:

Gambar 4.33 Hasil Tampilan Kelola Tugas

1. Halaman Membuat Tugas Baru

Halaman ini terbuka apabila mentor meng-klik tombol "Buat Tugas Baru" atau meng-klik tugas yang ingin diubah. Tersedia _field_ judul, deskripsi instruksi, tenggat waktu, serta lampiran opsional pada halaman ini. Mentor dapat meng-klik tombol "Simpan" untuk menyimpan tugas tersebut, atau tombol "Batal "untuk membatalkannya. Hasil tampilan membuat tuga baru dapat dilihat pada gambar 4.34 berikut:

Gambar 4.34 Hasil Tampilan Membuat Tugas Baru

1. Halaman Detail Tugas Peserta

Halaman ini muncul apabila mentor meng-klik salah satu tugas pada daftar tugas. Halaman ini digunakan oleh mentor untuk melihat detail tugas yang telah dibuat, memantau status pengumpulan tugas peserta magang, melihat berkas hasil pengumpulan, memberikan _feedback_, serta mengelola tugas melalui fitur edit dan hapus. Hasil tampilan detail tugas peserta untuk mentor dapat dilihat pada gambar 4.35 berikut:

Gambar 4.35 Hasil Tampilan Detail Tugas Peserta

1. Halaman _Feedback_ Tugas

Tampilan ini muncul apabila mentor meng-klik tombol "Beri _Feedback_" pada salah satu pengumpulan peserta magang di halaman detail tugas. Tersedia kolom catatan revisi yang harus diisi mentor untuk menjelaskan perbaikan yang diperlukan. Mentor kemudian dapat meng-klik tombol "Kembalikan Tugas" untuk mengirimkan catatan tersebut dan mengubah status pengumpulan peserta magang menjadi belum dikumpulkan kembali, atau "Batal" untuk membatalkan tindakan ini. Hasil tampilan _feedback_ tugas dapat dilihat pada gambar 4.36 berikut:

Gambar 4.36 Hasil Tampilan Feedback Tugas

1. Halaman Daftar Nilai Akhir

Halaman ini ditampilkan apabila mentor meng-klik menu nilai Aahir. Halaman ini digunakan mentor untuk memberikan dan menyunting nilai akhir peserta magang di kelas yang dibimbing. Tampilan memuat daftar seluruh peserta magang, termasuk yang belum dinilai, dengan kolom nilai dan aksi penilaian. Hasil tampilan daftar nilai akhir dapat dilihat pada gambar 4.37 berikut:

Gambar 4.37 Hasil Tampilan Daftar Nilai Akhir

1. Halaman Input Nilai Akhir

Tampilan ini muncul apabila mentor meng-klik tombol "Beri Nilai" pada salah satu peserta magang di halaman nilai akhir. Tersedia _field_ nilai dalam rentang 0 sampai 100 beserta catatan opsional yang dapat diisi mentor. Mentor kemudian dapat meng-klik tombol "Perbarui Nilai" untuk menyimpan nilai akhir peserta magang tersebut, atau "Batal" untuk membatalkan tindakan ini. Hasil tampilan input nilai akhir dapat dilihat pada gambar 4.38 berikut:

Gambar 4.38 Hasil Tampilan Input Nilai Akhir

## 4.1.2.5 Antarmuka Administrator

1. Halaman _Dashboard_ Administrator

Halaman ini tampil sebagai tujuan awal setelah administrator berhasil _login_ ke dalam sistem. Pada halaman ini ditampilkan hero berisi jam _realtime_ dan ringkasan harian berupa pendapatan, transaksi, dan pengguna baru, enam kartu statistik meliputi total pengguna, kursus aktif, total pendapatan, total transaksi, sertifikat terbit, dan peserta magang aktif, serta grafik pendapatan per bulan dan pendaftaran pengguna baru. Administrator dapat menggunakan halaman ini untuk memantau kondisi _platform_ secara umum sebelum berpindah ke menu pengelolaan lainnya. Hasil tampilan _dashboard_ untuk admin dapat dilihat pada gambar 4.39 berikut:

Gambar 4.39 Hasil Tampilan Dashboard Administrator

1. Halaman Kelola Daftar Kursus

Halaman ini terbuka apabila administrator meng-klik menu _course_ lalu daftar _course_. Halaman ini menampilkan tabel kursus beserta kategori, instruktur, harga, jumlah peserta, tanggal dibuat, tanggal publikasi, dan status kursus, dilengkapi kotak pencarian judul serta _filter_ kategori dan status. Administrator dapat meng-klik tombol "Tambah Kursus" untuk menambahkan kursus baru, atau ikon edit dan hapus pada salah satu baris untuk mengubah maupun menghapus kursus tersebut. Hasil tampilan kelola daftar kursus untuk admin dapat dilihat pada gambar 4.40 berikut:

Gambar 4.40 Hasil Tampilan Kelola Daftar Kursus

1. Halaman Tambah Kursus

Halaman ini terbuka apabila administrator meng-klik tombol "Tambah Kursus" pada halaman daftar kursus. Tersedia _field_ judul kursus, _slug_, deskripsi singkat, dan deskripsi lengkap menggunakan _rich text editor_ pada halaman ini. Administrator dapat meng-klik tombol "Simpan & Lanjutkan" untuk menyimpan informasi umum sebagai _draft_ dan melanjutkan ke tahap penyusunan kurikulum, atau "Batal" untuk membatalkan penambahan kursus. Hasil tampilan tambah kursus untuk admin dapat dilihat pada gambar 4.41 berikut:

Gambar 4.41 Hasil Tampilan Tambah Kursus

1. Halaman Tambah Video Kursus

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Tahap" dan memilih jenis video pada halaman penyusunan kurikulum. Tersedia _field_ judul video, area unggah _file_ video, serta deskripsi materi opsional. Administrator dapat meng-klik tombol "Simpan Tahap" untuk menyimpan tahap video tersebut, atau "Batal" untuk membatalkannya. Hasil tampilan tambah video kursus untuk admin dapat dilihat pada gambar 4.42 berikut:

Gambar 4.42 Hasil Tampilan Tambah Video Kursus

1. Halaman Tambah Kuis Kursus

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Tahap" dan memilih jenis kuis pada halaman penyusunan kurikulum. Tersedia _field_ judul kuis, deskripsi materi opsional, nilai minimum lulus, serta daftar soal pilihan ganda yang masing-masing memiliki minimal dua opsi jawaban dengan satu jawaban benar. Administrator dapat meng-klik tombol "Tambah Opsi" untuk menambah pilihan jawaban, atau "Simpan Perubahan" untuk menyimpan tahap kuis tersebut. Hasil tampilan tambah kuis kursus untuk admin dapat dilihat pada gambar 4.43 berikut:

Gambar 4.43 Hasil Tampilan Tambah Kuis Kursus

1. Halaman Edit Kursus

Halaman ini terbuka apabila administrator meng-klik ikon edit pada salah satu kursus di halaman daftar kursus. Halaman ini menampilkan status publikasi kursus beserta _field_ informasi umum yang sudah terisi data sebelumnya, yaitu judul, _slug_, deskripsi singkat, dan deskripsi lengkap, yang dapat diubah oleh administrator. Administrator dapat meng-klik tombol "Simpan Perubahan" untuk memperbarui kursus tersebut, atau "Batal" untuk membatalkan penyuntingan. Hasil tampilan edit kursus untuk admin dapat dilihat pada gambar 4.44 berikut:

Gambar 4.44 Hasil Tampilan Edit Kursus

1. Halaman Kelola Kategori Kursus

Halaman ini muncul apabila administrator meng-klik menu _course_ lalu kategori _courses_. Tampilan berupa tabel yang menampilkan nama kategori, deskripsi, serta jumlah kursus dan voucher yang menggunakannya. Administrator dapat meng-klik tombol "Tambah Kategori" untuk menambahkan kategori baru, atau meng-klik salah satu kategori untuk mengedit maupun menghapusnya. Hasil tampilan kelola kategori kursus untuk admin dapat dilihat pada gambar 4.45 berikut:

Gambar 4.45 Hasil Tampilan Kelola Kategori Kursus

1. Halaman Kelola Pengguna

Halaman ini terbuka apabila administrator meng-klik menu pengguna. Halaman ini menampilkan tabel data pengguna beserta avatar, nama, email, _role_, tanggal daftar, dan status akun, dilengkapi kotak pencarian nama atau email serta _filter role_, status, dan urutan tanggal daftar. Administrator dapat meng-klik tombol "Tambah Pengguna" untuk menambahkan akun baru, atau ikon edit, nonaktifkan, dan hapus pada salah satu baris untuk mengelola akun tersebut. Hasil tampilan kelola pengguna untuk admin dapat dilihat pada gambar 4.46 berikut:

Gambar 4.46 Hasil Tampilan Kelola Pengguna

1. Halaman Tambah Pengguna

Halaman ini terbuka apabila administrator meng-klik tombol "Tambah Pengguna" pada halaman kelola pengguna. Tersedia _field role_, nama lengkap, email, dan _password_ awal pada bagian informasi akun, serta _field_ kelas dan institusi opsional pada bagian penempatan yang muncul khusus apabila _role_ yang dipilih adalah peserta magang atau mentor. Administrator dapat meng-klik tombol "Simpan Akun" untuk membuat akun pengguna tersebut, atau "Batal" untuk membatalkan penambahan akun. Hasil tampilan tambah pengguna untuk admin dapat dilihat pada gambar 4.47 berikut:

Gambar 4.47 Hasil Tampilan Tambah Pengguna

1. Halaman Edit Pengguna

Halaman ini terbuka apabila administrator meng-klik ikon edit pada salah satu pengguna di halaman kelola pengguna. Halaman ini menampilkan _field_ nama lengkap, email, dan _username_ yang dapat diubah, _role_ yang bersifat tetap dan tidak dapat diedit, serta bagian keamanan berisi tombol "_Set Password_ Sementara" khusus untuk akun peserta didik. Administrator dapat meng-klik tombol "Simpan Perubahan" untuk memperbarui data pengguna tersebut, atau "Batal" untuk membatalkan penyuntingan. Hasil tampilan edit pengguna untuk admin dapat dilihat pada gambar 4.48 berikut:

Gambar 4.48 Hasil Tampilan Edit Pengguna

1. Halaman Kelola Sertifikat

Halaman ini terbuka apabila administrator meng-klik menu sertifikat. Halaman ini menampilkan panel pengaturan masa berlaku sertifikat secara global, kotak pencarian, _filter_ kursus dan status, serta tabel daftar sertifikat. Administrator dapat meng-klik ikon unduh untuk mengunduh sertifikat atau tautan verifikasi publik untuk membuka halaman verifikasi publik sertifikat tersebut. Hasil tampilan kelola sertifikat untuk admin dapat dilihat pada gambar 4.49 berikut:

Gambar 4.49 Hasil Tampilan Kelola Sertifikat

1. Halaman Kelola Transaksi

Halaman ini terbuka apabila administrator meng-klik menu keuangan lalu transaksi. Halaman ini menampilkan tabel riwayat transaksi pembelian kursus peserta didik berisi id, tanggal, pembeli, kursus, jumlah, dan status, dilengkapi kotak pencarian serta _filter_ status dan urutan. Administrator dapat meng-klik tombol "Detail" pada salah satu transaksi untuk melihat _invoice_ dan menindaklanjuti transaksi tersebut. Hasil tampilan kelola transaksi untuk admin dapat dilihat pada gambar 4.50 berikut:

Gambar 4.50 Hasil Tampilan Kelola Transaksi

1. Halaman Kelola Voucher

Halaman ini terbuka apabila administrator meng-klik menu keuangan lalu voucher. Halaman ini menampilkan tabel daftar voucher promo berisi kode, deskripsi, besaran diskon, jumlah pemakaian, tanggal berlaku, dan status, dilengkapi kotak pencarian kode serta _filter_ status dan urutan. Administrator dapat meng-klik tombol "Buat Voucher" untuk membuat voucher baru, atau tombol "Edit" pada salah satu voucher untuk mengubahnya. Hasil tampilan kelola voucher untuk admin dapat dilihat pada gambar 4.51 berikut:

Gambar 4.51 Hasil Tampilan Kelola Voucher

1. Halaman Buat Voucher

Halaman ini terbuka apabila administrator meng-klik tombol "Buat Voucher" pada halaman voucher. Tersedia _field_ kode voucher, deskripsi opsional, tipe diskon berupa persentase atau nominal rupiah, persentase diskon, batas pemakaian opsional, serta tanggal mulai dan berakhir berlaku opsional. Administrator dapat meng-klik tombol "Buat Voucher" untuk menyimpan voucher tersebut, atau "Batal" untuk membatalkan penambahan voucher. Hasil tampilan buat voucher untuk admin dapat dilihat pada gambar 4.52 berikut:

Gambar 4.52 Hasil Tampilan Buat Voucher

1. Halaman Edit Voucher

Halaman ini terbuka apabila administrator meng-klik tombol "Edit" pada salah satu voucher di halaman voucher. Halaman ini menampilkan status voucher beserta _field_ kode, deskripsi, tipe diskon, persentase diskon, batas pemakaian, dan tanggal mulai serta berakhir yang sudah terisi data sebelumnya. Administrator dapat meng-klik tombol "Simpan Perubahan" untuk memperbarui voucher tersebut, atau "Batal" untuk membatalkan penyuntingan. Hasil tampilan edit voucher untuk admin dapat dilihat pada gambar 4.53 berikut:

Gambar 4.53 Hasil Tampilan Edit Voucher

1. Halaman Aturan EXP

Halaman ini terbuka apabila administrator meng-klik menu gamifikasi lalu aturan EXP. Halaman ini menampilkan secara _read-only_ besaran EXP per aktivitas seperti menyelesaikan video, lulus kuis, dan menyelesaikan kursus, formula progresi _level_ beserta gelar pada tiap rentang _level_, serta persentase diskon _reward_ voucher pada _level_ tertentu. Administrator dapat melihat informasi tersebut sebagai acuan, karena nilai-nilainya hanya dapat diubah pada tingkat _backend_. Hasil tampilan aturan EXP untuk admin dapat dilihat pada gambar 4.54 berikut:

Gambar 4.54 Hasil Tampilan Aturan EXP

1. Halaman Kelola _Badge_

Halaman ini terbuka apabila administrator meng-klik menu gamifikasi lalu _badge_. Halaman ini menampilkan tabel daftar _badge_ berisi ikon, nama, jenis _trigger_, target, EXP, dan jumlah peserta yang sudah meraihnya, dilengkapi kotak pencarian nama dan _filter trigger_. Administrator dapat meng-klik tombol "Tambah _Badge_" untuk menambahkan _badge_ baru, atau tombol "Edit" maupun "Hapus" pada salah satu _badge_ untuk mengelolanya. Hasil tampilan kelola _badge_ untuk admin dapat dilihat pada gambar 4.55 berikut:

Gambar 4.55 Hasil Tampilan Kelola Badge

1. Halaman Tambah _Badge_

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Badge" pada halaman Manajemen _Badge_. Tersedia _field_ jenis _trigger_, nama _badge_, deskripsi cara mendapat opsional, syarat sesuai _trigger_ seperti _level_ yang harus dicapai, serta unggahan ikon _badge_ atau pilihan dari ikon tersedia. Administrator dapat meng-klik tombol "Buat _Badge_" untuk menyimpan _badge_ tersebut, atau "Batal" untuk membatalkannya. Hasil tampilan tambah _badge_ untuk admin dapat dilihat pada gambar 4.56 berikut:

Gambar 4.56 Hasil Tampilan Tambah Badge

1. Halaman Edit _Badge_

Tampilan ini muncul apabila administrator meng-klik tombol "Edit" pada salah satu _badge_ di halaman Manajemen _Badge_. Halaman ini menampilkan _field_ nama _badge_, deskripsi cara mendapat, syarat sesuai _trigger_, dan ikon _badge_ yang sudah terisi data sebelumnya, dengan jenis _trigger_ yang bersifat tetap dan tidak dapat diubah. Administrator dapat meng-klik tombol "Simpan Perubahan" untuk memperbarui _badge_ tersebut, atau "Batal" untuk membatalkan penyuntingan. Hasil tampilan edit _badge_ untuk admin dapat dilihat pada gambar 4.57 berikut:

Gambar 4.57 Hasil Tampilan Edit Badge

1. Halaman Kelola Absensi Mentor

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu absensi mentor. Halaman ini menampilkan tabel nama, kelas, jam absen, dan status kehadiran mentor pada tanggal yang dipilih, dilengkapi pemilih tanggal serta _filter batch_, bidang, dan kelas. Administrator dapat meng-klik tombol "Hadir" atau "Tidak Hadir" pada salah satu baris untuk mengoreksi status kehadiran mentor tersebut. Hasil tampilan kelola absensi mentor dapat dilihat pada gambar 4.58 berikut:

Gambar 4.58 Hasil Tampilan Kelola Absensi Mentor

1. Halaman Kelola Absensi Peserta Magang

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu absensi peserta. Halaman ini menampilkan tabel nama, kelas, jam absen, dan status kehadiran peserta magang pada tanggal yang dipilih, dilengkapi pemilih tanggal serta _filter batch_, bidang, dan kelas. Administrator dapat meng-klik tombol "Hadir" atau "Tidak Hadir" pada salah satu baris untuk mengoreksi status kehadiran peserta tersebut. Hasil tampilan kelola absensi peserta magang dapat dilihat pada gambar 4.59 berikut:

Gambar 4.59 Hasil Tampilan Kelola Absensi Peserta Magang

1. Halaman Kelola Tugas

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu tugas. Halaman ini menampilkan tabel nama tugas, kelas, tanggal dibuat, tenggat waktu, dan status tugas dari seluruh kelas, dilengkapi kotak pencarian nama tugas serta _filter batch_, bidang, kelas, dan status. Administrator dapat meng-klik tombol "Detail" pada salah satu tugas untuk melihat dan mengelola tugas tersebut, atau "Hapus" untuk menghapusnya. Hasil tampilan kelola tugas dapat dilihat pada gambar 4.60 berikut:

Gambar 4.60 Hasil Tampilan Kelola Tugas

1. Halaman Kelola Nilai Akhir

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu nilai akhir. Halaman ini menampilkan tabel nama peserta beserta institusi, kelas, dan nilai akhir magang lintas kelas, dilengkapi kotak pencarian nama serta _filter batch_, bidang, dan kelas. Administrator dapat meng-klik tombol "Edit Nilai" pada salah satu peserta untuk menyesuaikan nilai akhirnya sebagai tindakan administratif. Hasil tampilan kelola nilai akhir dapat dilihat pada gambar 4.61 berikut:

Gambar 4.61 Hasil Tampilan Kelola Nilai Akhir

1. Halaman Konfigurasi Magang - _Batch_

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu konfigurasi magang, dengan _tab batch_ terpilih secara _default_. Halaman ini menampilkan tabel daftar _batch_ berisi nama, keterangan, periode, dan jumlah bidang terkait. Administrator dapat meng-klik tombol "Tambah _Batch_" untuk menambahkan periode magang baru, atau tombol "Edit" maupun "Hapus" pada salah satu _batch_ untuk mengelolanya. Hasil tampilan konfigurasi magang - _batch_ dapat dilihat pada gambar 4.62 berikut:

Gambar 4.62 Hasil Tampilan Konfigurasi Magang - Batch

1. Halaman Tambah _Batch_

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Batch" pada _tab batch_. Tersedia _field_ nama _batch_, keterangan, serta tanggal mulai dan selesai periode magang. Administrator dapat meng-klik tombol "Buat _Batch_" untuk menyimpan periode magang tersebut, atau "Batal" untuk membatalkannya.

Gambar 4.63 Hasil Tampilan Tambah Batch

1. Halaman Konfigurasi Magang - Bidang

Halaman ini terbuka apabila administrator meng-klik _tab_ bidang pada halaman konfigurasi magang. Halaman ini menampilkan tabel daftar bidang berisi _batch_ terkait, nama bidang, dan jumlah kelas yang terhubung. Administrator dapat meng-klik tombol "Tambah Bidang" untuk menambahkan bidang baru, atau tombol "Edit" maupun "Hapus" pada salah satu bidang untuk mengelolanya.

Gambar 4.64 Hasil Tampilan Konfigurasi Magang - Bidang

1. Halaman Tambah Bidang

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Bidang" pada _tab_ bidang. Tersedia _field_ pilihan _batch_ serta nama bidang yang harus diisi administrator. Administrator dapat meng-klik tombol "Buat Bidang" untuk menyimpan bidang tersebut, atau "Batal" untuk membatalkannya.

Gambar 4.65 Hasil Tampilan Tambah Bidang

1. Halaman Konfigurasi Magang - Kelas

Halaman ini terbuka apabila administrator meng-klik _tab_ kelas pada halaman konfigurasi magang. Halaman ini menampilkan tabel daftar kelas berisi _batch_, bidang, kode kelas, dan jumlah peserta dari kapasitas maksimal 10 per kelas. Administrator dapat meng-klik tombol "Tambah Kelas" untuk menambahkan kelas baru, atau tombol "Edit" maupun "Hapus" pada salah satu kelas untuk mengelolanya.

Gambar 4.66 Hasil Tampilan Konfigurasi Magang - Kelas

1. Halaman Tambah Kelas

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Kelas" pada _tab_ kelas. Tersedia _field_ pilihan _batch_ dan bidang yang harus dipilih administrator, dengan huruf kelas yang akan ditetapkan secara otomatis oleh sistem. Administrator dapat meng-klik tombol "Buat Kelas" untuk menyimpan kelas tersebut, atau "Batal" untuk membatalkannya.

Gambar 4.67 Hasil Tampilan Tambah Kelas

1. Halaman Konfigurasi Jam Kerja dan Libur

Halaman ini terbuka apabila administrator meng-klik menu program magang lalu konfigurasi jam kerja & libur, dengan _tab_ tanggal libur terpilih secara _default_. Halaman ini menampilkan tabel daftar hari libur berisi keterangan, periode, durasi, dan status yang berlaku global untuk seluruh kelas. Administrator dapat meng-klik tombol "Tambah Libur" untuk menambahkan hari libur baru.

Gambar 4.68 Hasil Tampilan Konfigurasi Jam Kerja dan Libur

1. Halaman Tambah Libur

Tampilan ini muncul apabila administrator meng-klik tombol "Tambah Libur" pada _tab_ tanggal libur. Tersedia _field_ keterangan libur, jumlah hari, dan tanggal mulai, dengan tanggal selesai yang otomatis terhitung dan ditampilkan pada halaman ini. Administrator dapat meng-klik tombol "Tambah Libur" untuk menyimpan hari libur tersebut, atau "Batal" untuk membatalkannya.

Gambar 4.69 Hasil Tampilan Tambah Libur

1. Halaman Akun Admin

Halaman ini terbuka apabila administrator meng-klik menu akun admin. Halaman ini menampilkan daftar administrator aktif beserta tanggal bergabung dan status akun, serta daftar undangan yang masih tertunda. Administrator dapat meng-klik tombol "Undang Admin" untuk mengundang administrator baru melalui email.

Gambar 4.70 Hasil Tampilan Akun Admin

## 4.1.3 Hasil Pengujian _Black Box Testing_

Pengujian fungsional sistem dilakukan menggunakan metode _black box testing_, yaitu metode pengujian yang mengevaluasi fungsionalitas sistem semata-mata berdasarkan masukan yang diberikan dan keluaran yang dihasilkan, tanpa memerlukan pengetahuan mengenai struktur internal kode program. Skenario uji disusun mengacu secara langsung pada narasi _use case_ yang telah didefinisikan pada subbab 3.2.2, dengan tujuan memverifikasi kesesuaian keluaran aktual sistem terhadap keluaran yang diharapkan pada setiap skenario yang diuji.

Pengujian dilakukan menggunakan _browser_ brave dan google chrome pada platform yang telah di-_deploy_ di <https://nextlevelacademy.id/>. Skenario uji diorganisasikan berdasarkan kelompok aktor secara konsisten dengan struktur perancangan pada bab 3, mencakup skenario yang berlaku untuk semua aktor, serta skenario khusus untuk peserta didik, peserta magang, mentor, dan administrator. Setiap skenario mencakup kondisi atau data masukan yang digunakan, keluaran yang diharapkan berdasarkan spesifikasi _use case_, keluaran hasil pengujian aktual, serta status pengujian. Rekapitulasi keseluruhan hasil pengujian disajikan pada subbab 4.1.3.6.

## 4.1.3.1 Pengujian Fungsionalitas Semua Aktor

Tabel 4.6 Pengujian Fungsionalitas Semua Aktor

| **No.** | **Fungsi yang Diuji** | **Skenario Uji**                                                  | **Data/Kondisi Masukan**                                                                      | **Keluaran yang Diharapkan**                                                                                                         | **Hasil Pengujian** |
| ------- | --------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 1.      | _Login_               | _Login_ berhasil dengan kredensial yang valid                     | Email dan kata sandi terdaftar dan aktif, email telah diverifikasi                            | Sistem membuat sesi autentikasi dan mengarahkan pengguna ke halaman _dashboard_ sesuai perannya                                      | Sesuai              |
| 2.      | _Login_               | _Login_ dengan kata sandi yang salah                              | Email valid dan terdaftar, kata sandi tidak sesuai                                            | Sistem menampilkan pesan kesalahan tanpa mengungkapkan data yang tidak valid, sesi tidak dibuat                                      | Sesuai              |
| 3.      | _Login_               | _Login_ dengan email yang belum diverifikasi                      | Email terdaftar namun belum diverifikasi                                                      | Sistem menampilkan pemberitahuan bahwa email belum diverifikasi dan menyediakan opsi kirim ulang email verifikasi                    | Sesuai              |
| 4.      | _Login_               | _Login_ dengan akun berstatus nonaktif                            | Email dan kata sandi valid, akun berstatus nonaktif oleh administrator                        | Sistem menampilkan pesan pemberitahuan bahwa akun tidak aktif dan menyarankan pengguna menghubungi administrator                     | Sesuai              |
| 5.      | _Login_               | Percobaan _login_ gagal sebanyak lima kali dalam rentang 15 menit | Email dan kata sandi salah dimasukkan sebanyak 5 kali berturut-turut dari alamat IP yang sama | Sistem menerapkan pembatasan akses sementara (_rate limiting_) dan menolak percobaan _login_ berikutnya dalam rentang waktu tersebut | Sesuai              |
| 6.      | Lupa _Password_       | Permintaan atur ulang kata sandi dengan email valid               | Email terdaftar dimasukkan pada kolom lupa _password_                                         | Sistem mengirimkan email berisi tautan atur ulang kata sandi yang valid selama 60 menit                                              | Sesuai              |
| 7.      | Pengaturan Profil     | Mengubah nama lengkap dan _username_ dengan data baru             | Mengganti isi kolom nama lengkap dan _username_ dengan data baru yang unik, lalu menyimpan    | Profil berhasil diperbarui di basis data dan perubahan langsung tercermin pada antarmuka                                             | Sesuai              |
| 8.      | Pengaturan Profil     | Mengubah _username_ menjadi nama yang sudah digunakan orang lain  | Memasukkan _username_ yang sudah terdaftar di akun lain, lalu menyimpan                       | Sistem menampilkan pesan _error_ bahwa username sudah digunakan dan menolak pembaruan                                                | Sesuai              |

## 4.1.3.2 Pengujian Fungsionalitas Peserta Didik

Tabel 4.7 Pengujian Fungsionalitas Peserta Didik

| **No** | **Fungsi yang Diuji**                                     | **Skenario Uji**                                                             | **Data/Kondisi Masukan**                                                                                      | **Keluaran yang Diharapkan**                                                                                                                                   | **Hasil Pengujian** |
| ------ | --------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1.     | Melihat Katalog dan Detail Kursus                         | Mengakses halaman katalog kursus                                             | Pengguna telah masuk sebagai peserta didik                                                                    | Sistem menampilkan daftar kursus berstatus dipublikasikan beserta informasi ringkas pada setiap kartu kursus, kursus yang dimiliki muncul di bagian teratas    | Sesuai              |
| 2.     | Melihat Katalog dan Detail Kursus                         | Mencari kursus menggunakan kata kunci yang relevan                           | Kata kunci pencarian yang sesuai dengan judul atau kategori kursus yang tersedia                              | Sistem menampilkan daftar kursus yang sesuai dengan kata kunci secara dinamis                                                                                  | Sesuai              |
| 3.     | Melihat Katalog dan Detail Kursus                         | Mencari kursus dengan kata kunci yang tidak ditemukan                        | Kata kunci yang tidak cocok dengan kursus mana pun yang tersedia                                              | Sistem menampilkan pesan informasi bahwa tidak ada kursus yang ditemukan                                                                                       | Sesuai              |
| 4.     | Melihat Katalog dan Detail Kursus                         | Melihat detail suatu kursus                                                  | Pengguna memilih salah satu kursus dari daftar katalog                                                        | Sistem menampilkan halaman detail kursus yang memuat deskripsi lengkap, _thumbnail_, informasi instruktur, struktur kurikulum, harga, manfaat, status, dan FAQ | Sesuai              |
| 5.     | Melakukan Pembelian Kursus                                | Melakukan _checkout_ dan pembayaran kursus tanpa voucher                     | Pengguna belum memiliki kursus, tidak memasukkan kode voucher, menyelesaikan pembayaran melalui Midtrans Snap | Sistem memproses pembayaran, memberikan akses kursus kepada pengguna, mengirim email konfirmasi, dan mengarahkan ke halaman riwayat transaksi                  | Sesuai              |
| 6.     | Melakukan Pembelian Kursus                                | Menerapkan voucher diskon yang valid saat _checkout_                         | Kode voucher yang aktif, belum kedaluwarsa, dan belum melampaui batas penggunaan                              | Sistem menampilkan potongan harga dan harga akhir yang diperbarui sesuai nilai diskon voucher                                                                  | Sesuai              |
| 7.     | Melakukan Pembelian Kursus                                | Memasukkan kode voucher yang tidak valid                                     | Kode voucher yang salah, kedaluwarsa, atau sudah habis penggunaannya                                          | Sistem menampilkan pesan kesalahan, proses _checkout_ tetap dapat dilanjutkan tanpa voucher                                                                    | Sesuai              |
| 8.     | Melakukan Pembelian Kursus                                | Menutup antarmuka Midtrans Snap sebelum transaksi selesai                    | Pengguna membuka antarmuka Midtrans Snap kemudian menutupnya sebelum menyelesaikan pembayaran                 | Pesanan tetap berstatus _pending_, pengguna dapat melanjutkan pembayaran melalui halaman Riwayat Transaksi                                                     | Sesuai              |
| 9.     | Mengakses dan Menonton Materi Video                       | Membuka dan memutar video pembelajaran yang tersedia                         | Pengguna memiliki akses kursus, tahap video yang dipilih telah terbuka sesuai urutan progres                  | Sistem menghasilkan _signed URL_ dari Bunny.net dan menampilkan video pada pemutar media                                                                       | Sesuai              |
| 10.    | Mengakses dan Menonton Materi Video                       | Menandai video selesai untuk pertama kali                                    | Pengguna menekan tombol "Tandai Selesai" pada video yang belum pernah diselesaikan sebelumnya                 | Sistem memperbarui progres kursus, memberikan +15 EXP kepada pengguna, dan membuka tahap pembelajaran berikutnya yang sebelumnya terkunci                      | Sesuai              |
| 11.    | Mengakses dan Menonton Materi Video                       | Mencoba mengakses tahap pembelajaran yang masih terkunci                     | Pengguna mencoba memilih tahap yang belum terbuka karena tahap sebelumnya belum diselesaikan                  | Sistem menampilkan informasi bahwa tahap sebelumnya harus diselesaikan terlebih dahulu, konten tidak dapat diakses                                             | Sesuai              |
| 12.    | Mengerjakan Kuis                                          | Mengerjakan kuis dan memperoleh nilai lulus                                  | Pengguna menjawab seluruh soal, skor yang diperoleh ≥ 80                                                      | Sistem menandai kuis sebagai lulus, memberikan EXP sesuai ketentuan, memperbarui progres kursus, dan membuka tahap berikutnya                                  | Sesuai              |
| 13.    | Mengerjakan Kuis                                          | Mengerjakan kuis dan memperoleh nilai tidak lulus (percobaan ke-1 atau ke-2) | Pengguna menjawab seluruh soal, skor yang diperoleh < 80, percobaan belum mencapai tiga kali berturut-turut   | Sistem menampilkan hasil kuis beserta informasi jumlah sisa percobaan dan opsi "Coba Lagi"                                                                     | Sesuai              |
| 14.    | Mengerjakan Kuis                                          | Mengirim jawaban kuis dengan soal yang belum seluruhnya dijawab              | Pengguna menekan tombol "Kirim Jawaban" sementara masih terdapat soal yang belum dijawab                      | Sistem menampilkan peringatan dan meminta pengguna untuk melengkapi seluruh jawaban sebelum dapat mengirim                                                     | Sesuai              |
| 15.    | Mengerjakan Kuis                                          | Gagal pada kuis sebanyak tiga kali berturut-turut                            | Pengguna memperoleh skor < 80 pada percobaan ketiga secara berturut-turut                                     | Sistem menerapkan _cooldown_ selama 30 menit dan menampilkan hitung mundur waktu tunggu, opsi "Coba Lagi" tidak tersedia selama masa cooldown                  | Sesuai              |
| 16.    | Mengklaim dan Mengunduh Sertifikat                        | Mengklaim sertifikat saat progres kursus telah mencapai 100%                 | Seluruh tahap pembelajaran telah diselesaikan; progres kursus = 100%                                          | Sistem menerbitkan sertifikat digital dengan nomor unik dan tautan verifikasi publik, menyimpan data sertifikat, serta menampilkannya pada halaman Sertifikat  | Sesuai              |
| 17.    | Mengklaim dan Mengunduh Sertifikat                        | Mengunduh sertifikat yang telah diklaim dalam format PDF                     | Sertifikat telah berhasil diklaim sebelumnya                                                                  | Sistem menghasilkan dan menyajikan _file_ sertifikat dalam format PDF untuk diunduh                                                                            | Sesuai              |
| 18.    | Mengklaim dan Mengunduh Sertifikat                        | Mencoba mengklaim sertifikat saat progres kursus belum mencapai 100%         | Pengguna mengakses halaman Sertifikat, progres kursus < 100%                                                  | Sistem tidak menampilkan opsi "Klaim Sertifikat" dan memberikan informasi bahwa sertifikat belum dapat diklaim                                                 | Sesuai              |
| 19.    | Melihat EXP, _Level_, _Badge_, dan Klaim Voucher _Reward_ | Melihat informasi gamifikasi pada halaman EXP & _Level_                      | Pengguna telah masuk sebagai peserta didik dan memiliki aktivitas pembelajaran                                | Sistem menampilkan level saat ini, jumlah EXP, progres menuju _level_ berikutnya, daftar _badge_ yang diperoleh, serta _reward roadmap_                        | Sesuai              |
| 20.    | Melihat EXP, _Level_, _Badge_, dan Klaim Voucher _Reward_ | Mengklaim voucher _reward_ yang sudah terbuka sesuai _level_ yang dicapai    | _Level_ pengguna memenuhi syarat _level milestone,_ _reward_ pada _level_ tersebut belum pernah diklaim       | Sistem membuat kode voucher unik dengan masa berlaku 180 hari dan menampilkannya kepada pengguna                                                               | Sesuai              |
| 21.    | Melihat EXP, _Level_, _Badge_, dan Klaim Voucher _Reward_ | Mencoba mengklaim voucher _reward_ yang masih terkunci                       | _Level_ pengguna belum memenuhi syarat _level milestone_ yang diperlukan                                      | Sistem menampilkan _reward_ dalam kondisi terkunci dengan tombol "Klaim" tidak tersedia                                                                        | Sesuai              |

## 4.1.3.3 Pengujian Fungsionalitas Peserta Magang

Tabel 4.8 Pengujian Fungsionalitas Peserta Magang

| **No** | **Fungsi yang Diuji**          | **Skenario Uji**                                                          | **Data / Kondisi Masukan**                                                                                                 | **Keluaran yang Diharapkan**                                                                                                                | **Hasil Pengujian** |
| ------ | ------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1.     | Melihat dan Melakukan Absensi  | _Check-in_ kehadiran dalam jendela waktu absensi yang berlaku             | Hari ini merupakan hari kerja aktif, waktu saat ini berada dalam jendela waktu absens,; pengguna belum _check-in_ hari ini | Sistem merekam waktu _check-in_ berdasarkan waktu _server_, menetapkan status hadir, dan memperbarui tampilan kalender                      | Sesuai              |
| 2.     | Melihat dan Melakukan Absensi  | Mencoba _check-in_ di luar jendela waktu absensi                          | Waktu saat ini berada di luar jendela waktu absensi yang ditetapkan                                                        | Tombol "_Check-In_ Sekarang" tidak aktif; sistem menampilkan informasi mengenai jendela waktu absensi yang berlaku                          | Sesuai              |
| 3.     | Melihat dan Melakukan Absensi  | Mencoba _check-in_ setelah sudah melakukan _check-in_ pada hari yang sama | Pengguna telah melakukan _check-in_ pada hari yang sama sebelumnya                                                         | Tombol "_Check-In_ Sekarang" tidak tersedia; sistem menampilkan status bahwa absensi telah dilakukan beserta waktu _check-in_ yang tercatat | Sesuai              |
| 4.     | Melihat dan Mengumpulkan Tugas | Mengumpulkan tugas dengan berkas yang valid sebelum tenggat waktu         | Tugas berstatus belum dikumpulkan, berkas yang diunggah sesuai format dan ukuran, tenggat waktu belum terlampaui           | Sistem menyimpan hasil tugas, mengubah status menjadi terkumpul, dan mengirimkan notifikasi kepada mentor                                   | Sesuai              |
| 5.     | Melihat dan Mengumpulkan Tugas | Mencoba mengumpulkan tugas setelah tenggat waktu terlampaui               | Tenggat waktu pengumpulan tugas telah terlampaui                                                                           | Sistem menampilkan informasi bahwa pengumpulan tugas tidak dapat dilakukan, formulir pengumpulan tidak tersedia                             | Sesuai              |
| 6.     | Melihat dan Mengumpulkan Tugas | Mengumpulkan ulang tugas yang dikembalikan mentor sebelum tenggat waktu   | Tugas berstatus dikembalikan oleh mentor, tenggat waktu belum terlampaui                                                   | Sistem menampilkan umpan balik dari mentor dan mengaktifkan kembali formulir pengumpulan, pengumpulan ulang berhasil dilakukan              | Sesuai              |
| 7.     | Melihat Nilai Akhir Magang     | Melihat nilai akhir yang telah ditetapkan oleh mentor                     | Mentor telah memberikan nilai akhir kepada pengguna                                                                        | Sistem menampilkan nilai numerik, predikat nilai, dan catatan evaluasi (jika tersedia) dalam mode baca saja                                 | Sesuai              |
| 8.     | Melihat Nilai Akhir Magang     | Melihat halaman nilai akhir saat mentor belum memberikan nilai            | Mentor belum memberikan nilai akhir kepada pengguna                                                                        | Sistem menampilkan informasi bahwa nilai akhir belum tersedia                                                                               | Sesuai              |

## 4.1.3.4 Pengujian Fungsionalitas Mentor

Tabel 4.9 Pengujian Fungsionalitas Mentor

| **No** | **Fungsi yang Diuji**                         | **Skenario Uji**                                                | **Data / Kondisi Masukan**                                                          | **Keluaran yang Diharapkan**                                                                                                     | **Hasil Pengujian** |
| ------ | --------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1.     | Melakukan Absensi Harian (_Check-In_ Pribadi) | _Check-in_ pribadi dalam jendela waktu absensi                  | Waktu saat ini berada dalam jendela waktu absensi, mentor belum _check-in_ hari ini | Sistem merekam waktu _check-in_ berdasarkan waktu _server_ dan memperbarui kalender sehingga tanggal hari ini ditandai hadir     | Sesuai              |
| 2.     | Melakukan Absensi Harian (_Check-In_ Pribadi) | Mencoba _check-in_ di luar jendela waktu absensi                | Waktu saat ini berada di luar jendela waktu absensi                                 | Tombol _check-in_ tidak aktif, sistem menampilkan keterangan mengenai jendela waktu yang berlaku                                 | Sesuai              |
| 3.     | Melakukan Absensi Harian (_Check-In_ Pribadi) | Mencoba _check-in_ setelah sudah _check-in_ pada hari yang sama | Mentor telah melakukan _check-in_ pada hari yang sama                               | Sistem menampilkan waktu _check-in_ yang telah tercatat tombol _check-in_ tidak tersedia lagi                                    | Sesuai              |
| 4.     | Melihat Absensi Peserta Magang                | Melihat rekap absensi peserta magang pada hari ini              | Mentor memiliki kelas magang aktif, terdapat peserta yang terdaftar                 | Sistem menampilkan tabel kehadiran peserta magang hari ini yang memuat nama peserta, waktu _check-in_, dan status kehadiran      | Sesuai              |
| 5.     | Melihat Absensi Peserta Magang                | Melihat rekap absensi pada tanggal tertentu yang dipilih        | Mentor memilih tanggal hari kerja tertentu yang memiliki riwayat absensi            | Sistem menampilkan data kehadiran seluruh peserta magang pada tanggal yang dipilih                                               | Sesuai              |
| 6.     | Melihat Absensi Peserta Magang                | Melihat absensi pada tanggal libur atau akhir pekan             | Mentor memilih tanggal yang merupakan hari libur resmi atau akhir pekan             | Sistem menampilkan informasi bahwa tidak terdapat aktivitas magang pada tanggal tersebut                                         | Sesuai              |
| 7.     | Mendistribusikan dan Mengelola Tugas          | Membuat tugas baru dengan data yang lengkap                     | Judul, deskripsi, dan tenggat waktu terisi, lampiran bersifat opsional              | Sistem menyimpan tugas, mendistribusikannya kepada peserta magang, dan mengirimkan notifikasi kepada peserta terkait             | Sesuai              |
| 8.     | Mendistribusikan dan Mengelola Tugas          | Membuat tugas baru tanpa mengisi data wajib                     | Satu atau lebih kolom wajib (judul, deskripsi, tenggat waktu) tidak diisi           | Sistem menampilkan pesan kesalahan pada kolom yang tidak diisi, tugas tidak tersimpan                                            | Sesuai              |
| 9.     | Mendistribusikan dan Mengelola Tugas          | Menghapus tugas dengan mengonfirmasi dialog konfirmasi          | Mentor memilih tugas yang akan dihapus dan mengonfirmasi tindakan penghapusan       | Sistem menghapus tugas beserta seluruh data pengumpulan yang terkait dan membersihkan berkas pada media penyimpanan              | Sesuai              |
| 10.    | Meninjau dan Memberikan _Feedback_ Tugas      | Mengembalikan tugas peserta dengan menyertakan umpan balik      | Terdapat pengumpulan tugas berstatus terkumpul; kolom umpan balik terisi            | Sistem mengubah status pengumpulan menjadi dikembalikan, menyimpan umpan balik, dan mengirimkan notifikasi kepada peserta magang | Sesuai              |
| 11.    | Meninjau dan Memberikan _Feedback_ Tugas      | Mencoba mengembalikan tugas tanpa mengisi umpan balik           | Mentor menekan tombol "Kembalikan" tanpa mengisi kolom umpan balik                  | Sistem menampilkan pesan kesalahan; proses pengembalian tugas ditolak                                                            | Sesuai              |
| 12.    | Memberikan Nilai Akhir Peserta Magang         | Memberikan nilai akhir yang valid disertai catatan evaluasi     | Nilai yang dimasukkan dalam rentang 0-100; catatan evaluasi diisi                   | Sistem menyimpan nilai akhir, menentukan predikat nilai yang sesuai, dan mengirimkan notifikasi kepada peserta magang            | Sesuai              |
| 13.    | Memberikan Nilai Akhir Peserta Magang         | Memasukkan nilai di luar rentang yang diizinkan                 | Nilai yang dimasukkan kurang dari 0 atau lebih dari 100                             | Sistem menampilkan pesan kesalahan; nilai tidak tersimpan                                                                        | Sesuai              |

## 4.1.3.5 Pengujian Fungsionalitas Administrator

Tabel 4.10 Pengujian Fungsionalitas Administrator

| **No** | **Fungsi yang Diuji**                                     | **Skenario Uji**                                                                       | **Data / Kondisi Masukan**                                                                                                | **Keluaran yang Diharapkan**                                                                                                                     | **Hasil Pengujian** |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 1.     | Mengelola Data Kursus dan Kurikulum                       | Membuat kursus baru dengan data dasar yang valid                                       | Judul, kategori, dan harga kursus terisi                                                                                  | Sistem membuat kursus berstatus _draft_, menghasilkan _slug URL_ secara otomatis, dan mengarahkan administrator ke halaman pengelolaan kursus    | Sesuai              |
| 2.     | Mengelola Data Kursus dan Kurikulum                       | Mengunggah video ke langkah kurikulum bertipe video                                    | Berkas video yang valid diunggah pada langkah kurikulum yang telah dibuat                                                 | Sistem mengunggah video ke Bunny.net, memproses encoding, dan memperbarui status langkah menjadi siap digunakan                                  | Sesuai              |
| 3.     | Mengelola Data Kursus dan Kurikulum                       | Mempublikasikan kursus dengan seluruh komponen lengkap                                 | Kursus memiliki thumbnail, harga, kurikulum dengan materi video siap, dan soal kuis (jika ada)                            | Sistem memvalidasi kelengkapan dan mengubah status kursus menjadi dipublikasikan; kursus tampil pada katalog peserta didik                       | Sesuai              |
| 4.     | Mengelola Data Kursus dan Kurikulum                       | Mencoba mempublikasikan kursus dengan komponen yang belum lengkap                      | Satu atau lebih komponen wajib belum terpenuhi (misal: belum ada _thumbnail_ atau kurikulum kosong)                       | Sistem menolak publikasi dan menampilkan daftar komponen yang masih harus dilengkapi; status kursus tetap _draft_                                | Sesuai              |
| 5.     | Mengelola Data Kursus dan Kurikulum                       | Menghapus kursus yang belum memiliki peserta maupun transaksi                          | Kursus berstatus _draft_ tanpa peserta aktif dan tanpa riwayat transaksi                                                  | Sistem menghapus kursus beserta seluruh kurikulumnya dari sistem                                                                                 | Sesuai              |
| 6.     | Mengelola Data Kursus dan Kurikulum                       | Mencoba menghapus kursus yang memiliki peserta aktif                                   | Kursus yang akan dihapus memiliki peserta terdaftar atau riwayat transaksi                                                | Sistem menolak penghapusan dan menampilkan informasi bahwa kursus tidak dapat dihapus karena keterkaitan data                                    | Sesuai              |
| 7.     | Mengelola Kategori Kursus                                 | Menambah kategori baru dengan nama yang unik                                           | Nama kategori diisi dan belum digunakan oleh kategori lain                                                                | Sistem menyimpan kategori baru dan menampilkannya pada daftar kategori                                                                           | Sesuai              |
| 8.     | Mengelola Kategori Kursus                                 | Menambah kategori dengan nama yang sudah digunakan                                     | Nama kategori yang dimasukkan identik dengan nama kategori yang sudah ada                                                 | Sistem menampilkan pesan kesalahan; kategori tidak tersimpan                                                                                     | Sesuai              |
| 9.     | Mengelola Kategori Kursus                                 | Menghapus kategori yang masih digunakan oleh kursus aktif                              | Kategori yang dipilih untuk dihapus masih dikaitkan dengan satu atau lebih kursus                                         | Sistem menolak penghapusan dan menampilkan informasi bahwa kategori masih digunakan                                                              | Sesuai              |
| 10.    | Mengelola Data Pengguna                                   | Menambah akun peserta didik baru dengan data yang lengkap                              | Nama, email unik, dan peran peserta didik terisi                                                                          | Sistem membuat akun baru dan mengaktifkan mekanisme wajib ganti kata sandi pada _login_ pertama                                                  | Sesuai              |
| 11.    | Mengelola Data Pengguna                                   | Menambah akun pengguna dengan email yang sudah terdaftar                               | Email yang dimasukkan telah digunakan oleh akun lain dalam sistem                                                         | Sistem menampilkan pesan kesalahan; akun tidak dibuat                                                                                            | Sesuai              |
| 12.    | Mengelola Data Pengguna                                   | Menonaktifkan akun pengguna yang sedang aktif                                          | Administrator memilih akun aktif dan mengonfirmasi tindakan penonaktifan                                                  | Sistem mencabut seluruh sesi aktif pengguna dan mengubah status akun menjadi nonaktif                                                            | Sesuai              |
| 13.    | Mengelola Transaksi                                       | Melihat daftar transaksi dengan _filter_ status tertentu                               | Administrator menerapkan _filter_ berdasarkan status transaksi (misal: _pending_, berhasil, dibatalkan)                   | Sistem menampilkan daftar transaksi yang sesuai dengan _filter_ yang diterapkan                                                                  | Sesuai              |
| 14.    | Mengelola Transaksi                                       | Membatalkan transaksi berstatus _pending_                                              | Administrator memilih transaksi berstatus _pending_ dan memilih tindakan pembatalan                                       | Sistem memperbarui status transaksi menjadi dibatalkan                                                                                           | Sesuai              |
| 15.    | Mengelola Transaksi                                       | Mencoba mengubah status transaksi yang telah berstatus berhasil                        | Administrator memilih transaksi berstatus berhasil dan mencoba mengubah statusnya                                         | Sistem menolak perubahan dan menampilkan informasi bahwa status transaksi bersifat final                                                         | Sesuai              |
| 16.    | Mengelola Voucher Diskon                                  | Membuat voucher baru dengan kode yang unik                                             | Kode voucher, jenis diskon, nilai diskon, batas penggunaan, dan periode berlaku terisi; kode belum digunakan voucher lain | Sistem memvalidasi keunikan kode dan menyimpan voucher baru ke dalam basis data                                                                  | Sesuai              |
| 17.    | Mengelola Voucher Diskon                                  | Membuat voucher dengan kode yang sudah digunakan voucher lain                          | Kode voucher yang dimasukkan identik dengan kode voucher yang sudah ada                                                   | Sistem menampilkan pesan kesalahan; voucher tidak tersimpan                                                                                      | Sesuai              |
| 18.    | Mengelola Voucher Diskon                                  | Mencoba menghapus voucher yang sudah digunakan pada transaksi                          | Voucher yang dipilih telah digunakan minimal pada satu transaksi                                                          | Sistem menolak penghapusan dan menampilkan informasi bahwa voucher tidak dapat dihapus                                                           | Sesuai              |
| 19.    | Mengelola Sertifikat                                      | Melihat daftar sertifikat yang telah diterbitkan sistem                                | Administrator mengakses halaman manajemen sertifikat                                                                      | Sistem menampilkan daftar sertifikat beserta nomor sertifikat, nama penerima, nama kursus, tanggal terbit, dan status validitas                  | Sesuai              |
| 20.    | Mengelola Sertifikat                                      | Mengunduh sertifikat peserta dalam format PDF                                          | Administrator memilih sertifikat tertentu dan menekan tombol "Unduh PDF"                                                  | Sistem menghasilkan dan menyajikan file sertifikat dalam format PDF untuk diunduh                                                                | Sesuai              |
| 21.    | Mengelola Gamifikasi (EXP _Rules_ dan _Badge_)            | Melihat aturan EXP dan _level_ yang berlaku pada sistem                                | Administrator mengakses halaman "Aturan EXP"                                                                              | Sistem menampilkan informasi aturan pemberian EXP, _level_, dan hadiah dalam mode baca saja                                                      | Sesuai              |
| 22.    | Mengelola Gamifikasi (EXP _Rules_ dan _Badge_)            | Menambah _badge_ baru dengan data yang lengkap                                         | Nama, deskripsi, jenis pemicu, ambang batas, dan ikon _badge_ terisi; format dan ukuran ikon sesuai ketentuan             | Sistem memvalidasi data dan menyimpan _badge_ baru; _badge_ akan diberikan otomatis kepada pengguna yang memenuhi ketentuan                      | Sesuai              |
| 23.    | Mengelola Gamifikasi (EXP _Rules_ dan _Badge_)            | Menghapus _badge_ yang ada dengan mengonfirmasi dialog                                 | Administrator memilih _badge_ yang akan dihapus dan mengonfirmasi tindakan                                                | Sistem menghapus _badge_ yang dipilih dari sistem                                                                                                | Sesuai              |
| 24.    | Memantau dan Mengedit Data Absensi Magang                 | Melihat rekap absensi peserta magang dengan _filter_ kelas                             | Administrator memilih _batch_, bidang, dan kelas tertentu sebagai filter                                                  | Sistem menampilkan data kehadiran sesuai filter yang dipilih, memuat nama, kelas, waktu _check-in_, dan status kehadiran                         | Sesuai              |
| 25.    | Memantau dan Mengedit Data Absensi Magang                 | Mengoreksi status absensi peserta secara manual                                        | Administrator memilih data absensi tertentu dan mengubah statusnya                                                        | Sistem menyimpan perubahan status dan mencatat identitas administrator yang melakukan perubahan pada _audit log_                                 | Sesuai              |
| 26.    | Mengelola Konfigurasi Magang (_Batch_, Bidang, dan Kelas) | Menambah Batch baru dengan data yang lengkap                                           | Nama dan informasi _Batch_ terisi                                                                                         | Sistem menyimpan data _Batch_ baru dan menampilkannya pada daftar konfigurasi                                                                    | Sesuai              |
| 27.    | Mengelola Konfigurasi Magang (_Batch_, Bidang, dan Kelas) | Menambah kelas dengan memilih _batch_ dan bidang yang sesuai                           | _Batch_ dan bidang yang valid dipilih; nama kelas terisi                                                                  | Sistem menyimpan data kelas dan mengaitkannya dengan _batch_ serta bidang yang dipilih                                                           | Sesuai              |
| 28.    | Mengelola Konfigurasi Magang (Batch, Bidang, dan Kelas)   | Mencoba menghapus kelas yang masih memiliki peserta magang aktif                       | Kelas yang dipilih untuk dihapus masih memiliki peserta magang yang terdaftar                                             | Sistem menolak penghapusan dan menampilkan informasi keterkaitan data yang mencegah penghapusan                                                  | Sesuai              |
| 29.    | Memantau dan Mengelola Tugas Magang                       | Melihat daftar tugas magang dengan filter kelas tertentu                               | Administrator menerapkan filter berdasarkan _batch_, bidang, atau kelas                                                   | Sistem menampilkan daftar tugas sesuai filter yang dipilih beserta informasi judul, kelas, tenggat waktu, dan status                             | Sesuai              |
| 30.    | Memantau dan Mengelola Tugas Magang                       | Menyesuaikan status pengumpulan peserta secara manual menjadi terkumpul tanpa berkas   | Administrator mengubah status pengumpulan peserta menjadi terkumpul; peserta tidak mengunggah berkas                      | Sistem menyimpan perubahan status dan menampilkan keterangan "tanpa berkas" pada data pengumpulan tersebut                                       | Sesuai              |
| 31.    | Mengelola Nilai Akhir Magang                              | Mengubah nilai akhir peserta dengan alasan perubahan yang terisi                       | Nilai baru dalam rentang 0-100 dan kolom alasan perubahan terisi                                                          | Sistem memperbarui nilai akhir, mengirimkan notifikasi kepada mentor, dan mencatat seluruh perubahan pada _audit log_                            | Sesuai              |
| 32.    | Mengelola Nilai Akhir Magang                              | Mencoba mengubah nilai akhir peserta tanpa mengisi alasan perubahan                    | Nilai baru dalam rentang 0-100 tetapi kolom alasan perubahan dikosongkan                                                  | Sistem menampilkan pesan kesalahan; nilai akhir tidak diperbarui                                                                                 | Sesuai              |
| 33.    | Konfigurasi Jam Kerja dan Tanggal Libur                   | Menambah data libur baru dengan tanggal mulai yang valid                               | Keterangan, jumlah hari libur, dan tanggal mulai (tidak lebih awal dari hari ini) terisi                                  | Sistem menghitung tanggal berakhir secara otomatis dan menyimpan data libur; hari dalam rentang tersebut dikecualikan dari perhitungan kehadiran | Sesuai              |
| 34.    | Konfigurasi Jam Kerja dan Tanggal Libur                   | Menghapus data libur berstatus Akan Datang                                             | Administrator memilih data libur berstatus Akan Datang dan mengonfirmasi penghapusan                                      | Sistem menghapus data libur; hari yang sebelumnya ditetapkan sebagai hari libur kembali dihitung sebagai hari kerja                              | Sesuai              |
| 35.    | Konfigurasi Jam Kerja dan Tanggal Libur                   | Mencoba mengedit atau menghapus data libur berstatus Sudah Selesai                     | Administrator mengakses data libur yang berstatus Sudah Selesai                                                           | Sistem tidak menampilkan opsi edit maupun hapus pada data libur tersebut                                                                         | Sesuai              |
| 36.    | Mengelola Akun Administrator                              | Mengundang administrator baru melalui email                                            | Alamat email calon administrator valid dan belum terdaftar sebagai administrator                                          | Sistem membuat tautan undangan berlaku 24 jam dan mengirimkannya ke alamat email yang ditentukan                                                 | Sesuai              |
| 37.    | Mengelola Akun Administrator                              | Menonaktifkan akun administrator lain (masih terdapat administrator aktif lainnya)     | Terdapat minimal dua administrator aktif; administrator memilih salah satu untuk dinonaktifkan                            | Sistem memproses penonaktifan dan memperbarui status akun yang bersangkutan                                                                      | Sesuai              |
| 38.    | Mengelola Akun Administrator                              | Mencoba menonaktifkan akun administrator ketika hanya tersisa satu administrator aktif | Hanya terdapat satu administrator aktif dalam sistem                                                                      | Sistem menolak tindakan dan menampilkan pesan peringatan bahwa setidaknya satu administrator aktif harus tersisa                                 | Sesuai              |

## 4.1.3.6 Rekapitulasi Hasil Pengujian

Rekapitulasi hasil pengujian disusun berdasarkan data kuesioner yang dikumpulkan melalui Google Form. Proses pengujian melibatkan 17 responden yang terdiri atas 13 pengguna umum dan 4 pengguna dari pihak NextLevel Academy sebagai mitra penelitian. Pengguna umum berperan dalam menguji fungsionalitas sistem yang dapat diakses oleh publik dan peserta didik, sedangkan pengguna dari pihak NextLevel Academy menguji seluruh fungsionalitas sistem, termasuk fitur peserta didik, peserta magang, mentor, dan administrator.

Pelaksanaan pengujian dilakukan dengan membagikan tautan Google Form kepada setiap responden melalui pesan pribadi menggunakan aplikasi WhatsApp. Sebelum mengisi kuesioner, setiap responden diminta untuk membaca arahan dan syarat memulai pengisian (jika ada), lalu mencoba seluruh skenario penggunaan sistem sesuai dengan peran yang telah ditentukan. Setelah seluruh skenario selesai dijalankan, responden mengisi kuesioner berdasarkan hasil pengujian yang telah dilakukan.

Pengumpulan data dilakukan menggunakan dua formulir kuesioner yang berbeda sesuai dengan cakupan pengujiannya. Formulir pertama memuat skenario uji yang mencakup _use case_ aktor umum dan peserta didik. Formulir ini diberikan kepada pengguna umum maupun pengguna dari pihak NextLevel Academy dan dapat diakses melalui <https://forms.gle/4REdEXzr3YSJ1tFj9>. Formulir kedua memuat skenario uji yang mencakup _use case_ peserta magang, mentor, dan administrator. Formulir ini hanya diberikan kepada pengguna dari pihak NextLevel Academy dan dapat diakses melalui <https://forms.gle/XF6A3XrETdbawx2K9>.

Setiap pertanyaan dalam kuesioner merepresentasikan satu skenario uji dengan dua pilihan jawaban, yaitu "Sesuai" yang menunjukkan bahwa sistem berjalan sesuai dengan hasil yang diharapkan, dan "Tidak Sesuai" yang menunjukkan bahwa sistem belum berjalan sesuai dengan hasil yang diharapkan. Persentase keberhasilan pada setiap skenario dihitung berdasarkan proporsi jawaban "Sesuai" terhadap jumlah responden yang menguji skenario tersebut. Rekapitulasi hasil pengujian untuk seluruh skenario disajikan pada Tabel 4.11.

Tabel 4.11 Rekapitulasi Hasil Pengujian Black Box Testing Berdasarkan Kuesioner

| **No**                      | **Skenario Uji**                                                                       | **Jumlah Responden** | **Jawaban Sesuai** | **Jawaban Tidak Sesuai** | **Persentase Keberhasilan (%)** |
| --------------------------- | -------------------------------------------------------------------------------------- | -------------------- | ------------------ | ------------------------ | ------------------------------- |
| 1.                          | _Login_ berhasil dengan kredensial yang valid                                          | 17                   | 17                 | 0                        | 100%                            |
| 2.                          | _Login_ dengan kata sandi yang salah                                                   | 17                   | 17                 | 0                        | 100%                            |
| 3.                          | _Login_ dengan email yang belum diverifikasi                                           | 17                   | 17                 | 0                        | 100%                            |
| 4.                          | _Login_ dengan akun berstatus nonaktif                                                 | 17                   | 17                 | 0                        | 100%                            |
| 5.                          | Percobaan _login_ gagal sebanyak lima kali dalam rentang 15 menit                      | 17                   | 17                 | 0                        | 100%                            |
| 6.                          | Permintaan atur ulang kata sandi dengan email valid                                    | 17                   | 17                 | 0                        | 100%                            |
| 7.                          | Mengubah nama lengkap dan _username_ dengan data baru                                  | 17                   | 17                 | 0                        | 100%                            |
| 8.                          | Mengubah _username_ menjadi nama yang sudah digunakan orang lain                       | 17                   | 17                 | 0                        | 100%                            |
| 9.                          | Mengakses halaman katalog kursus                                                       | 17                   | 17                 | 0                        | 100%                            |
| 10.                         | Mencari kursus menggunakan kata kunci yang relevan                                     | 17                   | 17                 | 0                        | 100%                            |
| 11.                         | Mencari kursus dengan kata kunci yang tidak ditemukan                                  | 17                   | 17                 | 0                        | 100%                            |
| 12.                         | Melihat detail suatu kursus                                                            | 17                   | 17                 | 0                        | 100%                            |
| 13.                         | Melakukan _checkout_ dan pembayaran kursus tanpa voucher                               | 17                   | 17                 | 0                        | 100%                            |
| 14.                         | Menerapkan voucher diskon yang valid saat _checkout_                                   | 17                   | 17                 | 0                        | 100%                            |
| 15.                         | Memasukkan kode voucher yang tidak valid                                               | 17                   | 17                 | 0                        | 100%                            |
| 16.                         | Menutup antarmuka Midtrans Snap sebelum transaksi selesai                              | 17                   | 17                 | 0                        | 100%                            |
| 17.                         | Membuka dan memutar video pembelajaran yang tersedia                                   | 17                   | 17                 | 0                        | 100%                            |
| 18.                         | Menandai video selesai untuk pertama kali                                              | 17                   | 17                 | 0                        | 100%                            |
| 19.                         | Mencoba mengakses tahap pembelajaran yang masih terkunci                               | 17                   | 17                 | 0                        | 100%                            |
| 20.                         | Mengerjakan kuis dan memperoleh nilai lulus                                            | 17                   | 17                 | 0                        | 100%                            |
| 21.                         | Mengerjakan kuis dan memperoleh nilai tidak lulus (percobaan ke-1 atau ke-2)           | 17                   | 17                 | 0                        | 100%                            |
| 22.                         | Mengirim jawaban kuis dengan soal yang belum seluruhnya dijawab                        | 17                   | 17                 | 0                        | 100%                            |
| 23.                         | Gagal pada kuis sebanyak tiga kali berturut-turut                                      | 17                   | 17                 | 0                        | 100%                            |
| 24.                         | Mengklaim sertifikat saat progres kursus telah mencapai 100%                           | 17                   | 17                 | 0                        | 100%                            |
| 25.                         | Mengunduh sertifikat yang telah diklaim dalam format PDF                               | 17                   | 17                 | 0                        | 100%                            |
| 26.                         | Mencoba mengklaim sertifikat saat progres kursus belum mencapai 100%                   | 17                   | 17                 | 0                        | 100%                            |
| 27.                         | Melihat informasi gamifikasi pada halaman EXP & _Level_                                | 17                   | 17                 | 0                        | 100%                            |
| 28.                         | Mengklaim voucher _reward_ yang sudah terbuka sesuai _level_ yang dicapai              | 17                   | 17                 | 0                        | 100%                            |
| 29.                         | Mencoba mengklaim voucher _reward_ yang masih terkunci                                 | 17                   | 17                 | 0                        | 100%                            |
| 30.                         | _Check-in_ kehadiran dalam jendela waktu absensi yang berlaku                          | 4                    | 4                  | 0                        | 100%                            |
| 31.                         | Mencoba _check-in_ di luar jendela waktu absensi                                       | 4                    | 4                  | 0                        | 100%                            |
| 32.                         | Mencoba _check-in_ setelah sudah melakukan _check-in_ pada hari yang sama              | 4                    | 4                  | 0                        | 100%                            |
| 33.                         | Mengumpulkan tugas dengan berkas yang valid sebelum tenggat waktu                      | 4                    | 4                  | 0                        | 100%                            |
| 34.                         | Mencoba mengumpulkan tugas setelah tenggat waktu terlampaui                            | 4                    | 4                  | 0                        | 100%                            |
| 35.                         | Mengumpulkan ulang tugas yang dikembalikan mentor sebelum tenggat waktu                | 4                    | 4                  | 0                        | 100%                            |
| 36.                         | Melihat nilai akhir yang telah ditetapkan oleh mentor                                  | 4                    | 4                  | 0                        | 100%                            |
| 37.                         | Melihat halaman nilai akhir saat mentor belum memberikan nilai                         | 4                    | 4                  | 0                        | 100%                            |
| 38.                         | _Check-in_ pribadi Mentor dalam jendela waktu absensi                                  | 4                    | 4                  | 0                        | 100%                            |
| 39.                         | Mencoba _check-in_ mentor di luar jendela waktu absensi                                | 4                    | 4                  | 0                        | 100%                            |
| 40.                         | Mencoba _check-in_ mentor setelah sudah _check-in_ pada hari yang sama                 | 4                    | 4                  | 0                        | 100%                            |
| 41.                         | Melihat rekap absensi peserta magang pada hari ini                                     | 4                    | 4                  | 0                        | 100%                            |
| 42.                         | Melihat rekap absensi pada tanggal tertentu yang dipilih                               | 4                    | 4                  | 0                        | 100%                            |
| 43.                         | Melihat absensi pada tanggal libur atau akhir pekan                                    | 4                    | 4                  | 0                        | 100%                            |
| 44.                         | Membuat tugas baru dengan data yang lengkap                                            | 4                    | 4                  | 0                        | 100%                            |
| 45.                         | Membuat tugas baru tanpa mengisi data wajib                                            | 4                    | 4                  | 0                        | 100%                            |
| 46.                         | Menghapus tugas dengan mengonfirmasi dialog konfirmasi                                 | 4                    | 4                  | 0                        | 100%                            |
| 47.                         | Mengembalikan tugas peserta dengan menyertakan umpan balik                             | 4                    | 4                  | 0                        | 100%                            |
| 48.                         | Mencoba mengembalikan tugas tanpa mengisi umpan balik                                  | 4                    | 4                  | 0                        | 100%                            |
| 49.                         | Memberikan nilai akhir yang valid disertai catatan evaluasi                            | 4                    | 4                  | 0                        | 100%                            |
| 50.                         | Memasukkan nilai di luar rentang yang diizinkan                                        | 4                    | 4                  | 0                        | 100%                            |
| 51.                         | Membuat kursus baru dengan data dasar yang valid                                       | 4                    | 4                  | 0                        | 100%                            |
| 52.                         | Mengunggah video ke langkah kurikulum bertipe video                                    | 4                    | 4                  | 0                        | 100%                            |
| 53.                         | Mempublikasikan kursus dengan seluruh komponen lengkap                                 | 4                    | 4                  | 0                        | 100%                            |
| 54.                         | Mencoba mempublikasikan kursus dengan komponen yang belum lengkap                      | 4                    | 4                  | 0                        | 100%                            |
| 55.                         | Menghapus kursus yang belum memiliki peserta maupun transaksi                          | 4                    | 4                  | 0                        | 100%                            |
| 56.                         | Mencoba menghapus kursus yang memiliki peserta aktif                                   | 4                    | 4                  | 0                        | 100%                            |
| 57.                         | Menambah kategori baru dengan nama yang unik                                           | 4                    | 4                  | 0                        | 100%                            |
| 58.                         | Menambah kategori dengan nama yang sudah digunakan                                     | 4                    | 4                  | 0                        | 100%                            |
| 59.                         | Menghapus kategori yang masih digunakan oleh kursus aktif                              | 4                    | 4                  | 0                        | 100%                            |
| 60.                         | Menambah akun peserta didik baru dengan data yang lengkap                              | 4                    | 4                  | 0                        | 100%                            |
| 61.                         | Menambah akun pengguna dengan email yang sudah terdaftar                               | 4                    | 4                  | 0                        | 100%                            |
| 62.                         | Menonaktifkan akun pengguna yang sedang aktif                                          | 4                    | 4                  | 0                        | 100%                            |
| 63.                         | Melihat daftar transaksi dengan _filter_ status tertentu                               | 4                    | 4                  | 0                        | 100%                            |
| 64.                         | Membatalkan transaksi berstatus _pending_                                              | 4                    | 4                  | 0                        | 100%                            |
| 65.                         | Mencoba mengubah status transaksi yang telah berstatus berhasil                        | 4                    | 4                  | 0                        | 100%                            |
| 66.                         | Membuat voucher baru dengan kode yang unik                                             | 4                    | 4                  | 0                        | 100%                            |
| 67.                         | Membuat voucher dengan kode yang sudah digunakan voucher lain                          | 4                    | 4                  | 0                        | 100%                            |
| 68.                         | Mencoba menghapus voucher yang sudah digunakan pada transaksi                          | 4                    | 4                  | 0                        | 100%                            |
| 69.                         | Melihat daftar sertifikat yang telah diterbitkan sistem                                | 4                    | 4                  | 0                        | 100%                            |
| 70.                         | Mengunduh sertifikat peserta dalam format PDF                                          | 4                    | 4                  | 0                        | 100%                            |
| 71.                         | Melihat aturan EXP dan _level_ yang berlaku pada sistem                                | 4                    | 4                  | 0                        | 100%                            |
| 72.                         | Menambah _badge_ baru dengan data yang lengkap                                         | 4                    | 4                  | 0                        | 100%                            |
| 73.                         | Menghapus _badge_ yang ada dengan mengonfirmasi dialog                                 | 4                    | 4                  | 0                        | 100%                            |
| 74.                         | Melihat rekap absensi peserta magang dengan _filter_ kelas                             | 4                    | 4                  | 0                        | 100%                            |
| 75.                         | Mengoreksi status absensi peserta secara manual                                        | 4                    | 4                  | 0                        | 100%                            |
| 76.                         | Menambah _batch_ baru dengan data yang lengkap                                         | 4                    | 4                  | 0                        | 100%                            |
| 77.                         | Menambah kelas dengan memilih _batch_ dan bidang yang sesuai                           | 4                    | 4                  | 0                        | 100%                            |
| 78.                         | Mencoba menghapus kelas yang masih memiliki peserta magang aktif                       | 4                    | 4                  | 0                        | 100%                            |
| 79.                         | Melihat daftar tugas magang dengan filter kelas tertentu                               | 4                    | 4                  | 0                        | 100%                            |
| 80.                         | Menyesuaikan status pengumpulan peserta secara manual menjadi terkumpul tanpa berkas   | 4                    | 4                  | 0                        | 100%                            |
| 81.                         | Mengubah nilai akhir peserta dengan alasan perubahan yang terisi                       | 4                    | 4                  | 0                        | 100%                            |
| 82.                         | Mencoba mengubah nilai akhir peserta tanpa mengisi alasan perubahan                    | 4                    | 4                  | 0                        | 100%                            |
| 83.                         | Menambah data libur baru dengan tanggal mulai yang valid                               | 4                    | 4                  | 0                        | 100%                            |
| 84.                         | Menghapus data libur berstatus Akan Datang                                             | 4                    | 4                  | 0                        | 100%                            |
| 85.                         | Mencoba mengedit atau menghapus data libur berstatus Sudah Selesai                     | 4                    | 4                  | 0                        | 100%                            |
| 86.                         | Mengundang administrator baru melalui email                                            | 4                    | 4                  | 0                        | 100%                            |
| 87.                         | Menonaktifkan akun administrator lain (masih terdapat administrator aktif lainnya)     | 4                    | 4                  | 0                        | 100%                            |
| 88.                         | Mencoba menonaktifkan akun administrator ketika hanya tersisa satu administrator aktif | 4                    | 4                  | 0                        | 100%                            |
| **Rata - Rata Keseluruhan** |                                                                                        |                      |                    |                          | **100%**                        |

## 4.2 Pembahasan

Bagian ini membahas dan menganalisis hasil implementasi platform NextLevel Academy yang telah dipaparkan pada subbab 4.1, dengan menghubungkannya secara langsung terhadap rumusan masalah dan tujuan penelitian yang telah ditetapkan pada bab 1. Pembahasan dibagi ke dalam lima subbab yang mencerminkan cakupan implementasi dan pengujian yang dilakukan, yaitu implementasi platform pembelajaran digital berbasis web, implementasi sistem gamifikasi, implementasi sistem magang daring, analisis hasil pengujian _black box testing_, serta evaluasi pencapaian tujuan penelitian.

## 4.2.1 Platform Pembelajaran Digital Berbasis Web

Rumusan masalah pertama penelitian ini mengidentifikasi bahwa seluruh kegiatan pembelajaran NextLevel Academy masih berlangsung secara konvensional melalui _workshop_ dan seminar luring, pengelolaan materi, tugas, dan sertifikat dikerjakan secara manual, jangkauan program terbatas secara geografis, dan tidak ada mekanisme untuk memantau progres belajar peserta secara terstruktur. Beban operasional yang muncul dari kondisi tersebut, mulai dari biaya pengadaan properti acara, pencetakan dokumen, hingga _prize pool_ yang harus disiapkan pada setiap penyelenggaraan menjadi hambatan nyata bagi mitra dalam menjalankan program secara berkelanjutan. Tujuan pertama penelitian ini merespons kondisi tersebut dengan merancang dan mengimplementasikan platform pembelajaran digital berbasis web yang terintegrasi, sehingga pengelolaan pembelajaran dapat dilakukan secara digital dan terpusat, jangkauan program dapat diperluas tanpa batasan geografis, serta pemantauan progres peserta dapat dilaksanakan secara terstruktur guna mereduksi beban operasional dan menjaga kontinuitas pembelajaran.

Platform NextLevel Academy berhasil diimplementasikan sebagai aplikasi _web fullstack_ berbasis Next.js yang dapat diakses secara publik melalui <https://nextlevelacademy.id/>. Sebagai platform berbasis web, sistem ini memanfaatkan keunggulan fundamental teknologi _website_ yang telah diuraikan pada subbab 2.6, tidak memerlukan instalasi perangkat lunak tambahan pada sisi pengguna, dapat diakses dari perangkat apa pun selama terhubung dengan internet, dan mendukung antarmuka yang responsif di berbagai ukuran layar mulai dari ponsel hingga layar _ultrawide_ 2560 px. Keterbatasan geografis yang menjadi kendala utama model konvensional mitra dengan demikian dapat diatasi, peserta didik dari mana pun dapat mengakses materi dan mengikuti program tanpa harus hadir secara fisik di lokasi penyelenggaraan.

Pada lapisan pengelolaan konten, platform mengimplementasikan fungsi-fungsi inti yang selaras dengan konsep _Learning Management System_ (LMS) sebagaimana diuraikan pada subbab 2.1.3. Administrator dapat membuat, mengedit, dan menerbitkan kursus secara mandiri melalui antarmuka pengelolaan yang terintegrasi. Setiap kursus disusun dalam struktur kurikulum berjenjang yang terdiri dari _sprint_ sebagai satuan modul dan _step_ sebagai unit materi di dalamnya, dengan tipe konten video maupun kuis. Pengelolaan kategori kursus, data pengguna, serta seluruh konfigurasi sistem yang sebelumnya tidak memiliki infrastruktur sama sekali kini tersentralisasi dalam satu ekosistem yang dapat dioperasikan tanpa keterlibatan teknis dari tim pengembang.

Materi pembelajaran disampaikan melalui video, sesuai dengan pendekatan _Video-Based Learning_ (VBL) yang telah dibahas pada subbab 2.2. Pengunggahan video dikelola melalui integrasi dengan layanan Bunny.net, di mana setiap video yang diunggah diproses _encoding_ secara otomatis setelah proses unggah selesai. Untuk memastikan keamanan konten berbayar, video tidak dapat diakses melalui URL publik secara langsung, setiap permintaan pemutaran menghasilkan _signed_ URL berkala yang hanya valid untuk sesi pengguna terautentikasi pada momen tersebut. Pendekatan ini melindungi konten dari akses tidak sah sekaligus memastikan kualitas _streaming_ yang konsisten melalui jaringan CDN Bunny.net.

Alur konsumsi materi dalam platform dirancang menggunakan mekanisme _sequential learning_, yaitu setiap _step_ hanya terbuka setelah _step_ sebelumnya diselesaikan. Peserta didik menandai video sebagai selesai secara eksplisit melalui tombol "Tandai Selesai", setelah itu sistem memperbarui progres kursus dan membuka _step_ berikutnya. Mekanisme ini mencerminkan prinsip _Self-Regulated Learning_ (SRL) yang diuraikan pada subbab 2.3, peserta didik secara aktif mengelola ritme belajarnya sendiri, sementara platform menyediakan struktur yang mendorong penyelesaian materi secara bertahap dan terukur. Progres kursus setiap peserta tercatat secara individual dan dapat dipantau kapan saja.

Evaluasi belajar diimplementasikan melalui modul kuis yang disertakan sebagai _step_ bertipe kuis dalam kurikulum. Sistem kuis bekerja dengan penilaian otomatis, peserta mengerjakan seluruh soal, mengirimkan jawaban, dan sistem langsung menghasilkan skor serta menentukan status lulus atau tidak lulus berdasarkan nilai ambang batas 80. Apabila peserta tidak mencapai nilai tersebut, tersedia dua kesempatan pengulangan tambahan, setelah gagal tiga kali berturut-turut, sistem menerapkan _cooldown_ selama 30 menit sebelum percobaan berikutnya dapat dilakukan. Pembatasan ini mendorong peserta untuk benar-benar mempelajari ulang materi, bukan sekadar mencoba berulang kali. Sistem juga memvalidasi kelengkapan jawaban sebelum pengiriman, sehingga tidak ada soal yang terlewat tanpa disadari peserta.

Keseluruhan aktivitas peserta didik terpantau secara terpusat melalui _Learning Analytics Dashboard_ (LAD) yang dapat diakses oleh administrator, mengimplementasikan konsep _Learning Analytics_ yang diuraikan pada subbab 2.4. LAD menampilkan data harian yang mencakup pendapatan, jumlah transaksi, dan pengguna baru yang mendaftar pada hari tersebut, serta statistik kumulatif yang meliputi total pengguna terdaftar, total kursus aktif, total pendapatan, total transaksi, total sertifikat yang telah diterbitkan, dan total peserta magang aktif. Untuk perspektif tren jangka menengah, LAD menyajikan tiga grafik bulanan yang mencakup 12 bulan terakhir, yaitu grafik pendapatan, grafik pengguna baru dan pendaftaran, serta grafik kursus terjual. Selain itu, tersedia visualisasi _bar chart_ yang meranking kursus berdasarkan jumlah penjualan, serta daftar transaksi terbaru. Dengan kehadiran LAD ini, kemampuan pemantauan yang sebelumnya tidak dimiliki mitra sama sekali kini tersedia secara _real-time_ dan dapat diakses kapan saja tanpa memerlukan proses rekap manual.

Penyelesaian seluruh materi kursus membuka akses bagi peserta didik untuk mengklaim sertifikat digital. Mekanisme penerbitan sertifikat dirancang dengan pertimbangan integritas data yang ketat. Setelah progres kursus mencapai 100%, peserta dapat mengklaim sertifikat melalui antarmuka yang mengarahkan mereka ke halaman sertifikat khusus. Di sana, peserta diminta mengonfirmasi nama yang akan tercetak pada sertifikat untuk terakhir kalinya, setelah proses generasi selesai, nama tersebut bersifat permanen dan tidak dapat diubah. Setelah konfirmasi diberikan, sistem menghasilkan sertifikat dengan nomor unik, mencatatnya dalam basis data, dan menampilkannya pada daftar sertifikat peserta. Dari daftar tersebut, peserta dapat mengunduh sertifikat sebagai _file_ PDF atau mengakses halaman URL publik sertifikat yang dapat dibagikan sebagai bukti penyelesaian yang dapat diverifikasi oleh pihak ketiga. Model sertifikat digital ini menggantikan sepenuhnya mekanisme penerbitan dokumen fisik yang sebelumnya dikerjakan secara manual oleh mitra.

Akses terhadap kursus berbayar difasilitasi melalui integrasi _payment gateway_ Midtrans yang memungkinkan transaksi pembelian dilakukan sepenuhnya dalam ekosistem platform. Alur pembelian dimulai dari halaman detail kursus, peserta melanjutkan ke halaman _checkout_ di mana kode voucher diskon dapat dimasukkan apabila tersedia dan sistem memvalidasinya secara _real-time_ sebelum menampilkan harga akhir. Setelah peserta mengonfirmasi pesanan, antarmuka Midtrans Snap dimuat secara _overlay_ dengan berbagai pilihan metode pembayaran. Batas waktu pembayaran ditetapkan selama 60 menit, apabila antarmuka _snap_ ditutup sebelum transaksi diselesaikan, pesanan tetap tersimpan dengan status _pending_ dan dapat dilanjutkan dari halaman riwayat transaksi. Setelah pembayaran berhasil dikonfirmasi oleh Midtrans melalui mekanisme _webhook_, sistem secara otomatis memberikan akses kursus kepada peserta dan mengirimkan email konfirmasi pembelian. Proses distribusi akses kursus yang sebelumnya bergantung pada mekanisme manual kini berjalan sepenuhnya otomatis tanpa intervensi administrator.

Platform NextLevel Academy telah berhasil di-_deploy_ ke lingkungan produksi dan berjalan pada VPS RumahWeb dengan spesifikasi 1 Core CPU, 2 GB RAM, dan 40 GB penyimpanan di atas Ubuntu 24.04 LTS. Seluruh fitur inti platform berfungsi sebagaimana yang diharapkan berdasarkan hasil pengujian yang disajikan pada subbab 4.1.3. Pada tahap ini, konten kursus yang tersedia masih berupa materi dummy yang digunakan selama proses pengembangan dan pengujian, populasi konten kursus resmi akan dilakukan oleh mitra setelah platform resmi diluncurkan kepada pengguna umum sesuai kesepakatan bersama. Kondisi ini tidak berimplikasi pada kesiapan teknis platform, melainkan merupakan bagian dari tahapan _go-live_ yang berjalan setelah penelitian ini diselesaikan. Dengan selesainya implementasi seluruh komponen platform pembelajaran digital berbasis web ini, tujuan pertama penelitian dinyatakan tercapai.

## 4.2.2 Sistem Gamifikasi

Rumusan masalah kedua penelitian ini mengidentifikasi bahwa pendekatan pembelajaran konvensional mitra belum menghadirkan pengalaman belajar yang interaktif dan progresif tidak ada mekanisme yang mendorong peserta untuk terus melanjutkan pembelajaran, dan tidak ada rekognisi atas pencapaian yang diraih. Merespons hal tersebut, platform NextLevel Academy mengimplementasikan sistem gamifikasi yang mengacu pada konsep yang diuraikan pada subbab 2.5, yaitu penerapan elemen desain permainan ke dalam konteks non-permainan untuk meningkatkan motivasi dan keterlibatan pengguna. Sistem ini terdiri dari empat komponen yang saling terhubung, sistem EXP, sistem _level_ dan gelar, sistem _badge_, serta _reward roadmap_.

Sistem EXP berfungsi sebagai satuan poin yang mencerminkan akumulasi aktivitas belajar. Tiga aksi menghasilkan EXP, menyelesaikan video (+15 EXP), lulus kuis (+90 EXP), dan menyelesaikan kursus hingga progres 100% (+600 EXP). Perbedaan nilai ini dirancang agar penyelesaian kursus secara utuh memberi bobot yang jauh lebih signifikan, mendorong peserta untuk tidak berhenti di tengah jalan.

Akumulasi EXP menggerakkan sistem _level_ yang dihitung menggunakan formula aritmetika progresif berikut.

Keterangan:

REQ(L) : EXP yang dibutuhkan untuk naik dari _level_ L ke _level_ L + 1.

L : _Level_ saat ini.

744 : Nilai EXP dasar pada _level_ 1.

124 : Konstanta inkremen per _level._

Tabel 4.12 Contoh Perhitungan Kebutuhan EXP per Level

| **_Level_ (L)** | **Perhitungan**     | **EXP yang Dibutuhkan** |
| --------------- | ------------------- | ----------------------- |
| 1 → 2           | 744 + 124 × (1 − 1) | 744 EXP                 |
| 2 → 3           | 744 + 124 × (2 − 1) | 868 EXP                 |
| 3 → 4           | 744 + 124 × (3 − 1) | 992 EXP                 |
| 4 → 5           | 744 + 124 × (4 − 1) | 1.116 EXP               |
| 5 → 6           | 744 + 124 × (5 − 1) | 1.240 EXP               |

Struktur linier ini dipilih agar kenaikan _level_ tetap terasa terjangkau bagi peserta yang belajar secara konsisten, dengan penambahan tetap 124 EXP per _level_ dan tanpa batas maksimum yang ditetapkan. Setiap rentang _level_ dikaitkan dengan gelar _Beginner_ (_Level_ 1-4), _Explorer_ (_Level_ 5-9), _Scholar_ (_Level_ 10-14), dan _Master_ (_Level_ 15 ke atas).

Sistem _badge_ berfungsi sebagai rekognisi pencapaian yang dikonfigurasi oleh administrator. Setiap _badge_ memiliki atribut nama, deskripsi, ikon, jenis pemicu, dan ambang batas. Terdapat tiga jenis pemicu, yaitu Capai _Level_ (berdasarkan _level_ yang dicapai), Total Kursus Selesai (berdasarkan jumlah kursus yang diselesaikan), dan Kursus Tertentu (atas penyelesaian kursus spesifik yang dipilih). Pemberian _badge_ berlangsung otomatis begitu kondisi pemicu terpenuhi.

Sebagai insentif jangka menengah, platform menyediakan _reward roadmap_ berupa voucher diskon yang dapat diklaim pada setiap _milestone_ kelipatan lima _level_. Nilai diskon meningkat 15% di setiap _milestone_: _Level_ 5 memberikan voucher 20%, _Level_ 10 memberikan 35%, dan _Level_ 15 memberikan 50%. Setiap voucher bersifat unik dan berlaku selama 180 hari sejak tanggal klaim.

Seluruh informasi gamifikasi ditampilkan terpusat pada halaman EXP & _Level_ yang memuat _level_ dan gelar saat ini, jumlah EXP, progres ke _level_ berikutnya, daftar _badge_ yang diperoleh, serta _reward roadmap_ dengan tombol klaim untuk _milestone_ yang telah terbuka. Pada sisi administrasi, aturan EXP bersifat _read-only_ untuk menjaga konsistensi progres peserta, sementara konfigurasi _badge_ sepenuhnya fleksibel dan dapat disesuaikan tanpa perubahan pada kode program. Dengan terpenuhinya implementasi seluruh komponen ini, tujuan kedua penelitian dinyatakan tercapai.

## 4.2.3 Sistem Magang Daring

Rumusan masalah ketiga penelitian ini mengidentifikasi bahwa mitra belum memiliki infrastruktur apapun untuk menyelenggarakan program magang secara terstruktur: tidak ada sistem absensi, tidak ada mekanisme distribusi dan pengumpulan tugas, dan tidak ada alur penilaian yang terdokumentasi. Seluruh proses, apabila pernah dijalankan, bergantung sepenuhnya pada koordinasi manual yang rentan terhadap inkonsistensi dan tidak dapat dipantau secara terpusat. Tujuan ketiga penelitian ini merespons kondisi tersebut dengan membangun sistem magang daring yang terintegrasi ke dalam platform NextLevel Academy, mencakup pengelolaan konfigurasi program, pencatatan kehadiran, distribusi dan evaluasi tugas, serta pemberian nilai akhir yang terstruktur dan terdokumentasi.

## 4.2.3.1 Arsitektur Konfigurasi Program Magang

Sistem magang dibangun di atas hierarki konfigurasi empat tingkat yang dikelola sepenuhnya oleh administrator. _Batch_ sebagai satuan periode penyelenggaraan program, bidang sebagai klasifikasi jalur atau divisi magang, kelas sebagai kelompok kerja aktif yang merupakan perpaduan _batch_ dan bidang tertentu, serta peserta magang sebagai individu yang terdaftar dalam suatu kelas. Setiap kelas dibimbing oleh satu mentor. Relasi antara mentor dan kelas bersifat satu ke satu, sehingga tanggung jawab pembimbingan terdefinisi dengan jelas dan tidak tumpang tindih. Hierarki ini memberikan fleksibilitas untuk mengelola beberapa angkatan (_Batch_) dan beberapa jalur magang (Bidang) secara bersamaan dalam satu platform, sekaligus mempertahankan pemisahan data yang bersih antar kelompok.

## 4.2.3.2 Sistem Absensi berbasis Waktu _Server_

1. Pencatatan kehadiran berbasis waktu _server_

Sistem menerapkan prinsip _server-authoritative time_, yaitu seluruh validasi waktu dilakukan berdasarkan jam sistem pada server, bukan jam perangkat peserta. Pada saat peserta menekan tombol _check-in_, permintaan yang dikirim tidak menyertakan informasi waktu dari perangkat. Sistem membaca waktu terkini dari _server_, kemudian memeriksa tiga syarat secara berurutan, yaitu tanggal hari ini berada dalam periode magang peserta, hari ini merupakan hari kerja (bukan Sabtu/Minggu dan bukan tanggal libur resmi), serta waktu saat ini masih berada dalam jendela absensi yang berlaku. Apabila salah satu syarat tidak terpenuhi, _server_ menolak permintaan tersebut disertai pesan penolakan yang spesifik, sehingga manipulasi jam perangkat oleh pengguna tidak memengaruhi hasil validasi. Jendela absensi (09.00-12.00 WIB) berlaku sama bagi seluruh peserta di semua kelas, tanpa bergantung pada zona waktu atau pengaturan perangkat masing-masing pengguna. Di luar jendela tersebut, sistem menolak _check-in_. Integritas data dijaga melalui batasan unik pada pasangan peserta dan tanggal, sehingga setiap peserta hanya dapat melakukan satu kali _check-in_ per hari kerja dan percobaan kedua secara otomatis ditolak.

1. Penentuan hari kerja dan pengelolaan libur

Sistem menentukan hari kerja secara otomatis. Akhir pekan dikecualikan secara langsung, sementara tanggal libur resmi dikelola oleh _Administrator_ melalui fitur konfigurasi tanggal libur. Administrator cukup memasukkan keterangan libur, tanggal mulai, dan jumlah hari. Tanggal selesai kemudian dihitung secara otomatis, yaitu tanggal mulai ditambah jumlah hari dikurangi satu. Data libur memiliki siklus tiga status yang dijaga ketat oleh _server_. Libur berstatus akan datang masih dapat diedit sepenuhnya atau dihapus apabila terjadi perubahan jadwal. Libur yang sedang berlangsung tidak dapat diedit penuh maupun dihapus, dan hanya dapat diakhiri lebih awal. Libur yang telah selesai dikunci (_read-only_) untuk menjaga integritas data historis.

1. Koreksi manual dan jejak audit

Apabila terjadi kekeliruan pencatatan, administrator dapat melakukan koreksi manual terhadap status kehadiran peserta pada tanggal yang bersangkutan, dengan dua batasan di sisi _server_, yaitu tanggal koreksi harus sudah lewat atau hari ini, dan harus jatuh pada hari kerja yang sah. Setiap koreksi disimpan dalam satu transaksi basis data bersama dengan entri _audit log_ yang memuat identitas administrator, jenis aksi, dan metadata perubahan. Hal yang sama berlaku untuk setiap operasi penambahan, pengubahan, maupun penghapusan data libur, sehingga seluruh perubahan data kehadiran dapat ditelusuri dan dipertanggungjawabkan.

## 4.2.3.3 Distribusi dan Evaluasi Tugas

Pengelolaan tugas dalam sistem magang mengikuti alur yang melibatkan tiga pihak, yaitu mentor sebagai pemberi tugas, peserta magang sebagai pelaksana, dan sistem sebagai perantara yang mendokumentasikan seluruh interaksi. Mentor membuat tugas baru dengan mengisi judul, deskripsi, dan tenggat waktu penyelesaian, setelah tersimpan, tugas terdistribusi secara otomatis kepada seluruh peserta magang dalam kelas bimbingannya dan notifikasi dikirimkan kepada peserta terkait.

Peserta magang mengumpulkan hasil kerja melalui formulir pengumpulan dengan mengunggah berkas sebelum tenggat waktu yang ditetapkan. Apabila mentor menilai pengumpulan perlu diperbaiki, mentor dapat mengembalikan tugas disertai umpan balik dalam bentuk teks dan sistem mewajibkan umpan balik tersebut diisi sebelum pengembalian dapat dilakukan, sehingga peserta selalu menerima arahan yang jelas untuk revisi. Peserta kemudian dapat mengumpulkan ulang tugas yang dikembalikan selama tenggat waktu belum terlampaui. Setelah tenggat waktu habis, formulir pengumpulan tertutup secara otomatis dan tidak ada pengumpulan baru yang dapat dilakukan, kecuali administrator melakukan penyesuaian manual apabila diperlukan.

## 4.2.3.4 Sistem Penilaian Akhir

Penilaian akhir peserta magang diberikan oleh Mentor dalam bentuk skor numerik pada skala 0-100. Sistem mengonversi skor tersebut secara otomatis menjadi predikat nilai berdasarkan tabel konversi yang disajikan pada Tabel 4.12.

Tabel 4.13 Tabel Konversi Skor dan Predikat Nilai Akhir Magang

| **Rentang Skor** | **Predikat** |
| ---------------- | ------------ |
| 90 - 100         | A            |
| 85 - 89          | A-           |
| 80 - 84          | B+           |
| 75 - 79          | B            |
| 70 - 74          | B-           |
| 65 - 69          | C+           |
| 60 - 64          | C            |
| 50 - 59          | D            |
| < 50             | E/F          |

Setelah nilai ditetapkan oleh mentor, peserta magang dapat melihat skor, predikat, dan catatan evaluasi melalui halaman nilai akhir pada akun mereka. Nilai yang telah ditetapkan mentor bersifat final dalam kapasitas mentor, namun administrator memiliki kewenangan untuk mengubah nilai akhir apabila diperlukan, dengan syarat wajib mengisi alasan perubahan secara eksplisit. Setiap perubahan yang dilakukan administrator dicatat pada _audit log_ dan notifikasi dikirimkan kepada mentor yang bersangkutan. Mekanisme dua lapis ini, mentor sebagai penilai utama dan administrator sebagai pemegang kewenangan koreksi dengan akuntabilitas penuh memastikan bahwa proses penilaian terdokumentasi, dapat diaudit, dan tidak dapat diubah secara diam-diam.

## 4.2.3.5 Cakupan dan Batasan Sistem

Perlu dicatat bahwa pada tahap implementasi ini, sistem magang daring belum mencakup penerbitan sertifikat magang secara digital. Penerbitan sertifikat magang akan tetap dilakukan secara konvensional oleh mitra melalui pencetakan dan penyerahan fisik kepada peserta setelah program selesai, sebuah keputusan yang telah disepakati bersama mitra dan berada di luar cakupan penelitian ini sebagaimana dinyatakan pada batasan penelitian di Bab 1. Selain itu, aktivitas dalam sistem magang pada saat ini belum dihubungkan dengan sistem gamifikasi platform EXP dan _badge_ tidak diberikan atas aktivitas magang seperti absensi, pengumpulan tugas, maupun perolehan nilai akhir. Integrasi antara kedua sistem ini dapat menjadi arah pengembangan pada iterasi platform berikutnya.

Dengan selesainya implementasi seluruh komponen sistem magang daring ini, mulai dari konfigurasi hierarki program, pencatatan kehadiran berbasis waktu _server_, distribusi dan evaluasi tugas, hingga penilaian akhir yang terdokumentasi, infrastruktur magang yang sebelumnya tidak dimiliki mitra kini tersedia secara penuh dalam satu platform terintegrasi. Tujuan ketiga penelitian dengan demikian dinyatakan tercapai.

## 4.2.4 Pembahasan Hasil Pengujian _Black Box Testing_

Pengujian fungsional sistem dilakukan menggunakan dua sumber data yang saling melengkapi: pengujian langsung oleh peneliti terhadap 88 skenario uji yang disajikan pada Tabel 4.6 hingga Tabel 4.10, serta pengujian berbasis kuesioner oleh responden eksternal yang hasilnya direkap pada Tabel 4.11. Pengujian peneliti bertujuan memverifikasi kesesuaian fungsional sistem terhadap kebutuhan yang telah ditetapkan pada Bab 3, sedangkan pengujian kuesioner bertujuan menangkap penilaian dari perspektif pengguna yang lebih luas, baik dari pihak mitra maupun pengguna umum.

## 4.2.4.1 Analisis Hasil Pengujian Fungsional oleh Peneliti

Pengujian fungsional oleh peneliti dilakukan terhadap 88 skenario uji yang diorganisasikan ke dalam lima kelompok aktor. Seluruh 88 skenario menghasilkan keluaran yang sesuai dengan keluaran yang diharapkan, sehingga tingkat keberhasilan pengujian fungsional secara keseluruhan mencapai 100%.

Pada kelompok semua aktor, 8 skenario yang diuji mencakup seluruh kondisi kritis pada fungsionalitas _login_, autentikasi dengan kredensial valid, penanganan kata sandi salah, pemblokiran akun belum terverifikasi, penolakan akun nonaktif, serta pembatasan akses setelah lima kali percobaan gagal berturut-turut. Semua skenario menunjukkan perilaku sistem yang konsisten, termasuk mekanisme _rate limiting_ yang berfungsi sebagaimana dirancang untuk mencegah percobaan _login_ berulang secara tidak sah.

Pada kelompok peserta didik, 21 skenario mencakup enam fungsi utama: penelusuran katalog kursus, pembelian kursus dengan dan tanpa voucher, akses dan penandaan selesai video, pengerjaan kuis beserta mekanisme percobaan ulang dan _cooldown_, klaim dan pengunduhan sertifikat, serta interaksi dengan sistem gamifikasi. Seluruh skenario berjalan sesuai harapan, termasuk skenario kondisi batas seperti penolakan klaim sertifikat saat progres belum 100% dan pemblokiran klaim reward pada _level_ yang belum tercapai.

Pada kelompok peserta magang, 8 skenario mengverifikasi tiga fungsi, yaitu _check-in_ kehadiran dalam dan di luar jendela waktu, pengumpulan tugas sebelum dan setelah tenggat waktu serta pengumpulan ulang tugas yang dikembalikan, serta pembacaan nilai akhir dalam kondisi sudah dan belum dinilai. Mekanisme pembatasan berbasis waktu _server_ terkonfirmasi berjalan konsisten tanpa celah manipulasi dari sisi klien.

Pada kelompok mentor, 13 skenario mencakup lima fungsi, yaitu _check-in_ pribadi, pemantauan absensi peserta termasuk pada tanggal libur, pembuatan dan penghapusan tugas, pengembalian tugas dengan dan tanpa umpan balik, serta pemberian nilai akhir. Validasi yang mewajibkan umpan balik sebelum tugas dapat dikembalikan terkonfirmasi berjalan, demikian pula penolakan nilai di luar rentang 0-100.

Pada kelompok administrator, 38 skenario mencakup 13 fungsi pengelolaan yang meliputi kursus dan kurikulum, kategori, pengguna, transaksi, voucher, sertifikat, gamifikasi, absensi magang, konfigurasi magang, tugas magang, nilai akhir magang, konfigurasi jam kerja dan libur, serta pengelolaan akun administrator. Skenario kritis seperti pencegahan penghapusan data yang masih memiliki ketergantungan, pemblokiran penonaktifan Administrator terakhir, serta penguncian data libur berstatus "Sudah Selesai" seluruhnya menghasilkan respons sistem yang sesuai.

## 4.2.4.2 Analisis Hasil Pengujian Berdasarkan Kuesioner Responden

Pengujian berbasis kuesioner dilakukan menggunakan dua formulir Google Form yang disebarkan kepada responden sesuai peran masing-masing. Formulir pertama memuat 29 skenario uji yang mencakup fungsionalitas semua aktor dan peserta didik, disebarkan kepada pengguna umum maupun pengguna dari pihak mitra. Formulir kedua memuat 59 skenario uji yang mencakup fungsionalitas peserta magang, mentor, dan administrator, dan hanya disebarkan kepada pengguna dari pihak mitra mengingat akses terhadap fitur-fitur tersebut tidak dibuka untuk umum.

Formulir pertama diisi oleh 17 responden, sedangkan formulir kedua diisi oleh 4 responden dari pihak mitra. Secara keseluruhan, rata-rata persentase keberhasilan dari seluruh 88 skenario berdasarkan rekap Tabel 4.11 adalah 100%.

Pada kelompok semua aktor, 8 skenario _login_ memperoleh rata-rata persentase keberhasilan sebesar 100%, yang menunjukkan bahwa responden dapat mengoperasikan fungsionalitas autentikasi sesuai dengan yang diharapkan.

Pada kelompok peserta didik, 21 skenario memperoleh rata-rata persentase keberhasilan sebesar 100%, yang menunjukkan bahwa seluruh fungsionalitas pada kelompok peserta didik berhasil dijalankan sesuai dengan yang diharapkan oleh seluruh responden.

Pada kelompok peserta magang, 8 skenario memperoleh rata-rata persentase keberhasilan sebesar 100%, yang menunjukkan bahwa seluruh fungsionalitas pada kelompok peserta magang berhasil dijalankan sesuai dengan yang diharapkan oleh seluruh responden.

Pada kelompok mentor, 13 skenario memperoleh rata-rata persentase keberhasilan sebesar 100%, yang menunjukkan bahwa seluruh fungsionalitas pada kelompok mentor berhasil dijalankan sesuai dengan yang diharapkan oleh seluruh responden.

Pada kelompok administrator, 38 skenario memperoleh rata-rata persentase keberhasilan sebesar 100%, yang menunjukkan bahwa seluruh fungsionalitas pada kelompok administrator berhasil dijalankan sesuai dengan yang diharapkan oleh seluruh responden.

## 4.2.4.3 Implikasi terhadap Kualitas Sistem

Hasil pengujian fungsional oleh peneliti yang mencapai 100% pada seluruh 88 skenario mengkonfirmasi bahwa seluruh kebutuhan fungsional yang telah didefinisikan pada Bab 3 telah terimplementasi dan beroperasi sebagaimana dirancang. Tidak ditemukan skenario yang menghasilkan keluaran menyimpang dari spesifikasi, termasuk pada skenario-skenario kondisi batas yang dirancang khusus untuk menguji ketahanan sistem terhadap masukan di luar alur normal.

Hasil kuesioner responden yang menunjukkan rata-rata keberhasilan sebesar 100% memberikan konfirmasi independen bahwa fungsionalitas sistem dapat dioperasikan oleh pengguna sesungguhnya, bukan hanya oleh tim pengembang yang memahami sistem secara mendalam. Kombinasi kedua hasil ini memperkuat kesimpulan bahwa platform NextLevel Academy telah mencapai tingkat kesiapan fungsional yang memadai untuk dioperasikan dalam lingkungan produksi.

## 4.2.5 Evaluasi Pencapaian Tujuan Penelitian

Ketercapaian ketiga tujuan penelitian dievaluasi berdasarkan hasil implementasi dan pengujian pada subbab-subbab sebelumnya, dengan membandingkan tujuan yang telah dirumuskan terhadap komponen sistem yang berhasil diimplementasikan serta hasil pengujian fungsional.

Tujuan pertama adalah merancang dan mengimplementasikan platform pembelajaran digital berbasis web yang terintegrasi untuk NextLevel Academy, mencakup pengelolaan materi, tugas, dan sertifikat secara digital dan terpusat, perluasan jangkauan program tanpa batasan geografis, serta pemantauan progres belajar peserta secara terstruktur untuk mereduksi beban operasional dan menjaga kontinuitas pembelajaran. Tujuan ini tercapai. Platform NextLevel Academy telah di-_deploy_ secara publik di <https://nextlevelacademy.id/>. Pengelolaan kursus, pengguna, transaksi, dan sertifikat berjalan dalam satu ekosistem digital terpusat. Peserta dapat memantau progres belajar secara _real-time_ melalui _Learning Analytics Dashboard_ yang menyajikan data harian, statistik kumulatif, tren bulanan, dan peringkat kursus. Fungsionalitas inti platform diverifikasi melalui 29 skenario pengujian yang mencakup kelompok Semua Aktor dan Peserta Didik, dan seluruhnya menghasilkan keluaran yang sesuai.

Tujuan kedua adalah menghadirkan pengalaman belajar yang interaktif, menarik, dan progresif pada platform NextLevel Academy untuk meningkatkan minat, motivasi, dan konsistensi belajar peserta sesuai dengan karakteristik pemuda masa kini. Tujuan ini tercapai. Sistem gamifikasi yang diimplementasikan mencakup mekanisme EXP dari tiga sumber perolehan, sistem _level_ berbasis formula aritmetika progresif dengan empat gelar yang mencerminkan tahap perkembangan peserta, sistem _badge_ dengan tiga jenis pemicu yang dikonfigurasi administrator, serta _reward roadmap_ berupa voucher diskon pada _milestone level_ 5, 10, dan 15. Setiap komponen gamifikasi melekat langsung pada alur pembelajaran sehingga setiap aktivitas belajar menghasilkan konsekuensi progres yang terukur. Seluruh skenario pengujian gamifikasi, baik dalam kondisi normal maupun kondisi batas, menghasilkan keluaran yang sesuai.

Tujuan ketiga adalah mengembangkan sistem magang yang terintegrasi dalam platform NextLevel Academy sebagai wadah magang daring yang terstruktur dan fleksibel, sehingga sekolah mitra dapat memfasilitasi pengalaman praktis di bidang digital bagi siswanya. Tujuan ini tercapai. Sistem magang daring yang diimplementasikan mencakup pengelolaan hierarki program (_Batch_, Bidang, Kelas), pencatatan kehadiran berbasis waktu _server_ dengan konfigurasi jendela waktu dan pengelolaan tanggal libur, distribusi dan evaluasi tugas dengan mekanisme umpan balik terstruktur, serta penilaian akhir dengan konversi predikat otomatis dan _audit log_ pada setiap perubahan nilai. Sistem ini memiliki cakupan pengujian paling luas di antara ketiga tujuan, dengan 59 skenario yang mencakup kelompok Peserta Magang, Mentor, dan Administrator, dan seluruhnya menghasilkan keluaran yang sesuai.

Seluruh 88 skenario _Black Box Testing_ terhadap platform menghasilkan status Sesuai, sehingga tingkat keberhasilan pengujian fungsional tercatat 100%. Seluruh kebutuhan fungsional yang didefinisikan pada Bab 3 telah terimplementasi dan beroperasi sebagaimana dirancang. Hasil kuesioner responden dengan rata-rata keberhasilan 100% mengonfirmasi bahwa pengguna dapat mengoperasikan sistem sesuai harapan. Ketiga tujuan penelitian terpenuhi dan kesiapan fungsional sistem terkonfirmasi melalui pengujian.

# BAB V

PENUTUP

1.

## 5.1 Kesimpulan

Berdasarkan hasil implementasi dan pengujian yang telah dilaksanakan, penelitian ini berhasil mencapai ketiga tujuan yang telah ditetapkan.

1. Tujuan pertama, merancang dan mengimplementasikan platform pembelajaran digital berbasis web yang terintegrasi untuk NextLevel Academy, tercapai. Ketercapaian ini dibuktikan melalui platform yang telah di-_deploy_ dan dapat diakses publik di <https://nextlevelacademy.id/>, beroperasinya pengelolaan kursus, pengguna, transaksi, dan sertifikat dalam satu ekosistem terpusat, serta tersedianya _Learning Analytics Dashboard_ untuk pemantauan progres belajar secara _real-time_. Seluruh fungsionalitas ini diverifikasi melalui 29 skenario _Black Box Testing_ pada kelompok Semua Aktor dan Peserta Didik, dengan tingkat keberhasilan 100%. Dengan demikian, masalah pengelolaan pembelajaran yang masih manual serta keterbatasan jangkauan geografis pada NextLevel Academy telah terselesaikan.
2. Tujuan kedua, menghadirkan pengalaman belajar yang interaktif dan progresif melalui sistem gamifikasi, tercapai. Ketercapaian ini dibuktikan melalui implementasi mekanisme EXP dari tiga sumber perolehan, sistem level dengan empat gelar progresif, sistem _badge_ dengan tiga jenis pemicu, serta _reward roadmap_ pada _milestone level_ 5, 10, dan 15, yang seluruhnya terintegrasi langsung ke alur pembelajaran. Skenario pengujian yang mencakup interaksi gamifikasi, bagian dari 21 skenario kelompok Peserta Didik, seluruhnya menghasilkan keluaran sesuai. Dengan demikian, masalah rendahnya interaktivitas dan motivasi belajar peserta pada pendekatan konvensional NextLevel Academy telah terselesaikan.
3. Tujuan ketiga, mengembangkan sistem magang daring yang terintegrasi dalam platform, tercapai. Ketercapaian ini dibuktikan melalui implementasi pengelolaan hierarki program magang (_Batch_, Bidang, Kelas), pencatatan kehadiran berbasis waktu _server_, distribusi dan evaluasi tugas dengan umpan balik terstruktur, serta penilaian akhir dengan konversi predikat otomatis. Fungsionalitas ini diverifikasi melalui 59 skenario _Black Box Testing_ pada kelompok Peserta Magang, Mentor, dan Administrator, dengan tingkat keberhasilan 100%. Dengan demikian, masalah keterbatasan infrastruktur magang NextLevel Academy dalam memenuhi kebutuhan sekolah mitra telah terselesaikan.

Pengujian fungsional dengan metode _Black Box Testing_ terhadap 88 skenario uji yang mencakup lima kelompok aktor menghasilkan tingkat keberhasilan 100%. Hasil kuesioner responden menunjukkan rata-rata keberhasilan sebesar 100%, mengkonfirmasi bahwa sistem dapat dioperasikan oleh pengguna sesuai harapan. Dengan tercapainya ketiga tujuan penelitian dan terkonfirmasinya kesiapan fungsional melalui kedua instrumen pengujian, penelitian ini dinyatakan berhasil secara keseluruhan.

## 5.2 Saran

Platform NextLevel Academy yang telah diimplementasikan dalam penelitian ini merupakan fondasi yang dapat terus dikembangkan. Berikut saran pengembangan yang dapat dipertimbangkan pada iterasi berikutnya.

1. _Leaderboard_ Pengguna. Menambahkan fitur papan peringkat yang menampilkan daftar pengguna berdasarkan indikator pencapaian tertentu, seperti _level_ tertinggi atau jumlah _badge_ terbanyak, untuk memperkuat dimensi kompetitif dari sistem gamifikasi yang sudah ada.
2. Integrasi Gamifikasi pada Sistem Magang. Mengintegrasikan sistem EXP dan _badge_ ke dalam aktivitas magang, misalnya melalui pemberian EXP atas kehadiran konsisten atau pengumpulan tugas sebelum tenggat waktu. Saat ini kedua sistem beroperasi secara terpisah, integrasinya akan memperluas jangkauan mekanisme motivasi ke seluruh aktor platform.
3. Penilaian Tugas Terstruktur. Mengembangkan mekanisme penilaian per tugas pada sistem magang, di mana Mentor memberikan skor numerik pada setiap tugas yang dikumpulkan. Skor tersebut tersimpan dalam sistem dan dapat dijadikan dasar kalkulasi nilai akhir yang lebih objektif, sekaligus memberikan peserta magang visibilitas terhadap perkembangan kinerjanya secara berkala.
4. Penerbitan Sertifikat Magang Digital. Menambahkan fitur penerbitan sertifikat digital bagi peserta magang yang memenuhi syarat kelulusan, serupa dengan mekanisme sertifikat kursus yang sudah tersedia. Fitur ini akan melengkapi siklus program magang sepenuhnya di dalam platform.
5. Berbagi Profil dan Pencapaian. Menyediakan fitur ekspor profil pengguna yang memuat informasi _level_, gelar, koleksi _badge_, dan sertifikat dalam format visual yang dapat dibagikan ke media sosial, sebagai bentuk rekognisi publik atas pencapaian belajar pengguna.
6. Fitur _Blog_ dan Artikel. Menambahkan fitur _blog_ sebagai saluran konten yang memuat berita dan informasi terkini seputar kegiatan NextLevel Academy, pendidikan digital, dan perkembangan teknologi, untuk memperkuat platform sebagai sumber informasi bagi pengguna.
7. Forum Diskusi. Menghadirkan ruang diskusi antar peserta didik, baik pada _level_ platform maupun per kursus, untuk mendorong _peer learning_ dan pertukaran pengetahuan antar pengguna.
8. _Push Notification_. Mengimplementasikan web _push notification_ untuk mengingatkan pengguna mengenai tenggat tugas, jendela waktu absensi, dan aktivitas platform yang relevan, guna menjaga keterlibatan pengguna secara aktif.
9. Absensi Berbasis Biometrik. Mengeksplorasi peningkatan sistem absensi menggunakan teknologi pengenalan wajah atau sidik jari untuk memperkuat akurasi pencatatan kehadiran. Implementasi fitur ini pada platform berbasis web memerlukan kajian teknis lebih lanjut, mengingat kemungkinan perluasan ke aplikasi _mobile native_ atau pemanfaatan Web _API_ perangkat yang dukungannya bervariasi antar platform.
10. _AI Customer Service_. Mengintegrasikan asisten virtual berbasis AI sebagai saluran layanan pengguna lini pertama untuk menjawab pertanyaan umum seputar kursus, transaksi, dan penggunaan fitur, guna mengurangi beban operasional administrator.

**Lampiran 1  
Instrumen Pengujian Black Box**

**Lampiran 1.a. Form Pengujian Semua Aktor dan Peserta Didik**

Gambar L.1 Tampilan Google Form Pengujian Semua Aktor dan Peserta Didik

**Lampiran 1.b. Form Pengujian Sistem Magang dan Administrator**

Gambar L.2 Tampilan Google Form Pengujian Sistem Magang dan Administrator

**Lampiran 2  
Hasil Responden Pengujian Black Box**

**Lampiran 2.a. Hasil Pengujian Fitur Semua Aktor**

Gambar L.3 Hasil Respon Pengujian Login Menggunakan Akun Valid

Gambar L.4 Hasil Respon Pengujian Login Menggunakan Kata Sandi yang Salah

Gambar L.5 Hasil Respon Pengujian Login dengan Email Belum Diverifikasi

Gambar L.6 Hasil Respon Pengujian Login dengan Akun Nonaktif

Gambar L.7 Hasil Respon Pengujian Pembatasan Login Setelah Gagal Berulang Kali

Gambar L.8 Hasil Respon Pengujian Lupa Kata Sandi

Gambar L.9 Hasil Respon Pengujian Memperbarui Profil

Gambar L.10 Hasil Respon Pengujian Menggunakan Username yang Sudah Terdaftar

**Lampiran 2.b. Hasil Pengujian Fitur Peserta Didik**

Gambar L.11 Hasil Respon Pengujian Melihat Katalog Kursus

Gambar L.12 Hasil Respon Pengujian Mencari Kursus Berdasarkan Kata Kunci

Gambar L.13 Hasil Respon Pengujian Pencarian Kursus Tidak Ditemukan

Gambar L.14 Hasil Respon Pengujian Melihat Detail Kursus

Gambar L.15 Hasil Respon Pengujian Pembelian Kursus Tanpa Voucher

Gambar L.16 Hasil Respon Pengujian Pembelian Kursus dengan Voucher

Gambar L.17 Hasil Respon Pengujian Memasukkan Kode Voucher Tidak Valid

Gambar L.18 Hasil Respon Pengujian Menutup Antarmuka Pembayaran Sebelum Selesai

Gambar L.19 Hasil Respon Pengujian Memutar Video Pembelajaran

Gambar L.20 Hasil Respon Pengujian Menandai Video Selesai untuk Pertama Kali

Gambar L.21 Hasil Respon Pengujian Mengakses Tahap Pembelajaran yang Masih Terkunci

Gambar L.22 Hasil Respon Pengujian Mengerjakan Kuis dan Memperoleh Nilai Lulus

Gambar L.23 Hasil Respon Pengujian memperoleh Nilai Tidak Lulus pada Percobaan Pertama atau Kedua

Gambar L.24 Hasil Respon Pengujian Mengirim Jawaban Kuis yang Belum Lengkap

Gambar L.25 Hasil Respon Pengujian Gagal Kuis Tiga Kali Berturut-turut

Gambar L.26 Hasil Respon Pengujian Mengklaim Sertifikat Setelah Kursus Selesai

Gambar L.27 Hasil Respon Pengujian Mengunduh Sertifikat dalam Format PDF

Gambar L.28 Hasil Respon Pengujian Mengkalim Sertifikat Sebelum Kursus Selesai

Gambar L.29 Hasil Respon Pengujian Melihat Informasi Gamifikasi pada Halaman EXP & Level

Gambar L.30 Hasil Respon Pengujian Mengklaim Voucher Reward Sesuai Level

Gambar L.31 Hasil Respon Pengujian Mengklaim Voucher Reward yang Masih Terkunci

**Lampiran 2.c. Hasil Pengujian Fitur Peserta Magang**

Gambar L.32 Hasil Respon Pengujian Check-In Kehadiran dalam Jendela Waktu Absensi

Gambar L.33 Hasil Respon Pengujian Check-In diluar Rentang Waktu Absensi

Gambar L.34 Hasil Respon Pengujian Check-In Setelah Absensi Tercatat di Hari yang Sama

Gambar L.35 Hasil Respon Pengujian Mengumpulkan Tugas Sebelum Tenggat Waktu

Gambar L.36 Hasil Respon Pengujian Mengumpul Tugas Setelah Tenggat Waktu Terlampau

Gambar L.37 Hasil Respon Pengujian Mengumpulkan Ulang Tugas yang Dikembalikan Mentor

Gambar L.38 Hasil Respon Pengujian Melihat Nilai Akhir Magang

Gambar L.39 Hasil Respon Pengujian Melihat Nilai Akhir yang Belum Tersedia

**Lampiran 2.d. Hasil Pengujian Fitur Mentor**

Gambar L.40 Hasil Respon Pengujian Check-In Pribadi dalam Rentang Waktu Absensi

Gambar L.41 Hasil Respon Pengujian Check-In Pribadi di Luar Rentang Waktu Absensi

Gambar L.42 Hasil Respon Pengujian Check-In Pribadi Setelah Absensi Tercatat di Hari yang Sama

Gambar L.43 Hasil Respon Pengujian melihat Rekap Absensi Peserta Magang Hari Ini

Gambar L.44 Hasil Respon Pengujian Melihat Rekap Absensi pada Tanggal Tertentu

Gambar L.45 Hasil Respon Pengujian Melihat Absensi pada Tanggal Libur atau Akhir Pekan

Gambar L.46 Hasil Respon Pengujian Membuat Tugas Baru dengan Data Lengkap

Gambar L.47 Hasil Respon Pengujian Membuat Tugas Baru Tanpa Mengisi Data Wajib

Gambar L.48 Hasil Respon Pengujian Menghapus Tugas dengan Konfirmasi

Gambar L.49 Hasil Respon Pengujian Mengembalikan Tugas dengan Umpan Balik

Gambar L.50 Hasil Respon Pengujian Mengembalikan Tugas Tanpa Mengisi Umpan Balik

Gambar L.51 Hasil Respon Pengujian Memberikan Nilai Akhir dengan Catatan Evaluasi

Gambar L.52 Hasil Respon Pengujian Memasukkan Nilai Akhir di Luar Rentang yang Diizinkan

**Lampiran 2.e. Hasil Pengujian Fitur Administrator**

Gambar L.53 Hasil Respon Pengujian Membuat Kursus Baru dengan Data Dasar yang Valid

Gambar L.54 Hasil Respon Pengujian Mengunggah Video ke Langkah Kurikulum

Gambar L.55 Hasil Respon Mempublikasikan Kursus dengan Komponen Lengkap

Gambar L.56 Hasil Respon Pengujian Mempublikasikan Kursus dengan Komponen Belum Lengkap

Gambar L.57 Hasil Respon Pengujian Menghapus Kursus Tanpa Peserta dan Transaksi

Gambar L.58 Hasil Respon Pengujian Menghapus Kursus yang Memiliki Peserta Aktif

Gambar L.59 Hasil Respon Pengujian Menambah Kategori Baru dengan Nama yang Unik

Gambar L.60 Hasil Respon Pengujian Menambah Kategori dengan Nama yang Sudah Digunakan

Gambar L.61 Hasil Respon Pengujian Menghapus Kategori yang Masih Digunakan oleh Kursus Aktif

Gambar L.62 Hasil Respon Pengujian Menambah Akun Peserta Didik Baru dengan Data Lengkap

Gambar L.63 Hasil Respon Pengujian Menambah Akun Pengguna dengan Email yang Sudah Terdaftar

Gambar L.64 Hasil Respon Pengujian Menonaktifkan Akun Pengguna yang Sedang Aktif

Gambar L.65 Hasil Respon Pengujian Melihat Daftar Transaksi dengan Filter Status Tertentu

Gambar L.66 Hasil Respon Pengujian Membatalkan Transaksi Berstatus Menunggu Pembayaran

Gambar L.67 Hasil Respon Pengujian Mengubah Status Transaksi yang Telah Berhasil

Gambar L.68 Hasil Respon Pengujian Membuat Voucher Baru dengan Kode yang Unik

Gambar L.69 Hasil Respon Pengujian Membuat Voucher dengan Kode yang Sudah Digunakan

Gambar L.70 Hasil Respon Pengujian Menghapus Voucher yang Sudah Digunakan pada Transaksi

Gambar L.71 Hasil Respon Pengujian Melihat Daftar Sertifikat yang Telah Diterbitkan

Gambar L.72 Hasil Respon Pengujian Mengunduh Sertifkat Peserta dalam Format PDF

Gambar L.73 Hasil Respon Pengujian Melihat Aturan EXP dan Level yang Berlaku

Gambar L.74 Hasil Respon Pengujian Menambah Badge Baru dengan Data Lengkap

Gambar L.75 Hasil Respon Pengujian Menghapus Badge dengan Konfirmasi

Gambar L.76 Hasil Respon Pengujian Melihat Rekap Absensi Peserta Magang dengan Filter Kelas

Gambar L.77 Hasil Respon Pengujian Mengoreksi Status Absensi Peserta Secara Manual

Gambar L.78 Hasil Respon Pengujian Menambah Batch Baru dengan Data Lengkap

Gambar L.79 Hasil Respon Pengujian Menambah Kelas dengan Memilih Batch dan Bidang yang Sesuai

Gambar L.80 Hasil Respon Pengujian Menghapus kelas yang Masih Memiliki Peserta Magang Aktif

Gambar L.81 Hasil Respon Pengujian Melihat Daftar Tugas Magang dengan Filter Kelas Tertentu

Gambar L.82 Hasil Respon Pengujian Menyesuaikan Status Pengumpulan Menjadi Terkumpul Tanapa Berkas

Gambar L.83 Hasil Respon Pengujian Mengubah Nilai Akhir Peserta dengan Alasan Perubahan

Gambar L.84 Hasil Respon Pengujian Mengubah Nilai Akhir Peserta Tanpa Mengisi Alasan Perubahan

Gambar L.85 Hasil Respon Pengujian Menambah Data Libur Baru dengan Tanggal Mulai yang Valid

Gambar L.86 Hasil Respon Pengujian Menghapus Data Libur Berstatus Akan Datang

Gambar L.87 Hasil Respon Pengujian Mengedit atau Menghapus Data Libur Berstatus Sudah Selesai

Gambar L.88 Hasil Respon Pengujian Mengundang Administrator Baru Melalui Email

Gambar L.89 Hasil Respon Pengujian Menonaktifkan Akun Administrator Lain

Gambar L.90 Hasil Respon Pengujian Menonaktifkan Administrator Saat Hanya Tersisa Satu Administrator Aktif

**Lampiran 3  
Hasil Kuesioner Evaluasi Penerimaan Pengguna**

Gambar L.91 User Acceptance Test (Bagian 1)

Gambar L.92 User Acceptance Test (Bagian 2)

**Lampiran 4  
Bukti Pelaksanaan dengan Mitra**

**Lampiran 4.a. Surat Keterangan bersedia menjadi Mitra**

Gambar L.93 Surat Keterangan Kesediaan Menjadi Mitra

**Lampiran 4.b. Bukti Dokumentasi Pelaksanaan**

Tabel L.1 Dokumentasi Kegiatan dengan Mitra

| **No.** | **Tanggal** | **Kegiatan**                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 09/09/2025  | Nama Pelaksana: Farid Zahran.<br><br>Hasil Kegiatan: Diskusi bersama pihak mitra untuk melakukan identifikasi kebutuhan sistem, membahas latar belakang permasalahan, merumuskan kebutuhan fungsional dan nonfungsional, serta menentukan ruang lingkup pengembangan platform pembelajaran digital. Pada tahap ini juga dilakukan penyelarasan tujuan pengembangan agar sistem yang dibangun sesuai dengan kebutuhan operasional NextLevel Academy.<br><br>Foto pelaksanaan: |
| 2       | 20/06/2026  | Nama Pelaksana: Farid Zahran.<br><br>Hasil Kegiatan: Presentasi hasil pengembangan platform pembelajaran digital beserta demonstrasi fitur utama aplikasi kepada Kevin selaku CEO NextLevel Academy. Sesi ini bertujuan untuk memperoleh masukan, melakukan validasi terhadap implementasi sistem, serta memastikan bahwa seluruh kebutuhan yang telah disepakati pada tahap analisis telah terakomodasi dengan baik.<br><br>Foto pelaksanaan:                               |

**Lampiran 4.c. Surat Selesai dari Mitra**

Gambar L.94 Surat Keterangan Selesai Pelaksanaan Kemitraan
