// 测试生成半径计算时的负坐标处理
const centerX = 3;
const centerY = 1;
const pointX = -1;
const pointY = -1;

console.log("原始公式:");
console.log(`r = √[(${centerX} - ${pointX})² + (${centerY} - ${pointY})²]`);

// 处理x项中的连续负号
if (pointX < 0) {
    console.log("\n处理x项中的连续负号:");
    console.log(`r = √[(${centerX} - (${pointX}))² + (${centerY} - ${pointY})²]`);
    console.log(`注意：当两个负号连续出现时，可以合并为加号，即 -(-${Math.abs(pointX)}) = +${Math.abs(pointX)}`);
    console.log(`r = √[(${centerX} + ${Math.abs(pointX)})² + (${centerY} - ${pointY})²]`);
}

// 处理y项中的连续负号
if (pointY < 0) {
    console.log("\n处理y项中的连续负号:");
    console.log(`r = √[(${centerX} + ${Math.abs(pointX)})² + (${centerY} - (${pointY}))²]`);
    console.log(`注意：当两个负号连续出现时，可以合并为加号，即 -(-${Math.abs(pointY)}) = +${Math.abs(pointY)}`);
    console.log(`r = √[(${centerX} + ${Math.abs(pointX)})² + (${centerY} + ${Math.abs(pointY)})²]`);
}

// 计算实际结果
const dx = centerX - pointX;
const dy = centerY - pointY;
console.log("\n计算结果:");
console.log(`r = √[${dx}² + ${dy}²]`);
console.log(`r = √[${dx*dx} + ${dy*dy}]`);
console.log(`r = √[${dx*dx + dy*dy}]`);
console.log(`r = ${Math.sqrt(dx*dx + dy*dy)}`);

// 用于您提供的示例
console.log("\n您提供的示例:");
const ex_centerX = -1;
const ex_centerY = 1;
const ex_pointX = 3;
const ex_pointY = -1;
console.log(`r = √[(${ex_centerX} - ${ex_pointX})² + (${ex_centerY} - ${ex_pointY})²]`);

// 如果遇到连续负号
if (ex_pointX < 0 || ex_pointY < 0) {
    console.log("处理连续的负号:");
    let xFormula = `(${ex_centerX} - ${ex_pointX})`;
    if (ex_pointX < 0) {
        xFormula = `(${ex_centerX} - (${ex_pointX}))`;
        console.log(`r = √[${xFormula}² + (${ex_centerY} - ${ex_pointY})²]`);
        console.log(`注意：当两个负号连续出现时，可以合并为加号，即 -(-${Math.abs(ex_pointX)}) = +${Math.abs(ex_pointX)}`);
        xFormula = `(${ex_centerX} + ${Math.abs(ex_pointX)})`;
    }
    
    let yFormula = `(${ex_centerY} - ${ex_pointY})`;
    if (ex_pointY < 0) {
        yFormula = `(${ex_centerY} - (${ex_pointY}))`;
        console.log(`r = √[${xFormula}² + ${yFormula}²]`);
        console.log(`注意：当两个负号连续出现时，可以合并为加号，即 -(-${Math.abs(ex_pointY)}) = +${Math.abs(ex_pointY)}`);
        yFormula = `(${ex_centerY} + ${Math.abs(ex_pointY)})`;
    }
    
    console.log(`r = √[${xFormula}² + ${yFormula}²]`);
} 