import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, BookOpen, Calendar, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import useScrollToTop from '../hooks/useScrollToTop';
import { publicationsService } from '../services/firebase/publications';
import { photosService } from '../services/firebase/photos';
import type { Publication } from '../types';
import NewtonsCradle from '../components/NewtonsCradle';

// Lazy load the ImageModal component
const ImageModal = lazy(() => import('../components/ImageModal'));

// Default images in case uploaded ones are not available
const DEFAULT_RESEARCH_IMAGES = [
  {
    src: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Quantum Computing Research"
  },
  {
    src: "https://images.pexels.com/photos/5435297/pexels-photo-5435297.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Climate Modeling Research"
  },
  {
    src: "https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Biomedical Data Research"
  }
];

const DEFAULT_PI_PROFILE = "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&fit=facearea&w=400&h=400&facepad=2";
const DEFAULT_PI_BANNER = "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800";

const STATS = [
  { icon: Award, label: "Publications", value: "150+" },
  { icon: Users, label: "Team Members", value: "25" },
  { icon: BookOpen, label: "Active Projects", value: "12" },
  { icon: Calendar, label: "Years of Research", value: "15" }
];

const Home = () => {
  const [news, setNews] = useState<Array<{ id: number; title: string; date: string; summary: string }>>([]);
  const [featuredResearch, setFeaturedResearch] = useState<Array<{ id: number; title: string; description: string; image: string }>>([]);
  const [recentPublications, setRecentPublications] = useState<Publication[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [publicationsLoading, setPublicationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [researchImages, setResearchImages] = useState(DEFAULT_RESEARCH_IMAGES);
  const [piProfile, setPiProfile] = useState(DEFAULT_PI_PROFILE);
  const [piBanner, setPiBanner] = useState(DEFAULT_PI_BANNER);

  useEffect(() => {
    // Load photos from Firestore
    const loadPhotos = async () => {
      try {
        setPhotosLoading(true);
        const photos = await photosService.getPhotos();
        
        // Update research images
        if (photos.researchBanner1Url || photos.researchBanner2Url || photos.researchBanner3Url) {
          const newResearchImages = [
            {
              src: photos.researchBanner1Url || DEFAULT_RESEARCH_IMAGES[0].src,
              alt: "Research Banner 1"
            },
            {
              src: photos.researchBanner2Url || DEFAULT_RESEARCH_IMAGES[1].src,
              alt: "Research Banner 2"
            },
            {
              src: photos.researchBanner3Url || DEFAULT_RESEARCH_IMAGES[2].src,
              alt: "Research Banner 3"
            }
          ];
          setResearchImages(newResearchImages);
        }

        // Update PI images
        if (photos.profileImageUrl) {
          setPiProfile(photos.profileImageUrl);
        }
        if (photos.bannerImageUrl) {
          setPiBanner(photos.bannerImageUrl);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setPhotosLoading(false);
      }
    };

    loadPhotos();
  }, []);

  useEffect(() => {
    // Preload images
    researchImages.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });

    const loadPublications = async () => {
      try {
        setPublicationsLoading(true);
        setError(null);
        const publications = await publicationsService.getAll();
        const sortedPublications = publications
          .sort((a, b) => b.year - a.year)
          .slice(0, 3);
        setRecentPublications(sortedPublications);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load recent publications');
      } finally {
        setPublicationsLoading(false);
      }
    };

    loadPublications();
  }, [researchImages]);

  // Update main loading state when both photos and publications are loaded
  useEffect(() => {
    setLoading(photosLoading || publicationsLoading);
  }, [photosLoading, publicationsLoading]);

  useScrollToTop();

  // Generate SEO description based on content
  const seoDescription = useMemo(() => {
    const stats = STATS.map(stat => `${stat.value} ${stat.label.toLowerCase()}`).join(', ');
    const recentPubs = recentPublications.slice(0, 3).map(pub => pub.title).join(', ');
    
    return `Dr. Doe's Laboratory: A leading research facility with ${stats}. Recent publications include ${recentPubs}. Join us in advancing scientific discovery through innovative research.`;
  }, [recentPublications]);

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
      ],
      "description": seoDescription
    };

    const researchProjects = featuredResearch.map(project => ({
      "@context": "https://schema.org",
      "@type": "ResearchProject",
      "name": project.title,
      "description": project.description,
      "image": project.image
    }));

    const publications = recentPublications.map(pub => ({
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "name": pub.title,
      "author": {
        "@type": "Organization",
        "name": "Dr. Doe's Laboratory"
      },
      "datePublished": pub.year.toString()
    }));

    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [organization, ...researchProjects, ...publications]
    });
  }, [seoDescription, featuredResearch, recentPublications]);

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

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Dr. Doe's Laboratory - Advancing Scientific Discovery</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content="Dr. Doe's Laboratory - Advancing Scientific Discovery" />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={researchImages[0]?.src} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dr. Doe's Laboratory - Advancing Scientific Discovery" />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={researchImages[0]?.src} />
        <link rel="canonical" href={window.location.origin} />
        <script type="application/ld+json">
          {jsonLd}
        </script>
      </Helmet>

      {/* Main content only shown after loading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* UCR Gold line before hero */}
        <div className="h-1 w-full bg-ucr-gold"></div>

        {/* Hero Section */}
        <section className="text-white section-padding" style={{ backgroundColor: '#003DA5' }}>
          <div className="container-max">
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-display font-bold mb-6 text-white"
              >
                Advancing Scientific Discovery
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl mb-8 text-white leading-relaxed"
              >
                Dr. Doe's Laboratory is at the forefront of cutting-edge research in computational science, 
                quantum computing, and biomedical applications.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/research" className="btn-primary">
                  Explore Research
                </Link>
                <Link to="/publications" className="btn-secondary">
                  View Publications
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* UCR Gold line after hero */}
        <div className="h-1 w-full bg-ucr-gold"></div>

        {/* Stats Section */}
        <section className="bg-white py-16">
          <div className="container-max">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-shadow duration-200 group-hover:shadow-2xl" style={{ backgroundColor: '#FFB81C' }}>
                    <stat.icon className="h-8 w-8" style={{ color: '#003DA5' }} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Ongoing Research */}
        <section className="bg-gray-50 section-padding">
          <div className="container-max">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Ongoing Research
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our current research focuses on interdisciplinary approaches to solving challenges in Chemical Biology.
              </p>
            </div>
            <div className="text-center max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
                {researchImages.map((image, index) => (
                  <div key={index} className="relative w-full md:w-1/3 group">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full rounded-lg shadow-lg object-cover h-48"
                      loading="lazy"
                    />
                    <button
                      onClick={() => setSelectedImage(image.src)}
                      className="absolute top-2 right-2 p-2 bg-white bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-50"
                    >
                      <Maximize2 className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                ))}
              </div>
              <Link to="/research" className="btn-primary inline-flex items-center justify-center">
                Learn More About Our Research <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
        {/* About link */}
        <section className="bg-blue-50 section-padding">
          <div className="container-max">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">Dr. John Doe</h2>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg text-gray-700 mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lobortis libero sodales quam vehicula ultrices. Pellentesque sollicitudin varius ligula ut consequat. Duis scelerisque nulla leo, a laoreet ante egestas ut. Praesent porttitor lorem vel est vestibulum, id commodo orci porttitor. Suspendisse et erat vitae neque rutrum euismod ac sed quam.                  </p>
                  <Link to="/about" className="btn-primary">
                    About Dr. Doe
                  </Link>
                </div>
                <div className="flex-1 flex justify-center md:justify-end">
                  <img 
                    src={piProfile} 
                    alt="Dr. Jane Doe" 
                    className="rounded-xl shadow-lg w-64 h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* News and Publications */}
        <section className="bg-white section-padding">
          <div className="container-max">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-6xl">
                <h2 className="text-4xl font-display font-bold text-gray-900 mb-8 text-center">Recent Publications</h2>
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentPublications.map((pub) => (
                      <motion.div 
                        key={pub.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-gray-50 p-6 rounded-lg"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{pub.title}</h3>
                        <p className="text-gray-600 mb-2">{pub.authors}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">{pub.journal}</span>
                          <span className="text-sm font-semibold text-blue-600">{pub.year}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="mt-8 text-center">
                  <Link 
                    to="/publications" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Publications <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <Suspense fallback={<div>Loading...</div>}>
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        </Suspense>
      )}

      <div className="hidden shadow-ucr-blue"></div>
    </div>
  );
};

export default Home;