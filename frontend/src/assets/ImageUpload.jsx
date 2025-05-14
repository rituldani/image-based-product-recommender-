// import React, { useState } from 'react';
// import axios from 'axios';

// const ImageUpload = () => {
//   const [file, setFile] = useState(null);

//   const handleChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('image', file); // 'image' is the field name

//     try {
//       const res = await axios.post('http://localhost:5000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       console.log('Response:', res.data);
//     } catch (err) {
//       console.error('Error uploading:', err);
//     }
//   };

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={handleChange} />
//       <button onClick={handleSubmit}>Upload</button>
//     </div>
//   );
// };

// export default ImageUpload;

import { useState } from "react";
import axios from "axios";
import FormData from "form-data";



const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_NODE_API;
  const IMAGE_BASE_URL = `${process.env.REACT_APP_FLASK_API}/image`;
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data.recommendations)
      const imagePaths = res.data.recommendations;
      const imageUrls = imagePaths.map((path) => {
        const filename = path.split("\\").pop(); // Extract filename from full Windows path
        return `${IMAGE_BASE_URL}/${filename}`; // Use Flask static route
      });
      setResult(imageUrls);
      // setResult(res.data.recommendations); // expects server to return { products: [...] }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-md w-full max-w-md">
      <h1 className="text-xl font-bold mb-4 text-center">Find Similar Products</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block mb-4 "
        />

        {preview && (
          <img src={preview} alt="preview" className="w-full h-70 object-cover mb-4 rounded-lg" />
        )}

        <button
          type="submit"
          disabled={!image || loading}
          className="w-full hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Searching..." : "Find Similar Products"}
        </button>
      </form>

      {result.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Recommended Products:</h2>
          <div className="grid grid-cols-2 gap-4">
            {result.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`result ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ImageUpload;
