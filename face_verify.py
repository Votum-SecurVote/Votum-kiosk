from insightface.app import FaceAnalysis
import numpy as np

app = FaceAnalysis()
app.prepare(ctx_id=0)

def detect_faces(frame):

    faces = app.get(frame)

    return faces

from sklearn.metrics.pairwise import cosine_similarity

def compare_faces(emb1, emb2):

    similarity = cosine_similarity([emb1], [emb2])[0][0]

    return similarity