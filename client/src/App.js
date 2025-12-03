import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, FileAudio, Check, Copy, Download } from 'lucide-react';

// ⚠️ SAU KHI DEPLOY RENDER XONG, BẠN COPY LINK DÁN VÀO ĐÂY NHÉ
// Ví dụ: const API_URL = "https://music-app-xyz.onrender.com";
// Dán chính xác link Render của bạn vào đây
const API_URL = "https://music-server-vv3e.onrender.com"; 

// --- TRANG UPLOAD ---
const UploadPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    const selected = acceptedFiles[0];
    if (selected && selected.type === 'audio/mpeg') {
      handleUpload(selected);
    } else {
      alert("Only MP3 files supported");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {'audio/mpeg': ['.mp3']},
    multiple: false
  });

  const handleUpload = async (fileToUpload) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData);
      setUploadedData(res.data);
    } catch (error) {
      console.error(error);
      alert("Upload failed! Check server.");
    } finally {
      setUploading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/download/${uploadedData._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-700">
      <h1 className="text-2xl font-bold mb-8 text-slate-800">Music Sharing App</h1>
      
      {!uploadedData ? (
        <div {...getRootProps()} className={`w-full max-w-md p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <p className="text-indigo-600 font-bold">Uploading...</p>
          ) : (
            <>
              <UploadCloud size={64} className="text-slate-400 mb-4" />
              <p className="font-bold">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500">Only MP3 files supported</p>
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="bg-[#3b4252] p-5 flex items-center gap-4 text-white">
               <FileAudio size={40} />
               <div>
                 <p className="font-semibold w-64 truncate">{uploadedData.filename}</p>
                 <p className="text-sm opacity-80">{(uploadedData.size / 1024 / 1024).toFixed(2)} MB</p>
               </div>
            </div>
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="text-green-600" /></div>
              <p className="font-bold text-lg">File uploaded successfully!</p>
              <div className="flex gap-2 my-4">
                <input readOnly value={`${window.location.origin}/download/${uploadedData._id}`} className="flex-1 border rounded px-3 text-sm" />
                <button onClick={copyLink} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <button onClick={() => setUploadedData(null)} className="text-indigo-600 hover:underline">Upload New File</button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- TRANG DOWNLOAD ---
const DownloadPage = () => {
  const { id } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/files/${id}`)
      .then(res => setFileData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = () => window.open(fileData.url, '_blank');

  if (loading) return <div>Loading...</div>;
  if (!fileData) return <div>File not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="p-6 text-center border-b"><h2 className="text-xl font-bold">Download File</h2></div>
        <div className="p-8 text-center">
           <div className="bg-[#3b4252] p-5 rounded-xl flex items-center gap-4 text-white mb-8">
               <FileAudio size={40} />
               <div className="text-left"><p className="font-semibold w-56 truncate">{fileData.filename}</p></div>
           </div>
           <button onClick={handleDownload} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold flex justify-center gap-2"><Download /> Download</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/download/:id" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
