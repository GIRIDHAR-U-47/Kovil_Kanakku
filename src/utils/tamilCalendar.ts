// Tamil Calendar Utility

export interface TamilDateDetails {
  gregorianDate: string;
  tamilMonth: string;
  tamilDate: number;
  dayOfWeek: string;
  festival: string;
  isSpecial: boolean;
  rahuKalam?: string;
  yamagandam?: string;
  kuligai?: string;
  nallaNeram?: string;
}

// Exact Amavasai & Pournami dates for 2026 for 100% accuracy
const EXACT_AMAVASAI_2026 = [
  '2026-01-18', '2026-02-17', '2026-03-18', '2026-04-17',
  '2026-05-16', '2026-06-14', '2026-07-14', '2026-08-12',
  '2026-09-10', '2026-10-10', '2026-11-08', '2026-12-08'
];

const EXACT_POURNAMI_2026 = [
  '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-01',
  '2026-05-01', '2026-05-31', '2026-06-29', '2026-07-29',
  '2026-08-27', '2026-09-26', '2026-10-25', '2026-11-24',
  '2026-12-23'
];

// Exact Ekadashi & Pradosham dates for 2026 for 100% accuracy
const EXACT_EKADASHI_2026 = [
  '2026-01-14', '2026-01-29', '2026-02-13', '2026-02-27',
  '2026-03-15', '2026-03-29', '2026-04-13', '2026-04-27',
  '2026-05-13', '2026-05-27', '2026-06-11', '2026-06-25',
  '2026-07-11', '2026-07-25', '2026-08-09', '2026-08-23', '2026-08-24',
  '2026-09-07', '2026-09-22', '2026-10-06', '2026-10-22',
  '2026-11-05', '2026-11-20', '2026-11-21', '2026-12-04', '2026-12-20'
];

const EXACT_PRADOSHAM_2026 = [
  '2026-01-01', '2026-01-16', '2026-01-30', '2026-02-14',
  '2026-03-01', '2026-03-16', '2026-03-30', '2026-04-15', '2026-04-29',
  '2026-05-14', '2026-05-28', '2026-06-12', '2026-06-27',
  '2026-07-12', '2026-07-26', '2026-08-10', '2026-08-25',
  '2026-09-08', '2026-09-24', '2026-10-08', '2026-10-23',
  '2026-11-06', '2026-11-22', '2026-12-06', '2026-12-21'
];

// Major Hindu Festivals in 2026 (exact dates from Prokerala)
const FESTIVALS_2026: { [dateStr: string]: string } = {
  '2026-01-01': "New Year's Day",
  '2026-01-03': 'Arudra Darshan',
  '2026-01-06': 'Sankatahara Chaturthi',
  '2026-01-07': 'Sri Thiyaga Brahma Aradhana',
  '2026-01-13': 'Bhogi Pandigai',
  '2026-01-14': 'Makara Sankranti / Thai Month Begins',
  '2026-01-15': 'Thai Pongal / Mattu Pongal',
  '2026-01-16': 'Kanum Pongal / Thiruvalluvar Day',
  '2026-01-17': 'Uzhavar Thirunal',
  '2026-01-18': 'Thai Amavasai',
  '2026-01-25': 'Ratha Saptami',
  '2026-01-26': 'Republic Day',
  '2026-01-27': 'Masik Karthigai',
  '2026-02-01': 'Thai Pusam',
  '2026-02-15': 'Maha Shivaratri',
  '2026-03-04': 'Holi',
  '2026-03-19': 'Ugadi / Gudi Padwa',
  '2026-03-26': 'Rama Navami',
  '2026-04-02': 'Hanuman Jayanti',
  '2026-04-14': 'Tamil New Year (Chithirai Kani)',
  '2026-04-19': 'Akshaya Tritiya',
  '2026-04-25': 'Chitra Pournami',
  '2026-07-29': 'Guru Purnima',
  '2026-08-26': 'Onam',
  '2026-08-28': 'Varalakshmi Vratam',
  '2026-09-04': 'Krishna Jayanthi',
  '2026-09-14': 'Ganesh Chaturthi',
  '2026-10-11': 'Navaratri Begins',
  '2026-10-20': 'Vijayadashami / Dussehra',
  '2026-11-08': 'Diwali (Deepavali)',
  '2026-11-25': 'Karthigai Deepam',
  '2026-12-20': 'Vaikunta Ekadasi',
};

// Navaratri 2026 range: Sep 28 to Oct 7
const isNavaratri2026 = (dateStr: string): boolean => {
  return dateStr >= '2026-09-28' && dateStr <= '2026-10-07';
};

// Synodic lunar cycle mapping
const SYNODIC_MONTH = 29.530588853;
// Known New Moon (Amavasai) epoch: Jan 18, 2026 03:10 UTC (08:40 IST)
const LUNAR_EPOCH = new Date(Date.UTC(2026, 0, 18, 3, 10));

export function getTithi(date: Date): number {
  const diffTime = date.getTime() - LUNAR_EPOCH.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const lunarAge = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  return Math.floor((lunarAge / SYNODIC_MONTH) * 30); // 0 to 29
}

export function getTamilMonthAndDate(date: Date): { month: string; date: number } {
  const y = date.getFullYear();
  
  // Custom transit boundaries mapping for 2025, 2026, 2027
  const getTransitsForYear = (year: number) => [
    { name: 'Thai', date: new Date(year, 0, 14) },
    { name: 'Maasi', date: new Date(year, 1, 13) },
    { name: 'Panguni', date: new Date(year, 2, 14) },
    { name: 'Chithirai', date: new Date(year, 3, 14) },
    { name: 'Vaikasi', date: new Date(year, 4, 15) },
    { name: 'Aani', date: new Date(year, 5, 15) },
    { name: 'Aadi', date: new Date(year, 6, 16) },
    { name: 'Aavani', date: new Date(year, 7, 17) },
    { name: 'Purattasi', date: new Date(year, 8, 17) },
    { name: 'Aippasi', date: new Date(year, 9, 17) },
    { name: 'Karthigai', date: new Date(year, 10, 16) },
    { name: 'Margazhi', date: new Date(year, 11, 16) },
  ];

  const transits = getTransitsForYear(y);
  
  let monthName = 'Margazhi';
  let startDate = new Date(y - 1, 11, 16);

  // Search transits in reverse to find the current month
  for (let i = transits.length - 1; i >= 0; i--) {
    if (date >= transits[i].date) {
      monthName = transits[i].name;
      startDate = transits[i].date;
      break;
    }
  }

  // Calculate date offset (1-indexed)
  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return { month: monthName, date: diffDays };
}

export function getTamilDateDetails(inputDate: Date, deity: string = 'Other'): TamilDateDetails {
  // Use a localized date at midnight to avoid timezone shifts
  const date = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 12, 0, 0);
  const dateStr = date.toISOString().split('T')[0];
  
  const { month: tamilMonth, date: tamilDate } = getTamilMonthAndDate(date);
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = weekdays[date.getDay()];
  
  const tithiIndex = getTithi(date);
  
  let festivalParts: string[] = [];
  let isSpecial = false;

  // 1. Check exact 2026 lists for specific festivals
  if (FESTIVALS_2026[dateStr]) {
    festivalParts.push(FESTIVALS_2026[dateStr]);
    isSpecial = true;
  }

  // 2. Check exact Amavasai & Pournami
  if (EXACT_AMAVASAI_2026.includes(dateStr)) {
    if (!festivalParts.some(p => p.includes('Amavasai'))) {
      festivalParts.push('Amavasai');
    }
    isSpecial = true;
  } else if (EXACT_POURNAMI_2026.includes(dateStr)) {
    if (!festivalParts.some(p => p.includes('Pournami') || p.includes('Pusam'))) {
      festivalParts.push('Pournami');
    }
    isSpecial = true;
  }

  // 3. Check exact Ekadashi & Pradosham
  if (EXACT_EKADASHI_2026.includes(dateStr)) {
    if (!festivalParts.some(p => p.includes('Ekadasi') || p.includes('Ekadashi'))) {
      festivalParts.push('Ekadasi');
    }
    isSpecial = true;
  }
  if (EXACT_PRADOSHAM_2026.includes(dateStr)) {
    if (!festivalParts.some(p => p.includes('Pradosham'))) {
      festivalParts.push('Pradosham');
    }
    isSpecial = true;
  }

  // 4. Check Navaratri
  if (isNavaratri2026(dateStr)) {
    if (!festivalParts.some(p => p.includes('Navaratri'))) {
      festivalParts.push('Navaratri');
    }
    isSpecial = true;
  }

  // Fallback to dynamic lunar calculation if no festival is tagged yet (for other years or gaps)
  if (festivalParts.length === 0) {
    if (tithiIndex === 10 || tithiIndex === 25) {
      festivalParts.push('Ekadasi');
      isSpecial = true;
    } else if (tithiIndex === 12 || tithiIndex === 27) {
      festivalParts.push('Pradosham');
      isSpecial = true;
    } else if (tithiIndex === 14) {
      festivalParts.push('Pournami');
      isSpecial = true;
    } else if (tithiIndex === 29) {
      festivalParts.push('Amavasai');
      isSpecial = true;
    }
  }

  let festival = festivalParts.join(' & ');

  // 5. Deity-specific/Month-specific Special observances
  // Saturdays in Purattasi (Perumal special)
  if (tamilMonth === 'Purattasi' && dayOfWeek === 'Saturday') {
    festival = festival ? `${festival} & Purattasi Saturday` : 'Purattasi Saturday';
    isSpecial = true;
  }
  
  // Fridays in Aadi (Amman special)
  if (tamilMonth === 'Aadi' && dayOfWeek === 'Friday') {
    festival = festival ? `${festival} & Aadi Friday` : 'Aadi Friday';
    isSpecial = true;
  }

  // Special Chaturthi for Vinayagar
  if (deity === 'Vinayagar' && (tithiIndex === 3 || festival.includes('Chaturthi')) && !festival.includes('Sankatahara')) {
    festival = festival ? `${festival} & Sankatahara Chaturthi` : 'Sankatahara Chaturthi';
    isSpecial = true;
  }

  // Special Shashti for Murugan
  if (deity === 'Murugan' && (tithiIndex === 5 || festival.includes('Shashti')) && !festival.includes('Skanda')) {
    festival = festival ? `${festival} & Skanda Shashti` : 'Skanda Shashti';
    isSpecial = true;
  }

  // 6. Calculate Auspicious and Inauspicious Timings based on Day of Week
  let rahuKalam = '';
  let yamagandam = '';
  let kuligai = '';
  let nallaNeram = '';

  switch (dayOfWeek) {
    case 'Sunday':
      rahuKalam = '04:30 PM – 06:00 PM';
      yamagandam = '12:00 PM – 01:30 PM';
      kuligai = '03:00 PM – 04:30 PM';
      nallaNeram = '07:30 AM – 08:30 AM & 03:00 PM – 04:00 PM';
      break;
    case 'Monday':
      rahuKalam = '07:30 AM – 09:00 AM';
      yamagandam = '10:30 AM – 12:00 PM';
      kuligai = '01:30 PM – 03:00 PM';
      nallaNeram = '06:00 AM – 07:00 AM & 09:00 AM – 10:00 AM';
      break;
    case 'Tuesday':
      rahuKalam = '03:00 PM – 04:30 PM';
      yamagandam = '09:00 AM – 10:30 AM';
      kuligai = '12:00 PM – 01:30 PM';
      nallaNeram = '07:30 AM – 08:30 AM & 04:30 PM – 05:30 PM';
      break;
    case 'Wednesday':
      rahuKalam = '12:00 PM – 01:30 PM';
      yamagandam = '07:30 AM – 09:00 AM';
      kuligai = '10:30 AM – 12:00 PM';
      nallaNeram = '09:00 AM – 10:00 AM & 04:30 PM – 05:30 PM';
      break;
    case 'Thursday':
      rahuKalam = '01:30 PM – 03:00 PM';
      yamagandam = '06:00 AM – 07:30 AM';
      kuligai = '09:00 AM – 10:30 AM';
      nallaNeram = '09:00 AM – 10:00 AM & 04:30 PM – 05:30 PM';
      break;
    case 'Friday':
      rahuKalam = '10:30 AM – 12:00 PM';
      yamagandam = '03:00 PM – 04:30 PM';
      kuligai = '07:30 AM – 09:00 AM';
      nallaNeram = '09:00 AM – 10:00 AM & 04:30 PM – 05:30 PM';
      break;
    case 'Saturday':
      rahuKalam = '09:00 AM – 10:30 AM';
      yamagandam = '01:30 PM – 03:00 PM';
      kuligai = '06:00 AM – 07:30 AM';
      nallaNeram = '07:30 AM – 08:30 AM & 04:30 PM – 05:30 PM';
      break;
  }

  return {
    gregorianDate: dateStr,
    tamilMonth,
    tamilDate,
    dayOfWeek,
    festival,
    isSpecial,
    rahuKalam,
    yamagandam,
    kuligai,
    nallaNeram,
  };
}
