import React from 'react';
import logo from '../assets/Fras.png';

const Header = ({ userName, userRole }) => {
  const formatUserName = (name) => {
    if (!name) return ''   
    if (typeof name === 'string') {
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }
    
    if (typeof name === 'object') {
      const { firstName, lastName, first_name, last_name } = name;
      if (firstName && lastName) {
        return `${firstName} ${lastName}`
      } else if (first_name && last_name) {
        return `${first_name} ${last_name}`
      }
    }
    
    return String(name)
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const formattedUserName = formatUserName(userName);
  const formattedRole = formatRole(userRole);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-40 shadow-sm dark:border-gray-800 dark:bg-gray-900 ">
      <div className="flex items-center justify-between w-full px-4 py-2 top-2 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 lg:h-11 lg:w-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          </button>
          <h1 className="hidden text-lg font-semibold text-gray-800 dark:text-white md:block">
            FRAS Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
              <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                {formattedUserName.split(' ').map(name => name[0]).join('')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {formattedUserName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formattedRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;