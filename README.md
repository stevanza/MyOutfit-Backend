Deskripsi Proyek:

MyOutfit Backend adalah API server berbasis Node.js dan Express yang dibangun untuk mendukung aplikasi outfit management. Proyek ini menyediakan layanan CRUD (Create, Read, Update, Delete) untuk item pakaian, fitur upload gambar, serta rekomendasi outfit berdasarkan cuaca dan mood pengguna. Backend ini menggunakan basis data lokal berupa file JSON, dengan opsi integrasi MongoDB untuk skala lebih besar.

🔧 Teknologi yang Digunakan:
Node.js + Express – Untuk membangun RESTful API.

Multer – Untuk menangani upload file (gambar pakaian).

CORS – Untuk mengizinkan koneksi dari frontend (localhost:3000).

Dotenv – Untuk manajemen variabel lingkungan.

Axios – Untuk mengakses API cuaca dari OpenWeatherMap.

Filesystem (fs) – Untuk mengelola database berbasis JSON lokal.

MongoDB + Mongoose (opsional) – Untuk kebutuhan skala besar.

🚀 Fitur Utama:
Upload Pakaian

Mendukung upload gambar berdasarkan kategori: tops, bottoms, shoes, dan accessories.

File otomatis dipindahkan ke folder yang sesuai.

Informasi pakaian disimpan ke database lokal.

Manajemen Item Pakaian

GET semua item atau berdasarkan kategori.

GET detail satu item pakaian.

PUT untuk memperbarui data pakaian.

DELETE untuk menghapus item dan file gambar terkait.

Rekomendasi Outfit

Berdasarkan suhu & cuaca saat ini dari OpenWeatherMap.

Kategori musim otomatis ditentukan (winter, spring, summer, fall).

Menggabungkan item acak dari masing-masing kategori untuk membentuk outfit.

Debug & Data Testing

Endpoint untuk melihat statistik server dan data.

Endpoint untuk menambahkan atau menghapus semua data secara cepat (testing purpose).

🌤 Integrasi Eksternal:
OpenWeatherMap API

Untuk mendapatkan suhu dan kondisi cuaca secara real-time berdasarkan koordinat lokasi pengguna.

Output digunakan dalam logika rekomendasi outfit.

