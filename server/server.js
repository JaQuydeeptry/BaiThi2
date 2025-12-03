const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();

// Cấu hình cho phép mọi nơi truy cập (để Netlify kết nối được)
app.use(cors({ origin: "*" }));
app.use(express.json());

// 1. CẤU HÌNH CLOUDINARY (Key của bạn)
cloudinary.config({
    cloud_name: 'dzfoxtfo1',
    api_key: '388388424982321',
    api_secret: 'BCvJdLujuj56SMhDcbiY_STtawA'
});

// 2. KẾT NỐI MONGODB (Dùng lại của bài trước, đổi tên DB thành musicapp)
const MONGO_URL = "mongodb+srv://bilongdaica12_db_user:anhemtot12@cluster0.2fvaipc.mongodb.net/musicapp?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// Schema lưu file
const FileSchema = new mongoose.Schema({
    filename: String,
    size: Number,
    url: String, 
    format: String,
    createdAt: { type: Date, default: Date.now }
});
const FileModel = mongoose.model('MusicFile', FileSchema);

// Cấu hình Multer (Upload)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Tối đa 10MB
});

// --- API ROUTES ---

// Upload File
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");

    let stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', format: 'mp3' },
        async (error, result) => {
            if (error) return res.status(500).json(error);
            
            const newFile = new FileModel({
                filename: req.file.originalname,
                size: req.file.size,
                url: result.secure_url,
                format: result.format
            });
            await newFile.save();
            res.json(newFile);
        }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// Lấy thông tin file
app.get('/api/files/:id', async (req, res) => {
    try {
        const file = await FileModel.findById(req.params.id);
        if (!file) return res.status(404).json("File not found");
        res.json(file);
    } catch (error) {
        res.status(500).json(error);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
