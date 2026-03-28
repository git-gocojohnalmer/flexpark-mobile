type ParkingSlot = {
  id: string;
  locationName: string;
  status: 'Available' | 'Occupied';
  distance: string;
  rate: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

const mockSlots: ParkingSlot[] = [
  {
    id: 'slot-1',
    locationName: '7/11 parking',
    status: 'Available',
    distance: '0.4 km',
    rate: 'Free',
    coordinate: {
      latitude: -6.21462,
      longitude: 106.84513,
    },
  },
  {
    id: 'slot-2',
    locationName: 'St. Dominic College of Asia',
    status: 'Occupied',
    distance: '1.1 km',
    rate: 'free',
    coordinate: {
      latitude: -6.19688,
      longitude: 106.82299,
    },
  },
  {
    id: 'slot-3',
    locationName: 'Mcdonalds',
    status: 'Available',
    distance: '2.5 km',
    rate: 'free',
    coordinate: {
      latitude: -6.22501,
      longitude: 106.79911,
    },
  },
  {
    id: 'slot-4',
    locationName: 'Jollibee',
    status: 'Occupied',
    distance: '3.2 km',
    rate: 'free',
    coordinate: {
      latitude: -6.22343,
      longitude: 106.83061,
    },
  },
  {
    id: 'slot-5',
    locationName: 'Sogo parking',
    status: 'Available',
    distance: '4.8 km',
    rate: 'free',
    coordinate: {
      latitude: -6.24467,
      longitude: 106.80048,
    },
  },
];

export default mockSlots;