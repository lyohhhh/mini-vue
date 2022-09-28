export type Context = {
  source: string;
  children?: Array<Content>;
};

export type Content = {
  type: string;
  content: Content | string;
};

// 转换 ast
export const baseParse = (content: string): any => {
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
  context.source = context.source.slice(openDelimiter.length);
  // 减去 }} 两位
  const rawContentLength = closeIndex - closeDelimiter.length;
  // 得到 message
  const content = context.source.slice(0, rawContentLength);
  // 将已经替换的删除
  context.source = context.source.slice(
    rawContentLength + openDelimiter.length
  );

  return {
    type: "interpolation",
    content: {
      type: "simple_expression",
      content,
    },
  };
};

// 创建 children
const parseChildren = (context: Context): Array<Content> => {
  const nodes: Array<Content> = [];
  nodes.push(parseInterpolation(context));
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
