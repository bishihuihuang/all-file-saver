/**
 * 全能文件保存 - 专属混淆与发布工具
 *
 * 用法：
 *   node _混淆工具.js                  # 全量：从 _原始未混淆版 混淆到 全能文件保存系统/
 *   node _混淆工具.js 全能文件保存.html # 只处理指定文件
 *
 * 与通用混淆工具的区别（本工具专属增强）：
 *   - 输出到「全能文件保存系统/」子目录，与本地版目录结构完全一致
 *   - 混淆强度：base64 编码 + 字符串逆序双层处理（不是简单 atob 直读）
 *   - 防小白保护：轻量级（保留右键/复制粘贴等工具操作，不劫持用户行为），
 *     仅注入「禁止直接修改」提示与二次混淆检测
 *   - 自动生成 PWA 配套（manifest.json / service-worker.js / favicon.svg），
 *     不存在时创建，已存在则跳过（避免覆盖手改）
 *   - 注入版本标记注释，标明由本工具生成
 */
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '_原始未混淆版';
const OUT_DIR = '全能文件保存系统';
const ROOT = __dirname;

const GEN_MARK = '<!-- 混淆发布版 · 由 _混淆工具.js 自动生成 · 修改源码后重新运行一键自动化发布.bat -->\n';
const OBF_MARKER = 'eval(function(_0x1){var _0x2=function(_0x3){return _0x3};return eval(decodeURIComponent(escape(atob(_0x2(_0x1)))))})("';

// 轻量防小白保护：不劫持右键/快捷键（保证工具可用），只做最低限度防护
const LITE_GUARD = `
/* 防小白保护 · 轻量版（不干扰工具操作） */
(function(){
  var _0x1=document;
  /* 禁止二次混淆标记检测 */
  if(_0x1.querySelector('script') && _0x1.querySelector('script').textContent.indexOf('pmf_guard')===-1){}
  /* 版权提示 */
  try{console.log('%c全能文件保存 · 线上版','color:#c9a227;font-size:14px;font-weight:bold;');}catch(e){}
  /* 调试者提示 */
  try{console.log('本页面为混淆发布版，如需修改请编辑 _原始未混淆版 源码后重新发布');}catch(e){}
})();
/* pmf_guard */
`;

// base64 + 逆序 双层混淆（与简单 atob 直读不同）
function encodeObfuscated(js) {
    const b64 = Buffer.from(js, 'utf-8').toString('base64');
    const reversed = b64.split('').reverse().join('');
    return `eval(function(_0x1){var _0x2=function(_0x3){return _0x3};return eval(decodeURIComponent(escape(atob(_0x2(_0x1).split('').reverse().join('')))))})("${reversed}");`;
}

function ensurePwaAssets() {
    // manifest.json
    const mf = path.join(ROOT, OUT_DIR, 'manifest.json');
    if (!fs.existsSync(mf)) {
        fs.writeFileSync(mf, JSON.stringify({
            "name": "全能文件保存",
            "short_name": "全能保存",
            "description": "文本与文件分类管理：标签分类、时间追溯、状态标记、置顶、回收站、导出导入、11 套主题。数据仅存浏览器本地。",
            "start_url": "./全能文件保存.html",
            "scope": "./",
            "display": "standalone",
            "background_color": "#0b0e1a",
            "theme_color": "#0b0e1a",
            "icons": [
                { "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },
                { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
                { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
            ]
        }, null, 2), 'utf-8');
        console.log('[生成] manifest.json');
    } else {
        console.log('[跳过] manifest.json（已存在）');
    }

    // service-worker.js
    const sw = path.join(ROOT, OUT_DIR, 'service-worker.js');
    if (!fs.existsSync(sw)) {
        const swCode = [
            "const CACHE='pmf-v1';",
            "self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./全能文件保存.html','./favicon.svg','./manifest.json','./icon-192.png','./icon-512.png'])).then(()=>self.skipWaiting()));});",
            "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});",
            "self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('./全能文件保存.html'))));});"
        ].join('\n');
        fs.writeFileSync(sw, swCode, 'utf-8');
        console.log('[生成] service-worker.js');
    } else {
        console.log('[跳过] service-worker.js（已存在）');
    }

    // favicon.svg
    const fv = path.join(ROOT, OUT_DIR, 'favicon.svg');
    if (!fs.existsSync(fv)) {
        fs.writeFileSync(fv, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1a1f3a"/>
    <stop offset="1" stop-color="#0b0e1a"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f5d88a"/>
    <stop offset="1" stop-color="#c9a227"/>
  </linearGradient>
</defs>
<rect x="2" y="2" width="60" height="60" rx="14" fill="url(#bg)" stroke="url(#gold)" stroke-width="2.5"/>
<path d="M14 20h14l4 5h18v22H14z" fill="none" stroke="url(#gold)" stroke-width="2.4" stroke-linejoin="round"/>
<text x="32" y="46" font-family="Microsoft YaHei, sans-serif" font-size="17" font-weight="bold" fill="url(#gold)" text-anchor="middle">全</text>
</svg>`, 'utf-8');
        console.log('[生成] favicon.svg');
    } else {
        console.log('[跳过] favicon.svg（已存在）');
    }
}

function obfuscateFile(fileName) {
    const src = path.join(ROOT, SOURCE_DIR, fileName);
    const dst = path.join(ROOT, OUT_DIR, fileName);

    if (!fs.existsSync(src)) {
        return { file: fileName, status: 'skip', reason: '源文件不存在' };
    }

    let content = fs.readFileSync(src, 'utf-8');

    // 已混淆检测：不二次混淆
    if (content.includes(OBF_MARKER)) {
        fs.writeFileSync(dst, content, 'utf-8');
        return { file: fileName, status: 'already-obfuscated' };
    }

    // 内联 script 混淆（排除外链 script）
    const scriptRegex = /(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi;
    let matchCount = 0;
    const newContent = content.replace(scriptRegex, (match, openTag, jsCode, closeTag) => {
        if (!jsCode || jsCode.trim().length === 0) return match;
        matchCount++;
        const fullJS = LITE_GUARD + '\n' + jsCode;
        return openTag + '\n' + encodeObfuscated(fullJS) + '\n' + closeTag;
    });

    const finalContent = GEN_MARK + newContent;
    fs.writeFileSync(dst, finalContent, 'utf-8');
    return { file: fileName, status: matchCount > 0 ? 'obfuscated' : 'no-script', scripts: matchCount };
}

function main() {
    ensurePwaAssets();

    const args = process.argv.slice(2);
    let files;
    if (args.length > 0) {
        files = args.filter(a => a.endsWith('.html'));
        if (files.length === 0) {
            console.error('参数错误：请指定 .html 文件名');
            process.exit(1);
        }
    } else {
        files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.html'));
    }

    console.log('========================================');
    console.log(`  混淆工具 - 处理 ${files.length} 个文件`);
    console.log('========================================\n');

    let obf = 0, copy = 0, skip = 0;
    for (const f of files) {
        try {
            const r = obfuscateFile(f);
            if (r.status === 'obfuscated') {
                console.log(`[混淆] ${f} (${r.scripts} 个 script)`);
                obf++;
            } else if (r.status === 'already-obfuscated') {
                console.log(`[已混淆] ${f} (跳过)`);
                copy++;
            } else if (r.status === 'no-script') {
                console.log(`[写入] ${f} (无内联script)`);
                copy++;
            } else {
                console.log(`[跳过] ${f} - ${r.reason}`);
                skip++;
            }
        } catch (e) {
            console.error(`[失败] ${f} - ${e.message}`);
            skip++;
        }
    }

    console.log('\n========================================');
    console.log(`  完成：混淆 ${obf}，复制/写入 ${copy}，跳过/失败 ${skip}`);
    console.log('========================================');
}

main();
