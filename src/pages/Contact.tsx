import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'collaboration', label: 'Research Collaboration' },
    { value: 'student', label: 'Student Opportunities' },
    { value: 'media', label: 'Media & Press' },
    { value: 'technical', label: 'Technical Support' }
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: "Laboratory Address",
      details: [
        "University Science Building",
        "Room 301, 123 Research Drive",
        "Academic City, ST 12345"
      ]
    },
    {
      icon: Phone,
      title: "Phone",
      details: [
        "Office: (555) 123-4567",
        "Lab: (555) 123-4568"
      ]
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "Dr. Doe: jane.doe@university.edu",
        "Lab: contact@droelab.edu"
      ]
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: [
        "Monday - Friday: 9:00 AM - 5:00 PM",
        "By appointment on weekends"
      ]
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Jane Doe",
      role: "Principal Investigator",
      email: "jane.doe@university.edu",
      specialties: ["Quantum Computing", "Molecular Simulations"]
    },
    {
      name: "Dr. Michael Johnson",
      role: "Senior Research Scientist",
      email: "m.johnson@university.edu",
      specialties: ["Quantum Algorithms", "Computational Biology"]
    },
    {
      name: "Dr. Emma Wilson",
      role: "Postdoctoral Researcher",
      email: "e.wilson@university.edu",
      specialties: ["Climate Modeling", "Data Analysis"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get in touch with our research team for collaborations, inquiries, 
              or to learn more about joining our laboratory.
            </p>
          </div>
        </div>
      </section>

      <div className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-800">Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-red-800">Failed to send message. Please try again or contact us directly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {inquiryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief subject of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Contact Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg mr-4">
                        <info.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Contacts */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                  Direct Team Contacts
                </h2>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{member.role}</p>
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-gray-600 text-sm hover:text-blue-600 transition-colors"
                      >
                        {member.email}
                      </a>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.specialties.map((specialty, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                  Location
                </h2>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive map would be embedded here</p>
                    <p className="text-sm">University Science Building, Room 301</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Joining the Lab Section */}
      <section className="bg-blue-50 section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
              Interested in Joining Our Lab?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always looking for talented researchers, students, and collaborators 
              to join our team and contribute to cutting-edge scientific discoveries.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">PhD Students</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We offer fully funded PhD positions for exceptional students interested in computational science research.
                </p>
                <a href="mailto:jane.doe@university.edu?subject=PhD Application Inquiry" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Learn More →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Postdocs</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Postdoctoral positions available for researchers with expertise in quantum computing or computational biology.
                </p>
                <a href="mailto:jane.doe@university.edu?subject=Postdoc Position Inquiry" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Apply Now →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Collaborators</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We welcome collaborations with researchers from academia and industry on interdisciplinary projects.
                </p>
                <a href="mailto:jane.doe@university.edu?subject=Collaboration Inquiry" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Get in Touch →
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">For Students:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Strong background in mathematics, physics, or computer science</li>
                    <li>• Programming experience (Python, C++, or similar)</li>
                    <li>• Research experience preferred</li>
                    <li>• GRE scores and transcripts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">For Postdocs:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PhD in relevant field</li>
                    <li>• Strong publication record</li>
                    <li>• Experience with high-performance computing</li>
                    <li>• CV and research statement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;