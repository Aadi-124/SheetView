
import os
from typing import Dict, Any

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from starlette.responses import JSONResponse

# ==============================
# App Initialization
# ==============================

app = FastAPI(title="Excel Web UI Backend")

# Allow your React frontend
FRONTEND_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
FILE_PATH = os.path.join(UPLOAD_DIR, "data.xlsx")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# ==============================
# Utility Functions
# ==============================

def ensure_upload_dir():
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    - Remove unnamed columns
    - Replace NaN with None (JSON safe)
    - Reset index
    """
    df = df.loc[:, ~df.columns.astype(str).str.contains("^Unnamed")]
    df = df.where(pd.notnull(df), None)
    df.reset_index(drop=True, inplace=True)
    return df


def load_excel() -> pd.DataFrame:
    if not os.path.exists(FILE_PATH):
        raise HTTPException(status_code=404, detail="No Excel file uploaded yet.")

    try:
        df = pd.read_excel(FILE_PATH)
        df = clean_dataframe(df)
        return df
    except Exception:
        raise HTTPException(status_code=500, detail="Error reading Excel file.")


def save_excel(df: pd.DataFrame):
    try:
        df.to_excel(FILE_PATH, index=False)
    except Exception:
        raise HTTPException(status_code=500, detail="Error saving Excel file.")


# ==============================
# Pydantic Models
# ==============================

class RowData(BaseModel):
    data: Dict[str, Any]

    @validator("data")
    def validate_non_empty(cls, value):
        for key, val in value.items():
            if val is None or str(val).strip() == "":
                raise ValueError(f"Field '{key}' cannot be empty.")
        return value


# ==============================
# Health Check
# ==============================

@app.get("/")
def health_check():
    return {"status": "Backend running"}


# ==============================
# 1️⃣ Upload Excel File
# ==============================

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ensure_upload_dir()

    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files allowed.")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    try:
        with open(FILE_PATH, "wb") as buffer:
            buffer.write(contents)

        # Validate file readable
        df = pd.read_excel(FILE_PATH)
        df = clean_dataframe(df)

        return {"message": "File uploaded successfully."}

    except Exception:
        raise HTTPException(status_code=500, detail="File upload failed.")


# ==============================
# 2️⃣ Get Paginated Data
# ==============================

@app.get("/data")
def get_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    df = load_excel()

    total_records = len(df)
    start = (page - 1) * page_size
    end = start + page_size

    if start >= total_records:
        raise HTTPException(status_code=400, detail="Page number out of range.")

    paginated_df = df.iloc[start:end]

    return {
        "page": page,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": (total_records + page_size - 1) // page_size,
        "data": paginated_df.to_dict(orient="records"),
    }


# ==============================
# 3️⃣ Create New Row
# ==============================

@app.post("/row")
def create_row(row: RowData):
    df = load_excel()

    new_row = pd.DataFrame([row.data])

    if set(new_row.columns) != set(df.columns):
        raise HTTPException(
            status_code=400,
            detail="Columns do not match Excel structure.",
        )

    df = pd.concat([df, new_row], ignore_index=True)
    df = clean_dataframe(df)

    save_excel(df)

    return {"message": "Row added successfully."}


# ==============================
# 4️⃣ Update Row
# ==============================

@app.put("/row/{row_index}")
def update_row(row_index: int, row: RowData):
    df = load_excel()

    if row_index < 0 or row_index >= len(df):
        raise HTTPException(status_code=404, detail="Row index not found.")

    for column in df.columns:
        if column not in row.data:
            raise HTTPException(
                status_code=400,
                detail=f"Missing field: {column}",
            )

    df.loc[row_index] = row.data
    df = clean_dataframe(df)

    save_excel(df)

    return {"message": "Row updated successfully."}


# ==============================
# 5️⃣ Delete Row
# ==============================

@app.delete("/row/{row_index}")
def delete_row(row_index: int):
    df = load_excel()

    if row_index < 0 or row_index >= len(df):
        raise HTTPException(status_code=404, detail="Row index not found.")

    df = df.drop(index=row_index)
    df = clean_dataframe(df)

    save_excel(df)

    return {"message": "Row deleted successfully."}


# ==============================
# Global Exception Handler
# ==============================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected server error occurred."},
    )
