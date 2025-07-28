
import { useState, useEffect } from 'react';

export interface UserData {
  name: string;
  figureString: string;
  online: boolean;
  motto?: string;
  memberSince?: string;
  lastAccessTime?: string;
  profileVisible?: boolean;
}

// Security and validation utilities
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"&]/g, '').trim();
};

const isValidHabboUsername = (username: string): boolean => {
  // Habbo usernames: 1-15 characters, letters, numbers, hyphens, dots
  const regex = /^[a-zA-Z0-9.-]{1,15}$/;
  return regex.test(username);
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number>(0);

  useEffect(() => {
    // Check for saved user data
    const savedUserData = localStorage.getItem('habboHubUserData');
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        // Validate saved data structure
        if (parsedUserData.name && parsedUserData.figureString) {
          setUserData(parsedUserData);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('habboHubUserData');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('habboHubUserData');
      }
    }
  }, []);

  const login = async (username: string): Promise<boolean> => {
    // Rate limiting: prevent rapid login attempts
    const now = Date.now();
    if (now - lastLoginAttempt < 2000) {
      console.warn('Please wait before attempting to login again');
      return false;
    }
    setLastLoginAttempt(now);

    // Input validation and sanitization
    const sanitizedUsername = sanitizeInput(username);
    if (!isValidHabboUsername(sanitizedUsername)) {
      console.error('Invalid username format');
      return false;
    }

    setLoading(true);
    console.log(`Attempting login for user: ${sanitizedUsername}`);
    
    try {
      // Use official Habbo API with proper error handling
      const response = await fetch(`https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(sanitizedUsername)}`);
      
      console.log(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('API Response:', users);
      
      if (users && Array.isArray(users) && users.length > 0) {
        const user = users[0];
        console.log('User found:', user);
        
        // Validate API response structure
        if (!user.name || !user.figureString) {
          throw new Error('Invalid user data received');
        }
        
        const userDataToSave: UserData = {
          name: user.name,
          figureString: user.figureString,
          online: user.online || false,
          motto: user.motto || '', // Ensure motto is handled properly
          memberSince: user.memberSince || '',
          lastAccessTime: user.lastAccessTime || '',
          profileVisible: user.profileVisible !== false // default to true
        };
        
        console.log('User data to save:', userDataToSave);
        
        // Only save non-sensitive data
        const sanitizedData = {
          ...userDataToSave,
          // Remove any potentially sensitive fields
          memberSince: undefined,
          lastAccessTime: undefined
        };
        
        setUserData(userDataToSave);
        setIsLoggedIn(true);
        localStorage.setItem('habboHubUserData', JSON.stringify(sanitizedData));
        
        console.log('User logged in successfully');
        return true;
      }
      
      console.log('User not found');
      return false;
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any corrupted state
      setUserData(null);
      setIsLoggedIn(false);
      localStorage.removeItem('habboHubUserData');
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    localStorage.removeItem('habboHubUserData');
    console.log('User logged out');
  };

  const isAdmin = () => {
    return isLoggedIn && userData?.name?.toLowerCase() === 'habbohub';
  };

  return {
    isLoggedIn,
    userData,
    loading,
    login,
    logout,
    isAdmin
  };
};
