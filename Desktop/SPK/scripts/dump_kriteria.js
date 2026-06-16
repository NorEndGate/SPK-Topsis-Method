const xlsx = require('xlsx');
const wb = xlsx.readFile('docs/spk_topsis_k ALL.xlsx');
const s = wb.Sheets['kriteria & sub'];
if(!s){console.error('sheet missing'); process.exit(1);} 
const rows = xlsx.utils.sheet_to_json(s,{header:1,defval:''});
rows.forEach((r,i)=> console.log(i, JSON.stringify(r)));
