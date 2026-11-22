// Catalog and shipping tables. Prices here are the ones customers are charged,
// so change prices in BOTH this file and index.html.
const P = [
  {id:"womens", name:"Women's Performance Hoodie", sub:"Soft tri-blend, sweat-wicking, thumbholes", price:{XS:50,S:50,M:50,L:50,XL:50,"2XL":52,"3XL":55,"4XL":57}, colors:[["Black","womens"],["Grey Heather","womens_grey"]]},
  {id:"ls", name:"Performance Long Sleeve", sub:"Lightweight, sweat-wicking, unisex", price:{XS:35,S:35,M:35,L:35,XL:35,"2XL":37,"3XL":38,"4XL":40}, colors:[["Black","ls"],["Grey","ls_grey"]]},
  {id:"zip", name:"Zip-Up Hoodie", sub:"Soft French terry, lightweight, unisex", price:{XS:55,S:55,M:55,L:55,XL:55,"2XL":58}, colors:[["Black","zip"]]},
  {id:"classic", name:"Classic Pullover Hoodie", sub:"Heavy cotton blend, unisex", price:{XS:40,S:40,M:40,L:40,XL:40,"2XL":45,"3XL":50,"4XL":50,"5XL":50}, colors:[["Black","classic"]]},
  {id:"lace", name:"Lace Hoodie", sub:"Hockey-style laces, cotton blend fleece, men's fit", price:{XS:50,S:50,M:50,L:50,XL:50,"2XL":56,"3XL":59,"4XL":61}, colors:[["Black","lace"],["Graphite Heather","lace_charcoal"],["Athletic Heather","lace_ash"]]},
  {id:"tee", name:"Performance Tee", sub:"Short sleeve, lightweight, sweat-wicking, unisex", price:{S:30,M:30,L:30,XL:30,"2XL":32,"3XL":33,"4XL":35,"5XL":36,"6XL":38}, colors:[["Black","tee"],["Heather Grey","tee_grey"]]},
  {id:"beanie", name:"Beanie", sub:"Cuffed knit beanie, embroidered logo", price:{"One size":20}, colors:[["Black","beanie"]]}
];
const ZONES=[[5,5,5],[6,9,9],[10,27,5],[28,29,5],[30,49,5],[50,59,4],[60,69,4],[70,89,4],[90,99,9],[100,129,4],[130,149,3],[150,169,3],[170,199,4],[200,246,4],[247,268,3],[270,289,4],[290,349,5],[330,349,6],[350,369,5],[370,379,4],[380,397,5],[398,399,5],[400,427,4],[430,432,3],[433,449,2],[450,459,3],[460,479,3],[480,489,2],[490,495,2],[496,497,3],[498,499,4],[500,528,4],[530,534,3],[535,549,4],[550,567,4],[570,577,5],[580,588,5],[590,599,6],[600,609,3],[610,629,4],[630,639,4],[640,658,5],[660,693,5],[700,714,5],[716,729,5],[730,749,5],[750,789,6],[790,799,7],[800,831,6],[832,838,7],[840,847,7],[850,865,7],[870,884,6],[889,898,8],[900,961,8],[962,966,9],[967,969,9],[970,994,8],[995,999,9]];
const RATES=[[0.5,[8.40,8.55,8.65,8.80,9.35,9.50,9.70,10.20,10.20]],[1,[10.05,10.45,10.70,11.10,11.70,12.10,12.70,13.65,13.65]],[2,[11.30,12.00,12.70,13.50,14.85,15.85,17.20,19.80,19.80]],[3,[11.80,12.50,13.15,14.20,15.70,17.20,19.70,23.15,23.15]],[4,[13.05,13.55,14.45,15.65,17.80,19.70,22.30,25.65,25.65]],[5,[13.75,14.35,15.35,16.60,18.85,21.00,23.80,27.45,27.45]],[6,[14.30,14.70,15.65,17.15,19.80,22.45,25.75,29.75,29.75]],[7,[14.80,15.20,16.20,17.90,20.85,23.95,27.65,32.00,32.00]],[8,[15.40,15.65,16.60,18.45,21.80,25.50,29.85,34.55,34.55]],[10,[16.75,17.10,18.05,20.20,24.25,28.90,34.70,40.85,40.85]]];
const WT={womens:0.9,ls:0.45,zip:1.0,classic:1.4,lace:1.2,tee:0.35,beanie:0.2}, BOX=0.1;
const CLOSE = new Date("2026-11-22T22:00:00Z"); // 5 PM Nov 22, 2026, Detroit time
module.exports = { P, ZONES, RATES, WT, BOX, CLOSE };
