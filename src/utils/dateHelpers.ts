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

// Additional date utilities
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return date >= weekStart && date <= weekEnd;
};

export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const isThisYear = (date: Date): boolean => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear();
};

export const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(weekStart.setDate(diff));
};

export const getWeekEnd = (date: Date): Date => {
  const weekEnd = getWeekStart(date);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getYearStart = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

export const getYearEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), 11, 31);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

export const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTimeRange = (startDate: Date, endDate: Date): string => {
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);
  
  if (isToday(startDate) && isToday(endDate)) {
    return `${startTime} - ${endTime}`;
  } else if (startDate.toDateString() === endDate.toDateString()) {
    return `${formatExpiryDate(startDate)} ${startTime} - ${endTime}`;
  } else {
    return `${formatDateTime(startDate)} - ${formatDateTime(endDate)}`;
  }
};

export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getHoursDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

export const getMinutesDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60));
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDaysToDate(date, weeks * 7);
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const parseISODate = (isoString: string): Date => {
  return new Date(isoString);
};

export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const toISOTimeString = (date: Date): string => {
  return date.toTimeString().split(' ')[0];
};

export const fromTimestamp = (timestamp: number): Date => {
  return new Date(timestamp);
};

export const toTimestamp = (date: Date): number => {
  return date.getTime();
};

export const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date);
};

export const getQuarter = (date: Date): number => {
  return Math.floor((date.getMonth() + 3) / 3);
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} dni, ${hours % 24} godz.`;
  } else if (hours > 0) {
    return `${hours} godz., ${minutes % 60} min.`;
  } else if (minutes > 0) {
    return `${minutes} min., ${seconds % 60} sek.`;
  } else {
    return `${seconds} sek.`;
  }
};

export const getTimeUntil = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Już minęło';
  }
  
  return formatDuration(diff);
};

export const getTimeSince = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff <= 0) {
    return 'W przyszłości';
  }
  
  return formatDuration(diff) + ' temu';
};

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const getBusinessDaysInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let businessDays = 0;
  
  for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
    if (isWeekday(day)) {
      businessDays++;
    }
  }
  
  return businessDays;
};

export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = addDaysToDate(date, 1);
  
  if (isWeekday(nextDay)) {
    return nextDay;
  } else {
    return getNextBusinessDay(nextDay);
  }
};

export const getPreviousBusinessDay = (date: Date): Date => {
  const prevDay = addDaysToDate(date, -1);
  
  if (isWeekday(prevDay)) {
    return prevDay;
  } else {
    return getPreviousBusinessDay(prevDay);
  }
};

// Timezone utilities
export const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToTimezone = (date: Date, timezone: string): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

export const getTimezoneOffset = (date: Date): number => {
  return date.getTimezoneOffset();
};

// Calendar utilities
export const getCalendarWeeks = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = getWeekStart(firstDay);
  const endDate = getWeekEnd(lastDay);
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    currentWeek.push(new Date(date));
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  return weeks;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Polish locale specific
export const getPolishMonthName = (month: number): string => {
  const months = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  return months[month];
};

export const getPolishDayName = (day: number): string => {
  const days = [
    'niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'
  ];
  return days[day];
};

export const getPolishShortDayName = (day: number): string => {
  const days = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
  return days[day];
};

export const formatPolishDate = (date: Date): string => {
  const day = date.getDate();
  const month = getPolishMonthName(date.getMonth());
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatPolishDateTime = (date: Date): string => {
  const polishDate = formatPolishDate(date);
  const time = formatTime(date);
  return `${polishDate} o ${time}`;
};
