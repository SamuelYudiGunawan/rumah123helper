# HEPI Rumah123 Helper

Userscript Tampermonkey untuk membantu memasukkan listing lewat form Rumah123. Script mengisi halaman yang sedang terbuka melalui DOM/UI, mempertahankan draft helper di `localStorage`, dan tidak pernah mengklik tombol **Simpan Iklan**.

## Instalasi

1. Pasang Tampermonkey di Chrome.
2. Untuk versi bersama dengan update otomatis, buka [file userscript di GitHub](https://raw.githubusercontent.com/SamuelYudiGunawan/rumah123helper/master/hepi-rumah123-helper.user.js) lalu pilih **Install**. Alternatifnya, impor `hepi-rumah123-helper.user.js` dari file lokal melalui dashboard Tampermonkey → **Utilities** → **Import from file**.
3. Simpan dan buka halaman **Pasang Iklan** di `rumah123.com`. Panel **HEPI Rumah123 Helper** akan muncul di kiri.

Script menggunakan `@match` untuk `www.rumah123.com` dan `rumah123.com`. Untuk domain regional/subdomain lain, sesuaikan metadata `@match` hanya jika halaman tersebut memang Rumah123.

## Workflow

1. Paste teks owner/WhatsApp ke **Data listing mentah**, lalu klik **Parse Listing**. Parse ulang memulai data properti baru: override Quick Fill, USP, dan highlight manual dari listing sebelumnya dihapus; nilai tanpa hasil parse kembali ke default yang tersedia atau kosong.
2. Periksa **Parsed Data** dan lengkapi atau koreksi nilai di **Quick Fill**. Nilai Quick Fill manual menjadi prioritas atas hasil parser.
3. Pilih USP dan description highlight yang benar untuk properti tersebut. Isi deskripsi asli bila ada.
4. Klik **Fill Current Page** untuk mengisi halaman yang sedang terbuka. **Fill & Next** mengisi, memeriksa field kritis yang diketahui, lalu menekan **Selanjutnya** jika aman.
5. Review seluruh listing dan unggah foto secara manual. Klik **Simpan Iklan** sendiri setelah siap.

Pengguna yang memasang dari link GitHub akan menerima update saat versi baru diterbitkan dan `@version` dinaikkan. Gunakan **Clear State** untuk menghapus draft helper dari localStorage. Tombol ini tidak menghapus nilai form Rumah123 yang sudah terisi.

## Format listing

Parser mengenali contoh label seperti `Luas Tanah`, `LT`, `Panjang Tanah`, `Lebar Tanah`, `Luas Bangunan`, `LB`, `Panjang Bangunan`, `Lebar Bangunan`, `Kamar Tidur`/`KT`, `Kamar Mandi`/`KM`, `Jumlah Kamar`, `Listrik`, `Air`, `Sertifikat`, `Hadap`/`Menghadap`, `Jumlah Lantai`, `Nomor Lantai`, dan `Harga`. Untuk Apartemen, gunakan label eksplisit `Nama Apartemen: ...`, `Nomor Lantai: ...`, `Tahun Dibangun: ...`, `Tahun Direnovasi: ...`, dan `Pemandangan: ...`; nama kompleks tidak ditebak dari judul. Untuk Ruko, label eksplisit `Komplek Perumahan: ...`, `Nomor Lantai: ...`, `IMB: Ada/Tidak Ada`, `Fasilitas Ruko: ...`, dan `Metode Pembayaran: ...` didukung. Untuk Gudang, gunakan `Fasilitas Gudang: ...`, `IMB: Ada/Tidak Ada`, dan `Metode Pembayaran: ...`. Untuk Kost, gunakan `Jumlah Kamar: ...`, `Fasilitas Kamar Kost: ...`, `Fasilitas Kost: ...`, `IMB: Ada/Tidak Ada`, dan `Metode Pembayaran: ...`. Panjang dan lebar tanah/bangunan diambil dari nilai terpisah yang disebut jelas. Untuk ukuran tanah `A x B` yang muncul bersama konteks tanah seperti `LT 200 (10x20)`, A dipetakan ke Lebar dan B ke Panjang. Tipe harga dikenali dari keterangan seperti `Total`, `per m2`, atau `/m²`; tipe harga diisi hanya untuk Tanah/Ruko/Gudang bila ditemukan pada teks. Format kamar `6+1` diartikan sebagai 6 kamar utama dan 1 kamar pembantu; format `Kamar Tidur Pembantu: 1` juga didukung. Jumlah lantai seperti `Rumah 2 lantai` diparse sebagai angka 2. Aliases sertifikat HM/SHM/Hak Milik dinormalisasi menjadi SHM. Harga `1,7M` atau `1.7M` ditampilkan sebagai `1,7M` pada preview dan Quick Fill; nilai Quick Fill menerima koma desimal. `750jt` menjadi 750 Juta.

Gunakan baris eksplisit seperti `Co-broke: ya` atau `Co-broke: tidak` bila ingin menentukan statusnya. Co-broke default OFF. Lokasi ditarik dari teks setelah `di` pada baris judul, lalu dicocokkan dengan daftar Area/Kota/Provinsi dari sheet `data_area`. Kolom pencarian lokasi memakai nama area yang paling cocok: `Taman Borobudur Semarang Barat` menjadi area `Semarang Barat` dan nama jalan `Taman Borobudur`; `Graha Padma Semarang Barat` menjadi area `Graha Padma` dan nama jalan `Graha Padma`; `[Kelurahan] Genuk` menjadi area `Genuk`. Nama jalan dipilih dari dropdown hasil pencarian; bila tidak ada bagian awal yang terdeteksi, script memakai area pencarian untuk memilih hasil pertama.

Jika listing memiliki deskripsi naratif, Anda bisa menuliskannya di bagian `Deskripsi:` atau mengisinya langsung pada **Deskripsi asli (opsional)**. Parser tidak mengubah teks umum seperti “strategis” menjadi USP atau fakta lokasi.

## Quick Fill, USP, dan deskripsi

- **Lebar Jalan** memakai pilihan segmented `?`, `1`, `2`, `3`, `4`; default Rumah adalah `2` mobil. Untuk Ruko nilai dikosongkan kecuali disebut di listing atau diisi manual; untuk Gudang dan Kost field ini tidak tersedia. `?` berarti tidak mengubah field Rumah123.
- Quick Fill **Panjang Tanah** dan **Lebar Tanah** ditampilkan untuk tipe Tanah, Ruko, dan Gudang, dalam meter. Ukuran `A x B` mengisi Lebar dari A dan Panjang dari B. Nilai diisi ke bagian Detail Tambahan (Opsional) jika tercantum di listing atau dimasukkan manual.
- Quick Fill **Tipe Harga** ditampilkan untuk Tanah, Ruko, dan Gudang. Parser memilih **Total** atau **/m²** dari keterangan harga; bila tidak disebut, script tidak menebak dan **Fill & Next** meminta pilihan manual karena field ini wajib. Satuan angka seperti Ribu/Juta/Miliar tetap diatur terpisah.
- Harga Apartemen dan Kost mengikuti alur Rumah: isi nominal, pilih satuan Ribu/Juta/Miliar/Triliun, lalu atur Bisa Nego jika disebut. Kost tidak memakai Tipe Harga Total atau /m²; pilihan itu hanya untuk Tanah, Ruko, dan Gudang.
- Pengisian spesifikasi Tanah melewati field yang tidak ada di form Tanah, seperti luas bangunan, kamar, lantai, garasi/carport, kondisi perabot, listrik, sumber air, dan fasilitas rumah.
- Form Apartemen memakai **Nama Apartemen**, **Luas Bangunan**, dan **Nomor Lantai** sebagai field wajib. Pengisian Apartemen tidak meminta atau mengisi Luas Tanah, Lebar Jalan, Sumber Air, Hadap, Garasi/Carport, atau fasilitas Rumah. Nama Apartemen harus disebut eksplisit dan dipilih dari dropdown; `Strata Title` diarahkan ke pilihan sertifikat `Strata`.
- Untuk Apartemen, Quick Fill juga menyediakan Tahun Dibangun, Tahun Direnovasi, dan Pemandangan. Tipe Studio, Mezanin, Fasilitas Apartemen, Peralatan, dan Metode Pembayaran tetap dipilih langsung di form Rumah123.
- Form Ruko mewajibkan **Luas Tanah** dan **Luas Bangunan**. Field kamar tidur, kamar pembantu, kondisi perabot, Hadap, Sumber Air, Garasi/Carport, dan fasilitas Rumah dilewati. Quick Fill Ruko menyediakan Komplek Perumahan, Nomor Lantai, ukuran bangunan/tanah, IMB, fasilitas Ruko, dan Metode Pembayaran; pilihan opsional hanya diubah jika disebut atau dipilih.
- Fasilitas Ruko yang dikenali: AC, Jalur Telepon, CCTV, WIFI/Internet, Rooftop, dan Parking Area. Metode Pembayaran yang dikenali: Kredit, Cash Keras, dan Cicilan Bertahap. Jumlah Lantai dan Nomor Lantai adalah field berbeda pada form Ruko.
- Form Gudang mewajibkan **Luas Tanah** dan **Luas Bangunan**. Quick Fill Gudang menyediakan Komplek Perumahan, ukuran tanah/bangunan, Tahun Dibangun/Direnovasi, IMB, fasilitas Gudang, dan Metode Pembayaran. Kamar tidur, kamar pembantu, Hadap, Sumber Air, Lebar Jalan, Garasi/Carport, dan fasilitas Rumah dilewati; Kondisi Perabotan, Kamar Mandi, dan Jumlah Lantai tetap didukung.
- Fasilitas Gudang yang dikenali: AC, Jalur Telepon, CCTV, WIFI/Internet, Mess Karyawan, Kantin Karyawan, Meeting Room, Mushola, Keamanan, Elevator/Lift, Genset, Loading Dock, Akses Fusso, Akses Engkel Box, dan Parking Area. Metode Pembayaran sama dengan Ruko.
- Form Kost mewajibkan **Luas Tanah** dan **Luas Bangunan**. Quick Fill Kost menyediakan Jumlah Kamar, Kamar Mandi, Carport, Jumlah Lantai, Komplek Perumahan, tahun, IMB, fasilitas kamar, fasilitas Kost, dan metode pembayaran. Listrik, Hadap, Sumber Air, Garasi, Lebar Jalan, kondisi perabot, serta fasilitas rumah dilewati.
- Fasilitas kamar Kost dan fasilitas Kost dipetakan terpisah mengikuti checkbox Rumah123. Metode pembayaran Kost memakai KPR, Cash Keras, atau Cicilan Bertahap.
- **Daya listrik** harus cocok persis dengan option Rumah123. Contohnya, 5000W dibiarkan kosong karena tidak tersedia; ubah manual menjadi 5500 jika angka itu memang benar untuk listing.
- **Sumber Air** memetakan PAM/PDAM, Sumur Bor, Sumur Pompa, Sumur Resapan, dan Sumur Galian. “Air Artetis” dipetakan ke Sumur Bor.
- Jika data tidak menyebutkan pilihan tersebut, defaults-nya Sertifikat **Lainnya** dan Kondisi Properti **Bagus**. Kondisi Perabotan **Unfurnished** hanya berlaku untuk tipe properti yang memiliki field itu. Nilai listing atau Quick Fill menggantikan default.
- Kolom Quick Fill yang kosong tidak menghapus default tersebut; Hadap tidak ditebak dan perlu disebutkan di data atau dipilih manual.
- **Fasilitas Rumah** dan **Fasilitas Perumahan** terbuka secara default. Teras otomatis dicentang pada Fasilitas Rumah dan Akses Parkir pada Fasilitas Perumahan. Keduanya dapat diubah sebelum Fill. Fasilitas Perumahan juga mencakup Keamanan 24 jam, Masjid, Taman, Kolam Renang, CCTV, One Gate System, Taman Bermain, Tempat Laundry, dan Jogging Track.
- Judul otomatis menggabungkan tipe properti, jumlah lantai untuk properti selain Apartemen, USP/highlight terpilih, dan lokasi hingga 65 karakter; teks `Dijual`/`Disewa` tidak dimasukkan. Isi **Judul iklan** di Quick Fill untuk mengganti judul otomatis.
- Bila deskripsi asli kosong, preview memakai format listing ringkas: judul transaksi dan lokasi, lalu fakta luas, fasilitas yang disebut, jumlah kamar/Kamar Mandi, Carport, lantai, dan Harga. Untuk Ruko/Gudang, preview juga memuat dimensi tanah/bangunan; untuk Ruko/Gudang/Kost preview memuat tahun, IMB, fasilitas, dan metode pembayaran bila tersedia. USP serta description highlight terpilih ditambahkan pada bagian `Keunggulan:`.
- **Siap Huni** dan **Bebas Banjir** dicentang sebagai USP utama default untuk Rumah. Untuk tipe **Tanah**, **Siap Huni** tidak dicentang otomatis; **Bebas Banjir** tetap menjadi default. USP yang disebutkan eksplisit di listing atau dipilih manual tetap dipertahankan. USP yang dipilih dapat ditambahkan di bagian `Keunggulan:` pada deskripsi. Pilihan **Tambahkan USP Rumah123 ke deskripsi** aktif secara default; pilihan USP tetap dapat diedit.
- Highlight preset maupun custom masuk ke deskripsi saja. Teks asli dipertahankan; tambahan dideduplikasi tanpa membedakan kapitalisasi. Batas deskripsi adalah 2200 karakter. Bila tambahan tidak muat, preview memberi tahu jumlah highlight yang dilewati.

## Debug Mode

Aktifkan **Debug Mode** untuk menulis langkah automasi berawalan `[R123]` di console. Setiap klik **Parse Listing** mengosongkan log panel sebelumnya dan menulis satu ringkasan berisi panjang teks serta field yang dikenali; log `page = ...` berasal dari proses **Fill**, bukan hasil parse. Peringatan penting tetap ditampilkan pada panel dan console. Panel juga menampilkan badge LQS beserta persentase yang benar-benar ditemukan pada DOM saat ini; script tidak menaksir score yang tidak tampil.

## Batas dan troubleshooting

- Rumah123 dapat mengubah markup. Jika field tidak ditemukan, periksa warning panel dan pastikan form/page terkait sudah terbuka.
- Lokasi dipilih dari baris suggestion area yang dicocokkan lewat nama dan konteks kota/provinsi memakai direktori sheet `data_area`. Bila pencarian utama tidak menemukan baris, fallback mengisi Provinsi, Kota, dan Area secara berurutan setelah tiap dropdown aktif. Pencarian `Genuk` tetap membedakan hasil area `Genuk` dari `Genuksari`.
- Selector Apartemen yang dikenali: nama `input[placeholder="Pilih Nama Apartemen"]`, luas `input[name="buildingSize"]`, nomor lantai `input[name="storey"]`, tahun `input[name="builtYear"]`/`input[name="renovationYear"]`, dan pemandangan `[data-testid="scenery"] select`.
- Selector Ruko yang dikenali: komplek `input[placeholder="Pilih Komplek Perumahan"]`, luas `landSize`/`buildingSize`, ukuran bangunan `building_length`/`building_width`, nomor lantai `storey`, panjang/lebar tanah lewat placeholder, checkbox `IMB`, `roomFacilities-*`, dan `paymentMethods-*`.
- Selector Gudang yang dikenali: komplek `input[placeholder="Pilih Komplek Perumahan"]`, luas `landSize`/`buildingSize`, ukuran `building_length`/`building_width`, panjang/lebar tanah lewat placeholder, tahun `builtYear`/`renovationYear`, checkbox `IMB`, fasilitas `roomFacilities-*`, dan `paymentMethods-*`. Gudang memakai Jumlah Lantai, bukan Nomor Lantai.
- Selector Kost yang dikenali: komplek `input[placeholder="Pilih Komplek Perumahan"]`, luas `landSize`/`buildingSize`, counter `Jumlah Kamar`/`Kamar Mandi`/`Carport`/`Jumlah Lantai`, tahun `builtYear`/`renovationYear`, checkbox `IMB`, fasilitas kamar `room-*`, fasilitas Kost `generalFacility-*`, dan metode pembayaran `paymentMethods-KPR`/`paymentMethods-Cash Keras`/`paymentMethods-Cicilan Bertahap`.
- Selector DOM yang sudah dikenali dari form: lokasi `input[placeholder="Tulis Nama lokasi"]`, pencarian jalan di dropdown `input[placeholder="Silahkan melakukan pencarian di sini"]`, jalan `input[placeholder="Contoh: Jalan Merdeka"]`, serta luas lewat selector `landSize`/`buildingSize` dan fallback label. Untuk form Tanah, panjang dan lebar dicari dari placeholder `Panjang Tanah`/`Lebar Tanah` di bagian Detail Tambahan (Opsional); tipe harga memakai select `[data-testid="priceUnit"]` dengan nilai `TOTAL` atau `PER_SQUAREMETER`. Nilai luas dan satuan m² diisi sebelum pencarian nama jalan; field teks dicari ulang dan nilainya diverifikasi sesudah React memperbarui form. Counter kamar memakai `[data-testid="bedroom"]` dan `[data-testid="bathroom"]`; modal USP dibuka lewat **Tambah Keunggulan Properti**. Detail tambahan dibuka sebelum script mencari field opsional yang relevan. Pilihan Hadap mendukung kartu berikon maupun kartu teks.
- Sertifikat, kondisi properti, kondisi perabot, dan Hadap dipilih sebagai satu pilihan aktif. Script memeriksa radio `checked` bila tersedia, atau status kartu pilihan Rumah123 bila kontrolnya dirender sebagai kartu. Kondisi properti mengikuti pilihan Rumah123 `Bagus`, `Butuh Minim Renovasi`, `Butuh Renovasi Total`, atau `Terenovasi`. Status `Baru`/`Second` diatur terpisah pada halaman kategori. Kondisi perabot memakai `Furnished`, `Semi Furnished`, atau `Unfurnished`.
- Jika React belum menerima perubahan, coba isi field yang gagal secara manual. Panel akan tetap menyimpan draft ketika SPA berpindah halaman.
- Script mengisi maksimal halaman kategori, spesifikasi, dan harga yang terdeteksi. Upload foto tetap manual. Tidak ada loop publish, bypass CAPTCHA/auth, pemanggilan API tersembunyi, atau klik otomatis pada tombol simpan.

## Checklist uji manual

- [ ] Parser `KT 6+1` dan `KM 2+1` mengisi kamar utama dan pembantu secara terpisah.
- [ ] Parser `Harga 1,7M nego` menghasilkan 1.7 Miliar dan Nego aktif.
- [ ] Parser `Sertifikat HM` menghasilkan SHM.
- [ ] Co-broke default OFF; hanya aktif bila eksplisit.
- [ ] Lokasi memilih suggestion area yang cocok dan mengisi area/kota/provinsi.
- [ ] LT/LB mengisi input dan memilih satuan m².
- [ ] Panjang/Lebar Tanah diparse dari label terpisah dan hanya diisi untuk tipe Tanah.
- [ ] Ukuran Tanah `10x20` menghasilkan Lebar 10 m dan Panjang 20 m.
- [ ] Pengisian Tanah tidak menghasilkan error untuk field Rumah yang tidak ada pada form Tanah.
- [ ] Counter KT/KM dan counter lantai/garasi/carport bekerja.
- [ ] Counter kamar tidur dan kamar mandi pembantu bekerja.
- [ ] Sertifikat dipilih dari `[data-testid="certificate"]`.
- [ ] Fasilitas ruang menggunakan checkbox `roomFacilities-*`.
- [ ] Fasilitas perumahan menggunakan checkbox `residentialFacilities-*`.
- [ ] Nama jalan mengambil segmen awal lokasi dan kolom pencarian memakai nama area seperti `Genuk`, `Semarang Barat`, atau `Graha Padma`.
- [ ] Kondisi Properti `Bagus` dan Kondisi Perabotan `Unfurnished` dipilih saat tidak ada nilai dari listing.
- [ ] Judul menghilangkan `Dijual`/`Disewa` dan preview deskripsi memuat fakta listing yang tersedia.
- [ ] Lebar jalan memetakan ONE_CAR sampai FOUR_CAR.
- [ ] Listrik memakai exact match; 5000W memberi warning dan tidak memilih angka terdekat.
- [ ] Sumber air memetakan nilai pasti; Air Artetis menjadi Sumur Bor.
- [ ] USP dipilih/uncheck di modal Keunggulan Properti.
- [ ] Tanah tidak memilih USP Siap Huni secara default; pilihan eksplisit dari listing atau manual tetap bisa dipakai.
- [ ] USP pilihan masuk ke deskripsi; highlight deskripsi-only dan custom juga masuk.
- [ ] Preview deduplicates highlight dan menjaga batas 2200 karakter.
- [ ] Harga, satuan, Nego, judul, dan deskripsi terisi.
- [ ] Tipe Harga Tanah/Ruko/Gudang memilih Total atau /m² sesuai teks listing, dan meminta pilihan manual bila tidak disebut; Kost memakai harga biasa tanpa tipe tersebut.
- [ ] **Fill Current Page** tidak berpindah halaman.
- [ ] **Fill & Next** berhenti bila field kritis gagal dan berpindah saat lolos.
- [ ] State helper bertahan saat SPA berpindah antar langkah.
- [ ] Pastikan script tidak pernah mengklik **Simpan Iklan**.
