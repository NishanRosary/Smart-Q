// Mock Data for Smart'Q Application
// This file contains shared mock data used by both Customer and Admin components

// Events array - shared between Admin Event Scheduler and Customer Dashboard
let events = [
  {
    id: 1,
    organizationType: 'Hospital',
    title: 'General Health Checkup',
    date: '2024-02-15',
    time: '09:00',
    location: 'City General Hospital, Building A',
    status: 'Upcoming',
    crowdLevel: 'Medium'
  },
  {
    id: 2,
    organizationType: 'Bank',
    title: 'Account Opening Session',
    date: '2024-02-16',
    time: '10:30',
    location: 'Main Street Branch',
    status: 'Upcoming',
    crowdLevel: 'High'
  },
  {
    id: 3,
    organizationType: 'Interview',
    title: 'Software Developer Interview',
    date: '2024-02-14',
    time: '14:00',
    location: 'Tech Corp Office, Floor 5',
    status: 'Ongoing',
    crowdLevel: 'Low'
  },
  {
    id: 4,
    organizationType: 'Government Office',
    title: 'Passport Application',
    date: '2024-02-17',
    time: '11:00',
    location: 'Regional Passport Office',
    status: 'Upcoming',
    crowdLevel: 'High'
  },
  {
    id: 5,
    organizationType: 'Exam',
    title: 'Entrance Examination',
    date: '2024-02-13',
    time: '08:00',
    location: 'University Campus, Hall A',
    status: 'Completed',
    crowdLevel: 'Low'
  }
];

// Queue data
export const queueData = [
  {
    tokenNumber: 'T001',
    customerName: 'John Doe',
    status: 'Waiting',
    service: 'General Checkup',
    joinedAt: '09:15'
  },
  {
    tokenNumber: 'T002',
    customerName: 'Jane Smith',
    status: 'In Progress',
    service: 'Consultation',
    joinedAt: '09:20'
  },
  {
    tokenNumber: 'T003',
    customerName: 'Mike Johnson',
    status: 'Waiting',
    service: 'Lab Test',
    joinedAt: '09:25'
  },
  {
    tokenNumber: 'T004',
    customerName: 'Sarah Williams',
    status: 'Completed',
    service: 'X-Ray',
    joinedAt: '08:45'
  },
  {
    tokenNumber: 'T005',
    customerName: 'David Brown',
    status: 'Waiting',
    service: 'General Checkup',
    joinedAt: '09:30'
  }
];

// Counter data
export const counterData = [
  {
    id: 1,
    number: 'Counter 1',
    status: 'Active',
    currentToken: 'T002',
    serviceType: 'Consultation'
  },
  {
    id: 2,
    number: 'Counter 2',
    status: 'Active',
    currentToken: 'T003',
    serviceType: 'Lab Test'
  },
  {
    id: 3,
    number: 'Counter 3',
    status: 'Inactive',
    currentToken: null,
    serviceType: 'General'
  },
  {
    id: 4,
    number: 'Counter 4',
    status: 'Active',
    currentToken: 'T001',
    serviceType: 'General Checkup'
  }
];

// Analytics dummy data
export const analyticsData = {
  queueTrends: [
    { hour: '08:00', value: 15 },
    { hour: '09:00', value: 45 },
    { hour: '10:00', value: 62 },
    { hour: '11:00', value: 78 },
    { hour: '12:00', value: 55 },
    { hour: '13:00', value: 38 },
    { hour: '14:00', value: 52 },
    { hour: '15:00', value: 68 }
  ],
  peakHours: [
    { hour: '10:00-11:00', count: 78 },
    { hour: '11:00-12:00', count: 75 },
    { hour: '15:00-16:00', count: 68 },
    { hour: '09:00-10:00', count: 45 }
  ],
  servicePopularity: [
    { service: 'General Checkup', count: 120 },
    { service: 'Consultation', count: 85 },
    { service: 'Lab Test', count: 65 },
    { service: 'X-Ray', count: 40 }
  ]
};

// Services list
export const services = [
  'General Checkup',
  'Consultation',
  'Lab Test',
  'X-Ray',
  'Vaccination',
  'Emergency'
];

// Organization types for event scheduler
export const organizationTypes = [
  'Hospital',
  'Bank',
  'Interview',
  'Government Office',
  'Exam',
  'Restaurant',
  'Retail Store',
  'Other'
];

// Functions to manage events (simulated, no real persistence)
export const getEvents = () => {
  return events.filter(event => event.status !== 'Completed');
};

export const getAllEvents = () => {
  return events;
};

export const addEvent = (eventData) => {
  const newEvent = {
    id: events.length + 1,
    ...eventData,
    status: 'Upcoming',
    crowdLevel: 'Medium'
  };
  events.push(newEvent);
  return newEvent;
};

export const updateEvent = (eventId, updates) => {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    return events[index];
  }
  return null;
};

export const deleteEvent = (eventId) => {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events.splice(index, 1);
    return true;
  }
  return false;
};

// Customer queue status (dummy data)
export const customerQueueStatus = {
  position: 15,
  estimatedWaitTime: 25,
  crowdLevel: 'Medium',
  tokenNumber: 'T015',
  service: 'General Checkup'
};

// Summary statistics for admin dashboard
export const summaryStats = {
  totalQueues: 24,
  activeCounters: 3,
  pendingEvents: 4,
  totalCustomers: 156,
  averageWaitTime: 18
};

// ML Prediction Data
export const mlPredictions = {
  peakTimes: [
    { hour: '10:00', prediction: 'High', confidence: 92, customers: 85 },
    { hour: '11:00', prediction: 'High', confidence: 88, customers: 78 },
    { hour: '14:00', prediction: 'Medium', confidence: 75, customers: 52 },
    { hour: '15:00', prediction: 'Medium', confidence: 70, customers: 45 },
    { hour: '09:00', prediction: 'Low', confidence: 65, customers: 30 },
    { hour: '16:00', prediction: 'Low', confidence: 60, customers: 25 }
  ],
  waitTimePredictions: [
    { time: 'Now', predictedWait: 25, actualWait: 25, accuracy: 100 },
    { time: '+1 hour', predictedWait: 18, actualWait: null, accuracy: 92 },
    { time: '+2 hours', predictedWait: 12, actualWait: null, accuracy: 88 },
    { time: '+3 hours', predictedWait: 8, actualWait: null, accuracy: 85 }
  ],
  crowdForecast: [
    { date: 'Today', time: '10:00-11:00', level: 'High', probability: 92 },
    { date: 'Today', time: '11:00-12:00', level: 'High', probability: 88 },
    { date: 'Today', time: '14:00-15:00', level: 'Medium', probability: 75 },
    { date: 'Tomorrow', time: '10:00-11:00', level: 'Medium', probability: 70 },
    { date: 'Tomorrow', time: '14:00-15:00', level: 'Low', probability: 65 }
  ],
  optimalVisitTimes: [
    { time: '08:00-09:00', score: 95, waitTime: 5, crowdLevel: 'Low' },
    { time: '13:00-14:00', score: 88, waitTime: 8, crowdLevel: 'Low' },
    { time: '16:00-17:00', score: 82, waitTime: 12, crowdLevel: 'Medium' }
  ],
  mlModelStats: {
    modelAccuracy: 92,
    predictionsToday: 156,
    avgAccuracy: 88,
    lastUpdated: '2 minutes ago'
  }
};

