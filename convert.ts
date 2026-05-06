import fs from 'fs';

function replaceToWithHref(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<Link\s+to=/g, '<Link href=');
  content = content.replace(/import { Link([^}]*)} from 'react-router';/g, 'import Link from "next/link";');
  content = content.replace(/import { useNavigate([^}]*)} from 'react-router';/g, 'import { useRouter } from "next/navigation";');
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  // if some files still have Link from react-router but separated
  content = content.replace(/import {([^}]*)Link([^}]*)} from 'react-router';/g, "import {$1 $2} from 'react-router';\nimport Link from 'next/link';");
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/components/Layout.tsx',
  'app/page.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Generator.tsx',
  'src/pages/Library.tsx',
  'src/pages/Settings.tsx'
];

files.forEach(replaceToWithHref);

// For pages, we also need to add 'use client'; at the top.
files.slice(1).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('"use client";')) {
    content = '"use client";\n' + content;
  }
  content = content.replace(/navigate\(/g, 'router.push(');
  fs.writeFileSync(file, content);
});

// Rename pages to Next.js routes
['dashboard', 'generator', 'library', 'settings'].forEach(dir => {
  if (!fs.existsSync(`app/${dir}`)) {
    fs.mkdirSync(`app/${dir}`, { recursive: true });
  }
});
if (fs.existsSync('src/pages/Landing.tsx')) fs.renameSync('src/pages/Landing.tsx', 'app/page.tsx');
if (fs.existsSync('src/pages/Dashboard.tsx')) fs.renameSync('src/pages/Dashboard.tsx', 'app/dashboard/page.tsx');
if (fs.existsSync('src/pages/Generator.tsx')) fs.renameSync('src/pages/Generator.tsx', 'app/generator/page.tsx');
if (fs.existsSync('src/pages/Library.tsx')) fs.renameSync('src/pages/Library.tsx', 'app/library/page.tsx');
if (fs.existsSync('src/pages/Settings.tsx')) fs.renameSync('src/pages/Settings.tsx', 'app/settings/page.tsx');
