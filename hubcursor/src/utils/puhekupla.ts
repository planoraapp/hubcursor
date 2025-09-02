// Utilities for generating Puhekupla CDN image URLs and parsing swfName
// Reference patterns (examples provided by user):
// https://content.puhekupla.com/img/clothes/shirt_F_dressinggown_front.png
// https://content.puhekupla.com/img/clothes/hair_U_summermanbun_front.png
// https://content.puhekupla.com/img/clothes/hat_U_cathat2_front.png
// acc_* categories are also supported: acc_head, acc_eye, acc_face, acc_chest, acc_waist

export type PuhekuplaView = 'front' | 'front_right' | 'side' | 'back' | 'back_left';

export interface ParsedSwfName {
  prefix: string; // e.g., shirt, jacket, trousers, hair, hat, shoes, acc_head, acc_eye, acc_face, acc_chest, acc_waist, face
  gender: 'M' | 'F' | 'U';
  code: string; // e.g., dressinggown
}

// Normalize some common aliases to Puhekupla prefixes
const PREFIX_NORMALIZATION: Record<string, string> = {
  ch: 'shirt',
  shirt: 'shirt',
  top: 'shirt',
  cc: 'jacket',
  jacket: 'jacket',
  coat: 'jacket',
  lg: 'trousers',
  trousers: 'trousers',
  pants: 'trousers',
  sh: 'shoes',
  shoes: 'shoes',
  hr: 'hair',
  hair: 'hair',
  ha: 'hat',
  hat: 'hat',
  ea: 'acc_eye',
  glasses: 'acc_eye',
  acc_eye: 'acc_eye',
  fa: 'acc_face',
  acc_face: 'acc_face',
  ca: 'acc_chest',
  acc_chest: 'acc_chest',
  wa: 'acc_waist',
  acc_waist: 'acc_waist',
  hd: 'face',
  face: 'face',
  ey: 'face',
  fc: 'face',
  bd: 'face',
};

export const parseSwfName = (swfName: string): ParsedSwfName | null => {
  if (!swfName) return null;
  // Expected formats:
  //   prefix_G_code
  //   prefix_G_code_extra_parts (keep everything after gender as code joined with _)
  // Some sources might include category/figureId like ch_665_foo → handle gracefully
  const parts = swfName.split('_');
  if (parts.length < 3) return null;

  // The first token may be an alias like 'ch' that needs normalization
  const rawPrefix = String(parts[0]).toLowerCase();
  const prefix = PREFIX_NORMALIZATION[rawPrefix] || rawPrefix;
  const genderToken = String(parts[1]).toUpperCase();
  const gender = (genderToken === 'M' || genderToken === 'F' || genderToken === 'U') ? genderToken : 'U';

  const code = parts.slice(2).join('_');
  return { prefix, gender, code };
};

export const getPuhekuplaThumbFromSwf = (swfName: string, view: PuhekuplaView = 'front'): string | null => {
  const parsed = parseSwfName(swfName);
  if (!parsed) return null;
  const { prefix, gender, code } = parsed;
  // Construct URL
  // Example: https://content.puhekupla.com/img/clothes/shirt_F_dressinggown_front.png
  const base = 'https://content.puhekupla.com/img/clothes';
  return `${base}/${prefix}_${gender}_${code}_${view}.png`;
};

// Small helper to test if a Puhekupla URL likely exists
export const guessPuhekuplaExists = (swfName: string): boolean => {
  return !!parseSwfName(swfName);
};
