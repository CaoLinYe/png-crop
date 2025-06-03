import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

let json_file = path.join(__dirname, "./nine/nine.json"); // 输入文件夹
let in_dir = path.join(__dirname, "./nine/in"); // 输入文件夹
let out_dir = path.join(__dirname, "./nine/out"); // 输出文件夹
//
function mergePng (list: any, width: number, height: number, out_file: string) {
	if (list.length == 4) {
		sharp({
			create: {
				width: width,
				height: height,
				channels: 4,
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			},
		})
		.composite(list)
		.png()
		.toFile(out_file);
	}
}

function cropPng (item: any, size: {width: number, height: number}) {
	console.log(item);
	let list = [];
	let in_file = path.join(in_dir, item.file);
	let out_file = path.join(out_dir, item.file);
	console.log(in_file, out_file);
	let width = item.left+item.right;
	let height = item.top+item.bottom;
	sharp(in_file)
		.extract({ width: item.left, height: item.top, left: 0, top: 0 })
		.toBuffer((err, buffer) => {
			if (!err) {
				list.push({
					input: buffer,
					top: 0,
					left: 0,
				});
				mergePng(list, width, height, out_file);
			}
		});
	sharp(in_file)
		.extract({ width: item.right, height: item.top, left: size.width-item.right, top: 0 })
		.toBuffer((err, buffer) => {
			if (!err) {
				list.push({
					input: buffer,
					top: 0,
					left: item.left,
				});
				mergePng(list, width, height, out_file);
			}
		});
	sharp(in_file)
		.extract({ width: item.left, height: item.bottom, left: 0, top: size.height-item.bottom })
		.toBuffer((err, buffer) => {
			if (!err) {
				list.push({
					input: buffer,
					top: item.top,
					left: 0,
				});
				mergePng(list, width, height, out_file);
			}
		});
	sharp(in_file)
		.extract({ width: item.right, height: item.bottom, left: size.width-item.right, top: size.height-item.bottom })
		.toBuffer((err, buffer) => {
			if (!err) {
				list.push({
					input: buffer,
					top: item.top,
					left: item.left,
				});
				mergePng(list, width, height, out_file);
			}
		});
}

let content = JSON.parse(fs.readFileSync(json_file, "utf-8"));
Object.keys(content).forEach((key: any) => {
	let item = content[key];
	sharp(path.join(in_dir, item.file))
		.metadata()
		.then((metadata) => {
			cropPng(content[key], { width: metadata.width, height: metadata.height });
		})
});




