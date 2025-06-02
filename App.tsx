
import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ScriptsPage from './pages/ScriptsPage';
import SettingsPage from './pages/SettingsPage';
import { CallIcon, CogIcon, ScriptIcon, HomeIcon } from './components/common/Icons';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
      isActive
        ? 'bg-primary-600 text-white shadow-lg'
        : 'text-secondary-700 hover:bg-primary-100 hover:text-primary-700'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50">
      <header className="bg-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <CallIcon className="h-10 w-10 mr-3 text-primary-300" />
              <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
            </div>
            <nav className="flex space-x-3">
              <NavLink to="/" className={navLinkClass}>
                <HomeIcon className="h-5 w-5 mr-2" />
                Dashboard
              </NavLink>
              <NavLink to="/scripts" className={navLinkClass}>
                <ScriptIcon className="h-5 w-5 mr-2" />
                Voice Profiles
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                <CogIcon className="h-5 w-5 mr-2" />
                Settings
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <footer className="bg-secondary-800 text-secondary-300 py-6 text-center shadow-inner-top">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
