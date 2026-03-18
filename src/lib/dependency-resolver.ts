// Automatic dependency resolution for generated code

import { detectDependencies } from './ast-editor';

// Known package versions (latest stable)
const PACKAGE_VERSIONS: Record<string, string> = {
  // React ecosystem
  'react': '^19.2.4',
  'react-dom': '^19.2.4',
  'react-router-dom': '^6.30.1',
  
  // UI libraries
  'lucide-react': '^0.462.0',
  'framer-motion': '^12.26.2',
  '@radix-ui/react-dialog': '^1.1.14',
  '@radix-ui/react-dropdown-menu': '^2.1.15',
  '@radix-ui/react-tooltip': '^1.2.7',
  '@radix-ui/react-tabs': '^1.1.12',
  '@radix-ui/react-accordion': '^1.2.11',
  '@radix-ui/react-popover': '^1.1.14',
  '@radix-ui/react-select': '^2.2.5',
  '@radix-ui/react-switch': '^1.2.5',
  '@radix-ui/react-checkbox': '^1.3.2',
  '@radix-ui/react-slider': '^1.3.5',
  '@radix-ui/react-progress': '^1.1.7',
  '@radix-ui/react-avatar': '^1.1.10',
  '@radix-ui/react-scroll-area': '^1.2.9',
  
  // Styling
  'tailwind-merge': '^2.6.0',
  'clsx': '^2.1.1',
  'class-variance-authority': '^0.7.1',
  'tw-animate-css': '^1.4.0',
  
  // Forms
  'react-hook-form': '^7.61.1',
  '@hookform/resolvers': '^3.10.0',
  'zod': '^3.25.76',
  
  // Data fetching
  '@tanstack/react-query': '^5.83.0',
  '@supabase/supabase-js': '^2.90.1',
  
  // Charts
  'recharts': '^2.15.4',
  
  // Date
  'date-fns': '^3.6.0',
  'react-day-picker': '^9.14.0',
  
  // 3D/WebGL
  'three': '^0.160.1',
  '@react-three/fiber': '^9.5.0',
  '@react-three/drei': '^10.7.7',
  
  // Animation
  'embla-carousel-react': '^8.6.0',
  
  // Misc
  'sonner': '^1.7.4',
  'cmdk': '^1.1.1',
  'vaul': '^1.1.2',
  'next-themes': '^0.4.6',
};

// Common import mappings (import name -> package name)
const IMPORT_MAPPINGS: Record<string, string> = {
  // Icons
  'lucide-react': 'lucide-react',
  
  // Motion
  'motion': 'framer-motion',
  'framer-motion': 'framer-motion',
  
  // Radix
  '@radix-ui': '@radix-ui',
  
  // Utils
  'cn': 'clsx', // Usually from a local util
  'clsx': 'clsx',
  'twMerge': 'tailwind-merge',
  'cva': 'class-variance-authority',
  
  // Data
  'useQuery': '@tanstack/react-query',
  'useMutation': '@tanstack/react-query',
  'createClient': '@supabase/supabase-js',
  
  // Forms
  'useForm': 'react-hook-form',
  'zodResolver': '@hookform/resolvers',
  'z': 'zod',
  
  // Charts
  'LineChart': 'recharts',
  'BarChart': 'recharts',
  'PieChart': 'recharts',
  'AreaChart': 'recharts',
  
  // Date
  'format': 'date-fns',
  'parseISO': 'date-fns',
  'DayPicker': 'react-day-picker',
  
  // 3D
  'Canvas': '@react-three/fiber',
  'useFrame': '@react-three/fiber',
  'OrbitControls': '@react-three/drei',
  'Text': '@react-three/drei',
  
  // Toast
  'toast': 'sonner',
  'Toaster': 'sonner',
  
  // Command
  'Command': 'cmdk',
  
  // Drawer
  'Drawer': 'vaul',
};

export interface DependencyInfo {
  name: string;
  version: string;
  isDevDependency?: boolean;
}

export interface ResolvedDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  missing: string[];
}

// Resolve dependencies from code
export function resolveDependencies(code: string): ResolvedDependencies {
  const detected = detectDependencies(code);
  const result: ResolvedDependencies = {
    dependencies: {},
    devDependencies: {},
    missing: [],
  };
  
  // Always include React
  result.dependencies['react'] = PACKAGE_VERSIONS['react'];
  result.dependencies['react-dom'] = PACKAGE_VERSIONS['react-dom'];
  
  for (const dep of detected) {
    // Check if we have a known version
    if (PACKAGE_VERSIONS[dep]) {
      result.dependencies[dep] = PACKAGE_VERSIONS[dep];
    } else if (dep.startsWith('@radix-ui/')) {
      // Handle Radix packages dynamically
      const version = PACKAGE_VERSIONS[dep] || '^1.0.0';
      result.dependencies[dep] = version;
    } else if (dep.startsWith('@')) {
      // Scoped package we don't know
      result.missing.push(dep);
    } else {
      result.missing.push(dep);
    }
  }
  
  return result;
}

// Resolve dependencies from multiple files
export function resolveProjectDependencies(
  files: Array<{ path: string; content: string }>
): ResolvedDependencies {
  const combined: ResolvedDependencies = {
    dependencies: {
      'react': PACKAGE_VERSIONS['react'],
      'react-dom': PACKAGE_VERSIONS['react-dom'],
    },
    devDependencies: {
      '@types/react': '^19.2.14',
      '@types/react-dom': '^19.2.3',
      'typescript': '^5.0.0',
      'vite': '^5.0.0',
      '@vitejs/plugin-react-swc': '^3.11.0',
      '@tailwindcss/vite': '^4.2.1',
      'tailwindcss': '^4.2.1',
    },
    missing: [],
  };
  
  for (const file of files) {
    // Only process TypeScript/JavaScript files
    if (!file.path.match(/\.(tsx?|jsx?)$/)) continue;
    
    const resolved = resolveDependencies(file.content);
    
    // Merge dependencies
    Object.assign(combined.dependencies, resolved.dependencies);
    
    // Track missing
    for (const missing of resolved.missing) {
      if (!combined.missing.includes(missing)) {
        combined.missing.push(missing);
      }
    }
  }
  
  return combined;
}

// Get latest version of a package (mock - in production, call npm registry)
export async function getLatestVersion(packageName: string): Promise<string | null> {
  // Check known versions first
  if (PACKAGE_VERSIONS[packageName]) {
    return PACKAGE_VERSIONS[packageName];
  }
  
  // In production, this would fetch from npm registry
  // For now, return a default
  return '^1.0.0';
}

// Suggest dependencies based on code patterns
export function suggestDependencies(code: string): DependencyInfo[] {
  const suggestions: DependencyInfo[] = [];
  
  // Check for patterns that suggest certain dependencies
  const patterns: Array<{ regex: RegExp; dep: DependencyInfo }> = [
    {
      regex: /className=.*\{.*cn\(/,
      dep: { name: 'clsx', version: PACKAGE_VERSIONS['clsx'] },
    },
    {
      regex: /motion\.|AnimatePresence|framer-motion/,
      dep: { name: 'framer-motion', version: PACKAGE_VERSIONS['framer-motion'] },
    },
    {
      regex: /useQuery|useMutation|QueryClient/,
      dep: { name: '@tanstack/react-query', version: PACKAGE_VERSIONS['@tanstack/react-query'] },
    },
    {
      regex: /useForm|Controller|FormProvider/,
      dep: { name: 'react-hook-form', version: PACKAGE_VERSIONS['react-hook-form'] },
    },
    {
      regex: /z\.object|z\.string|zodResolver/,
      dep: { name: 'zod', version: PACKAGE_VERSIONS['zod'] },
    },
    {
      regex: /Canvas|useFrame|useThree/,
      dep: { name: '@react-three/fiber', version: PACKAGE_VERSIONS['@react-three/fiber'] },
    },
    {
      regex: /LineChart|BarChart|PieChart|AreaChart/,
      dep: { name: 'recharts', version: PACKAGE_VERSIONS['recharts'] },
    },
    {
      regex: /format\(.*Date|parseISO|addDays|subDays/,
      dep: { name: 'date-fns', version: PACKAGE_VERSIONS['date-fns'] },
    },
    {
      regex: /toast\(|Toaster/,
      dep: { name: 'sonner', version: PACKAGE_VERSIONS['sonner'] },
    },
  ];
  
  for (const { regex, dep } of patterns) {
    if (regex.test(code) && !suggestions.find(s => s.name === dep.name)) {
      suggestions.push(dep);
    }
  }
  
  return suggestions;
}

// Merge dependency objects
export function mergeDependencies(
  base: Record<string, string>,
  additions: Record<string, string>
): Record<string, string> {
  return { ...base, ...additions };
}
