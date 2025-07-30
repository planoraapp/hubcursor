
// emblemas.js
document.addEventListener('DOMContentLoaded', () => {
    const emblemasContainer = document.querySelector('.grid.grid-cols-3.sm\\:grid-cols-4.md\\:grid-cols-5.lg\\:grid-cols-6.xl\\:grid-cols-7.gap-4');
    const errorMessage = document.querySelector('.text-red-600.text-center');
    const searchInput = document.querySelector('input[type="text"]');
    
    const loadingMessage = document.createElement('p');
    loadingMessage.classList.add('text-center', 'text-gray-500', 'col-span-full');
    loadingMessage.textContent = 'Carregando emblemas...';

    const HABBO_ASSETS_API_URL = 'https://www.habboassets.com/api/v1/badges';

    let allBadges = [];
    let filteredBadges = [];
    let offset = 0;
    const limit = 1000;
    let allBadgesLoaded = false;
    let isLoading = false;

    async function carregarEmblemas(loadMore = false) {
        if ((allBadgesLoaded && loadMore) || isLoading) {
            return;
        }

        isLoading = true;

        if (!loadMore) {
            if (emblemasContainer) emblemasContainer.innerHTML = '';
            offset = 0;
            allBadgesLoaded = false;
            allBadges = [];
        }

        if (emblemasContainer && !emblemasContainer.contains(loadingMessage)) {
            emblemasContainer.appendChild(loadingMessage);
        }
        loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';

        try {
            const requestUrl = `${HABBO_ASSETS_API_URL}?limit=${limit}&offset=${offset}&order=asc`;
            console.log(`Buscando: ${requestUrl}`);

            const response = await fetch(requestUrl);

            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            const data = await response.json();
            const newEmblemas = data.badges || data;

            if (newEmblemas && Array.isArray(newEmblemas) && newEmblemas.length > 0) {
                allBadges = [...allBadges, ...newEmblemas];
                
                if (emblemasContainer.contains(loadingMessage)) {
                    emblemasContainer.removeChild(loadingMessage);
                }
                
                filtrarEExibirEmblemas();
                offset += newEmblemas.length;

                if (newEmblemas.length < limit) {
                    allBadgesLoaded = true;
                }
            } else {
                if (!loadMore) {
                    if (emblemasContainer) emblemasContainer.innerHTML = '';
                    if (errorMessage) {
                        errorMessage.textContent = 'Nenhum emblema encontrado. Verifique a API ou tente novamente mais tarde.';
                        errorMessage.style.display = 'block';
                    }
                } else {
                    allBadgesLoaded = true;
                }
                if (emblemasContainer.contains(loadingMessage)) {
                    emblemasContainer.removeChild(loadingMessage);
                }
            }

        } catch (error) {
            console.error('Falha ao carregar emblemas:', error);
            if (emblemasContainer) emblemasContainer.innerHTML = '';
            if (errorMessage) {
                errorMessage.textContent = 'Não foi possível carregar os emblemas devido a um erro de conexão. Tente novamente mais tarde.';
                errorMessage.style.display = 'block';
            }
            if (emblemasContainer.contains(loadingMessage)) {
                emblemasContainer.removeChild(loadingMessage);
            }
        } finally {
            isLoading = false;
        }
    }

    function filtrarEExibirEmblemas() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        if (searchTerm) {
            filteredBadges = allBadges.filter(badge => 
                (badge.name && badge.name.toLowerCase().includes(searchTerm)) ||
                (badge.code && badge.code.toLowerCase().includes(searchTerm)) ||
                (badge.description && badge.description.toLowerCase().includes(searchTerm))
            );
        } else {
            filteredBadges = [...allBadges];
        }

        exibirEmblemas(filteredBadges);
    }

    function exibirEmblemas(emblemas) {
        if (!emblemasContainer) return;

        // Limpa apenas os emblemas, mantém a mensagem de carregamento se necessário
        const existingBadges = emblemasContainer.querySelectorAll('.badge-item');
        existingBadges.forEach(badge => badge.remove());

        emblemas.forEach(emblema => {
            const divEmblema = document.createElement('div');
            divEmblema.classList.add('badge-item', 'flex', 'flex-col', 'items-center', 'p-2', 'bg-gray-200', 'rounded-lg', 'shadow-sm', 'cursor-pointer', 'hover:shadow-md', 'transition-shadow', 'duration-200', 'relative');
            
            const imageUrl = emblema.image || emblema.url || `https://images.habbo.com/c_images/album1584/${emblema.code}.png`;
            
            divEmblema.innerHTML = `
                <img src="${imageUrl}" alt="${emblema.name || 'Emblema'}" class="w-16 h-16 object-contain" loading="lazy" onerror="this.src='/assets/emblemas.png'">
            `;

            // Adicionar evento de clique para modal (se necessário)
            divEmblema.addEventListener('click', () => {
                mostrarDetalhesEmblema(emblema);
            });

            emblemasContainer.appendChild(divEmblema);
        });

        if (emblemas.length === 0 && searchInput && searchInput.value.trim()) {
            const noResults = document.createElement('p');
            noResults.classList.add('text-gray-500', 'text-center', 'col-span-full', 'p-4');
            noResults.textContent = 'Nenhum emblema encontrado para sua pesquisa.';
            emblemasContainer.appendChild(noResults);
        }
    }

    function mostrarDetalhesEmblema(emblema) {
        // Implementar modal de detalhes se necessário
        alert(`Emblema: ${emblema.name || 'Nome não disponível'}\nCódigo: ${emblema.code || 'N/A'}\nDescrição: ${emblema.description || 'Sem descrição'}`);
    }

    // Event listener para busca
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filtrarEExibirEmblemas();
        });
    }

    // Scroll infinito
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200 && !allBadgesLoaded && !isLoading) {
            carregarEmblemas(true);
        }
    });

    // Carregar emblemas iniciais
    carregarEmblemas();
});
