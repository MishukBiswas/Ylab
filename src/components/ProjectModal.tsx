import React, { useEffect, useRef } from "react";
import { X, Calendar, Users, DollarSign, Award, GraduationCap } from "lucide-react";
import { createPortal } from "react-dom";
import type { ResearchProject } from "../types";

interface ProjectModalProps {
  project: ResearchProject;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle scroll lock and event listeners
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) {
        onClose();
      }
    };

    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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

  const getCategoryName = (categoryId: string) => {
    switch (categoryId) {
      case 'analytical':
        return 'Analytical Chemistry';
      case 'chemical':
        return 'Chemical Biology';
      case 'mass':
        return 'Mass Spectrometry';
      case 'omics':
        return 'Omics';
      default:
        return 'Uncategorized';
    }
  };

  return createPortal(
    <div 
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="w-full h-64 relative">
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 
            id="modal-title"
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            {project.title}
          </h2>

          <div className="space-y-6">
            {/* Project Description */}
            <div>
              <p className="text-gray-600 leading-relaxed">{project.longDescription}</p>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Duration</h3>
                  <p className="text-gray-600">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding</h3>
                  <p className="text-gray-600">{project.funding}</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Team Members
              </h3>
              <ul className="space-y-2">
                {Array.isArray(project.team) ? (
                  project.team.map((member, index) => (
                    <li 
                      key={index}
                      className="text-gray-600 flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {member}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No team members listed</li>
                )}
              </ul>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Category
              </h3>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Category:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {getCategoryName(project.category)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModal; 