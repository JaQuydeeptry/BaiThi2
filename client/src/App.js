import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css"; // Đảm bảo bạn đã có Tailwind hoặc CSS cơ bản

// Cấu hình URL Backend (Khi deploy lên Render thì thay localhost bằng link Render)
const API_BASE_URL = "https://baithi2-1.onrender.com"; 

// --- COMPONENT 1: UPLOAD (TRANG CHỦ) ---
const UploadScreen = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.includes("audio")) {
      setFile(selected);
      setError("");
    } else {
      setError("Please select a valid MP3/Audio file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/upload`, formData);
      // Tạo link chia sẻ trỏ về trang Download của Frontend
      const link = `${window.location.origin}/share/${res.data.fileId}`;
      setShareLink(link);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Music Sharing App</h1>
        
        {!shareLink ? (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 hover:bg-gray-50 transition">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                id="fileInput" 
                accept="audio/*"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <span className="text-4xl mb-2">☁️</span>
                <span className="text-gray-600 font-medium">
                  {file ? file.name : "Click to Upload MP3"}
                </span>
                <span className="text-xs text-gray-400 mt-2">Supports MP3, WAV</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-2 px-4 rounded text-white font-bold transition ${
                !file || uploading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </>
        ) : (
          <div className="text-left">
            <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
              <p className="text-green-800 font-semibold text-center mb-2">Upload Successful! 🎉</p>
              <p className="text-sm text-gray-600 mb-1">Share this link:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="w-full text-xs p-2 border rounded bg-white select-all"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="bg-gray-800 text-white text-xs px-3 rounded hover:bg-gray-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <button 
              onClick={() => { setShareLink(""); setFile(null); }}
              className="w-full text-blue-500 text-sm hover:underline"
            >
              Upload another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT 2: DOWNLOAD (TRANG CHIA SẺ) ---
const DownloadScreen = () => {
  const { id } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/file/${id}`);
        setFileData(res.data);
      } catch (err) {
        console.error("Error fetching file");
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  const handleDownload = async () => {
    try {
      // Lấy link force download từ server
      const res = await axios.get(`${API_BASE_URL}/api/download/${id}`);
      window.open(res.data.url, "_blank");
    } catch (error) {
      alert("Error starting download");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading file info...</div>;
  if (!fileData) return <div className="text-center mt-20 text-red-500">File not found or expired.</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <span className="text-5xl mb-4 block">🎵</span>
          <h2 className="text-xl font-bold text-gray-800 break-words">{fileData.filename}</h2>
          <p className="text-gray-500 text-sm mt-2">
            Size: {(fileData.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Your file is ready. Click the button below to download.
        </p>

        <button
          onClick={handleDownload}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition flex items-center justify-center gap-2"
        >
          <span>Download File</span>
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/share/:id" element={<DownloadScreen />} />
      </Routes>
    </Router>
  );
}

export default App;