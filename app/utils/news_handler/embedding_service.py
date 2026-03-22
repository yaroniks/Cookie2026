from app.database.redis import redis_service

import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    def __init__(self):
        # multilingual — понимает русский и английский
        self.model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

    async def encode(self, text: str) -> list[float]:
        """
        Кодирует текст в числовые векторы

        text = Путин встретился с Байденом в Женеве
        return = [ 0.12, -0.34,  0.07,  0.91, -0.22, ...]
        """
        if await redis_service.get(text.lower().replace(' ', '_')):
            return await redis_service.get(text.lower().replace(' ', '_'))

        vec = self.model.encode(text, normalize_embeddings=True).tolist()
        await redis_service.set(text.lower().replace(' ', '_'), vec)
        return vec

    def encode_batch(self, texts: list[str]) -> np.ndarray:
        """Делает encode но перебирает списки """
        return self.model.encode(texts, normalize_embeddings=True, batch_size=32)


embedding_service = EmbeddingService()
