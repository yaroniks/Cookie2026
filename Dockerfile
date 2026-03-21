FROM python:3.13.7

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN python -m spacy download ru_core_news_sm

COPY . .

EXPOSE 8000

CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8000", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker"]
