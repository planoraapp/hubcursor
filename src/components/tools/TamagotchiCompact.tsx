import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const TamagotchiCompact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState('monkey');
  const [currentDirection, setCurrentDirection] = useState(0);
  
  // Estados básicos do Tamagotchi
  const [hunger, setHunger] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [age, setAge] = useState(0);

  // Pets disponíveis
  const pets = [
    { id: 'monkey', name: '🐒 Macaco', emoji: '🐒' },
    { id: 'frog', name: '🐸 Sapo', emoji: '🐸' },
    { id: 'gnome', name: '🧙‍♂️ Gnomo', emoji: '🧙‍♂️' },
    { id: 'bear', name: '🐻 Urso', emoji: '🐻' }
  ];

  const currentPetData = pets.find(p => p.id === currentPet) || pets[0];

  // Função para rotacionar o pet
  const rotatePet = () => {
    setCurrentDirection((prev) => (prev + 1) % 8);
  };

  // Função para alimentar
  const feedPet = () => {
    setHunger(prev => Math.min(100, prev + 30));
    setEnergy(prev => Math.max(0, prev - 5));
  };

  // Função para brincar
  const playWithPet = () => {
    if (energy >= 20) {
      setHappiness(prev => Math.min(100, prev + 25));
      setEnergy(prev => Math.max(0, prev - 15));
      setHunger(prev => Math.max(0, prev - 10));
    }
  };

  // Função para dormir
  const petSleep = () => {
    setEnergy(prev => Math.min(100, prev + 40));
    setHunger(prev => Math.max(0, prev - 5));
  };

  // Diminuir stats automaticamente (simulação)
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 1));
      setEnergy(prev => Math.max(0, prev - 0.5));
      setHappiness(prev => Math.max(0, prev - 0.3));
    }, 3000); // A cada 3 segundos para demonstração

    return () => clearInterval(interval);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="tamagotchi-frame-outer">
      <div className="tamagotchi-header-bar">
        <div className="tamagotchi-title">?? Tamagotchi Habbo</div>
        <div className="tamagotchi-pattern"></div>
      </div>
      
      {/* Preview do Pet */}
      <div className="tamagotchi-inner-content">
        <div className="tamagotchi-pet-display">
          <div 
            className="w-16 h-16 mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
            onClick={rotatePet}
            title="Clique para rotacionar"
          >
            <div className="text-4xl">
              {currentPetData.emoji}
            </div>
          </div>
          
          {/* Pet Name */}
          <div className="volter-font text-sm font-semibold text-gray-700 mb-2">
            {currentPetData.name}
          </div>
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className="text-center">
              <div className="text-red-600">🍽️</div>
              <div className={`volter-font ${hunger < 30 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                {Math.round(hunger)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-600">⚡</div>
              <div className={`volter-font ${energy < 30 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                {Math.round(energy)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600">😊</div>
              <div className={`volter-font ${happiness < 30 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                {Math.round(happiness)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          onClick={feedPet}
          className="volter-font text-xs bg-green-500 hover:bg-green-600 text-white h-8"
          disabled={hunger >= 95}
        >
          🍽️ Feed
        </Button>
        <Button
          onClick={playWithPet}
          className="volter-font text-xs bg-purple-500 hover:bg-purple-600 text-white h-8"
          disabled={energy < 20}
        >
          🎮 Play
        </Button>
      </div>

      {/* Botão para abrir o Tamagotchi completo */}
      <div className="text-center">
        <Button 
          onClick={openModal}
          className="volter-font text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Abrir Tamagotchi Completo
        </Button>
      </div>

      {/* Modal com o Tamagotchi completo */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font text-xl text-center">
              🐾 Tamagotchi Habbo - {currentPetData.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Pet Display */}
            <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg p-6 text-center">
              <div className="bg-slate-600 rounded-lg p-4 mb-4">
                {/* Pet Selector */}
                <div className="mb-4">
                  <label className="block text-white text-sm volter-font mb-2">Escolha seu pet:</label>
                  <select 
                    value={currentPet}
                    onChange={(e) => setCurrentPet(e.target.value)}
                    className="bg-slate-700 text-white border border-slate-500 rounded px-2 py-1 text-sm volter-font w-full"
                  >
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Pet Container */}
                <div 
                  className="w-24 h-24 mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform bg-slate-500 rounded-lg flex items-center justify-center"
                  onClick={rotatePet}
                  title={`Clique para rotacionar (direção atual: ${currentDirection})`}
                >
                  <div className="text-6xl transform" style={{
                    transform: `rotate(${currentDirection * 45}deg)`
                  }}>
                    {currentPetData.emoji}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-white text-sm">
                    <span className="volter-font">Fome:</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            hunger > 70 ? 'bg-green-500' : 
                            hunger > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${hunger}%` }}
                        />
                      </div>
                    </div>
                    <span className="volter-font text-xs">{Math.round(hunger)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-white text-sm">
                    <span className="volter-font">Energia:</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            energy > 70 ? 'bg-green-500' : 
                            energy > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${energy}%` }}
                        />
                      </div>
                    </div>
                    <span className="volter-font text-xs">{Math.round(energy)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-white text-sm">
                    <span className="volter-font">Felicidade:</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            happiness > 70 ? 'bg-green-500' : 
                            happiness > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${happiness}%` }}
                        />
                      </div>
                    </div>
                    <span className="volter-font text-xs">{Math.round(happiness)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-white text-sm">
                    <span className="volter-font">Idade:</span>
                    <span className="volter-font">{age} dias</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={feedPet}
                  className="volter-font text-sm bg-green-600 hover:bg-green-700 text-white"
                  disabled={hunger >= 95}
                >
                  🍽️ Alimentar
                </Button>
                <Button
                  onClick={playWithPet}
                  className="volter-font text-sm bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={energy < 20}
                >
                  🎮 Brincar
                </Button>
                <Button
                  onClick={petSleep}
                  className="volter-font text-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  😴 Dormir
                </Button>
                <Button
                  onClick={() => {
                    setHappiness(prev => Math.min(100, prev + 15));
                    setEnergy(prev => Math.max(0, prev - 5));
                  }}
                  className="volter-font text-sm bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  🧼 Limpar
                </Button>
              </div>
            </div>
            
            {/* Status Messages */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="volter-font text-sm text-blue-800 text-center">
                {hunger < 30 && "🍽️ Seu pet está com fome!"}
                {energy < 30 && "😴 Seu pet está cansado!"}
                {happiness < 30 && "😢 Seu pet está triste!"}
                {hunger >= 70 && energy >= 70 && happiness >= 70 && "😊 Seu pet está feliz e saudável!"}
              </div>
            </div>
            
            {/* Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="volter-font text-xs text-gray-600 text-center space-y-1">
                <p><strong>🎮 Como jogar:</strong></p>
                <p>• Clique no pet para rotacioná-lo (8 direções como no Habbo)</p>
                <p>• Use os botões para cuidar do seu pet</p>
                <p>• Mantenha as barras sempre altas!</p>
                <p>• Os stats diminuem automaticamente com o tempo</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TamagotchiCompact;
