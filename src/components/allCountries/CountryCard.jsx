import React, { useState, useEffect } from 'react';
import { Users, Globe, MapPin, ChevronRight, Heart, ExternalLink, CheckCircle, AlertCircle, Flag, DollarSign } from 'lucide-react';

const CountryCard = ({ country, onClick, onFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Check if the country is already in favorites when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`https://afbackend-production.up.railway.app/api/favorites/check/${country.cca3}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [country]);
  
  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    try {
      // Get user from local storage
      const userString = localStorage.getItem('user');
      if (!userString) {
        console.error('User not found in local storage');
        setNotification({
          show: true,
          message: 'User not logged in. Please log in to add favorites.',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
        return;
      }
      
      const user = JSON.parse(userString);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Authentication token not found');
        setNotification({
          show: true,
          message: 'Authentication required. Please log in again.',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
        return;
      }
      
      // Prepare the request body
      const requestBody = {
        country: {
          cca3: country.cca3,
          name: {
            common: country.name.common
          },
          flags: {
            svg: country.flags.svg
          },
          region: country.region,
          subregion: country.subregion,
          population: country.population,
          capital: country.capital,
          languages: country.languages,
          currencies: country.currencies,
          area: country.area
        }
      };
      
      // Send request to the API
      const response = await fetch('https://afbackend-production.up.railway.app/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite status');
      }
      
      // Parse the response
      const data = await response.json();
      
      // Update local state
      setIsFavorite(data.isFavorite);
      
      // Show notification at the top of the page
      setNotification({
        show: true,
        message: data.isFavorite 
          ? `${country.name.common} added to favorites` 
          : `${country.name.common} removed from favorites`,
        type: data.success ? 'success' : 'error'
      });
      
      // Hide the notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      
      // Call the parent component's onFavorite callback if provided
      if (onFavorite) {
        onFavorite(country, data.isFavorite);
      }
      
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setNotification({
        show: true,
        message: 'Error: ' + (error.message || 'Failed to process favorite request'),
        type: 'error'
      });
      
      // Hide the notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Extract language names from the languages object
  const languages = country.languages ? Object.values(country.languages).slice(0, 2) : [];
  const hasMoreLanguages = country.languages && Object.values(country.languages).length > 2;
  
  // Currency formatting
  const currencies = country.currencies ? Object.values(country.currencies) : [];
  const currencyName = currencies.length > 0 ? currencies[0].name : 'N/A';
  const currencySymbol = currencies.length > 0 ? currencies[0].symbol : '';

  return (
    <>
      {/* Toast Notification */}
      {notification.show && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-full shadow-xl flex items-center space-x-2 ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-white" />
          ) : (
            <AlertCircle className="h-5 w-5 text-white" />
          )}
          <p className="text-sm font-medium text-white">
            {notification.message}
          </p>
        </div>
      )}
      
      {/* Card */}
      <div 
        className="group relative overflow-hidden transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(country)}
      >
        {/* Glass card container with backdrop blur */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl border border-gray-100">
          {/* Top Section with Flag and Basic Info */}
          <div className="relative">
            {/* Flag as background with overlay gradient */}
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 z-10"></div>
              <img
                src={country.flags.svg}
                alt={`Flag of ${country.name.common}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Favorite Button */}
            <button 
              className={`absolute top-4 right-4 z-20 rounded-full transition-all duration-300 ${
                isFavorite 
                  ? 'bg-white p-3 text-rose-500 shadow-lg' 
                  : 'bg-black/20 backdrop-blur-lg p-3 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-rose-500'
              }`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            {/* Country code badge */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <div className="flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-lg rounded-full">
                <span className="text-xs font-bold text-white tracking-wider">
                  {country.cca3}
                </span>
              </div>
            </div>
            
            {/* Country name overlay at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
              <h2 className="font-bold text-2xl text-white drop-shadow-sm">
                {country.name.common}
              </h2>
              
              {/* Official name if different */}
              {country.name.official !== country.name.common && (
                <p className="text-xs text-white/80 mt-1 line-clamp-1 max-w-xs">
                  {country.name.official}
                </p>
              )}
              
              {/* Region tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {country.region && (
                  <span className="text-xs font-medium py-1 px-3 bg-white/20 backdrop-blur-sm text-white rounded-full">
                    {country.region}
                  </span>
                )}
                {country.subregion && (
                  <span className="text-xs font-medium py-1 px-3 bg-white/20 backdrop-blur-sm text-white rounded-full">
                    {country.subregion}
                  </span>
                )}
              </div>
            </div>
            
            {/* Google Maps link */}
            {country.maps?.googleMaps && (
              <a 
                href={country.maps.googleMaps} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`absolute top-16 right-4 p-3 bg-white/20 backdrop-blur-lg rounded-full text-white hover:bg-white hover:text-blue-600 transition-all z-20 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                aria-label="View on Google Maps"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          
          {/* Content Area */}
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Population Card */}
              <div className="col-span-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-700 font-medium">Population</p>
                    <p className="text-lg text-blue-900 font-bold">{formatPopulation(country.population)}</p>
                  </div>
                </div>
              </div>
              
              {/* Capital Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-amber-500 rounded-lg mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-amber-700 font-medium">Capital</p>
                  <p className="text-sm text-amber-900 font-semibold truncate w-full">{country.capital?.[0] || 'N/A'}</p>
                </div>
              </div>
              
              {/* Region Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-emerald-500 rounded-lg mb-2">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-emerald-700 font-medium">Region</p>
                  <p className="text-sm text-emerald-900 font-semibold truncate w-full">{country.region || 'N/A'}</p>
                </div>
              </div>
              
              {/* Area Card */}
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-purple-500 rounded-lg mb-2">
                    <Flag className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-purple-700 font-medium">Area</p>
                  <p className="text-sm text-purple-900 font-semibold truncate w-full">
                    {country.area ? `${formatPopulation(Math.round(country.area))} km²` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Languages */}
            {languages.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language, index) => (
                    <span key={index} className="text-xs bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                      {language}
                    </span>
                  ))}
                  {hasMoreLanguages && (
                    <span className="text-xs bg-gray-100 border border-gray-200 text-gray-500 px-3 py-1 rounded-full font-medium">
                      +{Object.values(country.languages).length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Currency */}
            {currencyName !== 'N/A' && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Currency</p>
                <div className="flex items-center">
                  <div className="p-1 bg-blue-100 rounded-md mr-2">
                    <DollarSign className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    {currencyName} 
                    {currencySymbol && <span className="ml-1 text-gray-500 font-mono">({currencySymbol})</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Card Footer */}
          <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-500 flex justify-between items-center text-white">
            <div className="text-xs font-medium uppercase tracking-wider">
              {country.name.common}
            </div>
            <div className={`flex items-center text-sm font-medium transition-all duration-300 ${
              isHovered ? 'translate-x-0' : '-translate-x-1 opacity-90'
            }`}>
              <span className="mr-1">Explore</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CountryCard;