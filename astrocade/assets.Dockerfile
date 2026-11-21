FROM python:3.12-slim
RUN pip install --no-cache-dir Pillow==11.3.0
WORKDIR /app
ENTRYPOINT ["python", "scripts/encode-astrocade-assets.py"]
