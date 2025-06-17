import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Beaker, Plus, Edit2, Trash2, LogOut, Image } from 'lucide-react';
import AdminForm from '../components/AdminForm';
import { teamsService, TeamMember } from '../services/firebase/teams';
import { publicationsService, Publication } from '../services/firebase/publications';
import { researchService, ResearchProject } from '../services/firebase/research';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useImageUpload } from '../hooks/useImageUpload';
import { uploadToImgBB, savePhotos, getPhotos } from '../services/imgbb';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'number' | 'textarea' | 'select' | 'image';
  options?: string[];
  required?: boolean;
};

type TabType = 'teams' | 'publications' | 'research' | 'photos';

interface FormData {
  name?: string;
  role?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  image?: File;
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  doi?: string;
  volume?: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  team?: string[];
  funding?: string;
  status?: 'active' | 'completed' | 'upcoming';
  education?: string;
  researchInterests?: string[];
  awards?: string[];
}

interface Photos {
  profileImage?: File;
  bannerImage?: File;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  researchBanner1?: File;
  researchBanner2?: File;
  researchBanner3?: File;
  researchBanner1Url?: string;
  researchBanner2Url?: string;
  researchBanner3Url?: string;
}

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,' + btoa(`
<svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="150" height="150" fill="#E5E7EB"/>
  <circle cx="75" cy="60" r="15" fill="#94A3BB"/>
  <path d="M75 85C89.1834 85 100 74.1834 100 60C100 45.8166 89.1834 35 75 35C60.8166 35 50 45.8166 50 60C50 74.1834 60.8166 85 75 85Z" fill="#94A3BB"/>
</svg>
`);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | Publication | ResearchProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for each section
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [photos, setPhotos] = useState<Photos>({});

  const { uploadImage, isUploading } = useImageUpload();

  // Define loadData function outside useEffect
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading data for tab:', activeTab);
      switch (activeTab) {
        case 'teams':
          const teamsData = await teamsService.getAll();
          console.log('Loaded teams data:', teamsData);
          setTeams(teamsData);
          break;
        case 'publications':
          const publicationsData = await publicationsService.getAll();
          console.log('Loaded publications data:', publicationsData);
          setPublications(publicationsData);
          break;
        case 'research':
          const researchData = await researchService.getAll();
          console.log('Loaded research data:', researchData);
          setResearchProjects(researchData);
          break;
      }
    } catch (err) {
      console.error('Detailed error loading data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticating(false);
      if (!user) {
        console.log('No authenticated user, redirecting to login');
        navigate('/login');
      } else {
        console.log('User authenticated:', user.email);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load data based on active tab
  useEffect(() => {
    if (isAuthenticating) return; // Don't load data while checking authentication
    loadData();
  }, [activeTab, showToast, isAuthenticating]);

  // Add useEffect to load saved photos
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photosRef = doc(db, 'photos', 'main');
        const photosSnap = await getDoc(photosRef);
        
        if (photosSnap.exists()) {
          const savedPhotos = photosSnap.data();
          setPhotos(savedPhotos);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
        showToast('Failed to load saved photos', 'error');
      }
    };

    if (activeTab === 'photos') {
      loadPhotos();
    }
  }, [activeTab]);

  // Show loading state while authenticating
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingItem(null);
    setFormData({});
    setIsFormOpen(true);
  };

  const handleEdit = (item: TeamMember | Publication | ResearchProject) => {
    setEditingItem(item);
    setIsFormOpen(true);
    setIsAddingNew(false);

    // Create form data based on item type
    const formData: FormData = {
      ...(item as any), // Type assertion needed due to different item types
      image: undefined // Clear image field when editing
    };
    setFormData(formData);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        switch (activeTab) {
          case 'teams':
            await teamsService.delete(id);
            setTeams(teams.filter(team => team.id !== id));
            showToast('Team member deleted successfully', 'success');
            break;
          case 'publications':
            await publicationsService.delete(id);
            setPublications(publications.filter(pub => pub.id !== id));
            showToast('Publication deleted successfully', 'success');
            break;
          case 'research':
            await researchService.delete(id);
            setResearchProjects(researchProjects.filter(project => project.id !== id));
            showToast('Research project deleted successfully', 'success');
            break;
        }
      } catch (err) {
        const errorMessage = 'Failed to delete item. Please try again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        console.error('Error deleting item:', err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl || '';

      // Handle image upload if a new image is selected
      if (formData.image) {
        console.log('Uploading image...', formData.image);
        try {
          imageUrl = await uploadImage(formData.image);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (err) {
          console.error('Error uploading image:', err);
          throw new Error('Failed to upload image');
        }
      }

      if (editingItem) {
        console.log('Updating existing item:', editingItem.id);
        // Update existing item
        switch (activeTab) {
          case 'teams':
            const teamData = {
              name: formData.name || '',
              role: formData.role || '',
              bio: formData.bio || '',
              email: formData.email || '',
              linkedin: formData.linkedin || '',
              imageUrl: imageUrl,
              education: Array.isArray(formData.education) 
                ? formData.education 
                : typeof formData.education === 'string' 
                  ? formData.education.split(',').map(edu => edu.trim())
                  : []
            };
            console.log('Updating team member with data:', teamData);
            await teamsService.update(editingItem.id, teamData);
            break;
          case 'publications':
            const publicationData = {
              title: formData.title || '',
              authors: formData.authors || [],
              journal: formData.journal || '',
              volume: formData.volume || '',
              year: formData.year || 0,
              doi: formData.doi || ''
            };
            console.log('Updating publication with data:', publicationData);
            await publicationsService.update(editingItem.id, publicationData);
            break;
          case 'research':
            const researchData = {
              title: formData.title || '',
              description: formData.description || '',
              longDescription: formData.longDescription || '',
              category: formData.category || 'analytical',
              status: formData.status || 'active',
              startDate: formData.startDate || new Date().toISOString(),
              endDate: formData.endDate || 'Ongoing',
              team: Array.isArray(formData.team) ? formData.team : (formData.team ? formData.team.split(',').map(member => member.trim()) : []),
              funding: formData.funding || '',
              imageUrl: imageUrl
            };
            console.log('Updating research project with data:', researchData);
            await researchService.update(editingItem.id, researchData);
            break;
        }
        console.log('Item updated successfully');
      } else {
        console.log('Adding new item');
        // Add new item
        switch (activeTab) {
          case 'teams':
            const newTeamData = {
              name: formData.name || '',
              role: formData.role || '',
              bio: formData.bio || '',
              email: formData.email || '',
              linkedin: formData.linkedin || '',
              imageUrl: imageUrl,
              education: Array.isArray(formData.education) 
                ? formData.education 
                : typeof formData.education === 'string' 
                  ? formData.education.split(',').map(edu => edu.trim())
                  : []
            };
            console.log('Adding new team member with data:', newTeamData);
            await teamsService.add(newTeamData);
            break;
          case 'publications':
            const newPublicationData = {
              title: formData.title || '',
              authors: typeof formData.authors === 'string' 
                ? formData.authors.split(',').map(author => author.trim()).filter(author => author !== '')
                : Array.isArray(formData.authors)
                  ? formData.authors.filter((author): author is string => typeof author === 'string')
                  : [],
              journal: formData.journal || '',
              volume: formData.volume || '',
              year: formData.year ? parseInt(formData.year.toString(), 10) : 0,
              doi: formData.doi || ''
            };
            console.log('Adding new publication with data:', newPublicationData);
            await publicationsService.add(newPublicationData);
            break;
          case 'research':
            const newResearchData = {
              title: formData.title || '',
              description: formData.description || '',
              longDescription: formData.longDescription || '',
              category: formData.category || 'analytical',
              status: formData.status || 'active',
              startDate: formData.startDate || new Date().toISOString(),
              endDate: formData.endDate || 'Ongoing',
              team: Array.isArray(formData.team) ? formData.team : (formData.team ? formData.team.split(',').map(member => member.trim()) : []),
              funding: formData.funding || '',
              imageUrl: imageUrl
            };
            console.log('Adding new research project with data:', newResearchData);
            await researchService.add(newResearchData);
            break;
        }
        console.log('Item added successfully');
      }

      // Refresh data
      console.log('Refreshing data...');
      await loadData();
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({});
      showToast(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'added'} successfully`, 'success');
    } catch (err) {
      console.error('Error saving data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getFormFields = (): FormField[] => {
    switch (activeTab) {
      case 'teams':
        return [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'role', label: 'Role', type: 'select', options: ['Principal Investigator', 'Senior Research Scientist', 'Postdoctoral Researcher', 'PhD Student', 'Research Assistant', 'Former Postdoc', 'Former PhD Student', 'Former Research Assistant'], required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'image', label: 'Profile Image', type: 'image' },
          { name: 'bio', label: 'Bio', type: 'textarea', required: true },
          { name: 'education', label: 'Education (comma separated)', type: 'text', required: true },
        ];
      case 'publications':
        return [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'authors', label: 'Authors', type: 'text', required: true },
          { name: 'journal', label: 'Journal', type: 'text', required: true },
          { name: 'year', label: 'Year', type: 'number', required: true },
          { name: 'doi', label: 'DOI', type: 'text', required: true },
          { name: 'abstract', label: 'Abstract', type: 'textarea', required: true },
        ];
      case 'research':
        return [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Short Description', type: 'textarea', required: true },
          { name: 'longDescription', label: 'Long Description', type: 'textarea', required: true },
          { name: 'category', label: 'Category', type: 'select', options: ['analytical', 'chemical', 'mass', 'omics'], required: true },
          { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'upcoming'], required: true },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
          { name: 'endDate', label: 'End Date', type: 'date', required: true },
          { name: 'team', label: 'Team Members (comma-separated)', type: 'text', required: true },
          { name: 'funding', label: 'Funding', type: 'text', required: true },
          { name: 'image', label: 'Project Image', type: 'image', required: true }
        ];
      default:
        return [];
    }
  };

  const getInitialData = () => {
    if (!editingItem) return {};
    
    switch (activeTab) {
      case 'teams':
        return teams.find(team => team.id === editingItem.id) || {};
      case 'publications':
        return publications.find(pub => pub.id === editingItem.id) || {};
      case 'research':
        return researchProjects.find(project => project.id === editingItem.id) || {};
      default:
        return {};
    }
  };

  const renderTeamsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <img
                src={member.imageUrl || DEFAULT_AVATAR}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_AVATAR;
                }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.email}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(member)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPublicationsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Publications</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Publication
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {publications.map((pub) => (
              <tr key={pub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pub.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pub.journal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pub.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pub)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pub.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderResearchSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Research Projects</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {researchProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-48 w-full md:w-48 object-cover"
                  src={project.imageUrl}
                  alt={project.title}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.startDate} - {project.endDate}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{project.description}</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhotosSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          {/* PI Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PI Profile Photo</label>
            <div className="flex items-center space-x-4">
              {photos.profileImageUrl && (
                <div className="relative">
                  <img 
                    src={photos.profileImageUrl} 
                    alt="PI Profile" 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos({ ...photos, profileImageUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex-grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotos({ 
                          ...photos, 
                          profileImage: file, 
                          profileImageUrl: reader.result as string 
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">Upload PI profile photo (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* PI Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PI Banner Photo</label>
            <div className="flex items-center space-x-4">
              {photos.bannerImageUrl && (
                <div className="relative">
                  <img 
                    src={photos.bannerImageUrl} 
                    alt="PI Banner" 
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos({ ...photos, bannerImageUrl: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex-grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotos({ 
                          ...photos, 
                          bannerImage: file, 
                          bannerImageUrl: reader.result as string 
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">Upload PI banner photo (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Research Banners Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Research Banners</h3>
            <div className="space-y-6">
              {/* Research Banner 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Research Banner 1</label>
                <div className="flex items-center space-x-4">
                  {photos.researchBanner1Url && (
                    <div className="relative">
                      <img 
                        src={photos.researchBanner1Url} 
                        alt="Research Banner 1" 
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos({ ...photos, researchBanner1Url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotos({ 
                              ...photos, 
                              researchBanner1: file, 
                              researchBanner1Url: reader.result as string 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload research banner 1 (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Research Banner 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Research Banner 2</label>
                <div className="flex items-center space-x-4">
                  {photos.researchBanner2Url && (
                    <div className="relative">
                      <img 
                        src={photos.researchBanner2Url} 
                        alt="Research Banner 2" 
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos({ ...photos, researchBanner2Url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotos({ 
                              ...photos, 
                              researchBanner2: file, 
                              researchBanner2Url: reader.result as string 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload research banner 2 (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Research Banner 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Research Banner 3</label>
                <div className="flex items-center space-x-4">
                  {photos.researchBanner3Url && (
                    <div className="relative">
                      <img 
                        src={photos.researchBanner3Url} 
                        alt="Research Banner 3" 
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos({ ...photos, researchBanner3Url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotos({ 
                              ...photos, 
                              researchBanner3: file, 
                              researchBanner3Url: reader.result as string 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload research banner 3 (max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  let profileImageUrl = photos.profileImageUrl || '';
                  let bannerImageUrl = photos.bannerImageUrl || '';
                  let researchBanner1Url = photos.researchBanner1Url || '';
                  let researchBanner2Url = photos.researchBanner2Url || '';
                  let researchBanner3Url = photos.researchBanner3Url || '';

                  if (photos.profileImage) {
                    profileImageUrl = await uploadImage(photos.profileImage);
                  }
                  if (photos.bannerImage) {
                    bannerImageUrl = await uploadImage(photos.bannerImage);
                  }
                  if (photos.researchBanner1) {
                    researchBanner1Url = await uploadImage(photos.researchBanner1);
                  }
                  if (photos.researchBanner2) {
                    researchBanner2Url = await uploadImage(photos.researchBanner2);
                  }
                  if (photos.researchBanner3) {
                    researchBanner3Url = await uploadImage(photos.researchBanner3);
                  }

                  // Save to Firestore
                  const photosRef = doc(db, 'photos', 'main');
                  await setDoc(photosRef, {
                    profileImageUrl,
                    bannerImageUrl,
                    researchBanner1Url,
                    researchBanner2Url,
                    researchBanner3Url
                  });

                  setPhotos({
                    profileImageUrl,
                    bannerImageUrl,
                    researchBanner1Url,
                    researchBanner2Url,
                    researchBanner3Url
                  });
                  showToast('Photos uploaded and saved successfully', 'success');
                } catch (error) {
                  console.error('Error uploading photos:', error);
                  showToast('Failed to upload photos', 'error');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : 'Save All Photos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    if (!isFormOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
          <h2 className="text-2xl font-bold mb-4 sticky top-0 bg-white pb-2">
            {editingItem ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {activeTab === 'teams' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    {formData.imageUrl && (
                      <div className="relative">
                        <img 
                          src={formData.imageUrl} 
                          alt="Profile preview" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('Deleting image for team member:', formData.id);
                              console.log('Image URL:', formData.imageUrl);

                              const response = await fetch('/api/delete-image', {
                                method: 'DELETE',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                  imageUrl: formData.imageUrl,
                                  teamId: formData.id,
                                  type: 'teams'
                                })
                              });

                              console.log('Delete response status:', response.status);
                              const responseData = await response.json();
                              console.log('Delete response data:', responseData);

                              if (!response.ok) {
                                throw new Error(responseData.error || 'Failed to delete image');
                              }

                              setFormData({ ...formData, imageUrl: '' });
                              showToast('Image deleted successfully', 'success');
                            } catch (error) {
                              console.error('Error deleting image:', error);
                              showToast(error.message || 'Failed to delete image', 'error');
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-grow">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: file, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-sm text-gray-500">Upload a profile image (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Education (comma separated)</label>
                  <input
                    type="text"
                    name="education"
                    value={Array.isArray(formData.education) 
                      ? formData.education.join(', ') 
                      : formData.education || ''}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g., Ph.D. in Chemistry, University of California (2020), M.S. in Chemistry, Stanford University (2018)"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter each degree on a new line or separated by commas</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Awards (comma separated)</label>
                  <input
                    type="text"
                    name="awards"
                    value={Array.isArray(formData.awards) 
                      ? formData.awards.join(', ') 
                      : formData.awards || ''}
                    onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                    placeholder="e.g., Best Paper Award 2020, Outstanding Researcher 2019"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {activeTab === 'publications' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Authors</label>
                  <input
                    type="text"
                    name="authors"
                    value={typeof formData.authors === 'string' 
                      ? formData.authors 
                      : Array.isArray(formData.authors) 
                        ? formData.authors.join(', ') 
                        : ''}
                    onChange={(e) => {
                      // Store the raw input value as a string
                      setFormData({ 
                        ...formData, 
                        authors: e.target.value
                      });
                    }}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter authors separated by commas (e.g., John Doe, Jane Smith)"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Journal</label>
                  <input
                    type="text"
                    name="journal"
                    value={formData.journal || ''}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Volume</label>
                  <input
                    type="text"
                    name="volume"
                    value={formData.volume || ''}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">DOI</label>
                  <input
                    type="text"
                    name="doi"
                    value={formData.doi || ''}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {activeTab === 'research' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Project Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    {formData.imageUrl && (
                      <div className="relative">
                        <img 
                          src={formData.imageUrl} 
                          alt="Project preview" 
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              console.log('Deleting image for project:', formData.id);
                              console.log('Image URL:', formData.imageUrl);

                              const response = await fetch('/api/delete-image', {
                                method: 'DELETE',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                  imageUrl: formData.imageUrl,
                                  teamId: formData.id,
                                  type: 'research'
                                })
                              });

                              console.log('Delete response status:', response.status);
                              const responseData = await response.json();
                              console.log('Delete response data:', responseData);

                              if (!response.ok) {
                                throw new Error(responseData.error || 'Failed to delete image');
                              }

                              setFormData({ ...formData, imageUrl: '' });
                              showToast('Image deleted successfully', 'success');
                            } catch (error) {
                              console.error('Error deleting image:', error);
                              showToast(error.message || 'Failed to delete image', 'error');
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-grow">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: file, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-sm text-gray-500">Upload a project image (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Long Description</label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription || ''}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={5}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category || 'analytical'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="analytical">Analytical Chemistry</option>
                    <option value="chemical">Chemical Biology</option>
                    <option value="mass">Mass Spectrometry</option>
                    <option value="omics">Omics</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate === 'Ongoing' ? '' : formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value || 'Ongoing' })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty for "Ongoing" status</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Team Members (comma-separated)</label>
                  <input
                    type="text"
                    name="team"
                    value={Array.isArray(formData.team) ? formData.team.join(', ') : formData.team || ''}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="John Doe, Jane Smith, etc."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Funding</label>
                  <input
                    type="text"
                    name="funding"
                    value={formData.funding || ''}
                    onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div className="sticky bottom-0 bg-white pt-4 border-t mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 text-center p-4">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'teams':
        return renderTeamsSection();
      case 'publications':
        return renderPublicationsSection();
      case 'research':
        return renderResearchSection();
      case 'photos':
        return renderPhotosSection();
      default:
        return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      showToast('Signed out successfully', 'success');
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Error signing out', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max py-8 px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              signOut(auth);
              navigate('/login');
            }}
            className="flex items-center px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Teams</span>
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'publications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Publications</span>
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'research'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Beaker className="w-5 h-5" />
              <span>Research Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'photos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Image className="w-5 h-5" />
              <span>Photos</span>
            </button>
          </nav>
        </div>

        {renderContent()}
        {renderForm()}
      </div>
    </div>
  );
};

export default AdminDashboard; 