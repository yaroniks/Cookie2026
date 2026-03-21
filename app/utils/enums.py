from enum import Enum


class SourceEnum(Enum):
    ria = 'ria'
    lenta = 'lenta'
    tass = 'tass'
    kommersant = 'kommersant'
    vedomosti = 'vedomosti'
    habr = 'habr'
    cnews = 'cnews'


class EntityEnum(Enum):
    PER = "PER"
    PERSON = "PERSON"
    ORG = "ORG"
    LOC = "LOC"
    GPE = "GPE"
