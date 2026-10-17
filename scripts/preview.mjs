import {chromium} from 'file:///C:/Users/郭/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof window.__sceneReady==='boolean');await page.screenshot({path:'.local/desktop.png'});console.log(JSON.stringify({scene:await page.evaluate(()=>window.__sceneReady),errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
await page.locator('#explore').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:'.local/explore.png'});
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof window.__sceneReady==='boolean');await page.screenshot({path:'.local/mobile.png'});console.log(JSON.stringify({mobileOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors}));
await browser.close();
