import cron from 'node-cron';
import { FileManager } from '@/lib/file-manager';
import { fileStorage } from '@/app/api/upload/route'; // atau dari database

const fileManager = new FileManager();

// Cleanup job yang berjalan setiap jam
export function startCleanupJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running cleanup job...');
    
    try {
      // Ambil semua file dari storage
      const allFiles = Array.from(fileStorage.values());
      
      // Clean up expired files
      await fileManager.cleanupExpiredFiles(allFiles);
      
      // Remove expired entries from memory storage
      const now = new Date();
      for (const [key, file] of fileStorage.entries()) {
        if (file.expiresAt && file.expiresAt < now) {
          fileStorage.delete(key);
        }
      }
      
      console.log('Cleanup job completed');
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  });
}