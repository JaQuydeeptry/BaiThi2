require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. KẾT NỐI MONGODB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 2. CẤU HÌNH CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 3. MODEL FILE ---
const FileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  size: Number,
  format: String,
  publicId: String,
}, { timestamps: true });

const FileModel = mongoose.model('File', FileSchema);

// --- 4. CẤU HÌNH STORAGE (MULTER) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-share-app',
    resource_type: 'auto',
    allowed_formats: ['mp3', 'wav', 'flac'],
  },
});
const upload = multer({ storage: storage });

// --- 5. ROUTES ---

// Route kiểm tra Server sống hay chết (Tránh lỗi Cannot GET /)
app.get('/', (req, res) => {
  res.send('Server Music Sharing is RUNNING! 🚀');
});

// API Upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log("📥 Receiving file upload request..."); // Log để kiểm tra trên Render
    
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Lưu vào DB
    const newFile = new FileModel({
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      format: req.file.mimetype,
      publicId: req.file.filename,
    });

    const savedFile = await newFile.save();
    console.log("✅ File saved to DB with ID:", savedFile._id);

    // Trả về kết quả JSON chuẩn
    res.json({ 
      success: true, 
      fileId: savedFile._id, 
      downloadUrl: savedFile.path 
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// API Lấy thông tin file
app.get('/api/file/:id', async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API Download
app.get('/api/download/:id', async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    const downloadUrl = cloudinary.url(file.publicId, { 
      resource_type: 'video', 
      flags: 'attachment' 
    });
    
    res.json({ url: downloadUrl || file.path });
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));