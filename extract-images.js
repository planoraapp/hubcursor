const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configurações
const SWF_DIR = './habbo-clothes/gordon/flash-assets-PRODUCTION-202508202352-144965391';
const OUTPUT_DIR = './extracted-images';
const MAX_CONCURRENT = 5; // Máximo de extrações simultâneas

// Criar diretório de saída se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Função para extrair imagens de um SWF
async function extractImagesFromSwf(swfPath) {
    const swfName = path.basename(swfPath, '.swf');
    const outputPath = path.join(OUTPUT_DIR, swfName);
    
    try {
        // Criar diretório para este SWF
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
        
        // Comando para extrair imagens usando swf-extract
        const command = `swf-extract -i "${swfPath}" -o "${outputPath}" --images`;
        
        console.log(`Extraindo imagens de: ${swfName}`);
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            console.warn(`Avisos para ${swfName}:`, stderr);
        }
        
        // Verificar se foram extraídas imagens
        const files = fs.readdirSync(outputPath);
        const imageFiles = files.filter(file => 
            file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
        );
        
        if (imageFiles.length > 0) {
            console.log(`✅ ${swfName}: ${imageFiles.length} imagens extraídas`);
            return {
                swf: swfName,
                images: imageFiles,
                count: imageFiles.length,
                success: true
            };
        } else {
            console.log(`⚠️  ${swfName}: Nenhuma imagem extraída`);
            return {
                swf: swfName,
                images: [],
                count: 0,
                success: false
            };
        }
        
    } catch (error) {
        console.error(`❌ Erro ao extrair ${swfName}:`, error.message);
        return {
            swf: swfName,
            images: [],
            count: 0,
            success: false,
            error: error.message
        };
    }
}

// Função para processar SWFs em lotes
async function processSwfBatch(swfFiles, batchSize = MAX_CONCURRENT) {
    const results = [];
    
    for (let i = 0; i < swfFiles.length; i += batchSize) {
        const batch = swfFiles.slice(i, i + batchSize);
        console.log(`\n--- Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(swfFiles.length / batchSize)} ---`);
        
        const batchPromises = batch.map(swfPath => extractImagesFromSwf(swfPath));
        const batchResults = await Promise.all(batchPromises);
        
        results.push(...batchResults);
        
        // Aguardar um pouco entre lotes para não sobrecarregar
        if (i + batchSize < swfFiles.length) {
            console.log('Aguardando 2 segundos antes do próximo lote...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    return results;
}

// Função principal
async function main() {
    try {
        console.log('🎮 Iniciando extração de imagens dos SWFs do Habbo...');
        console.log(`📁 Diretório SWF: ${SWF_DIR}`);
        console.log(`📁 Diretório de saída: ${OUTPUT_DIR}`);
        
        // Verificar se o diretório SWF existe
        if (!fs.existsSync(SWF_DIR)) {
            throw new Error(`Diretório SWF não encontrado: ${SWF_DIR}`);
        }
        
        // Listar todos os arquivos SWF
        const swfFiles = fs.readdirSync(SWF_DIR)
            .filter(file => file.endsWith('.swf'))
            .map(file => path.join(SWF_DIR, file));
        
        console.log(`\n📊 Total de arquivos SWF encontrados: ${swfFiles.length}`);
        
        if (swfFiles.length === 0) {
            console.log('Nenhum arquivo SWF encontrado. Verifique o diretório.');
            return;
        }
        
        // Mostrar alguns exemplos
        console.log('\n📋 Exemplos de SWFs:');
        swfFiles.slice(0, 5).forEach(swf => {
            console.log(`  - ${path.basename(swf)}`);
        });
        if (swfFiles.length > 5) {
            console.log(`  ... e mais ${swfFiles.length - 5} arquivos`);
        }
        
        // Confirmar antes de continuar
        console.log('\n⚠️  Esta operação pode demorar vários minutos e extrair centenas de imagens.');
        console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Processar SWFs
        const startTime = Date.now();
        const results = await processSwfBatch(swfFiles);
        const endTime = Date.now();
        
        // Relatório final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO FINAL DA EXTRAÇÃO');
        console.log('='.repeat(60));
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const totalImages = results.reduce((sum, r) => sum + r.count, 0);
        
        console.log(`⏱️  Tempo total: ${((endTime - startTime) / 1000).toFixed(1)} segundos`);
        console.log(`📁 SWFs processados: ${results.length}`);
        console.log(`✅ Sucessos: ${successful.length}`);
        console.log(`❌ Falhas: ${failed.length}`);
        console.log(`🖼️  Total de imagens extraídas: ${totalImages}`);
        
        if (successful.length > 0) {
            console.log('\n🏆 TOP 10 SWFs com mais imagens:');
            const topSwfs = successful
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            
            topSwfs.forEach((swf, index) => {
                console.log(`  ${index + 1}. ${swf.swf}: ${swf.count} imagens`);
            });
        }
        
        if (failed.length > 0) {
            console.log('\n⚠️  SWFs com falha:');
            failed.slice(0, 10).forEach(swf => {
                console.log(`  - ${swf.swf}: ${swf.error || 'Erro desconhecido'}`);
            });
        }
        
        // Salvar relatório em arquivo
        const reportPath = path.join(OUTPUT_DIR, 'extraction-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            totalSwfs: results.length,
            successful: successful.length,
            failed: failed.length,
            totalImages: totalImages,
            duration: endTime - startTime,
            results: results
        }, null, 2));
        
        console.log(`\n📄 Relatório salvo em: ${reportPath}`);
        console.log('\n🎉 Extração concluída! As imagens estão em:', OUTPUT_DIR);
        
    } catch (error) {
        console.error('❌ Erro durante a extração:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { extractImagesFromSwf, processSwfBatch };
