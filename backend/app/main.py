import io
import os

import numpy as np
from PIL import Image, UnidentifiedImageError
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import img_to_array

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware



# KONFIGURASI APLIKASI
app = FastAPI(
    title="FishDoctor API",
    description="API klasifikasi penyakit ikan air tawar menggunakan DenseNet-121.",
    version="1.0.0",
)


# CORS

# Development:
# http://localhost:3000

# Production:
# nanti FRONTEND_ORIGINS di Hugging Face dapat diisi dengan URL Vercel, misalnya:
# https://fish-doctor.vercel.app

origins_env = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000",
)

allowed_origins = [
    origin.strip()
    for origin in origins_env.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# KONFIGURASI MODEL
MODEL_FILENAME = "fishdoctor_model8020.h5"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)

IMG_SIZE = (224, 224)



# DAFTAR LABEL

# PENTING:
# URUTAN CLASS_NAMES HARUS SAMA PERSIS DENGAN URUTAN KELAS PADA SAAT MODEL DILATIH.

# Jangan mengubah urutan ini hanya berdasarkan alfabet
# tanpa memeriksa class_indices/class_names dari training.

CLASS_NAMES = [
    "Bacterial Red Disease",
    "Aeromoniasis",
    "Bacterial Gill Disease",
    "EUS",
    "Saprolegniasis",
    "Healthy Fish",
    "Parasitic Diseases",
    "White Tail Disease",
]



# LOAD MODEL
print(f"Memuat model dari: {MODEL_PATH}")

try:
    model = load_model(
        MODEL_PATH,
        compile=False,
    )
except Exception as exc:
    raise RuntimeError(
        f"Gagal memuat model FishDoctor dari {MODEL_PATH}: {exc}"
    ) from exc


# Validasi sederhana jumlah output model
output_classes = int(model.output_shape[-1])

if output_classes != len(CLASS_NAMES):
    raise RuntimeError(
        "Jumlah output model tidak sesuai dengan jumlah CLASS_NAMES. "
        f"Model memiliki {output_classes} output, "
        f"sedangkan CLASS_NAMES memiliki {len(CLASS_NAMES)} kelas."
    )

print("Model FishDoctor berhasil dimuat.")
print(f"Jumlah kelas model: {output_classes}")



# PREPROCESSING
def prepare_image(img_bytes: bytes) -> np.ndarray:
    """
    Mengubah bytes citra menjadi tensor input yang sesuai
    dengan model FishDoctor.
    """

    try:
        img = Image.open(io.BytesIO(img_bytes))

        # Memaksa format RGB agar selalu memiliki 3 channel.
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Resize sesuai input DenseNet-121.
        img = img.resize(IMG_SIZE)

        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        # PENTING:
        # Normalisasi ini harus sama dengan preprocessing yang digunakan saat training.
        img_array = img_array / 255.0

        return img_array.astype(np.float32)

    except UnidentifiedImageError as exc:
        raise ValueError(
            "File yang diberikan bukan citra yang valid."
        ) from exc



# HEALTH CHECK
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "FishDoctor API",
        "model": "DenseNet-121",
        "classes": len(CLASS_NAMES),
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }



# ENDPOINT PREDIKS
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # -----------------------------------------------------
    # Validasi tipe file
    # -----------------------------------------------------

    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa citra.",
        )

    try:
        # -------------------------------------------------
        # Membaca file
        # -------------------------------------------------

        img_bytes = await file.read()

        if not img_bytes:
            raise HTTPException(
                status_code=400,
                detail="File citra kosong.",
            )

        # -------------------------------------------------
        # Preprocessing
        # -------------------------------------------------

        processed_image = prepare_image(img_bytes)

        # -------------------------------------------------
        # Inference DenseNet-121
        # -------------------------------------------------

        prediction = model.predict(
            processed_image,
            verbose=0,
        )

        # -------------------------------------------------
        # Mengambil hasil tertinggi
        # -------------------------------------------------

        predicted_index = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0])) * 100

        result_label = CLASS_NAMES[predicted_index]

        # -------------------------------------------------
        # Menentukan kondisi sehat / penyakit
        # -------------------------------------------------

        is_healthy = (
            "Healthy" in result_label
            or "Sehat" in result_label
        )

        # -------------------------------------------------
        # Response
        # -------------------------------------------------
        # Struktur response sengaja dipertahankan sama dengan backend Flask sebelumnya agar frontend tidak perlu diubah.

        return {
            "result": result_label,
            "confidence": f"{confidence:.1f}%",
            "status": "safe" if is_healthy else "danger",
            "healthy": is_healthy,
        }

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(f"Prediction error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Terjadi kesalahan saat melakukan prediksi.",
        ) from exc

    finally:
        await file.close()
