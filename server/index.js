import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { db } from './firebase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.IMGBB_API_KEY) {
  console.error('Missing required environment variable: IMGBB_API_KEY');
  console.error('Please create a .env file in the server directory with:');
  console.error('IMGBB_API_KEY=your_imgbb_api_key');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add both localhost and 127.0.0.1
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 3001,
      imgbbKey: process.env.IMGBB_API_KEY ? 'Set' : 'Not set'
    }
  });
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    message: 'Image upload server is active',
    endpoints: {
      upload: '/api/upload (POST)',
      test: '/api/test (GET)'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Upload file to ImgBB
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });
    
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Read the file
    const fileBuffer = await fsPromises.readFile(req.file.path);
    console.log('File read successfully, size:', fileBuffer.length);

    // Convert to base64
    const base64Image = fileBuffer.toString('base64');

    // Create form data for ImgBB
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('key', process.env.IMGBB_API_KEY);
    formData.append('name', req.file.originalname);

    // Upload to ImgBB
    const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    // Clean up the temporary file
    try {
      await fsPromises.unlink(req.file.path);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText
      });
      throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload successful:', uploadResult);

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error('ImgBB upload failed: Invalid response format');
    }

    // Return the image URLs and metadata
    res.json({
      success: true,
      data: {
        url: uploadResult.data.url,
        displayUrl: uploadResult.data.display_url,
        thumbUrl: uploadResult.data.thumb?.url,
        mediumUrl: uploadResult.data.medium?.url,
        deleteUrl: uploadResult.data.delete_url,
        title: uploadResult.data.title,
        size: uploadResult.data.size,
        time: uploadResult.data.time
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Upload failed',
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Add new endpoint for image deletion
app.delete('/api/delete-image', async (req, res) => {
  try {
    const { imageUrl, teamId, type = 'team' } = req.body;
    
    if (!imageUrl || !teamId) {
      return res.status(400).json({
        success: false,
        error: 'Image URL and ID are required'
      });
    }

    console.log('Attempting to delete image:', imageUrl);
    console.log('ID:', teamId);
    console.log('Type:', type);

    // Extract the delete hash from the image URL
    // ImgBB URLs are in format: https://i.ibb.co/xxxxx/image.jpg
    const deleteHash = imageUrl.split('/').pop().split('.')[0];
    
    if (!deleteHash) {
      console.error('Invalid image URL format:', imageUrl);
      return res.status(400).json({
        success: false,
        error: 'Invalid image URL format'
      });
    }

    console.log('Delete hash:', deleteHash);

    // Make the delete request to ImgBB
    const deleteUrl = `https://api.imgbb.com/1/delete/${deleteHash}`;
    console.log('Delete URL:', deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Client-ID ${process.env.IMGBB_API_KEY}`
      }
    });

    console.log('ImgBB API Response Status:', response.status);
    console.log('ImgBB API Response Status Text:', response.statusText);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      console.error('ImgBB API Error:', response.status, response.statusText);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete image from ImgBB'
      });
    }

    // Update the document in the database to remove the image URL
    try {
      const collection = type === 'team' ? 'teams' : 'research';
      const docRef = db.collection(collection).doc(teamId);
      await docRef.update({
        imageUrl: ''
      });
      console.log('Database updated successfully');
    } catch (error) {
      console.error('Error updating database:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update database'
      });
    }

    return res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete image'
    });
  }
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Server starting on port ${PORT}...`);
  console.log('Environment variables:');
  console.log('- IMGBB_API_KEY:', process.env.IMGBB_API_KEY ? 'Set' : 'Not set');
  console.log('- PORT:', process.env.PORT || 3001);
  console.log('=================================');
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or close the application using this port.`);
  }
  process.exit(1);
});