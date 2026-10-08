const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/require\(['"]\.\.\/utils\/appError['"]\)/g, "require('../utils/AppError')");
  content = content.replace(/\.populate\(['"]([^'"]+)['"],\s*['"]name email['"]\)/g, ".populate('$1', 'firstName lastName email')");
  content = content.replace(/\$\{req\.user\.name\s*\|\|[^}]+\}/g, "${req.user.firstName} ${req.user.lastName}");
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
}
