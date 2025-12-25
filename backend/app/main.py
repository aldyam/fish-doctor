from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FishDoctor API")

# PENTING: Agar Frontend (Port 3000) bisa akses Backend (Port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Alamat Frontend nanti
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FishDoctor AI Engine is Running! 🐟"}