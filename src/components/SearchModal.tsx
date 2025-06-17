import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Users, Beaker } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'publication':
        return <FileText className="h-4 w-4" />;
      case 'research':
        return <Beaker className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search publications, research, team members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-gray-900"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result: any, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg mr-3">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {result.title || result.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {result.abstract || result.description || result.bio}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {result.type}
                      </span>
                      {result.year && (
                        <span className="ml-2 text-xs text-gray-500">{result.year}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;