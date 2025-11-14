/**
 * Spanish (Español) translations for TuCitaSegura
 */

export const translations = {
  // Common
  common: {
    appName: 'TuCitaSegura',
    welcome: 'Bienvenido',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    more: 'Más',
    less: 'Menos',
    all: 'Todo',
    none: 'Ninguno',
    or: 'o',
    and: 'y',

    time: {
      justNow: 'Ahora mismo',
      minutesAgo: 'Hace {count} minutos',
      hoursAgo: 'Hace {count} horas',
      daysAgo: 'Hace {count} días',
      weeksAgo: 'Hace {count} semanas'
    },

    gender: {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro'
    }
  },

  // Authentication
  auth: {
    login: {
      title: 'Iniciar Sesión',
      subtitle: 'Encuentra tu relación seria',
      email: 'Correo electrónico',
      emailPlaceholder: 'tu@email.com',
      password: 'Contraseña',
      passwordPlaceholder: 'Tu contraseña',
      submit: 'Entrar',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      signUp: 'Regístrate'
    },

    register: {
      title: 'Crear Cuenta',
      subtitle: 'Únete a TuCitaSegura',
      alias: 'Nombre de usuario',
      aliasPlaceholder: 'Cómo quieres que te llamen',
      birthDate: 'Fecha de nacimiento',
      gender: 'Género',
      terms: 'Acepto los términos y condiciones',
      submit: 'Crear cuenta',
      hasAccount: '¿Ya tienes cuenta?',
      signIn: 'Inicia sesión'
    },

    verification: {
      title: 'Verifica tu email',
      message: 'Hemos enviado un enlace de verificación a {email}',
      resend: 'Reenviar email',
      verified: 'Email verificado correctamente'
    },

    logout: 'Cerrar sesión'
  },

  // Profile
  profile: {
    title: 'Mi Perfil',
    edit: 'Editar Perfil',
    photo: 'Foto de perfil',
    photos: 'Mis fotos',
    bio: 'Biografía',
    bioPlaceholder: 'Cuéntanos sobre ti (mínimo 120 palabras)...',
    location: 'Ubicación',
    age: '{age} años',
    reputation: 'Reputación',
    member: 'Miembro desde',
    theme: 'Tema',
    language: 'Idioma',

    reputations: {
      BRONCE: 'Bronce',
      PLATA: 'Plata',
      ORO: 'Oro',
      PLATINO: 'Platino'
    },

    sections: {
      basic: 'Información Básica',
      photos: 'Fotos',
      preferences: 'Preferencias',
      privacy: 'Privacidad',
      account: 'Cuenta',
      payments: 'Pagos'
    },

    stats: {
      matches: 'Matches',
      conversations: 'Conversaciones',
      dates: 'Citas',
      badges: 'Logros'
    }
  },

  // Search
  search: {
    title: 'Buscar Usuarios',
    filters: 'Filtros',
    results: 'Resultados',
    noResults: 'No se encontraron usuarios',
    distance: 'Distancia',
    age: 'Edad',
    ageRange: '{min} - {max} años',
    distanceRange: '{distance} km',
    viewMap: 'Ver mapa',
    viewGrid: 'Ver lista',
    sortBy: 'Ordenar por',

    sorts: {
      distance: 'Distancia',
      newest: 'Más recientes',
      active: 'Más activos',
      reputation: 'Reputación'
    }
  },

  // Matches & Conversations
  matches: {
    title: 'Mis Matches',
    pending: 'Pendientes',
    accepted: 'Aceptados',
    rejected: 'Rechazados',
    sendRequest: 'Enviar solicitud',
    accept: 'Aceptar',
    reject: 'Rechazar',
    cancel: 'Cancelar solicitud',

    request: {
      sent: 'Solicitud enviada',
      received: '{name} quiere conectar contigo',
      accepted: '¡Match confirmado con {name}!',
      rejected: 'Solicitud rechazada'
    }
  },

  conversations: {
    title: 'Conversaciones',
    empty: 'No tienes conversaciones',
    startChat: 'Iniciar chat',
    newMessage: 'Nuevo mensaje',
    typing: '{name} está escribiendo...',
    online: 'En línea',
    offline: 'Desconectado',
    lastSeen: 'Última vez {time}'
  },

  chat: {
    title: 'Chat',
    typeMessage: 'Escribe un mensaje...',
    send: 'Enviar',
    proposeDate: 'Proponer cita',
    viewProfile: 'Ver perfil',
    block: 'Bloquear',
    report: 'Reportar',

    dateProposal: {
      title: 'Proponer una cita',
      date: 'Fecha',
      time: 'Hora',
      place: 'Lugar',
      placePlaceholder: 'Restaurante, café, parque...',
      message: 'Mensaje (opcional)',
      submit: 'Enviar propuesta',

      received: '{name} te propuso una cita',
      details: 'Detalles de la cita:',
      accept: 'Aceptar cita',
      decline: 'Rechazar',
      accepted: 'Cita aceptada',
      declined: 'Cita rechazada'
    }
  },

  // Dates/Appointments
  dates: {
    title: 'Mis Citas',
    upcoming: 'Próximas',
    past: 'Pasadas',
    confirmed: 'Confirmadas',
    pending: 'Pendientes',
    canceled: 'Canceladas',
    completed: 'Completadas',

    detail: {
      title: 'Detalles de la Cita',
      with: 'Cita con {name}',
      date: 'Fecha',
      time: 'Hora',
      place: 'Lugar',
      status: 'Estado',
      qrCode: 'Código QR',
      validationCode: 'Código de validación',
      scanQR: 'Escanear QR',
      confirmAttendance: 'Confirmar asistencia',
      cancel: 'Cancelar cita',
      completed: 'Marcar como completada',
      rate: 'Calificar cita',

      reminder: 'Recordatorio',
      reminderText: 'Tu cita es en {time}',

      sos: 'Botón SOS',
      sosActivate: 'Activar SOS',
      sosMessage: 'Esto enviará una alerta de emergencia'
    },

    statuses: {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      canceled: 'Cancelada',
      missed: 'Perdida'
    }
  },

  // Payments
  payments: {
    membership: {
      title: 'Membresía Premium',
      subtitle: 'Desbloquea todas las funciones',
      monthly: 'Mensual',
      yearly: 'Anual',
      price: '{price}/mes',
      priceYearly: '{price}/año',
      save: 'Ahorra {amount}',
      currentPlan: 'Plan actual',
      upgrade: 'Mejorar plan',
      cancel: 'Cancelar suscripción',

      features: {
        title: 'Funciones incluidas',
        unlimitedChat: 'Chat ilimitado',
        dateProposals: 'Propuestas de citas',
        advancedSearch: 'Búsqueda avanzada',
        seeWhoLikes: 'Ver quién te dio like',
        prioritySupport: 'Soporte prioritario',
        vipEvents: 'Acceso a eventos VIP',
        badges: 'Badges exclusivos'
      }
    },

    insurance: {
      title: 'Seguro Anti-Plantón',
      subtitle: 'Protección de por vida',
      price: '€120 pago único',
      description: 'Si tu cita no se presenta, te reembolsamos',
      purchase: 'Comprar seguro',
      purchased: 'Seguro activo',

      benefits: {
        title: 'Beneficios',
        lifetime: 'Protección de por vida',
        refund: 'Reembolso en caso de plantón',
        priority: 'Prioridad en matches',
        badge: 'Badge "Asegurado"'
      }
    },

    methods: {
      title: 'Métodos de pago',
      paypal: 'PayPal',
      stripe: 'Tarjeta de crédito/débito',
      saved: 'Métodos guardados',
      add: 'Añadir método'
    },

    history: {
      title: 'Historial de pagos',
      date: 'Fecha',
      description: 'Descripción',
      amount: 'Monto',
      status: 'Estado',
      invoice: 'Factura'
    }
  },

  // Referrals
  referrals: {
    title: 'Sistema de Referidos',
    subtitle: 'Invita amigos y gana recompensas',
    yourCode: 'Tu código de invitación',
    copy: 'Copiar código',
    share: 'Compartir',
    shareWhatsapp: 'Compartir por WhatsApp',

    stats: {
      total: 'Total Referidos',
      pending: 'Pendientes',
      completed: 'Completados',
      tier: 'Nivel Actual'
    },

    tiers: {
      bronze: 'Embajador Bronce',
      silver: 'Embajador Plata',
      gold: 'Embajador Oro',
      platinum: 'Embajador Platino'
    },

    progress: 'Progreso al siguiente nivel',
    remaining: 'Te faltan {count} referidos para {tier}',

    rewards: {
      title: 'Recompensas',
      bronze: 'Membresía gratis 1 mes',
      silver: 'Membresía gratis 3 meses + Acceso VIP',
      gold: 'Membresía gratis 6 meses + Prioridad',
      platinum: 'Membresía gratis 1 año + Todos los beneficios'
    },

    history: {
      title: 'Historial de Referidos',
      empty: 'Aún no tienes referidos',
      user: 'Usuario',
      date: 'Fecha',
      status: 'Estado'
    }
  },

  // Badges & Achievements
  badges: {
    title: 'Logros y Badges',
    subtitle: 'Colecciona logros y sube de nivel',
    level: 'Nivel',
    points: 'Puntos',
    progress: 'Progreso',

    stats: {
      total: 'Total Badges',
      earned: 'Desbloqueados',
      locked: 'Bloqueados',
      completion: 'Completado'
    },

    categories: {
      profile: 'Perfil',
      social: 'Social',
      dating: 'Citas',
      premium: 'Premium',
      special: 'Especiales'
    },

    rarities: {
      common: 'Común',
      uncommon: 'Poco Común',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Legendario'
    },

    levels: {
      novice: 'Novato',
      apprentice: 'Aprendiz',
      competent: 'Competente',
      expert: 'Experto',
      master: 'Maestro',
      legend: 'Leyenda'
    },

    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    earnedOn: 'Obtenido el {date}'
  },

  // VIP Events
  events: {
    title: 'Eventos VIP',
    subtitle: 'Eventos exclusivos para miembros',
    upcoming: 'Próximos',
    past: 'Pasados',
    myEvents: 'Mis eventos',

    detail: {
      title: 'Detalles del Evento',
      date: 'Fecha',
      time: 'Hora',
      location: 'Ubicación',
      organizer: 'Organizador',
      attendees: 'Asistentes',
      maxAttendees: 'Máximo {max} personas',
      apply: 'Solicitar asistencia',
      cancel: 'Cancelar solicitud',
      status: 'Estado'
    },

    statuses: {
      published: 'Publicado',
      closed: 'Cerrado',
      canceled: 'Cancelado',
      completed: 'Completado'
    },

    application: {
      pending: 'Solicitud pendiente',
      approved: 'Solicitud aprobada',
      rejected: 'Solicitud rechazada',
      attended: 'Asististe'
    }
  },

  // Admin
  admin: {
    title: 'Panel de Administración',
    dashboard: 'Dashboard',
    users: 'Usuarios',
    reports: 'Reportes',
    payments: 'Pagos',
    analytics: 'Analíticas',
    settings: 'Configuración',

    users: {
      total: 'Total Usuarios',
      active: 'Usuarios Activos',
      verified: 'Verificados',
      premium: 'Premium',
      search: 'Buscar usuario...',
      ban: 'Banear',
      unban: 'Desbanear',
      verify: 'Verificar',
      grantPremium: 'Dar Premium'
    },

    moderation: {
      title: 'Moderación',
      reports: 'Reportes pendientes',
      flagged: 'Contenido marcado',
      review: 'Revisar',
      approve: 'Aprobar',
      reject: 'Rechazar'
    }
  },

  // Settings
  settings: {
    title: 'Configuración',
    account: 'Cuenta',
    privacy: 'Privacidad',
    notifications: 'Notificaciones',
    language: 'Idioma',
    theme: 'Tema',

    privacy: {
      title: 'Configuración de Privacidad',
      profileVisibility: 'Visibilidad del perfil',
      showOnline: 'Mostrar cuando estoy en línea',
      showLocation: 'Mostrar ubicación',
      allowMessages: 'Permitir mensajes',
      blockedUsers: 'Usuarios bloqueados'
    },

    notifications: {
      title: 'Notificaciones',
      push: 'Notificaciones push',
      email: 'Notificaciones por email',
      matches: 'Nuevos matches',
      messages: 'Nuevos mensajes',
      dates: 'Recordatorios de citas',
      events: 'Eventos VIP'
    }
  },

  // Help & Support
  help: {
    title: 'Centro de Ayuda',
    faq: 'Preguntas Frecuentes',
    contact: 'Contactar Soporte',
    guidelines: 'Guías de la Comunidad',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',

    faq: {
      howItWorks: '¿Cómo funciona TuCitaSegura?',
      safety: '¿Es seguro?',
      pricing: '¿Cuánto cuesta?',
      matching: '¿Cómo funciona el matching?',
      insurance: '¿Qué es el seguro anti-plantón?'
    }
  },

  // Security
  security: {
    title: 'Centro de Seguridad',
    subtitle: 'Tu seguridad es nuestra prioridad',
    verification: 'Verificación de Identidad',
    sos: 'Botón SOS',
    safetyTips: 'Consejos de Seguridad',
    reportUser: 'Reportar Usuario',

    tips: {
      title: 'Consejos de Seguridad',
      tip1: 'Reúnete en lugares públicos',
      tip2: 'Informa a un amigo sobre tu cita',
      tip3: 'No compartas información personal',
      tip4: 'Confía en tus instintos',
      tip5: 'Usa el botón SOS si te sientes inseguro'
    }
  },

  // Notifications (in-app messages)
  notifications: {
    title: 'Notificaciones',
    markRead: 'Marcar como leída',
    markAllRead: 'Marcar todas como leídas',
    empty: 'No tienes notificaciones',

    types: {
      newMatch: 'Nuevo match',
      newMessage: 'Nuevo mensaje',
      dateRequest: 'Propuesta de cita',
      dateConfirmed: 'Cita confirmada',
      dateReminder: 'Recordatorio de cita',
      paymentSuccess: 'Pago exitoso',
      paymentFailed: 'Pago fallido',
      profileVerified: 'Perfil verificado',
      newBadge: 'Nuevo logro',
      referralCompleted: 'Referido completado',
      vipEvent: 'Nuevo evento VIP',
      adminMessage: 'Mensaje del administrador'
    }
  },

  // Errors & Validation
  errors: {
    general: 'Algo salió mal. Por favor intenta de nuevo.',
    network: 'Error de conexión. Verifica tu internet.',
    auth: {
      invalidEmail: 'Email inválido',
      invalidPassword: 'Contraseña incorrecta',
      weakPassword: 'Contraseña débil (mínimo 6 caracteres)',
      emailInUse: 'Este email ya está registrado',
      userNotFound: 'Usuario no encontrado',
      emailNotVerified: 'Por favor verifica tu email'
    },
    validation: {
      required: 'Este campo es obligatorio',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      minAge: 'Debes tener al menos {age} años',
      invalidFormat: 'Formato inválido'
    },
    payment: {
      failed: 'Pago fallido',
      cardDeclined: 'Tarjeta rechazada',
      insufficientFunds: 'Fondos insuficientes',
      invalidCard: 'Tarjeta inválida'
    }
  },

  // Success messages
  success: {
    profileUpdated: 'Perfil actualizado correctamente',
    photoUploaded: 'Foto subida correctamente',
    matchSent: 'Solicitud de match enviada',
    messageSent: 'Mensaje enviado',
    dateSent: 'Propuesta de cita enviada',
    paymentSuccess: 'Pago procesado correctamente',
    settingsSaved: 'Configuración guardada',
    languageChanged: 'Idioma cambiado a {language}'
  }
};

export default translations;
