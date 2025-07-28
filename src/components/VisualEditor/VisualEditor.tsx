import React, { useState, useEffect } from 'react';

const VisualEditor: React.FC = () => {
    const [selectedHotel, setSelectedHotel] = useState('com.br');
    const [username, setUsername] = useState('ViaJovem');
    const [selectedCategory, setSelectedCategory] = useState('gender');

    return (
        <div id="editor" className="content-section active">
            <div className="habbo-panel p-6 mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Editor de Visuais Habbo</h2>
                <p className="text-lg text-gray-600">Crie e experimente diferentes looks para o seu Habbo!</p>
            </div>

            {/* Alerta sobre o perfil público */}
            <div className="alerta bg-yellow-400 text-black text-center p-4 font-bold text-base shadow-md mb-8 flex items-center justify-center rounded">
                <img 
                    alt="Alerta de perfil público" 
                    src="/assets/2190__-5kz.png" 
                    style={{ verticalAlign: 'middle', marginRight: '10px' }} 
                    className="w-8 h-8"
                />
                <span>
                    O perfil do jogador precisa estar público para o uso da ferramenta. 
                    Caso algum bug com a figura se apresente, utilize os frames para ajustar ou rotacione seu avatar.
                </span>
            </div>

            <div className="gerador habbo-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna da Esquerda: Imagem do Habbo e Hotel Selector */}
                <div className="habbo-imager flex flex-col items-center">
                    <div className="habbo-input-group mb-4">
                        <div className="habbo-editor-info-label mb-2">Hotel:</div>
                        <select 
                            id="hotel" 
                            name="hotel" 
                            className="habbo-input habbo-input-with-label w-full p-2 border rounded"
                            value={selectedHotel}
                            onChange={(e) => setSelectedHotel(e.target.value)}
                        >
                            <option value="com.br">Habbo.com.br</option>
                            <option value="com">Habbo.com</option>
                            <option value="es">Habbo.es</option>
                            <option value="com.tr">Habbo.com.tr</option>
                            <option value="fi">Habbo.fi</option>
                            <option value="fr">Habbo.fr</option>
                            <option value="de">Habbo.de</option>
                            <option value="it">Habbo.it</option>
                            <option value="nl">Habbo.nl</option>
                        </select>
                    </div>
                    
                    <a href="#" id="img_link" target="_blank" className="block w-full mb-4">
                        <div className="habbo-avatar-display-box border-2 border-gray-300 rounded-lg p-4 bg-white min-h-[200px] flex items-center justify-center">
                            <img 
                                alt="Prévia do Habbo" 
                                id="img" 
                                src={`https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?&user=${username}&action=&direction=2&head_direction=3&img_format=png&gesture=std&frame=0&headonly=0&size=m`}
                                style={{ imageRendering: 'pixelated' }}
                                className="max-w-full h-auto"
                            />
                        </div>
                    </a>

                    <div className="habbo-input-group mb-4 w-full">
                        <div className="habbo-editor-info-label mb-2">Usuário:</div>
                        <input 
                            id="usuario" 
                            placeholder="ViaJovem" 
                            name="user" 
                            type="text" 
                            className="habbo-input habbo-input-with-label w-full p-2 border rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    
                    <button id="apply-visual-btn" className="habbo-green-button w-full mt-4 bg-green-600 text-white p-3 rounded hover:bg-green-700">
                        Atualizar Avatar
                    </button>
                    <button id="copy-figure-string-btn" className="habbo-red-button w-full mt-2 bg-red-600 text-white p-3 rounded hover:bg-red-700">
                        Copiar URL da Imagem
                    </button>
                    <input 
                        type="text" 
                        id="url_img" 
                        className="habbo-input w-full mt-2 text-center text-sm p-2 border rounded bg-gray-100" 
                        readOnly 
                        value={`https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?&user=${username}&action=std&direction=2&head_direction=2&img_format=png&gesture=std&frame=0&headonly=0&size=m`}
                    />
                </div>

                {/* Coluna da Direita: Controles de Personalização */}
                <div className="personalizacao flex flex-col space-y-4">
                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Gesto:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="std">Padrão</option>
                            <option value="sit">Sentado</option>
                            <option value="lay">Deitado</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Ação:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="">Nenhuma</option>
                            <option value="wlk">Andar</option>
                            <option value="sit">Sentar</option>
                            <option value="lay">Deitar</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Direção:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="2">Frente</option>
                            <option value="4">Esquerda</option>
                            <option value="6">Direita</option>
                            <option value="0">Costas</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Direção da Cabeça:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="2">Frente</option>
                            <option value="4">Esquerda</option>
                            <option value="6">Direita</option>
                            <option value="0">Costas</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Tamanho:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="s">Pequeno</option>
                            <option value="m">Médio</option>
                            <option value="l">Grande</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Formato:</div>
                        <select className="habbo-input w-full p-2 border rounded">
                            <option value="png">PNG</option>
                            <option value="gif">GIF</option>
                        </select>
                    </div>

                    <div className="habbo-input-group">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>Apenas Cabeça</span>
                        </label>
                    </div>

                    <div className="habbo-input-group">
                        <div className="habbo-editor-info-label mb-2">Frame:</div>
                        <input type="number" min="0" max="10" defaultValue="0" className="habbo-input w-full p-2 border rounded" />
                    </div>
                </div>
            </div>

            {/* Seções de Seleção de Roupas e Cores */}
            <div className="row mt-8">
                <div className="col-md-12">
                    <div className="main-navigation mb-4">
                        <ul className="flex space-x-2 bg-gray-100 p-2 rounded">
                            <li>
                                <button 
                                    className={`px-4 py-2 rounded ${selectedCategory === 'gender' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                    onClick={() => setSelectedCategory('gender')}
                                >
                                    Gênero
                                </button>
                            </li>
                            <li>
                                <button 
                                    className={`px-4 py-2 rounded ${selectedCategory === 'hair' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                    onClick={() => setSelectedCategory('hair')}
                                >
                                    Cabelo
                                </button>
                            </li>
                            <li>
                                <button 
                                    className={`px-4 py-2 rounded ${selectedCategory === 'tops' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                    onClick={() => setSelectedCategory('tops')}
                                >
                                    Tops
                                </button>
                            </li>
                            <li>
                                <button 
                                    className={`px-4 py-2 rounded ${selectedCategory === 'bottoms' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                    onClick={() => setSelectedCategory('bottoms')}
                                >
                                    Bottoms
                                </button>
                            </li>
                            <li>
                                <button 
                                    className={`px-4 py-2 rounded ${selectedCategory === 'more' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                    onClick={() => setSelectedCategory('more')}
                                >
                                    Mais
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="sub-navigation mb-4">
                        {selectedCategory === 'gender' && (
                            <ul className="flex space-x-2">
                                <li><button className="px-3 py-1 bg-pink-200 rounded">Feminino</button></li>
                                <li><button className="px-3 py-1 bg-blue-200 rounded">Masculino</button></li>
                            </ul>
                        )}
                        {selectedCategory === 'hair' && (
                            <ul className="flex space-x-2">
                                <li><button className="px-3 py-1 bg-gray-200 rounded">Curto</button></li>
                                <li><button className="px-3 py-1 bg-gray-200 rounded">Médio</button></li>
                                <li><button className="px-3 py-1 bg-gray-200 rounded">Longo</button></li>
                            </ul>
                        )}
                    </div>

                    <div className="card bg-white rounded-lg shadow-lg" style={{ maxHeight: '325px', maxWidth: '525px', overflow: 'auto' }}>
                        <div className="card-body p-4">
                            <div id="clothes">
                                <input 
                                    type="text" 
                                    id="search-input" 
                                    placeholder="Buscar roupa..." 
                                    className="mb-4 w-full p-2 border rounded"
                                />
                                <div id="hc" className="mb-4">
                                    <h4 className="font-bold text-yellow-600 mb-2">HC</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items HC serão adicionados aqui */}
                                    </div>
                                </div>
                                <div id="sell" className="mb-4">
                                    <h4 className="font-bold text-green-600 mb-2">Vendável</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items vendáveis serão adicionados aqui */}
                                    </div>
                                </div>
                                <div id="ltd" className="mb-4">
                                    <h4 className="font-bold text-purple-600 mb-2">LTD</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items LTD serão adicionados aqui */}
                                    </div>
                                </div>
                                <div id="raro" className="mb-4">
                                    <h4 className="font-bold text-red-600 mb-2">Raro</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items raros serão adicionados aqui */}
                                    </div>
                                </div>
                                <div id="nft" className="mb-4">
                                    <h4 className="font-bold text-blue-600 mb-2">NFT</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items NFT serão adicionados aqui */}
                                    </div>
                                </div>
                                <div id="nonhc" className="mb-4">
                                    <h4 className="font-bold text-gray-600 mb-2">Não-HC</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Items não-HC serão adicionados aqui */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção de Cores */}
                <div className="col-md-12 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div id="duoTone" className="hidden">
                            <div className="card bg-white rounded-lg shadow-lg">
                                <div className="pincel-body p-4">
                                    <h4 className="font-bold mb-4">Cores DuoTone</h4>
                                    <div id="second-tone" className="grid grid-cols-8 gap-2">
                                        {/* Cores DuoTone serão adicionadas aqui */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="singleTone">
                            <div className="pincel bg-white rounded-lg shadow-lg">
                                <div className="pincel-body p-4">
                                    <h4 className="font-bold mb-4">Cores</h4>
                                    <div id="colors" className="grid grid-cols-8 gap-2">
                                        {/* Cores serão adicionadas aqui */}
                                        {Array.from({ length: 32 }, (_, i) => (
                                            <div 
                                                key={i}
                                                className="w-8 h-8 border border-gray-300 cursor-pointer hover:border-black"
                                                style={{ backgroundColor: `hsl(${i * 11}, 70%, 50%)` }}
                                                onClick={() => {/* Lógica para selecionar cor */}}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualEditor;