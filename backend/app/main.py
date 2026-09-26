import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io

# Inisialisasi Aplikasi Flask
app = Flask(__name__)
CORS(app) # Izinkan Frontend mengakses Backend ini

# --- KONFIGURASI MODEL ---
# Karena model ada di folder yang sama dengan main.py, cukup panggil namanya
MODEL_FILENAME = "fishdoctor_model8020.h5" 

# Mendapatkan lokasi absolut file ini (main.py) agar tidak error path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, MODEL_FILENAME)

IMG_SIZE = (224, 224) # Sesuaikan dengan ukuran input model kamu (misal 150, 150)

# DAFTAR LABEL (Wajib urut abjad sesuai folder dataset!)
CLASS_NAMES = [
    "Bacterial Red Disease",     # Index 0 (R besar menang lawan d kecil)
    "Aeromoniasis",              # Index 1 (d kecil)
    "Bacterial Gill Disease",    # Index 2 (g kecil)
    "EUS",
    "Saprolegniasis",
    "Healthy Fish",
    "Parasitic Diseases",
    "White Tail Disease"
]

# Load Model
print(f"Sedang memuat model dari: {MODEL_PATH}")
try:
    model = load_model(MODEL_PATH)
    print("Model berhasil dimuat!")
except Exception as e:
    print(f"Gagal memuat model. Error: {e}")
    print("Pastikan file .h5 sudah ditaruh di dalam folder 'backend/app/'")

def prepare_image(img_bytes):
    """Mengubah bytes gambar menjadi array yang bisa dibaca AI"""
    img = Image.open(io.BytesIO(img_bytes))
    
    # Pastikan format RGB (hilangkan alpha channel jika png)
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    # Resize
    img = img.resize(IMG_SIZE)
    
    # Array & Normalisasi
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalisasi (0-1)
    
    return img_array

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Backend FishDoctor Siap!", "model_path": MODEL_PATH})

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file diupload"}), 400
    
    file = request.files['file']
    
    try:
        # 1. Proses Gambar
        processed_image = prepare_image(file.read())
        
        # 2. Prediksi
        prediction = model.predict(processed_image)
        
        # 3. Ambil Hasil Tertinggi
        predicted_index = np.argmax(prediction[0])
        confidence = float(np.max(prediction[0])) * 100
        result_label = CLASS_NAMES[predicted_index]
        
        # 4. Tentukan Status (Sehat/Sakit)
        is_healthy = "Healthy" in result_label or "Sehat" in result_label
        
        return jsonify({
            "result": result_label,
            "confidence": f"{confidence:.1f}%",
            "status": "safe" if is_healthy else "danger",
            "healthy": is_healthy
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Jalankan di port 5000
    app.run(debug=True, host="0.0.0.0", port=5000)
