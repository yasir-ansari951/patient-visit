/* ================================================================
   STORAGE.JS – Local Storage CRUD, Doctor Profile & Demo Seeding
   ================================================================ */
const STORAGE_KEY = 'medtrack_patients_v3_dental';
const DOCTOR_KEY = 'medtrack_doctor_profile';

// Default doctor profile (shown if none is saved yet)
const DOCTOR_DEFAULTS = {
  name: 'Dr. Sarah Ahmed',
  initials: 'SA',
  qualification: 'B.D.S, F.C.P.S',
  specialization: 'Senior Dental Surgeon',
  clinicName: 'Dental Clinic',
  phone: '',
  email: '',
  address: ''
};

const doctorProfile = {
  load: function() {
    let saved = localStorage.getItem(DOCTOR_KEY);
    // Migrate older key if present
    if (!saved) {
      const legacy = localStorage.getItem('narowal_doctor_profile');
      if (legacy) {
        saved = legacy;
        localStorage.setItem(DOCTOR_KEY, legacy);
        localStorage.removeItem('narowal_doctor_profile');
      }
    }
    if (!saved) {
      localStorage.setItem(DOCTOR_KEY, JSON.stringify(DOCTOR_DEFAULTS));
      return { ...DOCTOR_DEFAULTS };
    }
    try {
      const profile = JSON.parse(saved);
      // Strip leftover branded clinic name from older sessions
      if (profile.clinicName && /narowal/i.test(profile.clinicName)) profile.clinicName = DOCTOR_DEFAULTS.clinicName;
      if (profile.email && /narowal/i.test(profile.email)) profile.email = DOCTOR_DEFAULTS.email;
      if (profile.address && /narowal/i.test(profile.address)) profile.address = DOCTOR_DEFAULTS.address;
      return profile;
    }
    catch { return { ...DOCTOR_DEFAULTS }; }
  },
  save: function(profile) {
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(profile));
  },
  getInitials: function(name) {
    return name.replace(/^Dr\.\s*/i, '').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  }
};

const storage = {
  load: function() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || JSON.parse(saved).length === 0) {
      this.seedDemoData();
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  },

  save: function(patients) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    if (typeof updateSidebarCount === 'function') updateSidebarCount(patients.length);
  },

  clear: function() {
    localStorage.removeItem(STORAGE_KEY);
  },

  seedDemoData: function() {
    const now = new Date();
    const getPastDate = (daysAgo, hours = 10, minutes = 30) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hours, minutes, 0);
      return d.toISOString();
    };
    const demo = [
      { id:'REC-1001', patientName:'Ahmed Raza', age:45, gender:'Male', phone:'0300-4512389', reason:'Root Canal Treatment', fee:8000, visitDate:getPastDate(0,9,30), notes:'RCT started on tooth #36. Pulp removed, canal cleaned and medicated. Second sitting scheduled next week.' },
      { id:'REC-1002', patientName:'Fatima Noor', age:29, gender:'Female', phone:'0321-8899123', reason:'Scaling & Polishing', fee:3000, visitDate:getPastDate(0,11,15), notes:'Full mouth ultrasonic scaling done. Moderate calculus deposits removed. Advised soft-bristle brush twice daily.' },
      { id:'REC-1003', patientName:'Muhammad Bilal', age:58, gender:'Male', phone:'0333-1122334', reason:'Denture Fitting', fee:15000, visitDate:getPastDate(0,14,20), notes:'Upper partial denture impression taken. Try-in appointment booked. Advised denture hygiene routine.' },
      { id:'REC-1004', patientName:'Zainab Bibi', age:64, gender:'Female', phone:'0301-5544778', reason:'Tooth Extraction', fee:2500, visitDate:getPastDate(1,10,0), notes:'Extraction of mobile tooth #47 under local anesthesia. Post-op instructions given. Prescribed analgesic and antibiotic.' },
      { id:'REC-1005', patientName:'Usman Ali', age:34, gender:'Male', phone:'0345-9988771', reason:'Dental Checkup', fee:1500, visitDate:getPastDate(1,15,30), notes:'Routine 6-month checkup. Early caries spotted on #25, filling advised. Overall oral hygiene good.' },
      { id:'REC-1006', patientName:'Ayesha Tariq', age:22, gender:'Female', phone:'0312-3344556', reason:'Braces Adjustment', fee:4000, visitDate:getPastDate(2,12,10), notes:'Monthly orthodontic adjustment. Archwire changed, elastics replaced. Alignment progressing well.' },
      { id:'REC-1007', patientName:'Imran Khan', age:51, gender:'Male', phone:'0300-7766554', reason:'Dental Implant', fee:45000, visitDate:getPastDate(3,9,45), notes:'Implant fixture placed at site #46. Healing period 3 months before crown placement. Post-surgical care explained.' },
      { id:'REC-1008', patientName:'Sania Mirza', age:38, gender:'Female', phone:'0332-4455667', reason:'Teeth Whitening', fee:12000, visitDate:getPastDate(4,16,15), notes:'In-office bleaching session completed, 2 shades improvement. Advised to avoid tea/coffee for 48 hours.' },
      { id:'REC-1009', patientName:'Hamza Malik', age:16, gender:'Male', phone:'0302-8877665', reason:'Dental Filling', fee:3500, visitDate:getPastDate(5,10,30), notes:'Composite filling on tooth #16 occlusal caries. Bite adjusted and polished. Advised to reduce sugary snacks.' },
      { id:'REC-1010', patientName:'Khadija Mehmood', age:48, gender:'Female', phone:'0322-1199887', reason:'Gum Disease Treatment', fee:5000, visitDate:getPastDate(6,11,0), notes:'Deep curettage for periodontal pockets in lower anterior region. Chlorhexidine mouthwash prescribed.' },
      { id:'REC-1011', patientName:'Tariq Javed', age:62, gender:'Male', phone:'0300-3322110', reason:'Crown / Bridge Work', fee:18000, visitDate:getPastDate(8,14,0), notes:'Tooth preparation done for PFM crown on #21. Temporary crown cemented. Final crown in 5 days.' },
      { id:'REC-1012', patientName:'Maryam Nawaz', age:41, gender:'Female', phone:'0344-5566778', reason:'Root Canal Treatment', fee:9000, visitDate:getPastDate(10,10,15), notes:'RCT completed on tooth #14, obturation done. Crown recommended for long-term protection.' },
      { id:'REC-1013', patientName:'Kamran Akmal', age:33, gender:'Male', phone:'0311-6655443', reason:'Wisdom Tooth Surgery', fee:10000, visitDate:getPastDate(12,15,0), notes:'Surgical removal of impacted lower left wisdom tooth. Sutures placed, removal after 7 days.' },
      { id:'REC-1014', patientName:'Sadia Iqbal', age:27, gender:'Female', phone:'0303-9900112', reason:'Scaling & Polishing', fee:3000, visitDate:getPastDate(15,11,30), notes:'Stain removal and polishing done. Mild gingivitis noted, flossing technique demonstrated.' },
      { id:'REC-1015', patientName:'Rashid Minhas', age:55, gender:'Male', phone:'0331-2233445', reason:'Tooth Extraction', fee:2500, visitDate:getPastDate(20,9,0), notes:'Grossly decayed #38 extracted. Socket irrigated, gauze pressure pack applied. Follow-up if pain persists.' },
      { id:'REC-1016', patientName:'Nida Yasir', age:36, gender:'Female', phone:'0321-7788990', reason:'Dental Filling', fee:4000, visitDate:getPastDate(25,13,0), notes:'Two composite fillings on #26 and #27. Advised fluoride toothpaste and regular checkups.' }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  }
};
