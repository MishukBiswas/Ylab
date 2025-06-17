import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, FileText, Code, Database, BookOpen, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockResources = [
      {
        id: 1,
        title: "Quantum Molecular Dynamics Simulator",
        description: "A comprehensive software package for quantum-enhanced molecular dynamics simulations. Includes GPU acceleration and parallel computing support.",
        category: "software",
        type: "Software Tool",
        downloadUrl: "#",
        size: "125 MB",
        version: "v2.1.0",
        lastUpdated: "2024-01-15",
        downloads: 1250,
        documentation: "#",
        sourceCode: "https://github.com/droelab/qmd-simulator"
      },
      {
        id: 2,
        title: "Climate Data Analysis Protocol",
        description: "Step-by-step protocol for analyzing large-scale climate datasets using machine learning approaches. Includes data preprocessing, feature extraction, and model validation procedures.",
        category: "protocols",
        type: "Research Protocol",
        downloadUrl: "#",
        size: "2.5 MB",
        version: "v1.3",
        lastUpdated: "2024-01-10",
        downloads: 890,
        documentation: "#"
      },
      {
        id: 3,
        title: "Genomic Variants Dataset",
        description: "Curated dataset of genomic variants from 10,000 samples with associated phenotypic data. Includes quality control metrics and annotation files.",
        category: "datasets",
        type: "Dataset",
        downloadUrl: "#",
        size: "15.2 GB",
        version: "v3.0",
        lastUpdated: "2023-12-20",
        downloads: 456,
        documentation: "#",
        license: "CC BY-SA 4.0"
      },
      {
        id: 4,
        title: "Quantum Algorithm Implementation Guide",
        description: "Comprehensive guide to implementing quantum algorithms for molecular simulations. Includes code examples, best practices, and performance optimization tips.",
        category: "documentation",
        type: "Documentation",
        downloadUrl: "#",
        size: "8.7 MB",
        version: "v2.0",
        lastUpdated: "2024-01-05",
        downloads: 2100,
        pages: 145
      },
      {
        id: 5,
        title: "Protein Folding Prediction Models",
        description: "Pre-trained machine learning models for protein folding prediction with 95% accuracy on benchmark datasets. Includes model weights and inference code.",
        category: "software",
        type: "ML Models",
        downloadUrl: "#",
        size: "340 MB",
        version: "v1.5",
        lastUpdated: "2023-12-15",
        downloads: 780,
        documentation: "#",
        sourceCode: "https://github.com/droelab/protein-folding"
      },
      {
        id: 6,
        title: "High-Performance Computing Setup Guide",
        description: "Detailed instructions for setting up HPC environments for computational biology research. Covers cluster configuration, job scheduling, and performance monitoring.",
        category: "protocols",
        type: "Setup Guide",
        downloadUrl: "#",
        size: "3.2 MB",
        version: "v1.0",
        lastUpdated: "2023-11-30",
        downloads: 1100,
        documentation: "#"
      },
      {
        id: 7,
        title: "Climate Simulation Results Database",
        description: "Comprehensive database of climate simulation results covering various scenarios and time periods. Includes metadata and visualization tools.",
        category: "datasets",
        type: "Database",
        downloadUrl: "#",
        size: "45.8 GB",
        version: "v2.2",
        lastUpdated: "2024-01-01",
        downloads: 234,
        documentation: "#",
        accessMethod: "API"
      },
      {
        id: 8,
        title: "Laboratory Safety Protocols",
        description: "Complete set of safety protocols for computational biology laboratories, including equipment handling, data security, and emergency procedures.",
        category: "protocols",
        type: "Safety Manual",
        downloadUrl: "#",
        size: "1.8 MB",
        version: "v4.1",
        lastUpdated: "2024-01-20",
        downloads: 567,
        pages: 78
      }
    ];

    setResources(mockResources);
    setFilteredResources(mockResources);
  }, []);

  useEffect(() => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  }, [resources, selectedCategory, searchTerm]);

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'software', name: 'Software Tools', icon: Code },
    { id: 'datasets', name: 'Datasets', icon: Database },
    { id: 'protocols', name: 'Protocols & Guides', icon: FileText },
    { id: 'documentation', name: 'Documentation', icon: BookOpen }
  ];

  const getIcon = (category) => {
    switch (category) {
      case 'software':
        return <Code className="h-6 w-6" />;
      case 'datasets':
        return <Database className="h-6 w-6" />;
      case 'protocols':
        return <FileText className="h-6 w-6" />;
      case 'documentation':
        return <BookOpen className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'software':
        return 'bg-blue-100 text-blue-800';
      case 'datasets':
        return 'bg-green-100 text-green-800';
      case 'protocols':
        return 'bg-purple-100 text-purple-800';
      case 'documentation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Research Resources
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Access our comprehensive collection of software tools, datasets, research protocols, 
              and documentation to support your scientific endeavors.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-white border-b">
        <div className="container-max py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filtered results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        {getIcon(resource.category)}
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                          {resource.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{resource.downloads} downloads</div>
                      <div>{resource.size}</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-medium">{resource.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    {resource.license && (
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span className="font-medium">{resource.license}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <a
                      href={resource.downloadUrl}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                    
                    <div className="flex space-x-2">
                      {resource.documentation && (
                        <a
                          href={resource.documentation}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Docs
                        </a>
                      )}
                      {resource.sourceCode && (
                        <a
                          href={resource.sourceCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No resources found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
              Usage Guidelines
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Use</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Free for academic and research purposes</li>
                  <li>• Please cite our work when using our resources</li>
                  <li>• Share improvements with the community</li>
                  <li>• Report bugs and issues on our GitHub</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Commercial Use</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Contact us for commercial licensing</li>
                  <li>• Custom development available</li>
                  <li>• Training and support services offered</li>
                  <li>• Collaboration opportunities welcome</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Contributions</h3>
              <p className="text-gray-600 mb-4">
                We welcome contributions from the research community. If you've developed improvements, 
                found bugs, or have suggestions for new resources, please get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:support@droelab.edu" className="btn-primary">
                  Contact Support
                </a>
                <a 
                  href="https://github.com/droelab" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Statistics */}
      <section className="bg-gray-100 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Resource Impact
            </h2>
            <p className="text-xl text-gray-600">
              Our resources are used by researchers worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {resources.reduce((sum, resource) => sum + resource.downloads, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {resources.length}
              </div>
              <div className="text-gray-600">Available Resources</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                50+
              </div>
              <div className="text-gray-600">Countries Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Research Groups</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;