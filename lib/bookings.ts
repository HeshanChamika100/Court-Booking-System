// In-memory storage for bookings (persisted via localStorage)
export interface Booking {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  number_of_courts: number;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

export interface Court {
  id: number;
  name: string;
  is_active: boolean;
}

const BOOKINGS_KEY = 'court_bookings';
const COURTS_KEY = 'courts_data';

// Initialize with default courts
const DEFAULT_COURTS: Court[] = [
  { id: 1, name: 'Court 1', is_active: true },
  { id: 2, name: 'Court 2', is_active: true },
  { id: 3, name: 'Court 3', is_active: true },
  { id: 4, name: 'Court 4', is_active: true },
  { id: 5, name: 'Court 5', is_active: true },
  { id: 6, name: 'Court 6', is_active: true },
];

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addBooking(booking: Omit<Booking, 'id' | 'created_at'>): Booking {
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const bookings = getBookings();
    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }

  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: 'pending' | 'approved' | 'declined'
): Booking | null {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === id);

  if (booking) {
    booking.status = status;
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
    return booking;
  }

  return null;
}

export function deleteBooking(id: string): boolean {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== id);

  if (filtered.length < bookings.length) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
    }
    return true;
  }

  return false;
}

export function getCourts(): Court[] {
  if (typeof window === 'undefined') return DEFAULT_COURTS;
  const stored = localStorage.getItem(COURTS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_COURTS;
}

export function isTimeSlotAvailable(
  date: string,
  startTime: string,
  endTime: string,
  numberOfCourts: number
): boolean {
  const bookings = getBookings();
  const approvedBookings = bookings.filter(
    (b) => b.status === 'approved' && b.booking_date === date
  );

  // Check if there are enough available courts
  const bookedCourtCount = approvedBookings.filter((b) => {
    const bStart = b.start_time;
    const bEnd = b.end_time;
    return timeRangesOverlap(startTime, endTime, bStart, bEnd);
  }).reduce((sum, b) => sum + b.number_of_courts, 0);

  const availableCourts = getCourts().length;
  return bookedCourtCount + numberOfCourts <= availableCourts;
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}
