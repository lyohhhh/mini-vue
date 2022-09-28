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

// 创建 children
const parseChildren = (context: Context): Array<Content> => {
  return [
    {
      type: "interpolation",
      content: {
        type: "simple_expression",
        content: "message",
      },
    },
  ];
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
