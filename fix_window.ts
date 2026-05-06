import fs from 'fs';

let content = fs.readFileSync('src/components/animations.tsx', 'utf8');
content = content.replace(/if \(window\.matchMedia/g, "if (typeof window !== 'undefined' && window.matchMedia");
fs.writeFileSync('src/components/animations.tsx', content);
