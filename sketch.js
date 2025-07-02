import GUI from 'https://cdn.skypack.dev/lil-gui';
import {encode,QRPointType} from './qr-encoder.js';

let qrData = [];
let qrTypes = [];
let animationTime = 0;

// GUI パラメータ
const params = {
	text: 'Hello World!',
	renderMode: 'standard',
	errorCorrection: 'medium',
	moduleSize: 1,
	animationSpeed: 0.02,
	backgroundColor: '#ffffff',
	foregroundColor: '#000000',
	saveImage: () => save('qr-code.png')
};

function setup() {
	let L = min(windowWidth,windowHeight);
	const canvas = createCanvas(L,L);
	canvas.parent('container');

	// GUI セットアップ
	const gui = new GUI();

	// テキスト設定
	gui.add(params,'text').name('テキスト').onChange(generateQRCode);

	// レンダリングモード
	gui.add(params,'renderMode',['standard'])
		.name('描画モード')
		.onChange(generateQRCode);

	// エラー訂正レベル
	gui.add(params,'errorCorrection',['low','medium','quartile','high'])
		.name('エラー訂正レベル')
		.onChange(generateQRCode);

	// 外観設定
	const appearance = gui.addFolder('外観');
	appearance.addColor(params,'backgroundColor').name('背景色');
	appearance.addColor(params,'foregroundColor').name('前景色');

	appearance.add(params,'moduleSize',0,1,0.01).name('moduleSize').onChange(generateQRCode);

	// アニメーション設定
	const animation = gui.addFolder('アニメーション');
	animation.add(params,'animationSpeed',0.001,0.1,0.001).name('アニメーション速度');

	// アクション
	gui.add(params,'saveImage').name('画像を保存');

	generateQRCode();
}

function generateQRCode() {
	try {
		const options = {
			ecc: params.errorCorrection // 既にlow/medium/quartile/high形式なのでそのまま使用
		};

		[qrData,qrTypes] = encode(params.text,options);
	} catch(error) {
		console.error('QRコード生成エラー:',error);
	}
}

function renderQR() {
	if(qrData.length === 0) return;

	const size = qrData.length;
	const padding = 40; // パディング
	const availableSize = min(width, height) - padding * 2;
	const normalizedCellSize = availableSize / size; // キャンバスサイズに正規化
	const totalSize = size * normalizedCellSize;
	const offsetX = (width - totalSize) / 2;
	const offsetY = (height - totalSize) / 2;

	for(let i = 0;i < size;i++) {
		for(let j = 0;j < size;j++) {
			const x = offsetX + i * normalizedCellSize;
			const y = offsetY + j * normalizedCellSize;

			if(!qrData[i][j]) {
				continue;
			}

			fill(params.foregroundColor);
			stroke(params.foregroundColor);
			const scale = (qrTypes[i][j] == 0) | (qrTypes[i][j] == 4) | (qrTypes[i][j] == 5) | (qrTypes[i][j] == 7) ? params.moduleSize : 1;
			const actualSize = normalizedCellSize * scale;
			const cellOffset = (normalizedCellSize - actualSize) / 2;
			rect(x + cellOffset, y + cellOffset, actualSize, actualSize);
		}
	}
}

function draw() {
	background(params.backgroundColor);
	
	if(qrData.length === 0) return;
	
	renderQR();
}

window.setup = setup;
window.draw = draw;