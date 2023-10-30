import DOMPurify from "isomorphic-dompurify";

export default function InjectStyles({ css }: { css: string }) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(css),
      }}
    ></style>
  );
}
