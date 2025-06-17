import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Photos {
  profileImageUrl?: string;
  bannerImageUrl?: string;
  researchBanner1Url?: string;
  researchBanner2Url?: string;
  researchBanner3Url?: string;
}

export const photosService = {
  async getPhotos(): Promise<Photos> {
    try {
      const photosRef = doc(db, 'photos', 'main');
      const photosSnap = await getDoc(photosRef);
      
      if (photosSnap.exists()) {
        return photosSnap.data() as Photos;
      }
      
      return {};
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  }
}; 