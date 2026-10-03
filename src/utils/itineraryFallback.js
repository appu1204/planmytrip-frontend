// Rich destination geocoding, landmark catalog, and route stop generator
// Ensures accurate real-time mapping for any destination (Kerala, Goa, Himachal, Delhi, etc.)

// Common typos, colloquialisms, and synonyms mapped to canonical destination names
const DESTINATION_ALIASES = {
  // Kerala variations & typos
  kerela: "kerala",
  kerla: "kerala",
  keralam: "kerala",
  kearala: "kerala",
  karala: "kerala",
  cochin: "kochi",
  ernakulam: "kochi",
  alappuzha: "alleppey",
  alappuzha_beach: "alleppey",
  alappuzha_backwaters: "alleppey",
  vembanad: "alleppey",
  mararikulam: "marari",
  periyar: "thekkady",
  thiruvananthapuram: "trivandrum",
  "god's own country": "kerala",
  "gods own country": "kerala",

  // Karnataka & South India
  banglore: "bengaluru",
  bangalore: "bengaluru",
  mysuru: "mysore",
  kodagu: "coorg",
  madikeri: "coorg",
  pondi: "pondicherry",
  puducherry: "pondicherry",
  ootacamund: "ooty",
  kodai: "kodaikanal",
  vizag: "visakhapatnam",

  // North & West India
  dilli: "new delhi",
  delhi: "new delhi",
  ncr: "new delhi",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
  kashmeer: "kashmir",
  srinager: "srinagar",
  himachel: "himachal",
  himachal_pradesh: "himachal",
  dharamsala: "dharamshala",
  mcleodganj: "dharamshala",
  pink_city: "jaipur",
  city_of_lakes: "udaipur",
  blue_city: "jodhpur",
  golden_city: "jaisalmer",
  banaras: "varanasi",
  kashi: "varanasi",
  port_blair: "andaman",
  havelock: "andaman",
  swaraj_dweep: "andaman",

  // Uttar Pradesh & Braj Region
  mathura: "mathura",
  "mathura city": "mathura",
  "mathura uttar pradesh": "mathura",
  "mathura up": "mathura",
  vrindavan: "vrindavan",
  brindavan: "vrindavan",
  ayodhya: "ayodhya",
};

// Comprehensive GPS centers for popular destinations in India and worldwide
const DESTINATION_CENTERS = {
  // Kerala
  kerala: { lat: 9.9312, lng: 76.2673, label: "Kerala, India" },
  kerela: { lat: 9.9312, lng: 76.2673, label: "Kerala, India" },
  kochi: { lat: 9.9312, lng: 76.2673, label: "Kochi, Kerala" },
  cochin: { lat: 9.9312, lng: 76.2673, label: "Cochin, Kerala" },
  alleppey: { lat: 9.4981, lng: 76.3388, label: "Alleppey Backwaters, Kerala" },
  alappuzha: { lat: 9.4981, lng: 76.3388, label: "Alleppey, Kerala" },
  munnar: { lat: 10.0889, lng: 77.0595, label: "Munnar, Kerala" },
  wayanad: { lat: 11.6854, lng: 76.1320, label: "Wayanad, Kerala" },
  varkala: { lat: 8.7379, lng: 76.7163, label: "Varkala Cliff & Beach, Kerala" },
  thekkady: { lat: 9.6031, lng: 77.1615, label: "Thekkady, Kerala" },
  kovalam: { lat: 8.4004, lng: 76.9787, label: "Kovalam, Kerala" },
  trivandrum: { lat: 8.5241, lng: 76.9366, label: "Thiruvananthapuram, Kerala" },
  kumarakom: { lat: 9.6175, lng: 76.4301, label: "Kumarakom, Kerala" },
  marari: { lat: 9.6006, lng: 76.2990, label: "Marari Beach, Kerala" },
  athirappilly: { lat: 10.2851, lng: 76.5698, label: "Athirappilly, Kerala" },
  bekal: { lat: 12.3934, lng: 75.0315, label: "Bekal, Kerala" },
  vagamon: { lat: 9.6892, lng: 76.9077, label: "Vagamon, Kerala" },

  // South India
  bengaluru: { lat: 12.9716, lng: 77.5946, label: "Bengaluru, Karnataka" },
  bangalore: { lat: 12.9716, lng: 77.5946, label: "Bengaluru, Karnataka" },
  mysore: { lat: 12.2958, lng: 76.6394, label: "Mysuru, Karnataka" },
  coorg: { lat: 12.4244, lng: 75.7382, label: "Coorg, Karnataka" },
  hampi: { lat: 15.3350, lng: 76.4600, label: "Hampi, Karnataka" },
  gokarna: { lat: 14.5479, lng: 74.3188, label: "Gokarna, Karnataka" },
  chikmagalur: { lat: 13.3161, lng: 75.7720, label: "Chikmagalur, Karnataka" },
  chennai: { lat: 13.0827, lng: 80.2707, label: "Chennai, Tamil Nadu" },
  pondicherry: { lat: 11.9416, lng: 79.8083, label: "Puducherry" },
  ooty: { lat: 11.4102, lng: 76.6950, label: "Ooty, Tamil Nadu" },
  kodaikanal: { lat: 10.2381, lng: 77.4892, label: "Kodaikanal, Tamil Nadu" },
  madurai: { lat: 9.9252, lng: 78.1198, label: "Madurai, Tamil Nadu" },
  rameswaram: { lat: 9.2876, lng: 79.3129, label: "Rameswaram, Tamil Nadu" },
  kanyakumari: { lat: 8.0883, lng: 77.5385, label: "Kanyakumari, Tamil Nadu" },
  hyderabad: { lat: 17.3850, lng: 78.4867, label: "Hyderabad, Telangana" },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, label: "Visakhapatnam, Andhra Pradesh" },

  // Goa
  goa: { lat: 15.4989, lng: 73.8278, label: "Goa, India" },
  "north goa": { lat: 15.5553, lng: 73.7517, label: "North Goa" },
  "south goa": { lat: 15.1500, lng: 73.9800, label: "South Goa" },

  // West & Central India
  mumbai: { lat: 19.0760, lng: 72.8777, label: "Mumbai, Maharashtra" },
  pune: { lat: 18.5204, lng: 73.8567, label: "Pune, Maharashtra" },
  lonavala: { lat: 18.7557, lng: 73.4091, label: "Lonavala, Maharashtra" },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586, label: "Mahabaleshwar, Maharashtra" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: "Ahmedabad, Gujarat" },
  kutch: { lat: 23.8344, lng: 69.8398, label: "Rann of Kutch, Gujarat" },
  indore: { lat: 22.7196, lng: 75.8577, label: "Indore, Madhya Pradesh" },
  bhopal: { lat: 23.2599, lng: 77.4126, label: "Bhopal, Madhya Pradesh" },

  // North India & Himalayas
  "new delhi": { lat: 28.6139, lng: 77.2090, label: "New Delhi, India" },
  delhi: { lat: 28.6139, lng: 77.2090, label: "Delhi, India" },
  jaipur: { lat: 26.9124, lng: 75.7873, label: "Jaipur, Rajasthan" },
  udaipur: { lat: 24.5854, lng: 73.7125, label: "Udaipur, Rajasthan" },
  jodhpur: { lat: 26.2389, lng: 73.0243, label: "Jodhpur, Rajasthan" },
  jaisalmer: { lat: 26.9157, lng: 70.9083, label: "Jaisalmer, Rajasthan" },
  pushkar: { lat: 26.4897, lng: 74.5511, label: "Pushkar, Rajasthan" },
  agra: { lat: 27.1767, lng: 78.0081, label: "Agra, Uttar Pradesh" },
  mathura: { lat: 27.4924, lng: 77.6737, label: "Mathura, Uttar Pradesh" },
  vrindavan: { lat: 27.5807, lng: 77.7006, label: "Vrindavan, Uttar Pradesh" },
  ayodhya: { lat: 26.7922, lng: 82.1998, label: "Ayodhya, Uttar Pradesh" },
  varanasi: { lat: 25.3176, lng: 82.9739, label: "Varanasi, Uttar Pradesh" },
  lucknow: { lat: 26.8467, lng: 80.9462, label: "Lucknow, Uttar Pradesh" },
  amritsar: { lat: 31.6340, lng: 74.8723, label: "Amritsar, Punjab" },
  chandigarh: { lat: 30.7333, lng: 76.7794, label: "Chandigarh, India" },
  manali: { lat: 32.2432, lng: 77.1892, label: "Manali, Himachal Pradesh" },
  shimla: { lat: 31.1048, lng: 77.1734, label: "Shimla, Himachal Pradesh" },
  dharamshala: { lat: 32.2190, lng: 76.3234, label: "Dharamshala, Himachal Pradesh" },
  kasol: { lat: 32.0100, lng: 77.3150, label: "Kasol, Himachal Pradesh" },
  spiti: { lat: 32.2276, lng: 78.0710, label: "Spiti Valley, Himachal Pradesh" },
  rishikesh: { lat: 30.0869, lng: 78.2676, label: "Rishikesh, Uttarakhand" },
  haridwar: { lat: 29.9457, lng: 78.1642, label: "Haridwar, Uttarakhand" },
  dehradun: { lat: 30.3165, lng: 78.0322, label: "Dehradun, Uttarakhand" },
  mussoorie: { lat: 30.4598, lng: 78.0644, label: "Mussoorie, Uttarakhand" },
  nainital: { lat: 29.3919, lng: 79.4542, label: "Nainital, Uttarakhand" },
  corbett: { lat: 29.5300, lng: 78.7747, label: "Jim Corbett, Uttarakhand" },
  kashmir: { lat: 34.0837, lng: 74.7973, label: "Kashmir, India" },
  srinagar: { lat: 34.0837, lng: 74.7973, label: "Srinagar, Kashmir" },
  gulmarg: { lat: 34.0484, lng: 74.3805, label: "Gulmarg, Kashmir" },
  pahalgam: { lat: 34.0163, lng: 75.3150, label: "Pahalgam, Kashmir" },
  leh: { lat: 34.1526, lng: 77.5771, label: "Leh, Ladakh" },
  ladakh: { lat: 34.1526, lng: 77.5771, label: "Ladakh, India" },

  // East & North-East India
  kolkata: { lat: 22.5726, lng: 88.3639, label: "Kolkata, West Bengal" },
  darjeeling: { lat: 27.0410, lng: 88.2663, label: "Darjeeling, West Bengal" },
  gangtok: { lat: 27.3389, lng: 88.6065, label: "Gangtok, Sikkim" },
  shillong: { lat: 25.5788, lng: 91.8933, label: "Shillong, Meghalaya" },
  puri: { lat: 19.8135, lng: 85.8312, label: "Puri, Odisha" },
  andaman: { lat: 11.6234, lng: 92.7265, label: "Andaman Islands" },
  lakshadweep: { lat: 10.5667, lng: 72.6417, label: "Lakshadweep Islands" },

  // International
  dubai: { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
  singapore: { lat: 1.3521, lng: 103.8198, label: "Singapore" },
  bangkok: { lat: 13.7563, lng: 100.5018, label: "Bangkok, Thailand" },
  phuket: { lat: 7.8804, lng: 98.3923, label: "Phuket, Thailand" },
  bali: { lat: -8.4095, lng: 115.1889, label: "Bali, Indonesia" },
  paris: { lat: 48.8566, lng: 2.3522, label: "Paris, France" },
  london: { lat: 51.5074, lng: -0.1278, label: "London, UK" },
  tokyo: { lat: 35.6762, lng: 139.6503, label: "Tokyo, Japan" },
  "new york": { lat: 40.7128, lng: -74.0060, label: "New York, USA" },
  maldives: { lat: 3.2028, lng: 73.2207, label: "Maldives" },
  switzerland: { lat: 47.3769, lng: 8.5417, label: "Zurich, Switzerland" },
  rome: { lat: 41.9028, lng: 12.4964, label: "Rome, Italy" },
  barcelona: { lat: 41.3879, lng: 2.1699, label: "Barcelona, Spain" },
};

// Extensive Landmark & Place Dictionary for Itinerary Activities
// Maps place names and keywords directly to their realistic GPS coordinates
const SPECIFIC_PLACES = [
  // Kerala Landmarks
  { keywords: ["cochin airport", "cial", "nedumbassery"], lat: 10.1518, lng: 76.3930, name: "Cochin International Airport" },
  { keywords: ["fort kochi", "mattancherry", "jew town", "chinese fishing"], lat: 9.9674, lng: 76.2454, name: "Fort Kochi & Harbor" },
  { keywords: ["kochi", "cochin", "marine drive", "ernakulam"], lat: 9.9816, lng: 76.2750, name: "Kochi City & Marine Drive" },
  { keywords: ["marari beach", "marari homestay", "marari"], lat: 9.6006, lng: 76.2990, name: "Marari Beach" },
  { keywords: ["alleppey", "alappuzha", "backwaters", "houseboat"], lat: 9.4981, lng: 76.3388, name: "Alleppey Backwaters" },
  { keywords: ["punnamada", "punnamada lake", "punnamada lake walk"], lat: 9.5200, lng: 76.3650, name: "Punnamada Lake" },
  { keywords: ["shikara", "shikara boat", "vembanad"], lat: 9.5050, lng: 76.3500, name: "Vembanad Lake Shikara Cruise" },
  { keywords: ["varkala beach", "papanasam beach", "varkala"], lat: 8.7379, lng: 76.7163, name: "Varkala Beach" },
  { keywords: ["cliffside", "varkala cliff", "north cliff", "south cliff", "cliff"], lat: 8.7420, lng: 76.7080, name: "Varkala Cliff Promenade" },
  { keywords: ["yoga", "morning yoga", "ocean yoga", "ocean"], lat: 8.7350, lng: 76.7120, name: "Oceanfront Coastal Point" },
  { keywords: ["trivandrum", "thiruvananthapuram", "padmanabhaswamy"], lat: 8.5241, lng: 76.9366, name: "Thiruvananthapuram City" },
  { keywords: ["kovalam", "lighthouse beach", "hawah beach"], lat: 8.4004, lng: 76.9787, name: "Kovalam Lighthouse Beach" },
  { keywords: ["munnar", "tea garden", "tea plantation", "tea museum"], lat: 10.0889, lng: 77.0595, name: "Munnar Tea Hills" },
  { keywords: ["mattupetty", "mattupetty dam", "echo point"], lat: 10.1064, lng: 77.1245, name: "Mattupetty Dam" },
  { keywords: ["eravikulam", "anamudi", "nilgiri tahr"], lat: 10.2000, lng: 77.0600, name: "Eravikulam National Park" },
  { keywords: ["thekkady", "periyar lake", "periyar wildlife", "spice garden"], lat: 9.6031, lng: 77.1615, name: "Periyar Wildlife Sanctuary" },
  { keywords: ["wayanad", "edakkal", "banasura sagar", "chembra"], lat: 11.6854, lng: 76.1320, name: "Wayanad Hills" },
  { keywords: ["kumarakom", "kumarakom bird"], lat: 9.6175, lng: 76.4301, name: "Kumarakom Sanctuary" },
  { keywords: ["athirappilly", "athirapally", "waterfall"], lat: 10.2851, lng: 76.5698, name: "Athirappilly Waterfalls" },

  // Goa Landmarks
  { keywords: ["goa airport", "dabolim", "mopa"], lat: 15.3808, lng: 73.8314, name: "Goa Airport" },
  { keywords: ["baga beach", "tito"], lat: 15.5553, lng: 73.7517, name: "Baga Beach" },
  { keywords: ["calangute"], lat: 15.5442, lng: 73.7554, name: "Calangute Beach" },
  { keywords: ["anjuna", "anjuna flea market"], lat: 15.5733, lng: 73.7410, name: "Anjuna Beach" },
  { keywords: ["vagator", "chapora fort"], lat: 15.6059, lng: 73.7389, name: "Chapora Fort & Vagator" },
  { keywords: ["aguada", "fort aguada", "candolim"], lat: 15.4924, lng: 73.7738, name: "Fort Aguada" },
  { keywords: ["panaji", "fontainhas", "latin quarter"], lat: 15.4989, lng: 73.8278, name: "Fontainhas Panaji" },
  { keywords: ["palolem", "agonda"], lat: 15.0100, lng: 74.0232, name: "Palolem Beach" },

  // Delhi Landmarks
  { keywords: ["delhi airport", "igi airport", "indira gandhi"], lat: 28.5562, lng: 77.1000, name: "Indira Gandhi Airport (DEL)" },
  { keywords: ["india gate", "kartavya path"], lat: 28.6129, lng: 77.2295, name: "India Gate" },
  { keywords: ["connaught place", "cp"], lat: 28.6315, lng: 77.2167, name: "Connaught Place" },
  { keywords: ["red fort", "lal qila"], lat: 28.6562, lng: 77.2410, name: "Red Fort" },
  { keywords: ["qutub minar", "mehrauli"], lat: 28.5244, lng: 77.1855, name: "Qutub Minar" },
  { keywords: ["humayun"], lat: 28.5873, lng: 77.2464, name: "Humayun's Tomb" },
  { keywords: ["lotus temple", "bahai"], lat: 28.5535, lng: 77.2588, name: "Lotus Temple" },
  { keywords: ["akshardham"], lat: 28.6127, lng: 77.2773, name: "Akshardham Temple" },
  { keywords: ["chandni chowk", "jama masjid"], lat: 28.6505, lng: 77.2303, name: "Chandni Chowk" },
  { keywords: ["lodhi garden"], lat: 28.5933, lng: 77.2197, name: "Lodhi Garden" },

  // Bengaluru Landmarks
  { keywords: ["kempegowda airport", "bangalore airport", "kia"], lat: 13.1986, lng: 77.7066, name: "Kempegowda Int'l Airport" },
  { keywords: ["cubbon park", "vidhana soudha"], lat: 12.9763, lng: 77.5929, name: "Cubbon Park & Vidhana Soudha" },
  { keywords: ["lalbagh", "botanical garden"], lat: 12.9507, lng: 77.5848, name: "Lalbagh Garden" },
  { keywords: ["bangalore palace"], lat: 12.9988, lng: 77.5921, name: "Bangalore Palace" },
  { keywords: ["indiranagar", "100ft road"], lat: 12.9719, lng: 77.6412, name: "Indiranagar 100ft Rd" },
  { keywords: ["commercial street"], lat: 12.9822, lng: 77.6083, name: "Commercial Street" },

  // Rajasthan Landmarks
  { keywords: ["amber fort", "amer fort"], lat: 26.9855, lng: 75.8513, name: "Amer Fort" },
  { keywords: ["hawa mahal"], lat: 26.9239, lng: 75.8267, name: "Hawa Mahal" },
  { keywords: ["city palace jaipur"], lat: 26.9258, lng: 75.8236, name: "City Palace Jaipur" },
  { keywords: ["jal mahal"], lat: 26.9534, lng: 75.8462, name: "Jal Mahal" },
  { keywords: ["nahargarh"], lat: 26.9372, lng: 75.8156, name: "Nahargarh Fort" },
  { keywords: ["lake pichola", "city palace udaipur"], lat: 24.5764, lng: 73.6835, name: "Lake Pichola & City Palace" },
  { keywords: ["mehrangarh"], lat: 26.2978, lng: 73.0185, name: "Mehrangarh Fort" },
  { keywords: ["sam sand dunes", "jaisalmer fort"], lat: 26.8333, lng: 70.5167, name: "Jaisalmer Dunes" },

  // Himachal & Himalayas
  { keywords: ["solang valley", "solang"], lat: 32.3167, lng: 77.1583, name: "Solang Valley" },
  { keywords: ["atal tunnel", "rohtang"], lat: 32.3667, lng: 77.2000, name: "Atal Tunnel & Rohtang" },
  { keywords: ["hadimba", "mall road manali"], lat: 32.2483, lng: 77.1811, name: "Hadimba Temple & Mall Road" },
  { keywords: ["dal lake", "shikara ride srinagar"], lat: 34.0837, lng: 74.8373, name: "Dal Lake Srinagar" },
  { keywords: ["gulmarg gondola"], lat: 34.0484, lng: 74.3805, name: "Gulmarg Gondola" },
  { keywords: ["ram jhula", "lakshman jhula", "triveni ghat", "ganga aarti"], lat: 30.1250, lng: 78.3180, name: "Ram Jhula & Ganga Aarti" },

  // Mathura, Vrindavan & Braj Heritage
  { keywords: ["krishna janmabhoomi", "janmabhoomi", "keshava deo", "shri krishna"], lat: 27.5048, lng: 77.6698, name: "Shri Krishna Janmabhoomi Temple" },
  { keywords: ["dwarkadhish", "dwarkadheesh"], lat: 27.5050, lng: 77.6835, name: "Dwarkadhish Temple Mathura" },
  { keywords: ["vishram ghat", "yamuna aarti", "yamuna ghat", "potara kund"], lat: 27.5020, lng: 77.6830, name: "Vishram Ghat & Yamuna Aarti" },
  { keywords: ["banke bihari", "bihari ji"], lat: 27.5800, lng: 77.7010, name: "Banke Bihari Temple Vrindavan" },
  { keywords: ["prem mandir"], lat: 27.5714, lng: 77.6740, name: "Prem Mandir Vrindavan" },
  { keywords: ["iskcon vrindavan", "krishna balaram"], lat: 27.5727, lng: 77.6832, name: "ISKCON Krishna Balaram Temple" },
  { keywords: ["govardhan", "giriraj", "govardhan hill", "parikrama"], lat: 27.4947, lng: 77.4646, name: "Govardhan Hill & Daan Ghati" },
  { keywords: ["radha kund", "shyam kund"], lat: 27.5255, lng: 77.4950, name: "Radha Kund & Shyam Kund" },
  { keywords: ["barsana", "radharani temple"], lat: 27.6492, lng: 77.3745, name: "Radharani Temple Barsana" },
  { keywords: ["gokul", "raman reti"], lat: 27.4398, lng: 77.7197, name: "Gokul & Raman Reti" },
];

// Helper: Normalize destination string (handling typos, extra symbols, aliases, and multi-line inputs)
export function normalizeDestinationName(rawDestination = "") {
  if (!rawDestination) return "kerala";

  // Handle multi-line strings (e.g. "Mathura\nCity in Uttar Pradesh") by taking the primary line
  const firstLine = String(rawDestination).split(/[\r\n]+/)[0].trim() || rawDestination;
  let cleaned = firstLine
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

  // Remove administrative descriptive phrasing like "city in uttar pradesh" -> "mathura"
  cleaned = cleaned.replace(/\b(city|town|district|state)\s+in\s+.*$/gi, "").trim();

  // Direct alias check
  if (DESTINATION_ALIASES[cleaned]) {
    return DESTINATION_ALIASES[cleaned];
  }

  // Underscored check
  const underscored = cleaned.replace(/\s+/g, "_");
  if (DESTINATION_ALIASES[underscored]) {
    return DESTINATION_ALIASES[underscored];
  }

  // Common spelling typos for Kerala ("kerela", "kerla", "kearala", "keralam")
  if (/^k[ea]+r+[ea]+l+[ea]*m*$/.test(cleaned)) {
    return "kerala";
  }

  // Common spelling typos for Bengaluru ("banglore", "bangalore")
  if (/^b[ae]ng[ae]l[ou]r[eu]*$/.test(cleaned)) {
    return "bengaluru";
  }

  // Common spelling typos for Kashmir ("kashmeer", "kashmira")
  if (/^kashm[ie]+r*$/.test(cleaned)) {
    return "kashmir";
  }

  return cleaned;
}

// In-memory cache for dynamically geocoded destinations from user input
const DYNAMIC_GEO_CACHE = new Map();

export function setResolvedDestinationCoords(destination, coords) {
  if (!destination || !coords || !coords.lat || !coords.lng) return;
  const norm = normalizeDestinationName(destination);
  DYNAMIC_GEO_CACHE.set(norm, coords);
}

export function getResolvedDestinationCoords(destination) {
  if (!destination) return null;
  const norm = normalizeDestinationName(destination);
  return DYNAMIC_GEO_CACHE.get(norm) || null;
}

// Find center GPS coordinate for any destination with dynamic geocoding support
export function getDestinationCenter(destination = "", returnFallback = true) {
  const norm = normalizeDestinationName(destination);

  // 1. Check dynamically resolved coordinates (works for ANY user-inputted location)
  if (DYNAMIC_GEO_CACHE.has(norm)) {
    return DYNAMIC_GEO_CACHE.get(norm);
  }

  // 2. Exact or alias match in predefined catalogue
  if (DESTINATION_CENTERS[norm]) {
    return DESTINATION_CENTERS[norm];
  }

  // 3. Substring match
  for (const [key, center] of Object.entries(DESTINATION_CENTERS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return center;
    }
  }

  // 4. Check if destination words match any center
  const words = norm.split(" ");
  for (const word of words) {
    if (word.length > 2) {
      for (const [key, center] of Object.entries(DESTINATION_CENTERS)) {
        if (key.includes(word) || word.includes(key)) {
          return center;
        }
      }
    }
  }

  if (!returnFallback) {
    return null;
  }

  // Neutral geographical center for unknown destinations when fallback is needed
  return { lat: 20.5937, lng: 78.9629, label: destination || "Destination" };
}

const ARRIVAL_ACTIVITIES = [
  { time: "10:30 AM", title: "Arrive & transfer to hotel", note: "Pre-booked cab from the airport/station." },
  { time: "1:00 PM", title: "Check-in & settle in", note: "Room confirmed, freshen up and recharge." },
  { time: "5:30 PM", title: "Evening landmark walk", note: "Easy scenic stroll to take in the local atmosphere." },
];

const EXPLORE_ACTIVITIES = [
  { time: "9:00 AM", title: "Sightseeing & heritage tour", note: "Visit premier cultural monuments and viewpoints." },
  { time: "1:00 PM", title: "Lunch at a top-rated local dining spot", note: "Savor authentic regional flavors." },
  { time: "4:00 PM", title: "Local markets & experiences", note: "Browse artisan goods, take photos, and relax." },
  { time: "7:30 PM", title: "Evening dinner & cafe hopping", note: "Unwind at a popular restaurant nearby." },
];

const DEPARTURE_ACTIVITIES = [
  { time: "9:30 AM", title: "Check-out & souvenir stop", note: "Pack bags, settle checkout, pick up last-minute keepsakes." },
  { time: "12:00 PM", title: "Transfer to airport/station", note: "Depart with plenty of buffer time for transit." },
];

export function buildFallbackItinerary(trip = {}) {
  const destination = trip.destination || "your destination";
  const checkIn = trip.checkIn || trip.startDate;
  const checkOut = trip.checkOut || trip.endDate;

  const start = checkIn ? new Date(checkIn) : new Date();
  const end = checkOut ? new Date(checkOut) : new Date(start.getTime() + 4 * 86400000);
  const diffDays = Math.round((end - start) / 86400000);
  const nights = diffDays > 0 ? diffDays : 3;
  const totalDays = nights + 1;

  return {
    id: `fallback-${Date.now()}`,
    destination,
    durationDays: totalDays,
    days: Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(start.getTime() + i * 86400000);
      const isFirst = i === 0;
      const isLast = i === totalDays - 1 && totalDays > 1;
      const source = isFirst ? ARRIVAL_ACTIVITIES : isLast ? DEPARTURE_ACTIVITIES : EXPLORE_ACTIVITIES;

      return {
        id: `day-${i + 1}`,
        index: i + 1,
        dayNumber: i + 1,
        label: isFirst ? "Arrival & check-in" : isLast ? "Departure & farewell" : `Explore ${destination}`,
        title: isFirst ? "Arrival & check-in" : isLast ? "Departure & farewell" : `Explore ${destination}`,
        dateLabel: date.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short" }),
        date: date.toISOString().split("T")[0],
        activities: source.map((a, j) => ({
          id: `day-${i + 1}-act-${j + 1}`,
          ...a,
        })),
      };
    }),
  };
}

// Convert itinerary activities into rich route stops with real GPS coordinates for Google Maps
export function itineraryToRouteStops(itinerary, rawDestination = "", overrideCenter = null) {
  if (!itinerary?.days?.length) return [];

  const normDest = normalizeDestinationName(rawDestination || itinerary.destination || "");
  const center =
    overrideCenter && overrideCenter.lat && overrideCenter.lng
      ? overrideCenter
      : getDestinationCenter(normDest);

  const stops = [];
  let stopCounter = 1;

  // Track previous coordinates to ensure progressive route flow
  let lastLat = center.lat;
  let lastLng = center.lng;

  itinerary.days.forEach((day, dayIdx) => {
    const dayActivities =
      day.activities && day.activities.length > 0
        ? day.activities
        : [{ id: `${day.id}-act-0`, title: day.label || day.title || `Day ${day.index}`, time: "All day" }];

    dayActivities.forEach((act, actIdx) => {
      const text = `${act.title || ""} ${act.name || ""} ${act.note || ""} ${act.description || ""}`.toLowerCase();

      // 1. Scan against comprehensive specific place catalogue
      let matchedPlace = null;
      for (const place of SPECIFIC_PLACES) {
        if (place.keywords.some((kw) => text.includes(kw))) {
          matchedPlace = place;
          break;
        }
      }

      let lat;
      let lng;

      if (matchedPlace) {
        lat = matchedPlace.lat;
        lng = matchedPlace.lng;
      } else {
        // 2. Realistic geographic route spreading along the destination region
        // Rather than collapsing into a single point, spread stops along the day's progression
        const stepOffset = 0.018 * (actIdx + 1);
        const dayDirection = ((dayIdx * 65 + actIdx * 25) * Math.PI) / 180;

        lat = center.lat + Math.sin(dayDirection) * stepOffset;
        lng = center.lng + Math.cos(dayDirection) * stepOffset;
      }

      lastLat = lat;
      lastLng = lng;

      stops.push({
        id: act.id || `stop-${day.id}-${actIdx}`,
        stopIndex: stopCounter++,
        dayId: day.id,
        dayNumber: day.index || day.dayNumber || dayIdx + 1,
        dayLabel: `Day ${day.index || day.dayNumber || dayIdx + 1}`,
        name: act.title || act.name || `Stop ${stopCounter}`,
        time: act.time || "Anytime",
        note: act.note || act.description || "",
        tag: act.tag || (actIdx === 0 ? "Arrival / Morning" : actIdx === dayActivities.length - 1 ? "Evening" : "Sightseeing"),
        lat,
        lng,
        destination: normDest.charAt(0).toUpperCase() + normDest.slice(1),
      });
    });
  });

  return stops;
}
