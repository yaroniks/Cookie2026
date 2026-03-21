import spacy


class NERService:
    def __init__(self):
        self.nlp = spacy.load("ru_core_news_md")

    def extract_entities(self, text: str) -> list[dict]:
        """
        Пример работы:
        text = Владимир Путин встретился с главой Газпрома в Москве
        return = [
            {
                text: Владимир Путин
                label: PER
            }, ...
        ]
        """

        if not text:
            return []
        doc = self.nlp(text[:10000])  # spaCy имеет лимит
        entities = []
        seen = set('None')

        for ent in doc.ents:
            # Фильтруем нужные типы
            if ent.label_ not in ("PER", "PERSON", "ORG", "LOC", "GPE"):
                continue

            # Убираем дубли
            key = (ent.text.strip(), ent.label_)
            if key in seen:
                continue
            seen.add(key)

            entities.append({
                "text": ent.text.strip(),
                "label": ent.label_,
            })

        return entities


ner_service = NERService()
