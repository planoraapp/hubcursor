// Mapeamento completo de imagens da ViaJovem
const realImages = {
  // UseItems (drk) - para beber
  2: 'https://i.imgur.com/1BGBH0d.png', // Suco
  3: 'https://i.imgur.com/IGVknDZ.png', // Cenoura
  4: 'https://i.imgur.com/8743wmb.png', // Sorvete de Baunilha
  5: 'https://i.imgur.com/Cfa2xdt.png', // Leite
  6: 'https://i.imgur.com/Cfa2xdt.png', // Groselha
  7: 'https://i.imgur.com/Cfa2xdt.png', // Água
  8: 'https://i.imgur.com/1BGBH0d.png', // Café
  9: 'https://i.imgur.com/1BGBH0d.png', // Café Descafeinado
  10: 'https://i.imgur.com/1BGBH0d.png', // Café com Leite
  11: 'https://i.imgur.com/1BGBH0d.png', // Mocaccino
  12: 'https://i.imgur.com/1BGBH0d.png', // Caffè Macchiato
  13: 'https://i.imgur.com/1BGBH0d.png', // Café Expresso
  14: 'https://i.imgur.com/1BGBH0d.png', // Café Preto
  15: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  16: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  17: 'https://i.imgur.com/1BGBH0d.png', // Café Java
  18: 'https://i.imgur.com/Cfa2xdt.png', // Água da Torneira
  19: 'https://i.imgur.com/sMTSwiG.png', // Suco Bubblejuice
  24: 'https://i.imgur.com/3JtoDrn.png', // Suco de Bolhas de 1978
  25: 'https://i.imgur.com/VTfFXla.png', // Poção do Amor
  26: 'https://i.imgur.com/SyjIrTP.png', // Calippo
  27: 'https://i.imgur.com/1BGBH0d.png', // Chá Árabe
  28: 'https://i.imgur.com/utYMHeX.png', // Saquê
  29: 'https://i.imgur.com/s05v9hF.png', // Suco de Tomate
  30: 'https://i.imgur.com/hLVm2nD.png', // Líquido Radioativo
  31: 'https://i.imgur.com/xzQi9tn.png', // Espumante Rosa
  32: 'https://i.imgur.com/xzQi9tn.png', // Drink de Coco
  33: 'https://i.imgur.com/sMTSwiG.png', // Refrigerante 711
  34: 'https://i.imgur.com/egp6U90.png', // Peixe
  35: 'https://i.imgur.com/4qHA9BV.png', // Champanhe
  36: 'https://i.imgur.com/0u2ZtNJ.png', // Pêra
  37: 'https://i.imgur.com/VStOTCZ.png', // Pêssego Suculento
  38: 'https://i.imgur.com/pDRtHvO.png', // Laranja
  39: 'https://i.imgur.com/AkWndvc.png', // Fatia de Queijo
  40: 'https://i.imgur.com/gekvl8o.png', // Suco de Laranja
  41: 'https://i.imgur.com/1BGBH0d.png', // Café Gourmet
  42: 'https://i.imgur.com/6BKKJUd.png', // Refrigerante de Laranja
  43: 'https://i.imgur.com/KKovhHi.png', // Habbo Refri Geladinho
  44: 'https://i.imgur.com/2xypAeW.png', // Energético Astrobar
  45: 'https://i.imgur.com/Uwby52g.png', // Goma de Mascar Amarela
  46: 'https://i.imgur.com/iW9Ub5D.png', // Goma de Mascar Verde
  47: 'https://i.imgur.com/OdYeZ21.png', // Goma de Mascar Vermelha
  48: 'https://i.imgur.com/Qf6StN8.png', // Pirulito
  49: 'https://i.imgur.com/SU1NHAB.png', // Pote de Iogurte Manchado
  50: 'https://i.imgur.com/B1QltwH.png', // Garrafa de Suco de Bolhas
  51: 'https://i.imgur.com/th9ezI9.png', // Salgadinho Grefusa
  52: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos
  53: 'https://i.imgur.com/61rJtrb.png', // Xícara de Café Expresso
  54: 'https://i.imgur.com/8St10JR.png', // Tigela de Cereais
  55: 'https://i.imgur.com/1kBUAeJ.png', // Garrafa de Pepsi
  56: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos Hot-dog
  57: 'https://i.imgur.com/s05v9hF.png', // Refrigerante de Cereja
  58: 'https://i.imgur.com/xPRXcn9.png', // Sangue fresco
  59: 'https://i.imgur.com/1Qo9v0o.png', // Saco de Moedas
  60: 'https://i.imgur.com/ImwPJAa.png', // Castanhas
  61: 'https://i.imgur.com/I0VBDys.png', // Garrafinha de Suco de Laranja
  62: 'https://i.imgur.com/kRKUkAv.png', // Água Envenenada
  63: 'https://i.imgur.com/XSaqRZp.png', // Saco de Pipocas
  64: 'https://i.imgur.com/hLVm2nD.png', // Suco de Limão
  65: 'https://i.imgur.com/61rJtrb.png', // Xícara de Café Expresso
  66: 'https://i.imgur.com/JG2Zh9L.png', // Milkshake de Banana
  67: 'https://i.imgur.com/kjDvllH.png', // Chiclete Azul
  68: 'https://i.imgur.com/iOsm5GN.png', // Chiclete Rosa
  69: 'https://i.imgur.com/DsijL6T.png', // Chiclete Verde
  70: 'https://i.imgur.com/3vCJmzZ.png', // Coxa de frango
  71: 'https://i.imgur.com/Z01e7Vm.png', // Torrada
  72: 'https://i.imgur.com/oSWfOEa.png', // Garrafinha de Suco de Pêssego e Maçã
  73: 'https://i.imgur.com/OQSV1F9.png', // Eggnog
  74: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  75: 'https://i.imgur.com/4UyBReh.png', // Sorvete de Morango
  76: 'https://i.imgur.com/T8q5q6Q.png', // Sorvete de Menta
  77: 'https://i.imgur.com/O51apy3.png', // Sorvete de Chocolate
  78: 'https://i.imgur.com/VIJmJ4J.png', // Algodão Doce Rosa
  79: 'https://i.imgur.com/2EumMVp.png', // Algodão Doce Azul
  80: 'https://i.imgur.com/eSb4TEY.png', // Cachorro-quente
  81: 'https://i.imgur.com/g5SNnOs.png', // Luneta
  82: 'https://i.imgur.com/0xvncjK.png', // Americano
  83: 'https://i.imgur.com/U5YTw0f.png', // Maçã Suculenta
  84: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  85: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  86: 'https://i.imgur.com/aIAT8v8.png', // Caneca com Água
  87: 'https://i.imgur.com/HKDAdfM.png', // Rum
  88: 'https://i.imgur.com/1c9iAfB.png', // Cupcake
  89: 'https://i.imgur.com/vfJD4FN.png', // Champanhe Rosé
  90: 'https://i.imgur.com/0Fkh9OT.png', // Chá Oriental
  91: 'https://i.imgur.com/uGcEx03.png', // Pincel
  92: 'https://i.imgur.com/NC1DyxN.png', // Goma de Mascar Vermelho
  93: 'https://i.imgur.com/cMJ1aol.png', // Goma de Mascar Rosa
  94: 'https://i.imgur.com/uLvIkBE.png', // Goma de Mascar Verde
  95: 'https://i.imgur.com/XkwghzW.png', // Goma de Mascar Azul
  96: 'https://i.imgur.com/aOcQiGg.png', // Fatia de Bolo
  97: 'https://i.imgur.com/hVV1PqK.png', // Croissant
  98: 'https://i.imgur.com/84YSA2L.png', // Tomate
  99: 'https://i.imgur.com/OQaYwKn.png', // Beringela
  100: 'https://i.imgur.com/D3T1iDy.png', // Repolho
  101: 'https://i.imgur.com/GvMNtEd.png', // Suco Borbulhante
  102: 'https://i.imgur.com/lvfv9bg.png', // Energético
  103: 'https://i.imgur.com/6BKn94N.png', // Banana
  104: 'https://i.imgur.com/ag1c9TQ.png', // Abacate
  105: 'https://i.imgur.com/hiItqwI.png', // Uvas
  106: 'https://i.imgur.com/ugS8uM3.png', // Vitamina
  107: 'https://i.imgur.com/D4O5pwc.png', // Suco de Vegetais
  108: 'https://i.imgur.com/b9bHieW.png', // Haltere
  109: 'https://i.imgur.com/LRKks9w.png', // Hamburguer
  110: 'https://i.imgur.com/lUD4B0r.png', // Carta
  111: 'https://i.imgur.com/nFJOkaj.png', // Carangueijo
  112: 'https://i.imgur.com/hzl8v5t.png', // Pimenta Malagueta
  113: 'https://i.imgur.com/eDnmJve.png', // Vitamina Cítrica
  114: 'https://i.imgur.com/OElK8Hq.png', // Vitamina Detox
  115: 'https://i.imgur.com/5L0GH2v.png', // Vitamina Framboesa
  116: 'https://i.imgur.com/Urwgzak.png', // Limão
  117: 'https://i.imgur.com/iZ6015l.png', // Cookie
  118: 'https://i.imgur.com/9rnCqKk.png', // Ramune Rosa
  119: 'https://i.imgur.com/fVs2mqq.png', // Ramune Azul
  120: 'https://i.imgur.com/zh86F72.png', // Raspadinha de Mirtilo
  121: 'https://i.imgur.com/Ju9e4bE.png', // Raspadinha de Morango
  122: 'https://i.imgur.com/Nqx4tnl.png', // Espetinho de Takoyaki
  123: 'https://i.imgur.com/7oHrfZb.png', // Caldo Forte
  124: 'https://i.imgur.com/1FvNkj2.png', // Chá Bobba Crepúsculo
  125: 'https://i.imgur.com/vdhIk6o.png', // Chá Bobba Verde
  126: 'https://i.imgur.com/SsYO5eh.png', // Chá Bobba Pink
  127: 'https://i.imgur.com/r6ZHbn4.png', // Sorvete de Casquinha
  128: 'https://i.imgur.com/jPjyRBZ.png', // Sorvete de Carvão
  129: 'https://i.imgur.com/EoRgLYY.png', // Iogurte
  130: 'https://i.imgur.com/oMn0esa.png', // Queijo
  131: 'https://i.imgur.com/WX5N0ch.png', // Pão
  132: 'https://i.imgur.com/Lxp0MNw.png', // Camarão
  133: 'https://i.imgur.com/zwK72Pd.png', // Brócolis
  134: 'https://i.imgur.com/Mopt9SD.png', // Melancia
  135: 'https://i.imgur.com/0ApPE7i.png', // Donut
  136: 'https://i.imgur.com/g5SNnOs.png', // Luneta
  137: 'https://i.imgur.com/Vd8gwFP.png', // Picolé
  138: 'https://i.imgur.com/6D7nEX7.png', // Bandeira Ditch the Label Preta
  139: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  140: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  141: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa
  142: 'https://i.imgur.com/68mQXVk.png', // Bebida Glacial
  143: 'https://i.imgur.com/CTp3zua.png', // Bandeira Ditch the Label Branca
  144: 'https://i.imgur.com/0xvncjK.png', // Americano
  145: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  146: 'https://i.imgur.com/DOAmruo.png', // Café Barista
  147: 'https://i.imgur.com/HbBXdEx.png', // Garrafa de Fanta
  148: 'https://i.imgur.com/QDCzoJT.png', // Lupa
  149: 'https://i.imgur.com/3LTCxQc.png', // Café com Chantilly
  150: 'https://i.imgur.com/hvTONBL.png', // Dalgona com Estrela
  151: 'https://i.imgur.com/FqS9Qab.png', // Dalgona com Círculo
  152: 'https://i.imgur.com/rk9cz7e.png', // Dalgona com Quadrado
  153: 'https://i.imgur.com/AURe8uR.png', // Torrada Hello Kitty
  154: 'https://i.imgur.com/Gu12HUS.png', // Poção Kryptomon Rosa
  155: 'https://i.imgur.com/5gqY9E1.png', // Refrigerante Bear
  156: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  157: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  158: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  159: 'https://i.imgur.com/pReevAV.png', // Suco de Pêra
  160: 'https://i.imgur.com/2BWnoA3.png', // handitem160
  161: 'https://i.imgur.com/VS7oBi4.png', // handitem161
  162: 'https://i.imgur.com/G1U31G2.png', // handitem162
  163: 'https://i.imgur.com/0V7AZLL.png', // Sorvete Arco-Íris
  165: 'https://i.imgur.com/S89htlF.png', // Palitinho de Marshmallow
  166: 'https://i.imgur.com/m5Gmc1b.png', // Cupcake
  167: 'https://i.imgur.com/I1mb8xq.png', // Mini Vanilla Ice Cream
  168: 'https://i.imgur.com/VLS4wXW.png', // Batata
  169: 'https://i.imgur.com/eNSOAhz.png', // Almôndegas
  170: 'https://i.imgur.com/zhBCfVQ.png', // Bolo Pato
  171: 'https://i.imgur.com/jE3xT86.png', // handitem176
  172: 'https://i.imgur.com/nWz2OMW.png', // handitem177
  
  // CarryItems (crr) - para carregar
  1000: 'https://i.imgur.com/4gM6r6C.png', // Rosa
  1001: 'https://i.imgur.com/Zlu6ifO.png', // Rosa negra
  1002: 'https://i.imgur.com/mQLKw3q.png', // Girassol
  1003: 'https://i.imgur.com/U2INTQY.png', // Livro Vermelho
  1004: 'https://i.imgur.com/fMJCUfp.png', // Livro Azul
  1005: 'https://i.imgur.com/MhMAMqQ.png', // Livro Verde
  1006: 'https://i.imgur.com/f8uG7pZ.png', // Flor de Presente
  1007: 'https://i.imgur.com/eXHHu6D.png', // Margarida Azul
  1008: 'https://i.imgur.com/ABbnvpD.png', // Margarida Amarela
  1009: 'https://i.imgur.com/RGPciQ6.png', // Margarida Rosa
  1011: 'https://i.imgur.com/kDLYfkl.png', // Prancheta
  1013: 'https://i.imgur.com/xuN1fLJ.png', // Comprimidos
  1014: 'https://i.imgur.com/u8R1Arz.png', // Seringa
  1015: 'https://i.imgur.com/YsCW8uV.png', // Bolsa de Resíduos Hospitalares
  1019: 'https://i.imgur.com/j3dHXD2.png', // Flor Bolly
  1021: 'https://i.imgur.com/SXgKTxX.png', // Jacinto Vermelho
  1022: 'https://i.imgur.com/2LnEO6a.png', // Jacinto Azul
  1023: 'https://i.imgur.com/bUo4kc0.png', // Poinsétia
  1024: 'https://i.imgur.com/A8TcY5X.png', // Panetone
  1025: 'https://i.imgur.com/UUxDAu9.png', // Bengala Doce
  1026: 'https://i.imgur.com/XbOEmiO.png', // Presente
  1027: 'https://i.imgur.com/6cTRrdL.png', // Vela Vermelha
  1028: 'https://i.imgur.com/cmsYdd4.png', // Tigela de Cereal
  1029: 'https://i.imgur.com/zcAjUIW.png', // Bexiga Bege
  1030: 'https://i.imgur.com/2bz2O5O.png', // HiPad
  1031: 'https://i.imgur.com/j36RF3O.png', // Tocha Habbolímpica
  1032: 'https://i.imgur.com/LnH1hO7.png', // Major Tom
  1033: 'https://i.imgur.com/HUOu7SX.png', // OVNI
  1034: 'https://i.imgur.com/0bm49KB.png', // Alienígena
  1035: 'https://i.imgur.com/DC9bwgO.png', // Osso
  1036: 'https://i.imgur.com/mzDcp8Q.png', // Pato de Borracha Viscoso
  1037: 'https://i.imgur.com/441jOt4.png', // Cobra
  1038: 'https://i.imgur.com/wSurn66.png', // Graveto
  1039: 'https://i.imgur.com/NFpQBxp.png', // Mão Decepada
  1040: 'https://i.imgur.com/KTvaGLH.png', // Coração Animal
  1041: 'https://i.imgur.com/cTQnLjz.png', // Lula
  1042: 'https://i.imgur.com/tOJdRTq.png', // Bat-Cocô
  1043: 'https://i.imgur.com/xDun8y8.png', // Verme
  1044: 'https://i.imgur.com/d2MSXaW.png', // Rato Morto
  1045: 'https://i.imgur.com/v7se7eU.png', // Dentadura
  1046: 'https://i.imgur.com/cVgXOXN.png', // Creme Clearasil
  1047: 'https://i.imgur.com/yMgBRfJ.png', // Pelouro
  1048: 'https://i.imgur.com/6D7nEX7.png', // Bandeira Ditch the Label Preta
  1049: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  1050: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa
  1051: 'https://i.imgur.com/uGcEx03.png', // Pincel
  1052: 'https://i.imgur.com/CTp3zua.png', // Bandeira Ditch the Label Branca
  1053: 'https://i.imgur.com/3EL82RT.png', // Pato
  1054: 'https://i.imgur.com/cllQmtf.png', // Bexiga Laranja
  1055: 'https://i.imgur.com/o06TD0y.png', // Bexiga Verde
  1056: 'https://i.imgur.com/NTQgVKL.png', // Bexiga Azul
  1057: 'https://i.imgur.com/262gZxw.png', // Bexiga Rosa
  1058: 'https://i.imgur.com/DqBzgIQ.png', // Lampião
  1059: 'https://i.imgur.com/7OVjtWi.png', // Papel Higiênico
  1060: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  1061: 'https://i.imgur.com/jCA08OY.png', // Cravo-de-tunes
  1062: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  1063: 'https://i.imgur.com/pf0yYFz.png', // Caveira de Doces Verde
  1064: 'https://i.imgur.com/EkBdALa.png', // Caveira de Doces Azul
  1065: 'https://i.imgur.com/foeO33o.png', // Boneca Emília
  1066: 'https://i.imgur.com/2KYDnrl.png', // Ursinho
  1067: 'https://i.imgur.com/7M2EfPk.png', // Soldadinho
  1068: 'https://i.imgur.com/zLfpjYf.png', // Revista de Mangá
  1069: 'https://i.imgur.com/QBwlUUd.png', // Revista em Quadrinhos
  1070: 'https://i.imgur.com/nknKfKH.png', // Livro Amarelo
  1071: 'https://i.imgur.com/Fgcdsyn.png', // HiPad Dourado
  1072: 'https://i.imgur.com/EGiNJXo.png', // Bússola
  1073: 'https://i.imgur.com/T3u15aH.png', // Ovo Dino
  1074: 'https://i.imgur.com/UHrwe8a.png', // Alossauro Verde
  1075: 'https://i.imgur.com/lbNC1v2.png', // Tricerátopo Amarelo
  1076: 'https://i.imgur.com/WmCZiqq.png', // Saurolofo Roxo
  1077: 'https://i.imgur.com/0bm49KB.png', // Alienígena
  1078: 'https://i.imgur.com/wtziU5n.png', // Espetinho de Lagartixa
  1079: 'https://i.imgur.com/se0ANSR.png', // Besouro Lucano
  1080: 'https://i.imgur.com/ZqwFSAi.png', // Besouro Rinoceronte
  1081: 'https://i.imgur.com/GtPaVOv.png', // Regador
  1082: 'https://i.imgur.com/AVLbjLD.png', // Bandeira do Orgulho
  1083: 'https://i.imgur.com/uumALYT.png', // Abóbora de Arrepiar
  1084: 'https://i.imgur.com/ZUUKd4L.png', // Sacola de Compras
  1085: 'https://i.imgur.com/2rncx7N.png', // DVD Ação
  1086: 'https://i.imgur.com/XzzGms4.png', // DVD Terror
  1087: 'https://i.imgur.com/6MYtIcr.png', // Caderno
  1088: 'https://i.imgur.com/6LMu0DK.png', // Lápis
  1089: 'https://i.imgur.com/82QgwIn.png', // Saco de Salgadinhos Lacrado
  1090: 'https://i.imgur.com/VtfRFvS.png', // Vara de Pescar com Peixe
  1091: 'https://i.imgur.com/65zXMEe.png', // Vara de Pescar com uma Bota Velha
  1092: 'https://i.imgur.com/r57dZf0.png', // Vara de Pescar com uma Mensagem na Garrafa
  1093: 'https://i.imgur.com/TbcOCsD.png', // Bandeira Ditch the Label Dourada
  1094: 'https://i.imgur.com/wZfJmho.png', // Espada
  1095: 'https://i.imgur.com/WB20uCW.png', // Coração
  1096: 'https://i.imgur.com/EIaep5m.png', // Celular
  1097: 'https://i.imgur.com/pXaI2XQ.png', // Vasinho com Muda
  1098: 'https://i.imgur.com/OT2dhUQ.png', // Robozinho
  1099: 'https://i.imgur.com/HfNo578.png', // Ursinho Teddy
  1100: 'https://i.imgur.com/9flhPhK.png', // Pato Férias
  1101: 'https://i.imgur.com/N0JwJIv.png', // Bola de Futebol
  1102: 'https://i.imgur.com/3ucrzut.png', // Taco do Diálogo
  1103: 'https://i.imgur.com/btLSfhl.png', // Bola de Tênis
  1104: 'https://i.imgur.com/Ey281Fk.png', // H-Phone
  1105: 'https://i.imgur.com/QuhGoIF.png', // Microfone DR Sports
  1106: 'https://i.imgur.com/ktQPb37.png', // Football
  1107: 'https://i.imgur.com/12G8LSK.png', // Astral Bow
  1108: 'https://i.imgur.com/NJOQWy7.png', // Virvontavitsa
  1109: 'https://i.imgur.com/1utVe0S.png', // Saco com peixe
  1110: 'https://i.imgur.com/CVtIBQR.png', // Celular
  1111: 'https://i.imgur.com/XBk4Qjm.png', // Balão de pato
  1112: 'https://i.imgur.com/NZHO8RW.png', // Console
  1113: 'https://i.imgur.com/NVkfwgw.png', // Vela
  1114: 'https://i.imgur.com/KP0IAh0.png', // Coração verde
  1115: 'https://i.imgur.com/gmVMo2i.png', // Cacau
  1116: 'https://i.imgur.com/2JrZEqZ.png', // Pato Rosa
  1117: 'https://i.imgur.com/X91bzNn.png', // Faca
};

console.log('Total de imagens mapeadas:', Object.keys(realImages).length);
console.log('UseItems:', Object.keys(realImages).filter(id => parseInt(id) < 1000).length);
console.log('CarryItems:', Object.keys(realImages).filter(id => parseInt(id) >= 1000).length);
