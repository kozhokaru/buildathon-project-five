import { Entity, Relationship } from './graph-builder'

export interface DemoDataset {
  id: string
  name: string
  description: string
  content: string
  entities: Entity[]
  relationships: Relationship[]
}

export const DEMO_DATASETS: Record<string, DemoDataset> = {
  'solar-system': {
    id: 'solar-system',
    name: 'Solar System',
    description: 'Explore planets, moons, and space missions',
    content: `The Solar System consists of the Sun and everything that orbits around it. Mercury is the smallest planet and closest to the Sun. Venus has a dense atmosphere and extreme greenhouse effect. Earth is our home planet with liquid water and life. Mars, the red planet, has polar ice caps and the largest volcano in the solar system, Olympus Mons.

Jupiter is the largest planet with the Great Red Spot storm and four large moons discovered by Galileo: Io, Europa, Ganymede, and Callisto. Saturn is famous for its rings and has the moon Titan with a thick atmosphere. Uranus rotates on its side and has faint rings. Neptune has the fastest winds in the solar system.

NASA has sent many missions including Voyager 1 and Voyager 2 to explore the outer planets. The Mars rovers like Curiosity and Perseverance explore the Martian surface. The Cassini mission studied Saturn and its moons. New Horizons flew by Pluto and continues into the Kuiper Belt.`,
    entities: [
      { id: 'sun', name: 'Sun', type: 'place', importance: 1 },
      { id: 'mercury', name: 'Mercury', type: 'place', importance: 0.7 },
      { id: 'venus', name: 'Venus', type: 'place', importance: 0.7 },
      { id: 'earth', name: 'Earth', type: 'place', importance: 1 },
      { id: 'mars', name: 'Mars', type: 'place', importance: 0.9 },
      { id: 'jupiter', name: 'Jupiter', type: 'place', importance: 0.9 },
      { id: 'saturn', name: 'Saturn', type: 'place', importance: 0.9 },
      { id: 'uranus', name: 'Uranus', type: 'place', importance: 0.7 },
      { id: 'neptune', name: 'Neptune', type: 'place', importance: 0.7 },
      
      { id: 'olympus-mons', name: 'Olympus Mons', type: 'place', importance: 0.6, description: 'Largest volcano in the solar system' },
      { id: 'great-red-spot', name: 'Great Red Spot', type: 'event', importance: 0.6, description: 'Giant storm on Jupiter' },
      
      { id: 'io', name: 'Io', type: 'place', importance: 0.5, description: 'Volcanic moon of Jupiter' },
      { id: 'europa', name: 'Europa', type: 'place', importance: 0.6, description: 'Ice-covered moon with subsurface ocean' },
      { id: 'ganymede', name: 'Ganymede', type: 'place', importance: 0.5, description: 'Largest moon in the solar system' },
      { id: 'callisto', name: 'Callisto', type: 'place', importance: 0.5, description: 'Heavily cratered moon of Jupiter' },
      { id: 'titan', name: 'Titan', type: 'place', importance: 0.6, description: "Saturn's largest moon with thick atmosphere" },
      
      { id: 'galileo', name: 'Galileo', type: 'person', importance: 0.8, description: 'Discovered Jupiter\'s four largest moons' },
      { id: 'nasa', name: 'NASA', type: 'organization', importance: 1 },
      
      { id: 'voyager-1', name: 'Voyager 1', type: 'technology', importance: 0.8, description: 'Space probe exploring outer solar system' },
      { id: 'voyager-2', name: 'Voyager 2', type: 'technology', importance: 0.8, description: 'Space probe that visited all outer planets' },
      { id: 'curiosity', name: 'Curiosity', type: 'technology', importance: 0.8, description: 'Mars rover exploring Gale Crater' },
      { id: 'perseverance', name: 'Perseverance', type: 'technology', importance: 0.8, description: 'Mars rover searching for signs of ancient life' },
      { id: 'cassini', name: 'Cassini', type: 'technology', importance: 0.7, description: 'Mission that studied Saturn system' },
      { id: 'new-horizons', name: 'New Horizons', type: 'technology', importance: 0.7, description: 'Mission that flew by Pluto' },
      { id: 'pluto', name: 'Pluto', type: 'place', importance: 0.6, description: 'Dwarf planet in Kuiper Belt' },
      { id: 'kuiper-belt', name: 'Kuiper Belt', type: 'place', importance: 0.5, description: 'Region of icy bodies beyond Neptune' }
    ],
    relationships: [
      { source: 'mercury', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'venus', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'earth', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'mars', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'jupiter', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'saturn', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'uranus', target: 'sun', type: 'orbits', strength: 1 },
      { source: 'neptune', target: 'sun', type: 'orbits', strength: 1 },
      
      { source: 'olympus-mons', target: 'mars', type: 'located-on', strength: 1 },
      { source: 'great-red-spot', target: 'jupiter', type: 'located-on', strength: 1 },
      
      { source: 'io', target: 'jupiter', type: 'orbits', strength: 0.9 },
      { source: 'europa', target: 'jupiter', type: 'orbits', strength: 0.9 },
      { source: 'ganymede', target: 'jupiter', type: 'orbits', strength: 0.9 },
      { source: 'callisto', target: 'jupiter', type: 'orbits', strength: 0.9 },
      { source: 'titan', target: 'saturn', type: 'orbits', strength: 0.9 },
      
      { source: 'galileo', target: 'io', type: 'discovered', strength: 0.7 },
      { source: 'galileo', target: 'europa', type: 'discovered', strength: 0.7 },
      { source: 'galileo', target: 'ganymede', type: 'discovered', strength: 0.7 },
      { source: 'galileo', target: 'callisto', type: 'discovered', strength: 0.7 },
      
      { source: 'voyager-1', target: 'jupiter', type: 'explored', strength: 0.8 },
      { source: 'voyager-1', target: 'saturn', type: 'explored', strength: 0.8 },
      { source: 'voyager-2', target: 'jupiter', type: 'explored', strength: 0.8 },
      { source: 'voyager-2', target: 'saturn', type: 'explored', strength: 0.8 },
      { source: 'voyager-2', target: 'uranus', type: 'explored', strength: 0.8 },
      { source: 'voyager-2', target: 'neptune', type: 'explored', strength: 0.8 },
      
      { source: 'curiosity', target: 'mars', type: 'explores', strength: 1 },
      { source: 'perseverance', target: 'mars', type: 'explores', strength: 1 },
      { source: 'cassini', target: 'saturn', type: 'studied', strength: 0.9 },
      { source: 'cassini', target: 'titan', type: 'studied', strength: 0.8 },
      { source: 'new-horizons', target: 'pluto', type: 'explored', strength: 0.9 },
      { source: 'new-horizons', target: 'kuiper-belt', type: 'explores', strength: 0.7 },
      
      { source: 'nasa', target: 'voyager-1', type: 'operates', strength: 0.9 },
      { source: 'nasa', target: 'voyager-2', type: 'operates', strength: 0.9 },
      { source: 'nasa', target: 'curiosity', type: 'operates', strength: 0.9 },
      { source: 'nasa', target: 'perseverance', type: 'operates', strength: 0.9 },
      { source: 'nasa', target: 'cassini', type: 'operated', strength: 0.8 },
      { source: 'nasa', target: 'new-horizons', type: 'operates', strength: 0.9 },
      
      { source: 'pluto', target: 'kuiper-belt', type: 'located-in', strength: 0.9 }
    ]
  }
}