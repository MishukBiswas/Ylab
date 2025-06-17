import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Linkedin, Twitter, GraduationCap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { teamsService } from '../services/firebase/teams';
import type { TeamMember } from '../types';
import useScrollToTop from '../hooks/useScrollToTop';
import NewtonsCradle from '../components/NewtonsCradle';

const Team = () => {
  const [currentMembers, setCurrentMembers] = useState<TeamMember[]>([]);
  const [alumni, setAlumni] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching team members...');
        const members = await teamsService.getAll();
        console.log('Fetched members:', members);
        
        if (!Array.isArray(members)) {
          throw new Error('Invalid data format received');
        }
        
        // Separate current members and alumni based on role
        const current = members.filter(member => !member.role.toLowerCase().includes('former'));
        const former = members.filter(member => member.role.toLowerCase().includes('former'));
        
        // Sort current members by role and then by name
        current.sort((a, b) => {
          // First sort by role priority
          const roleOrder = {
            'Principal Investigator': 1,
            'Senior Research Scientist': 2,
            'Research Scientist': 3,
            'Postdoctoral Researcher': 4,
            'PhD Student': 5,
            'Master Student': 6,
            'Undergraduate Student': 7
          };
          
          const aRole = a.role.toLowerCase();
          const bRole = b.role.toLowerCase();
          
          // Find the base role for comparison
          const aBaseRole = Object.keys(roleOrder).find(role => 
            aRole.includes(role.toLowerCase())
          ) || 'other';
          
          const bBaseRole = Object.keys(roleOrder).find(role => 
            bRole.includes(role.toLowerCase())
          ) || 'other';
          
          const aPriority = roleOrder[aBaseRole] || 999;
          const bPriority = roleOrder[bBaseRole] || 999;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // If roles are the same, sort by name
          return a.name.localeCompare(b.name);
        });
        
        console.log('Sorted current members:', current);
        console.log('Former members:', former);
        
        setCurrentMembers(current);
        setAlumni(former);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team members. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Group members by role
  const groupedMembers = useMemo(() => {
    const groups: { [key: string]: TeamMember[] } = {};
    
    currentMembers.forEach(member => {
      const role = member.role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(member);
    });
    
    console.log('Grouped members:', groups);
    return groups;
  }, [currentMembers]);

  // Generate SEO description based on team members
  const seoDescription = useMemo(() => {
    if (!currentMembers.length) return 'Meet our research team at Dr. Doe\'s Laboratory.';
    
    const roles = [...new Set(currentMembers.map(member => member.role))];
    return `Our diverse research team includes ${roles.join(', ')}. Join us in advancing scientific discovery through innovative research and collaboration.`;
  }, [currentMembers]);

  // Generate JSON-LD structured data
  const jsonLd = useMemo(() => {
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Dr. Doe's Laboratory",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.png`,
      "sameAs": [
        "https://twitter.com/drdoelab",
        "https://linkedin.com/company/drdoelab"
      ]
    };

    const teamMembers = currentMembers.map(member => ({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": member.name,
      "jobTitle": member.role,
      "image": member.imageUrl,
      "url": `${window.location.origin}/team#${member.id}`,
      "sameAs": member.linkedin ? [member.linkedin] : [],
      "alumniOf": member.education?.map(edu => ({
        "@type": "CollegeOrUniversity",
        "name": edu
      }))
    }));

    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [organization, ...teamMembers]
    });
  }, [currentMembers]);

  useScrollToTop();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Team Members</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center">
            <NewtonsCradle />
          </div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (!currentMembers.length && !alumni.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="container-max section-padding">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Our Research Team
              </h1>
            </div>
          </div>
        </section>
        <div className="container-max py-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg">No team members available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Our Team | Dr. Doe's Laboratory</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content="Our Team | Dr. Doe's Laboratory" />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Our Team | Dr. Doe's Laboratory" />
        <meta name="twitter:description" content={seoDescription} />
        <link rel="canonical" href={`${window.location.origin}/team`} />
        <script type="application/ld+json">
          {jsonLd}
        </script>
      </Helmet>

      {/* Header */}
      <section className="bg-white border-b">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Our Research Team
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Meet the brilliant minds driving innovation in computational science, 
              quantum computing, and interdisciplinary research.
            </p>
          </div>
        </div>
      </section>

      {/* Current Team Members */}
      <section className="section-padding">
        <div className="container-max">
          {Object.entries(groupedMembers).map(([role, members], index) => (
            <div key={role} className="mb-16">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-8 text-center">
                {role}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (index * 0.1) + (index * 0.1) }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
                  >
                    <div className="relative w-full" style={{ paddingTop: '100%' }}>
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 text-sm font-medium mb-2">
                        {member.role.toLowerCase().includes('phd') ? 'PhD Student' : member.role}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <a 
                            href={`mailto:${member.email}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                          {member.linkedin && (
                            <a 
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {member.twitter && (
                            <a 
                              href={member.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {member.role.toLowerCase().includes('principal investigator') ? (
                          <a
                            href="/about"
                            className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                          >
                            View Profile
                          </a>
                        ) : (
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                        >
                          View Profile
                        </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alumni Section */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Alumni
            </h2>
            <p className="text-xl text-gray-600">
              Celebrating the achievements of our former team members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((alum, index) => (
              <motion.div
                key={alum.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 card-hover"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={alum.imageUrl} 
                    alt={alum.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{alum.name}</h3>
                    <p className="text-sm text-gray-600">{alum.role}</p>
                  </div>
                </div>
                {alum.currentPosition && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-600">Current Position:</p>
                  <p className="text-sm text-gray-800">{alum.currentPosition}</p>
                </div>
                )}
                {alum.achievements && (
                <p className="text-sm text-gray-600">{alum.achievements}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="bg-blue-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Team Statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {currentMembers.length}
              </div>
              <div className="text-gray-600">Current Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {alumni.length}
              </div>
              <div className="text-gray-600">Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                15
              </div>
              <div className="text-gray-600">Years Active</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                12
              </div>
              <div className="text-gray-600">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6 sticky top-0 bg-white pb-4">
                <div className="flex items-center">
                  <img 
                    src={selectedMember.imageUrl} 
                    alt={selectedMember.name}
                    className="w-20 h-20 rounded-full object-cover mr-6"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2>
                    <p className="text-blue-600 font-medium">{selectedMember.role}</p>
                    <a 
                      href={`mailto:${selectedMember.email}`}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      {selectedMember.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Biography</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedMember.bio}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h3>
                  {selectedMember.education && selectedMember.education.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedMember.education.map((edu, index) => (
                        <li key={index} className="text-gray-600">• {edu}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No education information available</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Interests</h3>
                  {selectedMember.researchInterests && selectedMember.researchInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.researchInterests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No research interests listed</p>
                  )}
                </div>

                {selectedMember.awards && selectedMember.awards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Awards & Recognition
                    </h3>
                    <ul className="space-y-2">
                      {selectedMember.awards.map((award, index) => (
                        <li key={index} className="text-gray-600">• {award}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <a 
                    href={`mailto:${selectedMember.email}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                  {selectedMember.linkedin && (
                    <a 
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;