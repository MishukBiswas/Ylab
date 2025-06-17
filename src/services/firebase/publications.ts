import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  volume: string;
  year: number;
  doi: string;
};

const COLLECTION_NAME = 'publications';

export const publicationsService = {
  // Get all publications
  async getAll(): Promise<Publication[]> {
    try {
      console.log('Fetching publications from Firestore...');
      console.log('Using collection:', COLLECTION_NAME);
      const publicationsRef = collection(db, COLLECTION_NAME);
      const q = query(publicationsRef, orderBy('year', 'desc'));
      console.log('Query created:', q);
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot received:', querySnapshot);
      
      if (querySnapshot.empty) {
        console.log('No publications found in Firestore');
        return [];
      }

      const publications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data:', data);
        return {
          id: doc.id,
          ...data
        } as Publication;
      });
      
      console.log('Successfully fetched publications:', publications);
      return publications;
    } catch (error) {
      console.error('Error fetching publications:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to fetch publications');
    }
  },

  // Add a new publication
  async add(data: Omit<Publication, 'id'>): Promise<Publication> {
    try {
      console.log('Adding new publication with data:', data);
      console.log('Using collection:', COLLECTION_NAME);
      
      // Ensure year is a number
      const processedData = {
        ...data,
        year: typeof data.year === 'string' ? parseInt(data.year, 10) : data.year,
        authors: Array.isArray(data.authors) ? data.authors : [data.authors]
      };
      
      console.log('Processed data:', processedData);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), processedData);
      console.log('Document added with ID:', docRef.id);
      
      const result = {
        id: docRef.id,
        ...processedData
      };
      console.log('Returning result:', result);
      return result;
    } catch (error) {
      console.error('Error adding publication:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to add publication');
    }
  },

  // Update a publication
  async update(id: string, data: Partial<Publication>): Promise<void> {
    try {
      console.log('Updating publication:', id);
      console.log('Update data:', data);
      console.log('Using collection:', COLLECTION_NAME);
      
      // Process the data
      const processedData = {
        ...data,
        year: data.year ? (typeof data.year === 'string' ? parseInt(data.year, 10) : data.year) : undefined,
        authors: data.authors ? (Array.isArray(data.authors) ? data.authors : [data.authors]) : undefined
      };
      
      console.log('Processed update data:', processedData);
      const docRef = doc(db, COLLECTION_NAME, id);
      console.log('Document reference created:', docRef);
      await updateDoc(docRef, processedData);
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating publication:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to update publication');
    }
  },

  // Delete a publication
  async delete(id: string): Promise<void> {
    try {
      console.log('Deleting publication:', id);
      console.log('Using collection:', COLLECTION_NAME);
      const docRef = doc(db, COLLECTION_NAME, id);
      console.log('Document reference created:', docRef);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting publication:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to delete publication');
    }
  }
}; 