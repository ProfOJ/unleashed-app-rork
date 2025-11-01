export type ChurchData = {
  countries: {
    [country: string]: {
      districts: {
        [district: string]: string[];
      };
    };
  };
};

export const churchData: ChurchData = {
  countries: {
    Ghana: {
      districts: {
        'Greater Accra': [
          'PIWC Atomic',
          'PIWC Sakumono',
          'PIWC Ridge',
          'La Assembly',
          'Tema Community 1',
          'Madina Central',
        ],
        Ashanti: [
          'PIWC Kumasi',
          'Adum Assembly',
          'Asafo Assembly',
          'Bantama Assembly',
        ],
        Western: ['Takoradi Central', 'Sekondi Assembly', 'Tarkwa Assembly'],
        Eastern: [
          'Koforidua Central',
          'Akropong Assembly',
          'Nsawam Assembly',
        ],
      },
    },
    Nigeria: {
      districts: {
        Lagos: [
          'PIWC Lekki',
          'PIWC Victoria Island',
          'Ikeja Assembly',
          'Surulere Assembly',
        ],
        Abuja: ['PIWC Abuja', 'Garki Assembly', 'Maitama Assembly'],
        'Port Harcourt': ['Port Harcourt Central', 'Rumuokoro Assembly'],
      },
    },
    'United States': {
      districts: {
        'New York': ['Bronx Assembly', 'Brooklyn Assembly', 'Queens Assembly'],
        Georgia: ['Atlanta Assembly', 'Columbus Assembly'],
        Texas: ['Houston Assembly', 'Dallas Assembly'],
      },
    },
    'United Kingdom': {
      districts: {
        London: ['Peckham Assembly', 'Woolwich Assembly', 'Edmonton Assembly'],
        Manchester: ['Manchester Central', 'Salford Assembly'],
        Birmingham: ['Birmingham Assembly'],
      },
    },
  },
};
