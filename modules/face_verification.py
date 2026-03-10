import json
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from config import VOTERS_DIR, SIMILARITY_THRESHOLD
from logger import logger

def load_voter_embedding(voter_id):
    """
    Loads a predefined voter embedding from metadata.json
    """
    voter_path = os.path.join(VOTERS_DIR, voter_id, "metadata.json")
    if not os.path.exists(voter_path):
        logger.error(f"Voter metadata not found for {voter_id}")
        return None

    try:
        with open(voter_path, 'r') as f:
            data = json.load(f)
            embedding = np.array(data.get("embedding"))
            if embedding is None:
                raise ValueError("No embedding vector found in metadata.json")
            return embedding
    except Exception as e:
        logger.error(f"Failed to load voter embedding for {voter_id}: {e}")
        return None

def verify_face(live_embedding, target_embedding, threshold=SIMILARITY_THRESHOLD):
    """
    Compares two face embeddings using cosine similarity.
    Returns: (is_match, similarity_score)
    """
    if live_embedding is None or target_embedding is None:
        return False, 0.0

    # Ensure shape is 2D for cosine similarity
    live_emb = [live_embedding]
    target_emb = [target_embedding]

    similarity = cosine_similarity(live_emb, target_emb)[0][0]
    is_match = similarity >= threshold

    logger.debug(f"Face verification score: {similarity:.4f} (Match: {is_match})")
    
    return is_match, similarity

def generate_voter_metadata(voter_id, face_embedding):
    """
    Utility to save a new voter's embedding to disk.
    """
    voter_dir = os.path.join(VOTERS_DIR, voter_id)
    os.makedirs(voter_dir, exist_ok=True)
    
    metadata_path = os.path.join(voter_dir, "metadata.json")
    data = {
        "voter_id": voter_id,
        "embedding": face_embedding.tolist()
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(data, f)
        
    logger.info(f"Registered voter {voter_id} successfully.")
    return True
