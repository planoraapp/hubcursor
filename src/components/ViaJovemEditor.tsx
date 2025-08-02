import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ViaJovemEditorProps {
  className?: string;
}

export const ViaJovemEditor = ({ className = '' }: ViaJovemEditorProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-7.hr-100-61.ch-210-66.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState('M');
  const [selectedHotel, setSelectedHotel] = useState('habbohub');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedSubNav, setSelectedSubNav] = useState('gender');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('7');
  const [selectedItem, setSelectedItem] = useState('190');
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Expanded clothing data based on Habbo official assets
  const clothingData = {
    hd: {
      hc: [
        { id: '3091', name: 'Rosto HC Elite 1', rarity: 'hc' },
        { id: '3092', name: 'Rosto HC Elite 2', rarity: 'hc' },
        { id: '3093', name: 'Rosto HC Elite 3', rarity: 'hc' },
        { id: '3094', name: 'Rosto HC Elite 4', rarity: 'hc' },
        { id: '3095', name: 'Rosto HC Elite 5', rarity: 'hc' },
        { id: '3096', name: 'Rosto HC Elite 6', rarity: 'hc' },
        { id: '3097', name: 'Rosto HC Elite 7', rarity: 'hc' },
        { id: '3098', name: 'Rosto HC Elite 8', rarity: 'hc' },
        { id: '3099', name: 'Rosto HC Elite 9', rarity: 'hc' },
        { id: '3100', name: 'Rosto HC Elite 10', rarity: 'hc' },
      ],
      sell: [
        { id: '3600', name: 'Olhos Mil e Uma Noites', rarity: 'sellable', duotone: true },
        { id: '3603', name: 'Olhos Zumbi', rarity: 'sellable' },
        { id: '3604', name: 'Olhos Demoníacos', rarity: 'sellable' },
        { id: '3631', name: 'Maquiagem Boneca de Porcelana', rarity: 'sellable', duotone: true },
        { id: '3704', name: 'Máscara Robótica', rarity: 'sellable' },
        { id: '3813', name: 'Decoração Facial de Cristais BoHo', rarity: 'sellable' },
        { id: '3814', name: 'Pintura Facial BoHo Chic', rarity: 'sellable', duotone: true },
        { id: '3845', name: 'Olhos Possuídos', rarity: 'sellable' },
        { id: '3956', name: 'Maquiagem Bollywood', rarity: 'sellable', duotone: true },
        { id: '3997', name: 'Rosto Marcado', rarity: 'sellable' },
        { id: '4023', name: 'Mil Olhos', rarity: 'sellable' },
        { id: '4163', name: 'Maquiagem 80s', rarity: 'sellable', duotone: true },
        { id: '4174', name: 'Maquiagem Gângster', rarity: 'sellable' },
        { id: '4383', name: 'Makeup Ídolo Pop', rarity: 'sellable', duotone: true },
        { id: '5522', name: 'Maquiagem Cômica', rarity: 'sellable', duotone: true },
        { id: '5682', name: 'Maquiagem Bratz Cloe', rarity: 'sellable' },
        { id: '5683', name: 'Maquiagem Bratz Jade', rarity: 'sellable' },
        { id: '5684', name: 'Maquiagem Bratz Sasha', rarity: 'sellable' },
        { id: '5685', name: 'Maquiagem Bratz Yasmin', rarity: 'sellable' },
        { id: '5696', name: 'Maquiagem Coração', rarity: 'sellable', duotone: true },
        { id: '5913', name: 'Rosto Coelhinho', rarity: 'sellable' },
        { id: '6072', name: 'Rosto Bratz Koby', rarity: 'sellable', duotone: true },
      ],
      raro: [
        { id: '3536', name: 'Cara de Gato Demoníaco', rarity: 'raro', duotone: true },
        { id: '3537', name: 'Olho do Ciclope', rarity: 'raro' },
        { id: '3721', name: 'Look Vampiresco', rarity: 'raro' },
        { id: '4015', name: 'Emoções Cibernéticas', rarity: 'raro' },
      ],
      nft: [
        { id: '4202', name: 'NFT Rosto 1', rarity: 'nft' },
        { id: '4203', name: 'NFT Rosto 2', rarity: 'nft' },
        { id: '4204', name: 'NFT Rosto 3', rarity: 'nft' },
        { id: '4205', name: 'NFT Rosto 4', rarity: 'nft' },
        { id: '4206', name: 'NFT Rosto 5', rarity: 'nft' },
        { id: '5041', name: 'Rosto de Boneca', rarity: 'nft' },
        { id: '5042', name: 'Rosto Boneca Possuída', rarity: 'nft' },
        { id: '5143', name: 'NFT Especial 1', rarity: 'nft' },
        { id: '5153', name: 'NFT Especial 2', rarity: 'nft' },
        { id: '5154', name: 'NFT Especial 3', rarity: 'nft' },
        { id: '5316', name: 'Olhar Brilhante 1', rarity: 'nft', duotone: true },
        { id: '5317', name: 'Olhar Brilhante 2', rarity: 'nft', duotone: true },
        { id: '5318', name: 'Olhar Vívido 1', rarity: 'nft', duotone: true },
        { id: '5319', name: 'Olhar Vívido 2', rarity: 'nft', duotone: true },
        { id: '5430', name: 'Pedregulho', rarity: 'nft' },
        { id: '5524', name: 'Olhos Sonolentos 1', rarity: 'nft', duotone: true },
        { id: '5525', name: 'Olhos Sonolentos 2', rarity: 'nft', duotone: true },
        { id: '5740', name: 'Quer jogar um jogo? 1', rarity: 'nft', duotone: true },
        { id: '5741', name: 'Quer jogar um jogo? 2', rarity: 'nft', duotone: true },
        { id: '5798', name: 'Coroa de Sangue 1', rarity: 'nft' },
        { id: '5799', name: 'Coroa de Sangue 2', rarity: 'nft' },
        { id: '5837', name: 'Rosto Sardento A1', rarity: 'nft', duotone: true },
        { id: '5838', name: 'Rosto Sardento A2', rarity: 'nft', duotone: true },
        { id: '5839', name: 'Rosto Sardento B1', rarity: 'nft', duotone: true },
        { id: '5840', name: 'Rosto Sardento B2', rarity: 'nft', duotone: true },
      ],
      nonhc: [
        { id: '180', name: 'Rosto Básico 1', rarity: 'free' },
        { id: '185', name: 'Rosto Básico 2', rarity: 'free' },
        { id: '190', name: 'Rosto Básico 3', rarity: 'free' },
        { id: '195', name: 'Rosto Básico 4', rarity: 'free' },
        { id: '200', name: 'Rosto Básico 5', rarity: 'free' },
        { id: '205', name: 'Rosto Básico 6', rarity: 'free' },
        { id: '206', name: 'Rosto Básico 7', rarity: 'free' },
        { id: '207', name: 'Rosto Básico 8', rarity: 'free' },
        { id: '208', name: 'Rosto Básico 9', rarity: 'free' },
        { id: '209', name: 'Rosto Básico 10', rarity: 'free' },
        { id: '210', name: 'Rosto Básico 11', rarity: 'free' },
        { id: '211', name: 'Rosto Básico 12', rarity: 'free' },
        { id: '212', name: 'Rosto Básico 13', rarity: 'free' },
        { id: '213', name: 'Rosto Básico 14', rarity: 'free' },
        { id: '214', name: 'Rosto Básico 15', rarity: 'free' },
        { id: '215', name: 'Rosto Básico 16', rarity: 'free' },
        { id: '216', name: 'Rosto Básico 17', rarity: 'free' },
        { id: '217', name: 'Rosto Básico 18', rarity: 'free' },
        { id: '218', name: 'Rosto Básico 19', rarity: 'free' },
        { id: '219', name: 'Rosto Básico 20', rarity: 'free' },
      ]
    },
    hr: {
      nonhc: [
        { id: '1', name: 'Cabelo Liso Curto', rarity: 'free' },
        { id: '2', name: 'Cabelo Ondulado', rarity: 'free' },
        { id: '3', name: 'Cabelo Espetado', rarity: 'free' },
        { id: '5', name: 'Cabelo Comprido', rarity: 'free' },
        { id: '6', name: 'Cabelo Moicano', rarity: 'free' },
        { id: '7', name: 'Cabelo Afro', rarity: 'free' },
        { id: '9', name: 'Cabelo Careca', rarity: 'free' },
        { id: '10', name: 'Cabelo Punk', rarity: 'free' },
        { id: '11', name: 'Cabelo Emo', rarity: 'free' },
        { id: '13', name: 'Cabelo Clássico', rarity: 'free' },
        { id: '14', name: 'Cabelo Moderno', rarity: 'free' },
        { id: '15', name: 'Cabelo Despenteado', rarity: 'free' },
        { id: '17', name: 'Cabelo Surfista', rarity: 'free' },
        { id: '18', name: 'Cabelo Romântico', rarity: 'free' },
        { id: '19', name: 'Cabelo Rebelde', rarity: 'free' },
        { id: '21', name: 'Cabelo Vintage', rarity: 'free' },
        { id: '22', name: 'Cabelo Casual', rarity: 'free' },
        { id: '23', name: 'Cabelo Elegante', rarity: 'free' },
        { id: '25', name: 'Cabelo Trendy', rarity: 'free' },
        { id: '26', name: 'Cabelo Chique', rarity: 'free' },
        { id: '27', name: 'Cabelo Fashion', rarity: 'free' },
        { id: '29', name: 'Cabelo Hipster', rarity: 'free' },
        { id: '30', name: 'Cabelo Cool', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Cabelo HC Premium 1', rarity: 'hc' },
        { id: '8', name: 'Cabelo HC Premium 2', rarity: 'hc' },
        { id: '12', name: 'Cabelo HC Premium 3', rarity: 'hc' },
        { id: '16', name: 'Cabelo HC Premium 4', rarity: 'hc' },
        { id: '20', name: 'Cabelo HC Premium 5', rarity: 'hc' },
        { id: '24', name: 'Cabelo HC Premium 6', rarity: 'hc' },
        { id: '28', name: 'Cabelo HC Premium 7', rarity: 'hc' },
        { id: '31', name: 'Cabelo HC Exclusivo 1', rarity: 'hc' },
        { id: '32', name: 'Cabelo HC Exclusivo 2', rarity: 'hc' },
        { id: '33', name: 'Cabelo HC Exclusivo 3', rarity: 'hc' },
        { id: '34', name: 'Cabelo HC Exclusivo 4', rarity: 'hc' },
        { id: '35', name: 'Cabelo HC Exclusivo 5', rarity: 'hc' },
        { id: '36', name: 'Cabelo HC Elite 1', rarity: 'hc' },
        { id: '37', name: 'Cabelo HC Elite 2', rarity: 'hc' },
        { id: '38', name: 'Cabelo HC Elite 3', rarity: 'hc' },
        { id: '39', name: 'Cabelo HC Elite 4', rarity: 'hc' },
        { id: '40', name: 'Cabelo HC Elite 5', rarity: 'hc' },
        { id: '50', name: 'Cabelo HC VIP 1', rarity: 'hc' },
        { id: '51', name: 'Cabelo HC VIP 2', rarity: 'hc' },
        { id: '52', name: 'Cabelo HC VIP 3', rarity: 'hc' },
      ]
    },
    ch: {
      nonhc: [
        { id: '1', name: 'Camiseta Básica Lisa', rarity: 'free' },
        { id: '2', name: 'Camiseta Polo', rarity: 'free' },
        { id: '3', name: 'Regata Básica', rarity: 'free' },
        { id: '5', name: 'Camiseta Estampada', rarity: 'free' },
        { id: '6', name: 'Blusa Social', rarity: 'free' },
        { id: '7', name: 'Camiseta Esportiva', rarity: 'free' },
        { id: '9', name: 'Blusa Casual', rarity: 'free' },
        { id: '10', name: 'Camiseta Oversized', rarity: 'free' },
        { id: '11', name: 'Blusa Romântica', rarity: 'free' },
        { id: '13', name: 'Camiseta Vintage', rarity: 'free' },
        { id: '14', name: 'Blusa Elegante', rarity: 'free' },
        { id: '15', name: 'Camiseta Trend', rarity: 'free' },
        { id: '17', name: 'Blusa Chique', rarity: 'free' },
        { id: '18', name: 'Camiseta Fashion', rarity: 'free' },
        { id: '19', name: 'Blusa Moderna', rarity: 'free' },
        { id: '21', name: 'Camiseta Cool', rarity: 'free' },
        { id: '22', name: 'Blusa Hipster', rarity: 'free' },
        { id: '23', name: 'Camiseta Urban', rarity: 'free' },
        { id: '25', name: 'Blusa Boho', rarity: 'free' },
        { id: '26', name: 'Camiseta Grunge', rarity: 'free' },
        { id: '27', name: 'Blusa Minimalista', rarity: 'free' },
        { id: '210', name: 'Camiseta Básica V2', rarity: 'free' },
        { id: '211', name: 'Camiseta Básica V3', rarity: 'free' },
        { id: '212', name: 'Camiseta Básica V4', rarity: 'free' },
        { id: '213', name: 'Camiseta Básica V5', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Blusa HC Premium 1', rarity: 'hc' },
        { id: '8', name: 'Blusa HC Premium 2', rarity: 'hc' },
        { id: '12', name: 'Blusa HC Premium 3', rarity: 'hc' },
        { id: '16', name: 'Blusa HC Premium 4', rarity: 'hc' },
        { id: '20', name: 'Blusa HC Premium 5', rarity: 'hc' },
        { id: '24', name: 'Blusa HC Premium 6', rarity: 'hc' },
        { id: '28', name: 'Blusa HC Exclusiva 1', rarity: 'hc' },
        { id: '30', name: 'Blusa HC Exclusiva 2', rarity: 'hc' },
        { id: '32', name: 'Blusa HC Elite 1', rarity: 'hc' },
        { id: '34', name: 'Blusa HC Elite 2', rarity: 'hc' },
        { id: '36', name: 'Blusa HC VIP 1', rarity: 'hc' },
        { id: '38', name: 'Blusa HC VIP 2', rarity: 'hc' },
        { id: '40', name: 'Blusa HC Designer 1', rarity: 'hc' },
        { id: '42', name: 'Blusa HC Designer 2', rarity: 'hc' },
        { id: '44', name: 'Blusa HC Limitada 1', rarity: 'hc' },
        { id: '46', name: 'Blusa HC Limitada 2', rarity: 'hc' },
      ]
    },
    lg: {
      nonhc: [
        { id: '1', name: 'Calça Jeans Básica', rarity: 'free' },
        { id: '2', name: 'Calça Social', rarity: 'free' },
        { id: '3', name: 'Short Casual', rarity: 'free' },
        { id: '5', name: 'Calça Skinny', rarity: 'free' },
        { id: '6', name: 'Saia Básica', rarity: 'free' },
        { id: '7', name: 'Calça Legging', rarity: 'free' },
        { id: '9', name: 'Short Jeans', rarity: 'free' },
        { id: '10', name: 'Saia Midi', rarity: 'free' },
        { id: '11', name: 'Calça Cargo', rarity: 'free' },
        { id: '13', name: 'Saia Mini', rarity: 'free' },
        { id: '14', name: 'Calça Flare', rarity: 'free' },
        { id: '15', name: 'Short Esportivo', rarity: 'free' },
        { id: '17', name: 'Saia Plissada', rarity: 'free' },
        { id: '18', name: 'Calça Pantalona', rarity: 'free' },
        { id: '19', name: 'Short Alfaiataria', rarity: 'free' },
        { id: '270', name: 'Calça Clássica 1', rarity: 'free' },
        { id: '271', name: 'Calça Clássica 2', rarity: 'free' },
        { id: '272', name: 'Calça Clássica 3', rarity: 'free' },
        { id: '273', name: 'Calça Clássica 4', rarity: 'free' },
        { id: '274', name: 'Calça Clássica 5', rarity: 'free' },
        { id: '275', name: 'Calça Clássica 6', rarity: 'free' },
        { id: '276', name: 'Calça Clássica 7', rarity: 'free' },
        { id: '277', name: 'Calça Clássica 8', rarity: 'free' },
        { id: '278', name: 'Calça Clássica 9', rarity: 'free' },
        { id: '279', name: 'Calça Clássica 10', rarity: 'free' },
        { id: '280', name: 'Calça Clássica 11', rarity: 'free' },
        { id: '281', name: 'Calça Clássica 12', rarity: 'free' },
        { id: '282', name: 'Calça Clássica 13', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Calça HC Premium 1', rarity: 'hc' },
        { id: '8', name: 'Calça HC Premium 2', rarity: 'hc' },
        { id: '12', name: 'Calça HC Premium 3', rarity: 'hc' },
        { id: '16', name: 'Calça HC Premium 4', rarity: 'hc' },
        { id: '20', name: 'Calça HC Premium 5', rarity: 'hc' },
        { id: '24', name: 'Calça HC Exclusiva 1', rarity: 'hc' },
        { id: '28', name: 'Calça HC Exclusiva 2', rarity: 'hc' },
        { id: '30', name: 'Saia HC Elite 1', rarity: 'hc' },
        { id: '32', name: 'Saia HC Elite 2', rarity: 'hc' },
        { id: '34', name: 'Calça HC Designer 1', rarity: 'hc' },
        { id: '36', name: 'Calça HC Designer 2', rarity: 'hc' },
        { id: '38', name: 'Saia HC VIP 1', rarity: 'hc' },
        { id: '40', name: 'Saia HC VIP 2', rarity: 'hc' },
      ]
    },
    sh: {
      nonhc: [
        { id: '1', name: 'Tênis Básico', rarity: 'free' },
        { id: '2', name: 'Sapato Social', rarity: 'free' },
        { id: '3', name: 'Sandália Básica', rarity: 'free' },
        { id: '5', name: 'Tênis Esportivo', rarity: 'free' },
        { id: '6', name: 'Bota Casual', rarity: 'free' },
        { id: '7', name: 'Sapatilha', rarity: 'free' },
        { id: '9', name: 'Chinelo', rarity: 'free' },
        { id: '10', name: 'Sapato Feminino', rarity: 'free' },
        { id: '11', name: 'Bota Militar', rarity: 'free' },
        { id: '13', name: 'Tênis All Star', rarity: 'free' },
        { id: '14', name: 'Sapato Oxford', rarity: 'free' },
        { id: '15', name: 'Sandália Esportiva', rarity: 'free' },
        { id: '305', name: 'Sapato Clássico 1', rarity: 'free' },
        { id: '306', name: 'Sapato Clássico 2', rarity: 'free' },
        { id: '307', name: 'Sapato Clássico 3', rarity: 'free' },
        { id: '308', name: 'Sapato Clássico 4', rarity: 'free' },
        { id: '309', name: 'Sapato Clássico 5', rarity: 'free' },
        { id: '310', name: 'Sapato Clássico 6', rarity: 'free' },
        { id: '311', name: 'Sapato Clássico 7', rarity: 'free' },
        { id: '312', name: 'Sapato Clássico 8', rarity: 'free' },
        { id: '313', name: 'Sapato Clássico 9', rarity: 'free' },
        { id: '314', name: 'Sapato Clássico 10', rarity: 'free' },
        { id: '315', name: 'Sapato Clássico 11', rarity: 'free' },
        { id: '316', name: 'Sapato Clássico 12', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Sapato HC Premium 1', rarity: 'hc' },
        { id: '8', name: 'Sapato HC Premium 2', rarity: 'hc' },
        { id: '12', name: 'Sapato HC Premium 3', rarity: 'hc' },
        { id: '16', name: 'Sapato HC Premium 4', rarity: 'hc' },
        { id: '20', name: 'Bota HC Exclusiva 1', rarity: 'hc' },
        { id: '24', name: 'Bota HC Exclusiva 2', rarity: 'hc' },
        { id: '28', name: 'Sapato HC Elite 1', rarity: 'hc' },
        { id: '30', name: 'Sapato HC Elite 2', rarity: 'hc' },
        { id: '32', name: 'Tênis HC Designer 1', rarity: 'hc' },
        { id: '34', name: 'Tênis HC Designer 2', rarity: 'hc' },
      ]
    }
  };

  // Color palettes
  const colorPalettes = {
    nonhc: [
      { id: '1', hex: '#F5DA88', name: 'Amarelo Claro' },
      { id: '2', hex: '#FFDBC1', name: 'Pêssego' },
      { id: '3', hex: '#FFCB98', name: 'Bege' },
      { id: '4', hex: '#F4AC54', name: 'Laranja' },
      { id: '5', hex: '#FF987F', name: 'Salmão' },
      { id: '6', hex: '#e0a9a9', name: 'Rosa Claro' },
      { id: '7', hex: '#ca8154', name: 'Marrom Claro' },
      { id: '8', hex: '#B87560', name: 'Marrom' },
      { id: '9', hex: '#9C543F', name: 'Marrom Escuro' },
      { id: '10', hex: '#904925', name: 'Marrom Chocolate' },
      { id: '11', hex: '#4C311E', name: 'Marrom Muito Escuro' },
    ],
    hc: [
      { id: '12', hex: '#543d35', name: 'HC Marrom 1' },
      { id: '13', hex: '#653a1d', name: 'HC Marrom 2' },
      { id: '14', hex: '#6E392C', name: 'HC Marrom 3' },
      { id: '15', hex: '#714947', name: 'HC Cinza' },
      { id: '16', hex: '#856860', name: 'HC Bege' },
      { id: '17', hex: '#895048', name: 'HC Terra' },
      { id: '18', hex: '#a15253', name: 'HC Rosé' },
      { id: '19', hex: '#aa7870', name: 'HC Rosa' },
      { id: '20', hex: '#be8263', name: 'HC Dourado' },
      { id: '21', hex: '#FF5757', name: 'HC Vermelho' },
      { id: '22', hex: '#FF7575', name: 'HC Vermelho Claro' },
      { id: '23', hex: '#5DC446', name: 'HC Verde' },
      { id: '24', hex: '#6799CC', name: 'HC Azul' },
      { id: '25', hex: '#D288CE', name: 'HC Roxo' },
    ]
  };

  const getAvatarUrl = () => {
    const hotel = selectedHotel === 'habbohub' ? 'www.habbo.com' : `www.habbo.${selectedHotel}`;
    return `https://${hotel}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std&size=l`;
  };

  const getClothingImageUrl = (category: string, itemId: string, color: string = '7') => {
    const hotel = selectedHotel === 'habbohub' ? 'www.habbo.com' : `www.habbo.${selectedHotel}`;
    return `https://${hotel}/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&gender=${selectedGender}&size=s&direction=2&head_direction=2`;
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário válido",
        variant: "destructive"
      });
      return;
    }

    try {
      const hotel = selectedHotel === 'habbohub' ? 'com' : selectedHotel;
      const response = await fetch(`https://www.habbo.${hotel}/api/public/users?name=${username}`);
      
      if (!response.ok) throw new Error('Usuário não encontrado');
      
      const data = await response.json();
      if (data.figureString) {
        setCurrentFigure(data.figureString);
        toast({
          title: "Sucesso",
          description: `Visual de ${data.name} carregado!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
    }
  };

  const handleRotateAvatar = () => {
    setCurrentDirection(prev => {
      const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
      const currentIndex = directions.indexOf(prev);
      return directions[(currentIndex + 1) % directions.length];
    });
  };

  const handleCategoryClick = (category: string, subnav: string) => {
    setSelectedCategory(category);
    setSelectedSubNav(subnav);
  };

  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleClothingClick = (clothing: string) => {
    setSelectedItem(clothing);
    
    // Update figure string
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Remove existing category part
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    
    // Add new category part
    const newPart = `${selectedCategory}-${clothing}-${selectedColor}`;
    filteredParts.push(newPart);
    
    setCurrentFigure(filteredParts.join('.'));
  };

  const handleColorClick = (colorId: string) => {
    setSelectedColor(colorId);
    
    // Update figure with new color
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Update existing category part with new color
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    
    setCurrentFigure(updatedParts.join('.'));
  };

  const copyFigure = () => {
    navigator.clipboard.writeText(currentFigure);
    toast({
      title: "Copiado!",
      description: "String do visual copiada para a área de transferência",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "Copiado!",
      description: "URL do avatar copiada para a área de transferência",
    });
  };

  const randomizeAvatar = () => {
    const categories = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const newFigureParts = [];

    categories.forEach(category => {
      const categoryData = clothingData[category as keyof typeof clothingData];
      if (categoryData) {
        const allItems = [...(categoryData.nonhc || []), ...(categoryData.hc || [])];
        if (allItems.length > 0) {
          const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
          const randomColor = Math.floor(Math.random() * 11) + 1;
          newFigureParts.push(`${category}-${randomItem.id}-${randomColor}`);
        }
      }
    });

    setCurrentFigure(newFigureParts.join('.'));
    toast({
      title: "Avatar Randomizado!",
      description: "Novo visual gerado aleatoriamente",
    });
  };

  const getCurrentCategoryItems = () => {
    const categoryData = clothingData[selectedCategory as keyof typeof clothingData];
    if (!categoryData) return [];

    const allItems = Object.values(categoryData).flat();
    
    if (searchTerm) {
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm)
      );
    }
    
    return allItems;
  };

  const filteredItems = getCurrentCategoryItems();

  return (
    <div className={`via-jovem-editor ${className}`} ref={containerRef}>
      <style>{`
        .via-jovem-editor {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .via-jovem-editor .col-md-6 {
          background-color: var(--submenu-bg, #f8f9fa);
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .via-jovem-editor .main-navigation ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .main-navigation li a {
          display: block;
          padding: 8px;
          border-radius: 4px;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid transparent;
        }
        
        .via-jovem-editor .main-navigation li a.active {
          background-color: rgba(0,123,255,0.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .main-navigation li a:hover {
          background-color: rgba(0,123,255,0.1);
        }
        
        .via-jovem-editor .main-navigation li a img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
        }
        
        .via-jovem-editor .sub-navigation ul {
          list-style: none;
          padding: 0;
          margin: 10px 0;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .sub-navigation ul.hidden {
          display: none;
        }
        
        .via-jovem-editor .sub-navigation ul.display {
          display: flex;
        }
        
        .via-jovem-editor .sub-navigation li a {
          display: block;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid transparent;
        }
        
        .via-jovem-editor .sub-navigation li a.nav-selected {
          background-color: rgba(0,123,255,0.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .sub-navigation li a:hover {
          background-color: rgba(0,123,255,0.1);
        }
        
        .via-jovem-editor .sub-navigation li a img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          display: block;
        }
        
        .via-jovem-editor .clothes-object {
          display: inline-block;
          width: 32px;
          height: 32px;
          margin: 2px;
          border: 2px solid transparent;
          border-radius: 4px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-decoration: none;
        }
        
        .via-jovem-editor .clothes-object:hover {
          border-color: #007bff;
          transform: scale(1.1);
        }
        
        .via-jovem-editor .clothes-object.selected {
          border-color: #28a745;
          background-color: rgba(40, 167, 69, 0.1);
        }
        
        .via-jovem-editor .clothes-object.club::after {
          content: "HC";
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ffc107;
          color: #000;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.nft::after {
          content: "NFT";
          position: absolute;
          top: -5px;
          right: -5px;
          background: #6f42c1;
          color: #fff;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.raro::after {
          content: "RARO";
          position: absolute;
          top: -5px;
          right: -8px;
          background: #dc3545;
          color: #fff;
          font-size: 7px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.sellable::after {
          content: "SELL";
          position: absolute;
          top: -5px;
          right: -8px;
          background: #17a2b8;
          color: #fff;
          font-size: 7px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .color-object {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin: 2px;
          border: 2px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .via-jovem-editor .color-object:hover {
          transform: scale(1.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .color-object.selected {
          border-color: #28a745;
          border-width: 3px;
        }
        
        .via-jovem-editor .color-object.colorClub {
          position: relative;
        }
        
        .via-jovem-editor .color-object.colorClub::after {
          content: "HC";
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ffc107;
          color: #000;
          font-size: 6px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          max-height: 325px;
          max-width: 525px;
          overflow: auto;
        }
        
        .via-jovem-editor .card-body {
          padding: 15px;
        }
        
        .via-jovem-editor .pincel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 10px 0;
        }
        
        .via-jovem-editor .pincel-body {
          padding: 15px;
        }
        
        .via-jovem-editor #search-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .via-jovem-editor .avatar-container {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .via-jovem-editor .avatar-container img {
          max-width: 200px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .via-jovem-editor .avatar-container img:hover {
          transform: scale(1.05);
        }
        
        .via-jovem-editor .user-search {
          display: flex;
          gap: 10px;
          margin: 10px 0;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .user-search input,
        .via-jovem-editor .user-search select {
          flex: 1;
          min-width: 150px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .via-jovem-editor .user-search button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .via-jovem-editor .user-search button:hover {
          background: #0056b3;
        }
        
        .via-jovem-editor .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 10px 0;
          justify-content: center;
        }
        
        .via-jovem-editor .action-buttons button {
          padding: 6px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .via-jovem-editor .action-buttons button:hover {
          background: #1e7e34;
        }
        
        .via-jovem-editor .figure-display {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          margin: 10px 0;
        }
        
        .via-jovem-editor .row {
          display: flex;
          flex-wrap: wrap;
          margin: 10px 0;
          gap: 20px;
          align-items: flex-start;
        }
        
        .via-jovem-editor .editor-left {
          flex: 2;
          min-width: 400px;
          background-color: var(--submenu-bg, #f8f9fa);
          padding: 20px;
          border-radius: 5px;
        }
        
        .via-jovem-editor .editor-right {
          flex: 1;
          min-width: 250px;
        }
        
        .via-jovem-editor .clothing-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .via-jovem-editor .color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .via-jovem-editor .row {
            flex-direction: column;
          }
          
          .via-jovem-editor .main-navigation ul,
          .via-jovem-editor .sub-navigation ul {
            justify-content: center;
          }
          
          .via-jovem-editor .user-search {
            flex-direction: column;
          }
          
          .via-jovem-editor .user-search input,
          .via-jovem-editor .user-search select,
          .via-jovem-editor .user-search button {
            width: 100%;
            min-width: unset;
          }
        }
      `}</style>
      
      {/* Avatar Preview */}
      <div className="avatar-container">
        <img 
          src={getAvatarUrl()} 
          alt="Avatar Preview" 
          onClick={handleRotateAvatar}
          title="Clique para girar o avatar"
        />
        <div className="figure-display">
          {currentFigure}
        </div>
        <div className="action-buttons">
          <button onClick={copyFigure}>Copiar Figure</button>
          <button onClick={copyUrl}>Copiar URL</button>
          <button onClick={handleRotateAvatar}>Girar Avatar</button>
          <button onClick={randomizeAvatar}>Avatar Aleatório</button>
        </div>
      </div>

      {/* User Search - HabboHub Only */}
      <div className="user-search">
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o nome do usuário no HabboHub"
          onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
        />
        <button onClick={handleSearchUser}>Buscar HabboHub</button>
      </div>

      {/* Editor Interface with Side-by-Side Layout */}
      <div className="row">
        <div className="editor-left">
          <div className="main-navigation">
            <ul>
              <li>
                <a 
                  className={selectedCategory === 'hd' ? 'active' : ''}
                  onClick={() => handleCategoryClick('hd', 'gender')} 
                  href="#" 
                  title="Corpo/Rostos"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0eQIgxrT5XIUhrroYSNGl8O2l5hj_OMJwFJdhyphenhyphenHytY29FVWsX3YlQ1u92d9imOiCOcfudwpgMyKj_X4X_FDlxlZTCn0F6pfjYor-1eercx4kBzw5qW_p_7yoCFL90oGV4PJxUmnBqcqCx/s0/1177__-3cy.png" alt="Corpo/Rostos" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'hr' ? 'active' : ''}
                  onClick={() => handleCategoryClick('hr', 'hair')} 
                  href="#" 
                  title="Cabelos/Penteados"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNjUS-Ha0YYlJw4wrbDEmV7cVHeAhODwiDPXswujEf1ywhk77sLlWeGLn488mfHsFu0OZAksKuHyfej9_zAj0maCQUc-DGxrmyD62XHrhHfiCyfCXo6gaA1YY3MNqEPyrAyChH6OOpo7b1/s1600/Image+1175.png" alt="Cabelos" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'ch' ? 'active' : ''}
                  onClick={() => handleCategoryClick('ch', 'tops')} 
                  href="#" 
                  title="Camisetas"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKIGt42L2O63iaFpagXgtTda1OBYtCHCdaTb7ZWdz1pQWvqC1AGW8dtMJqb-N-L_YYuuv-PnafgtIqrZYKNgJwRbRudBn6PRaGd-gTHJ88Y7k9VI2sp3c6LEOvjAnXJEGRhi33Lpoyk5Pg/s1600/Image+1871.png" alt="Camisetas" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'lg' ? 'active' : ''}
                  onClick={() => handleCategoryClick('lg', 'bottoms')} 
                  href="#" 
                  title="Calças/Saias"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-JF8daD4mDOT9Yc2NYtZ48GwQfLlAtwTFNkVDC6zWph9MKicHCQzHWhYy4i0enyp1JtqX3J3PgKR9I1WH99LVVDKgVUEEUZw-4m6Un7jejkdy3ir47jiAjx_gNT-z5RXQXJYVDjQI6flr/s1600/Image+2113.png" alt="Calças" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'sh' ? 'active' : ''}
                  onClick={() => handleCategoryClick('sh', 'shoes')} 
                  href="#" 
                  title="Sapatos"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVAY4sqXTjTiVZa4jRk7CGcoCyMTs5GY3NdG5u7ht7U5vQlPkpeMgaLiYXaQmtzpTn1S9gjCuvMfzS0cKOBPM6fAoPTmqGmsaKx43QZhehqsCKDOV2JNNeHzNVFLbvp0Z9BNNzI7bqh1yg/s1600/Tenis.png" alt="Sapatos" />
                </a>
              </li>
            </ul>
          </div>

          {/* Sub Navigation */}
          <div className="sub-navigation">
            {selectedSubNav === 'gender' && (
              <ul className="display">
                <li>
                  <a 
                    className={selectedGender === 'M' ? 'nav-selected' : ''}
                    onClick={() => handleGenderClick('M')} 
                    href="#" 
                    title="Masculino"
                  >
                    <img src="https://i.imgur.com/w5pMOoA.png" alt="Masculino" />
                  </a>
                </li>
                <li>
                  <a 
                    className={selectedGender === 'F' ? 'nav-selected' : ''}
                    onClick={() => handleGenderClick('F')} 
                    href="#" 
                    title="Feminino"
                  >
                    <img src="https://i.imgur.com/0KAtbUJ.png" alt="Feminino" />
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div className="card">
            <div className="card-body">
              <div id="clothes">
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Buscar roupa..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="clothing-grid">
                  {filteredItems.map((item) => (
                    <a
                      key={item.id}
                      className={`clothes-object ${selectedCategory} ${item.rarity} ${selectedItem === item.id ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClothingClick(item.id);
                      }}
                      href="#"
                      title={item.name}
                      style={{
                        backgroundImage: `url("${getClothingImageUrl(selectedCategory, item.id, selectedColor)}")`
                      }}
                    ></a>
                  ))}
                </div>
                
                <div id="selected-clothing-name" style={{fontWeight: 'bold', marginTop: '10px'}}>
                  {filteredItems.find(item => item.id === selectedItem)?.name || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Color Palettes - Right Side */}
        <div className="editor-right">
          <div className="pincel">
            <div className="pincel-body">
              <h4 style={{marginBottom: '10px', textAlign: 'center'}}>🎨 Cores</h4>
              
              <h5 style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>Cores Básicas</h5>
              <div className="color-grid">
                {colorPalettes.nonhc.map((color) => (
                  <a
                    key={color.id}
                    href="#"
                    className={`color-object ${selectedColor === color.id ? 'selected' : ''}`}
                    style={{background: color.hex}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorClick(color.id);
                    }}
                    title={color.name}
                  ></a>
                ))}
              </div>
              
              <h5 style={{marginBottom: '8px', marginTop: '15px', fontSize: '12px', color: '#666'}}>Cores HC ⭐</h5>
              <div className="color-grid">
                {colorPalettes.hc.map((color) => (
                  <a
                    key={color.id}
                    href="#"
                    className={`color-object colorClub ${selectedColor === color.id ? 'selected' : ''}`}
                    style={{background: color.hex}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorClick(color.id);
                    }}
                    title={color.name}
                  ></a>
                ))}
              </div>
              
              <div style={{marginTop: '15px', textAlign: 'center', fontSize: '11px', color: '#666'}}>
                Cor Selecionada: <span style={{fontWeight: 'bold'}}>
                  {[...colorPalettes.nonhc, ...colorPalettes.hc].find(c => c.id === selectedColor)?.name || 'Nenhuma'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditor;