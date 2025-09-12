// src/examples/ClothingCategoryExample.tsx
// Exemplo de uso do sistema de categorização de roupas atualizado

import React, { useState, useEffect } from 'react';
import { analyzeClothingCategory, processFigureDataWithCategories, getCategorizationStats } from '@/utils/clothingCategoryAnalyzer';
import { furnidataClothingService } from '@/services/FurnidataClothingService';
import { DuotoneColorPalette } from '@/components/HabboHub/DuotoneColorPalette';

export const ClothingCategoryExample: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [primaryColor, setPrimaryColor] = useState('1');
  const [secondaryColor, setSecondaryColor] = useState('2');

  useEffect(() => {
    loadExampleData();
  }, []);

  const loadExampleData = async () => {
    try {
      // Exemplo de dados do figuredata
      const mockFigureData = {
        settype: {
          hr: {
            sets: {
              '828': {
                id: '828',
                gender: 'U',
                club: '2', // HC
                sellable: '0',
                colorable: '1',
                selectable: '1',
                colorindex: ['1', '2'], // Duotone
                colors: ['1', '2', '3', '4', '5', '6', '7', '8']
              },
              '665': {
                id: '665',
                gender: 'U',
                club: '0',
                sellable: '1', // Sellable
                colorable: '1',
                selectable: '1',
                colorindex: ['1'],
                colors: ['1', '2', '3', '4', '5']
              }
            }
          }
        },
        palettes: {
          hr: {
            colors: [
              { id: '1', name: 'Cinza Claro' },
              { id: '2', name: 'Marrom' },
              { id: '3', name: 'Marrom Escuro' },
              { id: '4', name: 'Amarelo' },
              { id: '5', name: 'Amarelo Claro' },
              { id: '6', name: 'Pele' },
              { id: '7', name: 'Vermelho Escuro' },
              { id: '8', name: 'Vermelho' }
            ]
          }
        }
      };

      // Processar dados
      const items = processFigureDataWithCategories(mockFigureData);
      const stats = getCategorizationStats(items);
      
      setStats(stats);
      setSelectedItem(items[0]); // Primeiro item como exemplo
      
      console.log('📊 [ClothingCategoryExample] Stats:', stats);
      console.log('👕 [ClothingCategoryExample] Items:', items);
      
    } catch (error) {
      console.error('❌ [ClothingCategoryExample] Error:', error);
    }
  };

  const getCategoryBadge = (type: string) => {
    const badges = {
      'NORMAL': { color: 'bg-gray-500', text: 'Normal' },
      'HC': { color: 'bg-yellow-500', text: 'HC' },
      'NFT': { color: 'bg-purple-500', text: 'NFT' },
      'RARE': { color: 'bg-red-500', text: 'Rare' },
      'LTD': { color: 'bg-orange-500', text: 'LTD' },
      'SELLABLE': { color: 'bg-green-500', text: 'Sellable' }
    };
    
    const badge = badges[type as keyof typeof badges] || badges['NORMAL'];
    
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Sistema de Categorização de Roupas Habbo
      </h1>
      
      {/* Estatísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estatísticas de Categorização</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.hc}</div>
              <div className="text-sm text-gray-600">HC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.nft}</div>
              <div className="text-sm text-gray-600">NFT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.duotone}</div>
              <div className="text-sm text-gray-600">Duotone</div>
            </div>
          </div>
        </div>
      )}

      {/* Exemplo de Item */}
      {selectedItem && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Exemplo de Item Categorizado</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-lg font-medium">{selectedItem.name}</h3>
                {getCategoryBadge(selectedItem.categoryInfo.type)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {selectedItem.id}</div>
                <div><strong>Categoria:</strong> {selectedItem.category}</div>
                <div><strong>Gênero:</strong> {selectedItem.gender}</div>
                <div><strong>Club:</strong> {selectedItem.club}</div>
                <div><strong>Sellable:</strong> {selectedItem.sellable ? 'Sim' : 'Não'}</div>
                <div><strong>Duotone:</strong> {selectedItem.isDuotone ? 'Sim' : 'Não'}</div>
                <div><strong>Colorindex:</strong> {selectedItem.colorindex.join(', ')}</div>
              </div>
            </div>
            
            <div>
              {/* Seletor de Cores Duotone */}
              {selectedItem.isDuotone && selectedItem.secondaryColors && (
                <div className="space-y-4">
                  <h4 className="font-medium">Cores Duotone</h4>
                  <DuotoneColorPalette
                    primaryColors={selectedItem.colors}
                    secondaryColors={selectedItem.secondaryColors}
                    selectedPrimaryColor={primaryColor}
                    selectedSecondaryColor={secondaryColor}
                    onPrimaryColorSelect={setPrimaryColor}
                    onSecondaryColorSelect={setSecondaryColor}
                  />
                  
                  {/* Preview da URL Duotone */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>URL Duotone:</strong><br/>
                    <code className="break-all">
                      {`https://www.habbo.com/habbo-imaging/avatarimage?figure=${selectedItem.category}-${selectedItem.figureId}-${primaryColor}-${secondaryColor}&gender=${selectedItem.gender}&size=l`}
                    </code>
                  </div>
                </div>
              )}
              
              {/* Seletor de Cores Normal */}
              {!selectedItem.isDuotone && (
                <div className="space-y-2">
                  <h4 className="font-medium">Cores Disponíveis</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {selectedItem.colors.map((colorId: string) => (
                      <button
                        key={colorId}
                        onClick={() => setPrimaryColor(colorId)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          primaryColor === colorId 
                            ? 'border-white shadow-lg ring-2 ring-blue-500' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: `var(--color-${colorId})` }}
                        title={`Cor ${colorId}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          Como Funciona o Sistema Atualizado
        </h2>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>✅ HC (Habbo Club):</strong> Identificado por <code>club="2"</code> no figuredata
          </div>
          <div>
            <strong>✅ NFT:</strong> Identificado por <code>furniline</code> nas coleções: nft2025, nft2024, nft2023, nft, nftmint, testing
          </div>
          <div>
            <strong>✅ RARE:</strong> Identificado por <code>classname</code> iniciado com "clothing_r"
          </div>
          <div>
            <strong>✅ LTD:</strong> Identificado por <code>classname</code> iniciado com "clothing_ltd"
          </div>
          <div>
            <strong>✅ SELLABLE:</strong> Identificado por <code>sellable="1"</code> no figuredata
          </div>
          <div>
            <strong>✅ DUOTONE:</strong> Identificado por <code>colorindex="1"</code> e <code>colorindex="2"</code>
          </div>
          <div>
            <strong>✅ NORMAL:</strong> Roupas antigas sem <code>sellable="1"</code>
          </div>
        </div>
      </div>
    </div>
  );
};
