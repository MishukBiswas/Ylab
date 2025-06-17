import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ProjectModal from '../components/ProjectModal';
import { researchService } from '../services/firebase/research';
import type { ResearchProject } from '../types';
import useScrollToTop from '../hooks/useScrollToTop';
import NewtonsCradle from '../components/NewtonsCradle';

const Research = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading research projects...');
        const data = await researchService.getAll();
        console.log('Loaded research projects:', data);
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        setProjects(data);
      } catch (err) {
        console.error('Error loading research projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load research projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'analytical', name: 'Analytical Chemistry' },
    { id: 'chemical', name: 'Chemical Biology' },
    { id: 'mass', name: 'Mass Spectrometry' },
    { id: 'omics', name: 'Omics' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectClick = (project: ResearchProject) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  useScrollToTop();

  // Generate SEO description based on research projects
  const seoDescription = useMemo(() => {
    if (!projects.length) return 'Explore our cutting-edge research projects at Dr. Doe\'s Laboratory.';
    
    const categories = [...new Set(projects.map(project => project.category))];
    return `Our research spans multiple disciplines including ${categories.join(', ')}. Discover our innovative approaches to solving complex scientific challenges.`;
  }, [projects]);

  // Generate JSON-LD for SEO
  const jsonLd = useMemo(() => {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ResearchProject',
      name: 'Dr. Doe\'s Laboratory Research Projects',
      description: seoDescription,
      url: window.location.href,
      project: projects.map(project => ({
        '@type': 'ResearchProject',
        name: project.title,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate
      }))
    });
  }, [projects, seoDescription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center">
            <NewtonsCradle />
          </div>
          <p className="text-gray-600">Loading research projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="container-max section-padding">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Research Projects
              </h1>
            </div>
          </div>
        </section>
        <div className="container-max py-12">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Research Projects | Dr. Doe's Laboratory</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content="Research Projects | Dr. Doe's Laboratory" />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Research Projects | Dr. Doe's Laboratory" />
        <meta name="twitter:description" content={seoDescription} />
        <link rel="canonical" href={`${window.location.origin}/research`} />
        <script type="application/ld+json">
          {jsonLd}
        </script>
      </Helmet>

      {/* Header */}
      <section className="bg-[#003DA5] text-white">
        {/* UCR Gold line before header */}
        <div className="h-1 w-full bg-[#FFB81C]"></div>
        
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Research Projects
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Explore our cutting-edge research initiatives in computational science, 
              quantum computing, and interdisciplinary studies.
            </p>
          </div>
        </div>

        {/* UCR Gold line after header */}
        <div className="h-1 w-full bg-[#FFB81C]"></div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b">
        <div className="container-max py-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-max">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No research projects found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden card-hover cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                        Learn More <ChevronDown className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Research Timeline */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Research Timeline
            </h2>
            <p className="text-xl text-gray-600">
              A visual representation of our research journey and milestones
            </p>
          </div>

          <div className="research-timeline max-w-4xl mx-auto">
            <div className="space-y-12">
              {projects
                .filter(project => project.status === 'completed')
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 4)
                .map((project, index) => (
                  <div key={project.id} className="relative">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(project.startDate).getFullYear()} - {project.endDate === 'Ongoing' ? 'Present' : new Date(project.endDate).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Research;