from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
from tempfile import NamedTemporaryFile
import uvicorn
from transformers import pipeline

app = FastAPI()

# Set up CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load models
model = whisper.load_model("base")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")  # Use a more sophisticated model

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_file = NamedTemporaryFile(delete=False)
    try:
        temp_file.write(await file.read())
        temp_file.flush()
        result = model.transcribe(temp_file.name)
        transcription_text = result["text"]
        return {"text": transcription_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_file.name)

@app.post("/summarize/")
async def summarize_text(text: str = Form(...)):
    try:
        if text.strip() == "":
            raise HTTPException(status_code=400, detail="Empty transcription text")
        
        # Run the summarization
        summary_result = summarizer(text, max_length=130, min_length=30, do_sample=False)
        summarized_text = summary_result[0]['summary_text']
        return {"summary": summarized_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
