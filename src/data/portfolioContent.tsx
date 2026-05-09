import { 
  ArrowUpRight, 
  Github, 
  Twitter, 
  Linkedin, 
  ExternalLink,
  Instagram,
  ArrowRight
} from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  year: string;
  link?: string;
}

export const projects: Project[] = [
  {
    id: '01',
    title: 'Aura Design System',
    category: 'Brand Identity / Web',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    year: '2024',
    link: '#'
  },
  {
    id: '02',
    title: 'Ethos Mobile App',
    category: 'Product Design / UI/UX',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2564&auto=format&fit=crop',
    year: '2023',
    link: '#'
  },
  {
    id: '03',
    title: 'Symmetry Interiors',
    category: 'Motion Design / Web',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2564&auto=format&fit=crop',
    year: '2023',
    link: '#'
  },
  {
    id: '04',
    title: 'Nexus Data Platform',
    category: 'Interface Design',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2564&auto=format&fit=crop',
    year: '2022',
    link: '#'
  }
];

export const services = [
  {
    title: 'Strategic Design',
    description: 'We craft comprehensive design systems that bridge the gap between creative vision and functional reality.'
  },
  {
    title: 'Interface Engineering',
    description: 'High-performance web and mobile interfaces built with pixel-perfect precision and interactive depth.'
  },
  {
    title: 'Brand Architecture',
    description: 'Defining the visual and conceptual DNA of companies through intentional research and minimalist execution.'
  }
];

export const socialLinks = [
  { label: 'Twitter', icon: <Twitter className="w-4 h-4" />, url: '#' },
  { label: 'Instagram', icon: <Instagram className="w-4 h-4" />, url: '#' },
  { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, url: '#' },
  { label: 'Github', icon: <Github className="w-4 h-4" />, url: '#' }
];
