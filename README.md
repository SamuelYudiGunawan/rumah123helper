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

Parser mengenali contoh label seperti `Luas Tanah`, `LT`, `Luas Bangunan`, `LB`, `Kamar Tidur`/`KT`, `Kamar Mandi`/`KM`, `Listrik`, `Air`, `Sertifikat`, `Hadap`/`Menghadap`, `Jumlah Lantai`, dan `Harga`. Format kamar `6+1` diartikan sebagai 6 kamar utama dan 1 kamar pembantu; format `Kamar Tidur Pembantu: 1` juga didukung. Jumlah lantai seperti `Rumah 2 lantai` diparse sebagai angka 2. Aliases sertifikat HM/SHM/Hak Milik dinormalisasi menjadi SHM. Harga `1,7M` atau `1.7M` ditampilkan sebagai `1,7M` pada preview dan Quick Fill; nilai Quick Fill menerima koma desimal. `750jt` menjadi 750 Juta.

Gunakan baris eksplisit seperti `Co-broke: ya` atau `Co-broke: tidak` bila ingin menentukan statusnya. Co-broke default OFF. Lokasi ditarik dari teks setelah `di` pada baris judul, lalu dicocokkan dengan daftar Area/Kota/Provinsi dari sheet `data_area`. Kolom pencarian lokasi memakai nama area yang paling cocok: `Taman Borobudur Semarang Barat` menjadi area `Semarang Barat` dan nama jalan `Taman Borobudur`; `Graha Padma Semarang Barat` menjadi area `Graha Padma` dan nama jalan `Graha Padma`; `[Kelurahan] Genuk` menjadi area `Genuk`. Nama jalan dipilih dari dropdown hasil pencarian; bila tidak ada bagian awal yang terdeteksi, script memakai area pencarian untuk memilih hasil pertama.

Jika listing memiliki deskripsi naratif, Anda bisa menuliskannya di bagian `Deskripsi:` atau mengisinya langsung pada **Deskripsi asli (opsional)**. Parser tidak mengubah teks umum seperti “strategis” menjadi USP atau fakta lokasi.

## Quick Fill, USP, dan deskripsi

- **Lebar Jalan** memakai pilihan segmented `?`, `1`, `2`, `3`, `4`; default-nya `2` mobil. `?` berarti tidak mengubah field Rumah123.
- **Daya listrik** harus cocok persis dengan option Rumah123. Contohnya, 5000W dibiarkan kosong karena tidak tersedia; ubah manual menjadi 5500 jika angka itu memang benar untuk listing.
- **Sumber Air** memetakan PAM/PDAM, Sumur Bor, Sumur Pompa, Sumur Resapan, dan Sumur Galian. “Air Artetis” dipetakan ke Sumur Bor.
- Jika data tidak menyebutkan pilihan tersebut, defaults-nya Sertifikat **Lainnya**, Kondisi Properti **Bagus**, dan Kondisi Perabotan **Unfurnished**. Nilai yang disebutkan di listing atau Quick Fill menggantikan default.
- Kolom Quick Fill yang kosong tidak menghapus default tersebut; Hadap tidak ditebak dan perlu disebutkan di data atau dipilih manual.
- **Fasilitas Rumah** dan **Fasilitas Perumahan** terbuka secara default. Teras otomatis dicentang pada Fasilitas Rumah dan Akses Parkir pada Fasilitas Perumahan. Keduanya dapat diubah sebelum Fill. Fasilitas Perumahan juga mencakup Keamanan 24 jam, Masjid, Taman, Kolam Renang, CCTV, One Gate System, Taman Bermain, Tempat Laundry, dan Jogging Track.
- Judul otomatis menggabungkan tipe properti, jumlah lantai, USP/highlight terpilih, dan lokasi hingga 65 karakter; teks `Dijual`/`Disewa` tidak dimasukkan. Isi **Judul iklan** di Quick Fill untuk mengganti judul otomatis.
- Bila deskripsi asli kosong, preview memakai format listing ringkas: judul transaksi dan lokasi, lalu baris Luas Tanah/Luas Bangunan/Kamar Tidur/Kamar Mandi/Listrik/lantai dan Harga. Contoh `6+1` tetap tampil sebagai kamar utama dan pembantu. USP serta description highlight terpilih ditambahkan pada bagian `Keunggulan:`.
- **Siap Huni** dan **Bebas Banjir** dicentang sebagai USP utama default. Periksa dan sesuaikan keduanya untuk tiap properti. USP yang dipilih dapat ditambahkan di bagian `Keunggulan:` pada deskripsi. Pilihan **Tambahkan USP Rumah123 ke deskripsi** aktif secara default; pilihan USP tetap dapat diedit.
- Highlight preset maupun custom masuk ke deskripsi saja. Teks asli dipertahankan; tambahan dideduplikasi tanpa membedakan kapitalisasi. Batas deskripsi adalah 2200 karakter. Bila tambahan tidak muat, preview memberi tahu jumlah highlight yang dilewati.

## Debug Mode

Aktifkan **Debug Mode** untuk menulis langkah automasi berawalan `[R123]` di console. Setiap klik **Parse Listing** mengosongkan log panel sebelumnya dan menulis satu ringkasan berisi panjang teks serta field yang dikenali; log `page = ...` berasal dari proses **Fill**, bukan hasil parse. Peringatan penting tetap ditampilkan pada panel dan console. Panel juga menampilkan badge LQS beserta persentase yang benar-benar ditemukan pada DOM saat ini; script tidak menaksir score yang tidak tampil.

## Batas dan troubleshooting

- Rumah123 dapat mengubah markup. Jika field tidak ditemukan, periksa warning panel dan pastikan form/page terkait sudah terbuka.
- Lokasi dipilih dari baris suggestion area yang dicocokkan lewat nama dan konteks kota/provinsi memakai direktori sheet `data_area`. Bila pencarian utama tidak menemukan baris, fallback mengisi Provinsi, Kota, dan Area secara berurutan setelah tiap dropdown aktif. Pencarian `Genuk` tetap membedakan hasil area `Genuk` dari `Genuksari`.
- Selector DOM yang sudah dikenali dari form: lokasi `input[placeholder="Tulis Nama lokasi"]`, pencarian jalan di dropdown `input[placeholder="Silahkan melakukan pencarian di sini"]`, jalan `input[placeholder="Contoh: Jalan Merdeka"]`, serta luas lewat selector `landSize`/`buildingSize` dan fallback label. Nilai luas dan satuan m² diisi sebelum pencarian nama jalan; field teks dicari ulang dan nilainya diverifikasi sesudah React memperbarui form. Counter kamar memakai `[data-testid="bedroom"]` dan `[data-testid="bathroom"]`; modal USP dibuka lewat **Tambah Keunggulan Properti**. Detail tambahan dibuka sebelum script mencari select lebar jalan, listrik, dan sumber air. Pilihan Hadap mendukung kartu berikon maupun kartu teks.
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
- [ ] USP pilihan masuk ke deskripsi; highlight deskripsi-only dan custom juga masuk.
- [ ] Preview deduplicates highlight dan menjaga batas 2200 karakter.
- [ ] Harga, satuan, Nego, judul, dan deskripsi terisi.
- [ ] **Fill Current Page** tidak berpindah halaman.
- [ ] **Fill & Next** berhenti bila field kritis gagal dan berpindah saat lolos.
- [ ] State helper bertahan saat SPA berpindah antar langkah.
- [ ] Pastikan script tidak pernah mengklik **Simpan Iklan**.
