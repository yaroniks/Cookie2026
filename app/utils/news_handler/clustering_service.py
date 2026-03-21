from app.utils.news_handler.embedding_service import embedding_service

import hdbscan


class ClusteringService:
    def __init__(self):
        self.clusterer = hdbscan.HDBSCAN(min_cluster_size=3, prediction_data=True)

    def cluster_articles(self, articles: list[dict]) -> list[dict]:
        """
        Принимает список статей с полями title + description,
        возвращает те же статьи с добавленным cluster_id.
        cluster_id = -1 означает "шум" (статья ни в один кластер не попала).
        """
        texts = [
            f"{a.get('title', '')} {a.get('description', '')} {a.get('category', '')}"
            for a in articles
        ]
        embeddings = embedding_service.encode_batch(texts)
        labels = self.clusterer.fit_predict(embeddings)

        result = []
        for article, label, vec in zip(articles, labels, embeddings):
            result.append({
                **article,
                "cluster_id": int(label),
                "embedding": vec.tolist()
            })
        return result


clustering_service = ClusteringService()
