import fs from 'fs';
import path from 'path';

function replaceImports(dir: string) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      replaceImports(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/\.\.\/components/g, '@/components');
      content = content.replace(/\.\.\/lib/g, '@/lib');
      content = content.replace(/\.\.\/src\/components/g, '@/components');
      content = content.replace(/\.\.\/src\/lib/g, '@/lib');
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceImports('app');
replaceImports('src/components');
