/**
 * Sistema de Tradução de Emblemas
 * 
 * Como os emblemas vêm da API do Habbo em português,
 * este utilitário traduz os nomes e descrições mais comuns
 * para inglês e espanhol quando necessário.
 */

export interface BadgeTranslation {
  name: {
    pt: string;
    en: string;
    es: string;
  };
  description: {
    pt: string;
    en: string;
    es: string;
  };
}

// Dicionário de traduções dos emblemas mais comuns
export const commonBadgeTranslations: Record<string, BadgeTranslation> = {
  // Achievement Badges - Registration Duration
  'ACH_RegistrationDuration6': {
    name: {
      pt: '30 % Habbo de verdade VI',
      en: '30% True Habbo VI',
      es: '30% Habbo de verdad VI'
    },
    description: {
      pt: 'É membro da comunidade há 56 dias.',
      en: 'Has been a member of the community for 56 days.',
      es: 'Es miembro de la comunidad desde hace 56 días.'
    }
  },
  
  // Social Badges
  'ACH_TradingPass4': {
    name: {
      pt: 'Amigável',
      en: 'Friendly',
      es: 'Amigable'
    },
    description: {
      pt: 'Por distribuir 2 Estrelas de Cristal a outros Habbos.',
      en: 'For giving 2 Crystal Stars to other Habbos.',
      es: 'Por distribuir 2 Estrellas de Cristal a otros Habbos.'
    }
  },

  'ACH_RoomDecoHosting8': {
    name: {
      pt: 'Anfitrião VIII',
      en: 'Host VIII',
      es: 'Anfitrión VIII'
    },
    description: {
      pt: 'Habbos gastaram 750 minutos em meu Quarto',
      en: 'Habbos spent 750 minutes in my Room',
      es: 'Los Habbos pasaron 750 minutos en mi Sala'
    }
  },

  'ACH_RoomDecoFurniCount17': {
    name: {
      pt: 'Arquiteto XVII',
      en: 'Architect XVII',
      es: 'Arquitecto XVII'
    },
    description: {
      pt: 'Por construir um Quarto com 240 Mobi.',
      en: 'For building a Room with 240 Furni.',
      es: 'Por construir una Sala con 240 Furni.'
    }
  },

  'ACH_RoomDecoFurniTypeCount9': {
    name: {
      pt: 'Colecionador de Mobis IX',
      en: 'Furni Collector IX',
      es: 'Coleccionista de Furnis IX'
    },
    description: {
      pt: 'Por construir um Quarto com 59 diferentes Mobis.',
      en: 'For building a Room with 59 different Furni.',
      es: 'Por construir una Sala con 59 Furnis diferentes.'
    }
  },

  'ACH_TradingPass2': {
    name: {
      pt: 'Curiosidade noob.',
      en: 'Noob Curiosity',
      es: 'Curiosidad novato'
    },
    description: {
      pt: 'Por passar 120 minutos no Hotel.',
      en: 'For spending 120 minutes in the Hotel.',
      es: 'Por pasar 120 minutos en el Hotel.'
    }
  },

  'ACH_Tutorial1': {
    name: {
      pt: 'Dando um rolê!',
      en: 'Taking a Tour!',
      es: '¡Dando una vuelta!'
    },
    description: {
      pt: 'Por dar uma volta pelo Hotel.',
      en: 'For taking a tour around the Hotel.',
      es: 'Por dar una vuelta por el Hotel.'
    }
  },

  'ACH_RoomDecoLandscape1': {
    name: {
      pt: 'Designer de Interiores',
      en: 'Interior Designer',
      es: 'Diseñador de Interiores'
    },
    description: {
      pt: 'Por mudar o Fundo do seu quarto.',
      en: 'For changing your room Background.',
      es: 'Por cambiar el Fondo de tu sala.'
    }
  },

  'ACH_RoomDecoBC8': {
    name: {
      pt: 'Designer do Clube do Arquiteto VIII',
      en: "Builder's Club Designer VIII",
      es: 'Diseñador del Club del Constructor VIII'
    },
    description: {
      pt: 'Por decorar um quarto com 250 itens do Clube do Arquiteto.',
      en: "For decorating a room with 250 Builder's Club items.",
      es: 'Por decorar una sala con 250 artículos del Club del Constructor.'
    }
  },

  'ACH_Tutorial2': {
    name: {
      pt: 'Eu comigo mesmo.',
      en: 'Me, Myself and I',
      es: 'Yo conmigo mismo'
    },
    description: {
      pt: 'Por conferir o seu próprio perfil.',
      en: 'For checking your own profile.',
      es: 'Por revisar tu propio perfil.'
    }
  },

  'ACH_TradingPass5': {
    name: {
      pt: 'Explorar salas',
      en: 'Explore Rooms',
      es: 'Explorar salas'
    },
    description: {
      pt: 'Por visitar 20 salas de outros Habbos.',
      en: 'For visiting 20 rooms of other Habbos.',
      es: 'Por visitar 20 salas de otros Habbos.'
    }
  },

  'ACH_TagC1': {
    name: {
      pt: 'Ice Ice Baby I',
      en: 'Ice Ice Baby I',
      es: 'Ice Ice Baby I'
    },
    description: {
      pt: 'Patinei no gelo durante 3 minutos.',
      en: 'Skated on ice for 3 minutes.',
      es: 'Patinó sobre hielo durante 3 minutos.'
    }
  },

  'ACH_GamePlayerExperience2': {
    name: {
      pt: 'Jogador II',
      en: 'Player II',
      es: 'Jugador II'
    },
    description: {
      pt: 'Ganhou 250 pontos da vitória.',
      en: 'Earned 250 victory points.',
      es: 'Ganó 250 puntos de victoria.'
    }
  },

  'ACH_BattleBallPlayer3': {
    name: {
      pt: 'Jogador Battle Banzai III',
      en: 'Battle Banzai Player III',
      es: 'Jugador Battle Banzai III'
    },
    description: {
      pt: 'Por jogar Battle Banzai.',
      en: 'For playing Battle Banzai.',
      es: 'Por jugar Battle Banzai.'
    }
  },

  'ACH_Tutorial4': {
    name: {
      pt: 'Lar, doce lar.',
      en: 'Home, Sweet Home',
      es: 'Hogar, dulce hogar'
    },
    description: {
      pt: 'Por conferir as configurações de quarto.',
      en: 'For checking room settings.',
      es: 'Por revisar la configuración de la sala.'
    }
  },

  'ACH_LegDay5': {
    name: {
      pt: 'Leg Day V',
      en: 'Leg Day V',
      es: 'Día de Piernas V'
    },
    description: {
      pt: 'Por caminhar 700 quadrados',
      en: 'For walking 700 tiles',
      es: 'Por caminar 700 casillas'
    }
  },

  'ACH_AvatarLooks1': {
    name: {
      pt: 'Lindo de Morrer',
      en: 'Drop Dead Gorgeous',
      es: 'Guapo a Morir'
    },
    description: {
      pt: 'Por mudar o visual pela primeira vez.',
      en: 'For changing your look for the first time.',
      es: 'Por cambiar tu apariencia por primera vez.'
    }
  },

  'ACH_TimeSpentRoomTypeChat7': {
    name: {
      pt: 'Mega Tagarela VII',
      en: 'Mega Chatterbox VII',
      es: 'Mega Parlanchín VII'
    },
    description: {
      pt: 'Por estar dentro de um chat / discussão ou sala pública por 720 minutos.',
      en: 'For being in a chat/discussion or public room for 720 minutes.',
      es: 'Por estar en un chat/discusión o sala pública durante 720 minutos.'
    }
  },

  'ACH_HC1': {
    name: {
      pt: 'Membro Habbo Club I',
      en: 'Habbo Club Member I',
      es: 'Miembro Habbo Club I'
    },
    description: {
      pt: 'Por ser membro do Habbo Club por 14 dias.',
      en: 'For being a Habbo Club member for 14 days.',
      es: 'Por ser miembro del Habbo Club durante 14 días.'
    }
  },

  'ACH_BuildersClub2': {
    name: {
      pt: 'Membro do Clube do Arquiteto II',
      en: "Builder's Club Member II",
      es: 'Miembro del Club del Constructor II'
    },
    description: {
      pt: 'Por ser membro do Clube do Arquiteto por 31 dias',
      en: "For being a Builder's Club member for 31 days",
      es: 'Por ser miembro del Club del Constructor durante 31 días'
    }
  },

  'ACH_Tutorial5': {
    name: {
      pt: 'Mobiliando',
      en: 'Furnishing',
      es: 'Amueblando'
    },
    description: {
      pt: 'Por mover, girar, escolher ou colocar Mobis nos seus quartos.',
      en: 'For moving, rotating, picking up or placing Furni in your rooms.',
      es: 'Por mover, rotar, recoger o colocar Furnis en tus salas.'
    }
  },

  'ACH_SelfModDoorModeSeen1': {
    name: {
      pt: 'Modo Porta',
      en: 'Door Mode',
      es: 'Modo Puerta'
    },
    description: {
      pt: 'Me liguei nas opções de modo de porta',
      en: 'Checked out the door mode options',
      es: 'Revisé las opciones del modo puerta'
    }
  },

  'ACH_TradingPass7': {
    name: {
      pt: 'Muito prazer!',
      en: 'Nice to Meet You!',
      es: '¡Mucho gusto!'
    },
    description: {
      pt: 'Por fazer 2 amizades.',
      en: 'For making 2 friendships.',
      es: 'Por hacer 2 amistades.'
    }
  },

  'ACH_TradeCount1': {
    name: {
      pt: 'Negociador Experiente I',
      en: 'Experienced Trader I',
      es: 'Comerciante Experimentado I'
    },
    description: {
      pt: 'Por completar 5 negociações. Hora de fazer Habbo rico!',
      en: 'For completing 5 trades. Time to make Habbo rich!',
      es: 'Por completar 5 intercambios. ¡Hora de hacer rico a Habbo!'
    }
  },

  'ACH_Profile_Gimmegimme_4': {
    name: {
      pt: 'Oba Oba IV',
      en: 'Gimme Gimme IV',
      es: 'Dame Dame IV'
    },
    description: {
      pt: 'Por pegar o seu presente diário 9 vezes.',
      en: 'For claiming your daily gift 9 times.',
      es: 'Por reclamar tu regalo diario 9 veces.'
    }
  },

  'ACH_Tutorial3': {
    name: {
      pt: 'Olá povo!',
      en: 'Hello People!',
      es: '¡Hola gente!'
    },
    description: {
      pt: 'Por escrever uma linha de chat e publicá-la.',
      en: 'For writing and posting a chat line.',
      es: 'Por escribir y publicar una línea de chat.'
    }
  },

  'ACH_TimeSpentRoomTypeRPG5': {
    name: {
      pt: 'Para sempre em serviço V',
      en: 'Forever on Duty V',
      es: 'Siempre en servicio V'
    },
    description: {
      pt: 'Por estar dentro de uma agência ou sala de RPG por 180 minutos.',
      en: 'For being in an agency or RPG room for 180 minutes.',
      es: 'Por estar en una agencia o sala de RPG durante 180 minutos.'
    }
  },

  'ACH_AllTimeHotelPresence8': {
    name: {
      pt: 'Passou tempo no Hotel VIII- Ciclone',
      en: 'Spent Time in Hotel VIII - Cyclone',
      es: 'Pasó tiempo en el Hotel VIII - Ciclón'
    },
    description: {
      pt: 'Por passar o total de 2160 min. no Hotel.',
      en: 'For spending a total of 2160 min. in the Hotel.',
      es: 'Por pasar un total de 2160 min. en el Hotel.'
    }
  },

  'ACH_Name1': {
    name: {
      pt: 'Por mudar ou confirmar seu nome Habbo.',
      en: 'For changing or confirming your Habbo name.',
      es: 'Por cambiar o confirmar tu nombre Habbo.'
    },
    description: {
      pt: 'O que será isso afinal?',
      en: 'What is this after all?',
      es: '¿Qué será esto después de todo?'
    }
  },

  'ACH_HappyHour1': {
    name: {
      pt: 'Por participar de uma festa',
      en: 'For joining a party',
      es: 'Por participar de una fiesta'
    },
    description: {
      pt: 'Por entrar no Hotel durante o HappyHour.',
      en: 'For entering the Hotel during HappyHour.',
      es: 'Por entrar al Hotel durante la HappyHour.'
    }
  },

  'ACH_TradingPass3': {
    name: {
      pt: 'Revisitar',
      en: 'Revisit',
      es: 'Revisitar'
    },
    description: {
      pt: 'Por ser um membro por 3 dias.',
      en: 'For being a member for 3 days.',
      es: 'Por ser miembro durante 3 días.'
    }
  },

  'ACH_SkateBoardJump9': {
    name: {
      pt: 'Saltador de Skate IX',
      en: 'Skateboard Jumper IX',
      es: 'Saltador de Skate IX'
    },
    description: {
      pt: 'Por dar 475 pulos na sua prancha de skate.',
      en: 'For doing 475 jumps on your skateboard.',
      es: 'Por dar 475 saltos en tu patineta.'
    }
  },

  'ACH_TradingPass6': {
    name: {
      pt: 'Salto de nível',
      en: 'Level Jump',
      es: 'Salto de nivel'
    },
    description: {
      pt: 'Por atigir o nível 6 do seu avatar.',
      en: 'For reaching level 6 of your avatar.',
      es: 'Por alcanzar el nivel 6 de tu avatar.'
    }
  },

  'ACH_TagB2': {
    name: {
      pt: 'Skatista Veloz II',
      en: 'Fast Skater II',
      es: 'Patinador Veloz II'
    },
    description: {
      pt: 'Alcance-me se for capaz! Capturado 4 vezes!',
      en: 'Catch me if you can! Caught 4 times!',
      es: '¡Atrápame si puedes! ¡Capturado 4 veces!'
    }
  },

  'ACH_FriendListSize1': {
    name: {
      pt: 'Socializador I',
      en: 'Socializer I',
      es: 'Socializador I'
    },
    description: {
      pt: 'Por ter 2 amigos na sua lista de amigos',
      en: 'For having 2 friends in your friends list',
      es: 'Por tener 2 amigos en tu lista de amigos'
    }
  },

  'ACH_SkateBoardSlide6': {
    name: {
      pt: 'Surfista de Skate VI',
      en: 'Skateboard Surfer VI',
      es: 'Surfista de Skate VI'
    },
    description: {
      pt: 'Por fazer 480 manobras na sua prancha de skate.',
      en: 'For doing 480 tricks on your skateboard.',
      es: 'Por hacer 480 maniobras en tu patineta.'
    }
  },

  'ACH_TradingPass1': {
    name: {
      pt: 'Tutorial',
      en: 'Tutorial',
      es: 'Tutorial'
    },
    description: {
      pt: 'Por completar o tutorial.',
      en: 'For completing the tutorial.',
      es: 'Por completar el tutorial.'
    }
  },

  'ACH_BattleBallWinner3': {
    name: {
      pt: 'Vencedor Battle Banzai III',
      en: 'Battle Banzai Winner III',
      es: 'Ganador Battle Banzai III'
    },
    description: {
      pt: 'Por ganhar 240 pontos vencedores no Battle Banzai',
      en: 'For earning 240 winning points in Battle Banzai',
      es: 'Por ganar 240 puntos ganadores en Battle Banzai'
    }
  },

  'ACH_RoomEntry2': {
    name: {
      pt: 'Visitando Quartos II',
      en: 'Visiting Rooms II',
      es: 'Visitando Salas II'
    },
    description: {
      pt: 'Por visitar 20 Quartos de outras pessoas.',
      en: 'For visiting 20 other people\'s Rooms.',
      es: 'Por visitar 20 Salas de otras personas.'
    }
  },

  'ACH_EmailVerification1': {
    name: {
      pt: 'Você é de verdade I',
      en: 'You Are Real I',
      es: 'Eres real I'
    },
    description: {
      pt: 'Por confirmar seu email. Obrigado!',
      en: 'For confirming your email. Thank you!',
      es: 'Por confirmar tu correo. ¡Gracias!'
    }
  },

  'ACH_HabboExplorer1': {
    name: {
      pt: 'É assim que funciona',
      en: 'This Is How It Works',
      es: 'Así es como funciona'
    },
    description: {
      pt: 'Por usar um Mobi (dica: duplo clique/toque).',
      en: 'For using a Furni (hint: double click/tap).',
      es: 'Por usar un Furni (pista: doble clic/toque).'
    }
  }
};

/**
 * Traduz nome e descrição de um emblema baseado no idioma selecionado
 */
export function translateBadge(
  badgeCode: string,
  originalName: string,
  originalDescription: string,
  language: 'pt' | 'en' | 'es'
): { name: string; description: string } {
  // Se o emblema está no dicionário, retornar tradução
  if (commonBadgeTranslations[badgeCode]) {
    return {
      name: commonBadgeTranslations[badgeCode].name[language],
      description: commonBadgeTranslations[badgeCode].description[language]
    };
  }

  // Se não está no dicionário, retornar o original
  return {
    name: originalName,
    description: originalDescription
  };
}

/**
 * Verifica se um emblema tem tradução disponível
 */
export function hasBadgeTranslation(badgeCode: string): boolean {
  return badgeCode in commonBadgeTranslations;
}
