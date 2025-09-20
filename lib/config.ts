export const APP_CONFIG = {
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedExtensions: [
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
      // Documents
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.odt', '.ods', '.odp',
      // Text files
      '.txt', '.csv', '.json', '.xml', '.md',
      // Archives
      '.zip', '.rar', '.7z', '.tar', '.gz',
      // Media files
      '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flv', '.wmv', '.mkv',
      // Code files
      '.js', '.ts', '.html', '.css', '.php', '.py', '.java', '.cpp'
    ],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    durations: {
      '1hour': { ms: 60 * 60 * 1000, label: '1 Jam' },
      '6hours': { ms: 6 * 60 * 60 * 1000, label: '6 Jam' },
      '12hours': { ms: 12 * 60 * 60 * 1000, label: '12 Jam' },
      '1day': { ms: 24 * 60 * 60 * 1000, label: '1 Hari' },
      '7days': { ms: 7 * 24 * 60 * 60 * 1000, label: '7 Hari' },
      '14days': { ms: 14 * 24 * 60 * 60 * 1000, label: '14 Hari' },
      '30days': { ms: 30 * 24 * 60 * 60 * 1000, label: '30 Hari' },
      'unlimited': { ms: null, label: 'Tanpa Batas' }
    }
  },
  // Security settings
  security: {
    secretKey: process.env.UPLOAD_SECRET_KEY || 'default-secret-key',
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 menit
      maxRequests: 100 // maksimal 100 request per window
    }
  },
  // App settings
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    name: 'next uploader',
    version: '1.0.0'
  }
};