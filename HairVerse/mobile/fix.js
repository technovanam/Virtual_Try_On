const fs = require('fs');
const file = 'c:/Users/Admin/Documents/Virtual_Try_On/HairVerse/mobile/src/screens/DashboardScreen.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/'#00D4FF'/g, 'COLORS.primary');
content = content.replace(/"#00D4FF"/g, 'COLORS.primary');

content = content.replace(/'#7C5CFC'/g, 'COLORS.secondary');
content = content.replace(/"#7C5CFC"/g, 'COLORS.secondary');

content = content.replace(/'#00E676'/g, 'COLORS.success');
content = content.replace(/"#00E676"/g, 'COLORS.success');

content = content.replace(/'#FF1744'/g, 'COLORS.error');
content = content.replace(/"#FF1744"/g, 'COLORS.error');

content = content.replace(/'#0F0F16'/g, 'COLORS.card');
content = content.replace(/"#0F0F16"/g, 'COLORS.card');

content = content.replace(/'#fff'/g, 'COLORS.background');
content = content.replace(/"#fff"/g, 'COLORS.background');

content = content.replace(/"rgba\(0, 212, 255, 0\.4\)"/g, 'COLORS.primary');
content = content.replace(/'rgba\(0, 212, 255, 0\.4\)'/g, 'COLORS.primary');

fs.writeFileSync(file, content);
console.log('Colors replaced successfully!');
