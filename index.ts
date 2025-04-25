import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import * as plist from "plist";

let in_dir = path.join(__dirname, "./in"); // 输入文件夹
let out_dir = path.join(__dirname, "./out"); // 输出文件夹

function sharpPngByPlist (png_file: string, data: any, save_dir: string) {
	console.log(png_file, save_dir);
	fs.mkdirSync(save_dir, { recursive: true });
	Object.keys(data.frames).forEach((k) => {
		let v = data.frames[k];
		let rect = v.textureRect as string;
		let [x, y, width, height] = rect.replace(/[{}]/g, '').split(",");
		sharp(png_file)
			.extract({
				width: Number(width), height: Number(height), left: Number(x), top: Number(y)
			})
			.toFile(`${save_dir}/${k}`);
	});
}

fs.readdir(in_dir, (err, files: string[]) => {
	if (err) {
		console.log(err);
	}
	else {
		files.forEach((item) => {
			if (item.slice(-4) == ".png") {
				let png_file = `${in_dir}/${item}`;
				let plist_file = png_file.slice(0, -4)+".plist";
				console.log(png_file, plist_file);
				if (fs.existsSync(plist_file)) {
					let content = fs.readFileSync(plist_file, "utf-8");
					let data = plist.parse(content);
					let save_dir = `${out_dir}/${item.slice(0, -4)}`;
					sharpPngByPlist(png_file, data, save_dir);
				}
			}
		});
	}
});


