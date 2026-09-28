---
title: FishDoctor API
emoji: 🐟
colorFrom: gray
colorTo: yellow
sdk: docker
app_port: 7860
---

# FishDoctor API

Backend inference API untuk sistem klasifikasi penyakit ikan air tawar FishDoctor.

## Stack

- FastAPI
- TensorFlow
- Keras
- DenseNet-121
- Pillow
- NumPy

## Endpoint

### Health Check

`GET /`

`GET /health`

### Prediction

`POST /predict`

Input:

`multipart/form-data`

Field:

`file`

Output:

JSON prediction result.