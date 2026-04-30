// TunePoa - Simple i18n (English / Swahili)
// ────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'sw'

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.requests': 'Requests',
    'nav.subscriptions': 'Subscriptions',
    'nav.packages': 'Packages',
    'nav.newRequest': 'New Request',
    'nav.notifications': 'Notifications',
    'nav.profile': 'My Profile',
    'nav.audioLibrary': 'Audio Library',
    'nav.invoices': 'Invoices',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    'nav.admin.dashboard': 'Dashboard',
    'nav.admin.requests': 'Requests',
    'nav.admin.subscriptions': 'Subscriptions',
    'nav.admin.users': 'Users',
    'nav.admin.packages': 'Packages',
    'nav.admin.pricing': 'Pricing',
    'nav.admin.analytics': 'Analytics',
    'nav.admin.activityLogs': 'Activity Logs',
    'nav.admin.audio': 'Audio Library',
    'nav.admin.invoices': 'Invoices',
    'nav.admin.sampleTunes': 'Sample Tunes',
    'nav.admin.export': 'Data Export',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search...',
    'common.loading': 'Loading...',
    'common.noData': 'No data found',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.all': 'All',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.export': 'Export',
    'common.filter': 'Filter',
    // Landing page
    'landing.hero.title': 'Turn Every Call into an Opportunity',
    'landing.hero.subtitle': 'Transform your ringback tone into a powerful marketing channel with TunePoa.',
    'landing.cta.getStarted': 'Get Started',
    'landing.cta.viewPackages': 'View Packages',
    // Pricing
    'pricing.title': 'Packages & Pricing',
    'pricing.subtitle': 'Choose the right plan for your business.',
    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.noNotifications': 'No notifications yet',
    // Misc
    'currency': 'TZS',
  },
  sw: {
    // Navigation
    'nav.dashboard': 'Dashibodi',
    'nav.requests': 'Maombi',
    'nav.subscriptions': 'Usajili',
    'nav.packages': 'Pakiti',
    'nav.newRequest': 'Omba Huduma',
    'nav.notifications': 'Arifa',
    'nav.profile': 'Wasifu Wangu',
    'nav.audioLibrary': 'Maktaba Sauti',
    'nav.invoices': 'Anuani',
    'nav.settings': 'Mipangilio',
    'nav.signOut': 'Toka',
    'nav.admin.dashboard': 'Dashibodi',
    'nav.admin.requests': 'Maombi',
    'nav.admin.subscriptions': 'Usajili',
    'nav.admin.users': 'Watumiaji',
    'nav.admin.packages': 'Pakiti',
    'nav.admin.pricing': 'Bei',
    'nav.admin.analytics': 'Takwimu',
    'nav.admin.activityLogs': 'Kumbukumbu',
    'nav.admin.audio': 'Maktaba Sauti',
    'nav.admin.invoices': 'Anuani',
    'nav.admin.sampleTunes': 'Nyaraka za Sauti',
    'nav.admin.export': 'Toa Data',
    // Common
    'common.save': 'Hifadhi',
    'common.cancel': 'Futa',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.search': 'Tafuta...',
    'common.loading': 'Inapakia...',
    'common.noData': 'Hakuna data',
    'common.confirm': 'Thibitisha',
    'common.back': 'Nyuma',
    'common.next': 'Mbele',
    'common.all': 'Yote',
    'common.active': 'Amilifu',
    'common.inactive': 'Haiamilifu',
    'common.export': 'Toa',
    'common.filter': 'Chuja',
    // Landing page
    'landing.hero.title': 'Geuza Kila Simu Kuwa Fursa',
    'landing.hero.subtitle': 'Badilisha sauti yako ya matumizi kuwa njia ya masoko yenye nguvu na TunePoa.',
    'landing.cta.getStarted': 'Anza Sasa',
    'landing.cta.viewPackages': 'Tazama Pakiti',
    // Pricing
    'pricing.title': 'Pakiti na Bei',
    'pricing.subtitle': 'Chagua mpango unaofaa kwa biashara yako.',
    // Auth
    'auth.login': 'Ingia',
    'auth.register': 'Fungua Akaunti',
    'auth.email': 'Barua Pepe',
    'auth.password': 'Nenosiri',
    // Notifications
    'notifications.title': 'Arifa',
    'notifications.markAllRead': 'Weka yote kusomwa',
    'notifications.noNotifications': 'Hakuna arifa bado',
    // Misc
    'currency': 'TZS',
  },
}

/** Translate a key in the given locale (falls back to English). */
export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] || translations.en[key] || key
}
