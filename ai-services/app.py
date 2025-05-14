# from flask import Flask, request, jsonify
# import numpy as np
# import pickle as pkl
# import tensorflow as tf
# from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
# from tensorflow.keras.preprocessing import image
# from tensorflow.keras.layers import GlobalMaxPool2D
# from sklearn.neighbors import NearestNeighbors
# from numpy.linalg import norm
# from PIL import Image
# import os

# app = Flask(__name__)

# # Load the pre-trained ResNet model
# base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
# model = tf.keras.Sequential([base_model, GlobalMaxPool2D()])
# model.trainable = False

# # Load your preprocessed feature vectors and file paths
# image_features = pkl.load(open('Images_features.pkl', 'rb'))
# filenames = pkl.load(open('filenames.pkl', 'rb'))

# # Create Nearest Neighbors model
# neighbors = NearestNeighbors(n_neighbors=5, algorithm='brute', metric='euclidean')
# neighbors.fit(image_features)

# def extract_features_from_image_file(img_file):
#     img = Image.open(img_file).resize((224, 224)).convert('RGB')
#     img_array = image.img_to_array(img)
#     img_expand_dim = np.expand_dims(img_array, axis=0)
#     img_preprocess = preprocess_input(img_expand_dim)
#     result = model.predict(img_preprocess).flatten()
#     norm_result = result / norm(result)
#     return norm_result

# @app.route("/predict", methods=["POST"])
# def recommend():
#     if "image" not in request.files:
#         return jsonify({"error": "No image provided"}), 400

#     file = request.files["image"]

#     try:
#         feature_vector = extract_features_from_image_file(file)
#         distances, indices = neighbors.kneighbors([feature_vector])
#         results = [{"file": filenames[i], "distance": float(distances[0][idx])} for idx, i in enumerate(indices[0])]
#         return jsonify({"matches": results})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5001, debug=True)



from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import send_from_directory
import numpy as np
import pickle as pkl
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPool2D
from sklearn.neighbors import NearestNeighbors
from numpy.linalg import norm
import cv2
import os

app = Flask(__name__)
CORS(app)

# Load model
model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False
model = tf.keras.Sequential([model, GlobalMaxPool2D()])

# Load stored features and filenames
feature_list = pkl.load(open('Images_features.pkl', 'rb'))
filenames = pkl.load(open('filenames.pkl', 'rb'))

# Setup NearestNeighbors
neighbors = NearestNeighbors(n_neighbors=5, algorithm='brute', metric='euclidean')
neighbors.fit(feature_list)

# Helper function to extract features
def extract_features(img_path, model):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    expanded_img = np.expand_dims(img_array, axis=0)
    preprocessed_img = preprocess_input(expanded_img)
    result = model.predict(preprocessed_img).flatten()
    normalized = result / norm(result)
    return normalized

# ROUTE: /recommend
@app.route('/recommend', methods=['POST'])
def recommend():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    img_file = request.files['image']
    img_path = os.path.join("temp.jpg")
    img_file.save(img_path)

    # Extract features and find neighbors
    try:
        feature = extract_features(img_path, model)
        distances, indices = neighbors.kneighbors([feature])

        # Get top 5 similar image paths
        similar_images = [filenames[i] for i in indices[0]]

        return jsonify({'recommendations': similar_images})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/image/<filename>")
def get_image(filename):
    return send_from_directory("D:/python/myntradataset/image", filename)

if __name__ == '__main__':
    app.run(port=5001, debug=True)
