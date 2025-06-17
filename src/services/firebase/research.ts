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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import type { ResearchProject } from '../../types';

const COLLECTION_NAME = 'research';

export const researchService = {
  // Get all research projects
  async getAll(): Promise<ResearchProject[]> {
    try {
      console.log('Fetching research projects from Firestore...');
      console.log('Using collection:', COLLECTION_NAME);
      const q = query(collection(db, COLLECTION_NAME), orderBy('title'));
      console.log('Query created:', q);
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot received:', querySnapshot);
      
      if (querySnapshot.empty) {
        console.log('No research projects found in Firestore');
        return [];
      }

      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data:', data);
        // Ensure all required fields are present
        const project = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          longDescription: data.longDescription || '',
          imageUrl: data.imageUrl || '',
          team: Array.isArray(data.team) ? data.team : [],
          funding: data.funding || '',
          status: data.status || 'active',
          category: data.category || 'analytical',
          startDate: data.startDate || new Date().toISOString(),
          endDate: data.endDate || 'Ongoing'
        };
        console.log('Processed project:', project);
        return project;
      });
      
      console.log('Successfully fetched research projects:', projects);
      return projects;
    } catch (error) {
      console.error('Error fetching research projects:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to fetch research projects');
    }
  },

  // Add a new research project
  async add(data: Omit<ResearchProject, 'id'>): Promise<ResearchProject> {
    try {
      console.log('Adding new research project with data:', data);
      console.log('Using collection:', COLLECTION_NAME);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
      console.log('Document added with ID:', docRef.id);
      const result = {
        id: docRef.id,
        ...data
      };
      console.log('Returning result:', result);
      return result;
    } catch (error) {
      console.error('Error adding research project:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to add research project');
    }
  },

  // Update a research project
  async update(id: string, data: Partial<ResearchProject>): Promise<void> {
    try {
      console.log('Updating research project:', id);
      console.log('Update data:', data);
      console.log('Using collection:', COLLECTION_NAME);
      const docRef = doc(db, COLLECTION_NAME, id);
      console.log('Document reference created:', docRef);
      await updateDoc(docRef, data);
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating research project:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to update research project');
    }
  },

  // Delete a research project
  async delete(id: string): Promise<void> {
    try {
      console.log('Deleting research project:', id);
      console.log('Using collection:', COLLECTION_NAME);
      const docRef = doc(db, COLLECTION_NAME, id);
      console.log('Document reference created:', docRef);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting research project:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to delete research project');
    }
  },

  // Upload project image
  async uploadImage(file: File): Promise<string> {
    try {
      console.log('Uploading image:', file.name);
      const storageRef = ref(storage, `research/${Date.now()}_${file.name}`);
      console.log('Storage reference created:', storageRef);
      await uploadBytes(storageRef, file);
      console.log('File uploaded successfully');
      const url = await getDownloadURL(storageRef);
      console.log('Download URL:', url);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to upload image');
    }
  }
}; 