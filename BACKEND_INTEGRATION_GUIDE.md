# Backend Integration Guide - Payment Methods

Panduan sederhana ini menjelaskan perubahan minimal yang diperlukan di backend untuk menyimpan data metode pembayaran.

## Ringkasan Perubahan

Frontend telah diperbarui untuk menampilkan modal pembayaran dengan fitur:

1. **Pilihan Metode Pembayaran** - Bank Transfer dan QRIS
2. **Detail Rekening Bank** - Ditampilkan di frontend saja (static)
3. **QR Code QRIS** - Static QR code untuk presentasi
4. **Upload Bukti Pembayaran** - Untuk metode Bank Transfer (sudah ada)

**Backend hanya perlu menyimpan data baru:** `paymentMethod` dan `bankCode`

## API Request Payload

### Endpoint: `POST /contract/pay`

#### Request Headers

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Request Body (FormData)

```javascript
{
  "contractId": "string",           // ID kontrak yang harus dibayar
  "invoiceId": "string",            // ID invoice yang harus dibayar
  "paymentMethod": "string",        // "bank_transfer" atau "qris"
  "bankCode": "string",             // (Optional) Kode bank untuk bank transfer (bca, mandiri, bri, btn, cimb)
  "proof": File                      // (Required untuk bank_transfer) File bukti pembayaran
}
```

#### Contoh Request untuk Bank Transfer

```javascript
const formData = new FormData();
formData.append("contractId", "order-123");
formData.append("invoiceId", "INV-2024-001");
formData.append("paymentMethod", "bank_transfer");
formData.append("bankCode", "bca");
formData.append("proof", fileInput.files[0]);

// POST /contract/pay
```

#### Contoh Request untuk QRIS

```javascript
const formData = new FormData();
formData.append("contractId", "order-123");
formData.append("invoiceId", "INV-2024-001");
formData.append("paymentMethod", "qris");

// POST /contract/pay
// Tanpa file proof untuk QRIS (verifikasi otomatis)
```

## Database Schema Updates

### Invoice/Contract Collection

Tambahkan hanya 2 field berikut ke schema invoice atau contract:

```javascript
{
  // Existing fields...

  // NEW FIELDS - MINIMAL
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "qris"],
    default: "bank_transfer",
    description: "Metode pembayaran yang digunakan"
  },

  bankCode: {
    type: String,
    enum: ["bca", "mandiri", "bri", "btn", "cimb"],
    nullable: true,
    description: "Kode bank untuk metode bank transfer"
  }
}
```

**Itu saja! Tidak perlu menambah field lain.**

## Backend Logic Implementation

### Update Contract/Pay Endpoint

Tambahkan logika berikut untuk menyimpan data `paymentMethod` dan `bankCode`:

```javascript
async function updatePayment(req, res) {
  try {
    const { contractId, invoiceId, paymentMethod, bankCode } = req.body;
    const proof = req.file; // Untuk bank transfer

    // Validasi payment method
    if (!["bank_transfer", "qris"].includes(paymentMethod)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment method",
      });
    }

    // Validasi proof untuk bank transfer
    if (paymentMethod === "bank_transfer" && !proof) {
      return res.status(400).json({
        status: "error",
        message: "Payment proof required for bank transfer",
      });
    }

    // Validasi bank code untuk bank transfer
    if (paymentMethod === "bank_transfer" && !bankCode) {
      return res.status(400).json({
        status: "error",
        message: "Bank code required for bank transfer",
      });
    }

    // Get invoice dari database
    const invoice = await Invoice.findOne({ invoiceId });
    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    // SIMPAN DATA PEMBAYARAN BARU
    invoice.paymentMethod = paymentMethod;

    if (paymentMethod === "bank_transfer") {
      invoice.bankCode = bankCode;
    }

    // Update status (sesuaikan dengan logika existing Anda)
    invoice.status = "pending";
    invoice.paidAttempt = true;

    if (paymentMethod === "qris") {
      // Untuk QRIS, bisa langsung mark sebagai paid atau pending verification
      invoice.status = "paid";
      invoice.paidAt = new Date();
    }

    await invoice.save();

    return res.json({
      status: "ok",
      message:
        paymentMethod === "qris"
          ? "QRIS payment detected. Thank you!"
          : "Payment proof submitted successfully",
      data: {
        invoiceId: invoice.invoiceId,
        status: invoice.status,
        paymentMethod,
        bankCode,
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      status: "error",
      message: "Payment processing failed",
      error: error.message,
    });
  }
}
```

## Testing

### Test Bank Transfer

```bash
curl -X POST http://localhost:3000/api/rent/pay \
  -H "Authorization: Bearer token" \
  -F "contractId=order-123" \
  -F "invoiceId=INV-2024-001" \
  -F "paymentMethod=bank_transfer" \
  -F "bankCode=bca" \
  -F "proof=@payment.jpg"
```

### Test QRIS

```bash
curl -X POST http://localhost:3000/api/rent/pay \
  -H "Authorization: Bearer token" \
  -F "contractId=order-123" \
  -F "invoiceId=INV-2024-001" \
  -F "paymentMethod=qris"
```

## Environment Variables

Tambahkan ke `.env` backend:

```env
# Payment Methods
PAYMENT_BANK_ENABLED=true
PAYMENT_QRIS_ENABLED=true
QRIS_TIMEOUT_MINUTES=10

# File Upload
UPLOAD_DIR=./uploads/proofs
MAX_PROOF_SIZE=5242880
```

## Summary

Perubahan backend yang diperlukan:

1. ✅ Update Invoice schema dengan 2 field: `paymentMethod` dan `bankCode`
2. ✅ Update `/contract/pay` endpoint untuk menerima dan menyimpan `paymentMethod` dan `bankCode`
3. ✅ Implement file upload untuk bank transfer proof
4. ✅ Add proper validation dan error handling

**Itu saja! Sangat sederhana.**
