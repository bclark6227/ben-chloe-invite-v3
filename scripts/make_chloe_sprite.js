import fs from "fs";
import { createCanvas } from "canvas";

const W = 48, H = 64;         // small sprite
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

function px(x,y,w,h,color){ ctx.fillStyle=color; ctx.fillRect(x,y,w,h); }

// transparent bg
ctx.clearRect(0,0,W,H);

// hair (blonde)
px(18,6,12,2,"#f3d27a");
px(16,8,16,6,"#e9c76a");
px(15,14,18,4,"#dcb85b");

// face
px(18,12,12,12,"#f2c9b4");
px(20,14,2,2,"#000"); // eye
px(26,14,2,2,"#000"); // eye
px(23,20,2,2,"#b56"); // mouth

// veil
px(14,10,4,18,"rgba(255,255,255,0.6)");
px(32,10,4,18,"rgba(255,255,255,0.6)");

// dress
px(18,24,12,20,"#ffffff");
px(16,44,16,10,"#f4f4f4");

// bouquet
px(22,34,6,6,"#7cc57a");
px(24,32,2,2,"#ffb6c1");
px(23,33,2,2,"#ffd1dc");
px(25,33,2,2,"#ffd1dc");

const outPath = "assets/chloe/chloe.png";
fs.mkdirSync("assets/chloe", { recursive: true });
fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
console.log("Wrote", outPath);
