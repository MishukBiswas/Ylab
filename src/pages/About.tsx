import React, { useState, useEffect, useMemo } from 'react';
import { Download, Award, BookOpen, Users, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import useScrollToTop from '../hooks/useScrollToTop';
import { photosService } from '../services/firebase/photos';
import NewtonsCradle from '../components/NewtonsCradle';

const About = () => {
  const [piBanner, setPiBanner] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await photosService.getPhotos();
        if (photos.bannerImageUrl) {
          setPiBanner(photos.bannerImageUrl);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading photos:', error);
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  useScrollToTop();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center">
            <NewtonsCradle />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const achievements = [
    {
      year: "2023",
      title: "IEEE Outstanding Researcher Award",
      description: "Recognized for groundbreaking contributions to quantum computing applications in molecular biology."
    },
    {
      year: "2022",
      title: "University Excellence in Research Award",
      description: "Awarded for exceptional research leadership and innovation in computational science."
    },
    {
      year: "2020",
      title: "Nature 40 Under 40 List",
      description: "Featured among the top 40 young scientists making significant impact in their fields."
    },
    {
      year: "2015",
      title: "NSF CAREER Award",
      description: "Received prestigious early-career award for innovative research in quantum algorithms."
    }
  ];

  const researchInterests = [
    "Quantum Computing & Algorithms",
    "Molecular Dynamics Simulations",
    "Climate Change Modeling",
    "Machine Learning Applications",
    "High-Performance Computing",
    "Biomedical Data Analysis"
  ];

  const education = [
    {
      degree: "Ph.D. in Physics",
      institution: "Massachusetts Institute of Technology (MIT)",
      year: "2008",
      thesis: "Quantum Algorithms for Complex Systems Simulation"
    },
    {
      degree: "M.S. in Computer Science",
      institution: "Stanford University",
      year: "2004",
      focus: "Computational Methods and Algorithms"
    },
    {
      degree: "B.S. in Mathematics",
      institution: "Harvard University",
      year: "2002",
      honors: "Summa Cum Laude, Phi Beta Kappa"
    }
  ];

  const experience = [
    {
      position: "Professor & Lab Director",
      institution: "University Research Institute",
      period: "2018 - Present",
      description: "Leading interdisciplinary research in computational science and quantum computing applications."
    },
    {
      position: "Associate Professor",
      institution: "University Research Institute",
      period: "2013 - 2018",
      description: "Developed novel quantum algorithms and established collaborative research programs."
    },
    {
      position: "Assistant Professor",
      institution: "University Research Institute",
      period: "2008 - 2013",
      description: "Initiated research program in quantum computing for molecular simulations."
    },
    {
      position: "Postdoctoral Fellow",
      institution: "California Institute of Technology",
      period: "2008 - 2010",
      description: "Research in quantum information theory and computational physics."
    }
  ];

  // Generate SEO description based on content
  const seoDescription = useMemo(() => {
    const interests = researchInterests.join(', ');
    const recentAwards = achievements.slice(0, 2).map(a => a.title).join(', ');
    
    return `Dr. Jane Doe is a Professor & Laboratory Director specializing in ${interests}. Recent achievements include ${recentAwards}. Leading research in computational science and quantum computing applications.`;
  }, [researchInterests, achievements]);

  // Generate JSON-LD structured data
  const jsonLd = useMemo(() => {
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Dr. Jane Doe",
      "jobTitle": "Professor & Laboratory Director",
      "image": piBanner,
      "url": `${window.location.origin}/about`,
      "sameAs": [
        "https://scholar.google.com",
        "https://linkedin.com/in/janedoe"
      ],
      "alumniOf": education.map(edu => ({
        "@type": "CollegeOrUniversity",
        "name": edu.institution
      })),
      "award": achievements.map(award => ({
        "@type": "Award",
        "name": award.title,
        "dateReceived": award.year
      })),
      "knowsAbout": researchInterests,
      "worksFor": {
        "@type": "Organization",
        "name": "University Research Institute"
      }
    };

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

    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [person, organization]
    });
  }, [piBanner, education, achievements, researchInterests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>About Dr. Jane Doe - Professor & Laboratory Director</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content="About Dr. Jane Doe - Professor & Laboratory Director" />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={piBanner} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Dr. Jane Doe - Professor & Laboratory Director" />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={piBanner} />
        <link rel="canonical" href={`${window.location.origin}/about`} />
        <script type="application/ld+json">
          {jsonLd}
        </script>
      </Helmet>

      {/* Header */}
      <section className="bg-white border-b">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Dr. Jane Doe
              </h1>
              <p className="text-xl text-blue-600 font-medium mb-4">
                Professor & Laboratory Director
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Leading researcher in computational science, quantum computing, and interdisciplinary 
                applications. Over 15 years of experience advancing the frontiers of scientific discovery 
                through innovative computational approaches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">
                  <Download className="mr-2 h-5 w-5" />
                  Download CV
                </button>
                <a 
                  href="mailto:jane.doe@university.edu" 
                  className="btn-secondary"
                >
                  Contact Dr. Doe
                </a>
              </div>
            </motion.div>
            
            {piBanner && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={piBanner}
                    alt="Dr. Jane Doe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-sm">Publications</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-16">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, label: "Publications", value: "150+" },
              { icon: Award, label: "Awards", value: "25+" },
              { icon: Users, label: "Students Mentored", value: "50+" },
              { icon: Calendar, label: "Years of Research", value: "15+" }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
                Biography
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-6">
                <p>
                  Dr. Jane Doe is a distinguished Professor and Laboratory Director at the University Research Institute, 
                  where she leads groundbreaking research in computational science and quantum computing applications. 
                  With over 15 years of experience in the field, she has established herself as a pioneer in developing 
                  quantum algorithms for complex molecular simulations and climate modeling.
                </p>
                <p>
                  Her research spans multiple disciplines, from quantum computing and machine learning to biomedical 
                  data analysis and environmental science. Dr. Doe's work has been instrumental in advancing our 
                  understanding of how quantum computing can be applied to solve some of the most challenging problems 
                  in science and medicine.
                </p>
                <p>
                  Throughout her career, Dr. Doe has published over 150 peer-reviewed papers in prestigious journals 
                  including Nature, Science, and Physical Review Letters. Her research has been cited over 8,000 times, 
                  reflecting the significant impact of her contributions to the scientific community.
                </p>
                <p>
                  Beyond her research achievements, Dr. Doe is passionate about mentoring the next generation of 
                  scientists. She has supervised over 50 students and postdoctoral researchers, many of whom have 
                  gone on to establish successful careers in academia and industry. Her commitment to education and 
                  mentorship has been recognized with numerous teaching awards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Research Interests */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
              Research Interests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchInterests.map((interest, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center p-4 bg-blue-50 rounded-lg"
                >
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-gray-800 font-medium">{interest}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
              Education
            </h2>
            <div className="space-y-8">
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-lg card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{edu.degree}</h3>
                      <p className="text-blue-600 font-medium mb-2">{edu.institution}</p>
                      {edu.thesis && (
                        <p className="text-gray-600 mb-2">
                          <strong>Thesis:</strong> {edu.thesis}
                        </p>
                      )}
                      {edu.focus && (
                        <p className="text-gray-600 mb-2">
                          <strong>Focus:</strong> {edu.focus}
                        </p>
                      )}
                      {edu.honors && (
                        <p className="text-gray-600">
                          <strong>Honors:</strong> {edu.honors}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {edu.year}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Experience */}
      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
              Professional Experience
            </h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 p-8 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{exp.position}</h3>
                      <p className="text-blue-600 font-medium">{exp.institution}</p>
                    </div>
                    <span className="text-gray-500 font-medium">{exp.period}</span>
                  </div>
                  <p className="text-gray-600">{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
              Awards & Recognition
            </h2>
            <div className="space-y-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                      <span className="text-sm font-medium text-gray-500">{achievement.year}</span>
                    </div>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Links */}
      <section className="bg-blue-50 section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Interested in collaboration, research opportunities, or have questions about our work?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:jane.doe@university.edu" 
                className="btn-primary"
              >
                Email Dr. Doe
              </a>
              <a 
                href="https://scholar.google.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Google Scholar <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com/in/janedoe" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                LinkedIn Profile <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;