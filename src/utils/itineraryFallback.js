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
  kyoto: { lat: 35.0116, lng: 135.7681, label: "Kyoto, Japan" },
  "new york": { lat: 40.7128, lng: -74.0060, label: "New York, USA" },
  maldives: { lat: 3.2028, lng: 73.2207, label: "Maldives" },
  switzerland: { lat: 47.3769, lng: 8.5417, label: "Zurich, Switzerland" },
  "swiss alps": { lat: 46.6863, lng: 7.8632, label: "Swiss Alps, Switzerland" },
  interlaken: { lat: 46.6863, lng: 7.8632, label: "Interlaken, Switzerland" },
  rome: { lat: 41.9028, lng: 12.4964, label: "Rome, Italy" },
  barcelona: { lat: 41.3879, lng: 2.1699, label: "Barcelona, Spain" },
};

// Extensive Landmark & Place Dictionary for Itinerary Activities
// Maps place names and keywords directly to their realistic GPS coordinates
const SPECIFIC_PLACES = [
  // Kashmir Landmarks
  { keywords: ["srinagar airport", "sxr airport", "sheikh ul-alam"], lat: 33.9871, lng: 74.7744, name: "Srinagar International Airport (SXR)", destination: "kashmir" },
  { keywords: ["dal lake", "houseboat", "lake houseboat", "cedar houseboat"], lat: 34.1030, lng: 74.8720, name: "Dal Lake Houseboats & Ghats", destination: "kashmir" },
  { keywords: ["shikara", "char chinar", "floating garden", "shikara ride"], lat: 34.0860, lng: 74.8350, name: "Dal Lake Shikara Ghat & Char Chinar", destination: "kashmir" },
  { keywords: ["wazwan", "rogan josh", "kashmiri feast", "ahdoos"], lat: 34.0740, lng: 74.8140, name: "Boulevard Kashmiri Wazwan Dining", destination: "kashmir" },
  { keywords: ["nishat bagh", "shalimar bagh", "mughal garden", "royal terrace"], lat: 34.1250, lng: 74.8785, name: "Nishat & Shalimar Mughal Gardens", destination: "kashmir" },
  { keywords: ["hazratbal", "hazratbal dargah"], lat: 34.1278, lng: 74.8431, name: "Hazratbal Dargah Shrine", destination: "kashmir" },
  { keywords: ["jamia masjid", "old srinagar", "deodar timber"], lat: 34.0994, lng: 74.8147, name: "Jamia Masjid & Old Srinagar", destination: "kashmir" },
  { keywords: ["chashme shahi", "pari mahal"], lat: 34.0872, lng: 74.8770, name: "Pari Mahal & Chashme Shahi", destination: "kashmir" },
  { keywords: ["gulmarg", "meadow of flowers"], lat: 34.0530, lng: 74.4200, name: "Gulmarg Alpine Valley", destination: "kashmir" },
  { keywords: ["gulmarg gondola", "apharwat", "apharwat peak"], lat: 34.0484, lng: 74.3805, name: "Gulmarg Gondola & Apharwat Peak", destination: "kashmir" },
  { keywords: ["st mary", "golf course stroll", "victorian stone"], lat: 34.0530, lng: 74.3880, name: "Gulmarg St. Mary's & Golf Meadows", destination: "kashmir" },
  { keywords: ["pahalgam", "pampore", "saffron field", "lidder"], lat: 34.0163, lng: 75.3150, name: "Pahalgam Valley & Lidder River", destination: "kashmir" },
  { keywords: ["betaab valley", "aru valley"], lat: 34.0370, lng: 75.3520, name: "Betaab Valley & Aru Valley", destination: "kashmir" },
  { keywords: ["baisaran", "mini switzerland"], lat: 34.0040, lng: 75.3280, name: "Baisaran 'Mini Switzerland'", destination: "kashmir" },
  { keywords: ["lal chowk", "pashmina", "walnut wood"], lat: 34.0722, lng: 74.8085, name: "Lal Chowk Artisan Market", destination: "kashmir" },
  { keywords: ["chai jaai", "kahwa", "tea room"], lat: 34.0715, lng: 74.8180, name: "Chai Jaai Vintage Tea Room", destination: "kashmir" },
  { keywords: ["sonamarg", "thajiwas"], lat: 34.3050, lng: 75.2950, name: "Sonamarg Meadow of Gold", destination: "kashmir" },
  { keywords: ["shankaracharya"], lat: 34.0750, lng: 74.8480, name: "Shankaracharya Hill Temple", destination: "kashmir" },

  // Goa Landmarks
  { keywords: ["goa airport", "dabolim"], lat: 15.3808, lng: 73.8314, name: "Dabolim International Airport (GOI)", destination: "goa" },
  { keywords: ["mopa airport", "manohar airport", "mopa"], lat: 15.7725, lng: 73.8683, name: "Manohar Int'l Airport Mopa (GOX)", destination: "goa" },
  { keywords: ["candolim", "candolim beach"], lat: 15.5173, lng: 73.7634, name: "Candolim Beach Promenade", destination: "goa" },
  { keywords: ["fort aguada", "aguada lighthouse", "aguada"], lat: 15.4924, lng: 73.7738, name: "Fort Aguada & Lighthouse", destination: "goa" },
  { keywords: ["baga", "baga beach", "tito"], lat: 15.5553, lng: 73.7517, name: "Baga Beach Promenade", destination: "goa" },
  { keywords: ["calangute", "calangute beach"], lat: 15.5442, lng: 73.7554, name: "Calangute Beach", destination: "goa" },
  { keywords: ["anjuna", "anjuna flea market"], lat: 15.5733, lng: 73.7410, name: "Anjuna Beach & Flea Market", destination: "goa" },
  { keywords: ["chapora", "chapora fort", "dil chahta hai"], lat: 15.6059, lng: 73.7389, name: "Chapora Fort & Dil Chahta Hai Viewpoint", destination: "goa" },
  { keywords: ["vagator", "vagator beach", "sundowner"], lat: 15.5980, lng: 73.7380, name: "Vagator Clifftop & Beach", destination: "goa" },
  { keywords: ["thalassa", "olive bar"], lat: 15.6265, lng: 73.7485, name: "Thalassa Clifftop Sunset Lounge", destination: "goa" },
  { keywords: ["bom jesus", "basilica of bom jesus"], lat: 15.5009, lng: 73.9116, name: "Basilica of Bom Jesus (Old Goa)", destination: "goa" },
  { keywords: ["se cathedral", "old goa cathedrals"], lat: 15.5034, lng: 73.9126, name: "Se Cathedral (Old Goa)", destination: "goa" },
  { keywords: ["fontainhas", "latin quarter", "panaji", "panjim"], lat: 15.4989, lng: 73.8278, name: "Fontainhas Latin Quarter Panaji", destination: "goa" },
  { keywords: ["mandovi", "sunset cruise", "river cruise"], lat: 15.4998, lng: 73.8320, name: "Mandovi River Cruise Terminal", destination: "goa" },
  { keywords: ["palolem", "palolem beach"], lat: 15.0100, lng: 74.0232, name: "Palolem Beach South Goa", destination: "goa" },
  { keywords: ["colva", "colva beach"], lat: 15.2750, lng: 73.9150, name: "Colva Beach South Goa", destination: "goa" },
  { keywords: ["dudhsagar", "dudhsagar waterfall"], lat: 15.3144, lng: 74.3143, name: "Dudhsagar Waterfalls", destination: "goa" },
  { keywords: ["sahakari", "spice plantation"], lat: 15.4120, lng: 74.0150, name: "Sahakari Spice Plantation Ponda", destination: "goa" },
  { keywords: ["panaji market", "panaji cashew", "viva panjim"], lat: 15.4950, lng: 73.8220, name: "Panaji Market & Heritage Cafes", destination: "goa" },
  { keywords: ["britto", "curlies"], lat: 15.5560, lng: 73.7510, name: "Baga Coastal Wavefront", destination: "goa" },

  // Kerala Landmarks
  { keywords: ["cochin airport", "cial", "nedumbassery"], lat: 10.1518, lng: 76.3930, name: "Cochin International Airport", destination: "kerala" },
  { keywords: ["fort kochi", "mattancherry", "jew town", "chinese fishing"], lat: 9.9674, lng: 76.2454, name: "Fort Kochi & Harbor", destination: "kerala" },
  { keywords: ["kochi", "cochin", "marine drive", "ernakulam"], lat: 9.9816, lng: 76.2750, name: "Kochi City & Marine Drive", destination: "kerala" },
  { keywords: ["marari beach", "marari homestay", "marari"], lat: 9.6006, lng: 76.2990, name: "Marari Beach", destination: "kerala" },
  { keywords: ["alleppey", "alappuzha", "backwaters", "kettuvallam"], lat: 9.4981, lng: 76.3388, name: "Alleppey Backwaters", destination: "kerala" },
  { keywords: ["punnamada", "punnamada lake walk"], lat: 9.5200, lng: 76.3650, name: "Punnamada Lake", destination: "kerala" },
  { keywords: ["vembanad lake", "vembanad"], lat: 9.5050, lng: 76.3500, name: "Vembanad Lake Shikara Cruise", destination: "kerala" },
  { keywords: ["varkala beach", "papanasam beach"], lat: 8.7379, lng: 76.7163, name: "Varkala Beach", destination: "kerala" },
  { keywords: ["varkala cliff", "north cliff", "south cliff"], lat: 8.7420, lng: 76.7080, name: "Varkala Cliff Promenade", destination: "kerala" },
  { keywords: ["trivandrum", "thiruvananthapuram", "padmanabhaswamy"], lat: 8.5241, lng: 76.9366, name: "Thiruvananthapuram City", destination: "kerala" },
  { keywords: ["kovalam", "lighthouse beach", "hawah beach"], lat: 8.4004, lng: 76.9787, name: "Kovalam Lighthouse Beach", destination: "kerala" },
  { keywords: ["munnar", "tea garden", "tea plantation", "tea museum"], lat: 10.0889, lng: 77.0595, name: "Munnar Tea Hills", destination: "kerala" },
  { keywords: ["mattupetty", "mattupetty dam", "echo point"], lat: 10.1064, lng: 77.1245, name: "Mattupetty Dam", destination: "kerala" },
  { keywords: ["eravikulam", "anamudi", "nilgiri tahr"], lat: 10.2000, lng: 77.0600, name: "Eravikulam National Park", destination: "kerala" },
  { keywords: ["thekkady", "periyar lake", "periyar wildlife"], lat: 9.6031, lng: 77.1615, name: "Periyar Wildlife Sanctuary", destination: "kerala" },
  { keywords: ["wayanad", "edakkal", "banasura sagar", "chembra"], lat: 11.6854, lng: 76.1320, name: "Wayanad Hills", destination: "kerala" },
  { keywords: ["kumarakom", "kumarakom bird"], lat: 9.6175, lng: 76.4301, name: "Kumarakom Sanctuary", destination: "kerala" },
  { keywords: ["athirappilly", "athirapally waterfall"], lat: 10.2851, lng: 76.5698, name: "Athirappilly Waterfalls", destination: "kerala" },

  // Delhi Landmarks
  { keywords: ["delhi airport", "igi airport", "indira gandhi"], lat: 28.5562, lng: 77.1000, name: "Indira Gandhi Airport (DEL)", destination: "delhi" },
  { keywords: ["india gate", "kartavya path"], lat: 28.6129, lng: 77.2295, name: "India Gate", destination: "delhi" },
  { keywords: ["connaught place", "cp"], lat: 28.6315, lng: 77.2167, name: "Connaught Place", destination: "delhi" },
  { keywords: ["red fort", "lal qila"], lat: 28.6562, lng: 77.2410, name: "Red Fort", destination: "delhi" },
  { keywords: ["qutub minar", "mehrauli"], lat: 28.5244, lng: 77.1855, name: "Qutub Minar", destination: "delhi" },
  { keywords: ["humayun"], lat: 28.5873, lng: 77.2464, name: "Humayun's Tomb", destination: "delhi" },
  { keywords: ["lotus temple", "bahai"], lat: 28.5535, lng: 77.2588, name: "Lotus Temple", destination: "delhi" },
  { keywords: ["akshardham"], lat: 28.6127, lng: 77.2773, name: "Akshardham Temple", destination: "delhi" },
  { keywords: ["chandni chowk", "jama masjid"], lat: 28.6505, lng: 77.2303, name: "Chandni Chowk", destination: "delhi" },
  { keywords: ["lodhi garden", "lodhi"], lat: 28.5933, lng: 77.2197, name: "Lodhi Garden", destination: "delhi" },
  { keywords: ["sunder nursery"], lat: 28.5925, lng: 77.2470, name: "Sunder Nursery", destination: "delhi" },
  { keywords: ["hauz khas"], lat: 28.5494, lng: 77.1944, name: "Hauz Khas Village", destination: "delhi" },
  { keywords: ["bangla sahib"], lat: 28.6263, lng: 77.2090, name: "Gurudwara Bangla Sahib", destination: "delhi" },
  { keywords: ["dilli haat"], lat: 28.5733, lng: 77.2084, name: "Dilli Haat INA", destination: "delhi" },
  { keywords: ["paranthe wali gali"], lat: 28.6558, lng: 77.2312, name: "Paranthe Wali Gali", destination: "delhi" },
  { keywords: ["khari baoli"], lat: 28.6575, lng: 77.2215, name: "Khari Baoli Spice Market", destination: "delhi" },
  { keywords: ["national museum", "janpath"], lat: 28.6117, lng: 77.2195, name: "National Museum Janpath", destination: "delhi" },
  { keywords: ["khan market"], lat: 28.6003, lng: 77.2270, name: "Khan Market", destination: "delhi" },

  // Bengaluru Landmarks
  { keywords: ["kempegowda airport", "bangalore airport", "kia"], lat: 13.1986, lng: 77.7066, name: "Kempegowda Int'l Airport", destination: "bengaluru" },
  { keywords: ["cubbon park", "vidhana soudha"], lat: 12.9763, lng: 77.5929, name: "Cubbon Park & Vidhana Soudha", destination: "bengaluru" },
  { keywords: ["lalbagh", "botanical garden"], lat: 12.9507, lng: 77.5848, name: "Lalbagh Garden", destination: "bengaluru" },
  { keywords: ["bangalore palace"], lat: 12.9988, lng: 77.5921, name: "Bangalore Palace", destination: "bengaluru" },
  { keywords: ["indiranagar", "100ft road"], lat: 12.9719, lng: 77.6412, name: "Indiranagar 100ft Rd", destination: "bengaluru" },
  { keywords: ["commercial street"], lat: 12.9822, lng: 77.6083, name: "Commercial Street", destination: "bengaluru" },

  // Rajasthan Landmarks
  { keywords: ["amber fort", "amer fort"], lat: 26.9855, lng: 75.8513, name: "Amer Fort", destination: "rajasthan" },
  { keywords: ["hawa mahal"], lat: 26.9239, lng: 75.8267, name: "Hawa Mahal", destination: "rajasthan" },
  { keywords: ["city palace jaipur"], lat: 26.9258, lng: 75.8236, name: "City Palace Jaipur", destination: "rajasthan" },
  { keywords: ["jal mahal"], lat: 26.9534, lng: 75.8462, name: "Jal Mahal", destination: "rajasthan" },
  { keywords: ["nahargarh"], lat: 26.9372, lng: 75.8156, name: "Nahargarh Fort", destination: "rajasthan" },
  { keywords: ["lake pichola", "city palace udaipur"], lat: 24.5764, lng: 73.6835, name: "Lake Pichola & City Palace", destination: "rajasthan" },
  { keywords: ["mehrangarh"], lat: 26.2978, lng: 73.0185, name: "Mehrangarh Fort", destination: "rajasthan" },
  { keywords: ["sam sand dunes", "jaisalmer fort"], lat: 26.8333, lng: 70.5167, name: "Jaisalmer Dunes", destination: "rajasthan" },

  // Himachal Landmarks
  { keywords: ["solang valley", "solang"], lat: 32.3167, lng: 77.1583, name: "Solang Valley", destination: "himachal" },
  { keywords: ["atal tunnel", "rohtang"], lat: 32.3667, lng: 77.2000, name: "Atal Tunnel & Rohtang", destination: "himachal" },
  { keywords: ["hadimba", "mall road manali"], lat: 32.2483, lng: 77.1811, name: "Hadimba Temple & Mall Road", destination: "himachal" },
  { keywords: ["ram jhula", "lakshman jhula", "triveni ghat", "ganga aarti"], lat: 30.1250, lng: 78.3180, name: "Ram Jhula & Ganga Aarti", destination: "rishikesh" },

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

  // Kyoto Landmarks
  { keywords: ["fushimi inari", "torii gates"], lat: 34.9671, lng: 135.7727, name: "Fushimi Inari-taisha" },
  { keywords: ["kiyomizu-dera", "kiyomizu"], lat: 34.9949, lng: 135.7850, name: "Kiyomizu-dera Temple" },
  { keywords: ["arashiyama", "bamboo grove"], lat: 35.0169, lng: 135.6712, name: "Arashiyama Bamboo Grove" },
  { keywords: ["kinkaku-ji", "golden pavilion"], lat: 35.0394, lng: 135.7292, name: "Kinkaku-ji (Golden Pavilion)" },
  { keywords: ["gion", "shirakawa", "machiya"], lat: 35.0037, lng: 135.7770, name: "Historic Gion District" },
  { keywords: ["nishiki market"], lat: 35.0050, lng: 135.7650, name: "Nishiki Market" },
  { keywords: ["nara park", "todai-ji"], lat: 34.6851, lng: 135.8430, name: "Nara Deer Park & Todai-ji" },

  // Dubai Landmarks
  { keywords: ["burj khalifa"], lat: 25.1972, lng: 55.2744, name: "Burj Khalifa" },
  { keywords: ["dubai mall"], lat: 25.1985, lng: 55.2796, name: "The Dubai Mall" },
  { keywords: ["palm jumeirah", "atlantis"], lat: 25.1304, lng: 55.1171, name: "Palm Jumeirah & Atlantis" },
  { keywords: ["dubai marina"], lat: 25.0805, lng: 55.1403, name: "Dubai Marina Promenade" },
  { keywords: ["dubai creek", "gold souk", "spice souk"], lat: 25.2697, lng: 55.2974, name: "Dubai Creek & Souks" },
  { keywords: ["museum of the future"], lat: 25.2192, lng: 55.2819, name: "Museum of the Future" },

  // Paris Landmarks
  { keywords: ["eiffel tower"], lat: 48.8584, lng: 2.2945, name: "Eiffel Tower" },
  { keywords: ["louvre", "mona lisa"], lat: 48.8606, lng: 2.3376, name: "The Louvre Museum" },
  { keywords: ["montmartre", "sacre-coeur", "sacré-cœur"], lat: 48.8867, lng: 2.3431, name: "Montmartre & Sacré-Cœur" },
  { keywords: ["notre-dame", "sainte-chapelle"], lat: 48.8530, lng: 2.3499, name: "Notre-Dame & Sainte-Chapelle" },
  { keywords: ["versailles"], lat: 48.8049, lng: 2.1204, name: "Palace of Versailles" },

  // Bali Landmarks
  { keywords: ["ubud", "monkey forest"], lat: -8.5190, lng: 115.2606, name: "Ubud Monkey Forest" },
  { keywords: ["tegallalang", "rice terrace"], lat: -8.4344, lng: 115.2785, name: "Tegallalang Rice Terraces" },
  { keywords: ["uluwatu", "kecak"], lat: -8.8291, lng: 115.0849, name: "Uluwatu Cliff Temple" },
  { keywords: ["nusa penida", "kelingking"], lat: -8.7497, lng: 115.4744, name: "Nusa Penida Kelingking" },

  // Swiss Alps Landmarks
  { keywords: ["jungfraujoch", "top of europe"], lat: 46.5475, lng: 7.9822, name: "Jungfraujoch Top of Europe" },
  { keywords: ["lauterbrunnen"], lat: 46.5935, lng: 7.9090, name: "Lauterbrunnen Valley" },
  { keywords: ["interlaken", "lake brienz"], lat: 46.6863, lng: 7.8632, name: "Interlaken Lake Promenade" },
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

// Authentic curated schedules for prominent destinations
const CURATED_DESTINATION_PLANS = {
  kyoto: [
    {
      label: "Arrival & Gion Historic Lanterns Walk",
      activities: [
        { time: "11:00 AM", title: "Arrive at Kyoto Station & Ryokan Check-in", note: "Settle into your accommodation, refresh with authentic green tea." },
        { time: "2:30 PM", title: "Nishiki Market Street Food Crawl", note: "Sample freshly prepared matcha treats, takoyaki, and seasonal wagashi." },
        { time: "6:00 PM", title: "Historic Gion Geisha District Evening Stroll", note: "Wander atmospheric wooden machiya houses along the Shirakawa canal." },
        { time: "8:00 PM", title: "Traditional Kaiseki Multi-Course Dinner", note: "Seasonal multi-course dining featuring fresh Kyoto heirloom vegetables." },
      ],
    },
    {
      label: "Fushimi Inari Torii & Kiyomizu-dera Heights",
      activities: [
        { time: "8:00 AM", title: "Fushimi Inari-taisha 10,000 Vermilion Torii", note: "Early morning hike through the iconic orange shrine tunnels before crowds." },
        { time: "12:00 PM", title: "Soba Noodle Lunch near Higashiyama", note: "Handmade buckwheat noodles with crisp seasonal tempura." },
        { time: "2:00 PM", title: "Kiyomizu-dera Wooden Veranda & Otowa Spring", note: "Panoramic views over Kyoto's forest from the ancient cantilevered stage." },
        { time: "5:30 PM", title: "Sannenzaka & Ninenzaka Preserved Stone Lanes", note: "Cobblestone alleys lined with artisanal pottery, incense, and tea houses." },
      ],
    },
    {
      label: "Arashiyama Soaring Bamboo Grove & Zen Gardens",
      activities: [
        { time: "8:30 AM", title: "Arashiyama Sagano Bamboo Grove Walk", note: "Serene immersion into the soaring bamboo canopy with morning light." },
        { time: "10:30 AM", title: "Tenryu-ji Zen Garden & Sogenchi Reflection Pond", note: "UNESCO 14th-century landscape garden mirroring the surrounding hills." },
        { time: "1:00 PM", title: "Yudofu (Hot Tofu Cuisine) Riverside Lunch", note: "Delicate tofu hot pot overlooking the tranquil Katsura River." },
        { time: "3:30 PM", title: "Iwatayama Monkey Park & Togetsukyo Bridge", note: "Scenic bridge crossing followed by a gentle hike with panoramic city vistas." },
      ],
    },
    {
      label: "Golden Pavilion & Rock Garden Contemplation",
      activities: [
        { time: "9:30 AM", title: "Kinkaku-ji (The Golden Pavilion)", note: "Spectacular gold-leaf Zen temple shimmering above the Mirror Pond." },
        { time: "11:45 AM", title: "Ryoan-ji Famous 15-Stone Karesansui Zen Garden", note: "Contemplate the iconic minimalist dry rock landscape mystery." },
        { time: "1:30 PM", title: "Ceremonial Uji Matcha & Sweets Tasting", note: "Whisked ceremonial matcha paired with delicate seasonal confections." },
        { time: "5:00 PM", title: "Pontocho Alley Sunset & Riverside Dining", note: "Atmospheric dining terrace overlooking the Kamogawa river." },
      ],
    },
    {
      label: "Nara Deer Park & Great Bronze Buddha",
      activities: [
        { time: "9:00 AM", title: "Scenic Express Train to Ancient Nara", note: "Short 45-minute journey into Japan's first permanent imperial capital." },
        { time: "10:30 AM", title: "Nara Park & Friendly Bowing Shika Deer", note: "Feed wholesome deer senbei crackers in the serene parklands." },
        { time: "1:00 PM", title: "Todai-ji Great Eastern Temple & Daibutsu", note: "Marvel at the world's largest bronze Buddha in the massive timber hall." },
        { time: "4:30 PM", title: "Kasuga-taisha Lantern Shrine & Return to Kyoto", note: "Walk through mossy pathways adorned with 3,000 stone lanterns." },
      ],
    },
    {
      label: "Philosopher's Path & Uji Tea Heritage",
      activities: [
        { time: "9:30 AM", title: "Philosopher's Path Canal Walk to Ginkaku-ji", note: "Tranquil stone trail following the canal lined with trees and artisan studios." },
        { time: "12:30 PM", title: "Artisan Kyoto Bento Lunch Experience", note: "Fresh seasonal bento highlighting green-tea infused delicacies." },
        { time: "3:00 PM", title: "Heian Jingu Grand Torii & Floating Stepping Stones", note: "Expansive weeping willow garden and vermilion shrine courtyards." },
        { time: "7:00 PM", title: "Farewell Craft Sake Tasting & Yakitori Dinner", note: "Sample Fushimi underground spring sakes paired with char-grilled skewers." },
      ],
    },
    {
      label: "Keepsakes, Shinkansen Departure & Farewell",
      activities: [
        { time: "9:30 AM", title: "Kyoto Station Cube & Souvenir Hunt", note: "Pick up Yatsuhashi cinnamon sweets, Uji green tea, and Kiyomizu ceramics." },
        { time: "12:00 PM", title: "Shinkansen Bullet Train / Kansai Airport Express", note: "Depart with unforgettable memories of imperial Kyoto." },
      ],
    },
  ],
  goa: [
    {
      label: "Arrival & Fort Aguada Golden Sunset",
      activities: [
        { time: "12:00 PM", title: "Arrive at Dabolim/Mopa & Beach Resort Check-in", note: "Welcome coconut drink, unpack in a breezy coastal suite." },
        { time: "3:30 PM", title: "Relaxation at Candolim Beach Promenade", note: "Warm sand, sea breeze, and refreshing tropical cooler." },
        { time: "5:30 PM", title: "Fort Aguada Lighthouse & Arabian Sea Sunset", note: "17th-century Portuguese fortress overlooking the sweeping ocean horizon." },
        { time: "8:00 PM", title: "Candlelit Coastal Seafood Dinner", note: "Butter garlic prawns, Goan fish curry, and live acoustic tunes." },
      ],
    },
    {
      label: "North Goa Heritage & Beach Shacks",
      activities: [
        { time: "9:00 AM", title: "Chapora Fort Panoramas & Dil Chahta Hai Viewpoint", note: "Elevated ramparts with endless vistas of Vagator and Morjim coastlines." },
        { time: "11:30 AM", title: "Anjuna Beach Flea Market & Bohemian Cafes", note: "Browse handcrafted jewelry, beachwear, and sip artisanal iced pour-overs." },
        { time: "2:00 PM", title: "Lunch at Thalassa / Olive Bar Clifftop", note: "Greek-Mediterranean fare perched dramatically on the red clifftops." },
        { time: "5:00 PM", title: "Vagator Beach Sundowner & Music", note: "Vibrant beach club vibes with sunset beats." },
      ],
    },
    {
      label: "Old Goa Baroque Churches & Fontainhas Latin Quarter",
      activities: [
        { time: "9:30 AM", title: "Basilica of Bom Jesus & Se Cathedral", note: "UNESCO baroque cathedrals holding the sacred relics of St. Francis Xavier." },
        { time: "12:30 PM", title: "Fontainhas Panaji Latin Quarter Walking Tour", note: "Pastel yellow and blue heritage villas, wrought-iron balconies, and tiled azulejos." },
        { time: "2:00 PM", title: "Authentic Goan-Portuguese Lunch at Viva Panjim", note: "Traditional chicken cafreal, prawn balchão, and warm bebinca dessert." },
        { time: "5:30 PM", title: "Mandovi River Sunset Cruise & Cultural Folk Dance", note: "Evening cruise with Goan Dekhni and Fugdi folk performances." },
      ],
    },
    {
      label: "Water Sports & South Goa Serenity",
      activities: [
        { time: "8:30 AM", title: "Dolphin Spotting & Water Sports at Baga/Calangute", note: "Speedboat ride into the bay for dolphin sightings and parasailing." },
        { time: "1:00 PM", title: "Beachfront Lunch at Britto's / Curlies", note: "Chilled tropical beverages and freshly baked crab xacuti by the waves." },
        { time: "4:00 PM", title: "Scenic Drive South to Palolem or Colva Beach", note: "Crescent-shaped calm bay with leaning coconut palms." },
        { time: "7:30 PM", title: "Beachside Bonfire & Stargazing", note: "Unwind under the palms with the soothing sound of Arabian waves." },
      ],
    },
    {
      label: "Spice Plantation, Panaji Shopping & Farewell",
      activities: [
        { time: "9:30 AM", title: "Sahakari Spice Plantation Guided Tour & Lunch", note: "Discover cardamom, vanilla, cinnamon groves; savor traditional banana leaf feast." },
        { time: "1:30 PM", title: "Panaji Market Cashew & Feni Shopping", note: "Pick up roasted Goan cashews, artisanal chocolates, and souvenirs." },
        { time: "4:00 PM", title: "Transfer to Airport / Railway Station", note: "Depart with golden tans and unforgettable beach memories." },
      ],
    },
  ],
  kashmir: [
    {
      label: "Arrival & Dal Lake Houseboat Experience",
      activities: [
        { time: "11:30 AM", title: "Arrive at Srinagar Airport & Dal Lake Transfer", note: "Scenic drive through chinar-lined boulevards to the lake ghat." },
        { time: "1:00 PM", title: "Check-in to Luxury Carved Cedar Houseboat", note: "Sip aromatic Kashmiri Kahwa with crushed saffron and almonds." },
        { time: "4:30 PM", title: "Sunset Shikara Ride to Char Chinar & Floating Gardens", note: "Gliding across calm waters with reflection of Zabarwan mountains." },
        { time: "8:00 PM", title: "Traditional Kashmiri Wazwan Feast", note: "Multi-course feast: Rogan Josh, Gushtaba, and Rista served on a traditional Trami." },
      ],
    },
    {
      label: "Mughal Gardens & Old Srinagar Heritage",
      activities: [
        { time: "9:00 AM", title: "Nishat Bagh & Shalimar Bagh Royal Terraces", note: "Cascading Mughal fountains, vibrant flower beds, and ancient chinar shade." },
        { time: "12:30 PM", title: "Hazratbal Dargah & Dal Lake Shoreline Walk", note: "White marble shrine overlooking pristine northern waters." },
        { time: "2:30 PM", title: "Old Srinagar Heritage Walk & Jamia Masjid", note: "Marvel at 378 deodar timber pillars in the historic architectural marvel." },
        { time: "5:30 PM", title: "Chashme Shahi Natural Spring & Pari Mahal Sunset", note: "Fairies' abode perched high above Dal Lake with unmatched sunset views." },
      ],
    },
    {
      label: "Gulmarg Alpine Meadows & Gondola Ride",
      activities: [
        { time: "8:00 AM", title: "Scenic Drive to Gulmarg 'Meadow of Flowers'", note: "Winding pine-clad roads ascending into snow-crowned alpine vistas." },
        { time: "10:30 AM", title: "Gulmarg Gondola Phase 1 & 2 to Apharwat Peak", note: "One of the highest cable cars in the world reaching 13,780 feet." },
        { time: "1:30 PM", title: "Alpine Lunch with Mountain Panorama", note: "Hot mutton yakhni and steaming Kashmiri dum aloo overlooking peaks." },
        { time: "4:00 PM", title: "St. Mary's Church & Golf Course Stroll", note: "Victorian stone church amidst rolling meadows." },
      ],
    },
    {
      label: "Pahalgam Valley of Shepherds & Betaab Valley",
      activities: [
        { time: "8:00 AM", title: "Drive through Pampore Saffron Fields to Pahalgam", note: "Witness purple saffron blooms (in season) and cricket bat willow workshops." },
        { time: "11:30 AM", title: "Betaab Valley & Aru Valley Exploration", note: "Lush green pine forests with the crystal Lidder River meandering through." },
        { time: "2:00 PM", title: "Riverside Picnic & Fresh Trout Tasting", note: "Enjoy freshly caught local Lidder trout cooked with mountain herbs." },
        { time: "5:30 PM", title: "Pony Ride to Baisaran 'Mini Switzerland'", note: "Expansive green plateau surrounded by dense deodar forests." },
      ],
    },
    {
      label: "Saffron, Pashmina & Farewell Departure",
      activities: [
        { time: "9:30 AM", title: "Lal Chowk Artisan Pashmina & Walnut Wood Shopping", note: "Direct-from-weaver GI-tagged Pashmina shawls and hand-carved keepsakes." },
        { time: "12:00 PM", title: "Farewell Kahwa at Chai Jaai Tea Room", note: "Cosy vintage tea house along the Jhelum river embankment." },
        { time: "2:30 PM", title: "Transfer to Srinagar Airport", note: "Depart with memories of paradise on earth." },
      ],
    },
  ],
  kerala: [
    {
      label: "Kochi Arrival & Fort Kochi Colonial Heritage",
      activities: [
        { time: "11:00 AM", title: "Arrive at Cochin Int'l & Fort Kochi Heritage Hotel", note: "Check-in to a restored Dutch or Portuguese heritage bungalow." },
        { time: "2:30 PM", title: "Chinese Fishing Nets & Mattancherry Spice Bazaar", note: "Centuries-old cantilevered fishing nets and fragrant cardamom warehouses." },
        { time: "5:30 PM", title: "Kathakali Classical Dance & Kalaripayattu Martial Arts", note: "Vibrant eye expressions, intricate makeup, and ancient martial arts demonstrations." },
        { time: "8:00 PM", title: "Coastal Malabar Seafood Dinner", note: "Karimeen Pollichathu (pearl spot fish in banana leaf) with appams." },
      ],
    },
    {
      label: "Munnar Rolling Tea Estates & Waterfalls",
      activities: [
        { time: "8:00 AM", title: "Scenic Western Ghats Drive to Munnar", note: "Picturesque waterfalls (Cheeyappara & Valara) en route through misty hills." },
        { time: "12:30 PM", title: "Tea Museum & Factory Processing Tour", note: "Learn the secrets of orthodox tea crafting and enjoy fresh tea tasting." },
        { time: "3:30 PM", title: "Mattupetty Dam & Echo Point Boating", note: "Tranquil reservoir nestled between rolling green Shola hills." },
        { time: "6:00 PM", title: "Cool Mist Walk through Lockhart Tea Gap", note: "Panoramic sunset across endless emerald tea velvet hills." },
      ],
    },
    {
      label: "Eravikulam Wildlife & Journey to Alleppey",
      activities: [
        { time: "8:00 AM", title: "Eravikulam National Park & Nilgiri Tahr Safari", note: "Spot the endangered mountain goat amidst high-altitude grasslands." },
        { time: "11:30 AM", title: "Drive Down to Alleppey (Alappuzha) Backwaters", note: "Descend into lush coconut palm country." },
        { time: "2:00 PM", title: "Traditional Kerala Sadhya on Banana Leaf", note: "24-item vegetarian feast featuring avial, thoran, sambar, and payasam." },
        { time: "5:00 PM", title: "Marari Beach Golden Hour Walk", note: "Peaceful white-sand shoreline with traditional wooden fishing boats." },
      ],
    },
    {
      label: "Private Houseboat Cruise on Vembanad Lake",
      activities: [
        { time: "12:00 PM", title: "Board Traditional Kettuvallam Houseboat", note: "Thatch-roofed luxury wooden boat with personal chef and captain." },
        { time: "1:30 PM", title: "Backwater Lunch Cruise through Narrow Canals", note: "Freshly prepared pearl spot fish and tiger prawns as palms glide past." },
        { time: "4:00 PM", title: "Village Canoe Excursion into Hidden Waterways", note: "Witness coir yarn spinning, duck farming, and village backwater life." },
        { time: "7:00 PM", title: "Houseboat Mooring under Starlit Backwaters", note: "Serene night surrounded by the gentle lapping of calm waters." },
      ],
    },
    {
      label: "Ayurvedic Rejuvenation & Departure",
      activities: [
        { time: "9:00 AM", title: "Traditional Abhyanga Ayurvedic Herbal Massage", note: "Warm medicated herbal oils to melt away tension and rejuvenate." },
        { time: "12:00 PM", title: "Spices & Banana Chips Souvenir Shopping", note: "Freshly fried coconut oil chips, black pepper, and cinnamon quills." },
        { time: "3:00 PM", title: "Transfer to Cochin International Airport", note: "Farewell to God's Own Country." },
      ],
    },
  ],
  rajasthan: [
    {
      label: "Jaipur Arrival & Nahargarh Sunset Panorama",
      activities: [
        { time: "11:30 AM", title: "Arrive in Jaipur & Haveli Check-in", note: "Royal Rajasthani welcome with garland, tilak, and cold badam milk." },
        { time: "2:30 PM", title: "Albert Hall Museum & Ram Niwas Gardens", note: "Indo-Saracenic masterpiece housing ancient royal weapons and artifacts." },
        { time: "5:30 PM", title: "Nahargarh Fort Clifftop Sunset", note: "Spectacular golden panoramic view over the entire Pink City skyline." },
        { time: "8:00 PM", title: "Authentic Dal Baati Churma Dinner", note: "Traditional ghee-soaked baatis with five-lentil dal and sweet churma." },
      ],
    },
    {
      label: "Amer Fort & Sheesh Mahal Royal Grandeur",
      activities: [
        { time: "8:30 AM", title: "Amer Fort & Sheesh Mahal (Mirror Palace)", note: "Ascend the royal ramparts and marvel at thousand-mirror reflections." },
        { time: "12:00 PM", title: "Jal Mahal Viewpoint & Photo Stop", note: "The mysterious water palace floating in the center of Man Sagar Lake." },
        { time: "1:30 PM", title: "LMB Royal Lunch in Johari Bazaar", note: "Famous Rajasthani thali and pyaaz kachori in Johari Bazaar." },
        { time: "3:30 PM", title: "City Palace & Jantar Mantar UNESCO Observatory", note: "Walk through the Chandra Mahal courtyards and world's largest stone sundial." },
      ],
    },
    {
      label: "Hawa Mahal & Artisan Bazaars Trail",
      activities: [
        { time: "9:00 AM", title: "Hawa Mahal (Palace of Winds) Early View", note: "953 honeycomb lattice windows designed for royal women to view street pageantry." },
        { time: "11:30 AM", title: "Johari Bazaar & Bapu Bazaar Artisan Walk", note: "Gemstones, silver jewelry, blue pottery, and hand-block printed Sanganeri quilts." },
        { time: "2:00 PM", title: "Lassi at Lassiwala (Since 1944) on MI Road", note: "Thick, creamy malai lassi served in traditional terracotta kulhads." },
        { time: "5:30 PM", title: "Chokhi Dhani Ethnic Village Cultural Celebration", note: "Puppet shows, camel rides, folk fire dancers, and rustic feast." },
      ],
    },
    {
      label: "Udaipur Lake Pichola & Palaces Excursion",
      activities: [
        { time: "8:30 AM", title: "Scenic Journey into Royal Mewar / Udaipur", note: "Venture past Aravalli hills to the City of Lakes." },
        { time: "1:00 PM", title: "Lake Pichola Clifftop Dining", note: "Overlooking Jag Mandir and the ethereal white marble Lake Palace." },
        { time: "3:30 PM", title: "City Palace Complex & Crystal Gallery", note: "The largest palace complex in Rajasthan with ornate mosaics and glasswork." },
        { time: "6:00 PM", title: "Sunset Boat Cruise on Lake Pichola", note: "Gentle golden-hour ripples with palace lights illuminating the water." },
      ],
    },
    {
      label: "Handicrafts & Royal Farewell",
      activities: [
        { time: "9:30 AM", title: "Bandhani & Block-Print Fabric Souvenir Shopping", note: "Pick up authentic Jaipuri razai and miniature paintings." },
        { time: "12:30 PM", title: "Transfer to Airport / Railway Station", note: "Depart with royal memories of Rajasthan." },
      ],
    },
  ],
  dubai: [
    {
      label: "Dubai Arrival & Burj Khalifa Sunset",
      activities: [
        { time: "12:00 PM", title: "Arrive at Dubai DXB & Downtown Hotel Check-in", note: "Transfer via private luxury SUV to your downtown hotel." },
        { time: "3:30 PM", title: "Dubai Mall & Underwater Aquarium Walkthrough", note: "Explore premier retail avenues and giant shark walkthrough tunnel." },
        { time: "5:45 PM", title: "Burj Khalifa 124th & 125th Floor Observation Deck", note: "Breathtaking 360-degree sunset panorama over Dubai's skyscraper grid." },
        { time: "8:00 PM", title: "Dubai Fountain Spectacle & Waterfront Dinner", note: "Synchronized water, music, and light show with Michelin-starred dining." },
      ],
    },
    {
      label: "Old Dubai Heritage, Creek Abra & Future Wonders",
      activities: [
        { time: "9:00 AM", title: "Al Fahidi Historical District & Coffee Museum", note: "Wind-tower architecture, narrow alleys, and Arabic coffee culture." },
        { time: "11:30 AM", title: "Traditional Abra Boat Crossing on Dubai Creek", note: "Historic 1-dirham wooden ferry ride between Bur Dubai and Deira." },
        { time: "1:00 PM", title: "Gold & Spice Souks Fragrance Exploration", note: "Glittering jewelry windows and fragrant sacks of saffron, frankincense, and tea." },
        { time: "4:00 PM", title: "Museum of the Future Architectural Wonder", note: "Pioneering calligraphy-etched torus building showcasing the world in 2071." },
      ],
    },
    {
      label: "Red Dune 4x4 Safari & Bedouin Camp",
      activities: [
        { time: "10:00 AM", title: "Morning Leisure & Rooftop Pool Relaxation", note: "Sunbathe with skyline views and refreshing mocktails." },
        { time: "2:30 PM", title: "Red Dune 4x4 Desert Safari & Sandboarding", note: "Thrilling dune bashing across the Lahbab desert red dunes." },
        { time: "5:30 PM", title: "Sunset Camel Caravan & Falconry Encounter", note: "Golden desert light photoshoot with traditional Emirati falcon." },
        { time: "7:30 PM", title: "Bedouin BBQ Feast with Tanoura & Fire Show", note: "Grilled meats, fresh hummus, shisha lounge, and spinning Tanoura dancers under stars." },
      ],
    },
    {
      label: "Palm Jumeirah & Marina Yacht Cruise",
      activities: [
        { time: "9:30 AM", title: "The View at The Palm 360 Observatory", note: "Stunning island vista of the palm fronds and Arabian Gulf." },
        { time: "12:30 PM", title: "Lunch at Atlantis The Royal", note: "World-class gastronomy overlooking the Grand Cascade fountain." },
        { time: "4:30 PM", title: "Private Dubai Marina Sunset Yacht Cruise", note: "Cruise past Ain Dubai ferris wheel and JBR clifftop residences." },
        { time: "8:00 PM", title: "Chic Beach Club Dinner at Pier 7 Marina", note: "Multi-tiered dining with panoramic yachts and illuminated waterways." },
      ],
    },
    {
      label: "Souk Madinat & Airport Departure",
      activities: [
        { time: "10:00 AM", title: "Souk Madinat Jumeirah & Burj Al Arab Views", note: "Traditional Arabian bazaar with serene waterways and luxury keepsakes." },
        { time: "1:30 PM", title: "Duty Free Shopping & Transfer to DXB", note: "Depart with memories of futuristic luxury." },
      ],
    },
  ],
  paris: [
    {
      label: "Parisian Welcome & Seine River Cruise",
      activities: [
        { time: "12:00 PM", title: "Arrive at CDG Airport & Boutique Hotel Check-in", note: "Check-in to a charming hotel in Saint-Germain or Le Marais." },
        { time: "3:30 PM", title: "Tuileries Gardens & Café de Flore Espresso", note: "Classic Parisian café culture with buttery croissants and café au lait." },
        { time: "6:00 PM", title: "Evening Seine River Glass-Canopy Boat Cruise", note: "Glide past illuminated bridges, Notre-Dame, and the Musée d'Orsay." },
        { time: "9:00 PM", title: "Eiffel Tower Twinkle & French Bistro Dinner", note: "Witness the diamond sparkle show; savor boeuf bourguignon." },
      ],
    },
    {
      label: "The Louvre & Historic Heart of Paris",
      activities: [
        { time: "9:00 AM", title: "The Louvre Masterpieces (Mona Lisa & Venus)", note: "Fast-track entry into the world's most famous palace-turned-museum." },
        { time: "1:00 PM", title: "Artisan Baguette & Fromage Picnic at Palais Royal", note: "Crisp baguettes, aged Comté, and fresh grapes in the historic courtyard." },
        { time: "3:00 PM", title: "Île de la Cité, Notre-Dame & Sainte-Chapelle", note: "Marvel at the 13th-century radiant stained-glass windows of Sainte-Chapelle." },
        { time: "6:30 PM", title: "Latin Quarter Bookshops & Boulevard Saint-Michel", note: "Browse Shakespeare and Company and historic cobblestone lanes." },
      ],
    },
    {
      label: "Montmartre Bohemian Artists & Sacré-Cœur",
      activities: [
        { time: "9:30 AM", title: "Montmartre Village & Sacré-Cœur Basilica", note: "Funicular ride up to the highest natural point in Paris with sweeping views." },
        { time: "12:00 PM", title: "Place du Tertre Open-Air Portrait Artists", note: "Watch watercolorists and sketch artists in the historic bohemian square." },
        { time: "2:00 PM", title: "French Crêperie Lunch in Pigalle", note: "Savory buckwheat galettes paired with artisanal Breton cider." },
        { time: "5:00 PM", title: "Champs-Élysées & Arc de Triomphe Sunset Rooftop", note: "Climb the monument for sunset views aligned with the grand avenue." },
      ],
    },
    {
      label: "Palace of Versailles Royal Excursion",
      activities: [
        { time: "8:30 AM", title: "RER Train to the Royal Palace of Versailles", note: "Short 35-minute scenic rail journey south of the capital." },
        { time: "9:45 AM", title: "Hall of Mirrors & King's Grand Apartments", note: "Lavish gold-leaf baroque salons and 357 crystal chandeliers." },
        { time: "1:00 PM", title: "Grand Canal Garden Stroll & Marie Antoinette Hamlet", note: "Rent a rowboat on the royal canal or stroll the romantic rustic hamlet." },
        { time: "5:30 PM", title: "Return to Paris & Le Marais Trendy Boutique Walk", note: "Independent designer shops, vintage bookstores, and falafel on Rue des Rosiers." },
      ],
    },
    {
      label: "Patisserie, Souvenirs & CDG Departure",
      activities: [
        { time: "9:30 AM", title: "Ladurée Macarons & Souvenir Gourmet Shopping", note: "Select pastel boxes of salted caramel, rose, and pistachio macarons." },
        { time: "12:00 PM", title: "Farewell Stroll through Luxembourg Gardens", note: "Watch miniature sailboats on the fountain pond." },
        { time: "2:30 PM", title: "Transfer to Charles de Gaulle Airport", note: "Au revoir, Paris!" },
      ],
    },
  ],
  delhi: [
    {
      label: "Old Delhi Heritage & Mughal Splendors",
      activities: [
        { time: "9:00 AM", title: "Red Fort (Lal Qila) & Lahori Gate Walk", note: "Historic 17th-century Mughal imperial palace and majestic red sandstone ramparts." },
        { time: "11:30 AM", title: "Jama Masjid & Chandni Chowk Rickshaw Trail", note: "One of India's largest mosques, followed by a cycle-rickshaw ride through vibrant spice bazaars." },
        { time: "1:30 PM", title: "Street Food Lunch at Paranthe Wali Gali", note: "Legendary stuffed paranthas served with sweet lassi, rabri, and tangy mint chutneys." },
        { time: "4:00 PM", title: "Khari Baoli Asia's Largest Spice Market", note: "Immerse in the intoxicating aromas of saffron, cardamom, teas, and dried nuts." },
        { time: "7:30 PM", title: "Evening Sound & Light Show at Red Fort", note: "Relive 300 years of Delhi's dramatic history through illuminated laser and audio storytelling." },
      ],
    },
    {
      label: "New Delhi Imperial Avenues & Modern Icons",
      activities: [
        { time: "8:30 AM", title: "India Gate & Kartavya Path Promenade", note: "War memorial arch and the ceremonial avenue leading up to Rashtrapati Bhavan." },
        { time: "11:00 AM", title: "National Museum & Janpath Artisan Market", note: "Marvel at ancient Harappan relics, Mughal miniatures, and shop for Indian handicrafts." },
        { time: "1:30 PM", title: "Classic Dining at Connaught Place (CP)", note: "Sample North Indian curries and Mughlai delicacies in historic colonial colonnades." },
        { time: "4:00 PM", title: "Gurudwara Bangla Sahib & Sarovar Stroll", note: "Peaceful Sikh temple featuring gold domes, sacred pond, and world's largest community kitchen (Langar)." },
        { time: "7:00 PM", title: "Dilli Haat Food & Handicrafts Bazaar", note: "Open-air village craft market with authentic regional food stalls from all Indian states." },
      ],
    },
    {
      label: "Sufi Corridors, Tombs & Lush Gardens",
      activities: [
        { time: "9:00 AM", title: "Humayun's Tomb & Sunder Nursery UNESCO Gardens", note: "Persian garden tomb masterpiece that inspired the Taj Mahal, surrounded by restored Mughal flora." },
        { time: "12:00 PM", title: "Lodhi Garden Heritage Walk & 15th-Century Tombs", note: "Stroll amidst manicured lawns, duck ponds, and dramatic Sayyid and Lodhi dynasty monuments." },
        { time: "3:00 PM", title: "Lodhi Art District Murals & Photography", note: "India's first open-air public art district with massive contemporary wall murals." },
        { time: "6:30 PM", title: "Khan Market Espresso & Boutique Browsing", note: "Delhi's most sophisticated retail enclave with indie bookshops and artisan dining." },
      ],
    },
    {
      label: "Southern Monuments, Qutub Minar & Hauz Khas",
      activities: [
        { time: "9:00 AM", title: "Qutub Minar & Iron Pillar of Delhi", note: "UNESCO 73-meter fluted minaret and ancient rust-resistant 4th-century iron pillar." },
        { time: "12:00 PM", title: "Mehrauli Archaeological Park Stepwell Walk", note: "Sprawling historical reserve with Jamali Kamali mosque and secluded 16th-century ruins." },
        { time: "2:30 PM", title: "Hauz Khas Village Lakeside Dining", note: "Trendsetting café overlooking the 13th-century water reservoir and madrasa ruins." },
        { time: "5:30 PM", title: "Hauz Khas Fort Sunset & Indie Boutiques", note: "Hip artisan studios, vinyl stores, and sunset views over the monument lake." },
      ],
    },
    {
      label: "Spiritual Marvels & Grand Farewell",
      activities: [
        { time: "9:30 AM", title: "Akshardham Temple & Cultural Boat Ride", note: "Spectacular pink sandstone and white marble carvings displaying 10,000 years of Indian culture." },
        { time: "1:00 PM", title: "Lotus Temple (Bahá'í House of Worship)", note: "Iconic lotus-shaped sanctuary welcoming people of all faiths for silent meditation." },
        { time: "4:00 PM", title: "Souvenir Shopping & Transfer to Indira Gandhi Airport (DEL)", note: "Pick up hand-painted silk scarves, Darjeeling tea, and brass handicrafts before departure." },
      ],
    },
  ],
  manali: [
    {
      label: "Old Manali Vibe & Hadimba Temple",
      activities: [
        { time: "11:00 AM", title: "Arrive in Manali & Alpine Resort Check-in", note: "Cedar-wood chalets overlooking pine valleys and snow peaks." },
        { time: "2:30 PM", title: "Hadimba Temple & Dhungri Van Vihar", note: "16th-century pagoda-style timber temple nestled inside ancient deodar woods." },
        { time: "5:00 PM", title: "Old Manali Cafe Crawl & Live Acoustic Music", note: "Chill vibes, woodfired trout pizzas, and mountain herb infusions." },
      ],
    },
    {
      label: "Solang Valley Snow Adventures & Cable Car",
      activities: [
        { time: "8:30 AM", title: "Solang Valley Paragliding & Zorbing", note: "Gliding across alpine valleys with panoramic views of the Pir Panjal range." },
        { time: "12:30 PM", title: "Solang Ropeway Ride to Mount Phatru", note: "Gondola ascent up to 10,500 feet for panoramic snowfields." },
        { time: "4:30 PM", title: "Anjani Mahadev Waterfall & Snow Walk", note: "Short scenic trek to the naturally forming ice lingam." },
      ],
    },
    {
      label: "Atal Tunnel & Lahaul Valley Sissu Waterfall",
      activities: [
        { time: "8:00 AM", title: "Atal Tunnel Drive to Lahaul Valley", note: "World's longest highway tunnel above 10,000 feet, opening into stunning trans-Himalayan landscapes." },
        { time: "11:00 AM", title: "Sissu Waterfall & Chandra River Banks", note: "Cascading glacial waterfall with golden poplars and turquoise river waters." },
        { time: "3:30 PM", title: "Return to Manali via Rohtang Viewpoint", note: "Crisp mountain air and breathtaking Himalayan pass panoramas." },
      ],
    },
    {
      label: "Vashisht Hot Springs & Mall Road Departure",
      activities: [
        { time: "9:30 AM", title: "Vashisht Natural Sulphur Hot Springs", note: "Soothing natural thermal baths known for therapeutic mineral properties." },
        { time: "12:30 PM", title: "Mall Road Shopping for Kullu Shawls", note: "Authentic handloom woolen shawls, mountain honey, and dried apricots." },
        { time: "3:30 PM", title: "Transfer to Bhuntar Airport / Volvo Terminal", note: "Depart with rejuvenating mountain memories." },
      ],
    },
  ],
  bali: [
    {
      label: "Ubud Cultural Welcome & Monkey Forest",
      activities: [
        { time: "11:30 AM", title: "Arrive at Denpasar DPS & Ubud Jungle Resort Check-in", note: "Private pool villa surrounded by tropical ravine vegetation." },
        { time: "2:30 PM", title: "Sacred Ubud Monkey Forest Sanctuary", note: "Ancient banyan roots, mossy temple statues, and playful Balinese macaques." },
        { time: "6:00 PM", title: "Balinese Royal Palace Dance Performance", note: "Dramatic Legong dance with traditional gamelan music under temple lights." },
      ],
    },
    {
      label: "Tegallalang Rice Terraces & Waterfall",
      activities: [
        { time: "8:00 AM", title: "Tegallalang Rice Terraces & Jungle Swing", note: "Emerald layered emerald valleys with iconic giant jungle swings." },
        { time: "11:30 AM", title: "Tirta Empul Holy Water Temple Purification", note: "Sacred mountain spring purification ritual in ancient stone basins." },
        { time: "3:30 PM", title: "Tegenungan Waterfall Canyon Walk", note: "Powerful cascade surrounded by lush jungle foliage and natural swimming pool." },
      ],
    },
    {
      label: "Uluwatu Cliff & Sunset Kecak Fire Dance",
      activities: [
        { time: "9:30 AM", title: "Scenic Transfer to Southern Peninsula", note: "Drive past turquoise limestone bays and dramatic coastal cliffs." },
        { time: "3:00 PM", title: "Padang Padang Surf Beach", note: "Golden cove sheltered by limestone rocks, popular for gentle swells and sunbathing." },
        { time: "5:45 PM", title: "Uluwatu Temple Sunset Kecak Fire Dance", note: "Mesmerizing 50-man chanting chorus with fire dancers as the sun melts into the Indian Ocean." },
      ],
    },
    {
      label: "Artisan Keepsakes & DPS Departure",
      activities: [
        { time: "9:30 AM", title: "Sukawati Art Market & Balinese Woodcarvings", note: "Handmade rattan bags, batik sarongs, and organic coconut bowls." },
        { time: "1:00 PM", title: "Beachside Seafood Lunch at Jimbaran Bay", note: "Fresh grilled snapper with sambal matah on the sand." },
        { time: "4:00 PM", title: "Transfer to Ngurah Rai Airport", note: "Terima kasih, Bali!" },
      ],
    },
  ],
  "swiss alps": [
    {
      label: "Arrival in Interlaken & Lake Brienz Cruise",
      activities: [
        { time: "11:00 AM", title: "Scenic Rail Arrival in Interlaken & Alpine Chalet Check-in", note: "Framed by the Eiger, Mönch, and Jungfrau peaks." },
        { time: "2:30 PM", title: "Turquoise Lake Brienz Steamer Boat Cruise", note: "Glide past Giessbach Falls and fairy-tale castle villages." },
        { time: "6:30 PM", title: "Swiss Cheese Fondue & Rösti Dinner", note: "Indulge in bubbling Gruyère and Emmental fondue with crusty alpine bread." },
      ],
    },
    {
      label: "Jungfraujoch 'Top of Europe' Alpine Glacier",
      activities: [
        { time: "8:30 AM", title: "Eiger Express Tricable Gondola & Cogwheel Train", note: "Ultra-modern cable car flying right beneath the Eiger North Face." },
        { time: "10:30 AM", title: "Jungfraujoch Sphinx Observatory & Ice Palace", note: "3,454m highest railway station in Europe with Ice Palace tunnels." },
        { time: "2:30 PM", title: "Aletsch Glacier Panorama Walk", note: "View Europe's largest glacier stretching 23 kilometers." },
      ],
    },
    {
      label: "Lauterbrunnen Valley of 72 Waterfalls",
      activities: [
        { time: "9:00 AM", title: "Lauterbrunnen Valley Promenade & Staubbach Falls", note: "The sheer cliff waterfall that inspired Tolkien's Rivendell." },
        { time: "12:00 PM", title: "Trümmelbach Hidden Glacial Chasm Waterfalls", note: "Subterranean waterfalls carving through the mountain interior." },
        { time: "4:00 PM", title: "Mürren Car-Free Mountain Village Stroll", note: "Wooden flower-boxed chalets perched high above the Lauterbrunnen valley." },
      ],
    },
    {
      label: "Swiss Chocolates & Scenic Departure",
      activities: [
        { time: "9:30 AM", title: "Artisan Chocolate Workshop & Souvenirs", note: "Handcrafted Swiss truffles, pralines, and army knives." },
        { time: "12:30 PM", title: "Transfer to Zurich / Geneva Airport", note: "Depart with memories of pristine alpine beauty." },
      ],
    },
  ],
};

// Smart thematic day generator for any destination, dynamically customized by persona, preferences, budget & travelers
function getThematicDay(
  destination,
  dayIndex,
  totalDays,
  persona = "family",
  preferences = [],
  budget = 65000,
  adults = 2,
  children = 0
) {
  const isFirst = dayIndex === 0;
  const isLast = dayIndex === totalDays - 1 && totalDays > 1;
  const hasKids = children > 0 || persona === "family";
  const isLuxury = budget > 150000;
  const isBudget = budget < 45000;

  if (isFirst) {
    let afternoonTitle = "Neighborhood Orientation & Promenade";
    let afternoonNote = `Gentle afternoon walking tour to discover nearby cafes and street architecture in ${destination}.`;
    let dinnerNote = `Relaxed dining experience sampling famous regional delicacies of ${destination}.`;

    if (persona === "adventure") {
      afternoonTitle = "Scenic Ridge Trail & Nature Orientation";
      afternoonNote = `Hike along high-vantage trails capturing panoramic mountain and valley views of ${destination}.`;
    } else if (persona === "romantic") {
      afternoonTitle = "Sunset Harbor Promenade & Couples Viewpoint";
      afternoonNote = `Romantic golden hour walk along the scenic waterfront and historic alleys of ${destination}.`;
      dinnerNote = "Intimate candlelit dinner featuring regional tasting menu and fine wine pairings.";
    } else if (hasKids) {
      afternoonTitle = "Interactive Town Park & Family Discovery Walk";
      afternoonNote = `Easy-paced stroll through lush botanic gardens and open squares suitable for all ages.`;
    }

    if (isLuxury) {
      dinnerNote += " Multi-course fine dining at premier Michelin-starred / 5-star venue.";
    } else if (isBudget) {
      dinnerNote += " Authentic popular street food stalls and heritage local mess.";
    }
    const wantsDining = preferences.includes('Dining') || preferences.includes('Local food');

    return {
      label: `Arrival & Welcome to ${destination}`,
      activities: [
        {
          time: "11:30 AM",
          title: `Arrive in ${destination} & Hotel Check-in`,
          note: isLuxury
            ? `Private VIP transfer, check-in to luxury suite, refresh with welcome cocktails.`
            : `Transfer from terminal, check-in, settle luggage, and recharge for the trip ahead.`,
        },
        { time: "3:00 PM", title: afternoonTitle, note: afternoonNote },
        {
          time: "6:00 PM",
          title: "Golden Hour Panoramic Viewpoint",
          note: `Prime vantage point to catch the sunset and capture initial memories of ${destination}.`,
        },
        {
          time: "8:00 PM",
          title: wantsDining
            ? `Welcome Dinner with ${destination} Specialties`
            : `Evening Stroll & Leisurely Relaxation in ${destination}`,
          note: wantsDining
            ? dinnerNote
            : "Peaceful evening unwinding under the stars and reviewing upcoming adventures.",
        },
      ],
    };
  }

  if (isLast) {
    return {
      label: `Farewell & Souvenirs in ${destination}`,
      activities: [
        {
          time: "9:30 AM",
          title: `Check-out & Artisan Souvenir Hunting in ${destination}`,
          note: `Pick up authentic local handicrafts, regional spices, keepsakes, and gifts.`,
        },
        {
          time: "12:30 PM",
          title: wantsDining
            ? "Farewell Brunch at a Cozy Heritage Cafe"
            : "Scenic Farewell Vista & Garden Walk",
          note: wantsDining
            ? "Leisurely final meal soaking in the relaxed atmosphere before departure."
            : "Final memorable photoshoot and relaxed contemplation before departure.",
        },
        {
          time: "3:00 PM",
          title: "Transfer to Airport / Train Station",
          note: "Depart with comfortable buffer time for return transit.",
        },
      ],
    };
  }

  // Intermediate days tailored dynamically to user preferences and persona
  const dynamicThemes = [
    {
      label: `Signature Heritage & Iconic Landmarks of ${destination}`,
      activities: [
        {
          time: "8:30 AM",
          title: `Morning Tour of Top ${destination} Monument`,
          note: hasKids
            ? "Interactive historical monument visit with storytelling guide."
            : "Beat the midday crowds at the premier historic architectural landmark.",
        },
        {
          time: "12:30 PM",
          title: wantsDining
            ? "Authentic Regional Lunch at Local Favorite"
            : "Midday Scenic Break & Relaxation at Promenade",
          note: wantsDining
            ? "Savor time-honored recipes recommended by locals."
            : "Rest, hydrate, and enjoy comfortable shade amidst historic surroundings.",
        },
        {
          time: "3:00 PM",
          title: preferences.includes("Museums")
            ? `National Museum & Art Galleries of ${destination}`
            : preferences.includes("Beaches")
            ? `Coastal Promenade & Beachfront Walk in ${destination}`
            : `Historic Quarter & Pedestrian Plaza in ${destination}`,
          note: "Discover regional art, architecture, and cultural masterpieces.",
        },
        {
          time: "6:30 PM",
          title: persona === "romantic"
            ? "Romantic Sunset Clifftop Walk & Candlelight Bistro"
            : persona === "friends"
            ? "Sunset Rooftop Lounge & Evening Festivities"
            : "Scenic Golden Hour Stroll & Family Walk",
          note: "Unwind as city lights illuminate the historic skyline.",
        },
      ],
    },
    {
      label: wantsDining
        ? `Flavors, Food Markets & Artisan Crafts in ${destination}`
        : `Artisan Bazaars, Scenic Viewpoints & Culture in ${destination}`,
      activities: [
        {
          time: "9:00 AM",
          title: wantsDining
            ? `Central Heritage Market & Street Food Trail in ${destination}`
            : `Central Heritage Promenade & Morning Vistas in ${destination}`,
          note: wantsDining
            ? "Bustling stalls filled with fresh produce, regional delicacies, and fragrant spices."
            : "Lively morning pedestrian lanes, historic architecture, and local life.",
        },
        {
          time: "12:00 PM",
          title: wantsDining
            ? "Culinary Tasting Session & Sweet Treats"
            : "Midday Panoramic Viewpoint & Tea Break",
          note: wantsDining
            ? "Handcrafted regional pastries, artisanal tea/coffee, and authentic snacks."
            : "Elevated vantage point overlooking the destination with refreshing beverages.",
        },
        {
          time: "2:30 PM",
          title: preferences.includes("Shopping")
            ? `Boutique Handicraft Hubs & Silk Bazaars in ${destination}`
            : `Artisan Studios & Creative Quarter in ${destination}`,
          note: "Watch master craftspeople at work and browse handmade jewelry and textiles.",
        },
        {
          time: "7:00 PM",
          title: persona === "adventure"
            ? "Night Safari or Stargazing Experience"
            : wantsDining
            ? "Traditional Music & Cultural Evening Dinner"
            : "Traditional Music & Cultural Evening Performance",
          note: "Engaging folk performance and vibrant night market atmosphere.",
        },
      ],
    },
    {
      label: preferences.includes("Trekking") || preferences.includes("Mountains") || persona === "adventure"
        ? `Alpine Views, Nature Trails & Outdoor Wonders of ${destination}`
        : `Hidden Alleys & Cultural Corridors of ${destination}`,
      activities: [
        {
          time: "8:30 AM",
          title: persona === "adventure"
            ? `Scenic Ridge Trek & High-Vantage Trail in ${destination}`
            : `Botanical Garden Stroll & Morning Birdsong in ${destination}`,
          note: "Lush green natural sanctuary with fresh morning mountain air.",
        },
        {
          time: "12:30 PM",
          title: wantsDining
            ? "Riverside or Mountain Viewpoint Lunch"
            : "Midday Scenic Valley & Stream Relaxation",
          note: wantsDining
            ? "Enjoy fresh farm-to-table cuisine overlooking panoramic natural vistas."
            : "Recharge alongside the mountain stream with refreshing natural sounds.",
        },
        {
          time: "3:30 PM",
          title: preferences.includes("Photography")
            ? `Architectural Panorama & Golden Hour Photography in ${destination}`
            : `Historic Stepwell & Ancient Sanctuary Exploration`,
          note: "Captivating angles and serene historic atmosphere away from crowded streets.",
        },
        {
          time: "7:30 PM",
          title: isLuxury
            ? (wantsDining ? "Gourmet Wine & Dine Experience" : "Private Stargazing & Sunset Terrace")
            : "Relaxed Evening Vista & Souvenir Stroll",
          note: "Savor a memorable evening reviewing photos and trip memories.",
        },
      ],
    },
  ];

  const themeIdx = (dayIndex - 1) % dynamicThemes.length;
  return dynamicThemes[themeIdx];
}

export function buildFallbackItinerary(trip = {}) {
  const rawDest = trip.destination || "your destination";
  const normDest = normalizeDestinationName(rawDest);
  const checkIn = trip.checkIn || trip.startDate;
  const checkOut = trip.checkOut || trip.endDate;
  const persona = trip.persona || trip.selectedStyle || trip.tripType || "family";
  const preferences = Array.isArray(trip.preferences) ? trip.preferences : [];
  const budget = Number(trip.budget) || 65000;
  const adults = Number(trip.adults) || 2;
  const children = Number(trip.children) || 0;

  const start = checkIn ? new Date(checkIn) : new Date();
  const end = checkOut ? new Date(checkOut) : new Date(start.getTime() + 4 * 86400000);
  const diffDays = Math.round((end - start) / 86400000);
  const nights = diffDays > 0 ? diffDays : 3;
  const totalDays = nights + 1;

  // Check if we have an authentic curated plan for this destination
  let curatedList = null;
  for (const [key, plan] of Object.entries(CURATED_DESTINATION_PLANS)) {
    if (normDest.includes(key) || key.includes(normDest)) {
      curatedList = plan;
      break;
    }
  }

  return {
    id: `plan-${normDest}-${Date.now()}`,
    destination: rawDest,
    durationDays: totalDays,
    persona,
    preferences,
    budget,
    adults,
    children,
    days: Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(start.getTime() + i * 86400000);
      let dayData;

      if (curatedList && curatedList.length > 0) {
        // Use curated schedule if available
        if (i === totalDays - 1 && totalDays > 1) {
          // Last day is the departure template
          dayData = curatedList[curatedList.length - 1];
        } else {
          // Cycle through intermediate curated days
          const curIdx = i % (curatedList.length - 1);
          dayData = curatedList[curIdx];
        }
      } else {
        // Fallback to high-quality dynamic thematic builder customized to persona & preferences
        dayData = getThematicDay(rawDest, i, totalDays, persona, preferences, budget, adults, children);
      }

      return {
        id: `day-${i + 1}`,
        index: i + 1,
        dayNumber: i + 1,
        label: dayData.label || `Day ${i + 1} in ${rawDest}`,
        title: dayData.label || `Day ${i + 1} in ${rawDest}`,
        dateLabel: date.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short" }),
        date: date.toISOString().split("T")[0],
        activities: (dayData.activities || []).map((a, j) => ({
          id: `day-${i + 1}-act-${j + 1}`,
          ...a,
          note: a.note || "",
        })),
      };
    }),
  };
}

// Calculate approximate distance in kilometers between two GPS coordinates
export function getGeoDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

  itinerary.days.forEach((day, dayIdx) => {
    const dayActivities =
      day.activities && day.activities.length > 0
        ? day.activities
        : [{ id: `${day.id}-act-0`, title: day.label || day.title || `Day ${day.index}`, time: "All day" }];

    dayActivities.forEach((act, actIdx) => {
      const text = `${act.title || ""} ${act.name || ""} ${act.note || ""} ${act.description || ""}`.toLowerCase();

      // 1. First priority: Places explicitly matching the destination category
      let matchedPlace = null;
      for (const place of SPECIFIC_PLACES) {
        if (
          place.destination &&
          (place.destination === normDest ||
            normDest.includes(place.destination) ||
            place.destination.includes(normDest))
        ) {
          if (place.keywords.some((kw) => text.includes(kw))) {
            matchedPlace = place;
            break;
          }
        }
      }

      // 2. Second priority: General/untagged places STRICTLY within 120km of the destination center
      if (!matchedPlace) {
        for (const place of SPECIFIC_PLACES) {
          if (place.keywords.some((kw) => text.includes(kw))) {
            const distKm = getGeoDistanceKm(center.lat, center.lng, place.lat, place.lng);
            if (distKm <= 120) {
              matchedPlace = place;
              break;
            }
          }
        }
      }

      let lat;
      let lng;

      if (matchedPlace) {
        lat = matchedPlace.lat;
        lng = matchedPlace.lng;
      } else {
        // 3. Realistic geographic route spreading along the destination region (tight corridor)
        const baseAngles = [20, 65, 110, 155, 200, 245, 290, 335];
        const dayAngle = baseAngles[dayIdx % baseAngles.length];
        const stopAngle = (dayAngle + (actIdx - 1.5) * 20) * (Math.PI / 180);
        const radius = 0.012 + actIdx * 0.006;

        lat = center.lat + Math.sin(stopAngle) * radius;
        lng = center.lng + Math.cos(stopAngle) * radius;
      }

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
