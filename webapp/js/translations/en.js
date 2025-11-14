/**
 * English translations for TuCitaSegura
 */

export const translations = {
  // Common
  common: {
    appName: 'YourSafeDate',
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    more: 'More',
    less: 'Less',
    all: 'All',
    none: 'None',
    or: 'or',
    and: 'and',

    time: {
      justNow: 'Just now',
      minutesAgo: '{count} minutes ago',
      hoursAgo: '{count} hours ago',
      daysAgo: '{count} days ago',
      weeksAgo: '{count} weeks ago'
    },

    gender: {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    }
  },

  // Authentication
  auth: {
    login: {
      title: 'Sign In',
      subtitle: 'Find your serious relationship',
      email: 'Email',
      emailPlaceholder: 'you@email.com',
      password: 'Password',
      passwordPlaceholder: 'Your password',
      submit: 'Sign In',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign up'
    },

    register: {
      title: 'Create Account',
      subtitle: 'Join YourSafeDate',
      alias: 'Username',
      aliasPlaceholder: 'How you want to be called',
      birthDate: 'Date of birth',
      gender: 'Gender',
      terms: 'I accept the terms and conditions',
      submit: 'Create account',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in'
    },

    verification: {
      title: 'Verify your email',
      message: 'We sent a verification link to {email}',
      resend: 'Resend email',
      verified: 'Email verified successfully'
    },

    logout: 'Sign out'
  },

  // Profile
  profile: {
    title: 'My Profile',
    edit: 'Edit Profile',
    photo: 'Profile photo',
    photos: 'My photos',
    bio: 'Biography',
    bioPlaceholder: 'Tell us about yourself (minimum 120 words)...',
    location: 'Location',
    age: '{age} years old',
    reputation: 'Reputation',
    member: 'Member since',
    theme: 'Theme',
    language: 'Language',

    reputations: {
      BRONCE: 'Bronze',
      PLATA: 'Silver',
      ORO: 'Gold',
      PLATINO: 'Platinum'
    },

    sections: {
      basic: 'Basic Information',
      photos: 'Photos',
      preferences: 'Preferences',
      privacy: 'Privacy',
      account: 'Account',
      payments: 'Payments'
    },

    stats: {
      matches: 'Matches',
      conversations: 'Conversations',
      dates: 'Dates',
      badges: 'Achievements'
    }
  },

  // Search
  search: {
    title: 'Search Users',
    filters: 'Filters',
    results: 'Results',
    noResults: 'No users found',
    distance: 'Distance',
    age: 'Age',
    ageRange: '{min} - {max} years old',
    distanceRange: '{distance} km',
    viewMap: 'View map',
    viewGrid: 'View list',
    sortBy: 'Sort by',

    sorts: {
      distance: 'Distance',
      newest: 'Newest',
      active: 'Most active',
      reputation: 'Reputation'
    }
  },

  // Matches & Conversations
  matches: {
    title: 'My Matches',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    sendRequest: 'Send request',
    accept: 'Accept',
    reject: 'Reject',
    cancel: 'Cancel request',

    request: {
      sent: 'Request sent',
      received: '{name} wants to connect with you',
      accepted: 'Match confirmed with {name}!',
      rejected: 'Request rejected'
    }
  },

  conversations: {
    title: 'Conversations',
    empty: 'No conversations yet',
    startChat: 'Start chat',
    newMessage: 'New message',
    typing: '{name} is typing...',
    online: 'Online',
    offline: 'Offline',
    lastSeen: 'Last seen {time}'
  },

  chat: {
    title: 'Chat',
    typeMessage: 'Type a message...',
    send: 'Send',
    proposeDate: 'Propose date',
    viewProfile: 'View profile',
    block: 'Block',
    report: 'Report',

    dateProposal: {
      title: 'Propose a date',
      date: 'Date',
      time: 'Time',
      place: 'Place',
      placePlaceholder: 'Restaurant, café, park...',
      message: 'Message (optional)',
      submit: 'Send proposal',

      received: '{name} proposed a date',
      details: 'Date details:',
      accept: 'Accept date',
      decline: 'Decline',
      accepted: 'Date accepted',
      declined: 'Date declined'
    }
  },

  // Dates/Appointments
  dates: {
    title: 'My Dates',
    upcoming: 'Upcoming',
    past: 'Past',
    confirmed: 'Confirmed',
    pending: 'Pending',
    canceled: 'Canceled',
    completed: 'Completed',

    detail: {
      title: 'Date Details',
      with: 'Date with {name}',
      date: 'Date',
      time: 'Time',
      place: 'Place',
      status: 'Status',
      qrCode: 'QR Code',
      validationCode: 'Validation code',
      scanQR: 'Scan QR',
      confirmAttendance: 'Confirm attendance',
      cancel: 'Cancel date',
      completed: 'Mark as completed',
      rate: 'Rate date',

      reminder: 'Reminder',
      reminderText: 'Your date is in {time}',

      sos: 'SOS Button',
      sosActivate: 'Activate SOS',
      sosMessage: 'This will send an emergency alert'
    },

    statuses: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      canceled: 'Canceled',
      missed: 'Missed'
    }
  },

  // Payments
  payments: {
    membership: {
      title: 'Premium Membership',
      subtitle: 'Unlock all features',
      monthly: 'Monthly',
      yearly: 'Annual',
      price: '{price}/month',
      priceYearly: '{price}/year',
      save: 'Save {amount}',
      currentPlan: 'Current plan',
      upgrade: 'Upgrade plan',
      cancel: 'Cancel subscription',

      features: {
        title: 'Included features',
        unlimitedChat: 'Unlimited chat',
        dateProposals: 'Date proposals',
        advancedSearch: 'Advanced search',
        seeWhoLikes: 'See who likes you',
        prioritySupport: 'Priority support',
        vipEvents: 'VIP events access',
        badges: 'Exclusive badges'
      }
    },

    insurance: {
      title: 'Anti-Ghosting Insurance',
      subtitle: 'Lifetime protection',
      price: '€120 one-time payment',
      description: 'If your date doesn\'t show up, we refund you',
      purchase: 'Buy insurance',
      purchased: 'Insurance active',

      benefits: {
        title: 'Benefits',
        lifetime: 'Lifetime protection',
        refund: 'Refund if ghosted',
        priority: 'Priority in matches',
        badge: '"Insured" badge'
      }
    },

    methods: {
      title: 'Payment methods',
      paypal: 'PayPal',
      stripe: 'Credit/debit card',
      saved: 'Saved methods',
      add: 'Add method'
    },

    history: {
      title: 'Payment history',
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      status: 'Status',
      invoice: 'Invoice'
    }
  },

  // Referrals
  referrals: {
    title: 'Referral System',
    subtitle: 'Invite friends and earn rewards',
    yourCode: 'Your invitation code',
    copy: 'Copy code',
    share: 'Share',
    shareWhatsapp: 'Share on WhatsApp',

    stats: {
      total: 'Total Referrals',
      pending: 'Pending',
      completed: 'Completed',
      tier: 'Current Tier'
    },

    tiers: {
      bronze: 'Bronze Ambassador',
      silver: 'Silver Ambassador',
      gold: 'Gold Ambassador',
      platinum: 'Platinum Ambassador'
    },

    progress: 'Progress to next level',
    remaining: '{count} referrals left to {tier}',

    rewards: {
      title: 'Rewards',
      bronze: 'Free 1-month membership',
      silver: 'Free 3-month membership + VIP access',
      gold: 'Free 6-month membership + Priority',
      platinum: 'Free 1-year membership + All benefits'
    },

    history: {
      title: 'Referral History',
      empty: 'No referrals yet',
      user: 'User',
      date: 'Date',
      status: 'Status'
    }
  },

  // Badges & Achievements
  badges: {
    title: 'Achievements & Badges',
    subtitle: 'Collect achievements and level up',
    level: 'Level',
    points: 'Points',
    progress: 'Progress',

    stats: {
      total: 'Total Badges',
      earned: 'Unlocked',
      locked: 'Locked',
      completion: 'Completed'
    },

    categories: {
      profile: 'Profile',
      social: 'Social',
      dating: 'Dating',
      premium: 'Premium',
      special: 'Special'
    },

    rarities: {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary'
    },

    levels: {
      novice: 'Novice',
      apprentice: 'Apprentice',
      competent: 'Competent',
      expert: 'Expert',
      master: 'Master',
      legend: 'Legend'
    },

    unlocked: 'Unlocked',
    locked: 'Locked',
    earnedOn: 'Earned on {date}'
  },

  // VIP Events
  events: {
    title: 'VIP Events',
    subtitle: 'Exclusive events for members',
    upcoming: 'Upcoming',
    past: 'Past',
    myEvents: 'My events',

    detail: {
      title: 'Event Details',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      organizer: 'Organizer',
      attendees: 'Attendees',
      maxAttendees: 'Max {max} people',
      apply: 'Apply to attend',
      cancel: 'Cancel application',
      status: 'Status'
    },

    statuses: {
      published: 'Published',
      closed: 'Closed',
      canceled: 'Canceled',
      completed: 'Completed'
    },

    application: {
      pending: 'Application pending',
      approved: 'Application approved',
      rejected: 'Application rejected',
      attended: 'You attended'
    }
  },

  // Admin
  admin: {
    title: 'Admin Panel',
    dashboard: 'Dashboard',
    users: 'Users',
    reports: 'Reports',
    payments: 'Payments',
    analytics: 'Analytics',
    settings: 'Settings',

    users: {
      total: 'Total Users',
      active: 'Active Users',
      verified: 'Verified',
      premium: 'Premium',
      search: 'Search user...',
      ban: 'Ban',
      unban: 'Unban',
      verify: 'Verify',
      grantPremium: 'Grant Premium'
    },

    moderation: {
      title: 'Moderation',
      reports: 'Pending reports',
      flagged: 'Flagged content',
      review: 'Review',
      approve: 'Approve',
      reject: 'Reject'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    account: 'Account',
    privacy: 'Privacy',
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme',

    privacy: {
      title: 'Privacy Settings',
      profileVisibility: 'Profile visibility',
      showOnline: 'Show when I\'m online',
      showLocation: 'Show location',
      allowMessages: 'Allow messages',
      blockedUsers: 'Blocked users'
    },

    notifications: {
      title: 'Notifications',
      push: 'Push notifications',
      email: 'Email notifications',
      matches: 'New matches',
      messages: 'New messages',
      dates: 'Date reminders',
      events: 'VIP events'
    }
  },

  // Help & Support
  help: {
    title: 'Help Center',
    faq: 'Frequently Asked Questions',
    contact: 'Contact Support',
    guidelines: 'Community Guidelines',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',

    faq: {
      howItWorks: 'How does YourSafeDate work?',
      safety: 'Is it safe?',
      pricing: 'How much does it cost?',
      matching: 'How does matching work?',
      insurance: 'What is anti-ghosting insurance?'
    }
  },

  // Security
  security: {
    title: 'Security Center',
    subtitle: 'Your safety is our priority',
    verification: 'Identity Verification',
    sos: 'SOS Button',
    safetyTips: 'Safety Tips',
    reportUser: 'Report User',

    tips: {
      title: 'Safety Tips',
      tip1: 'Meet in public places',
      tip2: 'Tell a friend about your date',
      tip3: 'Don\'t share personal information',
      tip4: 'Trust your instincts',
      tip5: 'Use the SOS button if you feel unsafe'
    }
  },

  // Notifications (in-app messages)
  notifications: {
    title: 'Notifications',
    markRead: 'Mark as read',
    markAllRead: 'Mark all as read',
    empty: 'No notifications',

    types: {
      newMatch: 'New match',
      newMessage: 'New message',
      dateRequest: 'Date proposal',
      dateConfirmed: 'Date confirmed',
      dateReminder: 'Date reminder',
      paymentSuccess: 'Payment successful',
      paymentFailed: 'Payment failed',
      profileVerified: 'Profile verified',
      newBadge: 'New achievement',
      referralCompleted: 'Referral completed',
      vipEvent: 'New VIP event',
      adminMessage: 'Admin message'
    }
  },

  // Errors & Validation
  errors: {
    general: 'Something went wrong. Please try again.',
    network: 'Connection error. Check your internet.',
    auth: {
      invalidEmail: 'Invalid email',
      invalidPassword: 'Incorrect password',
      weakPassword: 'Weak password (minimum 6 characters)',
      emailInUse: 'This email is already registered',
      userNotFound: 'User not found',
      emailNotVerified: 'Please verify your email'
    },
    validation: {
      required: 'This field is required',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      minAge: 'You must be at least {age} years old',
      invalidFormat: 'Invalid format'
    },
    payment: {
      failed: 'Payment failed',
      cardDeclined: 'Card declined',
      insufficientFunds: 'Insufficient funds',
      invalidCard: 'Invalid card'
    }
  },

  // Success messages
  success: {
    profileUpdated: 'Profile updated successfully',
    photoUploaded: 'Photo uploaded successfully',
    matchSent: 'Match request sent',
    messageSent: 'Message sent',
    dateSent: 'Date proposal sent',
    paymentSuccess: 'Payment processed successfully',
    settingsSaved: 'Settings saved',
    languageChanged: 'Language changed to {language}'
  }
};

export default translations;
