// avatarEditor.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const myHabboImg = document.getElementById('myHabbo');
    const avatarContainer = document.getElementById('avatar-container');
    
    if (!myHabboImg || !avatarContainer) {
        console.error('Elementos essenciais não encontrados no DOM');
        return;
    }

    const rotateHeadLeftBtn = avatarContainer.querySelector('div:first-child > div:first-child');
    const rotateBodyLeftBtn = avatarContainer.querySelector('div:first-child > div:last-child');
    const rotateHeadRightBtn = avatarContainer.querySelector('div:last-child > div:first-child');
    const rotateBodyRightBtn = avatarContainer.querySelector('div:last-child > div:last-child');
    const randomizeBtn = document.querySelector('button.bg-blue-500');
    const copyFullUrlBtn = document.querySelector('button.text-sm:first-of-type');
    const copyFaceUrlBtn = document.querySelector('button.text-sm:last-of-type');
    const hotelSelector = document.querySelector('select');
    const usernameInput = document.querySelector('input[placeholder="Nome de Usuário"]');
    const genderButtons = document.querySelectorAll('.flex.flex-row.h-\\[2\\.5rem\\].shadow-inner.bg-gray-200.justify-evenly button');
    
    const categoryButtons = document.querySelectorAll('.grid.grid-cols-4.sm\\:grid-cols-8.lg\\:grid-cols-8.h-\\[2\\.5rem\\] button');
    const itemsDisplayArea = document.querySelector('.flex.flex-wrap.justify-center.max-h-\\[26\\.5rem\\]');
    const colorSelectorArea = document.querySelector('.flex.flex-col.h-\\[29rem\\].overflow-y-auto');

    // --- Variáveis de Estado do Avatar ---
    const DEFAULT_FIGURE_M = "hd-180-61.hr-3791-45.ch-3030-61.lg-3138-61.sh-905-61";
    const DEFAULT_FIGURE_F = "hd-180-1.hr-828-42.ch-665-92.lg-700-1.sh-705-1";

    let currentFigure = DEFAULT_FIGURE_M;
    let currentGender = "M";
    let currentDirection = 2;
    let currentHeadDirection = 3;
    let currentAction = "std";
    let currentGesture = "std";
    let currentSize = "l";
    let currentHotel = "habbo.com.br";
    let currentCategory = "hd";

    // --- URLs Base ---
    const HABBO_IMAGING_BASE_URL = (hotel) => `https://${hotel}/habbo-imaging/avatarimage?`;
    const HABBO_API_PROFILE_URL = (username, hotelCode) => `https://www.habbo.com/api/public/users?name=${username}`;
    
    // URL da Edge Function - ATUALIZE COM SEU PROJECT REF
    const FIGURE_PARTS_API_URL = 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/get-habbo-figures';

    let allFigurePartsData = {};
    let allColorsData = {};
    
    const categoryPrefixMap = {
        'Rosto & Corpo': 'hd',
        'Cabelos': 'hr',
        'Parte de cima': 'ch',
        'Parte de baixo': 'lg',
        'Sapatos': 'sh',
        'Chapéus': 'he',
        'Acessórios Cabelo': 'ea', 
        'Óculos': 'fa' 
    };

    // --- Funções Auxiliares ---
    function generateAvatarUrl(figure, gender, direction, headDirection, action, gesture, frame, size, hotel) {
        return `${HABBO_IMAGING_BASE_URL(hotel)}figure=${figure}&gender=${gender}&direction=${direction}&head_direction=${headDirection}&action=${action}&gesture=${gesture}&frame=${frame}&size=${size}&headonly=0&img_format=png`;
    }

    function updateAvatarImage() {
        const url = generateAvatarUrl(currentFigure, currentGender, currentDirection, currentHeadDirection, currentAction, currentGesture, 0, currentSize, currentHotel);
        myHabboImg.src = url;
        console.log('Avatar atualizado:', url);
    }

    function getFigurePartCurrent(figureString, partPrefix) {
        const regex = new RegExp(`(^|\\.)(${partPrefix}-\\d+(?:-\\d+)?)(?=\\.|$)`);
        const match = figureString.match(regex);
        return match ? match[2] : '';
    }

    function setFigurePart(figureString, partPrefix, newPartId, newColorCode = null) {
        let newFigure = figureString;
        const currentPartRegex = new RegExp(`(^|\\.)(${partPrefix}-\\d+(?:-\\d+)?)(?=\\.|$)`);
        const existingPartMatch = newFigure.match(currentPartRegex);

        let partToInsert = `${partPrefix}-${newPartId}`;
        if (newColorCode !== null) {
            partToInsert += `-${newColorCode}`;
        } else {
            const currentPartWithColor = getFigurePartCurrent(figureString, partPrefix);
            const currentPartColor = getColorCodeFromFigurePart(currentPartWithColor);
            if (currentPartColor && getPartIdFromCode(currentPartWithColor) === newPartId) {
                partToInsert += `-${currentPartColor}`;
            }
        }

        if (existingPartMatch) {
            newFigure = newFigure.replace(existingPartMatch[0], `${existingPartMatch[1]}${partToInsert}`);
        } else {
            newFigure += (newFigure.length > 0 ? '.' : '') + partToInsert;
        }
        return newFigure;
    }

    function getPartIdFromCode(figureCode) {
        const parts = figureCode.split('-');
        if (parts.length >= 2) {
            return parts[1];
        }
        return '';
    }

    function getColorCodeFromFigurePart(figurePartString) {
        const parts = figurePartString.split('-');
        if (parts.length >= 3) {
            return parts[2];
        }
        return null;
    }

    async function loadFigurePartsData() {
        try {
            console.log('Carregando dados das peças de roupa...');
            const response = await fetch(FIGURE_PARTS_API_URL);
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status}`);
            }
            const data = await response.json();
            allFigurePartsData = data.figureParts;
            
            allColorsData = data.colors.reduce((acc, color) => {
                acc[color.id] = color;
                return acc;
            }, {});

            console.log("Dados de visuais carregados:", Object.keys(allFigurePartsData));
            console.log("Cores carregadas:", Object.keys(allColorsData).length);

            renderItems(currentCategory);
            updateAvatarImage();
        } catch (error) {
            console.error('Failed to load figure parts:', error);
            if (itemsDisplayArea) {
                itemsDisplayArea.innerHTML = `<p class="text-red-600 text-center col-span-full p-4">Erro ao carregar peças de roupa. Tente novamente mais tarde.</p>`;
            }
        }
    }

    function renderItems(category) {
        if (!itemsDisplayArea) return;
        
        itemsDisplayArea.innerHTML = '';
        if (colorSelectorArea) {
            colorSelectorArea.innerHTML = '<p class="text-gray-500 text-sm text-center p-4">Selecione uma peça de roupa no menu para alterar sua cor.</p>';
        }
        
        const items = allFigurePartsData[category] || [];

        const filteredItems = items.filter(item => {
            if (item.gender === 'U') return true;
            if (currentGender === 'M' && item.gender === 'M') return true;
            if (currentGender === 'F' && item.gender === 'F') return true;
            return false;
        });

        const groupedItems = filteredItems.reduce((acc, item) => {
            const type = item.type || 'NORMAL';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(item);
            return acc;
        }, {});

        const typeOrder = ['NORMAL', 'HC', 'SELLABLE', 'NFT'];

        for (const type of typeOrder) {
            if (groupedItems[type] && groupedItems[type].length > 0) {
                const typeHeader = document.createElement('h4');
                typeHeader.classList.add('font-bold', 'mb-2', 'p-2', 'text-sm', 'w-full');
                typeHeader.textContent = type;
                if (type === 'NORMAL') typeHeader.classList.add('text-gray-600');
                if (type === 'HC') typeHeader.classList.add('text-yellow-600');
                if (type === 'SELLABLE') typeHeader.classList.add('text-green-600');
                if (type === 'NFT') typeHeader.classList.add('text-blue-600');
                itemsDisplayArea.appendChild(typeHeader);

                const grid = document.createElement('div');
                grid.classList.add('grid', 'grid-cols-4', 'sm:grid-cols-6', 'lg:grid-cols-4', 'gap-2', 'w-full', 'mb-4');

                groupedItems[type].forEach(item => {
                    const itemButton = document.createElement('button');
                    itemButton.classList.add('relative', 'rounded-full', 'w-12', 'h-12', 'sm:w-14', 'sm:h-14', 'bg-gray-200', 'cursor-pointer', 'hover:shadow-inner', 'hover:bg-gray-300');
                    itemButton.title = item.name;

                    itemButton.innerHTML = `
                        ${item.club ? '<img class="absolute z-10 top-0 left-0 h-3 w-3 sm:h-4 sm:w-4" src="https://habbodefense.com/wp-content/uploads/2024/03/hc_icon.png" alt="hc icon">' : ''}
                        ${item.type === 'NFT' ? '<img class="absolute z-10 top-0 left-0 h-3 w-3 sm:h-4 sm:w-4" src="https://habbodefense.com/wp-content/uploads/2024/03/nft_icon.png" alt="nft icon">' : ''}
                        <div class="absolute rounded-full z-0 w-full h-full overflow-hidden">
                            <img loading="lazy" src="${item.previewUrl}" alt="${item.name}" class="w-full h-full object-contain" style="transform: translateY(-2px);" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNjY2MiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0iY2VudGVyIiBmb250LXNpemU9IjgiIGZpbGw9IiM5OTkiPj88L3RleHQ+Cjwvc3ZnPg==';">
                        </div>
                    `;

                    itemButton.addEventListener('click', () => {
                        const currentFigurePart = getFigurePartCurrent(currentFigure, category);
                        let currentColor = getColorCodeFromFigurePart(currentFigurePart);
                        
                        if (!currentColor && item.colors && item.colors.length > 0) {
                            currentColor = item.colors[0];
                        } else if (!currentColor) {
                            currentColor = '1';
                        }

                        currentFigure = setFigurePart(currentFigure, category, item.id, currentColor);
                        updateAvatarImage();
                        renderColorOptions(item, category);
                    });
                    grid.appendChild(itemButton);
                });
                itemsDisplayArea.appendChild(grid);
            }
        }
        
        if (filteredItems.length === 0) {
             itemsDisplayArea.innerHTML = `<p class="text-gray-500 text-center col-span-full p-4">Nenhum item encontrado para esta categoria e gênero.</p>`;
        }
    }

    function renderColorOptions(selectedItem, category) {
        if (!colorSelectorArea) return;
        
        colorSelectorArea.innerHTML = '';

        const colorsToDisplay = selectedItem.colors || [];
        
        if (colorsToDisplay.length === 0) {
            colorSelectorArea.innerHTML = `<p class="text-gray-500 text-sm text-center p-4">Nenhuma opção de cor para esta peça.</p>`;
            return;
        }

        const title = document.createElement('h3');
        title.classList.add('font-bold', 'text-center', 'p-2', 'text-sm');
        title.textContent = `Cores para ${selectedItem.name}`;
        colorSelectorArea.appendChild(title);

        const colorGrid = document.createElement('div');
        colorGrid.classList.add('grid', 'grid-cols-5', 'gap-2', 'p-4');

        colorsToDisplay.forEach(colorId => {
            const color = allColorsData[colorId];
            if (color) {
                const colorButton = document.createElement('button');
                colorButton.classList.add('w-8', 'h-8', 'rounded-full', 'border', 'border-gray-300', 'cursor-pointer', 'hover:scale-110', 'transition-transform');
                colorButton.style.backgroundColor = `#${color.hex}`;
                colorButton.title = color.name || `Cor ${colorId}`;

                colorButton.addEventListener('click', () => {
                    currentFigure = setFigurePart(currentFigure, category, selectedItem.id, color.id);
                    updateAvatarImage();
                });
                colorGrid.appendChild(colorButton);
            }
        });
        colorSelectorArea.appendChild(colorGrid);
    }

    // --- Event Listeners ---
    if (rotateHeadLeftBtn) {
        rotateHeadLeftBtn.addEventListener('click', () => {
            currentHeadDirection = (currentHeadDirection - 1 + 8) % 8;
            updateAvatarImage();
        });
    }

    if (rotateHeadRightBtn) {
        rotateHeadRightBtn.addEventListener('click', () => {
            currentHeadDirection = (currentHeadDirection + 1) % 8;
            updateAvatarImage();
        });
    }

    if (rotateBodyLeftBtn) {
        rotateBodyLeftBtn.addEventListener('click', () => {
            currentDirection = (currentDirection - 1 + 8) % 8;
            updateAvatarImage();
        });
    }

    if (rotateBodyRightBtn) {
        rotateBodyRightBtn.addEventListener('click', () => {
            currentDirection = (currentDirection + 1) % 8;
            updateAvatarImage();
        });
    }

    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', () => {
            const partsToRandomize = Object.keys(allFigurePartsData);
            let newFigure = '';
            currentGender = Math.random() < 0.5 ? 'M' : 'F';
            
            partsToRandomize.forEach(partType => {
                const availableParts = allFigurePartsData[partType].filter(item => {
                    if (item.gender === 'U') return true;
                    if (currentGender === 'M' && item.gender === 'M') return true;
                    if (currentGender === 'F' && item.gender === 'F') return true;
                    return false;
                });

                if (availableParts && availableParts.length > 0) {
                    const randomPart = availableParts[Math.floor(Math.random() * availableParts.length)];
                    let randomColor = '1';
                    if (randomPart.colors && randomPart.colors.length > 0) {
                        randomColor = randomPart.colors[Math.floor(Math.random() * randomPart.colors.length)];
                    }
                    newFigure = setFigurePart(newFigure, partType, randomPart.id, randomColor);
                }
            });
            
            currentFigure = newFigure || (currentGender === 'M' ? DEFAULT_FIGURE_M : DEFAULT_FIGURE_F);
            currentDirection = Math.floor(Math.random() * 8);
            currentHeadDirection = Math.floor(Math.random() * 8);
            
            // Atualizar botão de gênero
            genderButtons.forEach(btn => {
                btn.classList.remove('bg-gray-100', 'shadow-md');
                const img = btn.querySelector('img');
                if (img) {
                    const btnGender = img.alt === 'Masculino' ? 'M' : 'F';
                    if (btnGender === currentGender) {
                        btn.classList.add('bg-gray-100', 'shadow-md');
                    }
                }
            });
            
            updateAvatarImage();
            renderItems(currentCategory);
            alert('Avatar aleatorizado!');
        });
    }

    if (copyFullUrlBtn) {
        copyFullUrlBtn.addEventListener('click', () => {
            const url = generateAvatarUrl(currentFigure, currentGender, currentDirection, currentHeadDirection, currentAction, currentGesture, 0, currentSize, currentHotel);
            navigator.clipboard.writeText(url)
                .then(() => alert('URL completa copiada!'))
                .catch(err => console.error('Erro ao copiar URL:', err));
        });
    }

    if (copyFaceUrlBtn) {
        copyFaceUrlBtn.addEventListener('click', () => {
            const headOnlyUrl = generateAvatarUrl(currentFigure, currentGender, currentDirection, currentHeadDirection, currentAction, currentGesture, 0, currentSize, currentHotel).replace('headonly=0', 'headonly=1');
            navigator.clipboard.writeText(headOnlyUrl)
                .then(() => alert('URL do rosto copiada!'))
                .catch(err => console.error('Erro ao copiar URL do rosto:', err));
        });
    }

    if (hotelSelector) {
        hotelSelector.addEventListener('change', (event) => {
            currentHotel = event.target.value;
            updateAvatarImage();
        });
    }

    // Botões de gênero
    genderButtons.forEach(button => {
        button.addEventListener('click', () => {
            genderButtons.forEach(btn => btn.classList.remove('bg-gray-100', 'shadow-md'));
            button.classList.add('bg-gray-100', 'shadow-md');

            const img = button.querySelector('img');
            if (img) {
                const newGender = img.alt === 'Masculino' ? 'M' : 'F';
                if (currentGender !== newGender) {
                    currentGender = newGender;
                    currentFigure = newGender === 'M' ? DEFAULT_FIGURE_M : DEFAULT_FIGURE_F;
                    updateAvatarImage();
                    renderItems(currentCategory);
                }
            }
        });
    });

    // Botões de categoria
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('bg-gray-100', 'shadow-inner'));
            button.classList.add('bg-gray-100', 'shadow-inner');

            const img = button.querySelector('img');
            if (img) {
                const altText = img.alt;
                const newCategory = categoryPrefixMap[altText];

                if (newCategory) {
                    currentCategory = newCategory;
                    renderItems(currentCategory);
                }
            }
        });
    });

    // Buscar usuário
    if (usernameInput) {
        usernameInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const username = usernameInput.value.trim();
                if (username) {
                    try {
                        const response = await fetch(`${HABBO_API_PROFILE_URL(username)}`);
                        if (!response.ok) {
                            throw new Error(`Usuário não encontrado! Status: ${response.status}`);
                        }
                        const userData = await response.json();
                        
                        // A API retorna um array
                        const user = Array.isArray(userData) ? userData[0] : userData;
                        
                        if (user && user.figureString) {
                            currentFigure = user.figureString;
                            // A API pode não retornar gênero diretamente, então vamos manter o atual ou tentar detectar
                            
                            updateAvatarImage();
                            renderItems(currentCategory);
                            alert(`Visual de ${username} carregado com sucesso!`);
                        } else {
                            alert(`Não foi possível obter o visual de ${username}.`);
                        }
                    } catch (error) {
                        console.error('Erro ao buscar usuário:', error);
                        alert(`Erro ao buscar usuário: ${error.message}`);
                    }
                }
            }
        });
    }

    // --- Inicialização ---
    loadFigurePartsData();
    
    // Ativar categoria inicial
    const initialCategoryButton = Array.from(categoryButtons).find(button => {
        const img = button.querySelector('img');
        return img && img.alt.includes('Rosto & Corpo');
    });
    if (initialCategoryButton) {
        initialCategoryButton.classList.add('bg-gray-100', 'shadow-inner');
    }

    // Ativar gênero inicial
    const initialGenderButton = Array.from(genderButtons).find(button => {
        const img = button.querySelector('img');
        return img && img.alt === 'Masculino';
    });
    if (initialGenderButton) {
        initialGenderButton.classList.add('bg-gray-100', 'shadow-md');
    }

    // Atualizar imagem inicial
    updateAvatarImage();
});
