from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
import logging
import whisper
from tempfile import NamedTemporaryFile
import os
from transformers import pipeline
import uvicorn

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Configure CORS middleware
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models for transcription and summarization
logger.debug("Loading Whisper model...")
audio_model = whisper.load_model("base")
logger.debug("Loading BART summarization model...")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.get("/")
async def read_root():
    logger.debug("Root endpoint hit")
    return {"message": "Welcome to the FastAPI Application!"}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    logger.debug("Received file for transcription.")
    with NamedTemporaryFile(delete=False) as temp_file:
        try:
            logger.debug("Writing uploaded file to temp file.")
            temp_file.write(await file.read())
            temp_file.flush()
            logger.debug("Transcribing audio.")
            result = audio_model.transcribe(temp_file.name)
            transcription_text = result["text"]
            logger.debug("Transcription successful.")
            return {"text": transcription_text}
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        finally:
            os.remove(temp_file.name)

@app.post("/summarize/")
async def summarize_text(text: str = Body(...)):
    logger.debug("Received text for summarization.")
    try:
        if not text.strip():
            logger.warning("Empty transcription text received for summarization.")
            raise HTTPException(status_code=400, detail="Empty transcription text")
        
        logger.debug("Determining max_length based on input text length.")
        input_length = len(text.split())
        max_length = min(512, max(3, input_length))  # Set max_length to a reasonable size
        
        logger.debug("Summarizing text.")
        summary_result = summarizer(text, max_length=132, min_length=30, do_sample=False)
        summarized_text = summary_result[0]['summary_text']
        logger.debug("Summary generated.")
        return {"summary": summarized_text}
    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Summarization failed. Please try again.")

# Main entry point for running the app
if __name__ == "__main__":
    logging.info("Starting FastAPI application...")
    uvicorn.run(app, host="0.0.0.0", port=8000)




