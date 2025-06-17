import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import type { TeamMember } from '../../types';

const COLLECTION_NAME = 'teams';

export const teamsService = {
  // Get all team members
  async getAll(): Promise<TeamMember[]> {
    try {
      console.log('Fetching teams from Firestore...');
      const teamsRef = collection(db, COLLECTION_NAME);
      const q = query(teamsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No teams found in Firestore');
        return [];
      }

      const teams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw team data:', data);
        
        // Ensure all required fields are present with defaults
        const teamMember: TeamMember = {
          id: doc.id,
          name: data.name || '',
          role: data.role || '',
          bio: data.bio || '',
          imageUrl: data.imageUrl || '',
          email: data.email || '',
          linkedin: data.linkedin || '',
          education: Array.isArray(data.education) ? data.education : 
                    typeof data.education === 'string' ? [data.education] : [],
          researchInterests: Array.isArray(data.researchInterests) ? data.researchInterests : 
                           typeof data.researchInterests === 'string' ? [data.researchInterests] : [],
          awards: Array.isArray(data.awards) ? data.awards : 
                 typeof data.awards === 'string' ? [data.awards] : [],
          currentPosition: data.currentPosition || '',
          achievements: data.achievements || '',
          roleOrder: typeof data.roleOrder === 'number' ? data.roleOrder : 999
        };
        
        console.log('Processed team member:', teamMember);
        return teamMember;
      });
      
      // Sort the results in memory instead
      teams.sort((a, b) => {
        if (a.roleOrder !== b.roleOrder) {
          return (a.roleOrder || 999) - (b.roleOrder || 999);
        }
        return a.name.localeCompare(b.name);
      });
      
      console.log('Successfully fetched teams:', teams);
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to fetch team members');
    }
  },

  // Add a new team member
  async add(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    try {
      console.log('Adding new team member with data:', data);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        roleOrder: data.roleOrder || 999
      });
      console.log('Document added with ID:', docRef.id);
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Error adding team member:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to add team member');
    }
  },

  // Update a team member
  async update(id: string, data: Partial<TeamMember>): Promise<void> {
    try {
      console.log('Updating team member:', id);
      console.log('Update data:', data);
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        roleOrder: data.roleOrder || 999
      });
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to update team member');
    }
  },

  // Delete a team member
  async delete(id: string): Promise<void> {
    try {
      console.log('Deleting team member:', id);
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting team member:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('Failed to delete team member');
    }
  },

  // Upload team member image
  async uploadImage(file: File): Promise<string> {
    try {
      console.log('Uploading image:', file.name);
      const storageRef = ref(storage, `teams/${Date.now()}_${file.name}`);
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