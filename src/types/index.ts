// Common utility types for the Sprytna Spiżarnia app

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Function types
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;
export type CallbackFunction<T = void> = (...args: any[]) => T;
export type EventHandler<T = any> = (event: T) => void;

// State types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T> = {
  data: T | null;
  loading: LoadingState;
  error: string | null;
};

// Date and time types
export type DateString = string; // ISO 8601 format
export type Timestamp = number; // Unix timestamp
export type TimeRange = {
  start: Date;
  end: Date;
};

// ID types
export type UserId = string;
export type ProductId = string;
export type RecipeId = string;
export type ShoppingListId = string;
export type FamilyId = string;
export type NotificationId = string;

// Validation types
export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export type ValidationError = {
  field: string;
  message: string;
  code?: string;
};

export type ValidatorFunction<T> = (value: T) => ValidationResult;

// Form types
export type FormField<T = any> = {
  value: T;
  error?: string;
  touched: boolean;
  valid: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
} & {
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
};

// API types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ContentType = 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded';

export type RequestConfig = {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
};

// Storage types
export type StorageKey = string;
export type StorageValue = string | number | boolean | object | null;
export type StorageOptions = {
  encrypt?: boolean;
  expiresAt?: Date;
};

// File types
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'bmp';
export type VideoFormat = 'mp4' | 'avi' | 'mov' | 'wmv' | 'flv' | 'webm';

export type FileInfo = {
  name: string;
  size: number;
  type: FileType;
  format: string;
  lastModified: Date;
  path?: string;
  url?: string;
};

// Color and theme types
export type ColorHex = string; // #RRGGBB or #RRGGBBAA
export type ColorRGB = { r: number; g: number; b: number };
export type ColorRGBA = { r: number; g: number; b: number; a: number };
export type ColorHSL = { h: number; s: number; l: number };

export type ThemeColors = {
  primary: ColorHex;
  secondary: ColorHex;
  success: ColorHex;
  warning: ColorHex;
  error: ColorHex;
  info: ColorHex;
  background: ColorHex;
  surface: ColorHex;
  text: ColorHex;
  textSecondary: ColorHex;
  border: ColorHex;
  accent: ColorHex;
};

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'elastic';
export type AnimationDirection = 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
export type AnimationDuration = number; // milliseconds
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export type AnimationConfig = {
  type: AnimationType;
  direction?: AnimationDirection;
  duration: AnimationDuration;
  easing?: AnimationEasing;
  delay?: number;
  repeat?: number;
  reverse?: boolean;
};

// Sorting and filtering types
export type SortOrder = 'asc' | 'desc';
export type SortConfig<T> = {
  field: keyof T;
  order: SortOrder;
};

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
export type FilterCondition<T> = {
  field: keyof T;
  operator: FilterOperator;
  value: any;
};

export type FilterGroup<T> = {
  conditions: FilterCondition<T>[];
  operator: 'and' | 'or';
};

// Search types
export type SearchMode = 'simple' | 'advanced' | 'fuzzy';
export type SearchScope = 'all' | 'name' | 'description' | 'tags' | 'category';

export type SearchConfig = {
  mode: SearchMode;
  scope: SearchScope[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  maxResults?: number;
};

export type SearchResult<T> = {
  item: T;
  score: number;
  matches: SearchMatch[];
};

export type SearchMatch = {
  field: string;
  indices: [number, number][];
  value: string;
};

// Pagination types
export type PaginationConfig = {
  page: number;
  limit: number;
  offset?: number;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// Cache types
export type CacheStrategy = 'memory' | 'disk' | 'hybrid';
export type CachePolicy = 'cache-first' | 'network-first' | 'cache-only' | 'network-only';

export type CacheConfig = {
  strategy: CacheStrategy;
  policy: CachePolicy;
  maxAge?: number; // milliseconds
  maxSize?: number; // bytes
  compress?: boolean;
};

export type CacheEntry<T> = {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number;
};

// Logging types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogCategory = 'app' | 'api' | 'auth' | 'navigation' | 'storage' | 'camera' | 'sync';

export type LogEntry = {
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: Date;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
};

// Analytics types
export type AnalyticsEvent = {
  name: string;
  category: string;
  parameters?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
};

export type AnalyticsConfig = {
  enabled: boolean;
  anonymize: boolean;
  samplingRate: number;
  batchSize: number;
  flushInterval: number;
};

// Device and platform types
export type Platform = 'ios' | 'android' | 'web';
export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export type DeviceCapabilities = {
  camera: boolean;
  microphone: boolean;
  gps: boolean;
  bluetooth: boolean;
  nfc: boolean;
  biometrics: boolean;
  faceId: boolean;
  touchId: boolean;
  notifications: boolean;
};

// Network types
export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
export type NetworkQuality = 'poor' | 'moderate' | 'good' | 'excellent';

export type NetworkInfo = {
  status: NetworkStatus;
  type: ConnectionType;
  quality: NetworkQuality;
  isExpensive: boolean;
  isMetered: boolean;
  downloadSpeed?: number; // Mbps
  uploadSpeed?: number; // Mbps
};

// Permission types
export type Permission = 
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'storage'
  | 'contacts'
  | 'calendar'
  | 'biometrics';

export type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'undetermined';

export type PermissionResult = {
  permission: Permission;
  status: PermissionStatus;
  canAskAgain: boolean;
};

// Biometric types
export type BiometricType = 'fingerprint' | 'faceId' | 'iris' | 'voice' | 'none';
export type BiometricStatus = 'available' | 'unavailable' | 'enrolled' | 'not-enrolled';

export type BiometricConfig = {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
};

// Backup and sync types
export type BackupFrequency = 'manual' | 'daily' | 'weekly' | 'monthly';
export type BackupStatus = 'idle' | 'in-progress' | 'completed' | 'failed';

export type BackupConfig = {
  enabled: boolean;
  frequency: BackupFrequency;
  includePhotos: boolean;
  wifiOnly: boolean;
  encryptData: boolean;
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';
export type ConflictResolution = 'local' | 'remote' | 'merge' | 'manual';

// Accessibility types
export type AccessibilityRole = 
  | 'button'
  | 'link'
  | 'text'
  | 'image'
  | 'header'
  | 'search'
  | 'tablist'
  | 'tab'
  | 'menu'
  | 'menuitem'
  | 'listitem'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'progressbar'
  | 'alert'
  | 'dialog'
  | 'tooltip';

export type AccessibilityState = {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
};

export type AccessibilityProps = {
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
};

// Component types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentShape = 'square' | 'rounded' | 'circle';

// Layout types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type LayoutProps = {
  flex?: number;
  flexDirection?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  flexWrap?: FlexWrap;
  margin?: number | string;
  padding?: number | string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
};

// Input types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'phone' | 'url' | 'search';
export type KeyboardType = 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
export type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';
export type AutoComplete = 'off' | 'username' | 'password' | 'email' | 'name' | 'phone' | 'address';

// Export all types
export * from './models';
// Note: api.ts and navigation.ts types can be imported directly when needed to avoid conflicts
