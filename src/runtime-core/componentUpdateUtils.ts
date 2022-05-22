export function shouldUpdateComponent(n1: VNode, n2: VNode): boolean {
  const { props: prevProps } = n1;
  const { props: nextProps } = n2;

  for (const key in nextProps) {
    if (prevProps[key] !== nextProps[key]) return true;
  }
  return false;
}
