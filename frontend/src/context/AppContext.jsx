import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { spacesService } from '../services/spacesService';
import { MOCK_SPACES } from '../services/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [spaces, setSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Parse hash to route
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/');
    
    if (!parts[0] || parts[0] === 'spaces') {
      if (parts[1] && parts[1] !== 'new') {
        const spaceId = parts[1];
        const subPage = parts[2] || 'overview';
        return { page: subPage, spaceId };
      }
      return { page: 'spaces', spaceId: null };
    }

    return { page: 'spaces', spaceId: null };
  };

  const [route, setRoute] = useState(parseHash);

  // Sync route on hashchange (Browser Back/Forward support)
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch spaces on mount
  const refreshSpaces = useCallback(async () => {
    try {
      setLoadingSpaces(true);
      const data = await spacesService.listSpaces();
      const finalSpaces = (data && data.length > 0) ? data : MOCK_SPACES;
      setSpaces(finalSpaces);
      const parsed = parseHash();
      const found = parsed.spaceId ? finalSpaces.find(s => s.id === parsed.spaceId) : finalSpaces[0];
      setCurrentSpace(found || finalSpaces[0]);
    } catch (err) {
      console.error('Failed to load spaces', err);
      setSpaces(MOCK_SPACES);
      setCurrentSpace(MOCK_SPACES[0]);
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  useEffect(() => {
    refreshSpaces();
  }, [refreshSpaces]);

  // When route spaceId changes, update currentSpace
  useEffect(() => {
    if (route.spaceId && spaces.length > 0) {
      const match = spaces.find(s => s.id === route.spaceId);
      if (match) setCurrentSpace(match);
    } else if (!currentSpace && spaces.length > 0) {
      setCurrentSpace(spaces[0]);
    }
  }, [route.spaceId, spaces, currentSpace]);

  // Navigation function
  const navigate = (page, spaceId = null) => {
    const targetSpaceId = spaceId || currentSpace?.id;
    if (page === 'spaces') {
      window.location.hash = '/spaces';
    } else if (targetSpaceId) {
      window.location.hash = `/spaces/${targetSpaceId}/${page}`;
    } else {
      window.location.hash = '/spaces';
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  return (
    <AppContext.Provider
      value={{
        spaces,
        currentSpace,
        setCurrentSpace,
        loadingSpaces,
        refreshSpaces,
        route,
        navigate,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
