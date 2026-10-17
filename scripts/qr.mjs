import qrcode from './vendor/qrcode.cjs';
import fs from 'node:fs';
const url='https://guitu-mechanics-guo.famousberry64.chatgpt.site';
const qr=qrcode(0,'M');qr.addData(url);qr.make();
fs.writeFileSync('dist/assets/site-qr.svg',qr.createSvgTag(6,24));
fs.writeFileSync('scripts/qr-matrix.json',JSON.stringify(Array.from({length:qr.getModuleCount()},(_,y)=>Array.from({length:qr.getModuleCount()},(_,x)=>qr.isDark(y,x)))));
console.log('QR generated for '+url);
