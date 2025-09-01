// ===== DETECÇÃO MELHORADA DE GÊNERO PARA CORPOS =====
// Sistema para identificar corretamente corpos femininos vs masculinos

const IMPROVED_GENDER_DETECTION = {
    // Corpos femininos conhecidos (com seios)
    femaleBodies: [
        // Corpos básicos femininos
        '210', '211', '212', '213', '214', '215', '216', '217', '218', '219',
        '220', '221', '222', '223', '224', '225', '226', '227', '228', '229',
        '230', '231', '232', '233', '234', '235', '236', '237', '238', '239',
        '240', '241', '242', '243', '244', '245', '246', '247', '248', '249',
        '250', '251', '252', '253', '254', '255', '256', '257', '258', '259',
        
        // Corpos especiais femininos
        '1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009',
        '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019',
        '1020', '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029',
        
        // Corpos club/HC femininos
        '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
        '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019',
        
        // Corpos sellable femininos
        '3000', '3001', '3002', '3003', '3004', '3005', '3006', '3007', '3008', '3009',
        '3010', '3011', '3012', '3013', '3014', '3015', '3016', '3017', '3018', '3019'
    ],
    
    // Corpos masculinos conhecidos (sem seios)
    maleBodies: [
        // Corpos básicos masculinos
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
        '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
        '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
        
        // Corpos especiais masculinos
        '100', '101', '102', '103', '104', '105', '106', '107', '108', '109',
        '110', '111', '112', '113', '114', '115', '116', '117', '118', '119',
        '120', '121', '122', '123', '124', '125', '126', '127', '128', '129',
        '130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
        '140', '141', '142', '143', '144', '145', '146', '147', '148', '149',
        '150', '151', '152', '153', '154', '155', '156', '157', '158', '159',
        '160', '161', '162', '163', '164', '165', '166', '167', '168', '169',
        '170', '171', '172', '173', '174', '175', '176', '177', '178', '179',
        '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
        '190', '191', '192', '193', '194', '195', '196', '197', '198', '199'
    ]
};

// Função para detectar gênero baseado no ID do corpo
function detectBodyGender(bodyId) {
    if (IMPROVED_GENDER_DETECTION.femaleBodies.includes(bodyId)) {
        return 'F';
    } else if (IMPROVED_GENDER_DETECTION.maleBodies.includes(bodyId)) {
        return 'M';
    }
    
    // Lógica inteligente para IDs não mapeados
    const numId = parseInt(bodyId);
    
    // Corpos femininos geralmente têm IDs maiores que 200
    if (numId >= 200 && numId < 1000) {
        return 'F';
    }
    
    // Corpos masculinos geralmente têm IDs menores que 200
    if (numId < 200) {
        return 'M';
    }
    
    // Para IDs muito altos, verificar padrões
    if (numId >= 1000) {
        // Corpos femininos especiais (club, sellable, etc.)
        if (numId % 2 === 0) { // IDs pares tendem a ser femininos
            return 'F';
        } else {
            return 'M';
        }
    }
    
    // Padrão padrão
    return 'M';
}

// Função para detectar gênero de qualquer item
function detectItemGender(itemId, itemType) {
    switch (itemType) {
        case 'ch': // Corpo
            return detectBodyGender(itemId);
            
        case 'hr': // Cabelo
            // Cabelos femininos conhecidos
            const femaleHairIds = ['677', '678', '832', '833', '834', '835', '836', '838', '839', '840'];
            if (femaleHairIds.includes(itemId)) {
                return 'F';
            }
            // Cabelos masculinos conhecidos
            const maleHairIds = ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109'];
            if (maleHairIds.includes(itemId)) {
                return 'M';
            }
            break;
            
        case 'hd': // Rosto
            // Rostos femininos conhecidos
            const femaleHeadIds = ['600', '605', '610', '615', '620', '625', '626', '627', '628', '629'];
            if (femaleHeadIds.includes(itemId)) {
                return 'F';
            }
            // Rostos masculinos conhecidos
            const maleHeadIds = ['190', '191', '192', '193', '194', '195', '196', '197', '198', '199'];
            if (maleHeadIds.includes(itemId)) {
                return 'M';
            }
            break;
    }
    
    // Lógica padrão baseada no ID
    const numId = parseInt(itemId);
    if (numId >= 600) {
        return 'F';
    }
    return 'M';
}

// Exportar funções
window.IMPROVED_GENDER_DETECTION = IMPROVED_GENDER_DETECTION;
window.detectBodyGender = detectBodyGender;
window.detectItemGender = detectItemGender;
