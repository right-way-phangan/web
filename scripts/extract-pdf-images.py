import fitz, sys, os, hashlib

# extract_pdf_images.py <key> <pdf> [minw] [minh]
key, pdf = sys.argv[1], sys.argv[2]
minw = int(sys.argv[3]) if len(sys.argv) > 3 else 900
minh = int(sys.argv[4]) if len(sys.argv) > 4 else 600
out = f"/tmp/pdf-extract/{key}"
os.makedirs(out, exist_ok=True)

doc = fitz.open(pdf)
seen_xref = set()
seen_hash = {}
saved = []
for pno in range(len(doc)):
    for img in doc.get_page_images(pno):
        xref = img[0]
        if xref in seen_xref:
            continue
        seen_xref.add(xref)
        try:
            pix = fitz.Pixmap(doc, xref)
        except Exception:
            continue
        w, h = pix.width, pix.height
        if w < minw or h < minh:
            continue
        # to RGB if needed
        if pix.n - pix.alpha >= 4:  # CMYK
            pix = fitz.Pixmap(fitz.csRGB, pix)
        data = pix.tobytes("png")
        hh = hashlib.md5(data).hexdigest()
        if hh in seen_hash:
            continue
        seen_hash[hh] = True
        fn = f"{out}/p{pno+1:02d}_x{xref}_{w}x{h}.png"
        with open(fn, "wb") as f:
            f.write(data)
        saved.append((pno + 1, w, h, fn))
print(f"{key}: {len(saved)} images ≥{minw}x{minh} (of {len(doc)} pages)")
for pno, w, h, fn in saved:
    print(f"  p{pno:>2} {w}x{h}  {os.path.basename(fn)}")
