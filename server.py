from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
from tempfile import NamedTemporaryFile
import os
import logging
from transformers import pipeline

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    with NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        try:
            temp_file.write(await file.read())
            temp_file.flush()

            # Skipping speaker segmentation for now
            logger.debug("Transcribing audio.")
            
            # Whisper uses audio file directly
            result = audio_model.transcribe(temp_file.name)
            transcription_text = result["text"]

            logger.debug("Transcription successful.")
            return {"text": transcription_text}
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        finally:
            try:
                os.remove(temp_file.name)
            except Exception as e:
                logger.warning(f"Could not delete temp file: {str(e)}")

class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize/")
async def summarize_text(request: SummarizeRequest):
    text = request.text
    logger.debug("Received text for summarization.")
    
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Empty transcription text")

        logger.debug("Summarizing text with structured prompt.")
        structured_prompt = (
            "Using the provided medical visit text, "
            "write a concise and accurate summary in the SOAP note format, "
            "compliant with billing and documentation standards. "
            "Include the following sections as distinct paragraphs, expanding on each as needed: "
            "1. Subjective (S): Chief Complaint, History of Present Illness, Past Medical History, "
            "Medications, Allergies, Family and Social History, Review of Systems. "
            "2. Objective (O): Vital Signs, Physical Exam findings, Diagnostic test results. "
            "3. Assessment (A): Diagnosis, Impression linking findings to diagnosis. "
            "4. Plan (P): Treatment management, medications, interventions, tests, patient education, "
            "follow-up instructions."
        )

        input_text = f"{structured_prompt}\n\n{text}"
        summary_result = summarizer(input_text, max_length=600, min_length=200, do_sample=False)
        
        if not summary_result or 'summary_text' not in summary_result[0]:
            raise ValueError("Summarizer returned unexpected format")

        summarized_text = summary_result[0]['summary_text']

        sections = ["Subjective", "Objective", "Assessment", "Plan"]
        final_summary = {section: [] for section in sections}

        current_section = None
        for line in summarized_text.split(". "):
            for section in sections:
                if section in line:
                    current_section = section
                    break
            if current_section:
                final_summary[current_section].append(line.strip())

        formatted_summary = "\n".join(f"{section}: {' '.join(content) if content else 'N/A'}" 
                                      for section, content in final_summary.items())

        logger.debug("Summary generated.")
        return {"summary": formatted_summary}
    
    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

if __name__ == "__main__":
    logging.info("Starting FastAPI application...")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



