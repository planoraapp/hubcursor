import fs from 'fs';

// Script para extrair IDs de calças, sapatos e cintos do HTML fornecido

// IDs de calças masculinas (lg)
const malePantsNormalIds = [270, 275, 280, 281, 285, 3023, 3078, 3088, 3116, 3201, 3216, 3290];
const malePantsHcIds = [3017, 3057, 3058, 3136, 3138, 3202, 3235, 3257];
const malePantsSellableIds = [
  3320, 3328, 3333, 3337, 3341, 3353, 3355, 3361, 3364, 3365, 3384, 3387, 3391, 3401, 3407, 3408, 3418, 3434, 3449, 3460, 3483, 3521, 3526, 3596, 3607, 3626, 3695, 3781, 3787, 3842, 3864, 3915, 3924, 3933, 3950, 3968, 4002, 4011, 4012, 4017, 4034, 4066, 4081, 4082, 4083, 4092, 4102, 4113, 4114, 4119, 4125, 4138, 4167, 4191, 4306, 4309, 4312, 4315, 4341, 4358, 4369, 4373, 4375, 4934
];

// IDs de calças femininas (lg)
const femalePantsNormalIds = [695, 696, 700, 705, 710, 715, 716, 720, 3023, 3078, 3088, 3116, 3216];
const femalePantsHcIds = [827, 3006, 3017, 3018, 3019, 3047, 3057, 3058, 3061, 3134, 3136, 3138, 3166, 3174, 3190, 3191, 3192, 3198, 3200, 3202, 3235, 3257, 3267, 3282, 3283, 3502];
const femalePantsSellableIds = [
  3320, 3328, 3333, 3337, 3341, 3353, 3355, 3361, 3364, 3365, 3384, 3387, 3391, 3401, 3407, 3408, 3418, 3434, 3449, 3460, 3483, 3521, 3526, 3596, 3607, 3626, 3695, 3781, 3787, 3842, 3864, 3915, 3924, 3933, 3950, 3968, 4002, 4011, 4012, 4017, 4034, 4066, 4081, 4082, 4083, 4092, 4102, 4113, 4114, 4119, 4125, 4138, 4167, 4191, 4306, 4309, 4312, 4315, 4341, 4358, 4369, 4373, 4375, 4934
];

// IDs de sapatos masculinos (sh)
const maleShoesNormalIds = [290, 295, 300, 305, 905, 906, 908, 3068, 3115];
const maleShoesHcIds = [3016, 3027, 3035, 3089, 3154, 3206, 3252, 3275];
const maleShoesSellableIds = [
  3338, 3348, 3354, 3375, 3383, 3419, 3435, 3467, 3524, 3587, 3595, 3611, 3619, 3621, 3687, 3693, 3719, 3720, 3783, 4016, 4030, 4064, 4065, 4112, 4159
];

// IDs de sapatos femininos (sh)
const femaleShoesNormalIds = [725, 730, 735, 740, 905, 906, 907, 908, 3068, 3115];
const femaleShoesHcIds = [3016, 3027, 3035, 3064, 3089, 3154, 3180, 3184, 3206, 3252, 3275, 3277];
const femaleShoesSellableIds = [
  3338, 3348, 3354, 3375, 3383, 3419, 3435, 3467, 3524, 3587, 3595, 3611, 3619, 3621, 3687, 3693, 3719, 3720, 3783, 4016, 4030, 4064, 4065, 4112, 4159
];

// IDs de cintos masculinos (wa)
const maleBeltsNormalIds = [2001, 2002, 2004, 2006, 2007, 2008, 2009, 2011, 2012, 3074, 3211];
const maleBeltsHcIds = [2003, 2005, 3072, 3073, 3080, 3212, 3263, 3264];
const maleBeltsSellableIds = [3359, 3366, 3427, 3504, 3661, 3773, 3798, 3872, 3895, 4040, 4060, 4317];

// IDs de cintos femininos (wa)
const femaleBeltsNormalIds = [2001, 2002, 2004, 2006, 2007, 2008, 2009, 2011, 2012, 3074, 3210];
const femaleBeltsHcIds = [2003, 2005, 2010, 3072, 3073, 3080, 3178, 3212, 3263, 3264];
const femaleBeltsSellableIds = [3359, 3366, 3427, 3504, 3661, 3773, 3798, 3872, 3895, 4040, 4060, 4317];

// Combinar todos os IDs
const categoriesData = {
  lg: {
    male: {
      normal: malePantsNormalIds,
      hc: malePantsHcIds,
      sellable: malePantsSellableIds
    },
    female: {
      normal: femalePantsNormalIds,
      hc: femalePantsHcIds,
      sellable: femalePantsSellableIds
    }
  },
  sh: {
    male: {
      normal: maleShoesNormalIds,
      hc: maleShoesHcIds,
      sellable: maleShoesSellableIds
    },
    female: {
      normal: femaleShoesNormalIds,
      hc: femaleShoesHcIds,
      sellable: femaleShoesSellableIds
    }
  },
  wa: {
    male: {
      normal: maleBeltsNormalIds,
      hc: maleBeltsHcIds,
      sellable: maleBeltsSellableIds
    },
    female: {
      normal: femaleBeltsNormalIds,
      hc: femaleBeltsHcIds,
      sellable: femaleBeltsSellableIds
    }
  }
};

// Salvar os dados extraídos
fs.writeFileSync('pants_shoes_belts_ids_extracted.json', JSON.stringify(categoriesData, null, 2));

console.log('Dados extraídos salvos em pants_shoes_belts_ids_extracted.json');
console.log('Estatísticas:');
console.log(`Calças masculinas: ${malePantsNormalIds.length + malePantsHcIds.length + malePantsSellableIds.length}`);
console.log(`Calças femininas: ${femalePantsNormalIds.length + femalePantsHcIds.length + femalePantsSellableIds.length}`);
console.log(`Sapatos masculinos: ${maleShoesNormalIds.length + maleShoesHcIds.length + maleShoesSellableIds.length}`);
console.log(`Sapatos femininos: ${femaleShoesNormalIds.length + femaleShoesHcIds.length + femaleShoesSellableIds.length}`);
console.log(`Cintos masculinos: ${maleBeltsNormalIds.length + maleBeltsHcIds.length + maleBeltsSellableIds.length}`);
console.log(`Cintos femininos: ${femaleBeltsNormalIds.length + femaleBeltsHcIds.length + femaleBeltsSellableIds.length}`);