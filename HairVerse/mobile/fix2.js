const fs = require('fs');
const file = 'c:/Users/Admin/Documents/Virtual_Try_On/HairVerse/mobile/src/screens/DashboardScreen.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/user\?\.name \|\| activeProfile\?\.name \|\| 'Sasi'/g, "user?.displayName || activeProfile?.name || 'User'");
content = content.replace(/activeProfile\?\.name \|\| 'Sasi'/g, "activeProfile?.name || user?.displayName || 'User'");
content = content.replace(/Enter name \(e\.g\. Sasi\)\.\.\./g, 'Enter name...');
content = content.replace(/\|\| 'JD'/g, "|| (user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'US')");

fs.writeFileSync(file, content);
