import { NodeTypes } from "./ast";

export type Context = {
  source: string;
  children?: Array<Content>;
};

export type Content = {
  type: number;
  content: Content | string;
};

// 转换 ast
export const baseParse = (
  content: string
): {
  children: Content[];
} => {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
};

// 实现解析 ast
const parseInterpolation = (context: Context): Content => {
  // {{message}}
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 查找到 }} 的位置
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  // 推进两位 排除 {{
  advanceBy(context, openDelimiter.length);
  // 减去 }} 两位
  const rawContentLength = closeIndex - closeDelimiter.length;
  // 得到 message
  const content = context.source.slice(0, rawContentLength);
  // 将已经替换的删除
  advanceBy(context, rawContentLength + openDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
};

// 修改推进
const advanceBy = (context: Context, len: number): void => {
  context.source = context.source.slice(len);
};

// 创建 children
const parseChildren = (context: Context): Array<Content> => {
  const nodes: Array<Content> = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (context.source[0] === "<") {
    if (/a-z/i.test(context.source[1])) {
      console.log("parse element");
    }
  }
  nodes.push(node);
  return nodes;
};

// 创建 ast 根节点
const createRoot = (children: Array<Content>) => {
  return { children };
};
// 创建 ast 全局上下文
const createParserContext = (content: string): Context => {
  return {
    source: content,
  };
};
