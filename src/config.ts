import { getSiteConfig } from './utils/adminStorage';

// Official Contact Email
export const OFFICIAL_EMAIL = 'metaresolveagency@proton.me';
export const OFFICIAL_EMAIL_MAILTO = 'mailto:metaresolveagency@proton.me';

// Centralized WhatsApp Numbers
export const ADIL_WHATSAPP_NUMBER = "923372430274";
export const ADIL_WHATSAPP_DISPLAY_NUMBER = "+92 337 2430274";

export const HUZAIFA_WHATSAPP_NUMBER = "447898154326";
export const HUZAIFA_WHATSAPP_DISPLAY_NUMBER = "+44 7898 154326";

// Default alias for legacy exports
export const WHATSAPP_NUMBER = ADIL_WHATSAPP_NUMBER;
export const WHATSAPP_DISPLAY_NUMBER = ADIL_WHATSAPP_DISPLAY_NUMBER;

export const WHATSAPP_DEFAULT_MESSAGE = "Hello Adil, I would like to discuss an account recovery issue with META RESOLVE.";
export const HUZAIFA_DEFAULT_MESSAGE = "Hello Huzaifa, I would like to discuss an account recovery case with META RESOLVE.";

export const getActiveOfficialEmail = (): string => {
  try {
    const config = getSiteConfig();
    return config.officialEmail || OFFICIAL_EMAIL;
  } catch (e) {
    return OFFICIAL_EMAIL;
  }
};

export const getActiveOfficialEmailMailto = (): string => {
  return `mailto:${getActiveOfficialEmail()}`;
};

export const getActiveWhatsAppNumber = (): string => {
  try {
    const config = getSiteConfig();
    return config.whatsappNumber || ADIL_WHATSAPP_NUMBER;
  } catch (e) {
    return ADIL_WHATSAPP_NUMBER;
  }
};

export const getActiveWhatsAppDisplayNumber = (): string => {
  try {
    const config = getSiteConfig();
    return config.whatsappDisplayNumber || ADIL_WHATSAPP_DISPLAY_NUMBER;
  } catch (e) {
    return ADIL_WHATSAPP_DISPLAY_NUMBER;
  }
};

export const getWhatsAppUrl = (customMessage?: string, customNumber?: string): string => {
  const number = customNumber || getActiveWhatsAppNumber();
  const message = customMessage || WHATSAPP_DEFAULT_MESSAGE;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const getHuzaifaWhatsAppUrl = (customMessage?: string): string => {
  const message = customMessage || HUZAIFA_DEFAULT_MESSAGE;
  return `https://wa.me/${HUZAIFA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
