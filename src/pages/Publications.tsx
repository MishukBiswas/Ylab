import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { publicationsService } from '../services/firebase/publications';
import type { Publication } from '../types';
import useScrollToTop from '../hooks/useScrollToTop';
import NewtonsCradle from '../components/NewtonsCradle';

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollToTop();

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const data = await publicationsService.getAll();
        setPublications(data);
        setFilteredPublications(data);
        setError(null);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  useEffect(() => {
    let filtered = publications;

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(pub => pub.year.toString() === selectedYear);
    }

    setFilteredPublications(filtered);
  }, [publications, selectedYear]);

  const years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center">
            <NewtonsCradle />
          </div>
          <p className="text-gray-600">Loading publications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Publications
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore our comprehensive collection of peer-reviewed publications, conference papers, 
              and research contributions spanning multiple scientific domains.
            </p>
          </div>
        </div>
      </section>

      {/* Selected Publications Heading */}
      <section className="bg-white border-b">
        <div className="container-max py-6">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center">Selected Publications</h2>
              </div>
      </section>

            {/* Filters */}
      <section className="bg-white">
        <div className="container-max py-0.1">
          <div className="flex justify-end pr-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
          </div>
        </div>
      </section>

      {/* Publications List */}
      <section className="bg-white">
        <div className="container-max py-6">
          <div className="space-y-6">
            {filteredPublications.map((publication, index) => (
              <motion.article
                key={publication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5 border border-[#CCD8ED]/30"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
                      {publication.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {Array.isArray(publication.authors) 
                          ? publication.authors.join(', ')
                          : typeof publication.authors === 'string'
                            ? publication.authors
                            : ''}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {publication.year}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <strong>{publication.journal}</strong>, Vol. {publication.volume} ({publication.year})
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>DOI: {publication.doi}</span>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-8 flex-shrink-0 flex justify-center">
                      <a
                        href={`https://doi.org/${publication.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-2 bg-[#FFD477] text-[#003DA5] rounded-lg hover:bg-[#FFD100]/90 transition-colors font-medium"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                      Read More
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPublications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No publications found for the selected year.</p>
              <button
                onClick={() => setSelectedYear('all')}
                className="mt-4 btn-primary"
              >
                Show All Years
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Publication Stats */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Publication Impact
            </h2>
            <p className="text-xl text-gray-600">
              Our research contributions and their impact on the scientific community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                50+
              </div>
              <div className="text-gray-600">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                10+
              </div>
              <div className="text-gray-600">Years of Research</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Publications;