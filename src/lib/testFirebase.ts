import { database } from './firebase';
import { ref, set, get } from 'firebase/database';

export const testDatabaseConnection = async () => {
  try {
    // Create a test reference
    const testRef = ref(database, 'test/connection');
    
    // Write test data
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Test connection successful',
      status: 'connected'
    });
    
    // Read the data back
    const snapshot = await get(testRef);
    const data = snapshot.val();
    
    console.log('Database connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
}; 