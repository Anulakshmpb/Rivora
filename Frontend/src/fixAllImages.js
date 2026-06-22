const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'Pages');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const importStatement = `import { getImageUrl } from '../../utils/getImageUrl';`;

function processFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern 1: imgPath.startsWith('http') || imgPath.startsWith('/uploads') ? ...
    const regex1 = /([\w.]+)\.startsWith\('http'\) \|\| ([\w.]+)\.startsWith\('\/uploads'\) \? \(([\w.]+)\.startsWith\('http'\) \? ([\w.]+) : `http:\/\/13\.238\.159\.254:5000\$\{([\w.]+)\}`\) : ([\w.]+)/g;
    content = content.replace(regex1, 'getImageUrl($1)');

    // Pattern 2: `http://13.238.159.254:5000${...}`
    const regex2 = /`http:\/\/13\.238\.159\.254:5000\$\{([\w.?[\]]+)\}`/g;
    content = content.replace(regex2, 'getImageUrl($1)');

    // Pattern 3: item.img.startsWith('http') ? item.img : `http://13.238.159.254:5000${item.img}`
    const regex3 = /([\w.]+)\.startsWith\('http'\) \? ([\w.]+) : `http:\/\/13\.238\.159\.254:5000\$\{([\w.]+)\}`/g;
    content = content.replace(regex3, 'getImageUrl($1)');

    if (content !== originalContent) {
        // Need to add import statement if not exists
        if (!content.includes('getImageUrl')) {
            console.log(`Warning: getImageUrl used but no import added to ${filePath}`);
        } else if (!content.includes('import { getImageUrl }')) {
            // Find a good place to inject
            const importMatch = content.match(/import .* from '.*';\r?\n/g);
            if (importMatch && importMatch.length > 0) {
                const lastImport = importMatch[importMatch.length - 1];
                
                // Determine depth
                const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'utils/getImageUrl'));
                // normalize windows paths
                let importPath = relativePath.replace(/\\/g, '/');
                if (!importPath.startsWith('.')) {
                    importPath = './' + importPath;
                }
                
                const newImport = `import { getImageUrl } from '${importPath}';\n`;
                content = content.replace(lastImport, lastImport + newImport);
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

walkDir(srcDir, processFile);
console.log('Done');
