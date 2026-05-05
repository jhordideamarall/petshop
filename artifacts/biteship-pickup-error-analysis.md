# 🚨 Biteship Pickup Service Error (40002031) - Analysis & Resolution

## 🔍 Masalah Utama
Error `40002031: Existing courier cannot provide pickup service` muncul saat mencoba membuat pesanan (`Create Order`) di environment **Sandbox/Testing**.

### Akar Permasalahan (Root Cause)
1. **Sandbox Limitation**: Kurir riil (JNE, J&T, SiCepat, dll) di Sandbox seringkali tidak mendukung metode `pickup` secara otomatis. Mereka biasanya hanya mendukung `drop_off`.
2. **Simulator Protocol**: Biteship mewajibkan penggunaan kurir khusus bernama `biteship` untuk simulasi flow pickup yang sukses di Sandbox.
3. **Missing Metadata**: Kurir simulator `biteship` membutuhkan `courier_type: "shipper"` dan metode koleksi yang didefinisikan secara eksplisit.
4. **Coordinate Mandatory**: Untuk validasi pickup di Sandbox, koordinat GPS (`latitude` & `longitude`) asal (store) wajib dikirimkan, tidak bisa hanya mengandalkan `area_id`.

## 🛠️ Solusi Teknis (Standard Protocol)

Untuk memastikan pembuatan pesanan di Sandbox SELALU berhasil, gunakan konfigurasi berikut:

### 1. Header & Authentication
- Gunakan API Key yang diawali dengan `biteship_test.` (pake titik) atau `biteship_test_` (pake underscore).

### 2. Payload Spesifikasi (Testing Mode)
Jika API Key adalah testing key, maka:
- **`courier_company`**: WAJIB `"biteship"`
- **`courier_type`**: WAJIB `"shipper"`
- **`delivery_type`**: `"now"` (untuk instant feel) atau `"later"`.
- **`origin_collection_method`**: WAJIB `"pickup"` (jika ingin mencoba flow penjemputan).
- **`origin_latitude` & `origin_longitude`**: WAJIB disertakan dari `store_settings`.

### 3. Payload Item
- Pastikan berat (`weight`) minimal adalah `1` gram. Biteship akan menolak jika berat `0`.

## 📌 Rujukan Dokumentasi
- [Biteship Order API Overview](https://biteship.com/id/docs/api/orders/overview)
- [Biteship Simulation Guide](https://biteship.com/id/docs/api/orders/retrieve)

## ⚠️ Larangan (Hard Rules)
- **JANGAN** menggunakan nama kurir asli (JNE, J&T, dll) untuk testing flow pickup di Sandbox kecuali sudah dipastikan mendukung `pickup` di area tersebut (jarang terjadi di Sandbox).
- **JANGAN** hardcode koordinat atau postal code jika data tersedia di database.
