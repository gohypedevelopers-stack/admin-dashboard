export const DOCTORS_DATA = [
  { id: 1, name: 'Dr. Sarah Smith', email: 'sarah@clinic.com', specialty: 'Cardiology', license: 'LIC-001', status: 'Verified', statusDetail: 'Verified 2025-11-20' },
  { id: 2, name: 'Dr. James Wilson', email: 'james@clinic.com', specialty: 'Neurology', license: 'LIC-002', status: 'Verified', statusDetail: 'Verified 2025-11-18' },
  { id: 3, name: 'Dr. Maria Garcia', email: 'maria@clinic.com', specialty: 'Pediatrics', license: 'LIC-003', status: 'Pending', statusDetail: 'Documents submitted' },
  { id: 4, name: 'Dr. Robert Lee', email: 'robert@clinic.com', specialty: 'Orthopedics', license: 'LIC-004', status: 'Verified', statusDetail: 'Verified 2025-11-15' },
  { id: 5, name: 'Dr. Emma Johnson', email: 'emma@clinic.com', specialty: 'Dermatology', license: 'LIC-005', status: 'Verified', statusDetail: 'Verified 2025-11-22' },
];

export const VERIFICATION_PIPELINE = [
  {
    id: 101,
    doctorId: 'doc_101',
    name: 'Dr. James Wilson',
    fullName: 'Dr. James Wilson',
    email: 'james@example.com',
    phoneNumber: '+91 98765 43210',
    medicalSpecialization: 'Neurology',
    yearsOfExperience: 11,
    clinicHospitalName: 'Neuro Care Center',
    clinicAddress: '12 MG Road, Bengaluru',
    state: 'Karnataka',
    city: 'Bengaluru',
    registrationNumber: 'REG98765',
    councilName: 'MCI',
    issueDate: '2019-08-10',
    documentType: 'Aadhaar Card',
    type: 'Doctor License',
    submitted: '2025-11-25',
    status: 'Pending',
    files: {
      mbbsCertificate: 'https://cdn.example.com/docs/doc_101/mbbs.pdf',
      mdMsBdsCertificate: 'https://cdn.example.com/docs/doc_101/md.pdf',
      registrationCertificate: 'https://cdn.example.com/docs/doc_101/reg.pdf',
      governmentId: 'https://cdn.example.com/docs/doc_101/id.pdf',
      selfie: 'https://cdn.example.com/docs/doc_101/selfie.png'
    }
  },
  {
    id: 102,
    doctorId: 'doc_102',
    name: 'Dr. Anita Rao',
    fullName: 'Dr. Anita Rao',
    email: 'anita@example.com',
    phoneNumber: '+91 99887 66554',
    medicalSpecialization: 'Cardiology',
    yearsOfExperience: 9,
    clinicHospitalName: 'City Heart Hospital',
    clinicAddress: '221 Brigade Road, Bengaluru',
    state: 'Karnataka',
    city: 'Bengaluru',
    registrationNumber: 'REG55667',
    councilName: 'State Council',
    issueDate: '2020-03-18',
    documentType: 'Passport',
    type: 'Doctor License',
    submitted: '2025-11-24',
    status: 'Pending',
    files: {
      mbbsCertificate: 'https://cdn.example.com/docs/doc_102/mbbs.pdf',
      mdMsBdsCertificate: null,
      registrationCertificate: 'https://cdn.example.com/docs/doc_102/reg.pdf',
      governmentId: 'https://cdn.example.com/docs/doc_102/id.pdf',
      selfie: 'https://cdn.example.com/docs/doc_102/selfie.png'
    }
  }
];

export const AVAILABILITY_DATA = [
  { doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', days: 'Mon, Tue, Thu', time: '09:00 – 16:00', location: 'City Hospital' },
  { doctor: 'Dr. James Wilson', specialty: 'Neurology', days: 'Mon – Fri', time: '10:00 – 18:00', location: 'Neuro Care Center' },
  { doctor: 'Dr. Robert Lee', specialty: 'Orthopedics', days: 'Tue, Wed, Fri', time: '08:30 – 15:30', location: 'Ortho Plus Clinic' },
  { doctor: 'Dr. Emma Johnson', specialty: 'Dermatology', days: 'Mon, Wed, Sat', time: '11:00 – 17:00', location: 'Skin Health Clinic' },
];

export const TODAY_BOOKINGS = [
  { id: 'B-201', doctor: 'Dr. Sarah Smith', patient: 'Anita Kumar', time: '10:00', status: 'Confirmed', visitType: 'Consultation' },
  { id: 'B-202', doctor: 'Dr. Robert Lee', patient: 'Ravi Mehra', time: '11:30', status: 'In Progress', visitType: 'Follow-up' },
  { id: 'B-203', doctor: 'Dr. Emma Johnson', patient: 'Sia Kapoor', time: '14:15', status: 'Scheduled', visitType: 'Skin Check' },
];

export const TOP_DOCTORS = [
  { name: 'Dr. Sarah Smith', specialty: 'Cardiology', rating: 4.9, revenue: 185000 },
  { name: 'Dr. Robert Lee', specialty: 'Orthopedics', rating: 4.8, revenue: 162000 },
  { name: 'Dr. Emma Johnson', specialty: 'Dermatology', rating: 4.7, revenue: 148500 },
];

export const REVENUE_SUMMARY = [
  { label: 'Monthly Revenue', value: '₹5,42,300' },
  { label: 'Avg per Doctor', value: '₹1,08,460' },
  { label: 'MoM Growth', value: '+12%' },
];

export const DOCTOR_REVENUE = [
  { doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', revenue: 185000, sessions: 82 },
  { doctor: 'Dr. Robert Lee', specialty: 'Orthopedics', revenue: 162000, sessions: 71 },
  { doctor: 'Dr. Emma Johnson', specialty: 'Dermatology', revenue: 148500, sessions: 69 },
  { doctor: 'Dr. James Wilson', specialty: 'Neurology', revenue: 132400, sessions: 58 },
];
