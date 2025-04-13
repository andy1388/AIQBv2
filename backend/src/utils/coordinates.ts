interface CoordinateSystemOptions {
    // 基本选项
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    
    // 网格线选项
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;
    showHorizontalGrid?: boolean;  // 控制水平网格线
    showVerticalGrid?: boolean;    // 控制垂直网格线
    
    // 坐标轴选项
    showAxis?: boolean;
    axisColor?: string;
    axisWidth?: number;
    showXAxis?: boolean;           // 控制 x 轴
    showYAxis?: boolean;           // 控制 y 轴
    showArrows?: boolean;          // 控制箭头
    
    // 标签选项
    showLabels?: boolean;
    xLabel?: string;
    yLabel?: string;
    labelColor?: string;
    labelSize?: number;
    showAllGrids?: boolean;  // 新增選項
}

interface LineEquation {
    slope: number;
    yIntercept: number;
    showEquation?: boolean;
    color: string;
    style?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
    width?: number;
}

interface PointLabel {
    x: number;
    y: number;
    symbol: string;
    label?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface FunctionEquation {
    fn: (x: number) => number;  // 函数表达式
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;          // 方程的显示文本
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface CircleEquation {
    centerX: number;
    centerY: number;
    radius: number;
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
    domain?: [number, number];    // 定义域限制 [min, max]
    range?: [number, number];     // 值域限制 [min, max]
}

interface LinearConstraint {
    slope: number | ((x: number) => number);  // 可以是斜率或函數
    yIntercept: number;
    isGreaterThan: boolean;
    color: string;
    style?: string;
    showEquation?: boolean;
    equation?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

interface Point {
    x: number;
    y: number;
    symbol: string;
    label?: string;
    labelOffsetX?: number;
    labelOffsetY?: number;
    color?: string;  // 添加可選的顏色屬性
}

// 添加新的接口来定义解释坐标系的配置
interface ExplanationSystemConfig {
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    point: { x: number; y: number };
    showXAxis?: boolean;
    showYAxis?: boolean;
    showGrid?: boolean;
    showAllGrids?: boolean;
    axisLabels?: number[];
    labelOffset?: { x: number; y: number };
    isXAxisOnly?: boolean;   // 是否只显示x轴
    isYAxisOnly?: boolean;   // 是否只显示y轴
    showAxisNumbers?: boolean; // 新增：是否显示坐标轴上的数字
    showGridLines?: boolean;   // 新增：是否显示网格线
    showAxisTicks?: boolean;  // 添加这一行
}

export class CoordinateSystem {
    private options: CoordinateSystemOptions;
    private points: Point[] = [];
    private lines: { from: [number, number]; to: [number, number]; color: string; style?: string; width?: number }[] = [];
    private verticalLines: { x: number; color: string; style?: string }[] = [];
    private equations: LineEquation[] = [];
    private functions: FunctionEquation[] = [];  // 新增：函数数组
    private circles: CircleEquation[] = [];  // 新增：圆形数组
    private constraints: LinearConstraint[] = [];  // 新增：线性约束数组
    private axisLabels: {
        x: number[];
        y: number[];
    } = {
        x: [],
        y: []
    };
    private texts: { x: number; y: number; text: string; color: string; fontSize?: number; hasBackground?: boolean }[] = [];
    private readonly gridXStart: number;
    private readonly gridXEnd: number;
    private readonly gridYStart: number;
    private readonly gridYEnd: number;
    private paths: {
        d: string;
        fill: string;
        stroke?: string;
        'stroke-width'?: string;
    }[] = [];

    constructor(options: CoordinateSystemOptions) {
        this.options = {
            ...options,
            showGrid: options.showGrid ?? true,
            gridColor: options.gridColor ?? '#e0e0e0',
            gridOpacity: options.gridOpacity ?? 0.8,
            showHorizontalGrid: options.showHorizontalGrid ?? true,
            showVerticalGrid: options.showVerticalGrid ?? true,
            
            showAxis: options.showAxis ?? true,
            axisColor: options.axisColor ?? 'black',
            axisWidth: options.axisWidth ?? 1,
            showXAxis: options.showXAxis ?? true,
            showYAxis: options.showYAxis ?? true,
            showArrows: options.showArrows ?? true,
            
            showLabels: options.showLabels ?? true,
            xLabel: options.xLabel ?? 'x',
            yLabel: options.yLabel ?? 'y',
            labelColor: options.labelColor ?? 'black',
            labelSize: options.labelSize ?? 16
        };

        // 修改网格范围的计算逻辑
        if (!this.options.showAllGrids) {
            // 对于难度3，网格范围是[0,5]
            this.gridXStart = 0;
            this.gridXEnd = 5;
            this.gridYStart = 0;
            this.gridYEnd = 5;
        } else {
            // 对于其他难度，网格范围比显示范围小一个单位
            this.gridXStart = Math.ceil(options.xRange[0]);
            this.gridXEnd = Math.floor(options.xRange[1] - 1);
            this.gridYStart = Math.ceil(options.yRange[0]);
            this.gridYEnd = Math.floor(options.yRange[1] - 1);
        }
    }

    addPoint(x: number, y: number, symbol: string = "●", label?: string, labelOffsetX: number = 10, labelOffsetY: number = -10, color: string = "black") {
        this.points.push({ 
            x, 
            y, 
            symbol, 
            label, 
            labelOffsetX, 
            labelOffsetY, 
            color
        });
    }

    addLine(from: [number, number], to: [number, number], color: string = "green", style: string = "solid") {
        this.lines.push({ from, to, color, style });
    }

    addVerticalLine(x: number, color: string = "black", style: string = "dotted") {
        this.verticalLines.push({ x, color, style });
    }

    addObliqueLine(
        slope: number, 
        yIntercept: number, 
        color: string = "red", 
        style: string = "solid", 
        showEquation: boolean = false,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15
    ) {
        const { xRange } = this.options;
        
        // 计算直线在视图范围内的两个端点
        const x1 = xRange[0];
        const y1 = slope * x1 + yIntercept;
        const x2 = xRange[1];
        const y2 = slope * x2 + yIntercept;
        
        // 添加线段
        this.lines.push({
            from: [x1, y1],
            to: [x2, y2],
            color,
            style
        });

        // 添加方程
        this.equations.push({
            slope,
            yIntercept,
            showEquation,
            color,
            style,
            labelOffsetX,
            labelOffsetY
        });
    }

    addFunction(
        fn: (x: number) => number,
        color: string = "yellow",
        style: string = "solid",
        showEquation: boolean = false,
        equation?: string,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15,
        segments: number = 100  // 用于控制曲线的平滑度
    ) {
        this.functions.push({
            fn,
            color,
            style,
            showEquation,
            equation,
            labelOffsetX,
            labelOffsetY
        });
    }

    addCircle(
        centerX: number,
        centerY: number,
        radius: number,
        color: string = "purple",
        style: string = "solid",
        showEquation: boolean = false,
        equation?: string,
        labelOffsetX: number = 15,
        labelOffsetY: number = -15,
        domain?: [number, number],
        range?: [number, number]
    ) {
        this.circles.push({
            centerX,
            centerY,
            radius,
            color,
            style,
            showEquation,
            equation,
            labelOffsetX,
            labelOffsetY,
            domain,
            range
        });
    }

    addLinearConstraint(
        slope: number | ((x: number) => number),
        yIntercept: number,
        isGreaterThan: boolean = true,
        color: string = "red",
        style: string = "solid"
    ) {
        const { width, height, xRange, yRange } = this.options;
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 计算缩放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 生成曲线点
        const points: [number, number][] = [];
        const step = 0.1;  // 步长，可以调整以获得更平滑的曲线
        
        // 使用可见范围来生成点
        const visibleXMin = xRange[0] - 1;  // 扩展1个单位
        const visibleXMax = xRange[1] + 1;
        
        // 计算函数值
        for (let x = visibleXMin; x <= visibleXMax; x += step) {
            let y: number;
            if (typeof slope === 'number') {
                y = slope * x + yIntercept;
            } else {
                y = slope(x) + yIntercept;
            }
            points.push([x, y]);
        }

        // 转换为SVG坐标
        const svgPoints = points.map(([x, y]) => [
            x * xScale + xOffset,
            yOffset - y * yScale
        ]);

        // 构建填充区域路径
        let pathD = '';
        
        if (isGreaterThan) {
            // 从最左边的点开始
            pathD = `M ${svgPoints[0][0]} ${svgPoints[0][1]} `;
            // 沿着曲线向右
            for (let i = 1; i < svgPoints.length; i++) {
                pathD += `L ${svgPoints[i][0]} ${svgPoints[i][1]} `;
            }
            // 到最右边的点的顶部
            pathD += `L ${svgPoints[svgPoints.length - 1][0]} ${margin} `;
            // 到最左边的点的顶部
            pathD += `L ${svgPoints[0][0]} ${margin} `;
            // 闭合路径
            pathD += 'Z';
        } else {
            // 从最左边的点开始
            pathD = `M ${svgPoints[0][0]} ${svgPoints[0][1]} `;
            // 沿着曲线向右
            for (let i = 1; i < svgPoints.length; i++) {
                pathD += `L ${svgPoints[i][0]} ${svgPoints[i][1]} `;
            }
            // 到最右边的点的底部
            pathD += `L ${svgPoints[svgPoints.length - 1][0]} ${height - margin} `;
            // 到最左边的点的底部
            pathD += `L ${svgPoints[0][0]} ${height - margin} `;
            // 闭合路径
            pathD += 'Z';
        }

        // 添加填充区域
        this.paths.push({
            d: pathD,
            fill: color
        });

        // 添加曲线本身
        let curvePath = `M ${svgPoints[0][0]} ${svgPoints[0][1]} `;
        for (let i = 1; i < svgPoints.length; i++) {
            curvePath += `L ${svgPoints[i][0]} ${svgPoints[i][1]} `;
        }

        // 添加曲线
        this.paths.push({
            d: curvePath,
            fill: 'none',
            stroke: color.replace('0.2', '1'),
            'stroke-width': '2'
        });
    }

    addHorizontalLine(
        y: number,
        color: string = "black",
        style: string = "solid"
    ) {
        const { xRange } = this.options;
        
        // 添加水平線段
        this.lines.push({
            from: [xRange[0], y],  // 從左邊界開始
            to: [xRange[1], y],    // 到右邊界結束
            color,
            style
        });
    }

    addLineSegment(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string = "black",
        style: string = "solid",
        width: number = 1  // 添加线宽参数
    ) {
        // 添加線段
        this.lines.push({
            from: [x1, y1],
            to: [x2, y2],
            color,
            style,
            width  // 添加线宽
        });
    }

    addAxisLabels(
        xLabels: number[],
        yLabels: number[]
    ) {
        this.axisLabels.x = xLabels;
        this.axisLabels.y = yLabels;
    }

    addText(
        x: number,
        y: number,
        text: string,
        color: string = "black",
        fontSize?: number  // 添加可选的 fontSize 参数
    ) {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 計算實際位置
        const xPos = x * xScale + xOffset;
        const yPos = yOffset - y * yScale;

        this.texts.push({
            x: xPos,
            y: yPos,
            text,
            color,
            fontSize  // 添加 fontSize 到 texts 数组中
        });
    }

    // 新增方法：添加帶背景的文字標籤
    addTextWithBackground(
        x: number,
        y: number,
        text: string,
        color: string = "black",
        fontSize: number = 16  // 默認大小
    ) {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 計算實際位置
        const xPos = x * xScale + xOffset;
        const yPos = yOffset - y * yScale;

        // 添加背景矩形和文字
        this.texts.push({
            x: xPos,
            y: yPos,
            text,
            color,
            fontSize,
            hasBackground: true  // 新增屬性
        });
    }

    addPath(pathCommands: string[], fillColor: string) {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加边距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 计算缩放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;

        // 转换路径命令
        const transformedPath = pathCommands.map(cmd => {
            if (cmd === 'Z') return cmd;
            const [letter, ...coords] = cmd.split(' ');
            const [x, y] = coords.map(Number);
            const transformedX = x * xScale + xOffset;
            const transformedY = yOffset - y * yScale;
            return `${letter} ${transformedX} ${transformedY}`;
        }).join(' ');

        // 添加到 SVG 中
        this.paths.push({
            d: transformedPath,
            fill: fillColor
        });
    }

    toString(): string {
        const { width, height, xRange, yRange } = this.options;
        
        // 添加邊距
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const innerHeight = height - 2 * margin;
        
        // 計算縮放和偏移
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        const yOffset = height - margin + yRange[0] * yScale;
        
        // 创建 SVG
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
            </marker>
        </defs>`;
        
        // 繪製網格
        if (this.options.showGrid) {
            // 垂直網格線
            if (this.options.showVerticalGrid) {
                let gridStart, gridEnd, yStart, yEnd;
                
                if (this.options.showXAxis && !this.options.showYAxis) {
                    // 难度1：只显示x轴，网格线范围为[-5,5]
                    gridStart = -5;
                    gridEnd = 5;
                    yStart = this.transformY(-0.1);
                    yEnd = this.transformY(0.1);
                } else if (!this.options.showXAxis && this.options.showYAxis) {
                    // 难度2：只显示y轴
                    gridStart = -0.1;
                    gridEnd = 0.1;
                    yStart = this.transformY(-5);
                    yEnd = this.transformY(5);
                } else if (!this.options.showAllGrids) {
                    // 难度3：第一象限[0,5]
                    gridStart = 0;
                    gridEnd = 5;
                    yStart = this.transformY(0);
                    yEnd = this.transformY(5);
                } else {
                    // 难度4-5：完整坐标系[-5,5]
                    gridStart = -5;
                    gridEnd = 5;
                    yStart = this.transformY(-5);
                    yEnd = this.transformY(5);
                }
                
                // 修改循环条件，确保不在显示区域边界绘制网格线
                for (let x = gridStart; x <= gridEnd; x++) {
                    // 不需要特别跳过-6和6，因为它们不在循环范围内
                    const xPos = x * xScale + xOffset;
                    svg += `<line x1="${xPos}" y1="${yStart}" x2="${xPos}" y2="${yEnd}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="1"
                        opacity="${this.options.gridOpacity}"/>`;
                }
            }

            // 水平網格線
            if (this.options.showHorizontalGrid) {
                let gridStart, gridEnd, xStart, xEnd;
                
                if (this.options.showXAxis && !this.options.showYAxis) {
                    // 难度1：只显示x轴
                    gridStart = -0.1;
                    gridEnd = 0.1;
                    xStart = this.transformX(-5);
                    xEnd = this.transformX(5);
                } else if (!this.options.showXAxis && this.options.showYAxis) {
                    // 难度2：只显示y轴
                    gridStart = -5;
                    gridEnd = 5;
                    xStart = this.transformX(-0.1);
                    xEnd = this.transformX(0.1);
                } else if (!this.options.showAllGrids) {
                    // 难度3：第一象限[0,5]
                    gridStart = 0;
                    gridEnd = 5;
                    xStart = this.transformX(0);
                    xEnd = this.transformX(5);
                } else {
                    // 难度4-5：完整坐标系[-5,5]
                    gridStart = -5;
                    gridEnd = 5;
                    xStart = this.transformX(-5);
                    xEnd = this.transformX(5);
                }
                
                for (let y = gridStart; y <= gridEnd; y++) {
                    const yPos = yOffset - y * yScale;
                    svg += `<line x1="${xStart}" y1="${yPos}" x2="${xEnd}" y2="${yPos}" 
                        stroke="${this.options.gridColor}" 
                        stroke-width="1"
                        opacity="${this.options.gridOpacity}"/>`;
                }
            }
        }
        
        // 在绘制网格之后，添加路径渲染代码
        // 先渲染填充区域
        for (const path of this.paths) {
            let pathAttr = `d="${path.d}" fill="${path.fill}"`;
            if (path.stroke) {
                pathAttr += ` stroke="${path.stroke}"`;
            }
            if (path['stroke-width']) {
                pathAttr += ` stroke-width="${path['stroke-width']}"`;
            }
            svg += `<path ${pathAttr}/>`;
        }
        
        // 绘制坐标轴
        if (this.options.showAxis) {
            const arrowMarker = this.options.showArrows ? ' marker-end="url(#arrowhead)"' : '';
            
            // x轴
            if (this.options.showXAxis) {
                const yAxisPos = yOffset;
                const xStart = this.options.showXAxis && !this.options.showYAxis ? 
                    this.transformX(-5) : // 难度1：完整x轴[-5,5]
                    !this.options.showAllGrids ? this.transformX(0) : this.transformX(-5); // 其他难度
                const xEnd = this.transformX(5);
                
                svg += `<line x1="${xStart}" y1="${yAxisPos}" x2="${xEnd}" y2="${yAxisPos}" 
                    stroke="${this.options.axisColor}" 
                    stroke-width="${this.options.axisWidth}"${arrowMarker}"/>`;
                
                // x轴标签
                if (this.options.showLabels) {
                    const fontSize = (this.options.labelSize ?? 16) * 1.5;
                    svg += `<text x="${xEnd+5}" y="${yOffset+5}" 
                        style="font-family: serif; font-style: italic; font-size: ${fontSize}px; fill: ${this.options.labelColor}"
                        >${this.options.xLabel}</text>`;
                }
            }
            
            // y轴
            if (this.options.showYAxis) {
                const xAxisPos = xOffset;
                const yStart = !this.options.showXAxis && this.options.showYAxis ? 
                    this.transformY(-5) : // 难度2：完整y轴[-5,5]
                    !this.options.showAllGrids ? this.transformY(0) : this.transformY(-5); // 其他难度
                const yEnd = this.transformY(5);
                
                svg += `<line x1="${xAxisPos}" y1="${yStart}" x2="${xAxisPos}" y2="${yEnd}" 
                    stroke="${this.options.axisColor}" 
                    stroke-width="${this.options.axisWidth}"${arrowMarker}"/>`;
                
                // y轴标签
                if (this.options.showLabels) {
                    const fontSize = (this.options.labelSize ?? 16) * 1.5;
                    svg += `<text x="${xOffset-5}" y="${yEnd-5}" 
                        style="font-family: serif; font-style: italic; font-size: ${fontSize}px; fill: ${this.options.labelColor}"
                        >${this.options.yLabel}</text>`;
                }
            }
        }
        
        // 绘制垂直线
        for (const line of this.verticalLines) {
            const xPos = line.x * xScale + xOffset;
            svg += `<line x1="${xPos}" y1="${margin}" x2="${xPos}" y2="${height-margin}" 
                stroke="${line.color}" stroke-width="1" stroke-dasharray="${line.style === 'dotted' ? '4,4' : ''}"/>`;
        }
        
        // 繪製所有線段
        for (const line of this.lines) {
            svg += `<line 
                x1="${line.from[0] * xScale + xOffset}" 
                y1="${yOffset - line.from[1] * yScale}" 
                x2="${line.to[0] * xScale + xOffset}" 
                y2="${yOffset - line.to[1] * yScale}"
                stroke="${line.color}"
                stroke-width="${line.width || 1}"  // 使用线宽，默认为1
                stroke-dasharray="${line.style === 'dotted' ? '4,4' : ''}"
            />`;
        }

        // 繪製所有點和標籤
        for (const point of this.points) {
            const x = point.x * xScale + xOffset;
            const y = yOffset - point.y * yScale;
            
            // 繪製點
            svg += `<text x="${x}" y="${y}" 
                text-anchor="middle" 
                dominant-baseline="middle"
                fill="${point.color || 'black'}"
                style="font-size: 20px;"
            >${point.symbol}</text>`;
            
            // 繪製標籤
            if (point.label) {
                svg += `<text 
                    x="${x + (point.labelOffsetX ?? 10)}" 
                    y="${y + (point.labelOffsetY ?? -10)}"
                    fill="${point.color || 'black'}"
                    style="font-size: ${this.options.labelSize}px;"
                >${point.label}</text>`;
            }
        }

        // 繪製座標軸標籤
        for (const x of this.axisLabels.x) {
            const xPos = x * xScale + xOffset;
            svg += `<text 
                x="${xPos}" 
                y="${yOffset + 20}" 
                text-anchor="middle"
                style="font-size: ${this.options.labelSize}px;"
            >${x}</text>`;
        }

        for (const y of this.axisLabels.y) {
            const yPos = yOffset - y * yScale;
            svg += `<text 
                x="${xOffset - 10}" 
                y="${yPos}" 
                text-anchor="end"
                dominant-baseline="middle"
                style="font-size: ${this.options.labelSize}px;"
            >${y}</text>`;
        }

        // 繪製額外的文字標籤
        for (const text of this.texts) {
            if (text.hasBackground) {
                // 先繪製白色背景
                svg += `<rect 
                    x="${text.x - 12}" 
                    y="${text.y - 12}" 
                    width="24" 
                    height="24" 
                    fill="white"
                    rx="4"
                />`;
            }
            
            // 繪製文字
            svg += `<text 
                x="${text.x}" 
                y="${text.y}" 
                text-anchor="middle"
                dominant-baseline="middle"
                fill="${text.color}"
                style="font-size: ${text.fontSize ?? this.options.labelSize}px; font-weight: bold;"
            >${text.text}</text>`;
        }

        svg += '</svg>';
        return svg;
    }

    static createExplanationSystem(config: ExplanationSystemConfig): CoordinateSystem {
        const {
            width,
            height,
            xRange,
            yRange,
            point,
            showXAxis = true,
            showYAxis = true,
            showGrid = true,
            showAllGrids = true,
            axisLabels = [],
            labelOffset = { x: 15, y: -20 },
            isXAxisOnly = false,
            isYAxisOnly = false,
            showAxisNumbers = true,  // 默认显示数字
            showGridLines = true,     // 默认显示网格
            showAxisTicks = true,  // 添加默认值
        } = config;

        // 根据是否只显示单轴调整配置
        const adjustedConfig: CoordinateSystemOptions = {
            width: isYAxisOnly ? 200 : width,
            height: isXAxisOnly ? 200 : height,
            xRange: isYAxisOnly ? [-1, 1] as [number, number] : xRange,
            yRange: isXAxisOnly ? [-1, 1] as [number, number] : yRange,
            showGrid: showGridLines && !isXAxisOnly && !isYAxisOnly,  // 只在完整坐标系中显示网格
            gridColor: '#e0e0e0',
            gridOpacity: 0.8,
            axisColor: '#333',
            axisWidth: 1.5,
            showArrows: true,
            labelColor: '#666',
            labelSize: 14,
            showXAxis: !isYAxisOnly,
            showYAxis: !isXAxisOnly,
            showAllGrids
        };

        const system = new CoordinateSystem(adjustedConfig);

        // 添加坐标轴标签
        if (showAxisNumbers && axisLabels.length > 0) {
            system.addAxisLabels(
                !isYAxisOnly ? axisLabels : [], 
                !isXAxisOnly ? axisLabels : []
            );
        }

        // 修改添加刻度线的部分
        if (showAxisTicks) {  // 只在 showAxisTicks 为 true 时添加刻度线
            // 添加刻度线
            if (!isYAxisOnly) {  // x轴刻度线
                for (let x = Math.floor(xRange[0]); x <= Math.ceil(xRange[1]); x++) {
                    if (x !== Math.ceil(xRange[1])) {
                        system.addLineSegment(x, -0.1, x, 0.1, "black", "solid");
                    }
                }
            }
            if (!isXAxisOnly) {  // y轴刻度线
                for (let y = Math.floor(yRange[0]); y <= Math.ceil(yRange[1]); y++) {
                    if (y !== Math.ceil(yRange[1])) {
                        system.addLineSegment(-0.1, y, 0.1, y, "black", "solid");
                    }
                }
            }
        }

        return system;
    }

    // 修改函数签名，只接受四个参数
    addCoordinateLocatingGuides(
        point: { x: number; y: number }, 
        step: 1 | 2, 
        showXGuide = true, 
        showYGuide = true
    ): void {
        if (showXGuide && !showYGuide) {
            // 只显示x轴的情况
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
            return;
        }

        if (showYGuide && !showXGuide) {
            // 只显示y轴的情况
            if (point.y !== 0) {
                this.addLineSegment(0, 0, 0, point.y, "blue", "solid");
                const arrowSize = 0.2;
                if (point.y > 0) {
                    this.addLineSegment(0, point.y, arrowSize, point.y - arrowSize, "blue", "solid");
                    this.addLineSegment(0, point.y, -arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    this.addLineSegment(0, point.y, arrowSize, point.y + arrowSize, "blue", "solid");
                    this.addLineSegment(0, point.y, -arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }
            this.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 24);
            return;
        }

        // 完整坐标系的处理逻辑
        if (step === 1) {
            // 添加垂直辅助线（绿色虚线）
            this.addLineSegment(point.x, 0, point.x, point.y, "green", "dotted");
            
            // 添加x轴红色线段和箭头
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            
            // 添加x坐标标签
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
        } else {
            // 添加水平辅助线（绿色虚线）
            this.addLineSegment(0, point.y, point.x, point.y, "green", "dotted");
            
            // 保留第一步的红色线段和箭头
            if (point.x !== 0) {
                this.addLineSegment(0, 0, point.x, 0, "red", "solid");
                const arrowSize = 0.2;
                if (point.x > 0) {
                    this.addLineSegment(point.x, 0, point.x - arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x - arrowSize, -arrowSize, "red", "solid");
                } else {
                    this.addLineSegment(point.x, 0, point.x + arrowSize, arrowSize, "red", "solid");
                    this.addLineSegment(point.x, 0, point.x + arrowSize, -arrowSize, "red", "solid");
                }
            }
            
            // 添加y轴蓝色线段和箭头
            if (point.y !== 0) {
                this.addLineSegment(point.x, 0, point.x, point.y, "blue", "solid");
                const arrowSize = 0.2;
                if (point.y > 0) {
                    this.addLineSegment(point.x, point.y, point.x + arrowSize, point.y - arrowSize, "blue", "solid");
                    this.addLineSegment(point.x, point.y, point.x - arrowSize, point.y - arrowSize, "blue", "solid");
                } else {
                    this.addLineSegment(point.x, point.y, point.x + arrowSize, point.y + arrowSize, "blue", "solid");
                    this.addLineSegment(point.x, point.y, point.x - arrowSize, point.y + arrowSize, "blue", "solid");
                }
            }
            
            // 添加坐标标签
            this.addTextWithBackground(point.x, -0.8, `${point.x}`, "red", 24);
            this.addTextWithBackground(-1.2, point.y, `${point.y}`, "blue", 24);
        }
    }

    // 添加坐标转换方法
    private transformX(x: number): number {
        const { width, xRange } = this.options;
        const margin = 30;
        const innerWidth = width - 2 * margin;
        const xScale = innerWidth / (xRange[1] - xRange[0]);
        const xOffset = margin - xRange[0] * xScale;
        return x * xScale + xOffset;
    }

    private transformY(y: number): number {
        const { height, yRange } = this.options;
        const margin = 30;
        const innerHeight = height - 2 * margin;
        const yScale = innerHeight / (yRange[1] - yRange[0]);
        const yOffset = height - margin + yRange[0] * yScale;
        return yOffset - y * yScale;
    }

    // 修改 drawGrid 方法，使用新的转换方法
    private drawGrid(): string {
        if (!this.options.showGrid) return '';

        let gridLines = '';
        const gridStyle = `stroke="${this.options.gridColor}" stroke-opacity="${this.options.gridOpacity}"`;

        // 绘制垂直网格线
        for (let x = this.gridXStart; x <= this.gridXEnd; x++) {
            // 对于难度3（!showAllGrids），只在[0,5]范围内绘制网格线
            if (!this.options.showAllGrids) {
                if (x >= 0 && x <= 5) {
                    const xPos = this.transformX(x);
                    gridLines += `<line x1="${xPos}" y1="${this.transformY(0)}" 
                        x2="${xPos}" y2="${this.transformY(5)}" ${gridStyle}/>`;
                }
            } else {
                const xPos = this.transformX(x);
                gridLines += `<line x1="${xPos}" y1="${this.transformY(this.options.yRange[0])}" 
                    x2="${xPos}" y2="${this.transformY(this.options.yRange[1])}" ${gridStyle}/>`;
            }
        }

        // 绘制水平网格线
        for (let y = this.gridYStart; y <= this.gridYEnd; y++) {
            // 对于难度3（!showAllGrids），只在[0,5]范围内绘制网格线
            if (!this.options.showAllGrids) {
                if (y >= 0 && y <= 5) {
                    const yPos = this.transformY(y);
                    gridLines += `<line x1="${this.transformX(0)}" y1="${yPos}" 
                        x2="${this.transformX(5)}" y2="${yPos}" ${gridStyle}/>`;
                }
            } else {
                const yPos = this.transformY(y);
                gridLines += `<line x1="${this.transformX(this.options.xRange[0])}" y1="${yPos}" 
                    x2="${this.transformX(this.options.xRange[1])}" y2="${yPos}" ${gridStyle}/>`;
            }
        }

        return gridLines;
    }
}