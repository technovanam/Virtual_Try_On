import sys
from pathlib import Path

files = [
    r"C:\\Users\\Sasi\\Documents\\Virtual_Try_On\\HairVerse\\Ai Hairstyle App Professional Product Requirements Structure.pdf",
    r"C:\\Users\\Sasi\\Documents\\Virtual_Try_On\\HairVerse\\hairstyle- pages.pdf",
]

try:
    import PyPDF2
except Exception as e:
    print("PyPDF2 not available:", e)
    sys.exit(1)

output_path = Path(r"C:\\Users\\Sasi\\Documents\\Virtual_Try_On\\HairVerse\\tools\\pdf_text.txt")

with output_path.open("w", encoding="utf-8") as out:
    for f in files:
        path = Path(f)
        out.write(f"\n=== {path.name} ===\n")
        with path.open("rb") as fh:
            reader = PyPDF2.PdfReader(fh)
            out.write(f"Pages: {len(reader.pages)}\n")
            for i, page in enumerate(reader.pages, 1):
                text = page.extract_text() or ""
                out.write(f"\n-- Page {i} --\n")
                out.write(text.strip())
                out.write("\n")
