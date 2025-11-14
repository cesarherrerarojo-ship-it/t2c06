/**
 * Portuguese (Português) translations for TuCitaSegura
 */

export const translations = {
  // Common
  common: {
    appName: 'SeuEncontroSeguro',
    welcome: 'Bem-vindo',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    more: 'Mais',
    less: 'Menos',
    all: 'Tudo',
    none: 'Nenhum',
    or: 'ou',
    and: 'e',

    time: {
      justNow: 'Agora mesmo',
      minutesAgo: 'Há {count} minutos',
      hoursAgo: 'Há {count} horas',
      daysAgo: 'Há {count} dias',
      weeksAgo: 'Há {count} semanas'
    },

    gender: {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    }
  },

  // Authentication
  auth: {
    login: {
      title: 'Entrar',
      subtitle: 'Encontre seu relacionamento sério',
      email: 'E-mail',
      emailPlaceholder: 'seu@email.com',
      password: 'Senha',
      passwordPlaceholder: 'Sua senha',
      submit: 'Entrar',
      forgotPassword: 'Esqueceu sua senha?',
      noAccount: 'Não tem uma conta?',
      signUp: 'Cadastre-se'
    },

    register: {
      title: 'Criar Conta',
      subtitle: 'Junte-se ao SeuEncontroSeguro',
      alias: 'Nome de usuário',
      aliasPlaceholder: 'Como você quer ser chamado',
      birthDate: 'Data de nascimento',
      gender: 'Gênero',
      terms: 'Aceito os termos e condições',
      submit: 'Criar conta',
      hasAccount: 'Já tem uma conta?',
      signIn: 'Entrar'
    },

    verification: {
      title: 'Verifique seu e-mail',
      message: 'Enviamos um link de verificação para {email}',
      resend: 'Reenviar e-mail',
      verified: 'E-mail verificado com sucesso'
    },

    logout: 'Sair'
  },

  // Profile
  profile: {
    title: 'Meu Perfil',
    edit: 'Editar Perfil',
    photo: 'Foto de perfil',
    photos: 'Minhas fotos',
    bio: 'Biografia',
    bioPlaceholder: 'Conte-nos sobre você (mínimo 120 palavras)...',
    location: 'Localização',
    age: '{age} anos',
    reputation: 'Reputação',
    member: 'Membro desde',
    theme: 'Tema',
    language: 'Idioma',

    reputations: {
      BRONCE: 'Bronze',
      PLATA: 'Prata',
      ORO: 'Ouro',
      PLATINO: 'Platina'
    },

    sections: {
      basic: 'Informações Básicas',
      photos: 'Fotos',
      preferences: 'Preferências',
      privacy: 'Privacidade',
      account: 'Conta',
      payments: 'Pagamentos'
    },

    stats: {
      matches: 'Matches',
      conversations: 'Conversas',
      dates: 'Encontros',
      badges: 'Conquistas'
    }
  },

  // Search
  search: {
    title: 'Buscar Usuários',
    filters: 'Filtros',
    results: 'Resultados',
    noResults: 'Nenhum usuário encontrado',
    distance: 'Distância',
    age: 'Idade',
    ageRange: '{min} - {max} anos',
    distanceRange: '{distance} km',
    viewMap: 'Ver mapa',
    viewGrid: 'Ver lista',
    sortBy: 'Ordenar por',

    sorts: {
      distance: 'Distância',
      newest: 'Mais recentes',
      active: 'Mais ativos',
      reputation: 'Reputação'
    }
  },

  // Matches & Conversations
  matches: {
    title: 'Meus Matches',
    pending: 'Pendentes',
    accepted: 'Aceitos',
    rejected: 'Rejeitados',
    sendRequest: 'Enviar solicitação',
    accept: 'Aceitar',
    reject: 'Rejeitar',
    cancel: 'Cancelar solicitação',

    request: {
      sent: 'Solicitação enviada',
      received: '{name} quer se conectar com você',
      accepted: 'Match confirmado com {name}!',
      rejected: 'Solicitação rejeitada'
    }
  },

  conversations: {
    title: 'Conversas',
    empty: 'Você não tem conversas',
    startChat: 'Iniciar chat',
    newMessage: 'Nova mensagem',
    typing: '{name} está digitando...',
    online: 'Online',
    offline: 'Offline',
    lastSeen: 'Visto por último {time}'
  },

  chat: {
    title: 'Chat',
    typeMessage: 'Digite uma mensagem...',
    send: 'Enviar',
    proposeDate: 'Propor encontro',
    viewProfile: 'Ver perfil',
    block: 'Bloquear',
    report: 'Denunciar',

    dateProposal: {
      title: 'Propor um encontro',
      date: 'Data',
      time: 'Hora',
      place: 'Local',
      placePlaceholder: 'Restaurante, café, parque...',
      message: 'Mensagem (opcional)',
      submit: 'Enviar proposta',

      received: '{name} propôs um encontro',
      details: 'Detalhes do encontro:',
      accept: 'Aceitar encontro',
      decline: 'Recusar',
      accepted: 'Encontro aceito',
      declined: 'Encontro recusado'
    }
  },

  // Dates/Appointments
  dates: {
    title: 'Meus Encontros',
    upcoming: 'Próximos',
    past: 'Passados',
    confirmed: 'Confirmados',
    pending: 'Pendentes',
    canceled: 'Cancelados',
    completed: 'Concluídos',

    detail: {
      title: 'Detalhes do Encontro',
      with: 'Encontro com {name}',
      date: 'Data',
      time: 'Hora',
      place: 'Local',
      status: 'Status',
      qrCode: 'Código QR',
      validationCode: 'Código de validação',
      scanQR: 'Escanear QR',
      confirmAttendance: 'Confirmar presença',
      cancel: 'Cancelar encontro',
      completed: 'Marcar como concluído',
      rate: 'Avaliar encontro',

      reminder: 'Lembrete',
      reminderText: 'Seu encontro é em {time}',

      sos: 'Botão SOS',
      sosActivate: 'Ativar SOS',
      sosMessage: 'Isso enviará um alerta de emergência'
    },

    statuses: {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      canceled: 'Cancelado',
      missed: 'Perdido'
    }
  },

  // Payments
  payments: {
    membership: {
      title: 'Assinatura Premium',
      subtitle: 'Desbloqueie todos os recursos',
      monthly: 'Mensal',
      yearly: 'Anual',
      price: '{price}/mês',
      priceYearly: '{price}/ano',
      save: 'Economize {amount}',
      currentPlan: 'Plano atual',
      upgrade: 'Melhorar plano',
      cancel: 'Cancelar assinatura',

      features: {
        title: 'Recursos incluídos',
        unlimitedChat: 'Chat ilimitado',
        dateProposals: 'Propostas de encontro',
        advancedSearch: 'Busca avançada',
        seeWhoLikes: 'Veja quem curtiu você',
        prioritySupport: 'Suporte prioritário',
        vipEvents: 'Acesso a eventos VIP',
        badges: 'Badges exclusivos'
      }
    },

    insurance: {
      title: 'Seguro Anti-Bolo',
      subtitle: 'Proteção vitalícia',
      price: '€120 pagamento único',
      description: 'Se seu encontro não aparecer, nós reembolsamos',
      purchase: 'Comprar seguro',
      purchased: 'Seguro ativo',

      benefits: {
        title: 'Benefícios',
        lifetime: 'Proteção vitalícia',
        refund: 'Reembolso em caso de bolo',
        priority: 'Prioridade em matches',
        badge: 'Badge "Segurado"'
      }
    },

    methods: {
      title: 'Métodos de pagamento',
      paypal: 'PayPal',
      stripe: 'Cartão de crédito/débito',
      saved: 'Métodos salvos',
      add: 'Adicionar método'
    },

    history: {
      title: 'Histórico de pagamentos',
      date: 'Data',
      description: 'Descrição',
      amount: 'Valor',
      status: 'Status',
      invoice: 'Fatura'
    }
  },

  // Referrals
  referrals: {
    title: 'Sistema de Indicações',
    subtitle: 'Convide amigos e ganhe recompensas',
    yourCode: 'Seu código de convite',
    copy: 'Copiar código',
    share: 'Compartilhar',
    shareWhatsapp: 'Compartilhar no WhatsApp',

    stats: {
      total: 'Total de Indicações',
      pending: 'Pendentes',
      completed: 'Concluídas',
      tier: 'Nível Atual'
    },

    tiers: {
      bronze: 'Embaixador Bronze',
      silver: 'Embaixador Prata',
      gold: 'Embaixador Ouro',
      platinum: 'Embaixador Platina'
    },

    progress: 'Progresso para o próximo nível',
    remaining: 'Faltam {count} indicações para {tier}',

    rewards: {
      title: 'Recompensas',
      bronze: 'Assinatura grátis por 1 mês',
      silver: 'Assinatura grátis por 3 meses + Acesso VIP',
      gold: 'Assinatura grátis por 6 meses + Prioridade',
      platinum: 'Assinatura grátis por 1 ano + Todos os benefícios'
    },

    history: {
      title: 'Histórico de Indicações',
      empty: 'Ainda não há indicações',
      user: 'Usuário',
      date: 'Data',
      status: 'Status'
    }
  },

  // Badges & Achievements
  badges: {
    title: 'Conquistas e Badges',
    subtitle: 'Colete conquistas e suba de nível',
    level: 'Nível',
    points: 'Pontos',
    progress: 'Progresso',

    stats: {
      total: 'Total de Badges',
      earned: 'Desbloqueados',
      locked: 'Bloqueados',
      completion: 'Completado'
    },

    categories: {
      profile: 'Perfil',
      social: 'Social',
      dating: 'Encontros',
      premium: 'Premium',
      special: 'Especiais'
    },

    rarities: {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Lendário'
    },

    levels: {
      novice: 'Novato',
      apprentice: 'Aprendiz',
      competent: 'Competente',
      expert: 'Especialista',
      master: 'Mestre',
      legend: 'Lenda'
    },

    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    earnedOn: 'Obtido em {date}'
  },

  // VIP Events
  events: {
    title: 'Eventos VIP',
    subtitle: 'Eventos exclusivos para membros',
    upcoming: 'Próximos',
    past: 'Passados',
    myEvents: 'Meus eventos',

    detail: {
      title: 'Detalhes do Evento',
      date: 'Data',
      time: 'Hora',
      location: 'Localização',
      organizer: 'Organizador',
      attendees: 'Participantes',
      maxAttendees: 'Máximo {max} pessoas',
      apply: 'Solicitar participação',
      cancel: 'Cancelar solicitação',
      status: 'Status'
    },

    statuses: {
      published: 'Publicado',
      closed: 'Fechado',
      canceled: 'Cancelado',
      completed: 'Concluído'
    },

    application: {
      pending: 'Solicitação pendente',
      approved: 'Solicitação aprovada',
      rejected: 'Solicitação rejeitada',
      attended: 'Você participou'
    }
  },

  // Admin
  admin: {
    title: 'Painel de Administração',
    dashboard: 'Dashboard',
    users: 'Usuários',
    reports: 'Denúncias',
    payments: 'Pagamentos',
    analytics: 'Analíticas',
    settings: 'Configurações',

    users: {
      total: 'Total de Usuários',
      active: 'Usuários Ativos',
      verified: 'Verificados',
      premium: 'Premium',
      search: 'Buscar usuário...',
      ban: 'Banir',
      unban: 'Desbanir',
      verify: 'Verificar',
      grantPremium: 'Conceder Premium'
    },

    moderation: {
      title: 'Moderação',
      reports: 'Denúncias pendentes',
      flagged: 'Conteúdo sinalizado',
      review: 'Revisar',
      approve: 'Aprovar',
      reject: 'Rejeitar'
    }
  },

  // Settings
  settings: {
    title: 'Configurações',
    account: 'Conta',
    privacy: 'Privacidade',
    notifications: 'Notificações',
    language: 'Idioma',
    theme: 'Tema',

    privacy: {
      title: 'Configurações de Privacidade',
      profileVisibility: 'Visibilidade do perfil',
      showOnline: 'Mostrar quando estou online',
      showLocation: 'Mostrar localização',
      allowMessages: 'Permitir mensagens',
      blockedUsers: 'Usuários bloqueados'
    },

    notifications: {
      title: 'Notificações',
      push: 'Notificações push',
      email: 'Notificações por e-mail',
      matches: 'Novos matches',
      messages: 'Novas mensagens',
      dates: 'Lembretes de encontros',
      events: 'Eventos VIP'
    }
  },

  // Help & Support
  help: {
    title: 'Centro de Ajuda',
    faq: 'Perguntas Frequentes',
    contact: 'Contatar Suporte',
    guidelines: 'Diretrizes da Comunidade',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',

    faq: {
      howItWorks: 'Como funciona o SeuEncontroSeguro?',
      safety: 'É seguro?',
      pricing: 'Quanto custa?',
      matching: 'Como funciona o matching?',
      insurance: 'O que é o seguro anti-bolo?'
    }
  },

  // Security
  security: {
    title: 'Centro de Segurança',
    subtitle: 'Sua segurança é nossa prioridade',
    verification: 'Verificação de Identidade',
    sos: 'Botão SOS',
    safetyTips: 'Dicas de Segurança',
    reportUser: 'Denunciar Usuário',

    tips: {
      title: 'Dicas de Segurança',
      tip1: 'Encontre-se em lugares públicos',
      tip2: 'Informe um amigo sobre seu encontro',
      tip3: 'Não compartilhe informações pessoais',
      tip4: 'Confie em seus instintos',
      tip5: 'Use o botão SOS se sentir-se inseguro'
    }
  },

  // Notifications (in-app messages)
  notifications: {
    title: 'Notificações',
    markRead: 'Marcar como lida',
    markAllRead: 'Marcar todas como lidas',
    empty: 'Você não tem notificações',

    types: {
      newMatch: 'Novo match',
      newMessage: 'Nova mensagem',
      dateRequest: 'Proposta de encontro',
      dateConfirmed: 'Encontro confirmado',
      dateReminder: 'Lembrete de encontro',
      paymentSuccess: 'Pagamento bem-sucedido',
      paymentFailed: 'Pagamento falhou',
      profileVerified: 'Perfil verificado',
      newBadge: 'Nova conquista',
      referralCompleted: 'Indicação concluída',
      vipEvent: 'Novo evento VIP',
      adminMessage: 'Mensagem do administrador'
    }
  },

  // Errors & Validation
  errors: {
    general: 'Algo deu errado. Por favor, tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    auth: {
      invalidEmail: 'E-mail inválido',
      invalidPassword: 'Senha incorreta',
      weakPassword: 'Senha fraca (mínimo 6 caracteres)',
      emailInUse: 'Este e-mail já está registrado',
      userNotFound: 'Usuário não encontrado',
      emailNotVerified: 'Por favor, verifique seu e-mail'
    },
    validation: {
      required: 'Este campo é obrigatório',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      minAge: 'Você deve ter pelo menos {age} anos',
      invalidFormat: 'Formato inválido'
    },
    payment: {
      failed: 'Pagamento falhou',
      cardDeclined: 'Cartão recusado',
      insufficientFunds: 'Fundos insuficientes',
      invalidCard: 'Cartão inválido'
    }
  },

  // Success messages
  success: {
    profileUpdated: 'Perfil atualizado com sucesso',
    photoUploaded: 'Foto enviada com sucesso',
    matchSent: 'Solicitação de match enviada',
    messageSent: 'Mensagem enviada',
    dateSent: 'Proposta de encontro enviada',
    paymentSuccess: 'Pagamento processado com sucesso',
    settingsSaved: 'Configurações salvas',
    languageChanged: 'Idioma alterado para {language}'
  }
};

export default translations;
