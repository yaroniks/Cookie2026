from typing import Optional
from pydantic import BaseModel, Field


class Node(BaseModel):
    id: str
    label: str
    type: str


class Edge(BaseModel):
    source: str
    target: str
    weight: int


class Occurrences(BaseModel):
    nodes: list[Node]
    edges: list[Edge]
