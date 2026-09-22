const { Jimp } = require('jimp');

async function padLogo() {
  console.log('Loading original perfect logo...');
  const original = await Jimp.read('C:\\Users\\ismail\\.gemini\\antigravity-ide\\brain\\b301c9c2-78a0-4e5b-9994-9707a9f49105\\teleremo_logo_final_1784397249633.png');
  
  console.log('Creating black background...');
  const background = new Jimp({ width: 1024, height: 1024, color: '#000000' });
  
  console.log('Resizing logo to 600x600...');
  original.resize({ w: 600, h: 600 });
  
  console.log('Compositing...');
  background.composite(original, 212, 212);
  
  console.log('Saving to mobile and server assets...');
  await background.write('../mobile/assets/icon.png');
  await background.write('../mobile/assets/adaptive-icon.png');
  await background.write('./build/icon.png');
  await background.write('./icon.png');
  
  console.log('All icons padded successfully without AI hallucination!');
}

padLogo().catch(console.error);
