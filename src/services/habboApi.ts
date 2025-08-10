
export const getUserByName = async (habboName: string) => {
  try {
    // Mock API call for now
    const mockUser = {
      name: habboName,
      motto: 'HUB-MOCK123', // Mock motto for testing
      id: 'mock-id'
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockUser;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Usuário não encontrado ou perfil privado');
  }
};
