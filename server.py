from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
from tempfile import NamedTemporaryFile
import uvicorn

app = FastAPI()

   # Set up CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

   # Load the Whisper model
model = whisper.load_model("base")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Create a temporary file
    temp_file = NamedTemporaryFile(delete=False)
    try:
        temp_file.write(await file.read())
        temp_file.flush()  # Ensure all data is written before reading

        # Use the Whisper model to transcribe the audio
        result = model.transcribe(temp_file.name)
        return {"text": result["text"]}
    finally:
        os.remove(temp_file.name)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



