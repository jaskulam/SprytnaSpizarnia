export const getDaysUntilExpiry = (expiryDate?: Date): number => {
  if (!expiryDate) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatExpiryDate = (date: Date): string => {
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getExpiryStatus = (expiryDate?: Date): 'fresh' | 'warning' | 'expired' => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 3) return 'warning';
  return 'fresh';
};

export const getExpiryColor = (expiryDate?: Date): string => {
  const status = getExpiryStatus(expiryDate);
  switch (status) {
    case 'expired':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'fresh':
      return '#4CAF50';
  }
};

export const getExpiryMessage = (expiryDate?: Date): string => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) {
    return `Przeterminowane ${Math.abs(days)} dni temu`;
  } else if (days === 0) {
    return 'Termin ważności dziś';
  } else if (days === 1) {
    return 'Termin ważności jutro';
  } else if (days <= 3) {
    return `Zużyj w ciągu ${days} dni`;
  } else if (days <= 7) {
    return `${days} dni do terminu`;
  } else if (days <= 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'tydzień' : 'tygodnie'} do terminu`;
  } else {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'miesiąc' : 'miesięcy'} do terminu`;
  }
};

export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDateFromNow = (days: number): Date => {
  return addDaysToDate(new Date(), days);
};

export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Przed chwilą';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min temu`;
  } else if (diffInHours < 24) {
    return `${diffInHours} godz. temu`;
  } else if (diffInDays < 7) {
    return `${diffInDays} dni temu`;
  } else {
    return formatExpiryDate(date);
  }
};
