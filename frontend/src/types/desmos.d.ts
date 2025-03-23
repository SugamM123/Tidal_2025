// Type definitions for Desmos Calculator API
// Project: https://www.desmos.com/api/v1.10/docs/index.html

declare namespace Desmos {
  interface Expression {
    id?: string;
    latex?: string;
    color?: string;
    hidden?: boolean;
    label?: string;
    showLabel?: boolean;
    dragMode?: number;
    lines?: boolean;
    lineStyle?: number;
    points?: boolean;
    pointStyle?: number;
    residualVariable?: string;
    regressionParameters?: {
      parameter: string;
      min: number;
      max: number;
    }[];
    fillOpacity?: number;
    labelSize?: string;
    suppressTextOutline?: boolean;
  }

  interface BoundingBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
  }

  interface CalculatorState {
    version: number;
    graph: {
      viewport: BoundingBox;
    };
    expressions: {
      list: Expression[];
    };
  }

  interface GraphingCalculatorOptions {
    keypad?: boolean;
    expressionsTopbar?: boolean;
    zoomButtons?: boolean;
    expressions?: boolean;
    settingsMenu?: boolean;
    graphpaper?: boolean;
    showGrid?: boolean;
    labels?: boolean;
    singleVariableSolutions?: boolean;
    pointsOfInterest?: boolean;
    border?: boolean;
    lockViewport?: boolean;
    expressionsCollapsed?: boolean;
    administerSecretFolders?: boolean;
    pasteGraphLink?: boolean;
    pasteTableData?: boolean;
    trace?: boolean;
    links?: boolean;
    multipleKeypadMode?: boolean;
    brailleMode?: boolean;
    invertedColors?: boolean;
    projectorMode?: boolean;
    folders?: boolean;
    notes?: boolean;
    qwertyKeyboard?: boolean;
    restrictedFunctions?: boolean;
    restrictViewport?: boolean;
    hundredthsDecimal?: boolean;
    fontSize?: number;
    language?: string;
    backgroundColor?: string;
    textColor?: string;
    styles?: {
      [key: string]: any;
    };
  }

  interface GraphingCalculator {
    getState(): CalculatorState;
    setState(state: CalculatorState): void;
    setBlank(): void;
    setExpression(expr: Expression): void;
    removeExpression(id: string): void;
    getExpressions(): Expression[];
    setDefaultState(): void;
    setGraphSettings(settings: any): void;
    updateSettings(settings: any): void;
    mathquill: any;
    destroy(): void;
    screenshot(opts?: any): string;
    observeEvent(eventName: string, callback: (event: any) => void): void;
    unobserveEvent(eventName: string, callback: (event: any) => void): void;
    graphpaperBounds: { width: number; height: number };
    setMathBounds(bounds: BoundingBox): void;
    getMathBounds(): BoundingBox;
    setBounds(bounds: BoundingBox): void;
    getBounds(): BoundingBox;
    resize(): void;
    focusFirstExpression(): void;
  }
}

declare interface Window {
  Desmos: {
    GraphingCalculator(el: HTMLElement, options?: Desmos.GraphingCalculatorOptions): Desmos.GraphingCalculator;
    FunctionGrapher(el: HTMLElement, options?: any): any;
    ScientificCalculator(el: HTMLElement, options?: any): any;
    FourFunctionCalculator(el: HTMLElement, options?: any): any;
    ExpressionNode(expr: string): any;
    HelperExpression(calculator: Desmos.GraphingCalculator, opts: any): any;
    Color: {
      RED: string;
      BLUE: string;
      GREEN: string;
      ORANGE: string;
      PURPLE: string;
      BLACK: string;
    };
  };
}

declare global {
  interface Window {
    Desmos: DesmosStatic;
  }
}

interface DesmosStatic {
  GraphingCalculator: (container: HTMLElement, options?: DesmosOptions) => DesmosCalculator;
  Colors: {
    RED: string;
    BLUE: string;
    GREEN: string;
    PURPLE: string;
    ORANGE: string;
    BLACK: string;
  };
  Styles: {
    POINT: string;
    OPEN: string;
    CROSS: string;
    SOLID: string;
    DASHED: string;
    DOTTED: string;
  };
  DragModes: {
    X: string;
    Y: string;
    XY: string;
    NONE: string;
    AUTO: string;
  };
}

interface DesmosOptions {
  keypad?: boolean;
  graphpaper?: boolean;
  expressions?: boolean;
  settingsMenu?: boolean;
  zoomButtons?: boolean;
  expressionsTopbar?: boolean;
  pointsOfInterest?: boolean;
  trace?: boolean;
  border?: boolean;
  lockViewport?: boolean;
  expressionsCollapsed?: boolean;
  administerSecretFolders?: boolean;
  images?: boolean;
  folders?: boolean;
  notes?: boolean;
  sliders?: boolean;
  links?: boolean;
  qwertyKeyboard?: boolean;
  restrictedFunctions?: boolean;
  pasteGraphLink?: boolean;
  pasteTableData?: boolean;
  showResetButtonOnGraphpaper?: boolean;
  colors?: Record<string, string>;
  autosize?: boolean;
  fontSize?: number;
  language?: string;
}

interface DesmosCalculator {
  setExpression: (expression: DesmosExpression) => void;
  setExpressions: (expressions: DesmosExpression[]) => void;
  removeExpression: (expression: { id: string }) => void;
  removeExpressions: (expressions: { id: string }[]) => void;
  getExpressions: () => DesmosExpression[];
  mathToPixels: (coords: { x?: number; y?: number }) => { x?: number; y?: number };
  pixelsToMath: (coords: { x?: number; y?: number }) => { x?: number; y?: number };
  setMathBounds: (bounds: { left: number; right: number; bottom: number; top: number }) => void;
  updateSettings: (settings: Partial<DesmosOptions>) => void;
  getState: () => any;
  setState: (state: any, options?: { allowUndo?: boolean; remapColors?: boolean }) => void;
  setBlank: (options?: { allowUndo?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  resize: () => void;
  screenshot: (options?: any) => string;
  asyncScreenshot: (options: any, callback: (dataUrl: string) => void) => void;
  destroy: () => void;
}

interface DesmosExpression {
  id: string;
  type?: 'expression' | 'table' | 'text';
  latex?: string;
  color?: string;
  hidden?: boolean;
  secret?: boolean;
  points?: boolean;
  lines?: boolean;
  dragMode?: string;
  lineStyle?: string;
  pointStyle?: string;
  fill?: boolean;
  fillOpacity?: number | string;
  lineWidth?: number | string;
  lineOpacity?: number | string;
  pointSize?: number | string;
  pointOpacity?: number | string;
  sliderBounds?: { min: string; max: string; step: string };
  polarDomain?: { min: string; max: string };
  parametricDomain?: { min: string; max: string };
  label?: string;
  showLabel?: boolean;
  playing?: boolean;
}

export {}; 