export type MockTestimony = {
  id: string;
  name: string;
  role: string;
  photoUri: string;
  story: string;
  seen: string[];
  heard: string[];
  experienced: string[];
  claps: number;
  slug: string;
  createdAt: string;
  isLocal: true;
};

export const MOCK_TESTIMONIES: MockTestimony[] = [
  {
    id: 'mock-1',
    name: 'Sarah Johnson',
    role: 'Teacher & Youth Leader',
    photoUri: 'https://i.pravatar.cc/150?img=1',
    story: 'God transformed my life when I surrendered everything to Him. He gave me a new purpose and filled my heart with His love.',
    seen: ['His faithfulness in my family', 'Miracles in my community', 'Lives changed by the Gospel'],
    heard: ['The gospel of grace', 'Words of encouragement from believers', 'His voice in prayer'],
    experienced: ['Peace beyond understanding', 'Joy in trials', 'Divine appointments'],
    claps: 24,
    slug: 'sarah-johnson',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-2',
    name: 'Michael Chen',
    role: 'Software Engineer',
    photoUri: 'https://i.pravatar.cc/150?img=12',
    story: 'Through Christ, I found purpose and direction in my career and life. He showed me how to use my skills to glorify Him and serve others.',
    seen: ['God\'s provision in difficult times', 'Changed lives around me', 'Answers to prayer'],
    heard: ['The truth that sets free', 'Testimonies of healing', 'God\'s calling for my life'],
    experienced: ['Divine guidance', 'Breakthrough in relationships', 'Supernatural peace'],
    claps: 18,
    slug: 'michael-chen',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-3',
    name: 'Priscilla Mensah',
    role: 'Nurse & Worship Leader',
    photoUri: 'https://i.pravatar.cc/150?img=5',
    story: 'Jesus healed me and now I share His love through worship and service. Every day is an opportunity to point others to Him.',
    seen: ['Miracles in the hospital', 'Answered prayers', 'God\'s faithfulness'],
    heard: ['God calling me to ministry', 'Prophecies fulfilled', 'Words of wisdom'],
    experienced: ['Physical healing', 'Emotional restoration', 'His presence in worship'],
    claps: 32,
    slug: 'priscilla-mensah',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-4',
    name: 'David Osei',
    role: 'Business Owner',
    photoUri: 'https://i.pravatar.cc/150?img=13',
    story: 'From bankruptcy to breakthrough, God restored everything I lost and taught me to trust Him completely. My business is now a ministry platform.',
    seen: ['Financial miracles', 'Doors opening supernaturally', 'Employees coming to Christ'],
    heard: ['His voice guiding business decisions', 'Prophetic words coming to pass', 'Testimonies of provision'],
    experienced: ['Restoration of finances', 'Favor with clients', 'Peace in uncertainty'],
    claps: 41,
    slug: 'david-osei',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-5',
    name: 'Grace Amoako',
    role: 'Student & Evangelist',
    photoUri: 'https://i.pravatar.cc/150?img=44',
    story: 'Jesus rescued me from depression and gave me a mission to reach my generation. Now I lead a campus ministry sharing the Gospel with boldness.',
    seen: ['Students accepting Christ', 'Lives transformed on campus', 'Miracles in chapel'],
    heard: ['God\'s call to evangelism', 'The Holy Spirit\'s voice', 'Words of knowledge'],
    experienced: ['Deliverance from depression', 'Joy unspeakable', 'Boldness to witness'],
    claps: 28,
    slug: 'grace-amoako',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-6',
    name: 'Emmanuel Kwarteng',
    role: 'Pastor & Author',
    photoUri: 'https://i.pravatar.cc/150?img=14',
    story: 'After years of running from God, He caught up with me and transformed my rebellion into radical obedience. Now I shepherd His flock with joy.',
    seen: ['Church members healed', 'Marriages restored', 'Addictions broken'],
    heard: ['Clear prophetic words', 'God\'s instruction for the church', 'Testimonies of breakthrough'],
    experienced: ['Intimacy with God', 'Power in preaching', 'Miracles in ministry'],
    claps: 56,
    slug: 'emmanuel-kwarteng',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-7',
    name: 'Rebecca Ansah',
    role: 'Doctor & Medical Missionary',
    photoUri: 'https://i.pravatar.cc/150?img=47',
    story: 'God called me from a comfortable practice to serve the unreached. In the mission field, I\'ve witnessed more miracles than I ever did in the hospital.',
    seen: ['Blind eyes opened', 'The lame walking', 'Whole villages coming to Christ'],
    heard: ['God\'s call to missions', 'Stories of faith from locals', 'The Gospel in new languages'],
    experienced: ['Provision in impossible situations', 'Protection in danger', 'Joy in sacrifice'],
    claps: 67,
    slug: 'rebecca-ansah',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
  {
    id: 'mock-8',
    name: 'Joshua Mensah',
    role: 'Youth Pastor',
    photoUri: 'https://i.pravatar.cc/150?img=51',
    story: 'Saved from gang life at 16, now I\'m reaching the streets where I once ran. God turned my mess into my message and my test into my testimony.',
    seen: ['Former gang members saved', 'Youth transformation', 'Community revival'],
    heard: ['God\'s redemptive voice', 'Testimonies of changed lives', 'Prophecies over youth'],
    experienced: ['Complete transformation', 'Anointing for youth ministry', 'Divine protection'],
    claps: 45,
    slug: 'joshua-mensah',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isLocal: true,
  },
];
