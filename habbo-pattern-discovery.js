// SISTEMA DE DESCOBERTA DE PADRÕES DO HABBO IMAGING
// Testa diferentes IDs e tipos para encontrar os padrões corretos

class HabboPatternDiscovery {
    constructor() {
        this.baseUrl = 'https://www.habbo.com/habbo-imaging/avatarimage';
        this.testResults = {};
        this.validPatterns = {};
    }

    // Testar diferentes tipos de cabeça (hd)
    async testHeadPatterns() {
        console.log('🔍 Testando padrões de cabeça (hd)...');
        const headIds = [180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250];
        const headColors = [7, 8, 9, 10, 11, 12, 13, 14, 15];
        
        for (const id of headIds) {
            for (const color of headColors) {
                const figure = `hd-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Cabeça válida encontrada: hd-${id}-${color}-`);
                        if (!this.validPatterns.head) this.validPatterns.head = [];
                        this.validPatterns.head.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Testar diferentes tipos de cabelo (hr)
    async testHairPatterns() {
        console.log('🔍 Testando padrões de cabelo (hr)...');
        const hairIds = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170];
        const hairColors = [7, 8, 9, 10, 11, 12, 13, 14, 15];
        
        for (const id of hairIds) {
            for (const color of hairColors) {
                const figure = `hr-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Cabelo válido encontrado: hr-${id}-${color}-`);
                        if (!this.validPatterns.hair) this.validPatterns.hair = [];
                        this.validPatterns.hair.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Testar diferentes tipos de chapéu (ha)
    async testHatPatterns() {
        console.log('🔍 Testando padrões de chapéu (ha)...');
        const hatIds = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010];
        const hatColors = [7, 8, 9, 10, 11, 12, 13, 14, 15];
        
        for (const id of hatIds) {
            for (const color of hatColors) {
                const figure = `ha-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Chapéu válido encontrado: ha-${id}-${color}-`);
                        if (!this.validPatterns.hats) this.validPatterns.hats = [];
                        this.validPatterns.hats.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Testar diferentes tipos de camisa (ch)
    async testShirtPatterns() {
        console.log('🔍 Testando padrões de camisa (ch)...');
        const shirtIds = [210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280];
        const shirtColors = [66, 67, 68, 69, 70, 71, 72, 73, 74, 75];
        
        for (const id of shirtIds) {
            for (const color of shirtColors) {
                const figure = `ch-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Camisa válida encontrada: ch-${id}-${color}-`);
                        if (!this.validPatterns.shirts) this.validPatterns.shirts = [];
                        this.validPatterns.shirts.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Testar diferentes tipos de calça (lg)
    async testPantsPatterns() {
        console.log('🔍 Testando padrões de calça (lg)...');
        const pantsIds = [270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284];
        const pantsColors = [82, 83, 84, 85, 86, 87, 88, 89, 90, 91];
        
        for (const id of pantsIds) {
            for (const color of pantsColors) {
                const figure = `lg-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Calça válida encontrada: lg-${id}-${color}-`);
                        if (!this.validPatterns.pants) this.validPatterns.pants = [];
                        this.validPatterns.pants.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Testar diferentes tipos de sapato (sh)
    async testShoesPatterns() {
        console.log('🔍 Testando padrões de sapato (sh)...');
        const shoesIds = [290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304];
        const shoesColors = [80, 81, 82, 83, 84, 85, 86, 87, 88, 89];
        
        for (const id of shoesIds) {
            for (const color of shoesColors) {
                const figure = `sh-${id}-${color}-`;
                const url = `${this.baseUrl}?figure=${figure}&gender=m&size=m`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        console.log(`✅ Sapato válido encontrado: sh-${id}-${color}-`);
                        if (!this.validPatterns.shoes) this.validPatterns.shoes = [];
                        this.validPatterns.shoes.push({ id, color, figure });
                    }
                } catch (error) {
                    // Ignorar erros de rede
                }
            }
        }
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🚀 Iniciando descoberta de padrões do Habbo Imaging...');
        
        await this.testHeadPatterns();
        await this.testHairPatterns();
        await this.testHatPatterns();
        await this.testShirtPatterns();
        await this.testPantsPatterns();
        await this.testShoesPatterns();
        
        console.log('✅ Descoberta concluída!');
        console.log('📊 Padrões válidos encontrados:', this.validPatterns);
        
        // Salvar resultados no localStorage
        localStorage.setItem('habboValidPatterns', JSON.stringify(this.validPatterns));
        
        return this.validPatterns;
    }

    // Gerar relatório dos padrões encontrados
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalPatterns: 0,
            patternsByCategory: {},
            recommendations: []
        };

        Object.entries(this.validPatterns).forEach(([category, patterns]) => {
            report.patternsByCategory[category] = {
                count: patterns.length,
                patterns: patterns
            };
            report.totalPatterns += patterns.length;
        });

        // Recomendações baseadas nos padrões encontrados
        if (report.patternsByCategory.head && report.patternsByCategory.head.count > 0) {
            report.recommendations.push(`✅ Cabeças: ${report.patternsByCategory.head.count} padrões válidos encontrados`);
        }
        if (report.patternsByCategory.hair && report.patternsByCategory.hair.count > 0) {
            report.recommendations.push(`✅ Cabelos: ${report.patternsByCategory.hair.count} padrões válidos encontrados`);
        }
        if (report.patternsByCategory.hats && report.patternsByCategory.hats.count > 0) {
            report.recommendations.push(`✅ Chapéus: ${report.patternsByCategory.hats.count} padrões válidos encontrados`);
        }
        if (report.patternsByCategory.shirts && report.patternsByCategory.shirts.count > 0) {
            report.recommendations.push(`✅ Camisas: ${report.patternsByCategory.shirts.count} padrões válidos encontrados`);
        }
        if (report.patternsByCategory.pants && report.patternsByCategory.pants.count > 0) {
            report.recommendations.push(`✅ Calças: ${report.patternsByCategory.pants.count} padrões válidos encontrados`);
        }
        if (report.patternsByCategory.shoes && report.patternsByCategory.shoes.count > 0) {
            report.recommendations.push(`✅ Sapatos: ${report.patternsByCategory.shoes.count} padrões válidos encontrados`);
        }

        return report;
    }
}

// Função para iniciar a descoberta
async function startPatternDiscovery() {
    const discovery = new HabboPatternDiscovery();
    const patterns = await discovery.runAllTests();
    const report = discovery.generateReport();
    
    console.log('📋 RELATÓRIO DE DESCOBERTA:');
    console.log(report);
    
    // Exibir resultados na página
    displayDiscoveryResults(report);
    
    return patterns;
}

// Exibir resultados na página
function displayDiscoveryResults(report) {
    const resultsDiv = document.getElementById('discovery-results');
    if (!resultsDiv) return;
    
    let html = '<h3>🔍 Resultados da Descoberta de Padrões</h3>';
    html += `<p><strong>Total de padrões válidos:</strong> ${report.totalPatterns}</p>`;
    html += '<hr>';
    
    Object.entries(report.patternsByCategory).forEach(([category, data]) => {
        html += `<h4>${category.toUpperCase()}</h4>`;
        html += `<p><strong>Padrões encontrados:</strong> ${data.count}</p>`;
        
        if (data.patterns.length > 0) {
            html += '<ul>';
            data.patterns.slice(0, 10).forEach(pattern => {
                html += `<li>${pattern.figure}</li>`;
            });
            if (data.patterns.length > 10) {
                html += `<li>... e mais ${data.patterns.length - 10} padrões</li>`;
            }
            html += '</ul>';
        }
        html += '<hr>';
    });
    
    if (report.recommendations.length > 0) {
        html += '<h4>✅ Recomendações:</h4>';
        html += '<ul>';
        report.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul>';
    }
    
    resultsDiv.innerHTML = html;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HabboPatternDiscovery = HabboPatternDiscovery;
    window.startPatternDiscovery = startPatternDiscovery;
}
