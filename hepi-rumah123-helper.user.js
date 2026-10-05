// ==UserScript==
// @name         HEPI Rumah123 Helper
// @namespace    https://hepi.local/userscripts
// @version      1.5.3
// @description  Bantu mengisi listing Rumah123 melalui DOM/UI. Tidak pernah menyimpan atau menerbitkan iklan.
// @updateURL    https://raw.githubusercontent.com/SamuelYudiGunawan/rumah123helper/master/hepi-rumah123-helper.user.js
// @downloadURL  https://raw.githubusercontent.com/SamuelYudiGunawan/rumah123helper/master/hepi-rumah123-helper.user.js
// @match        https://www.rumah123.com/*
// @match        https://rumah123.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const VERSION = '1.5.3';

  const CONFIG = {
    storageKey: 'hepi_r123_helper',
    panelId: 'hepi-r123-helper-root',
    timeout: 5000,
    descriptionLimit: 2200,
    maxLogs: 100,
    propertyTypes: ['Rumah', 'Apartemen', 'Tanah', 'Ruko', 'Kost', 'Villa', 'Hotel', 'Pabrik', 'Gudang', 'Perkantoran', 'Ruang Usaha'],
    statuses: ['Baru', 'Second', 'Aset Bank'],
    mainUSP: ['Bisa KPR', 'Siap Huni', 'Bebas Banjir', 'Full Furnished', 'Dekat Akses Tol', 'Dekat Akses Bandara', 'Dekat Akses Pelabuhan', 'Dekat Pusat Perbelanjaan', 'Dekat Sekolah Negeri', 'Dekat Sekolah Internasional', 'Dekat Universitas', 'Dekat Fasilitas Kesehatan'],
    moreUSP: ['Cicilan Bertahap', 'Free Biaya Notaris', 'Over Kredit', 'Dekat Taman Kota', 'Dekat Landmark', 'Dekat Tempat Wisata', 'Dekat Tempat Ibadah', 'Subsidi Angsuran', 'Syariah', 'Take Over', 'Lingkungan Islami', 'Dekat Akses KRL', 'Dekat Akses Transjakarta', 'Dekat Akses Bus Kota', 'Dekat Akses MRT', 'Dekat Akses LRT'],
    highlights: ['Dekat Simpang Lima', 'Dekat UNDIP', 'Dekat UNNES', 'Dekat Bandara Ahmad Yani', 'Dekat Kota Lama'],
    roomFacilities: ['Tempat Jemuran', 'Jalur Telepon', 'Kolam Renang', 'CCTV', 'Taman', 'AC', 'Kolam Ikan', 'Backyard', 'Teras', 'Tempat Cuci'],
    residentialFacilities: ['Keamanan 24 jam', 'Masjid', 'Akses Parkir', 'Taman', 'Kolam Renang', 'CCTV', 'One Gate System', 'Taman Bermain', 'Tempat Laundry', 'Jogging Track'],
    defaults: {
      roadWidth: 'TWO_CAR',
      roomFacilities: ['Teras'],
      roomFacilitiesTouched: true,
      residentialFacilities: ['Akses Parkir'],
      residentialFacilitiesTouched: true,
      selectedUSP: ['Siap Huni', 'Bebas Banjir']
    },
    waterSources: [
      ['', 'Pilih manual'],
      ['PAM_OR_PDAM', 'PAM atau PDAM'],
      ['PUMP', 'Sumur Pompa'],
      ['DRILL', 'Sumur Bor'],
      ['INFILTRATION', 'Sumur Resapan'],
      ['EXCAVATION', 'Sumur Galian']
    ],
    roadWidths: [['', '?'], ['ONE_CAR', '1'], ['TWO_CAR', '2'], ['THREE_CAR', '3'], ['FOUR_CAR', '4']],
    preset: { propertyType: 'Rumah', listingType: 'Jual', propertyStatus: 'Second', province: 'Jawa Tengah', city: 'Semarang', certificate: 'Lainnya', condition: 'Bagus', furnishing: 'Unfurnished', coBroke: false }
  };

  // Area names and city context are derived from the supplied data_area workbook.
  const LOCATION_DIRECTORY = [
    ["DKI Jakarta","Jakarta Selatan","Kebayoran Baru|Mampang Prapatan|Setiabudi|Tebet|Pasar Minggu|Pesanggrahan|Cilandak|Kebayoran Lama|Permata Hijau|Senayan|Sudirman|Ulujami|Kuningan|Menteng Dalam|Gandaria|Cipete|Bangka|Kalibata|Pondok Pinang|Pondok Indah|Jati Padang|Lebak Bulus|Pondok Labu|Ragunan|Tanjung Barat|Ciganjur|Jagakarsa|Lenteng Agung|Cipedak|Kemang|Pejaten|Mampang|Warung Buncit|Pancoran|Manggarai|Gatot Subroto|CBD|Kemandoran|Sinabung|Saharjo|Tanah Kusir|Antasari|Duren Tiga|Bintaro|Kebagusan|Radio Dalam|Patal Senayan|Kapten Tendean|Cinere|Cirendeu|Gudang Peluru|Pondok Karya|Fatmawati|Cassablanca|Petukangan|Ampera|Pakubuwono|Supomo|MT Haryono|Mega Kuningan|TB Simatupang|Sultan Agung|Simprug|Prapanca|Panglima Polim|SCBD|Guntur|Bukit Duri|Terogong|Veteran|Blok S|Praja Dalam|Karet|Wijaya|Pengadegan|Blok M|Senopati|Simprug Garden|Prof. Dr. Satrio|patra kuningan|Sektor 8-Bintaro|Pondok Jaya|Sektor 3 - Bintaro|Sektor 6-Bintaro|Graha Bintaro|Sektor 5-Bintaro|Sektor 2 - Bintaro|Sektor 3A-Bintaro|Sektor 1 -  Bintaro|Rawajati|Cikoko|Cipulir"],
    ["DKI Jakarta","Jakarta Barat","Bandara|Cengkareng|Duri Kosambi|Duri Pulo|Grogol|Joglo|Kalideres|Kebon Jeruk|Kelapa Dua|Kembangan|Mangga Dua|Meruya|Pegadungan|Puri Indah|Tanjung Duren|Tomang|Jelambar|Tamansari|Tambora|Kota|Palmerah|Slipi|Kedoya|Green Ville|Rawa Belong|Kemanggisan|Green garden|Gelong|Jembatan Lima|Angke|Jalan Panjang|Duri Kepa|Mangga Besar|Daan Mogot|S Parman|Asemka|Tubagus Angke|Taman Kencana|Pesanggrahan|Tanjung Gedong|Karang Mulia|Roa Malaka|Jembatan Dua|Jembatan Tiga|Tawakal|Intercon|Green Lake City|Pos Pengumben|Taman Anggrek|Taman Surya|Citra Garden|Jembatan Besi|Srengseng|Taman Kota|Green Mansion|Metro permata|Semanan|Puri Mansion|Bojong Indah|Sunrise Garden|Kapuk Kamal|Kembangan Selatan|Ring Road|Alfa Indah|Kopilas|Kedoya Baru|Kedoya Garden|Mutiara Kedoya|Prima Kedoya|Arjuna Selatan|Kembangan Baru|Puri Media|Bisnis Park|Taman Meruya|Villa Meruya|Arjuna Utara|Central Park|Gelong Baru|Duta Garden|Kav DKI|Kepa Duri|Metland Puri|Taman Ratu|Taman Cosmos|Taman Palem|Permata Buana|Tanjung Duren Utara|Tanjung Duren Selatan|Rawa Buaya|Cengkareng Barat|Kedoya Utara|Kedoya Selatan|Kota Bambu Utara|Kota Bambu Selatan"],
    ["DKI Jakarta","Jakarta Timur","Cawang|Cakung|Cibubur|Cijantung|Cilangkap|Cililitan|Cipayung|Ciracas|Condet|Duren Sawit|Kalimalang|Kalisari|Kampung Rambutan|Kayu Putih|Kramat Jati|Lubang Buaya|Penggilingan|Pondok Bambu|Pondok Kelapa|Pondok Ranggon|Pulo Gadung|Pulogebang|Rawajati|Setu|Taman Mini|Cipinang|Rawamangun|Jatinegara|Klender|Matraman|Pisangan Lama|Utan Kayu|Kayu Jati|Jatiwaringin|Jati Cempaka|Pondok Gede|Pulomas|Pasar Rebo|Otista|Pondok Kopi|Ruko Rawa Lumbu|Kampung Ambon|Buaran|Halim Perdana Kusuma|Dewi Sartika|Pulo Asem|Bambu Apus|Pinang Ranti|Cipinang Melayu|Makasar|Kota Wisata|Legenda Wisata|Kayuringin Jaya|Raffles Hills|Citra Grand"],
    ["DKI Jakarta","Jakarta Utara","Ancol|Cilincing|Dadap|Kamal|Kelapa Gading|Marunda|Muara Baru|Pantai Indah Kapuk|Pluit|Plumpang|Rorotan|Semper|Sunter|Tanjung Priok|Muara Karang|Penjaringan|Pegangsaan|Bandengan|Pantai Mutiara|Teluk Gong|Jembatan Tiga|Pademangan|Kapuk|Kapuk Muara|Pantai Indah Kapuk 2|Golf Island|Koja|Taman Grisenda|Rawa Badak|Kopi Tiang Bendera Roa Malaka"],
    ["DKI Jakarta","Jakarta Pusat","Cempaka Putih|Gunung Sahari|Kemayoran|Kramat|Menteng|Sawah Besar|Tanah Abang|Senen|Roxy|Gajah Mada|Pasar Baru|Cideng|Pegangsaan|Bendungan Hilir|Kebon Sirih|Karet Tengsin|Gondangdia|Salemba|Percetakan Negara|Gambir|Hasyim Ashari|Hayam Wuruk|Pangeran Jayakarta|Karang Anyar|Kartini|Glodok|Kebon Kacang|Bedungan Jatiluhur|Wahid Hasyim|CBD Area|Johar Baru|Bungur|Batutulis|Kebon Melati|Sumur Batu|Menteng Atas|Senayan|Pinangsia|Thamrin|Pejompongan|KH Mas Mansyur|Samanhudi|Tambak Pegangsaan|Petojo|Batu Ceper|Harmoni|Cempaka Mas|Cikini"],
    ["DKI Jakarta","Kepulauan Seribu","Pulau Tidung|Kepulauan Seribu Utara|Kepulauan Seribu Selatan|Pulau Pelangi"],
    ["Jawa Barat","Bekasi","Harapan Indah|Kaliabang|Pondok Ungu|Medan Satria|Harapan Jaya|Perwira|Satriajaya|Bintara|Kranji|Bekasi|Duren Jaya|Setiamekar|Jatiwaringin|Jatibening|Cikunir|Pekayon|Sepanjang Jaya|Margahayu|Jatimulya|Jatimakmur|Jatikramat|Jati Rasa|Rawalumbu|Mustikasari|Jatiwarna|Kemang Pratama|Harapan Baru|Kota Legenda|Karang Baru|Sukapura|Cikarang|Cibitung|Caman|Serang Cibarusah|Kalimalang|Jababeka|Narogong|Jati Asih|Jaka Setia|Prima Harapan|Jaka Permai|Jaka Sampurna|Mutiara Baru|Jati Sari|Galaxy|Babelan|Jatisampurna|Rawa Panjang|Bekasi Timur|Tanah Tinggi|Mekar Jaya|Duta Harapan|Arjuna|Setu|Cikiwul|Pulo Permata Sari|Bumi Pala|Jati Rahayu|Jati Agung|Jatiranggon|Pulo Ribung|Cibubur|Kayuringin Jaya|Jaka Kencana|Kartini|Pejuang|Pondok Gede|Bekasi Kota|Bekasi Utara|Cabang Bungin|Cibarusa|Cikarang Selatan|Cikarang Utara|Karangbahagia|Kedungwaringin|Mustikajaya|Pebayuran|Pondokmelati|Serang Baru|Sukakarya|Sukatani|Sukawangi|Tambelang|Tambun Selatan|Tambun Utara|Tarumajaya|Komsen|Pedurenan|Jaka Mulya|Summarecon Bekasi|Harapan Mulya|Jati Mekar|Jati Luhur|Jatikarya|Jatiraden|Cimuning|Padurenan|Jati Cempaka|Genteng|Taman Galaxy|Bekasi Barat|Lemah Abang|Golden City|Benteng|Telukpucung|Kebalen|Bantar Gebang|Cut Mutia|Mauk|Bojongmanggu|Muara Gembong|Jatimurni|Jatirangga|Grand Wisata|Cikokol|Nusa Loka|Tanjung Pasir|Jatimelati|Karang Satria|Niaga Kalimas|Delta Mas"],
    ["Jawa Barat","Depok","Babadan|Ciangsana|Cinangka|Cinere|Cisalak|Iwul|Jambonmekar|Kelapa Dua|Limo|Mekarsari|Rangkapanjaya|Sawangan|Tirtajaya|Tugu|Cimanggis|Tanah Baru|Sumur Batu|Margonda|Sukmajaya|Beji|Kalimanggis|Cibubur|Harjamukti|Sukatani|Depok II|Pancoran Mas|Gandul|Pangkalan Jati|Kukusan|Tapos|Pasir Putih|Bojong Sari|Citayam|Cilangkap|Studio Alam|Cilodong|Cipayung|Krukut"],
    ["Jawa Barat","Bogor","Gunung Sindur|Curug|Cikeas|Harjamukti|Kota Wisata|Limusnunggal|Parung|Bojongsari|Sukamaju|Sukatani|Leuwinanggung|Legenda Wisata|Cileungsi|Semplak|Kedungwaringin|Kedungbadak|Cibuluh|Pasirlaja|Citaringgul|Sindang Barang|Cilendek|Bantar Jati|Tanah Baru|Bukit Sentul|Ciomas|Pasir Kuda|Karang Tengah|Bondongan|Katulampa|Sukaraja|Cijayanti|Bogor Utara|Ciawi|Tanah Sareal|Cibodas|Sentul|Bogor Selatan|Kranggan|Tajur|Gunung Putri|Cipanas|Sentul City|Cisarua|Bogor Barat|Jonggol|Cibinong|Rancamaya|Panaragan|Cigombong|Cimanggu|Puncak|Cibubur|Bogor Tengah|Laladon|Cimahpar|Taman Kencana|Ciapus|Cilebut|Babakan Madang|Bogor Timur|Bojong Gede|Caringin|Cariu|Ciampea|Cibungbulang|Cigudeg|Cijeruk|Ciseeng|Citeureup|Dramaga|Jasinga|Kemang|Klapanunggal|Leuwiliang|Leuwisadeng|Megamendung|Nanggung|Pamijahan|Parung Panjang|Ranca Bungur|Rumpin|Sukajaya|Sukamakmur|Tajur Halang|Tamansari|Tanjungsari|Tenjo|Tenjolaya|Pajajaran|Cipaku|Cipayung|Cibulan|Ciangsana|Bojong Kulur|Gadog|Cimande|Pasir Muncang|Veteran|Bojong|Tapos|Batutulis|Babakan Pasar|Balumbang Jaya|Bojong Kerta|Cibogor|Cikaret|Cilendek Barat|Ciluar|Ciparigi|Ciwaringin|Curug Mekar|Empang|Gudang|Gunung Batu|Harjasari|Kedung Halang|Kertamaya|Lawanggintung|Loji|Margajaya|Muara Sari|Mulyaharja|Pabaton|Pakuan|Paledang|Pamoyanan|Pasir Jaya|Pasirmulya|Rangga Mekar|Sempur|Sindang Sari|Sukasari|Tegal Gundi|Tegallega|Situ Gede|Babakan|Ahmadyani|Wanaherang|Bubulak|Ciakret|Cilendek Timur|Genteng|Kebon Kelapa|Prabatoa|Duta Pakuan|Jl A Yani|Ardio|Bogor Nirwana Residence|Sinang Barang|Jl Dr Semeru|Indraprasta|Baranangsiang|Tegal Gundil|Cimacan"],
    ["Jawa Barat","Cikarang","Lippo Cikarang|Cikarang Utara|Serang Cibarusah"],
    ["Jawa Barat","Bandung","Pasir Koja|Geger Kalong|Setiabudi|Diponegoro|Pasir Kaliki|Cimindi|Cigadung|Cipedes|Sarijadi|Setra Indah|Kopo|Cikalong Wetan|Gede Bage|Ciumbuleuit|Dago|Parongpong|Lembang|Setra Sari|Batununggal|Jatinangor|Ciwastra|Salatiga|Cimahi|Buah Batu|Setra Duta|Soekarno Hatta|Gatot Subroto|Surya Sumantri|Cibaduyut|Lombok|Turangga|Wastukencana|Sudirman|Holis Cigondewah|Otista|Gunung Batu|Kopo Permai|Sayap Dago|Riau|Pinus|Garuda|Cikutra|Pungkur|Cihampelas|Veteran|Mekar Wangi|Asia Afrika|Caringin|Pasteur|Cicaheum|Soreang|Margahayu|Cijagra|Pasir Luyu|Setra Murni|Antapani|Leuwi Panjang|Arcamanik|Ciateul|Suniaraja|Pajajaran|Braga|Laswi|Arjasari|Astanaanyar|Babakanciparay|Baleendah|Bandung Kidul|Bandung Kulon|Bandung Wetan|Banjaran|Bojongloa|Bojongsoang|Cangkuang|Cibeunying Kidul|Cibiru|Cicadas|Cicalengka|Cicendo|Cidadap|Cikancung|Cilengkrang|Cileunyi|Cimaung|Cimenyan|Ciparay|Ciwidey|Coblong|Dayeuhkolot|Katapang|Kertasari|Kiaracondong|Kutawaringin|Lengkong|Majalaya|Margaasih|Margacinta|Nagreg|Pacet|Pameungpeuk|Pangalengan|Paseh|Pasirjambu|Rancabali|Rancaekek|Rancasari|Regol|Solokan Jeruk|Sukajadi|Sukasari|Sumurbandung|Ujungberung|Batujajar|Cililin|Cipatat|Cipeundeuy|Cipongkor|Cisarua|Gununghalu|Ngamprah|Padalarang|Rongga|Sindangkerta|Baturaden|Kota Baru Parahyangan|Sukahaji|Cibeureum|Kebon Kawung|Bandung Selatan|Bandung Timur|Cipaku|Dadali|Cijerah|Bandung Barat|Gardu Jati|Cibogo|Sariwangi|Hegarmanah|Cihanjuang|Pondok Hijau|Tubagus Ismail|Cibeunying|Mandalajati|Bojongloa Kidul|Cigondewah|Bandung Utara|Sukaluyu|Awiligar|Supratman|BKR|Padasuka|Surapati|Suci|panyileukan|Peta|Kosambi|Muara|Pelajar Pejuang|Terusan Buah Batu|Tegalega|Andir|Derwati|Moch Toha|Taman Kopo Indah|Burangrang|Bandung Kota|Rancamanyar|Summarecon Bandung|Podomoro Park Bandung|Dago Pakar|Singgasana|Kebonjati|Cipaganti|Talaga Bodas"],
    ["Jawa Barat","Banjar","Tanggerang|Banjar|Langensari|Pataruman|Lingkar Selatan|Kertak Hanyar|Gambut|Martapura|Purwaharja"],
    ["Jawa Barat","Ciamis","Banjarsari|Cidolog|Cigugur|Cihaurbeuti|Cijeungjing|Cijulang|Cikoneng|Cimaragas|Cimerak|Cipaku|Cisaga|Jatinagara|Kalipucang|Kawali|Lakbok|Langkaplancar|Padaherang|Pamarican|Panawangan|Pangandaran|Panjalu|Panumbangan|Parigi|Rajadesa|Rancah|Sadananya|Sidamulih|Sukadana|Tambaksari|Baregbeg|Ciamis Kota|Sindangkasih"],
    ["Jawa Barat","Cianjur","Cipanas|Ciherang|Pacet|Cipendawa|Cianjur|Agrabinta|Bojongpicung|Campaka Mulya|Campaka|Cibeber|Cidaun|Cijati|Cikadu|Cikalongkulon|Cilaku|Ciranjang|Cugenang|Gekbrong|Kadupandak|Karangtengah|Mande|Naringgul|Pagelaran|Sindangbarang|Sukaluyu|Sukanagara|Sukaresmi|Takokak|Tanggeung|Warungkondang|Cianjur Kota|Leles"],
    ["Jawa Barat","Cimahi","Leuwi Gajah|Cimahi Selatan|Cimahi Tengah|Cimahi Utara"],
    ["Jawa Barat","Cirebon","Sindang Laut|Arjawinangun|Astanajapura|Babakan|Beber|Ciledug|Cirebon Selatan|Cirebon Utara|Ciwaringin|Depok|Dukupuntang|Gebang|Gegesik|Gempol|Harjamukti|Kaliwedi|Kapetakan|Karangsembung|Karangwareng|Kedawung|Kejaksan|Kesambi|Klangenan|Lemahabang|Lemahwungkuk|Losari|Mundu|Pabedilan|Pabuaran|Palimanan|Pangenan|Panguragan|Pasaleman|Pekalipan|Plered|Plumbon|Sedong|Sumber|Susukan|Susukanlebak|Tengah Tani|Waled|Weru|Kanci|Argasunya|Kalijaga|Kecapi|Kebonbaru|Kesenden|Sukapura|Drajat|Panjunan|Pengambiran|Jagasatru|Pekalangan|Pulasaren|Gunungjati|Tuparev|Karyamulya|Sutawinangun|Kertawinangun|Tuk|Perumnas|Larangan|Cirebon Kota|Talun|Cirebon Timur|Cirebon Barat"],
    ["Jawa Barat","Garut","Balubur Limbangan|Banjarwangi|Banyuresmi|Bayongbong|Bungbulang|Caringin|Cibalong|Cibatu|Cibiuk|Cigedug|Cihurip|Cikajang|Cikelet|Cilawu|Cisewu|Cisompet|Cisurupan|Garut Kota|Kadungora|Karangpawitan|Karangtengah|Kersamanah|Leles|Leuwigoong|Malangbong|Mekarmukti|Pakenjeng|Pameungpeuk|Pamulihan|Pangatikan|Pasirwangi|Peundeuy|Samarang|Selaawi|Singajaya|Sucinaraja|Sukaresmi|Sukawening|Talegong|Tarogong Kaler|Tarogong Kidul|Wanaraja|Bl. Limbangan"],
    ["Jawa Barat","Indramayu","Anjatan|Arahan|Balongan|Bangodua|Bongas|Cantigi|Cikedung|Gabuswetan|Gantar|Haurgeulis|Jatibarang|Kandanghaur|Karangampel|Kertasemaya|Krangkeng|Kroya|Lelea|Lohbener|Losarang|Sindang|Sliyeg|Sukagumiwang|Sukra|Widasari|Indramayu Kota|Patrol|Juntiyuat|Kedokan Bunder|Trisi"],
    ["Jawa Barat","Karawang","Klari|Banyusari|Batujaya|Ciampel|Cibuaya|Cikampek|Cilamaya Kulon|Cilamaya Wetan|Cilebar|Jatisari|Jayakerta|Karawang Barat|Karawang Timur|Kotabaru|Kutawaluya|Lemahabang|Majalaya|Pakisjaya|Pangkalan|Pedes|Purwasari|Rawamerta|Rengasdengklok|Talagasari|Tegalwaru|Telukjambe Barat|Telukjambe Timur|Telukjambe|Tempuran|Tirtamulya|Kota Baru|Tirtajaya"],
    ["Jawa Barat","Kuningan","Ciawigebang|Cibeureum|Cibingbin|Cidahu|Cigugur|Cilebak|Cilimus|Cimahi|Ciniru|Cipicung|Ciwaru|Darma|Garawangi|Hantara|Jalaksana|Japara|Kadugede|Kalimanggis|Karangkancana|Kramatmulya|Kuningan|Lebakwangi|Luragung|Maleber|Nusaherang|Pancalang|Pasawahan|Selajambe|Sindangagung|Subang|Ancaran|Purwawinangun|Cigandamekar|Mandirancan"],
    ["Jawa Barat","Majalengka","Argapura|Banjaran|Bantarujeg|Cigasong|Cikijing|Cingambul|Dawuan|Jatitujuh|Jatiwangi|Kadipaten|Kertajati|Lemahsugih|Leuwimunding|Ligung|Maja|Palasah|Panyingkiran|Rajagaluh|Sindangwangi|Sukahaji|Sumberjaya|Talaga|Majalengka Kota"],
    ["Jawa Barat","Purwakarta","Cikampek|Cipularang|Sadang|Babakancikao|Bojong|Bungursari|Campaka|Cibatu|Darangdan|Jatiluhur|Kiarapedes|Maniis|Pasawahan|Plered|Pondoksalam|Sukasari|Sukatani|Tegalwaru|Wanayasa|Purwakarta Kota"],
    ["Jawa Barat","Subang","Pamanukan|Binong|Blanakan|Ciasem|Cibogo|Cijambe|Cikaum|Cipeundeuy|Cipunagara|Cisalak|Compreng|Jalan Cagak|Kalijati|Pabuaran|Pagaden|Patok Beusi|Purwadadi|Pusakanagara|Sagalaherang|Tanjung Siang|Ciater|Subang Kota|Serangpanjang|Legon Kulon"],
    ["Jawa Barat","Sukabumi","Surade|Parung Kuda|Kota Sukabumi|Suryakencana|Salabintana|Bantargadung|Baros|Bojong Genteng|Caringin|Cibadak|Cibeureum|Cibitung|Cicantayan|Cicurug|Cidadap|Cidahu|Cidolog|Ciemas|Cikakak|Cikembar|Cikidang|Cikole|Ciracap|Cireunghas|Cisaat|Cisolok|Citamiang|Curugkembar|Gegerbitung|Gunung Guruh|Gunung Puyuh|Jampang Kulon|Jampang Tengah|Kabandungan|Kadudampit|Kalapa Nunggal|Kalibunder|Kebonpedes|Lembursitu|Lengkong|Nagrak|Nyalindung|Pabuaran|Parakan Salak|Pelabuhan Ratu|Purabaya|Sagaranten|Simpenan|Sukalarang|Sukaraja|Tegal Buleud|Waluran|Warudoyong|Warung Kiara|Cipanas|Ciaul Pasir"],
    ["Jawa Barat","Sumedang","Buahdua|Cibugel|Cimalaka|Cimanggu|Cisarua|Cisitu|Conggeang|Darmaraja|Jatigede|Jatinangor|Jatinunggal|Pamulihan|Paseh|Rancakalong|Situraja|Sukasari|Sumedang Selatan|Sumedang Utara|Surian|Tanjungkerta|Tanjungmedar|Tanjungsari|Tomo|Ujung Jaya|Wado|Ganeas"],
    ["Jawa Barat","Tasikmalaya","Bantarkalong|Bojong Asih|Bojonggambir|Ciawi|Cibalong|Cibeureum|Cigalontang|Cihideung|Cikalong|Cikatomas|Cineam|Cipatujah|Cipedes|Cisayong|Culamega|Gunungtanjung|Indihiang|Jamanis|Jatiwaras|Kadipaten|Karang Jaya|Karangnunggal|Kawalu|Leuwisari|Mangkubumi|Mangunreja|Manonjaya|Padakembang|Pagerageung|Pancatengah|Parungponteng|Puspahiang|Rajapolah|Salawu|Salopa|Sariwangi|Singaparna|Sodonghilir|Sukahening|Sukaraja|Sukarame|Sukaratu|Sukaresik|Tamansari|Tanjungjaya|Taraju|Tawang|Sukalaya"],
    ["Jawa Barat","Cikampek","Cikampek"],
    ["Jawa Barat","Bandung Barat","Batujajar|Cihampelas|Cikalongwetan|Cililin|Cipatat|Cipongkor|Cisarua|Lembang|Parongpong|Ngamprah|Saguling"],
    ["Jawa Barat","Pangandaran","Cigugur|Cijulang|Cimerak"],
    ["Jawa Barat","Kabupaten Bandung","Pacet"],
    ["Banten","Tangerang","Babakan|Batu Sari|Bojong Nangka|BSD City|Ciater|Cibogo|Cihuni|Cikokol|Cimone|Cipondoh|Cireundeu|Gading Serpong|Jatake|Jelupang|Kademangan|Kadu|Karang Tengah|Kedaung|Kelapa Dua|Kotabumi|Kunciran|Larangan|Lengkong Kulon|Lippo Karawaci|Parigi|Pasir Jaya|Periuk|Petir|Pondok Benda|Pondok Betung|Pondok Cabe|Pondok Jagung|Pondok Pucung|Pondok Ranji|Rawakalong|Rempoa|Serua|Setra Jaya|Sudimara|Suradita|Tajur|Tanah Tinggi|Tangerang|Tanjungsari|Ciledug|Malabar|Balaraja|Cipadu|Alam Sutera|Dadap|Legok|Kampung Utan|Gatot Subroto|Cikupa|Jurumudi|Pondok Karya|BSD|Karawaci|Banjar Wijaya|Pasar Kemis|Juanda|Cibodas|Pengasinan|Curug|Cukang Galih|A Yani|Tanjung Pasir|Bakti Jaya|Batu Ceper|Taman Royal|Benda|Cisauk|Cisoka|Jambe|Kosambi|Kresek|Mauk|Neglasari|Pagedangan|Pakuhaji|Panongan|Pinang|Rajeg|Permata Medang|Mabad|Gandasari|Bitung|Daan Mogot|Poris|Sindang Jaya|Metro Permata|Pesanggrahan|Kel Gerendeng|Graha Raya|Taman Elok Lippo|BSD Anggrek Loka|BSD Banjar Wijaya|BSD Bukit Golf|BSD Castilla|BSD De Park|BSD Delatinos|BSD Duta Bintaro|BSD Eminent|BSD Foresta|BSD Griya Loka|BSD Giri Loka|BSD Golden Viena|BSD Green Cove|BSD Graha Raya|BSD Green Wich|BSD Ingenia|BSD Kencana Loka|BSD Natura|BSD Neo Catalonia|BSD Nusaloka|BSD Pavillion Residence|BSD Provance Parkland|BSD Puspita Loka|BSD Residence One|BSD Sevilla|BSD Taman Edelweis|BSD Taman Crysant|BSD Taman Fortuna|BSD Taman Giri Loka|BSD Taman Provence|BSD Taman Royal|BSD Telaga Golf|BSD The Green|BSD Vermont|BSD Victoria Park Lane|BSD Virginia Lagoon|Sutera Onix Alam Sutera|Sutera Jingga Alam Sutera|Sutera Sitara Alam Sutera|Sutera Buana Alam Sutera|Cikupa Citra Raya|Citra Maja Raya|BSD The Icon|BSD Avani|Gading Serpong Pondok Hijau Golf|Gading Serpong Scientia Garden|Gading Serpong The Spring|Gading Serpong Andalucia|Gading Serpong IL Lago|Gading Serpong L Agricola|Gading Serpong Serenade Lake|Gading Serpong Samara Village|Gading Serpong Cluster Bohemia|Gading Serpong Cluster Lavender|Gading Serpong Cluster Michelia|Gading Serpong Cluster IL Rosa|Gading Serpong Cluster Oleaster|Gading Serpong Karelia Village|Gading Serpong Elista Village|Gading Serpong Omaha Village|Gading Serpong Montana Village|Gading Serpong Virginia Village|Gading Serpong La Bella Village|Sektor 1A-Gading Serpong|Sektor 1B-Gading Serpong|Sektor 1C-Gading Serpong|Sektor 1D-Gading Serpong|Sektor 1E-Gading Serpong|Sektor 1G-Gading Serpong|Sektor 6-Gading Serpong|Sektor 7A/B-Gading Serpong|Sektor 7C-Gading Serpong|Sektor 8-Gading Serpong|Tigaraksa|Solear|BSD Vanya Park|BSD The Savia|BSD Alegria|BSD Komersial Area|Suvarna Sutera|Cibatu|Cibitung|Jurangmangu|Pakujaya|Sangiang Jaya|Sukabakti|Wangunharja|Modernland|Jend Sudirman|Cirarab|Duta Garden|Raya Serang|Jati Uwung|Kreo|Jayanti|Kemiri|Kronjo|Sepatan|Sukadiri|Teluk Naga|Jombang|Royal Serpong Village|Tangerang Kota"],
    ["Banten","Cilegon","Cilegon Indah|Pelabuhan Ratu|Citangkil|Ciwandan|Gerogol|Jombang|Pulo Merak|Purwakarta|jombang wetan|Cibeber"],
    ["Banten","Lebak","Banjarsari|Bayah|Bojongmanik|Cibadak|Cibeber|Cijaku|Cikulur|Cileles|Cilograng|Cimarga|Cipanas|Curugbitung|Gunungkencana|Leuwidamar|Maja|Malingping|Muncang|Panggarangan|Rangkasbitung|Sajira|Sobang|Wanasalam|Warunggunung|Cigemlong|Cihara|Cirinten"],
    ["Banten","Pandeglang","Panimbang|Panimbang Jaya|Angsana|Banjar|Bojong|Cadas Sari|Carita|Cibaliung|Cibitung|Cigeulis|Cikedal|Cikeusik|Cimanggu|Cimanuk|Cisata|Jiput|Kaduhejo|Karangtanjung|Labuan|Mandalawangi|Menes|Munjul|Pagelaran|Pandeglang|Patia|Picung|Saketi|Sukaresmi|Sumur|Tanjung Lesung|Cipeucang"],
    ["Banten","Serang","Serang Timur|Kidang Cipare|Serang|Cikande|Ciracas|Anyar|Baros|Binuang|Bojonegara|Carenang|Cikeusal|Cinangka|Ciomas|Cipocok Jaya|Ciruas|Curug|Jawilan|Kasemen|Kibin|Kopo|Kragilan|Kramatwatu|Mancak|Pabuaran|Padarincang|Pamarayan|Petir|Pontang|Puloampel|Taktakan|Tanara|Tirtayasa|Tunjung Teja|Walantaka|Waringinkurung|Pagelaran Labuan|Bandung|Terondol|Cimuncang|Cipare|Kaligandu|Kotabaru|Kagungan|Lontarbaru|Lopang|Sukawana|Sumurpecung|Unyur"],
    ["Banten","Anyer","Anyer"],
    ["Banten","Tangerang Selatan","Bintaro|Pamulang|Serpong|Pondok Aren|Sektor 7-Bintaro|Sektor 9-Bintaro|Ciputat|Ciputat Timur|Setu|Serpong Regency Melati Mas|Serpong Villa Melati Mas|Serpong Utara|Serpong Regency Melati Mas 2|Graha Raya"],
    ["Bali","Badung","Kerobokan|Klungkung|Nusa Dua|Kartika Plaza|Legian|Ungasan|Canggu|Dewi Sri|Jimbaran|Ngurah Rai|Puri Gading|Pesanggaran|Uluwatu|Sunset Road|Kuta|Benoa|Dalung|Kedonganan|Kerobokan Kaja|Kerobokan Kelod|Pecatu|Seminyak|Baha|Gulingan|Kapal|Kekeran|Lukluk|Mengwi|Mengwitani|Munggu|Penarungan|Sading|Sembung|Sempidi|Sobangan|Werdibhuana|Abiansemal|Angantaka|Ayunan|Bongkasa|Blahkiuh|Darmasaba|Dauhyehcani|Jagapati|Mambal|Punggul|Sedang|Sibang Gede|Sibang Kaja|Taman|Belok|Carangsari|Pelaga|Persiapan Pangsan|Persiapan Sulangai|Petang|Tanjung Benoa|Tibubeneng|Tuban|Sangeh|Sibangkaja|Goa Gong|Cemagi|Pererenan|Petitenget|Umalas|Bukit|Lombok|Balangan|Kuta Selatan|Taman Griya|Gunung Salak|Kuta Utara|Tundun Penyu|Nyanyi|Mumbul|Semer|Batu Belig"],
    ["Bali","Bangli","Abuan|Demulih|Penglumbaran|Sulahan|Susut|Tiga|Bebalang|Bunutin|Kawan|Kayubihi|Pengotan|Tamanbali|Bangbang|Jehem|Peninjoan|Tembuku|Undisan|Yangapi|Abangsongan|Abangtudinding|Awan|Bantang|Batukaang|Batur Selatan|Batur Tengah|Batur Utara|Bayungcerik|Bayunggede|Belancan|Belandingan|Belanga|Belatih|Bonyo|Catur|Daup|Dausa|Gunungbau|Katung|Kedisan|Kintamani|Kutuh|Langgahan|Lembean|Mangguh|Manikliyu|Mengani|Pengejaran|Pinggan|Sekaan|Sekardadi|Selulung|Serahi|Siakin|Songan A|Songan B|Subaya|Sukawana|Suter|Trunyan|Ulian|Banyan"],
    ["Bali","Buleleng","Banyupoh|Celukanbawang|Gerokgak|Musi|Patas|Pejarakan|Pemuteran|Pengulon|Penyabangan|Sanggalangit|Sumberkelampok|Sumberkimia|Tinga tinga|Tukadsumaga|Banjarasem|Bestala|Bubunan|Gunungsari|Joanyar|Kalianget|Kalisada|Kalopaksa|Mayong|Munduk Bestala|Pangkungparuk|Patemon|Pengastulan|Rangdu|Ringdikit|Seririt|Sulanyah|Tangguwisia|Ularan|Umeanyar|Unggahan|Bengkel|Bongancina|Busungbiu|Kedis|Kekeran|Pelapuan|Puncaksari|Senganan|Sepang Kelod|Subuk|Telaga|Tinggarsari|Titab|Umejero|Banjar|Banjartegehe|Banyuatis|Banyuseri|Cempaga|Dencarik|Gesing|Gobleg|Kaliasem|Kayuputih|Munduk|Pedawa|Sidetapa|Tampekan|Temukus|Tigawasa|Tirtasari|Ambengan|Gitgit|Padangbulia|Pancasari|Panji|Panjianom|Pegayaman|Sambangan|Silangjana|Sukasada|Wanagiri|Alasangker|Anturan|Astina|Baktiseraga|Banjarbali|Banjarjawa|Banjartegal|Banyuasri|Banyuning|Beratan|Jinengdalem|Kalibubuk|Kaliuntu|Kampunganyar|Kampungbaru|Kampungkajanan|Kendran Penataran|Kampungsingaraja|Liligundi|Nagasepaha|Paketagung|Pemaron|Penarukan|Penglatan|Petandakan|Pohbergong|Sarimekar|Tukadmungga|Bebetin|Bungkulan|Galungan|Jagaraga|Lemukih|Menyali|Sangsit|Sawan|Sekumpul|Sinabun|Sudaji|Bengkala|Bila|Bontihing|Bukti|Bulian|Kubutambahan|Pakisan|Tajun|Tambakan|Tamblang|Tunjung|Bondalem|Julah|Les|Madenan|Pacung|Penuktukan|Sambirenteng|Sembiran|Tejakula|Tembok|Singaraja|Lovina|Suwung|Depeha"],
    ["Bali","Denpasar","Renon|Dalung Permai|Sanur|Gatot Subroto|Panjer|Pedungan|Sanur Kaja|Sanur Kauh|Serangan|Sesetan|Sidakarya|Danginpuri|Danginpuri Kaja|Danginpuri Kangin|Danginpuri Kauh|Danginpuri Kelod|Kesiman|Penatih|Penatihdanginpuri|Sumerta|Sumerta Kaja|Sumerta Kauh|Sumerta Kelod|Tonja|Dauhpuri|Dauhpuri Kaja|Dauhpuri Kangin|Dauhpuri Kauh|Dauhpuri Kelod|Padangsambian|Padangsambian Kaja|Padangsambian Kelod|Peguyangan|Peguyangan Kaja|Peguyangan Kangin|Pemecutan|Pemecutan Kaja|Pemecutan Kelod|Tegalkertha|Ubung|Ubung Kaja|Pemogan|Padang Sumbu|Pesanggaran|Mahendradata|Padang Griya|Gelogor Carik|Gunung soputan|Denpasar Utara|Denpasar Timur|Denpasar Selatan|Denpasar Barat|Suwung|Padanggalak"],
    ["Bali","Gianyar","Pantai Lebih|Ketewel|Ubud|Batuan|Batuan Kaler|Batubulan|Batubulan Kangin|Celuk|Guwang|Kemenuh|Singapadu|Singapadu Kaler|Singapadu Tengah|Sukawati|Bedulu|Belege|Blahbatuh|Bona|Buruan|Keramas|Medahan|Pering|Saba|Abianbase|Bakbakan|Beng|Bitera|Gianyar|Lebih|Petak|Petak Kaja|Samplangan|Serongga|Siangan|Suwat|Temesi|Tulikup|Manukaya|Pejengkawan|Sanding|Tampaksiring|Pejeng|Pejeng Kaja|Pejeng Kangin|Pejeng Kelod|Kedewatan|Mas|Peliatan|Petulu|Sayan|Singekerta|Kedisah|Keliki|Kenderan|Pupuan|Sebatu|Taro|Tegallalang|Buahan|Bukian|Kelusa|Kerta|Melinggih|Melinggih Kelod|Puhu|Lodtunduh|Sanggingan|Sedan|Antiga|Gegelang|Manggis|Ngis|Nyuhtebel|Padangbai|Laplapan|Payangan|Cucukan"],
    ["Bali","Jembrana","Blimbingsari|Candikesuma|Ekasari|Gilimanuk|Manistutu|Melaya|Nusasari|Tukadaya|Tuwed|Warnasari|Airkuning|Balerbaleagung|Baluk|Banjar Tengah|Banyubiru|Batuagung|Berangbang|Budeng|Cupel|Dangintukadaya|Dauhwaru|Kaliakah|Lelateng|Loloan Barat|Loloan Timur|Pangambengan|Pendem|Perancak|Sangkaragung|Tegalbadeng Barat|Tegalbadeng Timur|Yehkuning|Mendoyo Dangintukad|Mendoyo Dauhtukad|Penyaringan|Pergung|Pohsanten|Tegalcangkring|Yehembang|Yehembang Kangin|Yehembang Kauh|Yehsumbul|Asahduren|Gumbrih|Manggissari|Medewi|Pangeragoan|Pangyangan|Pekutatan|Pulukan|Negara|Delodberawah"],
    ["Bali","Karangasem","Besakih|Menanga|Nongan|Pempatan|Pesaban|Rendang|Sangkangunung|Sidemen|Talibeng|Tangkup|Antiga|Gegelang|Manggis|Ngis|Nyuhtebel|Padangbai|Selumbung|Tenganan|Ulakan|Bugbug|Bukit|Padangkerta|Pertima|Seraya|Seraya Barat|Seraya Timur|Subagan|Tegallinggah|Tumbu|Ababi|Abang|Bunutan|Culik|Datah|Kerthamandala|Labasari|Pidpid|Purwakerthi|Tista|Tiyingtali|Bebandem|Budakeling|Bungaya|Bungaya Kangin|Jungutan|Sibetan|Duda|Duda Timur|Duda Utara|Muncan|Sebudi|Selat|Ban|Baturinggit|Dukuh|Kubu|Sukadana|Tianyar|Tianyar Barat|Tianyar Tengah|Tulamben|Candi Dasa|Amed"],
    ["Bali","Tabanan","Tanah Lot|Antap|Antosari|Bajera|Bantas|Beraban|Berembeng|Dalang|Gadungan|Gunungsalak|Lalanglinggah|Lumbung|Lumbung Kauh|Mambang|Megati|Mundeh|Mundeh kangin|Pupuansawah|Selemadeg|Serampingan|Tangguntiti|Tegalmengkeb|Tiyinggading|Belumbang|Kelating|Kerambitan|Tibubiyu|Batuaji|Baturiti|Kesiut|Kukuh|Meliling|Pangkungkarung|Samsam|Sembunggede|Timpag|Bongan|Dajanpeken|Dauhpeken|Delodpeken|Denbantas|Gubug|Subamia|Tunjuk|Wanasari|Abiantuwung|Banjaranyar|Belalang|Buwit|Cepaka|Kaba kaba|Kediri|Nyambung|Nyitdah|Pandakbandung|Pandakgede|Batannyuh|Beringkit|Caubelayu|Kuwum|Marga|Payangan|Peken|Petiga|Selanbawak|Tegaljadi|Angseri|Antapan|Apuan|Bangli|Batunya|Candikuning|Luwus|Perean|Perean tengah|Babahan|Biaung|Jatiluwih|Jegu|Penatahan|Penebel|Pitra|Rejasa|Rianggede|Tengkudak|Wongayagede|Bantiran|Batungsel|Belatungan|Belimbing|Kebonpadangan|Munduktemu|Pajahan|Pujungan|Sanda|Klecung|Yeh Leh|Pangkutibah|Tua|Mengesta|Blayu|Soka|Bedugul"],
    ["Bali","Semarapura","Sakti|Aan|Bakas|Banjarangkan|Bungbungan|Getakan|Takmung|Tihingan|Timuhun|Tusan|Akah|Gelgel|Jumpai|Kamasan|Kampunggegel|Satra|Semarapura Kaja|Semarapura Kangin|Semarapura Kauh|Semarapura Kelod|Semarapura Kelod Kangin|Semarapura Tengah|Tangkas|Tegak|Tojan|Dawan Kaler|Dawan Kelod|Gunaksa|Kampungislamkusamba|Paksebali|Pesinggahan|Pikat|Sampalan Kelod|Sampalan Tengah|Sulang|Nusa Penida|Batukandik|Batumadeg|Bungamekar|Jungutbatu|Klumbu|Kutampi|Lembongan|Ped|Pejukutan|Sekartaji|Sauna|Tanglad|Toyopakeh|Negari|Nyalian|Nyanglan|Tohpati|Manduang|Selisihan|Besan|Kusamba"],
    ["Bali","Nusa Lembongan","Klungkung"],
    ["Bali","Klungkung","Nusa Penida|Banjarankan|Klungkung Kota|Dawan"],
    ["Kepulauan Bangka Belitung","Bangka","Sungailiat|Mendo Barat|Riau Silip"],
    ["Kepulauan Bangka Belitung","Bangka Selatan","Toboali|Tukak Sadai"],
    ["Kepulauan Bangka Belitung","Bangka Tengah","Koba|Lubuk|Namang|Pangkalan Baru|Simpang Katis|Sungai Selan"],
    ["Kepulauan Bangka Belitung","Pangkal Pinang","Pangkal Balam|Rangkui|Taman Sari|Bukit Intan|Gabek|Jend Sudirman|Gerunggang"],
    ["Kepulauan Bangka Belitung","Belitung","Sijuk|Tanjung Pandan|Badau|Kelapa Kampit|Manggar|Gantung|Dendang|Membalong|Selat Nasik|Tanjung Tinggi"],
    ["Bengkulu","Bengkulu","Kampung Melayu|Muara Bangkahulu|Selebar|Sungai Serut|Teluk Segara|Singaran Pati|Ratu Agung|Ratu Samban"],
    ["Bengkulu","Bengkulu Selatan","Kedurang|Kota Manna|Manna|Pino|Pinoraya|Seginim|Arga Makmur|Enggano|Karang Tinggi|Talang Empat|Air Nipis|Bunga Mas|Air Besi|Air Napal|Batik Nau|Giri Mulia"],
    ["Bengkulu","Bengkulu Utara","Kerkap|Ketahun|Padang Jaya|Pondok Kelapa|Putri Hijau|Taba Penanjung|Air Padang|Arma Jaya|Napal Putih|Pagar Jati|Pematang Tiga"],
    ["Bengkulu","Kaur","Kinal|Nasal|Kaur Selatan|Kaur Tengah|Kaur Utara|Maje|Tanjung Kemuning"],
    ["Bengkulu","Muko Muko","Air Dikit|Air Majunto|Air Rami|Lubuk Pinang|Mukomuko Selatan|Mukomuko Utara|Pondok Suguh|Teras Terunjam|Air Batu|Air Joman|Bandar Pasir Mandoge|Bandar Pulau|Buntu Pane|Kisaran Barat|Kisaran Timur|Meranti|Pulau Rakyat|Simpang Empat|Tanjung Balai|Pulo Bandring|Rawang Panca Arga|Teluk Dalam"],
    ["Bengkulu","Rejang Lebong","Curup|Kota Padang|Padang Ulak Tanding|Bermani Ilir|Bermani Ulu Raya|Binduriang|Curup Selatan|Curup Tengah|Curup Timur|Curup Utara|Bermani Ulu|Selupu Rejang|Sindang Kelingi"],
    ["Bengkulu","Seluma","Seluma Selatan|Talo|Air Periukan|Ilir Talo|Lubuk Sandi|Seluma Barat|Seluma Timur|Seluma Utara|Semidang Alas Maras|Semidang Alas|Talo Kecil|Ulu Talo"],
    ["Bengkulu","Kepahiang","Bermani Ilir|Tebat Karai|Ujan Mas"],
    ["Bengkulu","Lebong","Lebong Selatan|Lebong Tengah|Lebong Utara|Rimbo Pengadang|Amen|Bingin Kuning|Lebong Atas"],
    ["Bengkulu","Bengkulu Tengah","Bang Haji"],
    ["Gorontalo","Boalema","Wonosari|Botumoita|Dulupi|Mananggu|Paguyaman|Tilamuta"],
    ["Gorontalo","Bone Bolango","Bone|Bone Raya|Bonepantai|Botupingge|Bulango Selatan|Bulango Timur|Bulango Ulu|Bulango Utara|Bulawa|Bukaka|Bone Pantai|Kabila|Suwawa|Tapa"],
    ["Gorontalo","Gorontalo","Anggrek|Asparaga|Atiangola|Batudaa|Batudaa Pantai|Bilato|Biluhu|Boliyohuto|Bongomeme|Toto Utara|Kota Selatan"],
    ["Gorontalo","Pahuwato","Buntulia|Marisa|Paguat|Patilanggio|Taluditi"],
    ["Papua Barat","Fak - Fak","Arguni|Bomberay"],
    ["Papua Barat","Kaimana","Buruway"],
    ["Papua Barat","Manokwari","Manokwari Barat|Amberbaken|Anggi|Anggi Gida|Catubouw|Dataran Isim"],
    ["Papua Barat","Raja Ampat","Ayau|Batanta Selatan|Batanta Utara"],
    ["Papua Barat","Sorong","Abun|Aifat|Aifat Selatan|Aifat Timur|Aifat Utara|Aimas|Aitinyo|Aitinyo Barat|Aitinyo Utara|Ayamaru|Ayamaru Timur|Ayamaru Utara|Beraur|Sorong Kota"],
    ["Papua Barat","Sorong Selatan","Aifat|Aifat Selatan|Aifat Timur|Aifat Utara|Aitinyo|Aitinyo Utara|Athabu/Aitinyo Barat|Ayamaru|Ayamaru Timur|Ayamaru Utara"],
    ["Papua Barat","Teluk Bintuni","Aranday|Aroba|Babo|Bintuni|Biscoop|Dataran Beimes"],
    ["Papua Barat","Manokwari Selatan","Dataran Isim"],
    ["Papua Barat","Maybrat","Aifat|Aifat Selatan|Aifat Timur|Aifat Timur Jauh|Aifat Timur Selatan|Aifat Timur Tengah|Aifat Utara|Aitinyo|Aitinyo Barat|Aitinyo Raya|Aitinyo Tengah|Aitinyo Utara|Ayamaru|Ayamaru Barat|Ayamaru Jaya|Ayamaru Selatan|Ayamaru Selatan Jaya|Ayamaru Tengah|Ayamaru Timur|Ayamaru Timur Selatan|Ayamaru Utara|Ayamaru Utara Timur"],
    ["Papua Barat","Pegunungan Arfak","Anggi|Anggi Gida|Catubouw"],
    ["Papua Barat","Tambrauw","Abun|Amberbaken|Amberbaken Barat|Ases|Bamusbama|Bikar"],
    ["Jambi","Batanghari","Maro Sebo Ilir|Maro Sebo Ulu|Mersam|Muara Bulian|Muara Tembesi|Pemayung|Bajubang|Batin XXIV"],
    ["Jambi","Bungo","Jujuhan|Muara Bungo|Pelepat|Rantau Pandan|Tanah Sepenggal|Tanah Tumbuh|Bathin II Pelayang|Bathin III|Bathin III Ulu|Bungo Dani|Bathin II Babeko|Limbur Lubuk Mengkuang|Muko Muko Batin VII|Pelepat Ilir"],
    ["Jambi","Kerinci","Air Hangat Timur|Air Hangat|Batang Merangin|Danau Kerinci|Gunung Kerinci|Gunung Raya|Hamparan Rawang|Kayu Aro|Keliling Danau|Sitinjau Laut|Sungai Penuh|Air Hangat Barat|Bukitkerman"],
    ["Jambi","Jambi","Jambi Selatan|Jambi Timur|Jelutung|Pasar Jambi|Kota Baru|Telanaipura|Mayang Mangurai|Alam Barajo|Pelayangan"],
    ["Jambi","Merangin","Bangko|Jangkat|Muara Siau|Pamenang|Bangko  Barat|Batang Masumai|Sungai Manau|Tabir Ulu|Tabir"],
    ["Jambi","Muaro Jambi","Jambi Luar Kota|Kumpeh Ulu|Kumpeh|Maro Sebo|Mestong|Sekernan|Sungai Bahar|Bahar Selatan|Bahar Utara|Taman Rajo"],
    ["Jambi","Sarolangun","Mandiangin|Pauh|Pelawan Singkut|Pelawan|Singkut|Air Hitam|Bathin VIII|Cermin Nan Gedang|Batang Asai|Limun"],
    ["Jambi","Tanjung Jabung Barat","Betara|Merlung|Pengabuan|Tungkal Ilir|Mendahara|Batang Asam|Bram Itam|Tungkal Ulu|Dendang|Muara Sabak|Nipah Panjang|Rantau Rasau|Sadu"],
    ["Jambi","Tanjung Jabung Timur","Berbak|Muara Sabak Barat"],
    ["Jambi","Tebo","Rimbo Bujang|Rimbo Ulu|Sumay|Tebo Ilir|Tebo Tengah|Rimbo Ilir|Tebo Ulu|Tengah Ilir|VII Koto"],
    ["Jawa Tengah","Banjarnegara","Batur|Bawang|Kalibening|Karangkobar|Madukara|Mandiraja|Pagentan|Pejawaran|Punggelan|Purworejo Klampok|Rakit|Sigaluh|Susukan|Wanadadi|Wanayasa|Banjarmangu|Purwanegara"],
    ["Jawa Tengah","Banyumas","Ajibarang|Baturaden|Cilongok|Gumelar|Jatilawang|Kalibagor|Karanglewas|Kebasen|Kedungbanteng|Kembaran|Kemranjen|Lumbir|Patikraja|Pekuncen|Purwojati|Purwokerto Selatan|Purwokerto Timur|Purwokerto Utara|Rawalo|Sokaraja|Somagede|Sumbang|Tambak|Wangon|Purwokerto|Baturraden|Sumpyuh"],
    ["Jawa Tengah","Batang","Bandar|Batang|Bawang|Blado|Gringsing|Kandeman|Limpung|Pecalungan|Reban|Subah|Tersono|Tulis|Warungasem|Wonotunggal|kalisalak|kauman|Banyuputih"],
    ["Jawa Tengah","Blora","Banjarejo|Bogorejo|Cepu|Japah|Jati|Jepon|Jiken|Kedungtuban|Kradenan|Kunduran|Ngawen|Randublatung|Sambong|Todanan|Tunjungan|Blora Kota"],
    ["Jawa Tengah","Boyolali","Ampel|Andong|Banyudono|Cepogo|Juwangi|Karanggede|Kemusu|Klego|Mojosongo|Musuk|Ngemplak|Nogosari|Sambi|Sawit|Selo|Simo|Teras|Wonosegoro|Pulisen|Winong|Boyolali Kota"],
    ["Jawa Tengah","Brebes","Banjarharjo|Bantarkawung|Brebes|Bulakamba|Bumiayu|Jatibarang|Kersana|Ketanggungan Barat|Ketanggungan|Larangan|Losari|Paguyangan|Salem|Songgom|Tanjung|Tonjong|Wanasari|Sirampog"],
    ["Jawa Tengah","Cilacap","Cilacap|Adipala|Bantarsari|Binangun|Cilacap Selatan|Cilacap Tengah|Cilacap Utara|Cimanggu|Cipari|Dayeuhluhur|Gandrungmangu|Jeruklegi|Karangpucung|Kawunganten|Kedungreja|Kesugihan|Kroya|Majenang|Maos|Nusawungu|Patimuan|Sampang|Sidareja|Wanareja"],
    ["Jawa Tengah","Demak","Tegalharum|Bonang|Dempet|Gajah|Guntur|Karanganyar|Karangawen|Karangtengah|Kebonagung|Mijen|Mranggen|Sayung|Wedung|Wonosalam|Bintoro"],
    ["Jawa Tengah","Grobogan","Brati|Gabus|Geyer|Godong|Gubug|Karangrayung|Kedungjati|Klambu|Kradenan|Ngaringan|Penawangan|Pulokulon|Purwodadi|Tanggungharjo|Tawangharjo|Tegowanu|Toroh|Wirosari"],
    ["Jawa Tengah","Jepara","Jepara|Bangsri|Batealit|Kalinyamatan|Karimunjawa|Kedung|Keling|Kembang|Mayong|Mlonggo|Nalumsari|Pecangaan|Tahunan|Welahan"],
    ["Jawa Tengah","Karanganyar","Jaten|Karangpandan|Colomadu|Matesih|Mojogedang|Jumapolo|Jumantono|Jenawi|Kerjo|Ngargoyoso|Tasikmadu|Kebakkramat|Gondangrejo|Jatiyoso|Jatipuro|Tawangmangu|Karanganyar|Klodran"],
    ["Jawa Tengah","Kebumen","Adimulyo|Alian|Ambal|Ayah|Bonorowo|Buayan|Gombong|Karanganyar|Karanggayam|Karangsambung|Kebumen|Klirong|Kutowinangun|Kuwarasan|Mirit|Padureso|Pejagoan|Petanahan|Poncowarno|Prembun|Puring|Rowokele|Sadang|Sempor|Sruweng|Buaran|Bulupesantren"],
    ["Jawa Tengah","Kendal","Kendal|Boja|Brangsong|Cepiring|Gemuh|Kaliwungu|Kangkung|Limbangan|Ngampel|Patean|Patebon|Pegandon|Plantungan|Ringinarum|Rowosari|Singorojo|Sukorejo|Weleri|Pagerruyung"],
    ["Jawa Tengah","Klaten","Bayat|Cawas|Ceper|Delanggu|Gantiwarno|Jatinom|Jogonalan|Juwiring|Kalikotes|Karanganom|Karangdowo|Karangnongko|Kebonarum|Kemalang|Klaten Selatan|Klaten Tengah|Klaten Utara|Manisrenggo|Ngawen|Pedan|Polanharjo|Prambanan|Trucuk|Tulung|Wedi|Wonosari"],
    ["Jawa Tengah","Kabupaten Kudus","Kudus|Bae|Dawe|Gebog|Jati|Jekulo|Kaliwungu|Mejobo|Undaan"],
    ["Jawa Tengah","Magelang","Bandongan|Borobudur|Candimulyo|Dukun|Grabag|Kajoran|Kaliangkrik|Magelang Selatan|Magelang Tengah|Magelang Utara|Mungkit|Muntilan|Ngablak|Ngluwar|Pakis|Salam|Salaman|Secang|Srumbung|Tegalrejo|Tempuran|Windusari|Mertoyudan|Martoyudan|Sawangan"],
    ["Jawa Tengah","Pati","Batangan|Cluwak|Dukuhseti|Gabus|Gembong|Gunungwungkal|Jaken|Jakenan|Juwana|Kayen|Margorejo|Margoyoso|Pucakwangi|Sukolilo|Tambakromo|Tayu|Tlogowungu|Trangkil|Wedarijaksa|Winong|Kartini|Pati Kota"],
    ["Jawa Tengah","Pekalongan","Bojong|Buaran|Doro|Kajen|Kandangserang|Karanganyar|Karangdadap|Kedungwuni|Kesesi|Lebakbarang|Paninggaran|Pekalongan Barat|Pekalongan Selatan|Pekalongan Timur|Pekalongan Utara|Petungkriono|Siwalan|Sragi|Talun|Tirto|Wiradesa|Wonokerto|Wonopringgo"],
    ["Jawa Tengah","Pemalang","Ampelgading|Bantarbolang|Belik|Bodeh|Comal|Moga|Pemalang|Petarukan|Pulosari|Randudongkal|Taman|Ulujami|Warungpring|Watukumpul"],
    ["Jawa Tengah","Purbalingga","Bobotsari|Bojongsari|Bukateja|Kaligondang|Kalimanah|Karanganyar|Karangjambu|Karangmoncol|Karangreja|Kejobong|Kemangkon|Kertanegara|Kutasari|Mrebet|Padamara|Pengadegan|Purbalingga|Rembang"],
    ["Jawa Tengah","Purworejo","Purwodadi|Bagelen|Banyuurip|Bayan|Bener|Bruno|Butuh|Gebang|Grabag|Kaligesing|Kemiri|Kutoarjo|Loano|Ngombol|Pituruh|Purworejo"],
    ["Jawa Tengah","Rembang","Bulu|Gunem|Kaliori|Kragan|Lasem|Pamotan|Pancur|Sarang|Sedan|Sluke|Sulang|Sumber"],
    ["Jawa Tengah","Salatiga","Argomulyo|Sidomukti|Sidorejo|Tingkir|Taman Sari|Kopeng"],
    ["Jawa Tengah","Semarang","Bukit Sari|Pedurungan|Gayamsari|Majapahit|Graha Padma|Tanah Mas|Sambiroto|Jangli|Gajah Mungkur|Plamongan|Srondol|Mijen|Tlogosari|Sampangan|Jatingaleh|Manyaran|Ngesrep|Pudak Payung|Kalibanteng|Tengger|Pleburan|Kaligawe|Bancak|Bandungan|Banyubiru|Banyumanik|Bergas|Bringin|Candisari|Genuk|Getasan|Jambu|Kaliwungu|Gunung Pati|Pabelan|Pringapus|Semarang Barat|Semarang Selatan|Semarang Tengah|Semarang Timur|Semarang Utara|Sumowono|Suruh|Susukan|Tembalang|Tengaran|Tugu|Tuntang|Ungaran Barat|Ungaran Timur|Sendangmulyo|Puri Anjasmoro|Ungaran|Kedungmundu|Ngaliyan|Bugangan|Mranggen|Kedung Pane|Kalicari|pekunden|papandayan|Muktiharjo|Simongan|Sayung|Boja|Lamper|Karang Rejo|Wonosari|Pamularsih|Pusponjolo|Puspogiwang|Kenconowungu|Gedung Batu|Gedung Songo|Sri Rejeki|Kembang Arum|Sekayu|Pandansari|Brumbungan|Kranggan|Jagalan|Gabahan|Purwodinatan|Pindrikan|Atmodirono|Kartini|Gajah|Dempel|Siranda|Kawi|Semeru|Tlaga Bodas|Sultan Agung|Citarum|Krakatau|Labuhan|Hawa|Sidodadi Timur|Nias|Halmahera|Karimata|Tugurejo|Tambakaji|Kalibanteng kidul|Kalibanteng Kulon|Karangmalang|Tawangmas|Jerakah|Peterongan|Pendirikan|Bulustalan|Barusari|Terboyo|Karang kidul|Kuningan|Karangayu|Cabean|Miroto|Dadapsari|Bubakan|Purwosari|Polaman|Penggaron|Pilangsari|Pemuda|Mugosari|Simpang Lima|Sarirejo|Kampung Kali|Banjardowo|Kauman|Karang Anyar|Banbankerep|Bangetayu Wetan|Karang Turi|Gebangsari|Gemah|Genuksari|Jomblang|Karang Tempel|Mangunsari|Meteseh|Mlatiharjo|Petempon|Pati Wetan|Plombokan|Sompok|Indraprasta|Dr Cipto Mangunkusomo|Tanjung Mas|Karang Kebon|Gajahmada|BSB City|Candi Golf|Citragrand|Greenwood|Rejosari|Panggung|Mataram|Bawen|Wonodri|Puspowarno|Krapyak|Ketileng"],
    ["Jawa Tengah","Solo","Slamet Riyadi|Solo Baru|Karanganyar|Mangkubumen|Gentan|Grogol|Laweyan|Kartosuro|Colomadu|mojosongo|Jajar|Jaten|Manahan|Banjarsari|Jebres|Pasar Kliwon|Serengan|Gilingan|Ketelan|Pucang Sawit|Sondakan|Purwosari|Banaran|Cemani|Penularan|Kratonan|Sangkrah|Semanggi|Sranggrahan|Madugondo|Banyuanyar|Pabelan|Pajang|Ngemplak|Tawangmangu|Nusukan"],
    ["Jawa Tengah","Sragen","Gemolong|Gesi|Gondang|Jenar|Kalijambe|Karangmalang|Kedawung|Masaran|Miri|Mondokan|Ngrampal|Plupuh|Sambirejo|Sambungmacan|Sidoharjo|Sragen|Sukodono|Sumberlawang|Tangen|Tanon"],
    ["Jawa Tengah","Sukoharjo","Sukoharjo|Kartosuro|Gatak|Mojolaban|Polokarto|Bendosari|Nguter|Tawangsari|Bulu|Weru|Baki|Gentan"],
    ["Jawa Tengah","Surakarta","Banjarsari|Jebres|Laweyan|Pasar Kliwon|Serengan|Penumping|Badran|Loji Wetan|Slamet Riyadi|Mojosongo|Kepunton|Jagalan|Pucang Sawit|Keprabon|Kampung Baru|Solo Baru|Kebakkramat|Karanganyar|Mayang|Karang Anyar|Sukoharjo"],
    ["Jawa Tengah","Tegal","Kapten Ismail|Adiwerna|Balapulang|Bojong|Bumijawa|Dukuhturi|Dukuhwaru|Jatinegara|Kedungbanteng|Tarub|Tegal Barat|Tegal Selatan|Tegal Timur|Warureja|Randu Gunting|Talang|Slawi|Kramat|Lebaksiu|Margadana|Margasari|Pagerbarang|Pangkah|Suradadi"],
    ["Jawa Tengah","Temanggung","Bansari|Bejen|Bulu|Candiroto|Selopampang|Temanggung|Tembarak|Tlogomulyo|Tretep|Wonoboyo|Gemawang|Jumo|Kaloran|Kandangan|Kedu|Kledung|Kranggan|Ngadirejo|Parakan|Pringsurat"],
    ["Jawa Tengah","Wonogiri","Baturetno|Batuwarno|Bulukerto|Eromoko|Giritontro|Giriwoyo|Jatipurno|Jatiroto|Jatisrono|Karangtengah|Kismantoro|Manyaran|Ngadirojo|Nguntoronadi|Paranggupito|Pracimantoro|Puhpelem|Purwantoro|Selogiri|Sidoharjo|Slogohimo|Tirtomoyo|Wonogiri|Wuryantoro"],
    ["Jawa Tengah","Wonosobo","Garung|Kalikajar|Kaliwiro|Kejajar|Kepil|Kertek|Leksono|Mojotengah|Sapuran|Selomerto|Sukoharjo|Wadaslintang|Watumalang|Wonosobo Kota|Kalibawang"],
    ["Jawa Tengah","Purwodadi","Purwodadi"],
    ["Jawa Tengah","Purwokerto","Purwokerto|Purwokerto Barat|Purwokerto Selatan|Purwokerto Timur|Purwokerto Utara"],
    ["Jawa Tengah","Ambarawa","Ambarawa"],
    ["Jawa Timur","Bangkalan","Burneh|Tanah Merah|Arosbaya|Kemayoran|Demangan|Blega|Galis|Geger|Kamal|Klampis|Kokop|Konang|Kwanyar|Labang|Modung|Sepulu|Socah|Tanjungbumi|Tragah"],
    ["Jawa Timur","Banyuwangi","Bangorejo|Banyuwangi|Cluring|Gambiran|Genteng|Giri|Glagah|Glenmore|Kabat|Kali Baru|Kalipuro|Licin|Muncar|Pesanggaran|Purwoharjo|Rogojampi|Sempu|Siliragung|Singojuruh|Songgon|Srono|Tegaldlimo|Tegalsari|Wongsorejo|Watudodol"],
    ["Jawa Timur","Batu","Batu|Bumiaji|Junrejo|Desa Tulungrejo"],
    ["Jawa Timur","Blitar","Gandusari|Bakung|Binangun|Doko|Garum|Kademangan|Kanigoro|Kepanjenkidul|Kesamben|Nglegok|Panggungrejo|Ponggok|Sanankulon|Sananwetan|Selopuro|Selorejo|Srengat|Sukorejo|Sutojayan|Talun|Udanawu|Wates|Wlingi|Wonodadi|Wonotirto"],
    ["Jawa Timur","Bojonegoro","Balen|Baureno|Bubulan|Gondang|Kalitidu|Kanor|Kapas|Kasiman|Kedewan|Kedungadem|Kepohbaru|Malo|Margomulyo|Ngambon|Ngasem|Ngraho|Padangan|Purwosari|Sekar|Sugihwaras|Sumberejo|Tambakrejo|Temayang|Trucuk|Bojonegoro Kota|Dander|Sukosewu"],
    ["Jawa Timur","Bondowoso","Binakal|Cermee|Curahdami|Grujugan|Klabang|Maesan|Pakem|Prajekan|Pujer|Sempol|Sukosari|Sumberwringin|Tamanan|Tapen|Tegalampel|Tenggarang|Tlogosari|Wonosari|Wringin|Botolinggo|Bondowoso Kota"],
    ["Jawa Timur","Gresik","Balongpanggang|Benjeng|Bungah|Cerme|Driyorejo|Duduk Sampeyan|Dukun|Kebomas|Kedamean|Manyar|Menganti|Panceng|Sangkapura|Sidayu|Tambak|Ujung Pangkah|Wringinanom|Gresik Kota"],
    ["Jawa Timur","Jember","Ajung|Ambulu|Arjasa|Balung|Bangsalsari|Gumukmas|Jelbuk|Jenggawah|Jombang|Kalisat|Kaliwates|Kencong|Ledokombo|Mayang|Mumbulsari|Pakusari|Panti|Patrang|Puger|Rambipuji|Semboro|Silo|Sukorambi|Sukowono|Sumberbaru|Sumberjambe|Sumbersari|Tanggul|Tempurejo|Umbulsari|Wuluhan"],
    ["Jawa Timur","Jombang","Bandar Kedungmulyo|Bareng|Diwek|Gudo|Jogoroto|Kabuh|Kesamben|Kudu|Megaluh|Mojoagung|Mojowarno|Ngoro|Ngusikan|Perak|Peterongan|Plandaan|Ploso|Tembelang|Wonosalam|Bandarkedungmulyo|Jombang Kota"],
    ["Jawa Timur","Kediri","Banyakan|Gampengrejo|Grogol|Gurah|Kandangan|Kandat|Kediri|Kepung|Kras|Kunjang|Mojo|Mojoroto|Ngadiluwih|Ngancar|Pagu|Papar|Pesantren|Plemahan|Plosoklaten|Puncu|Purwoasri|Ringinrejo|Semen|Tarokan|Wates|Bangsal|Badas|Pare|Ngasem|Minggiran"],
    ["Jawa Timur","Lamongan","Babat|Bluluk|Brondong|Deket|Glagah|Kalitengah|Karangbinangun|Karanggeneng|Kedungpring|Kembangbahu|Lamongan|Laren|Maduran|Mantup|Modo|Ngimbang|Paciran|Pucuk|Sambeng|Sarirejo|Sekaran|Solokuro|Sugio|Sukodadi|Sukorame|Tikung|Turi|Lamongan Kota"],
    ["Jawa Timur","Lumajang","Candipuro|Gucialit|Jatiroto|Kedungjajang|Klakah|Kunir|Padang|Pasirian|Pasrujambe|Pronojiwo|Randuagung|Ranuyoso|Rowokangkung|Senduro|Sukodono|Sumbersoko|Tekung|Tempeh|Tempursari|Yosowilangun"],
    ["Jawa Timur","Madiun","Madiun|Balerejo|Dagangan|Dolopo|Geger|Gemarang|Jiwan|Kare|Kartoharjo|Kebonsari|Manguharjo|Mejayan|Pilangkenceng|Saradan|Sawahan|Taman|Wonoasri|Wungu"],
    ["Jawa Timur","Magetan","Barat|Bendo|Karangrejo|Karas|Kartoharjo|Kawedanan|Lembeyan|Magetan|Maospati|Ngariboyo|Panekan|Parang|Plaosan|Poncol|Sukomoro|Takeran|Nguntoronadi"],
    ["Jawa Timur","Malang","Batu|Pakis|Malang Kota|Arjosari|Blimbing|Dinoyo|Sawojajar|Sulfat|Ampelgading|Bantur|Bululawang|Dampit|Dau|Donomulyo|Gedangan|Gondanglegi|Jabung|Kalipare|Karangploso|Kasembon|Kedungkandang|Kepanjen|Klojen|Kromengan|Lawang|Lowokwaru|Ngajum|Ngantang|Pagak|Pagelaran|Pakisaji|Poncokusumo|Pujon|Singosari|Sukun|Sumbermanjing Wetan|Sumberpucung|Tajinan|Tirtoyudo|Tumpang|Turen|Wagir|Wajak|Wonosari|Bantaran|Sengkaling|Buring|Soekarno Hatta|Araya|Gadang|Rampal Celaket|Samaan|Kidul Dalam|Sukoharjo Kota|Kasin|Oro-Oro Dowo|Bareng|Penanggungan|Kauman|Balearjosari|Purwodadi|Polowijen|Pandanwangi|Purwantoro|Bunulrejo|Kesatrian|Polehan|Jodipan|Tasikmadu|Tunggulwulung|Merjosari|Tlogomas|Sumbersari|Ketawanggede|Jatimulyo|Tunjungsekar|Mojolangu|Tulusrejo|Ciptomulyo|Bandungrejosari|Tanjungrejo|Pisang Candi|Karang Besuki|Mulyorejo|Bakalan Krajan|Kebonsari|Kotalama|Mergosono|Bumiayu|Wonokoyo|Lesanpuro|Madyopuro|Cemorokandang|Arjowinangun|Tlogowaru|Gareng|Gading Kasari|Dieng|Villa Puncak Tidar|Bandulan|Buah-buahan|Pulau-pulau|Gunung-gunung|Tidar|Griya Shanta|Permata Jingga|Dieng Tidar"],
    ["Jawa Timur","Mojokerto","Bangsal|Dlanggu|Pacet|Prajurit Kulon|Pungging|Puri|Sooko|Trawas|Trowulan|Mojokerto|Dawarblandong|Gedeg|Gondang|Jatirejo|Jetis|Kemlagi|Kutorejo|Magersari|Mojoanyar|Mojosari|Ngoro"],
    ["Jawa Timur","Nganjuk","Bagor|Baron|Kertosono|Lengkong|Loceret|Nganjuk|Ngetos|Ngluyu|Ngronggot|Pace|Patianrowo|Prambon|Berbek|Gondang|Jatikalen|Rejoso|Sawahan|Sukomoro|Tanjunganom|Wilangan"],
    ["Jawa Timur","Ngawi","Kedunggalar|Kendal|Kendungan|Kwadungan|Mantingan|Ngawi|Ngrambe|Padas|Pangkur|Paron|Bringin|Geneng|Jogorogo|Karanganyar|Karangjati|Pitu|Sine|Walikukun|Widodaren"],
    ["Jawa Timur","Pacitan","Arjosari|Bandar|Nawangan|Kota Pacitan|Sudimoro|Tegalombo|Tulakan|Kebonagung|Pringkuku|Punung"],
    ["Jawa Timur","Pamekasan","Kadur|Larangan|Pademawu|Pakong|Palengaan|Pasean|Pegantenan|Proppo|Tlanakan|Batumarmar|Bangkalan|Sumenep|Socah|Kalianget|Blega|Sampang|Kamal|Tanah Merah|Bumeh|Batu Marmar|Galis|Waru"],
    ["Jawa Timur","Pasuruan","Bangil|Kraton|Lekok|Lumbang|Nguling|Pandaan|Pasrepan|Pohjentrek|Prigen|Purwodadi|Purworejo|Purwosari|Puspo|Rejoso|Rembang|Sukorejo|Tosari|Tutur|Winongan|Wonorejo|Panggungrejo|Beji|Bugulkidul|Gadingrejo|Gempol|Gondang Wetan|Grati|Kejayan"],
    ["Jawa Timur","Ponorogo","Jambon|Jenangan|Jetis|Kauman|Mlarak|Ngebel|Ngrayun|Pudak|Pulung|Sambit|Siman|Slahung|Sooko|Sukorejo|Ponorogo|Babadan|Badegan|Balong|Bungkal|Sampung|Sawoo"],
    ["Jawa Timur","Probolinggo","Bantaran|Banyuanyar|Besuk|Kraksaan|Krejengan|Krucil|Kuripan|Leces|Lumbang|Maron|Mayangan|Paiton|Pajarakan|Pakuniran|Sukapura|Sumber|Sumberasih|Tegalsiwalan|Probolinggo|Kanigaran|Dringu|Gading|Gending|Kademangan|Kotaanyar|Tiris|Tongas|Wonoasih|Wonomerto"],
    ["Jawa Timur","Sampang","Banyuates|Camplong|Jrengik|Kedungdung|Ketapang|Omben|Robatal|Sokobanah|Sreseh|Tambelangan|Torjun"],
    ["Jawa Timur","Sidoarjo","Balongbendo|Buduran|Candi|Gedangan|Jabon|Krembung|Krian|Porong|Prambon|Sedati|Sidoarjo|Sukodono|Taman|Tanggulangin|Tarik|Tulangan|Waru|Wonoayu|Wadungasri|Jenggolo|Sidokerto|Larangan|Bendungan Bening|Gempol Kurung|Unimas Garden Waru|Pondok Tjandra"],
    ["Jawa Timur","Situbondo","Arjasa|Asembagus|Banyugluglur|Banyuputih|Besuki|Jangkar|Jatibanteng|Kapongan|Kendit|Mangaran|Mlandingan|Panarukan|Panji|Suboh|Bungatan|Sumber Malang"],
    ["Jawa Timur","Sumenep","Arjasa|Batang Batang|Bluto|Dasuk|Dungkek|Ganding|Gapura|Gayam|Giligenteng|Guluk Guluk|Kalianget|Kangean|Kota Sumenep|Lenteng|Manding|Masalembu|Nonggunong|Pasongsongan|Pragaan|Sapeken|Saronggi|Talango|Batu Putih|Ambunten|Batuan|Batuputih|Raas|Rubaru"],
    ["Jawa Timur","Surabaya","Gubeng|Raya A Yani|Manyar|Surabaya Kota|Ketintang|Raya Margorejo|Kutisari|Rungkut|Tidar|Perak|Sutorejo|Kendangsari|Asemrowo|Benowo|Bubutan|Undaan|Dukuh Pakis|Gayungan|Genteng|Gununganyar|Jambangan|Karangpilang|Kenjeran|Krembangan|Lakarsantri|Mulyorejo|Pabean Cantikan|Pakal|Sambikerep|Sawahan|Semampir|Simokerto|Sukolilo|Sukomanunggal|Tambaksari|Tandes|Tegalsari|Tenggilis Mejoyo|Wiyung|Wonocolo|Wonokromo|Raya Darmo|Mayjen Sungkono|Keputih|Pakuwon City|Jemursari|Margomulyo|Mulyosari|Kebraon|Semolowaru|Nginden|Kapasan|Pemuda|Rungkut Industri|Pakuwon Indah|Ambengan|Margorejo|Kebonsari|Menganti|Kalisari|Ngagel|Wonorejo|Diponegoro|Dukuh Kupang|Laguna|Citraland|Kembang Jepun|Pakuwon|Galaxy|Graha|Darmo permai|kertajaya|HR Muhammad|Tunjungan|Basuki Rachmat|Bunguran|Dharma Husada|Veteran|Waru|Bulak|Panjang Jiwo|Banyu Urip|Kalianak|Petemon|Gempol Kurung|Bandungan Bening|Kedung Baruk|Karang Poh|Gadel|Tubanan|Balong Sari|Buntaran|Putat Gede|Pakis|Dr Sutomo|Babatan|Lidah Kulon|Lidah Wetan|Kureksari|Medokan Ayu|Kedung Doro|Kupang Krajan|Putat Jaya|Simomulyo|Embong Kali|Keputran|Tembok Dukuh|Gundih|Paneleh|Alun-alun Contong|Manukan|Kupang|Middle East Ring Road|Sidoarjo|Mojoarum|Wisata Bukit Mas|Jagir"],
    ["Jawa Timur","Trenggalek","Bendungan|Dongko|Durenan|Gandusari|Kampak|Karangan|Munjungan|Panggul|Pogalan|Trenggalek|Watulimo|Pule|Suruh|Tugu"],
    ["Jawa Timur","Tuban","Bancar|Bangilan|Grabagan|Jatirogo|Jenu|Kenduruan|Kerek|Merakurak|Montong|Parengan|Rengel|Semanding|Senori|Singgahan|Soko|Tambakboyo|Tuban|Widang|Plumpang|Palang|Plumbang"],
    ["Jawa Timur","Tulungagung","Campurdarat|Gondang|Kalidawir|Karangrejo|Kauman|Kedungwaru|Ngantru|Ngunut|Pagerwojo|Pakel|Bandung|Besuki|Boyolangu|Pucanglaban|Rejotangan|Sendang|Sumbergempol|Tanggung Gunung|Tulungagung|Bago"],
    ["Jawa Timur","Madura","Pamekasan"],
    ["Kalimantan Barat","Bengkayang","Bengkayang|Capkala|Jagoi Babang|Ledo|Monterado|Samalantan|Sanggau Ledo|Seluas|Sungai Raya|Suti Semarang|Teriak"],
    ["Kalimantan Barat","Kapuas Hulu","Bika|Danau Setarum|Badau|Batang Lupar|Batu Datu|Boyan Tanjung|Bunut Hilir|Bunut Hulu|Embaloh Hilir|Embaloh Hulu|Embau|Empanang|Hulu Gurung|Kalis|Kedamin|Manday|Mentebah|Puring Kencana|Putussibau|Seberuang|Selimbau|Semitau|Silat Hilir|Silat Hulu|Suhaid"],
    ["Kalimantan Barat","Ketapang","Marau|Sandai|Teluk Batang|Air Upas|Benua Kayong|Delta Pawan|Hulu Sungai|Jelai Hulu|Kendawangan|Manis Mata|Matan Hilir Selatan|Matan Hilir Utara|Muara Pawan|Nanga Tayap|Pemaham|Pulau Maya Karimata|Seponti Jaya|Simpang Dua|Simpang Hilir|Simpang Hulu|Singkup|Sukadana|Sumgai Melayu Raya|Sungai Laur|Tumbang Titi"],
    ["Kalimantan Barat","Landak","Banyuke Hulu|Air Besar|Kuala Behe|Mandor|Mempawah Hulu|Menjalin|Menyuke|Meranti|Ngabang|Sebangki|Sengah Temila"],
    ["Kalimantan Barat","Pontianak","Batu Ampar|Kuala Mandor B|Kubu|Mempawah Hilir|Pontianak Barat|Pontianak Kota|Pontianak Timur|Rasau Jaya|Siantan|Sungai Ambawang|Sungai Kakap|Sungai Kunyit|Sungai Pinyuh|Sungai Raya|Telok Pa`kedai|Terentang|Toho|Pontianak Selatan|Pontianak Utara|Pontianak Tenggara"],
    ["Kalimantan Barat","Sambas","Galing|Jawai Selatan|Paloh|Pemangkat|Sajad|Sajingan|Sebawi|Sejangkung|Selakau|Semparuk|Subah|Tanggaran|Tebas|Tekarang|Teluk Keramat"],
    ["Kalimantan Barat","Sanggau","Belitang|Belitang Hilir|Belitang Hulu|Balai|Beduwai|Bonti|Entikong|Jangkang|Kembayan|Meliau|Mukok|Noyan|Parindu|Sanggau Kapuas|Sekayam|Tayan Hilir|Tayan Hulu|Toba"],
    ["Kalimantan Barat","Singkawang","Singkawang Barat|Singkawang Selatan|Singkawang Tengah|Singkawang Timur|Singkawang Utara"],
    ["Kalimantan Barat","Sintang","Binjai Hulu|Belimbing|Sintang Kota|Ambalau|Dedai|Kayan Hilir|Kayan Hulu|Kelam Permai|Ketungau Hilir|Ketungau Hulu|Ketungau Tengah|Sepauk|Serawai|Sungai Tebelian|Tempunak"],
    ["Kalimantan Barat","Melawi","Belimbing Hulu|Ambalau|Belimbing|Ella Hilir|Menukung|Nanga Pinoh|Sayan|Serawai|Sokan|Tanah Pinoh"],
    ["Kalimantan Barat","Sekadau","Belitang Hilir|Belitang Hulu|Belitang|Nanga Mahap|Nanga Taman|Sekadau Hilir|Sekadau Hulu"],
    ["Kalimantan Barat","Kubu Raya","Batu Ampar|Kuala Mandor B|Kubu|Rasau Jaya|Sungai Ambawang|Sungai Kakap|Sungai Raya|Teluk Pakedai|Terentang"],
    ["Kalimantan Barat","Mempawah","Anjongan|Batu Ampar"],
    ["Kalimantan Selatan","Balangan","Awayan|Batu Mandi|Halong|Juai|Lampihong|Paringin Selatan|Paringin|Tebing Tinggi"],
    ["Kalimantan Selatan","Banjar","Lingkar Selatan|Simpang Empat|Beruntung Baru|Aluh Aluh|Aranio|Astambul|Gambut|Karang Intan|Kertak Hanyar|Martapura Barat|Martapura Timur|Martapura|Mataraman|Paramasan|Pengaron|Rantau Bujur|Sungai Pinang|Sungai Tabuk"],
    ["Kalimantan Selatan","Banjar Baru","Banjarbaru Utara|Banjar Baru|Cempaka|Landasan Ulin|Alalak|Anjir Muara|Anjir Pasar|Bakumpai|Barambai|Belawang|Cerbon|Kuripan|Mandastana|Marabahan|Mekar Sari|Rantau Badauh|Tabukan|Tabunganen|Tamban|Wanaraya"],
    ["Kalimantan Selatan","Banjarmasin","Banjarmasin|Serapat|Tamban|Aluhaluh|Tambakkrangan|Sungairengas|Batibati|Martapura|Jend Ahmad Yani|Sutoyo|Gubernur Soebarjo|S Parman|Jend. Ahmad Yani|Banjarmasin Timur|Banjarmasin Barat|Banjarmasin Utara|Banjarmasin Selatan|Banjarmasin Tengah"],
    ["Kalimantan Selatan","Hulu Sungai Selatan","Padang Batung|Simpur|Sungai Raya|Telaga Langsat|Angkinang|Daha Barat|Daha Selatan|Daha Utara|Kalumpang|Kandangan|Loksado"],
    ["Kalimantan Selatan","Hulu Sungai Tengah","Barabai|Batang Alai Selatan|Batang Alai Tengah|Batang Alai Timur|Batang Alai Utara|Batu Benawa|Hantakan|Haruyan|Labuan Amas Selatan|Labuan Amas Utara|Pandawan"],
    ["Kalimantan Selatan","Hulu Sungai Utara","Banjang|Amuntai Selatan|Amuntai Tengah|Amuntai Utara|Babirik|Danau Panggang|Haur Gading|Paminggir|Sungai Pandan|Sungai Tabukan"],
    ["Kalimantan Selatan","Kota Baru","Pulau Laut Timur|Pulau Laut Utara|Pulau Sembilan|Sungai Durian|Hampang|Kelumpang Hulu|Kelumpang Selatan|Kelumpang Tengah|Kelumpang Utara|Pamukan Selatan|Pamukan Utara|Pulau Laut Barat|Pulau Laut Selatan|Pulau Sebuku|Sampanahan"],
    ["Kalimantan Selatan","Tabalong","Banua Lawas|Bintang Ara|Haruai|Jaro|Kelua|Muara Harus|Muara Uya|Murung Pudak|Pugaan|Tanjung|Tanta|Upau"],
    ["Kalimantan Selatan","Tanah Bumbu","Angsana|Batu Licin|Kuranji|Kusan Hilir|Kusan Hulu|Mentewe|Satui|Simpang Empat|Sungai Loban"],
    ["Kalimantan Selatan","Tanah Laut","Bajuin|Bumi Makmur|Bati Bati|Batu Ampar|Jorong|Kintap|Kurau|Panyipatan|Pelaihari|Takisung|Tambang Ulang"],
    ["Kalimantan Selatan","Tapin","Bakarangan|Binuang|Bungur|Candi Laras Selatan|Candi Laras Utara|Hatungun|Lokpaikat|Piani|Salam Babaris|Tapin Selatan|Tapin Tengah|Tapin Utara"],
    ["Kalimantan Tengah","Barito Selatan","Dusun Selatan|Dusun Utara|Gunung Bintang Awai|Jenamas|Karau Kuala"],
    ["Kalimantan Tengah","Barito Timur","Banua Lima|Awang|Benua Lima|Dusun Tengah|Dusun Timur|Paku|Patangkep Tutui|Pematang Karau"],
    ["Kalimantan Tengah","Barito Utara","Gunung Purei|Gunung Timang|Lahei|Montalat|Teweh Tengah|Teweh Timur"],
    ["Kalimantan Tengah","Gunung Mas","Damang Batu|Kahayan Hulu Utara|Kurun|Munuhing|Rungan|Sepang|Tewah"],
    ["Kalimantan Tengah","Kapuas","Bataguh|Dadahup|Basarang|Kapuas Barat|Kapuas Hilir|Kapuas Hulu|Kapuas Kuala|Kapuas Murung|Kapuas Timur|Mantangai|Pulau Petak|Selat|Timpah"],
    ["Kalimantan Tengah","Katingan","Bukit Raya|Kamipang|Katingan Hilir|Katingan Hulu|Katingan Kuala|Katingan Tengah|Marikit|Mendawai|Pulau Malan|Sanaman Mantikei|Tasik Payawan|Tewang Sangalang Garing"],
    ["Kalimantan Tengah","Kota Waringin Barat","Arut Selatan|Arut Utara|Kotawaringin Lama|Kumai|Pangkalan Banteng|Pangkalan Lada|Antang Kalang|Baamang|Cempaga|Kota Besi|Mentawa Baru|Mentaya Hilir Selatan|Mentaya Hilir Utara|Mentaya Hulu|Parenggean|Pulau Hanaut"],
    ["Kalimantan Tengah","Kota Waringin Timur","Bukit Santuai|Cempaga Hulu|Sampit|Ketapang"],
    ["Kalimantan Tengah","Lamandau","Batang Kawa|Belantikan Raya|Bulik Timur|Bulik|Delang"],
    ["Kalimantan Tengah","Murung Raya","Barito Tuhup Raya|Laung Tuhup|Murung|Permata Intan|Seribu Riam|Sumber Barito|Tanah Siang"],
    ["Kalimantan Tengah","Palangkaraya","Pahandut|Bukit Batu|Jekan Raya|Rakumpit|Sebangau"],
    ["Kalimantan Tengah","Pulau Pisau","Banamatingang|Kahayan Hilir|Kahayan Kuala|Kahayan Tengah|Maliku|Pandih Batu|Sebangau Kuala"],
    ["Kalimantan Tengah","Seruyan","Hanau|Batu Ampar|Danau Seluluk|Danau Sembuluh|Seruyan Hilir|Seruyan Hulu|Seruyan Tengah"],
    ["Kalimantan Tengah","Sukamara","Balai Riam|Jelai"],
    ["Kalimantan Timur","Balikpapan","Balikpapan Selatan|Balikpapan Tengah|Balikpapan Timur|Balikpapan Utara|Balikpapan Barat|Batakan|Balikpapan Kota|Manggar|Manggar Baru|Lamaru|Teritip|Prapatan|Telaga Sari|Klandasan Ulu|Klandasan Ilir|Damai|Balikpapan Baru|Gunung Bahagia|Sepinggan|Gn. Sari Ilir|Gn. Sari Ulu|Mekar Sari|Karang Rejo|Sumber Rejo|Karang Jati|Gn. Samarinda|Muara Rapak|Batu Ampar|Karang Joang|Baru Ilir|Margo Mulyo|Marga Sari|Baru Tengah|Baru Ulu|Kariangau"],
    ["Kalimantan Timur","Berau","Batu Putih|Biatan|Biduk Biduk|Gunung Tabur|Kelay|Maratua|Pulau Derawan|Sambaliung|Segah|Talisayan|Tanjung Redeb|Teluk Bayur|Tubaan"],
    ["Kalimantan Timur","Bontang","Bontang Barat|Bontang Selatan|Bontang Utara|Peso Hilir|Pulau Bunyu|Sekatak|Tanjung Palas Barat|Tanjung Palas Tengah|Tanjung Palas Timur|Tanjung Palas Utara|Tanjung Palas|Tanjung Selor"],
    ["Kalimantan Timur","Kutai Barat","Barong Tongkok|Bentian Besar|Bongan|Damai|Jempang|Linggang Bigung|Long Apari|Long Bagun|Long Hubung|Long Iram|Long Pahangai|Melak|Mook Manar Bulatn|Muara Lawa|Muara Pahu|Nyuwatan|Penyinggahan"],
    ["Kalimantan Timur","Kutai Kartanegara","Tanah Kukar|Anggana|Kembang Janggut|Kenohan|Kota Bangun|Loa Janan|Loa Kulu|Marang Kayu|Muara Badak|Muara Jawa|Muara Kaman|Muara Muntai|Muara Wis|Samboja|Sanga Sanga|Sebulu|Tabang|Tenggarong Seberang|Tenggarong"],
    ["Kalimantan Timur","Kutai Timur","Batu Ampar|Bengalon|Busang|Kaliorang|Karangan|Kaubun|Kongbeng|Long Masengat|Muara Ancalong|Muara Bengkal|Muara Wahau|Rantau Pulung|Sandaran|Sangatta Selatan|Sangatta|Sangkulirang|Telen|Teluk Pandan"],
    ["Kalimantan Timur","Pasir","Tanjung Harapan|Batu Engau|Batu Sopang|Kuaro|Long Ikis|Long Kali|Muara Komam|Muara Samu|Pasir Balengkong|Tanah Grogot"],
    ["Kalimantan Timur","Penajam Paser Utara","Babulu|Penajam|Sepaku|Waru"],
    ["Kalimantan Timur","Samarinda","Palaran|Samarinda Ilir|Samarinda Seberang|Samarinda Ulu|Samarinda Utara|Sungai Kunjang|Loa Janan Ilir|Samarinda Kota|Samarinda Kunjang|Sambutan|Sungai Pinang"],
    ["Kepulauan Riau","Batam","Batu Ampar|Nagoya|Tiban|Sekupang|Nongsa|Pelita|Sei Panas|Bengkong|Belakang Padang|Bulang|Sagulung|Galang|Lubuk Baja|Sungai Beduk|Batu Besar|Batu Merah|Batam Centre|Punggur|Kabil|Muka Kuning|Burai|Kundur Utara|Unga|Tanjung Balai Karimun|Batu Aji|Batam Kota|Tanjung Uncang"],
    ["Kepulauan Riau","Karimun","Meral|Belat|Buru|Karimun Kota|Kundur|Kundur Barat|Moro|Tebing"],
    ["Kepulauan Riau","Lingga","Lingga Kota"],
    ["Kepulauan Riau","Natuna","Bunguran Barat|Bunguran Batubi|Bunguran Selatan|Bunguran Tengah|Bunguran Timur|Bunguran Timur Laut|Bunguran Utara|Midai|Pulau Laut|Pulau Tiga|Pulau Tiga Barat|Serasan|Serasan Timur|Suak Midai|Subi"],
    ["Kepulauan Riau","Tanjung Pinang","Trikora|Pasar Raya Bintang 21|Tanjung Pinang Kota|Tanjung Pinang Timur|Tanjung Pinang Barat|Bukit Bestari"],
    ["Kepulauan Riau","Anambas","Batu Belah|Kiabu|Nyamuk|Tarempa|Siantan|Telaga"],
    ["Kepulauan Riau","Bintan","Bintan Pesisir|Bintan Timur|Bintan Utara|Bintan Kota"],
    ["Lampung","Bandar Lampung","Teluk Betung|Kemiling|Panjang|Rajabasa|Sukabumi|Sukarame|Tanjung Karang Barat|Tanjung Karang Pusat|Tanjung Karang Timur|Tanjung Senang|Teluk Betung Barat|Teluk Betung Selatan|Teluk Betung Utara|Bumi Waras|Enggal|Kedamaian|Labuhan Ratu|Langkapura|Teluk Betung Timur|Kedaton|Way Halim|Sidomulyo|Tanjung|Kota Sepang"],
    ["Lampung","Lampung Barat","Balik Bukit|Batu Brak|Belalau|Bengkunat|Karya Penggawa|Lemong|Pesisir Selatan|Pesisir Tengah|Pesisir Utara|Sekincau|Sukau|Sumber Jaya|Suoh|Way Tenong|Air Hitam|Bandar Negeri Suoh|Batu Ketulis|Bengkunat Belimbing|Gedung Surian|Kebun Tebu|Krui Selatan|Lumbok Seminung|Ngambur|Pagar Dewa|Way Krui"],
    ["Lampung","Lampung Selatan","Candipuro|Jati Agung|Ketapang|Merbau Mataram|Natar|Palas|Penengahan|Rajabasa|Sragi|Tanjung Bintang|Bakauheni|Tanjungsari|Way Panji|Way Sulan|Kalianda|Katibung|Sidomulyo"],
    ["Lampung","Lampung Tengah","Anak Tuha|Bandar Surabaya|Bangunrejo|Bekri|Bumi Nabung|Seputih Surabaya|Trimurjo|Way Pengubuan|Way Seputih|Anak Ratu Aji|Putra Rumbia|Bandar Mataram|Bumi Ratu Nuban|Gunung Sugih|Kalirejo|Kota Gajah|Padang Ratu|Pubian|Punggur|Rumbia|Selagai Lingga|Sendang Agung|Seputih Agung|Seputih Banyak|Seputih Mataram|Seputih Raman|Terbanggi Besar|Terusan Nunyai"],
    ["Lampung","Lampung Timur","Bandar Sribawono|Batanghari Nuban|Batanghari|Braja Slebah|Bumi Agung|Purbolinggo|Raman Utara|Sekampung Udik|Sekampung|Sukadana|Waway Karya|Way Bungur|Way Jepara|Gunung Pelindung|Jabung|Labuhan Maringgai|Labuhan Ratu|Margatiga|Mataram Baru|Melinting|Metro Kibang|Pasir Sakti|Pekalongan"],
    ["Lampung","Lampung Utara","Abung Barat|Abung Selatan|Abung Semuli|Abung Surakarta|Abung Tengah|Abung Timur|Abung Kunang|Abung Pekurun|Blambangan Pagar|Hulu Sungai|Sungkai Barat|Sungkai Jaya|Sungkai Tengah|Abung Tinggi|Bukit Kemuning|Bunga Mayang|Kotabumi Selatan|Kotabumi Utara|Kotabumi|Muara Sungkai|Sungkai Selatan|Sungkai Utara|Tanjung Raja"],
    ["Lampung","Metro","Imopuro|Hadimulyo Timur|Hadimulyo Barat|Yosomulyo|Iringmulyo|Yosodadi|Yosorejo|Tejosari|Tejoagung|Mulyojati|Mulyosari|Ganjar Asri|Ganjar Agung|Banjar Sari|Karang Rejo|Purwosari|Purwoasri|Sumbersari|Margorejo|Margodadi|Metro Barat|Metro Pusat|Metro Selatan|Metro Timur|Metro Utara"],
    ["Lampung","Tanggamus","Adi Luwih|Cukuh Balak|Gading Rejo|Kelumbayan|Kota Agung|Pagelaran|Pardasuka|Talang Padang|Ulubelu|Wonosobo|Ambarawa|Banyumas|Air Naningan|Bandar Negeri Semuong|Bulok|Gisting|Kota Agung Barat|Kota Agung Pusat|Kota Agung Timur|Kelumbayan Barat|Limau|Pringsewu|Pematang Sawa|Pugung|Pulau Panggung|Semaka|Sukoharjo|Sumberejo"],
    ["Lampung","Tulang Bawang","Banjar Agung|Gedung Aji|Gedung Meneng|Gunung Terang|Lambu Kibang|Menggala|Mesuji|Penawar Tama|Rawajitu Selatan|Banjar Baru|Banjar Margo|Dente Teladas|Gedung Aji Baru|Menggala Timur|Meraksa Aji|Penawar Aji|Rawajitu Timur|Rawa Pitu|Gunung Agung|Pagar Dewa|Tumijajar|Rawajitu Utara|Simpang Pematang|Tanjung Raya|Tulang Bawang Tengah|Tulang Bawang Udik|Tumi Jajar|Way Serdang"],
    ["Lampung","Way Kanan","Bahuga|Banjit|Baradatu|Blambangan Umpu|Gunung Labuhan|Kasui|Negara Batin|Negeri Agung|Negeri Besar|Pakuan Ratu|Rebang Tangkas|Way Tuba|Bumi Agung|Buay Bahuga"],
    ["Lampung","Pesawaran","Padang Cermin|Gedong Tataan|Kedondong|Negeri Katon|Punduh Pidada|Tegineneng|Way Lima"],
    ["Lampung","Mesuji","Mesuji|Mesuji Timur|Panca Jaya|Rawa Jitu Utara|Simpang Pematang|Tanjung Raya|Way Serdang"],
    ["Lampung","Pringsewu","Adi Luwih|Ambarawa|Banyumas|Gading Rejo|Pagelaran|Pardasuka|Pringsewu|Sukoharjo"],
    ["Lampung","Pesisir Barat","Bengkunat|Bengkunat Belimbing"],
    ["Maluku","Ambon","Nusaniwe|Sirimau|Banguala|Teluk Ambon|Leitimur Selatan"],
    ["Maluku","Buru","Namlea|Ambalau|Air Buaya|Batabual|Waeapo|Waplau"],
    ["Maluku","Maluku Tengah","Amahai|Saparua|Bula|Ambalau|Kepala Madan|Leksula|Namrole|Waesama|Banda|Kota Masohi|Leihitu|Nusa Laut|Pulau Haruku|Sala Hutu|Seram Utara|Tehoru|Teon Nila Serua"],
    ["Maluku","Maluku Tenggara","Kei Besar Selatan|Kei Besar Utara Timur|Kei Besar|Kei Kecil|Pulau Pulau Kur"],
    ["Maluku","Maluku Tenggara Barat","Damer|Kormomolin|Luser|Mola|Nirunmas|Selaru|Tanimbar Selatan|Tanimbar Utara|Wer Makatian|Wertamrian|Wuarlabobar|Yaru"],
    ["Maluku","Kepulauan Aru","Aru Selatan|Aru Selatan Timur|Aru Selatan Utara|Aru Tengah|Aru Tengah Selatan|Aru Tengah Timur|Aru Utara|Aru Utara Timur Batuley|Pulau Pulau Aru Selatan|Pulau Pulau Aru Tengah|Pulau Pulau Aru"],
    ["Maluku","Maluku Barat Daya","Damer|Leti Moa Lakor|Mdona Hiera|Moa Lakor|Pulau Pulau Babar Timur|Pulau Pulau Babar|Pulau Pulau Terselatan|Wetar"],
    ["Maluku","Seram Bagian Barat","Amalatu|Kairatu|Seram Barat|Taniwel|Waisala|Bula|Pulau Pulau Gorong|Seram Timur|Werinama"],
    ["Maluku","Buru Selatan","Ambalau"],
    ["Maluku","Seram Bagian Timur","Bula Barat"],
    ["Maluku Utara","Halmahera Selatan","Bacan|Bacan Barat|Bacan Barat Utara|Bacan Selatan|Bacan Timur|Bacan Timur Selatan|Bacan Timur Tengah"],
    ["Maluku Utara","Halmahera Utara","Galela|Galela Barat|Galela Selatan|Galela Utara|Kao|Kao Barat|Kao Teluk|Kao Utara|Loloda Kepulauan|Loloda Utara|Malifut|Tobelo|Tobelo Barat|Tobelo Selatan|Tobelo Tengah|Tobelo Timur|Tobelo Utara"],
    ["Maluku Utara","Pulau Morotai","Morotai Jaya|Morotai Selatan|Morotai Selatan Barat|Morotai Timur|Morotai Utara"],
    ["Maluku Utara","Ternate","Pulau Hiri|Pulau Batang Dua|Moti|Pulau Ternate|Ternate Tengah|Ternate Selatan|Ternate Utara"],
    ["Aceh","Aceh Barat","Arongan Lambalek|Bubon|Johan Pahlawan|Kaway XVI|Meureubo|Samatiga|Sungai Mas|Woyla|Woyla Barat|Pante Ceureumen|Panton Reu|Woyla Timur"],
    ["Aceh","Aceh Barat Daya","Blangpidie|Jeumpa|Kuala Batee|Manggeng|Susoh|Tangan Tangan|Babah Rot|Lembah Sabil|Setia"],
    ["Aceh","Aceh Besar","Baitussalam|Darul Imarah|Darul Kamal|Darussalam|Indrapuri|Ingin Jaya|Kota Jantho|Krueng Barona Jaya|Kuta Baro|Kuta Cot Glie|Kuta Malaka|Lembah Seulawah|Leupung|Lho`nga|Lhoong|Mesjid Raya|Peukan Bada|Pulo Aceh|Seulimeum|Simpang Tiga|Suka Makmur|Blang Bintang|Montasik"],
    ["Aceh","Aceh Jaya","Jaya|Krueng Sabee|Panga|Sampoiniet|Setia Bakti|Teunom|Darul Hikmah"],
    ["Aceh","Aceh Selatan","Bakongan|Kluet Selatan|Kluet Utara|Labuhan Haji|Labuhan Haji Barat|Meukek|Pasie Raja|Sama Dua|Sawang|Tapak Tuan|Trumon|Bakongan Timur|Kluet Tengah|Kluet Timur|Labuhan Haji Timur|Trumon Timur"],
    ["Aceh","Aceh Singkil","Danau Paris|Gunung Meriah|Kota Baharu|Pulau Banyak|Simpang Kanan|Singkil|Singkil Utara|Singkohor|Suro Baru"],
    ["Aceh","Aceh Tamiang","Bendahara|Karang Baru|Kejuruan Muda|Kota Kuala Simpang|Manyak Payed|Rantau|Seruway|Tamiang Hulu|Banda Mulia|Bandar Pusaka"],
    ["Aceh","Aceh Tengah","Bebesen|Bies|Bintang|Celala|Ketol|Laut Tawar|Linge Isaq|Pegasing|Silih Nara|Bandar|Bukit|Atu Lintang|Jagong Jeget|Kebayakan|Kute Panang|Rusip Antara"],
    ["Aceh","Aceh Tenggara","Babul Makmur|Badar|Bambel|Darul Hasanah|Lawe Alas|Lawe Sigala Gala|Babul Rahmat|Babussalam|Bukit Tusam|Lawe Bulan"],
    ["Aceh","Aceh Timur","Banda Alam|Birem Bayeun|Darul Aman|Idi Rayeuk|Idi Tunong|Indra Makmur|Julok|Madat|Nurussalam|Peudawa|Peureulak|Peureulak Barat|Peureulak Timur|Rantau Selamat|Ranto Peureulak|Serba Jadi|Simpang Ulim|Sungai Raya|Darul Falah|Darul Iksan|Pante Beudari|Simpang Jernih"],
    ["Aceh","Aceh Utara","Baktiya|Cot Girek|Dewantara|Kuta Makmur|Lhoksukon|Matang Kuli|Matangkuli|Meurah Mulia|Muara Batu|Nibong|Nisam|Samudera|Sawang|Seunudon|Syamtalira Aron|Syamtalira Bayu|Tanah Jambo Aye|Tanah Luas|Tanah Pasir|Baktiya Barat|Banda Baro|Geureudong Pase|Langkahan|Lapang|Nisam Antara|Paya Bakong|Pirak Timu|Seunuddon|Simpang Keramat"],
    ["Aceh","Banda Aceh","Baiturrahman|Banda Raya|Jaya Baru|Kuta Alam|Kuta Raja|Lueng Bata|Meuraksa|Syiah Kuala|Ulee Kareng"],
    ["Aceh","Bener Meriah","Bener Kelipah|Bandar|Bukit|Celala|Kebayakan|Ketol|Kute Panang|Laut Tawar|Linge Isaq|Pegasing|Permata|Pintu Rime|Pintu Rime Gayo|Silih Nara|Syiah Utama|Timang Gajah|Wih Pesam"],
    ["Aceh","Bireun","Gandapura|Jangka|Jeumpa|Jeunib|Juli|Kota Juang|Kuala|Kuta Blang|Makmur|Pandrah|Peudada|Peulimbang|Peusangan|Peusangan Selatan|Peusangan Siblah Krueng|Samalanga|Simpang Mamplam"],
    ["Aceh","Gayo Luwes","Dabun Gelang|Blang Jerango|Blang Kejeren|Blang Pegayon|Debun Gelang|Kuta Panjang|Pantan Cuaca|Pinding|Putri Betung|Rikit Gaib|Terangon|Tripe Jaya"],
    ["Aceh","Langsa","Langsa Barat|Langsa Kota|Langsa Timur|Langsa Lama|Langsa Teungoh"],
    ["Aceh","Lhokseumawe","Blang Mangat|Muara Dua|Banda Sakti|Muara Satu"],
    ["Aceh","Nagan Raya","Kuala|Seunagan|Seunagan Timur|Beutong Ateuh Banggalang|Beutong|Darul Makmur"],
    ["Aceh","Pidie","Geumpang|Glumpang Tiga|Grong Grong|Indrajaya|Kembang Tanjong|Kota Sigli|Mane|Mila|Muara Tiga|Mutiara|Padang Tiji|Peukan Baro|Sakti|Simpang Tiga|Tangse|Tiro|Titeua|Bandar Baru|Bandar Dua|Batee|Delima|Glumpang Baro|Mutiara Timur"],
    ["Aceh","Sabang","Sukajaya|Sukakarya"],
    ["Aceh","Simeuleu","Simeulue Barat|Simeulue Tengah|Simeulue Timur|Teupah Barat|Teupah Selatan|Alapan|Salang|Teluk Dalam"],
    ["Aceh","Pidie Jaya","Bandar Baru|Bandar Dua|Jangka Buya|Meurah Dua|Meureudu|Panteraja|Trienggadeng|Ulim"],
    ["Aceh","Subulussalam","Longkip|Penanggalan|Rundeng|Simpang Kiri|Sultan Daulat"],
    ["Nusa Tenggara Barat","Bima","Monta|Tambora|Ambalawi|Raba|Asakota|Belo|Bolo|Donggo|Lambu|Langgudu|Mada Pangga|Rasanae Barat|Rasanae Timur|Sanggar|Sape|Wawo|Wera|Woha"],
    ["Nusa Tenggara Barat","Dompu","Kilo|Manggelewa|Pajo|Pekat|Woja|Hu'u"],
    ["Nusa Tenggara Barat","Lombok Barat","Cakranegara|Bayan|Gerung|Kediri|Lembar|Narmada|Gili Asahan|Gili Gede|Selong Belanak|Batu Layar|Gangga|Gunung Sari|Kayangan|Kuripan|Labu Api|Lingsar|Pemenang|Sekotong Tengah|Tanjung|Senggigi"],
    ["Nusa Tenggara Barat","Lombok Timur","Aikmel|Jerowaru|Keruak|Labuhan Haji|Masbagik|Montong Gading|Pringgabaya|Pringgasela|Sakra Barat|Sakra Timur|Sakra|Sambelia|Selong|Sembalun|Sikur|Suela|Sukamulia|Suralaga|Terara|Wanasaba"],
    ["Nusa Tenggara Barat","Lombok Tengah","Batukliang Utara|Batukliang|Janapria|Jonggat|Kopang|Praya Barat Daya|Praya Barat|Praya Tengah|Praya Timur|Praya|Pringgarata|Pujut"],
    ["Nusa Tenggara Barat","Mataram","Mataram Kota|Ampenan|Cakranegara"],
    ["Nusa Tenggara Barat","Sumbawa","Alas Barat|Alas|Empang|Lape Lopok|Plampang|Ropang|Brang Rea|Buer|Seketeng|Batu Lanteh|Labangka|Labuhan Badas|Lunyuk|Moyohilir|Moyohulu|Sumbawa|Utan Rhee"],
    ["Nusa Tenggara Barat","Sumbawa Barat","Taliwang|Brang Ene|Brang Rea|Jereweh|Sekongkang|Seteluk"],
    ["Nusa Tenggara Barat","Lombok Utara","Gili Trawangan|Gili Meno|Gili Air|Tanjung|Gangga|Bayan|Pemenang Timur"],
    ["Nusa Tenggara Timur","Alor","Alor Selatan|Alor Tengah Utara|Alor Timur Laut|Alor Timur|Teluk Mutiara|Alor Barat Daya|Alor Barat Laut|Pantar Barat|Pantar"],
    ["Nusa Tenggara Timur","Belu","Raihat|Atambua Barat|Atambua Selatan|Botin Leo Bele|Atambua|Kakuluk Mesak|Kobalima|Lamakmen|Malaka Barat|Malaka Tengah|Malaka Timur|Rinhat|Sasita Mean|Tasefeto Barat|Tasifeto Timur"],
    ["Nusa Tenggara Timur","Ende","Ende Timur|Lio Timur|Ndona Timur|Ndona|Detukeli|Detusoko|Ende Selatan|Ende Tengah|Ende Utara|Kelimutu|Kotabaru|Magekoba/Maurole|Maukaro|Nanga Panda|Pulau Ende|Wewaria|Wolo Waru|Wolojita"],
    ["Nusa Tenggara Timur","Flores Timur","Larantuka|Adonara|Adonara Tengah|Sababbi|Adonara Barat|Adonara Timur|Ile Boleng|Ile Mandiri|Kelubagolit|Solor Barat|Solor Timur|Tanjung Bunga|Titihena|Witihama|Wotan Ulu Mado|Wulanggitang"],
    ["Nusa Tenggara Timur","Kupang","Amarasi Barat|Amarasi Selatan|Amarasi Timur|Amfoang Barat Daya|Amfoang Barat Laut|Amfoang Selatan|Amfoang Utara|Fatuleu|Hawu Mehara|Kelapa Lima|Kupang Tengah|Kupang Timur|Maulafa|Nekemese|Oebobo|Raijua|Sabu Barat|Sabu Liae|Sabu Timur|Semau|Sulamu|Takari|Amabi Oefeto|Amfoang Tengah|Amfoang Timur|Kota Raja|Kota Lama|Alak|Amabi Oefeto Timur|Amarasi|Kupang Barat"],
    ["Nusa Tenggara Timur","Lembata","Atadei|Buyasari|Ile Ape|Lebatukan|Nagawutung|Nubatukan|Omesuri|Wulandoni"],
    ["Nusa Tenggara Timur","Manggarai","Borong|Cibal barat|Cibal|Elar|Kota Komba|Lambaleda|Langke Rembong|Mborong|Ponco Ranaka|Reo|Ruteng|Sambi Rambas|Satarmese|Wae Rii"],
    ["Nusa Tenggara Timur","Manggarai Barat","Boleng|Labuan Bajo|Komodo|Kuwus|Lembor|Macang Pacar|Sanonggoang"],
    ["Nusa Tenggara Timur","Ngada","Aesesa Selatan|Bajawa Utara|Aesesa|Aimere|Bajawa|Boawae|Jere Buu|Keo Tengah|Maupongo|Nangaroro|Ngada Bawa|Riung Barat|Riung|Soa|Wogomang Ulewa|Wolowae"],
    ["Nusa Tenggara Timur","Rote Ndao","Lobalain|Pantai Baru|Rote Barat Daya|Rote Barat Laut|Rote Tengah|Rote Timur"],
    ["Nusa Tenggara Timur","Sikka","Alok Barat|Alok Timur|Alok|Bola|Kewapante|Lela|Maumere|Mego|Nitta|Paga|Palue|Talibura|Waigete"],
    ["Nusa Tenggara Timur","Sumba Barat","Kodi|Lamboya|Kadi Bangedo|Kota Waikabuak|Laura|Loli|Tana Righu|Wanokaka|Wewena Barat|Wewena Selatan|Wewena Timur|Wewena Utara"],
    ["Nusa Tenggara Timur","Sumba Timur","Kota Waingapu|Lewa|Matawai Lapau|Kanatang|Haharu|Kahaungu Eti|Karera|Nggaha Oriangu|Paberiwai|Pahunga Lodu|Pandawai|Pinu Pahar|Rindi|Tabundung|Umalulu|Wulla Waijelu"],
    ["Nusa Tenggara Timur","Timor Tengah Selatan","Batu Putih|Amanuban Tengah|Amanuban Timur|Amanatun Selatan|Amanatun Tengah|Amanatun Timur|Amanatun Utara|Amanuban Barat|Amanuban Selatan|Boking|Fatumnasi|Kalbano|Kie|Kota Soe|Kualin|Kuan Fatu|Mollo Selatan|Mollo Utara|Nunkolo|Oenino|Polen|Tionas|Kot`olin"],
    ["Nusa Tenggara Timur","Timor Tengah Utara","Biboki Feotleu|Biboki Moenleu|Biboki Tan Pah|Bikomi Nilulat|Bikomi Selatan|Bikomi Tengah|Bikomi Utara|Biboki Anleu|Biboki Selatan|Biboki Utara|Insana Utara|Insana|Kota Kefamenanu|Miomafo Barat|Miomafo Timur|Noemuti"],
    ["Nusa Tenggara Timur","Sumba Barat Daya","Kodi|Kota Tambolaka|Kodi Bangedo|Kodi Utara|Laura|Wewewa Barat|Wewewa Selatan|Wewewa Timur|Wewewa Utara"],
    ["Nusa Tenggara Timur","Sumba Tengah","Katikutana|Mamboro|Umbu Ratu Nggay Barat|Umbu Ratu Nggay"],
    ["Nusa Tenggara Timur","Malaka","Botin Leobele"],
    ["Nusa Tenggara Timur","Manggarai Timur","Borong"],
    ["Nusa Tenggara Timur","Nagekeo","Aesesa|Aesesa Selatan|Boawae"],
    ["Papua","Biak Numfor","Aimando Padaido|Andey|Biak Barat|Biak Kota|Biak Timur|Biak Utara|Bondifuar|Bruyadori"],
    ["Papua","Boven Digoel","Ambatkwi|Arimop|Bomakia"],
    ["Papua","Jaya Wijaya","Abenaho|Apalapsili|Asologaima|Asolokobal|Asotipo|Balingga|Benawa|Bolakme|Bpiri|Bugi|Wamena"],
    ["Papua","Jayapura","Airu|Jayapura Utara|Angkasa Pura|Heram"],
    ["Papua","Keerom","Arso|Arso Timur"],
    ["Papua","Mimika","Agimuga|Alama|Amar|Timika"],
    ["Papua","Nabire","Makimi|Nabire|Nabire Barat|Napan|Siriwo|Teluk Kimi|Teluk Umar|Uwapa|Wanggar|Wapoga|Yaro Kabisai|Yaur"],
    ["Papua","Paniai","Agisiga|Aradide|Biandoga|Bibida|Bogabaida|Bowobado"],
    ["Papua","Pegunungan Bintang","Aboy|Alemsom|Awinbon|Batani|Batom|Bime|Borme"],
    ["Papua","Puncak Jaya","Agandugume|Beoga|Dagai"],
    ["Papua","Sarmi","Apawer Hulu|Bonggo|Bonggo Timur"],
    ["Papua","Tolikara","Airgaram|Anawi|Aweku|Bewani|Biuk|Bogonuk|Bokondini|Bokoneri|Danime"],
    ["Papua","Waropen","Benuki"],
    ["Papua","Yahukimo","Abenaho|Amuma|Anggruk|Apalapsili|Bomela"],
    ["Papua","Deiyai","Bowobado"],
    ["Papua","Intan Jaya","Agisiga|Biandoga"],
    ["Papua","Lanny Jaya","Awina|Ayumnati|Balingga|Balingga Barat|Bruwa|Buguk Gona"],
    ["Papua","Mamberamo Raya","Benuki"],
    ["Papua","Nduga","Alama|Dal"],
    ["Papua","Puncak","Agandugume|Beoga"],
    ["Papua","Yalimo","Abenaho|Apalapsili|Benawa"],
    ["Riau","Bengkalis","Bukit Batu|Mandau|Merbau|Pinggir|Rangsang Barat|Rangsang|Siak Kecil|Tebing Tinggi Barat|Tebing Tinggi|Bengkalis Kota|Bantan|Rupat Utara|Rupat"],
    ["Riau","Dumai","Bukit Kapur|Dumai Barat|Dumai Timur|Medang Kampai|Sungai Sembilan|Dumai Kota"],
    ["Riau","Indragiri Hilir","Teluk Balengkong|Tembilahan Hulu|Tembilahan|Tempuling|Concong|Kempas|Sungai Batang|Batang Tuaka|Enok|Gaung Anak Serka|Gaung|Kateman|Kemuning|Keritang|Kuala Indragiri|Mandah|Pelangiran|Pulau Burung|Reteh|Tanah Merah"],
    ["Riau","Indragiri Hulu","Kelayang|Lirik|Rengat|Seberida|Indragiri Hulu|Indragiri Hulu Kota|Batang Peranap|Kuala Cenaku|Lubuk Batu Jaya|Pasir Penyu|Peranap|Rakit Kulim|Rengat Barat|Sungai Lala|Batang Cenaku|Batang Gansal"],
    ["Riau","Kampar","Bangkinang|Siak Hulu|Tambang|Tapung Hilir|Tapung Hulu|Tapung|Bangkinang Kota|Kampar Kota|Koto Kampar Hulu|Bangkinang Barat|Bangkinang Seberang|Gunung Sahilan|Kampar Kiri Hilir|Kampar Kiri Hulu|Kampar Kiri|Kampar Timur|Kampar Utara|Perhentian Raja|Rumbio Jaya|Salo|XIII Koto Kampar"],
    ["Riau","Kuantan Singingi","Singingi Hilir|Singingi|Kuantan Singini Kota|Benai|Cerenti|Gunung Toar|Hulu Kuantan|Inuman|Kuantan Hilir|Kuantan Mudik|Kuantan Tengah|Logas Tanah Darat|Pangean"],
    ["Riau","Pekanbaru","Tampan|Bukit Raya|Lima Puluh|Limapuluh|Pekanbaru Kota|Rumbai|Sail|Senapelan|Sukajadi|Simpang Tiga|Panam|Tangkerang|Tenayan Raya|Hangtuah|Kubang|Garuda Sakti|Arifin Ahmad|Harapan Raya|Arengka|Sidomulyo|Bengkalis|Tuah Madani|Marpoyan Damai|Payung Sekaki|Rumbai Pesisir"],
    ["Riau","Pelalawan","Bunut|Kerumutan|Kuala Kampar|Langgam|Pangkalan Kerinci|Pangkalan Kuras|Pangkalan Lesung|Teluk Meranti|Ukui|Palalawan Kota|Bandar Petalangan|Bandar Sei Kijang"],
    ["Riau","Rokan Hilir","Bagan Sinembah|Bangko Pusako|Bangko|Kubu|Pujud|Rimba Melintang|Simpang Kanan|Sinaboi|Tanah Putih Tanjung Melawan|Tanah Putih|Rokan Hilir Kota|Kubu Babussalam|Pekaitan|Batu Hampar|Pasir Limau Kapas|Rantau Kopar"],
    ["Riau","Rokan Hulu","Bangun Purba|Rambah Hilir|Rambah Samo|Rambah|Rokan IV Koto|Tandun|Tembusai Utara|Tembusai|Rokan Hulu Kota|Bonai Darussalam|Kepenuhan Hulu|Pagaran Tapah Darussalam|Pendalian V Koto|Kabun|Kepenuhan|Kuntodarussalam|Ujung Batu"],
    ["Riau","Siak","Bukit Kapur|Bunga Raya|Dayun|Kandis|Kerinci Kanan|Lubuk Dalam|Sungai Apit|Sungai Mandau|Tualang|Siak Kota|Mempura|Pusako|Sabak Auh|Dumai Barat|Dumai Timur|Koto Gasip|Medang Kampai|Minas|Sungai Sembilan"],
    ["Riau","Sidenreng Rappang","Sindereng Rappang Kota"],
    ["Riau","Kepulauan Meranti","Tebing Tinggi Kota|Tebing Tinggi Timur"],
    ["Sulawesi Selatan","Bekasi","Cikeusik"],
    ["Sulawesi Selatan","Bantaeng","Bissappu|Eremerasa|Gantarangkeke|Pajukukang|Sinoa|Tompobulu|Uluere"],
    ["Sulawesi Selatan","Barru","Balusu|Mallusetasi|Pujananting|Soppeng Riaja|Tanete Riaja|Tanete Rilau"],
    ["Sulawesi Selatan","Bone","Amali|Mare|Ajangale|Awangpone|Barebbo|Bengo|Bontocani|Cenrana|Cina|Dua Boccoe|Kahu|Kajuara|Lamuru|Lappariaja|Libureng|Palakka|Patimpeng|Ponre|Salomekko|Sibulue|Tanete Riattang Barat|Tanete Riattang Timur|Tanete Riattang|Tellu Limpoe|Tellu Siattinge|Tonra|Ulaweng"],
    ["Sulawesi Selatan","Bulukumba","Bonto Tiro|Bonto Bahari|Bontotiro|Bulukumpa|Gantarang|Hero Lange Lange|Kajang|Kindang|Riau Ale|Ujung Bulu|Ujung Loe"],
    ["Sulawesi Selatan","Enrekang","Baroko|Bungin|Buntu Batu|Cendana|Curio|Alla Timur|Alla|Anggeraja Timur|Anggeraja|Baraka|Enrekang Selatan|Maiwa Atas|Maiwa"],
    ["Sulawesi Selatan","Gowa","Bajeng Barat|Bontolempangang|Bontonompo Selatan|Pattalassang|Bajeng|Barombong|Biringbulu|Bontomarannu|Bontonompo|Bungaya|Pallangga|Parangloe|Somba Opu|Tinggimoncong|Tombolo Pao|Tompobulu"],
    ["Sulawesi Selatan","Janeponto","Arungkeke|Bangkala Barat|Bangkala|Batang|Binamu|Bontoramba|Kelara|Tamalatea|Turatea"],
    ["Sulawesi Selatan","Pangkajene","Balocci|Bungoro|Kalukuang Masalima|Labakkang|Liukang Tangaya|Liukang Tupabbiring|Mandalle|Pangkajene|Segeri|Tondong Talasa|Ma'Rang|Minasa Te`ne"],
    ["Sulawesi Selatan","Luwu","Bua|Kamanre|Basse Sangtempe Utara|Belopa Utara|Bajo|Bassesangtempe|Belopa|Bua Ponrang|Lamasi|Larompong|Laronpong Selatan|Latimojong|Poncang|Suli|Walenrang"],
    ["Sulawesi Selatan","Luwu Timur","Angkona|Burau|Malili|Mangkutana|Nuha|Tomoni|Towuti|Wotu"],
    ["Sulawesi Selatan","Luwu Utara","Baebunta|Bone Bone|Limbong|Malangke Barat|Malangke|Mappedeceng|Masamba|Rampi|Sabbang|Seko|Sukamaju"],
    ["Sulawesi Selatan","Makassar","Alauddin|Tamalanrea|Ujung Pandang|Ujung Tanah|Wajo|Tamalate|Minasa Upa|Abdullah Daeng Sirua|Todopuli|Hertasning|Landak|Dr Ratulangi|Tanjung Bunga|Manunggal|Malengkeri|Talasalapang|Syech Yusuf|Tidung|AP Pettarani|Urip Sumoharjo|Karebosi|Tanralili|Sungguminasa|Sombaopu|Mandai|Cilalang|Maros|Banti|Murung|Mattoangin|Camba|Tanete raja|Tanete|Libureng|Lamuru|Tonra|Bontocani|Gangking|Bangkala|Bungaya|Sentral|Pettarani|Sudiang|Daya|Antang|Baji Mappakasunggu|Balang Baru|Ballaparang|Banta-Bantaeng|Bara-Baraya|Bara-Baraya Selatan|Bara-Baraya Timur|Bara-Baraya Utara|Barana|Baraya|Barombong|Barrang Caddi|Barrang Lompo|Baru|Batua|Bira|Bongaya|Bonto Biraeng|Bonto Lebang|Bonto Makkio|Bontoala Parang|Bontoala Tua|Bontorannu|Borong|Buakana|Buloa|Bulogading|Buluroken|Bunga Eja Beru|Bunga Ejaya|Butung|Camba Berua|Cambaya|Ende|Gaddong|Gunung Sari|Gusung|Jongaya|Kaluku Bodoa|Kalukuang|Kampung Buyang|Kapasa|Karampuang|Karang Anyar|Karunrung|Karuwisi|Karuwisi Utara|Kassi-Kassi|Kunjung Mae|La Latang|Labuang Baji|Lae-Lae|Lajangiru|Lakkang|Lariang Bangi|Layang|Lembo|Lette|Losari|Maccini|Maccini Gusung|Maccini Parang|Maccini Sombala|Malimongan|Malimongan Baru|Maloku|Mamajang Dalam|Mamajang Luar|Mampu|Mandala|Mangasa|Mangkura|Mannuruki|Mappala|Maradekaya|Maradekaya Selatan|Maradekaya Utara|Maricaya|Maricaya Baru|Maricaya Selatan|Mario|Masale|Melayu|Melayu Baru|Pa Baeng-Baeng|Pa Batang|Paccerakang|Pai|Pampang|Panaikang|Panambungan|Pandang|Pannampu|Parang|Parang Layang|Parang Loe|Parang Tambung|Paropo|Pattingalloang|Pattingalloang Baru|Pattunuang|Pisang Selatan|Pisang Utara|Rappojawa|Rappokalling|Sambung Jawa|Sawerigading|Sinri Jala|Sudiang Raya|Suwangga|Tabaringan|Tamalabba|Tamalanrea Indah|Tamalanrea Jaya|Tamamaung|Tamangapa|Tamarunang|Tammua|Tamparang Keke|Tanjung Merdeka|Tello Baru|Timungan Lompoa|Tompo Balang|Totaka|Ujung Pandang Baru|Untia|Wajo Baru|Wala-Walaya|Citraland|Makassar|Biring Kanaya|Bontoala|Mamajang|Manggala|Mariso|Panakukkang|Rappocini|Tallo"],
    ["Sulawesi Selatan","Maros","Lau|Maros Utara|Bontoa|Bantimurung|Camba|Cenrana|Mallawa|Mandai|Maros Baru|Marusu|Moncongloe|Simbang|Tanralili|Tompu Bulu|Turikale"],
    ["Sulawesi Selatan","Palopo","Wara Timur|Wara Barat|Telluwanua|Wara Selatan|Wara Utara|Wara"],
    ["Sulawesi Selatan","Pare-Pare","Bacukiki|Soreang|Ujung"],
    ["Sulawesi Selatan","Pinrang","Cempa|Batu Lappa|Batulappa|Duampanua|Lanrisang|Lembang|Mattiro Bulu|Paleteang|Patampanua|Suppa|Tiroang|Watang Sawitto"],
    ["Sulawesi Selatan","Selayar","Benteng|Bontoharu|Bontomanai|Bontomatene|Bontosikuyu|Pasilambena|Pasimarannu|Pasimassunggu|Takabonerate"],
    ["Sulawesi Selatan","Sinjai","Bulupoddo|Pulau Sembilan|Sinjai Barat|Sinjai Borong|Sinjai Selatan|Sinjai Tengah|Sinjai Timur|Sinjai Utara|Tellu Limpoe"],
    ["Sulawesi Selatan","Soppeng","Citta|Donri Donri|Ganra|Lalabata|Lili Riaja|Lili Rilau|Mario Riawa|Mario Riwawo"],
    ["Sulawesi Selatan","Takalar","Galesong Selatan|Galesong Utara|Mangara Bombang|Mappakasunggu|Patallassang|Polobangkeng Selatan|Polobangkeng Utara"],
    ["Sulawesi Selatan","Tana Toraja","Awan Rante Karua|Bangkelekila|Baruppu|Buntao|Buntu Pepasan|Balusu|Bituang|Bonggakaradeng|Buntao Rantebua|Makale|Mengkendek|Rantetayo|Saluputti|Sangalla|Simbuang"],
    ["Sulawesi Selatan","Wajo","Tempe|Belawa|Bola|Gilireng|Keera|Majauleng|Maniang Pajo|Penrang|Pitumpanua|Sabbang Paru|Sajoanging|Takkalalla|Tana Sitolo"],
    ["Sulawesi Selatan","Palembang","Talang Semut"],
    ["Sulawesi Selatan","Sidenreng Rappang","Baranti|Duapitue|Kulo|Maritengngae|Panca Lautang|Panca Rijang|Pitu Riase|Pitu Riawa|Sidenreng|Tellulimpo E|Watang Pulu"],
    ["Sulawesi Selatan","Toraja Utara","Buntu Pepasan|Awan Rante Karua|Balusu|Bangkelekila|Baruppu|Buntao|Kapala Pitu|Kesu|Nanggala|Rantebua|Rantepao|Rindingalo|Sanggalangi|Sesean Suloara|Sesean|Sopai|Tikala|Tondon|Sa`dan|Tallinglipu Dende` Piongan Napo"],
    ["Sulawesi Tengah","Banggai","Balantak|Balantak Selatan|Balantak Utara|Batui Selatan|Bualemo|Batui|Boalemo|Bunta|Kintom|Lamala|Luwuk|Pagimana|Toili"],
    ["Sulawesi Tengah","Banggai Kepulauan","Banggai Selatan|Banggai Tengah|Banggai Utara|Bangkurung|Buko Selatan|Bulagi Utara|Banggai|Bokan Kepulauan|Buko|Bulagi Selatan|Bulagi|Liang|Lo Bangkurung|Tinangkung|Totikum"],
    ["Sulawesi Tengah","Buol","Biau|Bokat|Bukal|Bunobogu|Gadung|Lipunoto|Momunu|Paleleh|Tiolan"],
    ["Sulawesi Tengah","Donggala","Balaesang Tanjung|Banawa Selatan|Banawa Tengah|Dampelas|Balaesang|Banawa|Damsol|Palolo|Riopakawa|Sindue|Sirenja|Sojol|Tawaeli"],
    ["Sulawesi Tengah","Morowali","Bungku Pesisir|Bungku Timur|Bahodopi|Bumi Raya|Bungku Barat|Bungku Selatan|Bungku Tengah|Bungku Utara|Lembo|Mamosalato|Menui Kepulauan|Mori Atas|Petasia|Soyo Jaya|Wita Ponda"],
    ["Sulawesi Tengah","Palu","Palu Barat|Palu Selatan|Palu Timur|Palu Utara"],
    ["Sulawesi Tengah","Parigi Moutong","Balinggi|Bolano|Ampibabo|Bolano Lambunu|Kasimbar|Mepanga|Moutong|Parigi|Sausu|Tinombo Selatan|Tinombo|Tomini|Toribulu|Torue"],
    ["Sulawesi Tengah","Poso","Poso Kota|Ampana Kota|Ampana Tete|Lage|Lore Selatan|Lore Tengah|Lore Utara|Pamona Selatan|Pamona Timur|Pamona Utara|Poso Pesisir"],
    ["Sulawesi Tengah","Toli-toli","Dako Pemean|Baolan|Basidondo|Dampal Selatan|Dampal Utara|Dondo|Galang|Lampasio|Ogo Deide|Utara Toli Toli"],
    ["Sulawesi Tengah","Sigi","Dolo Selatan|Dolo Barat|Dolo|Gumbasa|Kinovaro|Kulawi Selatan|Kulawi|Lindu|Marawola Barat|Marawola|Nokilalaki|Palolo|Pipikoro|Sigi Biromaru|Tanambulawa"],
    ["Sulawesi Tengah","Tojo Una-Una","Ampana Kota|Ampana Tete|Togean|Tojo|Batudaka|Tojo Barat|Ulu Bongka|Una Una|Walea Kepulauan"],
    ["Sulawesi Tengah","Banggai Laut","Banggai|Banggai Selatan|Banggai Tengah|Banggai Utara|Bangkurung|Bokan Kepulauan"],
    ["Sulawesi Tengah","Morowali Utara","Bungku Utara"],
    ["Sulawesi Tenggara","Bau-bau","Betoambari|Bungi|Kokalukuna|Murhum|Sorowalio|Wolio"],
    ["Sulawesi Tenggara","Buton","Batauga|Gu|Lasalimu|Batu Atas|Binongko|Kabaena Timur|Kabaena|Kadatua|Kaledupa|Kapontori|Lakudo|Lasalimu Selatan|Mawasangka Timur|Mawasangka|Pasar Wajo|Poleang Timur|Poleang|Rarowatu|Rumbia|Sampolawa|Siompu|Talaga Raya|Tomia|Wangi Wangi Selatan|Wangi Wangi"],
    ["Sulawesi Tenggara","Kendari","Abeli|Kendari Barat|Mandonga|Poasia|Wua wua|Puuwatu|Kadia|Baruga"],
    ["Sulawesi Tenggara","Kolaka","Batu Putih|Baula|Ladongi|Lambadia|Latambaga|Mowewe|Pomalaa|Samaturu|Tanggetada|Tirawuta|Uluiwoi|Watubangga|Wolo|Wundulako"],
    ["Sulawesi Tenggara","Konawe Selatan","Baito|Basala|Benua|Andoolo|Angata|Kolono|Konda|Lainea|Landono|Laonti|Moramo|Palangga|Ranomeeto|Tinanggea"],
    ["Sulawesi Tenggara","Muna","Lawa|Gorontalo|Batukara|Bone|Barangka|Batalaiworu|Bonegunu|Duruka Bone|Kabangka|Kabawo|Kambowa|Katobu|Kontunaga|Kulisusu Barat|Kulisusu Utara|Kulisusu|Kusambi|Lasalepa|Lohia|Maginti|Maligano|Napabalano|Parigi|Pasir Putih|Sawerigadi|Tikep|Tiworo Tengah|Tongkuno|Wakorumba Selatan|Wakorumba|Watopute"],
    ["Sulawesi Tenggara","Bombana","Kabaena Timur|Kabaena|Poleang Barat|Poleang Timur|Poleang|Rarowatu|Rumbia"],
    ["Sulawesi Tenggara","Kolaka Utara","Batu Putih|Kodeoha|Lasusua|Ngapa|Pakue|Ranteangin"],
    ["Sulawesi Tenggara","Konawe","Amonggedo|Anggaberi|Asinua|Besulutu|Abuki|Asera|Bondoala Sampara|Lambuya|Lasolo|Latoma|Pondidaha|Sawa|Soropia|Tongauna|Uepai|Unaaha|Wawonii|Waworete|Wawotobi|Wonggeduku"],
    ["Sulawesi Tenggara","Wakatobi","Binongko|Kaledupa|Tomia|Wangi Wangi Selatan|Wangi Wangi"],
    ["Sulawesi Tenggara","Buton Selatan","Batauga|Batu Atas"],
    ["Sulawesi Tenggara","Buton Utara","Bonegunu"],
    ["Sulawesi Tenggara","Kolaka Timur","Aere|Dangia"],
    ["Sulawesi Tenggara","Konawe Utara","Andowia|Asera"],
    ["Sulawesi Tenggara","Muna Barat","Barangka"],
    ["Sulawesi Utara","Kendari","Kema Raya"],
    ["Sulawesi Utara","Bitung","Bitung Selatan|Bitung Tengah|Bitung Timur|Bitung Utara"],
    ["Sulawesi Utara","Bolaang Mongondow","Bilalang|Bolaang Timur|Bolaangitang Timur|Bolangitang Barat|Bintauna|Bolaang|Bolang Itang|Bolang Uki|Dumoga Barat|Dumoga Timur|Dumoga Utara|Kaidipang|Kotabunan|Kotamobagu|Lolak|Lolayan|Modayag|Nuangan|Passi|Pinogaluman|Pinolosian|Poigar|Posigadan|Sangtombolang"],
    ["Sulawesi Utara","Kepulauan Talaud","Beo Selatan|Beo Utara|Damau|Beo|Essang|Gemeh|Kabaruan|Lirung|Melonguane|Nanusa|Rainis"],
    ["Sulawesi Utara","Manado","Wenang|Tuminting|Wanea|Paal Dua|Perkamil|Bunaken|Malalayang|Mapanget|Sario|Singkil|Tikala|Totobang|Minut"],
    ["Sulawesi Utara","Minahasa","Mandolang|Eris|Kakas|Kawangkoan|Kombi|Langowan Barat|Langowan Selatan|Langowan Timur|Lembean Timur|Pineleng|Remboken|Sonder|Tombariri|Tombulu|Tompaso|Tondano Barat|Tondano Selatan|Tondano Timur|Tondano Utara"],
    ["Sulawesi Utara","Minahasa Selatan","Belang|Amurang Barat|Amurang Timur|Amurang|Kumelembuay|Maesaan|Modoinding|Motoling|Ranoyapo|Sinon Sayang|Tareran|Tatapaan|Tenga|Tombasian|Tompaso Baru|Tumpaan"],
    ["Sulawesi Utara","Gorontalo Utara","Tilongkabila|Anggrek|Atinggota|Kwandang|Sumalata|Tolingula"],
    ["Sulawesi Utara","Kepulauan Sangihe","Biaro|Kendahe|Manganitu Selatan|Manganitu|Nusa Tabukan|Siau Barat Selatan|Siau Barat|Siau Timur Selatan|Siau Timur|Tabukan Selatan|Tabukan Tengah|Tabukan Utara|Tagulandang Utara|Tagulandang|Tahuna|Tamako|Tatoareng"],
    ["Sulawesi Utara","Minahasa Tenggara","Belang|Pusomaen|Ratahan|Ratatotok|Tombatu|Touluaan"],
    ["Sulawesi Utara","Minahasa Utara","Talawaan|Airmadidi|Dimembe|Kalawat|Kauditan|Kema|Likupang Barat|Likupang Timur|Wori"],
    ["Sulawesi Utara","Tomohon","Tomohon Barat|Tomohon Selatan|Tomohon Tengah|Tomohon Timur|Tomohon Utara"],
    ["Sulawesi Utara","Bolaang Mongondow Selatan","Bolaang Uki"],
    ["Sulawesi Utara","Bolaang Mongondow Utara","Bintauna|Bolangitang Barat|Bolangitang Timur"],
    ["Sulawesi Utara","Kep. Siau Tagulandang B","Biaro"],
    ["Sumatera Barat","Agam","Ampek Angkek|Ampek Nagari|Banuhampu|Baso|Candung|Lubuk Basung"],
    ["Sumatera Barat","Bukittinggi","Bukittinggi|Bukittinggi Kota"],
    ["Sumatera Barat","Limapuluh kota","Akabiluru|Bukik Barisan"],
    ["Sumatera Barat","Padang","Padang Kota|Lubuk Begalung|Nanggalo|Koto Tangah|Kuranji"],
    ["Sumatera Barat","Padang Pariaman","Batang Anai|Batang Gasan"],
    ["Sumatera Barat","Pasaman","Bonjol"],
    ["Sumatera Barat","Payakumbuh","Payakumbuh Kota"],
    ["Sumatera Barat","PSS Selatan","Airpura|Basa Ampek Balai Tapan|Batang Kapas|Bayang|Pesisir Selatan Kota"],
    ["Sumatera Barat","Solok","Bukit Sundi|Danau Kembar|Kabupaten Solok Kelurahan Simpang|Solok Kota"],
    ["Sumatera Barat","Tanah Datar","Batipuah Selatan|Batipuh"],
    ["Sumatera Barat","Dharmasraya","Asam Jujuhan|Sungai Rumbai"],
    ["Sumatera Barat","Pasaman Barat","Pasaman Barat Kota"],
    ["Sumatera Barat","Sijunjung","Sijunjung|Tanjung Gadang|Sumpur Kudus|Lubuk Tarok"],
    ["Sumatera Selatan","Banyuasin","Banyuasin II|Banyuasin III|Muara Padang|Muara Telang|Pulau Rimau|Rambutan|Rantau Bayur|Talang Kelapa|Air Kumbang|Air Salek|Banyuasin I|Betung|Makarti Jaya"],
    ["Sumatera Selatan","Lahat","Talang Padang|Tanjung Sakti|Tebing Tinggi|Ulu Musi|Jarai|Kikim Barat|Kikim Selatan|Kikim Tengah|Kikim Timur|Kota Agung|Lintang Kanan|Merapi|Muara Pinang|Mulak Ulu|Pajar Bulan|Pasemah Air Keruh|Pendopo|Pulau Pinang"],
    ["Sumatera Selatan","Lubuk Linggau","Lubuklinggau Barat I|Lubuklinggau Selatan I|Lubuklinggau Timur I|Lubuklinggau Utara I|Lubuklinggau Barat II|Lubuklinggau Selatan II|Lubuklinggau Timur II|Lubuklinggau Utara II"],
    ["Sumatera Selatan","Muara Enim","Gelumbang|Gunung Megang|Lawang Kidul|Lembak|Lubai|Muara Enim|Penukal Abab|Penukal|Tanah Abang|Tanjung Agung|Ujan Mas|Belida Darat|Belimbing|Abab Penukal Abab|Benakat|Kelekar|Muara Belida|Penukal Utara|Rambang Dangku|Rambang|Semende Darat Laut|Semende Darat Tengah|Semende Darat Ulu|Sungai Rotan|Talang Ubi"],
    ["Sumatera Selatan","Musi Banyuasin","Babat Toman|Lais|Sanga Desa|Babat Supat|Batang Harileko|Bayung Lencir|Keluang|Sekayu|Sungai Keruh|Sungai Lilin"],
    ["Sumatera Selatan","Musi Rawas","BTS Ulu|Jayaloka|Karang Dapo|Karang Jaya|Megang Sakti|Muara Beliti|Muara Kelingi|Muara Lakitan|Nibung|BKL Ulu Terawas|Muara Rupit|Purwodadi|Rawas Ilir|Rawas Ulu|Selangit|Tugumulyo|Ulu Rawas"],
    ["Sumatera Selatan","Ogan Komering Ilir","Air Sugihan|Cengal|Jejawi|Kota Kayu Agung|Lempuing|Mesuji|Pampangan|Pedamaran|Pematang Panggang|Sirah Pulau Padang|Tanjung Lubuk|Tulung Selapan"],
    ["Sumatera Selatan","Ogan Komering Ulu","Banding Agung|Belitang II|Belitang III|Buay Madang|Buay Pemaca|Buay Pemukal  P.|Buay Ranjung|Buay Sandang Aji|Cempaka|Baturaja Barat|Baturaja Timur|Lengkiti|Lubuk Batang|Pengandonan|Peninjauan|Semidang Aji|Sosoh Buay Rayap|Ulu Ogan"],
    ["Sumatera Selatan","Pagar Alam","Dempo Selatan|Dempo Utara|Pagar Alam Selatan|Pagar Alam Utara|Dempo Tengah"],
    ["Sumatera Selatan","Palembang","Alang Alang Lebar|Bukit Kecil|Gandus|Ilir Barat I|Ilir Barat II|Ilir Timur I|Ilir Timur II|Kalidoni|Kemuning|Kertapati|Plaju|Sako|Seberang Ulu I|Seberang Ulu II|Sematang Borang|Sukarame|Jakabaring|Tanjung Siapiapi"],
    ["Sumatera Selatan","Prabumulih","Cambai|Prabumulih Barat|Prabumulih Timur|Rambang Kapak Tengah"],
    ["Sumatera Selatan","Ogan Ilir","Indralaya|Muara Kuang|Pemulutan|Rantau Alai|Tanjung Batu|Tanjung Raja"],
    ["Sumatera Selatan","Ogan Komering Ulu Selatan","Buay Sandang Aji|Mekakau Ilir|Banding Agung|Buay Pemaca|Buay Runjung|Kisam Tinggi|Muaradua Kisam|Muaradua|Pulau Beringin|Simpang"],
    ["Sumatera Selatan","Ogan Komering Ulu Timur","Belitang II|Buay Madang|Buay Pemuka Peliung|Cempaka|Madang Suku I|Madang Suku II|Martapura|Semendawai Suku III|Belitang III|Belitang"],
    ["Sumatera Selatan","Penukal Abab Lematang I","Abab"],
    ["Sumatera Utara","Asahan","Air Batu|Air Joman|Bandar Pasir Mandoge|Bandar Pulau|Buntu Pane|Kisaran Barat|Kisaran Timur|Meranti|Pulau Rakyat|Sei Kepayang|Simpang Empat|Tanjung Balai|Air Putih|Aek Songsongan|Panca Arga|Pulau Bandring|Rawang|Aek Kuasan|Sei Dadap|Aek Ledong|Rahuning|Tinggi Raja|Silau Laut|Setia Janji|Sei Kepayang Barat|Sei Kepayang Timur"],
    ["Sumatera Utara","Binjai","Air Putih|Limapuluh|Medang Deras|Binjai Barat|Binjai Timur|Binjai Kota|Binjai Utara|Binjai Selatan|Sei Balai|Sei Suka|Talawi|Tanjung Tiram"],
    ["Sumatera Utara","Dairi","Lae Parira|Parbuluan|Pegagan Hilir|Sidikalang|Siempat Nempu Hilir|Siempat Nempu Hulu|Siempat Nempu|Silima Pungga Pungga|Sumbul|Tanah Pinem|Tiga Lingga|Brampu|Berampu|Gunung Sitember|Taneh Pinem|Silima Pungga-Pungga|Sitinjo"],
    ["Sumatera Utara","Deli Serdang","Bangun Purba|Batang Kuis|Beringin|Biru Biru|Galang|Gunung Meriah|Kutalimbaru|Labuhan Deli|Lubuk Pakam|Namo Rambe|Pagar Marbau|Pancur Batu|Pantai Labu|Percut Sei Tuan|Petumbak|Sibolangit|Sunggal|Tanjung Morawa|Diski|Bandar Khalifah|Deli Tua|Sinembah Tanjungmuda Hilir|Sinembah Tanjungmuda Hulu"],
    ["Sumatera Utara","Karo","Tiga Binanga|Tiga Panah|Barusjahe|Juhar|Kabanjahe|Kuta Buluh|Laubaleng|Mardinding|Merek|Munte|Payung|Simpang Empat"],
    ["Sumatera Utara","Labuhan Batu","Aek Kuo|Aek Natas|Bilah Barat|Bilah Hilir|Bilah Hulu|Aek Kanopan|Kampung Rakyat|Kota Pinang|Kualuh Hilir|Kualuh Hulu|Kualuh Leidong|Kualuh Selatan|Marbau|Na IX X|Panai Hilir|Panai Hulu|Panai Tengah|Pangkatan|Rantau Selatan|Rantau Utara|Silangkitang|Sungai Kanan|Torgamba"],
    ["Sumatera Utara","Langkat","Babalan|Kuala|Padang Tualang|Pangkalan Susu|Salapian|Sawit Seberang|Secanggang|Sei Bingai|Sei Lepan|Selesai|Stabat|Bahorok|Batang Serangan|Besitang|Binjai|Bohorok|Brandan Barat|Gebang|Hinai|Tanjung Pura|Wampu"],
    ["Sumatera Utara","Mandailing Natal","Batahan|Batang Natal|Bukit Malintang|Kotanopan|Muara Batang Gadis|Lembah Sorik Merapi|Lingga Bayu|Muara Sipongi|Natal|Panyabungan Barat|Panyabungan Kota|Panyabungan Selatan|Panyabungan Timur|Panyabungan Utara|Siabu|Tambangan|Ulu Pungkut"],
    ["Sumatera Utara","Medan","Padang Bulan|Medan Sunggal|Medan Tuntungan|Medan Amplas|Medan Denai|Medan Area|Medan Maimun|Medan Polonia|Medan Selayang|Medan Petisah|Medan Timur|Medan Perjuangan|Medan Tembung|Medan Deli|Medan Labuhan|Medan Belawan|Medan Johor|Brastagi|Tanjung Morawa|Johor|Medan Marelan|Mariendal|Medan Barat|Marelan|Medan Kota|Medan Baru|Medan Helvetia|Lubuk Pakam"],
    ["Sumatera Utara","Nias","Afulu|Alasa|Bawolato|Gido|Gunungsitoli|Hiliduho|Idano Gawo|Lahewa|Lolofitu Moi|Lotu|Mandrehe|Namohalu Esiwa|Sirombo|Tuhemberua|Alasa Talumuzoi|Botomuzoi"],
    ["Sumatera Utara","Nias Selatan","Amandraya|Gomo|Pulau Pulau Batu|Teluk Dalam|Aramo|Boronadu|Hibala|Lahusa|Lolo Wa'u|Lolomatua"],
    ["Sumatera Utara","Padang Sidempuan","Padang Sidempuan Batu Nadua|Padang Sidempuan Hutaimbaru|Padang Sidempuan Selatan|Padang Sidempuan Tenggara|Padang Sidempuan Utara"],
    ["Sumatera Utara","Pematang Siantar","Siantar Barat|Siantar Marihat|Siantar Martoba|Siantar Selatan|Siantar Timur|Siantar Utara|Siantar Marimbun|Siantar Sitalasari"],
    ["Sumatera Utara","Serdang Bedagai","Sei Rampah|Tanjung Beringin|Bintang Bayu|Bandar Khalipah|Dolok Masihul|Dolok Merawan|Kotarih|Pantai Cermin|Sipispis|Tebingtinggi|Teluk Mengkudu"],
    ["Sumatera Utara","Sibolga","Sibolga Kota|Sibolga Selatan|Sibolga Utara|Sibolga Sambas"],
    ["Sumatera Utara","Simalungun","Bandar|Hutabayu Raja|Jorlang Hataran|Pane|Pematang Bandar|Pematang Sidamanik|Purba|Bandar Huluan|Bandar Masilam|Bosar Maligas|Dolok Batunanggar|Dolok Panribuan|Dolok Pardamean|Dolok Silau|Girsang Sipangan Bolon|Gunung Malela|Gunung Maligas|Haranggaol Horisan|Hatonduhan|Jawa Maraja Bah Jambi|Panombeian Pane|Raya Kahean|Raya|Siantar|Sidamanik|Silau Kahean|Silimakuta|Tanah Jawa|Tapian Dolok|Ujung Padang"],
    ["Sumatera Utara","Tanjung Balai","Datuk Bandar|S Tualang Raso|Tanjung Balai Selatan|Tanjung Balai Utara|Teluk Nibung|Datuk Bandar Timur"],
    ["Sumatera Utara","Tapanuli Selatan","Batang Onang|Batang Toru|Dolok Sigompulon|Dolok|Halongonan|Marancar|Padang Bolak Julu|Padang Bolak|Padang Sidempuan Barat|Padang Sidempuan Timur|Portibi|Siais|Simangambat|Sipirok|Angkola Barat|Angkola Sangkunur|Angkola Selatan|Angkola Timur|Barumun|Barumun Tengah|Batang Angkola|Batang Lubu Sutam|Andam Dewi|Barus Utara|Aek Bilah|Arse|Saipar Dolok Hole|Sayur Matinggi"],
    ["Sumatera Utara","Tapanuli Utara","Siborong Borong|Sipahutar|Sipoholon|Sigotom|Silantom|Adiankoting|Garoga|Muara|Pagaran|Pahae Jae|Pahae Julu|Pangaribuan|Parmonangan|Purbatua|Siatas Barita|Simangumban"],
    ["Sumatera Utara","Tapanuli Tengah","Barus|Kolang|Lumut|Manduamas|Sibabangun|Sibolga|Sitahuis|Sorkam|Sosor Gadong|Tapian Nauli|Adman Dewi|Badiri|Sirandorung|Sorkam Barat|Tukka"],
    ["Sumatera Utara","Tebing Tinggi","Padang Hilir|Padang Hulu|Rambutan|Bajenis|Tebing Tinggi Kota"],
    ["Sumatera Utara","Toba Samosir","Lagu Boti|Lumban Julu|Porsea|Silaen|Bonatua Lunasi|Ajibata|Balige|Bor Bor|Habinsaran|Pintu Pohan Meranti|Uluan"],
    ["Sumatera Utara","Padang Lawas","Aek Nabara Barumun|Barumun Selatan|Barumun Tengah|Barumun|Batang Bulu Sutam|Batang Lubu Sutam|Huristak|Huta Raja Tinggi|Lubuk Barumun|Sibuhuan|Sosa|Ulu Barumun|Gunung Tua"],
    ["Sumatera Utara","Samosir","Harian|Pangururan|Sianjur Mula Mula|Simanindo|Nainggolan|Onan Runggu|Palipi|Ronggur Nihuta|Sitiotio"],
    ["Sumatera Utara","Padang Lawas Utara","Batang Onang"],
    ["Sumatera Utara","Pakpak Bharat","Kerajaan|Pagindar|Pergetteng getteng Sengkut|Salak|Siempat Rube|Sitellu Tai Urang Jehe|Sitellu Tai Urang Julu|Tinada"],
    ["Sumatera Utara","Hambang Hasundutan","Baktiraja|Dolok Sanggul|Lintong Nihuta|Onan Ganjang|Paranginan|Parlilitan|Pollung|Sijama Polang|Tarabintang"],
    ["Sumatera Utara","Batu-Bara","Air Putih|Lima Puluh|Medang Deras|Sei Balai|Sei Suka|Talawi|Tanjung Tiram"],
    ["Sumatera Utara","Gunung Sitoli","Gunung Sitoli Kota|Gunung Sitoli Alooa|Gunung Sitoli Barat|Gunung Sitoli Idanoi|Gunung Sitoli Selatan|Gunung Sitoli Utara"],
    ["Sumatera Utara","Nias Barat","Lahomi"],
    ["Sumatera Utara","Labuhan Batu Utara","Aek Kuo|Aek Natas"],
    ["Sumatera Utara","Nias Utara","Afulu|Alasa|Alasa Talumuzoi"],
    ["Daerah Istimewa Yogyakarta","Bantul","Bantul|Banguntapan|Sedayu|Kasihan|Piyungan|Pajangan|Sewon|Plered|Jetis|Dlingo|Pandak|Bambanglipuro|Pundong|Sanden|Kretek|Imogiri"],
    ["Daerah Istimewa Yogyakarta","Gunung Kidul","Wonosari|Patuk|Saptosari|Gendang Sari|Panggang|Ponjong|Paliyan|Semanu|Tanjungsari|Karangmojo|Purwosari|Rongkop|Ngawen|Girisubo|Semin|Tepus|Nglipar|Playen"],
    ["Daerah Istimewa Yogyakarta","Kulon Progo","Kulonprogo|Galur|Girimulyo|Kalibawang|Kokap|Lendah|Nanggulan|Panjatan|Pengasih|Samigaluh|Sentolo|Temon|Wates"],
    ["Daerah Istimewa Yogyakarta","Sleman","Sleman|Depok|Mlati|Condong Catur|Berbah|Ngemplak|Moyudan|Godean|Minggir|Gamping|Sayegan|Tempel|Turi|Prambanan|Kalasan|Pakem|Cangkringan|Caturtunggal|Cebongan|Jombor|Kaliurang|Kebonagung|Minomartani|Plosokuning|Purwomartani|Sekip|Sidoarum|Ngaglik"],
    ["Daerah Istimewa Yogyakarta","Yogyakarta","Umbulharjo|Tuparev|Sleman|Pakualaman|Gondokusuman|Mantrijeron|Kraton|Mergangsan|Kotagede|Danurejan|Gondomanan|Ngampilan|Wirobrajan|Gedong Tengen|Jetis|Tegalrejo|Demangan|Caturtunggal|Kaliurang|Sekip|Kota Baru|Maguwoharjo|Purwomartani|Minomartani|Plosokuning|Imogiri|Kulonprogo|Sidoarum|Kebonagung|Cebongan|Jombor|Seturan|Nologaten|Terban|Pogung|Bantul"],
    ["Sulawesi Barat","Majene","Banggae|Banggae Timur"],
    ["Sulawesi Barat","Mamuju Utara","Bambaira|Bambalamotu|Baras|Bulu Taba|Dapurang"],
    ["Sulawesi Barat","Mamuju","Bonehau|Budong-Budong|Kecamatan Mamuju"],
    ["Sulawesi Barat","Polewali Mandar","Allu|Anreapi|Balanipa|Binuang|Bulo|Campalagian|Polewali"],
    ["Sulawesi Barat","Mamasa","Aralle|Balla|Bambang|Buntumalangka"],
    ["Sulawesi Barat","Mamuju Tengah","Budong-Budong"],
    ["Kalimantan Utara","Bulungan","Peso Hilir|Pulau Bunyu|Sekatak|Tanjung Palas|Tanjung Palas Barat|Tanjung Palas Tengah|Tanjung Palas Timur|Tanjung Palas Utara|Tanjung Selor"],
    ["Kalimantan Utara","Malinau","Kayan Hilir|Kayan Hulu|Malinau Barat|Malinau Selatan|Malinau Utara|Mentarang|Pujungan|Sungai Boh"],
    ["Kalimantan Utara","Nunukan","Sebatik|Krayan Selatan|Krayan|Lumbis|Sebuku"],
    ["Kalimantan Utara","Tarakan","Tarakan Barat|Tarakan Tengah|Tarakan Timur|Tarakan Utara"],
    ["Kalimantan Utara","Tana Tidung","Betayau|Muruk Rian|Sesayap|Sesayap Hilir|Tana Lia"],
  ];
  const LOCATION_AREA_RECORDS = LOCATION_DIRECTORY.flatMap(([province, city, names]) => names.split('|').map((area) => ({
    area,
    city,
    province,
    areaNormalized: normalizeText(area),
    cityNormalized: normalizeText(city),
    provinceNormalized: normalizeText(province)
  })));

  const freshState = () => ({
    rawListing: '',
    parsedListing: {},
    manualOverrides: {},
    selectedUSP: CONFIG.defaults.selectedUSP.slice(),
    selectedUSPTouched: false,
    descriptionHighlights: [],
    customHighlights: [],
    preset: 'Rumah Second Semarang',
    debug: false,
    settings: { addUSPToDescription: true, originalDescription: '' },
    logs: [],
    results: [],
    warnings: []
  });

  let state = loadState();
  let panelRoot = null;
  let panel = null;
  let scanScheduled = false;
  let lastDetectedPage = 'unknown';

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null');
      if (!saved || typeof saved !== 'object') return freshState();
      const base = freshState();
      const restored = Object.assign(base, saved, { settings: Object.assign(base.settings, saved.settings || {}) });
      if (restored.parsedListing && Object.prototype.hasOwnProperty.call(restored.parsedListing, 'title')) delete restored.parsedListing.title;
      if (!Array.isArray(restored.selectedUSP)) restored.selectedUSP = CONFIG.defaults.selectedUSP.slice();
      if (!restored.selectedUSPTouched) restored.selectedUSP = Array.from(new Set(CONFIG.defaults.selectedUSP.concat(restored.selectedUSP)));
      const legacyCondition = normalizeText(restored.manualOverrides && restored.manualOverrides.condition);
      const legacyStatus = { baru: 'Baru', second: 'Second', 'aset bank': 'Aset Bank' }[legacyCondition];
      if (legacyStatus) {
        if (!Object.prototype.hasOwnProperty.call(restored.manualOverrides, 'propertyStatus')) restored.manualOverrides.propertyStatus = legacyStatus;
        delete restored.manualOverrides.condition;
      }
      return restored;
    } catch (_) { return freshState(); }
  }

  function saveState() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
    catch (error) { console.warn('[R123] Tidak dapat menyimpan state:', error); }
  }

  function log(message, kind) {
    const prefix = kind === 'warn' ? '[R123][WARN]' : '[R123]';
    const entry = prefix + ' ' + message;
    state.logs.push(entry);
    state.logs = state.logs.slice(-CONFIG.maxLogs);
    if (kind === 'warn') console.warn(entry);
    else if (state.debug) console.log(entry);
    saveState();
    updatePanel();
  }

  function setWarnings(warnings) {
    state.warnings = warnings || [];
    saveState();
    updatePanel();
  }

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().toLocaleLowerCase('id-ID');
  }

  function visible(element) {
    if (!element || !element.isConnected) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  }

  function visibleText(element) {
    return normalizeText(element && (element.innerText || element.textContent));
  }

  function queryVisible(selector, root) {
    return Array.from((root || document).querySelectorAll(selector)).find(visible) || null;
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function parseRoomCount(value) {
    const parts = String(value || '').match(/\d+/g);
    if (!parts || !parts.length) return null;
    return { main: Number(parts[0]), helper: parts.length > 1 ? parts.slice(1).reduce((sum, part) => sum + Number(part), 0) : null };
  }

  function parseLocalizedNumber(value, priceMode) {
    let text = String(value || '').replace(/[^\d.,-]/g, '');
    if (!text) return null;
    const dot = text.lastIndexOf('.');
    const comma = text.lastIndexOf(',');
    if (dot >= 0 && comma >= 0) {
      const decimal = dot > comma ? '.' : ',';
      const grouping = decimal === '.' ? ',' : '.';
      text = text.split(grouping).join('');
      text = text.replace(decimal, '.');
    } else if (dot >= 0 || comma >= 0) {
      const separator = dot >= 0 ? '.' : ',';
      const pieces = text.split(separator);
      const last = pieces[pieces.length - 1];
      if (!priceMode && last.length === 3 && pieces.length === 2) text = pieces.join('');
      else text = pieces.slice(0, -1).join('') + '.' + last;
    }
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function parseCertificate(text) {
    const value = normalizeText(text);
    if (/\b(hm|shm|hak milik|sertifikat hak milik)\b/.test(value)) return 'SHM';
    if (/\b(hgb|hak guna bangunan)\b/.test(value)) return 'HGB';
    if (/\b(hak pakai|hp)\b/.test(value)) return 'Hak Pakai';
    if (/\b(hak guna usaha|hgu)\b/.test(value)) return 'HGU';
    if (/\b(girik|letter c|letterc)\b/.test(value)) return 'Girik';
    if (/\b(strata title|strata)\b/.test(value)) return 'Strata Title';
    if (/\b(lainnya|lain)\b/.test(value)) return 'Lainnya';
    return '';
  }

  function phrasePosition(source, phrase) {
    const haystack = normalizeText(source);
    const needle = normalizeText(phrase);
    if (!haystack || !needle) return -1;
    let index = haystack.indexOf(needle);
    while (index >= 0) {
      const before = index > 0 ? haystack[index - 1] : '';
      const after = haystack[index + needle.length] || '';
      const beforeIsWord = Boolean(before && /[\p{L}\p{N}]/u.test(before));
      const afterIsWord = Boolean(after && /[\p{L}\p{N}]/u.test(after));
      if (!beforeIsWord && !afterIsWord) return index;
      index = haystack.indexOf(needle, index + 1);
    }
    return -1;
  }

  function locationAreaMatches(value) {
    const source = normalizeText(value);
    if (!source) return [];
    const matches = LOCATION_AREA_RECORDS.flatMap((record) => {
      const index = phrasePosition(source, record.areaNormalized);
      return index < 0 ? [] : [Object.assign({ index }, record)];
    });
    return matches.filter((item) => !matches.some((other) => other.areaNormalized.length > item.areaNormalized.length
      && item.index >= other.index
      && item.index + item.areaNormalized.length <= other.index + other.areaNormalized.length))
      .sort((a, b) => a.index - b.index || b.areaNormalized.length - a.areaNormalized.length);
  }

  function locationContextScore(record, value) {
    const source = normalizeText(value);
    let score = 0;
    if (phrasePosition(source, record.cityNormalized) >= 0) score += 1;
    if (phrasePosition(source, record.provinceNormalized) >= 0) score += 2;
    return score;
  }

  function findLocationArea(value, context) {
    const matches = locationAreaMatches(value);
    if (!matches.length) return null;
    matches.sort((a, b) => locationContextScore(b, context || value) - locationContextScore(a, context || value)
      || a.index - b.index
      || b.areaNormalized.length - a.areaNormalized.length);
    return matches[0];
  }

  function rawPhraseRange(source, phrase) {
    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = String(phrase || '').trim().split(/\s+/).map(escapeRegExp).join('\\s+');
    if (!pattern) return null;
    const match = new RegExp('(^|[^\\p{L}\\p{N}])(' + pattern + ')(?=$|[^\\p{L}\\p{N}])', 'iu').exec(source);
    if (!match) return null;
    const start = match.index + match[1].length;
    return { start, end: start + match[2].length };
  }

  function deriveStreetName(location) {
    const matches = locationAreaMatches(location);
    if (!matches.length) return '';
    const last = matches.reduce((best, item) => item.index > best.index
      || (item.index === best.index && item.areaNormalized.length > best.areaNormalized.length) ? item : best);
    const lastRange = rawPhraseRange(location, last.area);
    if (!lastRange) return '';
    let cutoff = lastRange.start;
    matches.filter((item) => item.index < last.index).sort((a, b) => b.index - a.index).forEach((item) => {
      const range = rawPhraseRange(location, item.area);
      if (range && range.end <= cutoff && /[,;]/.test(location.slice(range.end, cutoff))) cutoff = range.start;
    });
    return String(location).slice(0, cutoff)
      .replace(/^\s*\[[^\]]+\]\s*/, '')
      .replace(/^\s*(?:kelurahan|kecamatan|kel\.?|kec\.?|area|cluster)\b[\s,:-]*/i, '')
      .replace(/[,;]+$/g, '')
      .trim();
  }

  function normalizeLocationQuery(value) {
    const raw = String(value || '').replace(/[,.!?;]+$/g, '').trim();
    const area = findLocationArea(raw, raw);
    return area ? area.area : raw;
  }

  function parsePrice(text) {
    const fullSource = String(text || '');
    const labeledLine = fullSource.split(/\r?\n/).find((line) => /\b(harga|price)\b/i.test(line));
    const source = labeledLine || fullSource.split(/\r?\n/).filter((line) => !/\b(luas\s*tanah|luas\s*bangunan|listrik|kamar\s*tidur|kamar\s*mandi)\b/i.test(line)).join('\n');
    const match = source.match(/(?:harga|price)?\s*[:=]?\s*(\d[\d.,]*)\s*(triliun|trilyun|miliar|m|juta|jt|ribu|rb)\b/i);
    if (!match) return {};
    const unitText = normalizeText(match[2]);
    let priceUnit = 'Ribu';
    if (/^(m|miliar)$/.test(unitText)) priceUnit = 'Miliar';
    else if (/^(juta|jt)$/.test(unitText)) priceUnit = 'Juta';
    else if (/^(triliun|trilyun)$/.test(unitText)) priceUnit = 'Triliun';
    const price = parseLocalizedNumber(match[1], true);
    const negotiable = /\b(nego|nego tipis|negotiable|bisa nego)\b/i.test(source);
    return { price, priceUnit, negotiable };
  }

  function formatPriceAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return String(value == null ? '' : value).replace(/\./g, ',');
    return amount.toLocaleString('id-ID', { maximumFractionDigits: 12 });
  }

  function formatPriceInput(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return String(value == null ? '' : value).replace(/\./g, ',');
    return amount.toLocaleString('id-ID', { useGrouping: false, maximumFractionDigits: 12 });
  }

  function detectPropertyType(text) {
    const source = normalizeText(text);
    const aliases = [
      ['Ruang Usaha', /ruang usaha/], ['Apartemen', /apartemen|apartment/], ['Perkantoran', /perkantoran|kantor/],
      ['Gudang', /gudang/], ['Perkantoran', /office/], ['Pabrik', /pabrik/], ['Villa', /villa/], ['Hotel', /hotel/],
      ['Kost', /\b(kost|kos)\b/], ['Ruko', /\bruko\b/], ['Tanah', /\b(tanah|kavling|lahan)\b/], ['Rumah', /\brumah\b/]
    ];
    const found = aliases.find((item) => item[1].test(source));
    return found ? found[0] : '';
  }

  function parseUSP(text) {
    const source = normalizeText(text);
    const found = [];
    const rules = [
      ['Bisa KPR', /\b(bisa kpr|kpr tersedia|bisa kredit)\b/],
      ['Siap Huni', /\b(siap huni|langsung huni)\b/],
      ['Bebas Banjir', /\b(bebas banjir|tidak banjir|anti banjir)\b/],
      ['Full Furnished', /\b(full furnished|furnished penuh)\b/],
      ['Dekat Akses Tol', /\b(dekat tol|akses tol)\b/],
      ['Dekat Akses Bandara', /\b(dekat bandara|akses bandara)\b/],
      ['Dekat Akses Pelabuhan', /\b(dekat pelabuhan|akses pelabuhan)\b/],
      ['Dekat Pusat Perbelanjaan', /\b(dekat (?:mall|mal|pusat perbelanjaan)|akses pusat perbelanjaan)\b/],
      ['Dekat Sekolah Negeri', /\b(dekat sekolah negeri)\b/],
      ['Dekat Sekolah Internasional', /\b(dekat sekolah internasional)\b/],
      ['Dekat Universitas', /\b(dekat (?:universitas|kampus|undip|unnes|unissula|upgris))\b/],
      ['Dekat Fasilitas Kesehatan', /\b(dekat (?:rumah sakit|rs |puskesmas|fasilitas kesehatan))\b/],
      ['Cicilan Bertahap', /\b(cicilan bertahap|angsuran bertahap)\b/],
      ['Free Biaya Notaris', /\b(free biaya notaris|gratis biaya notaris)\b/],
      ['Over Kredit', /\b(over kredit|take over)\b/],
      ['Dekat Taman Kota', /\b(dekat taman kota)\b/],
      ['Dekat Landmark', /\b(dekat landmark)\b/],
      ['Dekat Tempat Wisata', /\b(dekat tempat wisata)\b/],
      ['Dekat Tempat Ibadah', /\b(dekat tempat ibadah|dekat masjid|dekat gereja)\b/],
      ['Subsidi Angsuran', /\b(subsidi angsuran|angsuran subsidi)\b/],
      ['Syariah', /\b(syariah|syaria)\b/],
      ['Lingkungan Islami', /\b(lingkungan islami)\b/],
      ['Dekat Akses KRL', /\b(dekat krl|akses krl)\b/],
      ['Dekat Akses Transjakarta', /\b(dekat transjakarta|akses transjakarta)\b/],
      ['Dekat Akses Bus Kota', /\b(dekat bus kota|akses bus kota)\b/],
      ['Dekat Akses MRT', /\b(dekat mrt|akses mrt)\b/],
      ['Dekat Akses LRT', /\b(dekat lrt|akses lrt)\b/]
    ];
    rules.forEach(([label, pattern]) => { if (pattern.test(source)) found.push(label); });
    return found;
  }

  function parseListing(raw) {
    const text = String(raw || '');
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] || '';
    const parsed = { propertyType: detectPropertyType(firstLine || text), listingType: '', propertyStatus: '', coBroke: false, locationQuery: '' };
    if (/\b(dijual|jual)\b/i.test(firstLine || text)) parsed.listingType = 'Jual';
    else if (/\b(disewakan|disewa|sewa)\b/i.test(firstLine || text)) parsed.listingType = 'Sewa';
    if (/\b(baru|new property)\b/i.test(firstLine || text)) parsed.propertyStatus = 'Baru';
    else if (/\b(second|bekas|seken)\b/i.test(firstLine || text)) parsed.propertyStatus = 'Second';
    const locationMatch = firstLine.match(/\b(?:di|in)\s+(.+)$/i);
    if (locationMatch) {
      parsed.locationRaw = locationMatch[1].replace(/[,.!?;]+$/g, '').trim();
      parsed.locationQuery = normalizeLocationQuery(parsed.locationRaw);
      parsed.street = deriveStreetName(parsed.locationRaw);
    }

    const lineValue = (pattern) => {
      const line = lines.find((item) => pattern.test(item));
      return line || '';
    };
    const area = (labelPattern) => {
      const line = lineValue(labelPattern);
      const match = line.match(/([\d][\d.,]*)/);
      return match ? parseLocalizedNumber(match[1], false) : null;
    };
    const room = (pattern) => {
      const line = lineValue(pattern);
      const match = line.match(/(\d+(?:\s*\+\s*\d+)*)/);
      if (!match) return null;
      return parseRoomCount(match[1]);
    };

    const landArea = area(/^(?:luas\s*tanah|lt)\b/i);
    const buildingArea = area(/^(?:luas\s*bangunan|lb)\b/i);
    const bedrooms = room(/^(?:kt|kamar\s*tidur)(?!\s*pembantu)\b/i);
    const bathrooms = room(/^(?:km|kamar\s*mandi)(?!\s*pembantu)\b/i);
    const helperBedroomLine = lineValue(/^kamar\s*tidur\s*pembantu\b/i);
    const helperBathroomLine = lineValue(/^kamar\s*mandi\s*pembantu\b/i);
    if (landArea != null) parsed.landArea = landArea;
    if (buildingArea != null) parsed.buildingArea = buildingArea;
    if (bedrooms != null) {
      parsed.bedrooms = bedrooms.main;
      if (bedrooms.helper != null) parsed.helperBedrooms = bedrooms.helper;
    }
    if (bathrooms != null) {
      parsed.bathrooms = bathrooms.main;
      if (bathrooms.helper != null) parsed.helperBathrooms = bathrooms.helper;
    }
    const helperBedroomCount = helperBedroomLine.match(/(\d+)/);
    const helperBathroomCount = helperBathroomLine.match(/(\d+)/);
    if (helperBedroomCount) parsed.helperBedrooms = Number(helperBedroomCount[1]);
    if (helperBathroomCount) parsed.helperBathrooms = Number(helperBathroomCount[1]);

    const electricityLine = lineValue(/^(?:daya\s*listrik|listrik)\b/i);
    const electricityMatch = electricityLine.match(/([\d][\d.,]*)\s*(?:watt|w)?\b/i);
    if (electricityMatch) parsed.electricity = parseLocalizedNumber(electricityMatch[1], false);
    const waterLine = lineValue(/^(?:sumber\s*air|air)\b/i);
    if (waterLine) {
      const labeledSource = waterLine.match(/^sumber\s*air\s*[:=-]\s*(.+)$/i) || waterLine.match(/^air\s*[:=-]\s*(.+)$/i);
      parsed.waterSourceRaw = labeledSource ? labeledSource[1].trim() : waterLine;
    }
    const certificateLine = lineValue(/^(?:sertifikat|surat)\b/i);
    const certificate = certificateLine ? parseCertificate(certificateLine) : '';
    if (certificate) parsed.certificate = certificate;
    const conditionLine = lineValue(/^(?:kondisi\s*properti|kondisi(?!\s*perabot))\b/i);
    const conditionText = normalizeText(conditionLine);
    const conditions = ['Butuh Renovasi Total', 'Butuh Minim Renovasi', 'Terenovasi', 'Bagus'];
    const condition = conditions.find((value) => conditionText.includes(normalizeText(value)));
    if (condition) parsed.condition = condition;
    const furnishingLine = lineValue(/^(?:kondisi\s*perabot(?:an)?|perabot(?:an)?)\b/i);
    const furnishingText = normalizeText(furnishingLine || text);
    const furnishing = ['Semi Furnished', 'Unfurnished', 'Furnished'].find((value) => furnishingText.includes(normalizeText(value)));
    if (furnishing) parsed.furnishing = furnishing;
    const directionLine = lineValue(/^(?:(?:arah\s*)?hadap|orientasi|menghadap)\b/i) || lines.find((line) => /\b(?:menghadap|arah\s*hadap)\b/i.test(line)) || '';
    const directions = ['Barat Daya', 'Barat Laut', 'Timur Laut', 'Tenggara', 'Selatan', 'Barat', 'Utara', 'Timur'];
    const direction = directions.find((value) => normalizeText(directionLine).includes(normalizeText(value)));
    if (direction) parsed.direction = direction;
    const floorsLine = lineValue(/^(?:jumlah\s*lantai|lantai)\b/i) || lines.find((line) => /\b\d+\s*lantai\b/i.test(line)) || '';
    const floorsMatch = floorsLine.match(/(\d+)\s*lantai\b/i) || floorsLine.match(/(\d+)/);
    if (floorsMatch) parsed.floors = Number(floorsMatch[1]);
    const roadLine = lineValue(/^(?:lebar\s*jalan)\b/i);
    const roadMatch = roadLine.match(/\b([1-4])\b/);
    if (roadMatch) parsed.roadWidth = CONFIG.roadWidths[Number(roadMatch[1])][0];

    const priceLine = lines.find((line) => /\b(harga|price)\b/i.test(line)) || text;
    const price = parsePrice(priceLine);
    if (price.price != null) parsed.price = price.price;
    if (price.priceUnit) parsed.priceUnit = price.priceUnit;
    parsed.negotiable = price.negotiable === true;
    const explicitCoBroke = text.match(/co[\s-]?broke\s*[:=]?\s*(ya|tidak|yes|no|true|false|1|0)/i);
    if (/\b(tanpa co[\s-]?broke|tidak co[\s-]?broke|no co[\s-]?broke)\b/i.test(text)) parsed.coBroke = false;
    else if (explicitCoBroke) parsed.coBroke = /^(ya|yes|true|1)$/i.test(explicitCoBroke[1]);
    else if (/\bco[\s-]?broke\b/i.test(text)) parsed.coBroke = true;

    parsed.selectedUSP = parseUSP(text);
    const descriptionMarker = lines.findIndex((line) => /^(deskripsi|description)\s*:/i.test(line));
    if (descriptionMarker >= 0) {
      parsed.description = lines.slice(descriptionMarker).join('\n').replace(/^(deskripsi|description)\s*:\s*/i, '').trim();
    }
    return parsed;
  }

  function resolveData() {
    const presetDefaults = state.preset === 'none'
      ? { certificate: 'Lainnya', condition: 'Bagus', furnishing: 'Unfurnished', coBroke: false }
      : CONFIG.preset;
    const defaults = Object.assign({}, CONFIG.defaults, presetDefaults);
    const parsed = Object.fromEntries(Object.entries(state.parsedListing || {}).filter(([, value]) => value != null && value !== ''));
    const overrides = Object.fromEntries(Object.entries(state.manualOverrides || {}).filter(([key, value]) => (key === 'roadWidth' && value != null) || (value != null && !(typeof value === 'string' && value.trim() === ''))));
    const data = Object.assign({}, defaults, parsed, overrides);
    data.coBroke = Object.prototype.hasOwnProperty.call(state.manualOverrides, 'coBroke')
      ? Boolean(state.manualOverrides.coBroke)
      : (Object.prototype.hasOwnProperty.call(state.parsedListing, 'coBroke') ? Boolean(state.parsedListing.coBroke) : false);
    if (!data.title) data.title = buildAutoTitle(data);
    return data;
  }

  function buildAutoTitle(data) {
    const type = data.propertyType || 'Rumah';
    const floors = Number(data.floors);
    const base = type + (Number.isFinite(floors) && floors > 1 ? ' ' + floors + ' Lantai' : '');
    const manualLocation = state.manualOverrides && state.manualOverrides.locationQuery;
    const location = String(manualLocation ? data.locationQuery : (data.locationRaw || data.locationQuery) || '').replace(/\b(dijual|disewa|jual|sewa)\b/ig, '').replace(/[,]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[.!?;]+$/g, '');
    const benefits = Array.from(new Set([...(state.selectedUSP || []), ...(state.descriptionHighlights || []), ...(state.customHighlights || [])]))
      .map((item) => String(item || '').trim()).filter(Boolean);
    const limit = 65;
    let title = base;
    for (const benefit of benefits) {
      const candidate = title + ' ' + benefit;
      if (candidate.length + (location ? 4 + location.length : 0) <= limit) title = candidate;
    }
    if (location) {
      const suffix = ' di ' + location;
      if ((title + suffix).length <= limit) title += suffix;
      else {
        const available = Math.max(0, limit - title.length - 4);
        if (available >= 8) title += ' di ' + location.slice(0, available).trim();
      }
    }
    return title.slice(0, limit).trim();
  }

  function descriptionItems() {
    const items = [];
    if (state.settings.addUSPToDescription) items.push(...state.selectedUSP);
    items.push(...state.descriptionHighlights, ...state.customHighlights);
    return Array.from(new Set(items.map((item) => String(item || '').trim()).filter(Boolean)));
  }

  function buildDescription() {
    const data = resolveDescriptionData();
    const original = String(state.settings.originalDescription || state.manualOverrides.description || state.parsedListing.description || '').trim();
    const manualLocation = state.manualOverrides && state.manualOverrides.locationQuery;
    const location = String(manualLocation ? data.locationQuery : (data.locationRaw || data.locationQuery) || '').trim();
    const type = data.propertyType || 'Properti';
    const transaction = data.listingType === 'Sewa' ? 'Disewakan ' : data.listingType === 'Jual' ? 'Dijual ' : '';
    const lines = [];
    if (location) lines.push(transaction + type + ' di ' + location);
    if (data.landArea != null && data.landArea !== '') lines.push('Luas Tanah ' + data.landArea + ' m²');
    if (data.buildingArea != null && data.buildingArea !== '') lines.push('Luas Bangunan ' + data.buildingArea + ' m²');
    const formatRooms = (main, helper) => main == null || main === '' ? '' : String(main) + (Number(helper) > 0 ? '+' + helper : '');
    const bedrooms = formatRooms(data.bedrooms, data.helperBedrooms);
    const bathrooms = formatRooms(data.bathrooms, data.helperBathrooms);
    if (bedrooms) lines.push('Kamar Tidur ' + bedrooms);
    if (bathrooms) lines.push('Kamar Mandi ' + bathrooms);
    if (data.electricity != null && data.electricity !== '') lines.push('Listrik ' + data.electricity + ' Watt');
    if (data.floors != null && data.floors !== '') lines.push(type + ' ' + data.floors + ' lantai');
    if (data.garage != null && data.garage !== '') lines.push('Garasi ' + data.garage);
    if (data.carport != null && data.carport !== '') lines.push('Carport ' + data.carport);
    if (data.direction) lines.push('Hadap ' + data.direction);
    if (data.roadWidth) {
      const roadLabel = CONFIG.roadWidths.find(([value]) => value === data.roadWidth);
      if (roadLabel && roadLabel[1] !== '?') lines.push('Lebar Jalan ' + roadLabel[1] + ' mobil');
    }
    if (data.waterSourceRaw) lines.push('Sumber Air ' + data.waterSourceRaw);
    if (data.price != null && data.price !== '') {
      const priceWasManuallyChanged = ['price', 'priceUnit', 'negotiable'].some((key) => Object.prototype.hasOwnProperty.call(state.manualOverrides || {}, key));
      const sourcePriceLine = !priceWasManuallyChanged && String(state.rawListing || '').split(/\r?\n/).find((line) => /^\s*(?:harga|price)\b/i.test(line));
      const suffix = { Miliar: 'M', Juta: 'juta', Triliun: 'T', Ribu: 'ribu' }[data.priceUnit] || '';
      const pricePattern = /^(\s*(?:harga|price)\s*[:=-]?\s*(?:rp\.?\s*)?)(\d[\d.,]*)/i;
      const sourceMatch = sourcePriceLine && sourcePriceLine.trim().match(pricePattern);
      if (sourceMatch) {
        const prefix = sourceMatch[1].replace(/\bprice\b/i, 'Harga');
        lines.push(prefix + formatPriceAmount(data.price) + sourcePriceLine.trim().slice(sourceMatch[0].length));
      } else {
        lines.push('Harga ' + formatPriceAmount(data.price) + suffix + (data.negotiable ? ' nego' : ''));
      }
    }
    const structured = lines.join('\n');
    let value = [original, structured].filter(Boolean).join(original && structured ? '\n\n' : '');
    const normalizedBase = normalizeText(value);
    const additions = descriptionItems().filter((item) => !normalizedBase.includes(normalizeText(item)));
    if (value.length > CONFIG.descriptionLimit) {
      return { value, omitted: additions.length, warning: 'Deskripsi asli dan data listing ' + value.length + ' karakter, melebihi batas ' + CONFIG.descriptionLimit + '; tidak diubah.' };
    }
    let included = [];
    for (const item of additions) {
      const heading = value.trim() ? '\n\nKeunggulan:\n' : 'Keunggulan:\n';
      const candidate = value + heading + included.concat(item).map((entry) => '• ' + entry).join('\n');
      if (candidate.length > CONFIG.descriptionLimit) break;
      included.push(item);
    }
    const omitted = additions.length - included.length;
    if (included.length) value += (value.trim() ? '\n\nKeunggulan:\n' : 'Keunggulan:\n') + included.map((entry) => '• ' + entry).join('\n');
    return { value, omitted, warning: omitted ? omitted + ' highlight tidak dimasukkan karena batas ' + CONFIG.descriptionLimit + ' karakter.' : '' };
  }

  function resolveDescriptionData() {
    const defaults = state.preset === 'none' ? {} : CONFIG.preset;
    return Object.assign({}, defaults, state.parsedListing || {}, state.manualOverrides || {});
  }

  function controlValue(element) {
    if (!element) return '';
    if (element.type === 'checkbox') return element.checked;
    return String(element.value || '').trim();
  }

  function setReactInput(element, value, dispatchBlur) {
    if (!element) return false;
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value') && Object.getOwnPropertyDescriptor(prototype, 'value').set;
    if (setter) setter.call(element, String(value));
    else element.value = String(value);
    ['input', 'change'].forEach((type) => element.dispatchEvent(new Event(type, { bubbles: true })));
    if (dispatchBlur !== false) element.dispatchEvent(new Event('blur', { bubbles: true }));
    return String(element.value) === String(value);
  }

  function setNativeSelect(select, value) {
    if (!select) return false;
    const option = Array.from(select.options).find((item) => item.value === String(value));
    if (!option) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value') && Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    if (setter) setter.call(select, option.value);
    else select.value = option.value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('blur', { bubbles: true }));
    return select.value === option.value;
  }

  async function setNativeSelectVerified(select, value, findCurrentSelect) {
    const option = select && Array.from(select.options).find((item) => item.value === String(value));
    if (!option) return false;
    const expected = option.value;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const current = (findCurrentSelect && findCurrentSelect()) || select;
      if (current.value !== expected) setNativeSelect(current, expected);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const live = (findCurrentSelect && findCurrentSelect()) || current;
      if (live.value === expected) return true;
    }
    return false;
  }

  function selectByText(select, text) {
    if (!select) return false;
    const wanted = normalizeText(text);
    const option = Array.from(select.options).find((item) => normalizeText(item.textContent) === wanted);
    return option ? setNativeSelect(select, option.value) : false;
  }

  function findSelectByPlaceholder(placeholder) {
    const wanted = normalizeText(placeholder);
    return Array.from(document.querySelectorAll('select')).find((select) => visible(select) && Array.from(select.options).some((option) => normalizeText(option.textContent) === wanted)) || null;
  }

  function findTextExact(text, root) {
    const wanted = normalizeText(text);
    const scope = root || document;
    return Array.from(scope.querySelectorAll('button,label,[role],span,div,p,h1,h2,h3')).filter((element) => visible(element) && visibleText(element) === wanted).sort((a, b) => a.children.length - b.children.length)[0] || null;
  }

  function findTextContaining(text, root) {
    const wanted = normalizeText(text);
    const scope = root || document;
    return Array.from(scope.querySelectorAll('button,label,[role],span,div,p,h1,h2,h3'))
      .filter((element) => visible(element) && visibleText(element).includes(wanted))
      .sort((a, b) => visibleText(a).length - visibleText(b).length || a.children.length - b.children.length)[0] || null;
  }

  function clickElement(element) {
    if (!element) return false;
    let target = element;
    for (let depth = 0; depth < 5 && target; depth += 1, target = target.parentElement) {
      if (target.matches && target.matches('button,label,[role="button"],[role="radio"],[role="option"],summary,a,[tabindex]')) {
        target.click();
        return true;
      }
    }
    element.click();
    return true;
  }

  function chooseOptionByText(text) {
    const wanted = normalizeText(text);
    const select = Array.from(document.querySelectorAll('select')).find((candidate) => visible(candidate) && Array.from(candidate.options).some((option) => normalizeText(option.textContent) === wanted));
    if (select) return selectByText(select, text);
    const exact = findTextExact(text);
    return exact ? clickElement(exact) : false;
  }

  function selectedState(element) {
    let target = element;
    for (let depth = 0; depth < 5 && target; depth += 1, target = target.parentElement) {
      if (target.matches && target.matches('input[type="checkbox"],input[type="radio"]') && target.checked) return true;
      if (target.getAttribute('aria-selected') === 'true' || target.getAttribute('aria-checked') === 'true' || target.getAttribute('aria-pressed') === 'true' || target.dataset.state === 'checked' || target.dataset.state === 'active') return true;
      const classes = typeof target.className === 'string' ? target.className : '';
      // cursor-not-allowed means disabled in this form, not necessarily selected.
      // Rumah123's selected cards use the explicit blue state classes instead.
      if (/(^|\s)(active|selected|border-primary-50|bg-primary-92|text-primary-50|ring-primary)(\s|$)/.test(classes)) return true;
      const checked = target.querySelector && target.querySelector('input[type="checkbox"]:checked,input[type="radio"]:checked');
      if (checked) return true;
    }
    return false;
  }

  async function chooseCategoryOption(text) {
    const wanted = normalizeText(text);
    const select = Array.from(document.querySelectorAll('select')).find((candidate) => visible(candidate) && Array.from(candidate.options).some((option) => normalizeText(option.textContent) === wanted));
    if (select) {
      const changed = selectByText(select, text);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return changed && Array.from(select.options).some((option) => option.selected && normalizeText(option.textContent) === wanted);
    }
    const visibleChoice = () => findTextExact(text);
    if (!visibleChoice()) await waitForText(text, document, 2500);
    const choice = visibleChoice();
    if (!choice) return false;
    clickElement(choice);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return waitUntil(() => {
      const updated = visibleChoice();
      return Boolean(updated && selectedState(updated));
    }, 1800);
  }

  function findControlByLabel(labels, selector) {
    const aliases = (Array.isArray(labels) ? labels : [labels]).map(normalizeText);
    const wantedSelector = selector || 'input:not([type="checkbox"]),textarea,select';
    for (const label of Array.from(document.querySelectorAll('label'))) {
      if (!visible(label) || !aliases.includes(visibleText(label))) continue;
      const forId = label.getAttribute('for');
      if (forId) {
        const exact = document.getElementById(forId);
        if (exact && exact.matches(wantedSelector)) return exact;
      }
      const own = label.querySelector(wantedSelector);
      if (own) return own;
    }
    const textElements = Array.from(document.querySelectorAll('span,div,p,strong,b')).filter((element) => visible(element) && aliases.includes(visibleText(element)));
    for (const textElement of textElements) {
      let parent = textElement.parentElement;
      for (let depth = 0; depth < 6 && parent; depth += 1, parent = parent.parentElement) {
        const candidates = Array.from(parent.querySelectorAll(wantedSelector)).filter(visible);
        if (candidates.length === 1) return candidates[0];
        if (candidates.length > 1 && depth <= 2) return candidates[0];
      }
    }
    const token = aliases[0].replace(/[^a-z0-9]/g, '');
    return Array.from(document.querySelectorAll(wantedSelector)).find((element) => {
      const attrs = [element.name, element.id, element.placeholder, element.getAttribute('aria-label'), element.dataset && element.dataset.testid].join(' ').toLocaleLowerCase('id-ID').replace(/[^a-z0-9]/g, '');
      return token && attrs.includes(token);
    }) || null;
  }

  function setCheckbox(checkbox, desired) {
    if (!checkbox || checkbox.type !== 'checkbox') return false;
    if (checkbox.checked !== Boolean(desired)) checkbox.click();
    return checkbox.checked === Boolean(desired);
  }

  function result(field, value, success, reason, critical) {
    const item = { field, value: value == null ? '' : value, success: Boolean(success), reason: reason || '', critical: Boolean(critical) };
    state.results.push(item);
    if (!success && reason) state.warnings.push(reason);
    updatePanel();
    return item;
  }

  function clearResults() { state.results = []; state.warnings = []; }

  function currentResultsSummary() {
    const good = state.results.filter((item) => item.success).length;
    const needsCheck = state.results.filter((item) => !item.success && !item.critical).length;
    const critical = state.results.filter((item) => !item.success && item.critical).length;
    return { good, needsCheck, critical };
  }

  function detectPage() {
    const hasVisible = (selector) => Array.from(document.querySelectorAll(selector)).some(visible);
    if (hasVisible('[data-testid="price"]') || hasVisible('[data-testid="title"]') || hasVisible('[data-testid="description"]') || hasVisible('[name="price"]')) return 'price';
    if (hasVisible('input[placeholder="Tulis Nama lokasi"]') || hasVisible('input[placeholder="Silahkan melakukan pencarian di sini"]') || hasVisible('[data-testid="certificate"]') || hasVisible('[data-testid="roomFacilities"]')) return 'specification';
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).filter(visible).map(visibleText).join(' ');
    const bodyText = visibleText(document.body);
    if (/spesifikasi|detail properti|lokasi dan spesifikasi/.test(headings)) return 'specification';
    if (/kategori properti|tipe properti|pasang iklan/.test(headings) && !/harga|deskripsi/.test(headings)) return 'category';
    if (document.getElementById('isCoBroke') && visible(document.getElementById('isCoBroke'))) return 'category';
    if (/luas tanah/.test(bodyText) && /kamar tidur/.test(bodyText)) return 'specification';
    if (/pilih tipe properti|tipe iklan/.test(bodyText)) return 'category';
    return 'unknown';
  }

  function waitUntil(predicate, timeout) {
    const limit = timeout == null ? CONFIG.timeout : timeout;
    return new Promise((resolve) => {
      let finished = false;
      let observer;
      let timer;
      const finish = (value) => {
        if (finished) return;
        finished = true;
        if (observer) observer.disconnect();
        if (timer) clearInterval(timer);
        clearTimeout(timeoutId);
        resolve(value);
      };
      const check = () => {
        try { if (predicate()) finish(true); } catch (_) { /* transient SPA state */ }
      };
      const timeoutId = setTimeout(() => finish(false), limit);
      if (document.body) {
        observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
      }
      timer = setInterval(check, 150);
      check();
    });
  }

  function waitForElement(selector, timeout) { return waitUntil(() => document.querySelector(selector), timeout).then((ok) => ok ? document.querySelector(selector) : null); }
  function waitForText(text, root, timeout) { return waitUntil(() => findTextExact(text, root), timeout).then((ok) => ok ? findTextExact(text, root) : null); }
  function findModalContainer(titleElement) {
    if (!titleElement) return null;
    const roleDialog = titleElement.closest('[role="dialog"]');
    if (roleDialog) return roleDialog;
    let parent = titleElement;
    for (let depth = 0; depth < 9 && parent; depth += 1, parent = parent.parentElement) {
      if (parent.querySelectorAll('input[type="checkbox"]').length && exactButton('Simpan', parent)) return parent;
    }
    return null;
  }

  function findModalTitle(title) {
    const wanted = normalizeText(title);
    return Array.from(document.querySelectorAll('button,label,[role],span,div,p,h1,h2,h3'))
      .filter((element) => visible(element) && visibleText(element) === wanted)
      .find((element) => Boolean(findModalContainer(element))) || null;
  }

  function waitForModal(title) {
    return waitUntil(() => findModalTitle(title), CONFIG.timeout)
      .then((ok) => ok ? findModalTitle(title) : null);
  }
  function waitForDropdownOption(select, text) { return waitUntil(() => select && Array.from(select.options).some((option) => normalizeText(option.textContent) === normalizeText(text)), CONFIG.timeout); }
  function waitForPageChange(previous) { return waitUntil(() => detectPage() !== previous && detectPage() !== 'unknown', CONFIG.timeout); }

  function exactButton(text, root) {
    return Array.from((root || document).querySelectorAll('button')).find((button) => visible(button) && visibleText(button) === normalizeText(text)) || null;
  }

  async function fillCategory(data) {
    const mappings = [['propertyType', data.propertyType, true], ['listingType', data.listingType, true], ['propertyStatus', data.propertyStatus, false]];
    for (const [field, value, critical] of mappings) {
      if (!value) continue;
      const ok = await chooseCategoryOption(value);
      result(field, value, ok, ok ? '' : 'Pilihan ' + value + ' diklik atau ditemukan tetapi halaman belum menandainya sebagai terpilih.', critical);
      if (ok) log('Pilihan terverifikasi: ' + field + ' ' + value);
    }
    const coBroke = document.getElementById('isCoBroke');
    if (coBroke) {
      const ok = setCheckbox(coBroke, data.coBroke === true);
      result('coBroke', data.coBroke === true, ok, ok ? '' : 'Checkbox Co-broke gagal diubah.', false);
      log('Setting Co-broke ' + (data.coBroke ? 'ON' : 'OFF'));
    }
    result('photoUpload', 'manual', true, 'Upload foto secara manual di Rumah123.', false);
  }

  async function ensureOptionalDetailsOpen() {
    const header = findTextContaining('Detail Tambahan (Opsional)');
    if (!header) return false;
    const details = header.closest('details');
    if (details) {
      if (!details.open) { const summary = details.querySelector('summary'); if (summary) summary.click(); }
      return true;
    }
    const contents = '[data-testid="face"],[data-testid="electricity"],[data-testid="waterSource"]';
    if (!queryVisible(contents)) {
      const clickableHeader = header.closest('.cursor-pointer') || header;
      clickElement(clickableHeader);
      return waitUntil(() => queryVisible(contents), CONFIG.timeout);
    }
    return true;
  }

  async function fillTextField(field, value, labels, critical) {
    if (value == null || value === '') return null;
    const stableSelectors = {
      street: ['input[placeholder="Contoh: Jalan Merdeka"]'],
      landArea: [
        'input[name="landSize"]', '[data-testid="landSize"] input',
        'input[id*="landSize" i]', 'input[aria-label*="Luas Tanah" i]'
      ],
      buildingArea: [
        'input[name="buildingSize"]', '[data-testid="buildingSize"] input',
        'input[id*="buildingSize" i]', 'input[aria-label*="Luas Bangunan" i]'
      ]
    };
    const resolveControl = () => {
      const selectors = stableSelectors[field] || [];
      for (const selector of selectors) {
        const match = queryVisible(selector);
        if (match) return match;
      }
      return findControlByLabel(labels, 'input:not([type="checkbox"]):not([type="radio"]),textarea');
    };
    let control = resolveControl();
    if (!control) {
      await waitUntil(() => resolveControl(), CONFIG.timeout);
      control = resolveControl();
    }
    if (!control) return result(field, value, false, 'Field ' + field + ' tidak ditemukan berdasarkan selector maupun label.', critical);
    const ready = await waitUntil(() => {
      const live = resolveControl();
      return Boolean(live && !live.disabled && !live.readOnly);
    }, field === 'street' ? 3000 : CONFIG.timeout);
    if (!ready) return result(field, value, false, 'Field ' + field + ' ditemukan tetapi masih nonaktif setelah lokasi dipilih.', critical);

    const expected = String(value);
    let ok = false;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      control = resolveControl();
      if (!control || control.disabled || control.readOnly) break;
      if (String(control.value || '').trim() === expected) { ok = true; break; }
      control.focus();
      setReactInput(control, expected);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const live = resolveControl();
      if (live && String(live.value || '').trim() === expected) { ok = true; break; }
    }
    if (ok) log('Setting ' + field + ' = ' + value);
    return result(field, value, ok, ok ? '' : 'Field ' + field + ' tidak mempertahankan nilai setelah perubahan React.', critical);
  }

  async function setAreaUnit(field) {
    const testId = field === 'landArea' ? 'landSize' : 'buildingSize';
    const findUnit = () => queryVisible('[data-testid="' + testId + '"] select');
    const ready = await waitUntil(() => findUnit(), CONFIG.timeout);
    const select = ready ? findUnit() : null;
    const option = select && Array.from(select.options).find((item) => item.value === 'SQUAREMETER' || normalizeText(item.textContent) === 'm²');
    const ok = Boolean(option && await setNativeSelectVerified(select, option.value, findUnit));
    return result(field + 'Unit', 'm²', ok, ok ? '' : 'Satuan m² untuk ' + (field === 'landArea' ? 'Luas Tanah' : 'Luas Bangunan') + ' tidak dapat dipilih.', true);
  }

  async function fillStreet(value, locationQuery) {
    const input = queryVisible('input[placeholder="Contoh: Jalan Merdeka"]');
    if (!input) return result('street', value || '', false, 'Field pencarian nama jalan tidak ditemukan.', false);
    if (input.disabled) {
      await waitUntil(() => !input.disabled, 3000);
      if (input.disabled) return result('street', value || '', false, 'Field nama jalan masih nonaktif; lokasi harus dipilih terlebih dahulu.', false);
    }
    input.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const dropdown = () => queryVisible('[data-component="dropdown"]');
    await waitUntil(dropdown, 1800);
    const search = dropdown() && queryVisible('input[placeholder="Silahkan melakukan pencarian di sini"]', dropdown());
    if (!search) return result('street', value || '', false, 'Dropdown nama jalan tidak terbuka.', false);
    const rows = () => Array.from((dropdown() || document).querySelectorAll('img[alt]')).filter((image) => visible(image) && image.alt.trim());
    const searchTerms = Array.from(new Set([value, locationQuery].map((item) => String(item || '').trim()).filter(Boolean)));
    if (!searchTerms.length) searchTerms.push('');
    let choices = [];
    let searchTerm = '';
    for (const term of searchTerms) {
      searchTerm = term;
      if (term) setReactInput(search, term, false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const tokens = normalizeText(term).split(/[^a-z0-9]+/).filter((token) => token.length > 1);
      const matchingRows = () => rows().filter((image) => tokens.every((token) => normalizeText(image.alt).includes(token)));
      await waitUntil(() => matchingRows().length > 0 || (!term && rows().length > 0), Math.min(CONFIG.timeout, 3500));
      choices = matchingRows();
      if (!choices.length && !term) choices = rows();
      if (choices.length) break;
    }
    if (!choices.length) return result('street', searchTerm, false, 'Tidak ada hasil nama jalan yang bisa dipilih.', false);
    const target = choices[0];
    let row = target;
    for (let depth = 0; depth < 6 && row && row !== dropdown(); depth += 1, row = row.parentElement) {
      if (row.classList && Array.from(row.classList).some((name) => name === 'cursor-pointer')) break;
    }
    if (!row || row === dropdown()) row = target.parentElement;
    const chosenLabel = target.alt;
    clickElement(row);
    const closed = await waitUntil(() => !dropdown(), 2500);
    const populated = await waitUntil(() => Boolean(String(input.value || '').trim()), 1800);
    const ok = closed && populated;
    if (ok) log('Memilih nama jalan dari suggestion: ' + chosenLabel);
    return result('street', chosenLabel, ok, ok ? '' : 'Suggestion jalan diklik, tetapi pilihan belum terverifikasi pada field Nama Jalan.', false);
  }

  async function setCounterByLabel(label, target) {
    if (target == null || target === '') return false;
    const wanted = normalizeText(label);
    const knownRoots = { 'kamar tidur': 'bedroom', 'kamar mandi': 'bathroom' };
    const findRoots = () => {
      const root = knownRoots[wanted] ? queryVisible('[data-testid="' + knownRoots[wanted] + '"]') : null;
      if (root) return [root];
      const roots = [];
      const labels = Array.from(document.querySelectorAll('span,div,p,label,strong')).filter((el) => visible(el) && visibleText(el) === wanted);
      labels.forEach((labelNode) => {
        let parent = labelNode;
        for (let depth = 0; depth < 7 && parent; depth += 1, parent = parent.parentElement) {
          const inputs = Array.from(parent.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])')).filter(visible);
          if (inputs.length === 1) { roots.push(parent); break; }
        }
      });
      return Array.from(new Set(roots));
    };
    await waitUntil(() => findRoots().length > 0, CONFIG.timeout);
    const desired = Math.max(0, Math.min(30, Number(target)));
    for (const candidateRoot of findRoots()) {
      const currentInput = () => {
        const liveRoot = findRoots()[0] || candidateRoot;
        return liveRoot.matches('input') ? liveRoot : Array.from(liveRoot.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])')).find(visible) || null;
      };
      let input = currentInput();
      if (!input || !visible(input)) continue;
      const currentControls = () => {
        input = currentInput();
        if (!input) return { input: null, minus: null, plus: null };
        const wrapper = input.parentElement;
        const group = wrapper && wrapper.parentElement;
        const siblings = group ? Array.from(group.children).filter((element) => element !== wrapper && element.querySelector('svg')) : [];
        let minus = siblings[0] || null;
        let plus = siblings[1] || null;
        if (!minus || !plus) {
          const buttons = Array.from(candidateRoot.querySelectorAll('button')).filter(visible);
          if (buttons.length >= 2) { minus = buttons[0]; plus = buttons[buttons.length - 1]; }
        }
        return { input, minus, plus };
      };
      for (let clicks = 0; clicks < 30; clicks += 1) {
        const controls = currentControls();
        if (!controls.input) break;
        const current = Number(controls.input.value);
        if (current === desired) return true;
        const button = current < desired ? controls.plus : controls.minus;
        if (!button) break;
        button.click();
        const changed = await waitUntil(() => {
          const live = currentInput();
          return Boolean(live && Number(live.value) !== current);
        }, 900);
        if (!changed) break;
      }
      input = currentInput();
      if (input && Number(input.value) === desired) return true;
      if (input) {
        setReactInput(input, desired);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        input = currentInput();
        if (input && Number(input.value) === desired) return true;
      }
    }
    return false;
  }

  async function fillCounter(field, label, value, critical) {
    if (value == null || value === '') return null;
    const ok = await setCounterByLabel(label, value);
    if (ok) log('Setting ' + label + ' = ' + value);
    return result(field, value, ok, ok ? '' : 'Counter ' + label + ' tidak ditemukan atau tidak terverifikasi.', critical);
  }

  function findSuggestion(query, scope) {
    const tokens = normalizeText(query).split(/[^a-z0-9]+/).filter((part) => part.length > 1);
    if (!tokens.length) return null;
    const root = scope || document;
    const expectedName = tokens[0];
    const candidates = [];
    Array.from(root.querySelectorAll('.cursor-pointer,[role="option"],li,button')).filter(visible).forEach((row) => {
      const text = visibleText(row);
      if (!text || text.length > 320 || !/\barea\b/.test(text) || !tokens.every((token) => text.includes(token))) return;
      const name = normalizeText((row.querySelector('img[alt]') && row.querySelector('img[alt]').alt) || text.split(/\n/)[0]);
      const score = name === normalizeText(query) ? 120 : name === expectedName ? 100 : name.startsWith(expectedName + ' ') ? 70 : name.startsWith(expectedName) ? 50 : 0;
      candidates.push({ target: row, score, size: text.length });
    });
    Array.from(root.querySelectorAll('img[alt]')).filter((image) => visible(image)).forEach((image) => {
      const name = normalizeText(image.alt);
      let row = image.closest('.cursor-pointer,[role="option"],button');
      if (!row) {
        row = image;
        for (let depth = 0; depth < 7 && row; depth += 1, row = row.parentElement) {
          const text = visibleText(row);
          if (text && /\barea\b/.test(text)) break;
        }
      }
      if (!row || !visible(row)) return;
      const rowText = normalizeText((row.innerText || row.textContent || '') + ' ' + image.alt);
      const nameMatches = name === expectedName || name.startsWith(expectedName + ' ') || name.startsWith(expectedName);
      const contextualMatch = tokens.slice(1).every((token) => rowText.includes(token));
      const isArea = /\barea\b/.test(rowText);
      if (!nameMatches || (!isArea && !contextualMatch)) return;
      const score = name === expectedName ? 100 : name.startsWith(expectedName + ' ') ? 70 : 50;
      candidates.push({ target: row, score, size: rowText.length });
    });
    candidates.sort((a, b) => b.score - a.score || a.size - b.size);
    if (candidates.length) return candidates[0].target;

    const options = Array.from(root.querySelectorAll('[role="option"]')).filter((element) => {
      if (!visible(element)) return false;
      const text = visibleText(element);
      return /\barea\b/.test(text) && tokens.every((token) => text.includes(token));
    });
    options.sort((a, b) => visibleText(a).length - visibleText(b).length);
    return options[0] || null;
  }

  function hasPopulatedLocation() {
    const selectors = [
      'input[placeholder="Pilih Provinsi"]',
      'input[placeholder="Pilih Kota"]',
      'input[placeholder="Pilih Area/Kelurahan/Nama Cluster"]'
    ];
    const controls = selectors.map((selector) => queryVisible(selector));
    const present = controls.filter(Boolean);
    if (present.length === controls.length) return present.every((control) => Boolean(controlValue(control)));
    if (present.length) return present.every((control) => Boolean(controlValue(control)));
    const labeled = ['Area', 'Kota', 'Provinsi'].map((label) => {
      const control = findControlByLabel(label, 'input,select');
      return control || null;
    });
    const found = labeled.filter(Boolean);
    if (found.length === 3) return found.every((control) => Boolean(controlValue(control)));
    return found.length > 0 && found.every((control) => Boolean(controlValue(control)));
  }

  function locationParts(query, data) {
    const raw = String(data && data.locationRaw || query || '').trim();
    const text = normalizeText([query, raw].filter(Boolean).join(' '));
    const directoryArea = findLocationArea(query, raw) || findLocationArea(raw, raw);
    if (directoryArea) return { area: directoryArea.area, city: directoryArea.city, province: directoryArea.province };
    const districtMatch = String(query || '').match(/\b(Semarang\s+(?:Barat|Selatan|Tengah|Timur|Utara))\b/i) || raw.match(/\b(Semarang\s+(?:Barat|Selatan|Tengah|Timur|Utara))\b/i);
    if (districtMatch) return { area: districtMatch[1].replace(/\s+/g, ' ').trim(), city: 'Semarang', province: 'Jawa Tengah' };
    if (/\bgenuk\b/.test(text) && /\bsemarang\b/.test(text)) return { area: 'Genuk', city: 'Semarang', province: 'Jawa Tengah' };
    if (/\bsemarang\b/.test(text)) {
      const areaSource = String(query || raw);
      const prefix = areaSource.replace(/\bsemarang\b.*$/i, '').replace(/[,.!?;]+$/g, '').trim();
      if (prefix) return { area: prefix, city: 'Semarang', province: 'Jawa Tengah' };
    }
    return null;
  }

  async function chooseLocationDropdown(placeholder, value) {
    if (!value) return false;
    const selector = 'input[placeholder="' + placeholder + '"]';
    const inputReady = await waitUntil(() => {
      const control = queryVisible(selector);
      return Boolean(control && !control.disabled);
    }, CONFIG.timeout);
    const input = inputReady ? queryVisible(selector) : null;
    const select = Array.from(document.querySelectorAll('select')).find((candidate) => visible(candidate) && normalizeText(candidate.getAttribute('aria-label') || candidate.name || '') === normalizeText(placeholder));
    if (select) {
      const option = Array.from(select.options).find((item) => normalizeText(item.textContent) === normalizeText(value));
      return option ? setNativeSelect(select, option.value) : false;
    }
    if (!input) return false;
    if (normalizeText(controlValue(input)) === normalizeText(value)) return true;
    setReactInput(input, value, false);
    const dropdownRoot = input.closest('.relative') || document;
    const exactOption = () => Array.from(dropdownRoot.querySelectorAll('.cursor-pointer,[role="option"],li,button'))
      .filter((element) => visible(element) && visibleText(element).includes(normalizeText(value)))
      .sort((a, b) => {
        const left = visibleText(a); const right = visibleText(b); const wanted = normalizeText(value);
        const leftRank = left === wanted ? 2 : left.startsWith(wanted + ' ') ? 1 : 0;
        const rightRank = right === wanted ? 2 : right.startsWith(wanted + ' ') ? 1 : 0;
        return rightRank - leftRank || left.length - right.length;
      })[0] || findTextExact(value, dropdownRoot);
    const isAreaField = normalizeText(placeholder).includes('area');
    const choiceReady = await waitUntil(() => (isAreaField && findSuggestion(value, dropdownRoot)) || exactOption(), CONFIG.timeout);
    if (!choiceReady) return false;
    const choice = (isAreaField && findSuggestion(value, dropdownRoot)) || exactOption();
    if (!choice) return false;
    clickElement(choice);
    return waitUntil(() => normalizeText(controlValue(input)).includes(normalizeText(value)), 1800);
  }

  async function fillStructuredLocation(query, data) {
    const parts = locationParts(query, data);
    if (!parts) return false;
    const provinceOk = await chooseLocationDropdown('Pilih Provinsi', parts.province);
    if (!provinceOk) return false;
    const cityOk = await chooseLocationDropdown('Pilih Kota', parts.city);
    if (!cityOk) return false;
    const areaOk = await chooseLocationDropdown('Pilih Area/Kelurahan/Nama Cluster', parts.area);
    if (!areaOk) return false;
    return await waitUntil(() => hasPopulatedLocation(), 1800);
  }

  async function fillLocation(query, data) {
    if (!query) return null;
    query = normalizeLocationQuery(query);
    const locationInput = queryVisible('input[placeholder="Tulis Nama lokasi"]');
    if (!locationInput) {
      const structuredOk = await fillStructuredLocation(query, data);
      return result('location', query, structuredOk || hasPopulatedLocation(), structuredOk || hasPopulatedLocation() ? '' : 'Field pencarian lokasi tidak ditemukan.', true);
    }
    const locationDropdown = () => {
      const wrapper = locationInput.closest('.relative');
      const local = wrapper && wrapper.querySelector('[data-component="dropdown"]');
      if (local && visible(local)) return local;
      return queryVisible('[data-component="dropdown"]');
    };
    const locationSearch = () => {
      const dropdown = locationDropdown();
      return dropdown && queryVisible('input[placeholder="Silahkan melakukan pencarian di sini"]', dropdown);
    };
    if (!locationSearch()) {
      clickElement(locationInput);
      await waitUntil(() => locationSearch(), CONFIG.timeout);
    }
    const searchInput = locationSearch();
    if (!searchInput) {
      const structuredOk = await fillStructuredLocation(query, data);
      return result('location', query, structuredOk, structuredOk ? '' : 'Popup pencarian lokasi tidak membuka input pencarian.', true);
    }
    searchInput.focus();
    setReactInput(searchInput, query, false);
    const popup = locationDropdown();
    const appeared = await waitUntil(() => findSuggestion(query, popup), CONFIG.timeout);
    const suggestion = appeared && findSuggestion(query, popup);
    if (!suggestion) {
      const structuredOk = await fillStructuredLocation(query, data);
      return result('location', query, structuredOk, structuredOk ? '' : 'Suggestion lokasi tidak terdeteksi dan fallback Provinsi/Kota/Area gagal untuk "' + query + '".', true);
    }
    clickElement(suggestion);
    await waitUntil(() => !findSuggestion(query, locationDropdown()), 1800);
    let ok = await waitUntil(() => hasPopulatedLocation(), CONFIG.timeout);
    if (!ok) ok = await fillStructuredLocation(query, data);
    if (ok) log('Memilih suggestion lokasi ' + query);
    return result('location', query, ok, ok ? '' : 'Suggestion lokasi diklik, tetapi area belum dapat diverifikasi.', true);
  }

  function selectCertificate(certificate) {
    return selectCardOption('certificate', 'Sertifikat', certificate);
  }

  async function selectCardOption(field, groupLabel, value) {
    if (!value) return null;
    const findGroup = () => {
      const groups = Array.from(document.querySelectorAll('[data-testid="' + field + '"]')).filter(visible);
      return groups.find((element) => visibleText(element).startsWith(normalizeText(groupLabel))) || null;
    };
    const radioLabel = (radio) => {
      if (!radio) return null;
      if (radio.closest('label')) return radio.closest('label');
      if (radio.id) {
        const escapedId = window.CSS && window.CSS.escape ? window.CSS.escape(radio.id) : radio.id.replace(/[^a-z0-9_-]/gi, '\\$&');
        const linked = document.querySelector('label[for="' + escapedId + '"]');
        if (linked) return linked;
      }
      return radio.closest('.cursor-pointer,[role="radio"]');
    };
    const findRadio = (group) => {
      if (!group) return null;
      const wanted = normalizeText(value);
      return Array.from(group.querySelectorAll('input[type="radio"]')).find((radio) => {
        const label = radioLabel(radio);
        const text = normalizeText([
          radio.value,
          radio.getAttribute('aria-label'),
          radio.id,
          label && visibleText(label)
        ].filter(Boolean).join(' '));
        return normalizeText(radio.value) === wanted || normalizeText(radio.getAttribute('aria-label')) === wanted || text === wanted || text.includes(wanted);
      }) || null;
    };
    const findChoice = () => {
      const group = findGroup();
      if (!group) return null;
      const radio = findRadio(group);
      if (radio) return { group, target: radio, card: radioLabel(radio) || radio, radio };
      const image = Array.from(group.querySelectorAll('img[alt]')).find((candidate) => normalizeText(candidate.alt) === normalizeText(value));
      // Prefer the visible option label: Rumah123's category selectors use this same target pattern.
      let target = findTextExact(value, group) || image;
      if (!target) return null;
      let card = target;
      while (card && card !== group) {
        if (card.matches && card.matches('button,label,[role="button"],[role="radio"],[role="option"],[tabindex],.cursor-pointer,.cursor-not-allowed')) break;
        card = card.parentElement;
      }
      return { group, target, card: card && card !== group ? card : target, radio: null };
    };
    const isChoiceSelected = (choice) => {
      if (!choice) return false;
      const card = choice.card || choice.target;
      const radio = choice.radio || (card.matches && card.matches('input[type="radio"]') ? card : card.querySelector('input[type="radio"]')) || findRadio(choice.group);
      if (radio) return radio.checked;
      if (card.matches && card.matches('[role="radio"],[role="option"]')) {
        const checked = card.getAttribute('aria-checked') === 'true' || card.getAttribute('aria-selected') === 'true';
        if (checked) return true;
      }
      const classes = card.classList ? card.classList : null;
      if (classes && classes.contains('bg-primary-92') && classes.contains('border-primary-50')) return true;
      return false;
    };
    const activateChoice = (choice) => {
      if (!choice) return false;
      const card = choice.card || choice.target;
      const radio = choice.radio || (card.matches && card.matches('input[type="radio"]') ? card : card.querySelector('input[type="radio"]'));
      if (radio) {
        if (!radio.checked) {
          const label = radioLabel(radio);
          if (label) clickElement(label);
          else radio.click();
        }
        return true;
      }
      // The Rumah123 choice cards have no radio input. Click the matching icon/text
      // itself so React's bubbling click handler receives the same target as a user click.
      return clickElement(choice.target);
    };
    await waitUntil(() => findChoice(), CONFIG.timeout);
    const initialChoice = findChoice();
    if (!initialChoice) return result(field, value, false, 'Pilihan ' + groupLabel + ' ' + value + ' tidak ditemukan.', false);
    if (!isChoiceSelected(initialChoice)) activateChoice(initialChoice);
    const ok = await waitUntil(() => {
      const liveChoice = findChoice();
      return Boolean(liveChoice && isChoiceSelected(liveChoice));
    }, 2600);
    if (ok) log('Pilihan ' + groupLabel + ' terverifikasi: ' + value);
    return result(field, value, ok, ok ? '' : 'Pilihan ' + groupLabel + ' diklik tetapi belum terverifikasi sebagai terpilih.', false);
  }

  async function fillRoadWidth(value) {
    if (!value) return null;
    const findRoadSelect = () => findSelectByPlaceholder('Pilih Lebar Jalan');
    const select = findRoadSelect();
    if (!select) return result('roadWidth', value, false, 'Select Lebar Jalan tidak ditemukan.', false);
    const desiredLabel = CONFIG.roadWidths.find(([optionValue]) => optionValue === value);
    const wantedNumber = desiredLabel && desiredLabel[1];
    const option = Array.from(select.options).find((item) => item.value === value)
      || Array.from(select.options).find((item) => wantedNumber && (normalizeText(item.textContent) === 'seukuran ' + wantedNumber + ' mobil' || normalizeText(item.textContent) === wantedNumber));
    const ok = option ? await setNativeSelectVerified(select, option.value, findRoadSelect) : false;
    if (ok) log('Setting road width ' + value);
    return result('roadWidth', value, ok, ok ? '' : (option ? 'Lebar Jalan ' + wantedNumber + ' mobil belum terkonfirmasi setelah dipilih.' : 'Pilihan Lebar Jalan ' + value + ' tidak tersedia.'), false);
  }

  async function fillElectricity(value) {
    if (value == null || value === '') return null;
    const findElectricitySelect = () => queryVisible('[data-testid="electricity"] select');
    const select = findElectricitySelect();
    if (!select) return result('electricity', value, false, 'Field daya listrik tidak ditemukan.', false);
    const wanted = String(Number(value));
    const option = Array.from(select.options).find((item) => {
      const optionValue = String(item.value || '').replace(/^w/i, '');
      const optionText = normalizeText(item.textContent).replace(/\s*w(?:att)?$/, '');
      return optionValue === wanted || optionText === normalizeText(wanted);
    });
    if (!option) {
      log('Electricity ' + wanted + ' exact match not found', 'debug');
      return result('electricity', wanted, false, 'Daya listrik ' + wanted + 'W tidak tersedia di Rumah123.', false);
    }
    const ok = await setNativeSelectVerified(select, option.value, findElectricitySelect);
    return result('electricity', wanted, ok, ok ? '' : 'Daya listrik ' + wanted + 'W belum terkonfirmasi setelah dipilih.', false);
  }

  function mapWaterSource(raw) {
    const text = normalizeText(raw).replace(/^air\s+/, '');
    if (/^(pam|pdam|pam atau pdam)$/.test(text)) return 'PAM_OR_PDAM';
    if (/^(sumur bor|bor)$/.test(text)) return 'DRILL';
    if (/^(artetis|artesis|sumur artetis|sumur artesis)$/.test(text)) return 'DRILL';
    if (/^(sumur pompa|pompa)$/.test(text)) return 'PUMP';
    if (/^sumur resapan$/.test(text)) return 'INFILTRATION';
    if (/^sumur galian$/.test(text)) return 'EXCAVATION';
    return '';
  }

  function fillWaterSource(raw, manualValue) {
    const value = manualValue || mapWaterSource(raw);
    if (!value) {
      if (raw) log('Water source raw value "' + raw + '" not mapped.', 'warn');
      return result('waterSource', raw || '', false, raw ? 'Sumber Air "' + raw + '" tidak memiliki exact mapping. Silakan pilih sumber air secara manual.' : 'Sumber air belum dipilih.', false);
    }
    const select = queryVisible('[data-testid="waterSource"] select');
    if (!select) return result('waterSource', value, false, 'Field sumber air tidak ditemukan.', false);
    const ok = setNativeSelect(select, value);
    return result('waterSource', value, ok, ok ? '' : 'Pilihan sumber air tidak tersedia.', false);
  }

  function setCheckboxById(id, desired) {
    return setCheckbox(document.getElementById(id), desired);
  }

  function fillRoomFacilities(names) {
    CONFIG.roomFacilities.forEach((idName) => {
      const desired = (names || []).includes(idName);
      const ok = setCheckboxById('roomFacilities-' + idName, desired);
      result('roomFacility:' + idName, desired, ok, ok ? '' : 'Fasilitas rumah ' + idName + ' tidak ditemukan.', false);
    });
  }

  function fillResidentialFacilities(names) {
    CONFIG.residentialFacilities.forEach((idName) => {
      const desired = (names || []).includes(idName);
      const ok = setCheckboxById('residentialFacilities-' + idName, desired);
      result('residentialFacility:' + idName, desired, ok, ok ? '' : 'Fasilitas perumahan ' + idName + ' tidak ditemukan.', false);
    });
  }

  function findUSPTrigger() {
    const addButton = findTextExact('Tambah Keunggulan Properti');
    if (addButton) return addButton;
    const title = findTextExact('Keunggulan Properti (USP)') || findTextExact('Keunggulan Properti');
    if (!title) return null;
    let target = title;
    for (let depth = 0; depth < 5 && target; depth += 1, target = target.parentElement) {
      if (target.matches && target.matches('button,[role="button"],[tabindex]')) return target;
    }
    return null;
  }

  function uspAlreadyApplied() {
    const wanted = (state.selectedUSP || []).map(normalizeText).filter(Boolean);
    if (!wanted.length) return true;
    const scopes = Array.from(document.querySelectorAll('section,fieldset,[data-testid],button,div')).filter((element) => {
      if (!visible(element)) return false;
      const text = visibleText(element);
      return /keunggulan properti/.test(text) && wanted.every((label) => text.includes(label));
    }).sort((a, b) => visibleText(a).length - visibleText(b).length);
    return scopes.length > 0;
  }

  async function fillUSPs() {
    if (!state.selectedUSP.length && !state.selectedUSPTouched) return;
    const title = findUSPTrigger();
    if (!title) {
      const alreadyApplied = uspAlreadyApplied();
      if (state.selectedUSP.length) result('usp', state.selectedUSP.join(', '), alreadyApplied, alreadyApplied ? '' : 'Field Keunggulan Properti tidak ditemukan; USP belum diterapkan.', false);
      return;
    }
    clickElement(title);
    const modalTitle = await waitForModal('Keunggulan Properti');
    if (!modalTitle) return result('usp', state.selectedUSP.join(', '), false, 'Modal Keunggulan Properti tidak terbuka.', false);
    const modal = findModalContainer(modalTitle);
    if (!modal) return result('usp', state.selectedUSP.join(', '), false, 'Container modal USP tidak dapat dipastikan.', false);
    const saveButton = exactButton('Simpan', modal) || exactButton('Simpan');
    const known = CONFIG.mainUSP.concat(CONFIG.moreUSP);
    const wanted = new Set(state.selectedUSP);
    let failures = [];
    known.forEach((label) => {
      const checkbox = document.getElementById(label);
      if (!checkbox || checkbox.type !== 'checkbox') {
        if (wanted.has(label)) failures.push(label);
        return;
      }
      if (!modal.contains(checkbox)) return;
      if (checkbox.checked !== wanted.has(label)) checkbox.click();
    });
    if (failures.length) result('usp', failures.join(', '), false, 'USP tidak tersedia di modal: ' + failures.join(', '), false);
    if (!saveButton) return result('usp', state.selectedUSP.join(', '), false, 'Tombol Simpan modal Keunggulan Properti tidak ditemukan.', false);
    saveButton.click();
    await waitUntil(() => !findModalTitle('Keunggulan Properti'), CONFIG.timeout);
    const ok = failures.length === 0;
    log('USP diperbarui (' + state.selectedUSP.length + ' dipilih)');
    return result('usp', state.selectedUSP.join(', '), ok, ok ? '' : 'Sebagian USP perlu diperiksa.', false);
  }

  async function fillSpecification(data) {
    const optionalData = ['direction', 'electricity', 'waterSourceRaw', 'waterSource', 'roadWidth'].some((key) => data[key] != null && data[key] !== '') || Boolean(data.roomFacilitiesTouched || data.residentialFacilitiesTouched);
    let locationReady = hasPopulatedLocation();
    if (data.locationQuery) {
      const locationResult = await fillLocation(data.locationQuery, data);
      locationReady = locationResult.success || hasPopulatedLocation();
    } else if (!locationReady) result('location', '', false, 'Lokasi belum dipilih.', true);
    await fillTextField('landArea', data.landArea, ['Luas Tanah', 'LT'], true);
    if (data.landArea != null && data.landArea !== '') await setAreaUnit('landArea');
    await fillTextField('buildingArea', data.buildingArea, ['Luas Bangunan', 'LB'], false);
    if (data.buildingArea != null && data.buildingArea !== '') await setAreaUnit('buildingArea');
    await fillCounter('bedrooms', 'Kamar Tidur', data.bedrooms, false);
    await fillCounter('bathrooms', 'Kamar Mandi', data.bathrooms, false);
    await fillCounter('helperBedrooms', 'Kamar Tidur Pembantu', data.helperBedrooms, false);
    await fillCounter('helperBathrooms', 'Kamar Mandi Pembantu', data.helperBathrooms, false);
    await fillCounter('floors', 'Jumlah Lantai', data.floors, false);
    await fillCounter('garage', 'Garasi', data.garage, false);
    await fillCounter('carport', 'Carport', data.carport, false);
    await selectCertificate(data.certificate);
    if (data.condition) await selectCardOption('condition', 'Kondisi Properti', data.condition);
    if (data.furnishing) {
      const furnishingValue = normalizeText(data.furnishing) === 'full furnished' ? 'Furnished' : data.furnishing;
      await selectCardOption('condition', 'Kondisi Perabotan', furnishingValue);
    }
    if (optionalData) await ensureOptionalDetailsOpen();
    if (data.direction) await selectCardOption('face', 'Hadap', data.direction);
    else result('direction', '', false, 'Hadap belum ada di data listing atau Quick Fill, jadi perlu dipilih manual.', false);
    if (data.roadWidth) await fillRoadWidth(data.roadWidth);
    if (data.electricity != null) await fillElectricity(data.electricity);
    if (data.waterSourceRaw || data.waterSource) fillWaterSource(data.waterSourceRaw, data.waterSource);
    if (data.roomFacilitiesTouched) fillRoomFacilities(data.roomFacilities || []);
    if (data.residentialFacilitiesTouched) fillResidentialFacilities(data.residentialFacilities || []);
    await fillUSPs();
    // Jalan uses a remote suggestion search that can take several seconds. Fill the rest first.
    if (locationReady) await fillStreet(data.street || '', data.locationQuery);
  }

  function fillPriceAndCopy(data) {
    const priceBox = queryVisible('[data-testid="price"]');
    const priceInput = queryVisible('[data-testid="price"] input[name="price"]') || queryVisible('input[name="price"]');
    if (data.price != null && data.price !== '') {
      const numericPrice = Number(data.price);
      const inputValue = priceInput && priceInput.type === 'number' ? String(numericPrice) : formatPriceInput(numericPrice);
      const setOk = priceInput ? setReactInput(priceInput, inputValue) : false;
      const enteredPrice = priceInput ? parseLocalizedNumber(priceInput.value, true) : null;
      const ok = setOk && enteredPrice != null && Math.abs(enteredPrice - numericPrice) < 1e-9;
      result('price', formatPriceInput(numericPrice), ok, ok ? '' : 'Input harga tidak ditemukan atau nilainya tidak terverifikasi.', true);
      if (ok) log('Setting price ' + formatPriceInput(numericPrice) + ' ' + (data.priceUnit || ''));
    }
    if (data.priceUnit && priceBox) {
      const unitSelect = priceBox.querySelector('select');
      const ok = unitSelect ? selectByText(unitSelect, data.priceUnit) : false;
      result('priceUnit', data.priceUnit, ok, ok ? '' : 'Satuan harga ' + data.priceUnit + ' tidak tersedia.', false);
    }
    const nego = document.getElementById('Bisa Nego');
    if (nego) {
      const ok = setCheckbox(nego, data.negotiable === true);
      result('negotiable', data.negotiable === true, ok, ok ? '' : 'Checkbox Bisa Nego gagal diubah.', false);
    }
    const titleInput = queryVisible('[data-testid="title"] input[name="title"]') || queryVisible('input[name="title"]') || queryVisible('input[placeholder="Masukkan Judul Iklan Kamu"]');
    if (data.title) {
      const ok = titleInput ? setReactInput(titleInput, data.title) : false;
      result('title', data.title, ok, ok ? '' : 'Input judul tidak ditemukan.', false);
    }
    const description = buildDescription();
    const descriptionField = queryVisible('[data-testid="description"] textarea');
    if (description.warning) result('descriptionHighlights', description.omitted, false, description.warning, false);
    if (description.value) {
      const withinLimit = description.value.length <= CONFIG.descriptionLimit;
      const ok = withinLimit && descriptionField ? setReactInput(descriptionField, description.value) : false;
      result('description', description.value.length, ok, ok ? '' : (withinLimit ? 'Textarea deskripsi tidak ditemukan.' : 'Deskripsi melebihi batas; dibiarkan tanpa perubahan.'), false);
    }
  }

  async function fillCurrentPage() {
    state.logs = [];
    clearResults();
    log('=== Fill run v' + VERSION + ' ===');
    const page = detectPage();
    lastDetectedPage = page;
    log('page = ' + page);
    const data = resolveData();
    if (page === 'category') await fillCategory(data);
    else if (page === 'specification') await fillSpecification(data);
    else if (page === 'price') fillPriceAndCopy(data);
    else result('page', page, false, 'Halaman Rumah123 belum dikenali; tidak ada field yang diubah.', false);
    if (page === 'category' && !document.getElementById('isCoBroke')) {
      // Page category can omit optional co-broke on some listing types.
    }
    updatePanel();
    saveState();
    return { page, results: state.results.slice(), warnings: state.warnings.slice() };
  }

  function criticalErrorsForPage(page, data, filled) {
    const errors = filled.results.filter((item) => item.critical && !item.success).map((item) => item.reason || item.field + ' gagal.');
    Array.from(document.querySelectorAll('input[required],select[required],textarea[required],input[aria-required="true"],select[aria-required="true"],textarea[aria-required="true"]')).filter(visible).forEach((control) => {
      if (control.type === 'checkbox' || control.type === 'radio') {
        if (!control.checked) errors.push('Field wajib ' + (control.getAttribute('aria-label') || control.name || 'pilihan') + ' belum dipilih.');
      } else if (!controlValue(control)) errors.push('Field wajib ' + (control.getAttribute('aria-label') || control.name || control.placeholder || 'form') + ' belum terisi.');
    });
    if (page === 'specification') {
      const land = queryVisible('input[name="landSize"]') || findControlByLabel(['Luas Tanah', 'LT'], 'input:not([type="checkbox"]),textarea');
      if (!land || !controlValue(land)) errors.push('Luas Tanah wajib belum terisi.');
      if (data.locationQuery && !filled.results.some((item) => item.field === 'location' && item.success) && !hasPopulatedLocation()) errors.push('Lokasi gagal dipilih.');
    }
    if (page === 'price' && data.price != null && !filled.results.some((item) => item.field === 'price' && item.success)) errors.push('Harga wajib belum terisi.');
    return Array.from(new Set(errors));
  }

  async function fillAndNext() {
    const page = detectPage();
    const data = resolveData();
    const filled = await fillCurrentPage();
    const errors = criticalErrorsForPage(page, data, filled);
    if (errors.length) {
      errors.forEach((message) => {
        if (!state.warnings.includes(message)) state.warnings.push(message);
        if (!state.results.some((item) => !item.success && item.critical && item.reason === message)) {
          state.results.push({ field: 'validation', value: '', success: false, reason: message, critical: true });
        }
      });
      updatePanel();
      saveState();
      log('STOP: ' + errors.join(' '), 'warn');
      return;
    }
    const button = exactButton('Selanjutnya');
    if (!button) {
      result('navigation', 'Selanjutnya', false, 'Tombol Selanjutnya tidak ditemukan.', false);
      return;
    }
    button.click();
    const changed = await waitForPageChange(page);
    if (changed) {
      lastDetectedPage = detectPage();
      log('Berpindah ke halaman ' + lastDetectedPage);
      scheduleScan();
    } else {
      result('navigation', 'Selanjutnya', false, 'Klik Selanjutnya belum menghasilkan perubahan halaman dalam batas tunggu.', false);
    }
  }

  function collectLQS() {
    const candidates = Array.from(document.querySelectorAll('body *')).filter((element) => visible(element) && /\b\d+(?:[.,]\d+)?\s*%/.test(element.textContent || ''));
    const entries = [];
    candidates.forEach((element) => {
      const text = normalizeText(element.innerText || element.textContent);
      const match = text.match(/(.{0,70}?)\s*(\d+(?:[.,]\d+)?)\s*%/);
      if (!match) return;
      if (element.children.length && Array.from(element.children).some((child) => /[a-z\u00C0-\u024F]{2,}.{0,45}\b\d+(?:[.,]\d+)?\s*%/i.test(child.textContent || ''))) return;
      const label = match[1].replace(/[✓✔⚠•|:–-]+/g, ' ').trim();
      const pct = Number(match[2].replace(',', '.'));
      const key = label + ':' + pct;
      if (!entries.some((item) => item.key === key)) entries.push({ key, label: label || 'Badge', pct, text: (label || 'Badge') + ' +' + pct + '%' });
    });
    return entries;
  }

  function selectedUSPMarkup(list, type) {
    return list.map((label) => '<label class="check"><input type="checkbox" data-usp="' + escapeHTML(label) + '" ' + (state.selectedUSP.includes(label) ? 'checked' : '') + '> ' + escapeHTML(label) + '</label>').join('');
  }

  function renderPanel() {
    if (document.getElementById(CONFIG.panelId)) return;
    panelRoot = document.createElement('div');
    panelRoot.id = CONFIG.panelId;
    document.body.appendChild(panelRoot);
    const shadow = panelRoot.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host{all:initial;position:fixed;left:14px;right:auto;top:14px;z-index:2147483646;color:#202124;font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif}
        *{box-sizing:border-box} .panel{width:min(390px,calc(100vw - 24px));max-height:calc(100vh - 28px);display:flex;flex-direction:column;background:#fff;border:1px solid #aeb5bf;border-radius:10px;box-shadow:0 8px 28px #0003;overflow:hidden}
        header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;background:#164e63;color:#fff;font-weight:700} header button{border:0;background:#ffffff22;color:#fff;border-radius:5px;padding:4px 8px;cursor:pointer}
        .body{overflow:auto;padding:8px 10px 12px} details{border:1px solid #e1e5e9;border-radius:7px;margin:0 0 8px;background:#fff} summary{cursor:pointer;padding:7px 8px;font-weight:700;color:#164e63} .section{padding:0 8px 8px}
        label.field{display:block;font-size:12px;margin:5px 0 2px;color:#4a5560} input[type=text],input[type=number],textarea,select{width:100%;border:1px solid #bbc3cc;border-radius:5px;padding:6px 7px;background:#fff;color:#202124;font:inherit} textarea{resize:vertical;min-height:75px} textarea.small{min-height:55px}
        button.action{border:0;border-radius:5px;padding:7px 9px;background:#0e7490;color:white;font-weight:650;cursor:pointer;margin:4px 3px 2px 0} button.secondary{background:#e8eef1;color:#164e63} button.danger{background:#fff0ed;color:#9e2a16}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:7px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.check{display:block;margin:5px 0;font-size:12px}.check input{vertical-align:middle}.seg{display:flex;gap:4px;margin:4px 0 7px}.seg button{flex:1;border:1px solid #bbc3cc;border-radius:5px;background:white;padding:6px;cursor:pointer}.seg button.active{background:#164e63;color:#fff;border-color:#164e63}.muted{color:#66727d;font-size:11px}.warning{padding:6px 7px;margin:4px 0;background:#fff4d5;border-radius:5px;color:#714b00;font-size:12px}.error{background:#ffebe8;color:#922b21}.facts{margin:0;padding-left:17px}.facts li{margin:2px 0}.chips{display:flex;flex-wrap:wrap;gap:5px}.chip{background:#e7f2f5;border-radius:12px;padding:3px 7px;font-size:11px}.chip button{border:0;background:none;color:#8b1f17;cursor:pointer;font-weight:bold}.preview{min-height:85px;background:#f7f8fa}.log{max-height:130px;overflow:auto;background:#f7f8fa;padding:5px;font:10px/1.35 ui-monospace,monospace;white-space:pre-wrap}.status{padding:6px;background:#eef6f7;border-radius:5px;margin:5px 0;font-size:12px}.collapsed .body{display:none}.help{font-size:11px;color:#66727d}.actions{display:flex;flex-wrap:wrap;align-items:center}
      </style>
      <div class="panel" id="panel">
        <header><span>🏠 HEPI Rumah123 Helper v${VERSION}</span><button id="collapse" title="Ciutkan panel">−</button></header>
        <div class="body">
          <div class="row"><label class="field">Preset<select id="preset"><option>Rumah Second Semarang</option><option value="none">Tanpa preset</option></select></label><label class="field">Tipe Properti<select id="q-propertyType"><option value="">(tidak diubah)</option>${CONFIG.propertyTypes.map((x) => '<option>' + x + '</option>').join('')}</select></label></div>
          <details open><summary>LISTING</summary><div class="section"><label class="field">Data listing mentah</label><textarea id="raw" placeholder="Paste data dari owner/WhatsApp"></textarea><div class="actions"><button class="action" id="parse">Parse Listing</button><button class="action secondary" id="clear">Clear State</button></div><div class="help">Foto harus diunggah manual. Script tidak mengklik Simpan Iklan.</div></div></details>
          <details open><summary>PARSED DATA</summary><div class="section" id="parsed"></div></details>
          <details open><summary>QUICK FILL</summary><div class="section">
            <div class="row"><label class="field">Tipe iklan<select id="q-listingType"><option value="">(tidak diubah)</option><option>Jual</option><option>Sewa</option></select></label><label class="field">Status<select id="q-propertyStatus"><option value="">(tidak diubah)</option><option>Baru</option><option>Second</option><option>Aset Bank</option></select></label></div>
            <label class="field">Lokasi pencarian<input type="text" id="q-locationQuery" placeholder="Semarang Barat, Genuk, atau Graha Padma"></label>
            <div class="row"><label class="field">Nama Jalan (opsional, dipilih dari hasil)<input type="text" id="q-street" placeholder="Kosongkan untuk pilih hasil lokasi"></label><label class="field">Sertifikat<input type="text" id="q-certificate" placeholder="Lainnya"></label></div>
            <div class="grid3"><label class="field">Luas Tanah<input type="number" id="q-landArea"></label><label class="field">Luas Bangunan<input type="number" id="q-buildingArea"></label><label class="field">Daya listrik (W)<input type="number" id="q-electricity"></label></div>
            <div class="grid3"><label class="field">Kamar Tidur<input type="number" id="q-bedrooms"></label><label class="field">Kamar Tidur Pembantu<input type="number" id="q-helperBedrooms"></label><label class="field">Kamar Mandi<input type="number" id="q-bathrooms"></label></div>
            <div class="grid3"><label class="field">Kamar Mandi Pembantu<input type="number" id="q-helperBathrooms"></label><label class="field">Jumlah Lantai<input type="number" id="q-floors"></label><span></span></div>
            <div class="grid3"><label class="field">Garasi<input type="number" id="q-garage"></label><label class="field">Carport<input type="number" id="q-carport"></label><label class="field">Kondisi Perabot<select id="q-furnishing"><option value="">(tidak diubah)</option><option>Furnished</option><option>Semi Furnished</option><option>Unfurnished</option></select></label></div>
            <label class="field">Kondisi Properti<select id="q-condition"><option value="">(tidak diubah)</option><option>Bagus</option><option>Butuh Minim Renovasi</option><option>Butuh Renovasi Total</option><option>Terenovasi</option></select></label>
            <label class="field">Hadap<select id="q-direction"><option value="">(tidak diubah)</option><option>Selatan</option><option>Barat Daya</option><option>Barat</option><option>Barat Laut</option><option>Utara</option><option>Timur Laut</option><option>Timur</option><option>Tenggara</option></select></label>
            <label class="field">Lebar Jalan (jumlah mobil)</label><div class="seg" id="road-segments">${CONFIG.roadWidths.map(([value, label]) => '<button type="button" data-road="' + value + '" class="' + ((resolveData().roadWidth || '') === value ? 'active' : '') + '">' + label + '</button>').join('')}</div>
            <label class="field">Sumber Air<select id="q-waterSource">${CONFIG.waterSources.map(([value, label]) => '<option value="' + value + '">' + label + '</option>').join('')}</select></label>
            <details open><summary>Fasilitas Rumah</summary><div class="section" id="room-facilities"></div></details>
            <details open><summary>Fasilitas Perumahan</summary><div class="section" id="residential-facilities"></div></details>
            <div class="row"><label class="field">Harga<input type="text" inputmode="decimal" id="q-price" placeholder="Contoh: 1,8"></label><label class="field">Satuan harga<select id="q-priceUnit"><option value="">(tidak diubah)</option><option>Ribu</option><option>Juta</option><option>Miliar</option><option>Triliun</option></select></label></div>
            <label class="check"><input type="checkbox" id="q-negotiable"> Bisa Nego</label><label class="check"><input type="checkbox" id="q-coBroke"> Co-broke</label>
            <label class="field">Judul iklan<input type="text" id="q-title"></label>
            <label class="field">Deskripsi asli (opsional)</label><textarea class="small" id="original-description" placeholder="Isi deskripsi asli tanpa highlight"></textarea>
            <div id="electric-warning"></div>
          </div></details>
          <details open><summary>USP UTAMA</summary><div class="section" id="usp-main"></div></details>
          <details><summary>Tampilkan USP lainnya</summary><div class="section" id="usp-more"></div></details>
          <details><summary>DESCRIPTION HIGHLIGHTS</summary><div class="section" id="highlights"></div></details>
          <details open><summary>DESCRIPTION PREVIEW</summary><div class="section"><label class="check"><input type="checkbox" id="add-usp-description"> Tambahkan USP Rumah123 ke deskripsi</label><label class="field">Preview Deskripsi Final</label><textarea id="preview" class="preview" readonly></textarea><div id="description-warning"></div></div></details>
          <details><summary>LQS HELPER</summary><div class="section" id="lqs"></div></details>
          <div id="status" class="status"></div>
          <div class="actions"><button class="action" id="fill">Fill Current Page</button><button class="action" id="next">Fill &amp; Next</button><label class="check"><input type="checkbox" id="debug"> Debug Mode</label></div>
          <details><summary>LOG</summary><div class="section"><div class="log" id="logs"></div></div></details>
        </div>
      </div>`;
    panel = shadow;
    bindPanelEvents();
    hydratePanel();
    updatePanel();
  }

  function hydratePanel() {
    const byId = (id) => panel.getElementById(id);
    byId('raw').value = state.rawListing;
    byId('preset').value = state.preset;
    byId('debug').checked = state.debug;
    byId('add-usp-description').checked = state.settings.addUSPToDescription;
    byId('original-description').value = state.settings.originalDescription || '';
    const data = resolveData();
    const fields = ['propertyType', 'listingType', 'propertyStatus', 'locationQuery', 'street', 'certificate', 'landArea', 'buildingArea', 'electricity', 'bedrooms', 'helperBedrooms', 'bathrooms', 'helperBathrooms', 'floors', 'garage', 'carport', 'furnishing', 'condition', 'direction', 'price', 'priceUnit', 'title'];
    fields.forEach((field) => {
      const control = byId('q-' + field);
      if (!control) return;
      control.value = data[field] == null ? '' : field === 'price' ? formatPriceInput(data[field]) : data[field];
    });
    byId('q-negotiable').checked = Boolean(data.negotiable);
    byId('q-coBroke').checked = Boolean(data.coBroke);
    byId('q-waterSource').value = data.waterSource || '';
    updateRoadButtons();
  }

  function bindPanelEvents() {
    const byId = (id) => panel.getElementById(id);
    byId('parse').addEventListener('click', () => {
      state.rawListing = String(byId('raw').value || '');
      state.logs = [];
      let parseError = null;
      try {
        state.parsedListing = parseListing(state.rawListing);
      } catch (error) {
        state.parsedListing = {};
        parseError = error instanceof Error ? error.message : String(error);
      }
      // A new raw listing starts a fresh property draft: old Quick Fill values and
      // manually selected highlights belong to the previous property.
      state.manualOverrides = {};
      state.selectedUSPTouched = false;
      state.selectedUSP = Array.from(new Set(CONFIG.defaults.selectedUSP.concat(state.parsedListing.selectedUSP || [])));
      state.descriptionHighlights = [];
      state.customHighlights = [];
      state.settings.originalDescription = state.parsedListing.description || '';
      clearResults();
      setWarnings([]);
      saveState();
      hydratePanel();
      const parsedKeys = ['propertyType', 'listingType', 'propertyStatus', 'locationRaw', 'landArea', 'buildingArea', 'bedrooms', 'helperBedrooms', 'bathrooms', 'helperBathrooms', 'electricity', 'waterSourceRaw', 'certificate', 'condition', 'furnishing', 'direction', 'floors', 'roadWidth', 'price', 'priceUnit', 'negotiable', 'description', 'selectedUSP'];
      const found = parsedKeys.filter((key) => {
        const value = state.parsedListing[key];
        if (key === 'negotiable' && state.parsedListing.price == null) return false;
        return Array.isArray(value) ? value.length > 0 : value != null && value !== '';
      });
      if (parseError) {
        const message = 'Parsing gagal: ' + parseError;
        log(message, 'warn');
        result('parse', '', false, message, false);
      } else {
        log('Parse selesai (' + state.rawListing.length + ' karakter). Field terdeteksi: ' + (found.length ? found.join(', ') : 'tidak ada'));
        if (!found.length) result('parse', '', false, 'Parser belum mengenali data dari teks ini. Pastikan teks mentah memuat label seperti Luas Tanah, Kamar Tidur, atau Harga.', false);
      }
      updatePanel();
    });
    byId('raw').addEventListener('input', () => { state.rawListing = byId('raw').value; saveState(); });
    byId('preset').addEventListener('change', () => { state.preset = byId('preset').value; saveState(); hydratePanel(); updatePanel(); });
    byId('clear').addEventListener('click', () => {
      localStorage.removeItem(CONFIG.storageKey);
      state = freshState();
      hydratePanel();
      updatePanel();
      log('Local state dibersihkan. Field listing pada halaman tidak dihapus.');
    });
    const map = { 'q-propertyType': 'propertyType', 'q-listingType': 'listingType', 'q-propertyStatus': 'propertyStatus', 'q-locationQuery': 'locationQuery', 'q-street': 'street', 'q-certificate': 'certificate', 'q-landArea': 'landArea', 'q-buildingArea': 'buildingArea', 'q-electricity': 'electricity', 'q-bedrooms': 'bedrooms', 'q-helperBedrooms': 'helperBedrooms', 'q-bathrooms': 'bathrooms', 'q-helperBathrooms': 'helperBathrooms', 'q-floors': 'floors', 'q-garage': 'garage', 'q-carport': 'carport', 'q-furnishing': 'furnishing', 'q-condition': 'condition', 'q-direction': 'direction', 'q-price': 'price', 'q-priceUnit': 'priceUnit', 'q-title': 'title' };
    Object.keys(map).forEach((id) => byId(id).addEventListener(id === 'q-price' ? 'change' : 'input', () => {
      const control = byId(id);
      let value = control.value;
      if (map[id] === 'price') {
        const parsedPrice = value === '' ? null : parseLocalizedNumber(value, true);
        if (value !== '' && parsedPrice == null) {
          control.setCustomValidity('Masukkan harga dengan angka, misalnya 1,8.');
          return;
        }
        control.setCustomValidity('');
        value = parsedPrice == null ? '' : parsedPrice;
        control.value = parsedPrice == null ? '' : formatPriceInput(parsedPrice);
      } else if (['landArea', 'buildingArea', 'electricity', 'bedrooms', 'helperBedrooms', 'bathrooms', 'helperBathrooms', 'floors', 'garage', 'carport'].includes(map[id]) && value !== '') value = Number(value);
      state.manualOverrides[map[id]] = value;
      saveState();
      updatePanel();
    }));
    byId('q-waterSource').addEventListener('change', () => { state.manualOverrides.waterSource = byId('q-waterSource').value; saveState(); updatePanel(); });
    byId('q-negotiable').addEventListener('change', () => { state.manualOverrides.negotiable = byId('q-negotiable').checked; saveState(); updatePanel(); });
    byId('q-coBroke').addEventListener('change', () => { state.manualOverrides.coBroke = byId('q-coBroke').checked; saveState(); updatePanel(); });
    byId('original-description').addEventListener('input', () => { state.settings.originalDescription = byId('original-description').value; saveState(); updatePanel(); });
    byId('debug').addEventListener('change', () => { state.debug = byId('debug').checked; saveState(); });
    byId('add-usp-description').addEventListener('change', () => { state.settings.addUSPToDescription = byId('add-usp-description').checked; saveState(); updatePanel(); });
    byId('road-segments').addEventListener('click', (event) => {
      const button = event.target.closest('[data-road]');
      if (!button) return;
      state.manualOverrides.roadWidth = button.dataset.road;
      saveState();
      updateRoadButtons();
    });
    panel.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-usp],[data-highlight],[data-room-facility],[data-residential-facility]');
      if (!checkbox) return;
      if (checkbox.hasAttribute('data-room-facility') || checkbox.hasAttribute('data-residential-facility')) {
        const residential = checkbox.hasAttribute('data-residential-facility');
        const key = residential ? 'residentialFacilities' : 'roomFacilities';
        const attr = residential ? 'residentialFacility' : 'roomFacility';
        const defaults = residential ? CONFIG.defaults.residentialFacilities : CONFIG.defaults.roomFacilities;
        const values = new Set(Object.prototype.hasOwnProperty.call(state.manualOverrides, key) ? state.manualOverrides[key] : defaults);
        if (checkbox.checked) values.add(checkbox.dataset[attr]); else values.delete(checkbox.dataset[attr]);
        state.manualOverrides[key] = Array.from(values);
        state.manualOverrides[key + 'Touched'] = true;
        saveState();
        return;
      }
      const key = checkbox.hasAttribute('data-usp') ? 'selectedUSP' : 'descriptionHighlights';
      const label = checkbox.getAttribute(checkbox.hasAttribute('data-usp') ? 'data-usp' : 'data-highlight');
      const values = new Set(state[key]);
      if (checkbox.checked) values.add(label); else values.delete(label);
      state[key] = Array.from(values);
      if (key === 'selectedUSP') state.selectedUSPTouched = true;
      saveState();
      updatePanel();
    });
    byId('highlights').addEventListener('click', (event) => {
      if (event.target.id === 'add-custom') {
        const input = byId('custom-highlight');
        const value = input.value.trim();
        if (value && !state.customHighlights.includes(value)) state.customHighlights.push(value);
        input.value = '';
        saveState();
        updatePanel();
      }
      const remove = event.target.closest('[data-remove-highlight]');
      if (remove) {
        const index = Number(remove.dataset.removeHighlight);
        state.customHighlights.splice(index, 1);
        saveState();
        updatePanel();
      }
    });
    byId('fill').addEventListener('click', () => fillCurrentPage());
    byId('next').addEventListener('click', () => fillAndNext());
    byId('collapse').addEventListener('click', () => {
      const shell = byId('panel');
      shell.classList.toggle('collapsed');
      byId('collapse').textContent = shell.classList.contains('collapsed') ? '+' : '−';
    });
  }

  function updateRoadButtons() {
    if (!panel) return;
    const selected = resolveData().roadWidth || '';
    panel.querySelectorAll('[data-road]').forEach((button) => button.classList.toggle('active', button.dataset.road === selected));
  }

  function updatePanel() {
    if (!panel) return;
    const byId = (id) => panel.getElementById(id);
    const parsed = state.parsedListing || {};
    const data = resolveData();
    const keys = [['Tipe', 'propertyType'], ['Iklan', 'listingType'], ['Lokasi', 'locationRaw'], ['LT', 'landArea'], ['LB', 'buildingArea'], ['KT', 'bedrooms'], ['KT pembantu', 'helperBedrooms'], ['KM', 'bathrooms'], ['KM pembantu', 'helperBathrooms'], ['Listrik', 'electricity'], ['Sumber air', 'waterSourceRaw'], ['Sertifikat', 'certificate'], ['Hadap', 'direction'], ['Harga', 'price'], ['Nego', 'negotiable'], ['Co-broke', 'coBroke']];
    const facts = keys.filter(([, key]) => parsed[key] != null && parsed[key] !== '').map(([label, key]) => {
      const displayValue = key === 'price'
        ? formatPriceAmount(parsed[key]) + (parsed.priceUnit ? ' ' + parsed.priceUnit : '')
        : parsed[key] === true ? 'Ya' : parsed[key] === false ? 'Tidak' : parsed[key];
      return '<li><b>' + escapeHTML(label) + ':</b> ' + escapeHTML(displayValue) + '</li>';
    });
    byId('parsed').innerHTML = facts.length ? '<ul class="facts">' + facts.join('') + '</ul>' : '<span class="muted">Belum diparse.</span>';
    byId('usp-main').innerHTML = selectedUSPMarkup(CONFIG.mainUSP, 'main');
    byId('usp-more').innerHTML = selectedUSPMarkup(CONFIG.moreUSP, 'more');
    const roomFacilities = CONFIG.roomFacilities;
    const selectedFacilities = data.roomFacilities || [];
    byId('room-facilities').innerHTML = roomFacilities.map((name) => '<label class="check"><input type="checkbox" data-room-facility="' + escapeHTML(name) + '" ' + (selectedFacilities.includes(name) ? 'checked' : '') + '> ' + escapeHTML(name) + '</label>').join('');
    const selectedResidential = data.residentialFacilities || [];
    byId('residential-facilities').innerHTML = CONFIG.residentialFacilities.map((name) => '<label class="check"><input type="checkbox" data-residential-facility="' + escapeHTML(name) + '" ' + (selectedResidential.includes(name) ? 'checked' : '') + '> ' + escapeHTML(name) + '</label>').join('');
    const highlights = CONFIG.highlights.map((label) => '<label class="check"><input type="checkbox" data-highlight="' + escapeHTML(label) + '" ' + (state.descriptionHighlights.includes(label) ? 'checked' : '') + '> ' + escapeHTML(label) + '</label>').join('');
    const custom = state.customHighlights.map((label, index) => '<span class="chip">' + escapeHTML(label) + ' <button type="button" data-remove-highlight="' + index + '" aria-label="Hapus highlight">×</button></span>').join('');
    byId('highlights').innerHTML = highlights + '<label class="field">Highlight custom</label><div class="row"><input id="custom-highlight" type="text" placeholder="Contoh: 5 Menit UNDIP"><button class="action secondary" type="button" id="add-custom">+ Tambah</button></div><div class="chips">' + custom + '</div>';
    const description = buildDescription();
    byId('preview').value = description.value;
    byId('description-warning').innerHTML = description.warning ? '<div class="warning">⚠ ' + escapeHTML(description.warning) + '</div>' : '';
    if (!state.manualOverrides.title) byId('q-title').value = data.title || '';
    const electricityWarning = data.electricity != null && data.electricity !== '' && ![450, 900, 1300, 2200, 3300, 3500, 4400, 5500, 6600, 7600, 7700, 8000, 9500, 10000, 10500, 10600, 11000, 12700, 13200, 13300, 13900, 16500, 17600, 19000, 22000, 23000, 24000, 30500, 33000, 38100, 41500, 47500, 53000, 61000, 66000, 76000, 82500, 85000, 95000].includes(Number(data.electricity));
    byId('electric-warning').innerHTML = electricityWarning ? '<div class="warning">⚠ Daya listrik ' + escapeHTML(data.electricity) + 'W tidak tersedia sebagai pilihan exact Rumah123.</div>' : '';
    const waterWarn = data.waterSourceRaw && !data.waterSource && !mapWaterSource(data.waterSourceRaw);
    const warningMarkup = [];
    if (waterWarn) warningMarkup.push('⚠ “' + escapeHTML(data.waterSourceRaw) + '” tidak memiliki exact mapping sumber air.');
    state.warnings.forEach((warning) => warningMarkup.push('⚠ ' + escapeHTML(warning)));
    if (warningMarkup.length) byId('status').innerHTML = warningMarkup.map((item) => '<div class="warning">' + item + '</div>').join('');
    else {
      const summary = currentResultsSummary();
      byId('status').textContent = '✓ ' + summary.good + ' berhasil  ·  ⚠ ' + summary.needsCheck + ' perlu dicek  ·  ✗ ' + summary.critical + ' critical error';
    }
    const lqs = collectLQS();
    byId('lqs').innerHTML = lqs.length ? '<div>' + lqs.map((item) => '<div>• ' + escapeHTML(item.text) + '</div>').join('') + '</div><div class="muted">Persentase yang terdeteksi di DOM; bukan estimasi untuk badge yang tidak tampil.</div>' : '<span class="muted">Belum ada badge persentase yang terbaca di DOM.</span>';
    byId('logs').textContent = state.logs.slice(-50).join('\n');
    byId('debug').checked = state.debug;
    byId('add-usp-description').checked = state.settings.addUSPToDescription;
  }

  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    requestAnimationFrame(() => {
      scanScheduled = false;
      const page = detectPage();
      if (page !== lastDetectedPage) {
        lastDetectedPage = page;
        log('page = ' + page);
      }
      updatePanel();
    });
  }

  function initialize() {
    if (!document.body) { requestAnimationFrame(initialize); return; }
    renderPanel();
    lastDetectedPage = detectPage();
    log('page = ' + lastDetectedPage);
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    window.addEventListener('popstate', scheduleScan);
    window.addEventListener('hashchange', scheduleScan);
    if (window.history && window.history.pushState) {
      const original = window.history.pushState;
      window.history.pushState = function () {
        const value = original.apply(this, arguments);
        scheduleScan();
        return value;
      };
    }
    saveState();
  }

  initialize();
})();
