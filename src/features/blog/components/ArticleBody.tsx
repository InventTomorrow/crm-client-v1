/**
 * The HTML here was sanitized on the server at write time (see
 * modules/blog/blog-sanitize.util.ts), which is what makes rendering it
 * directly safe — nothing sanitizes again at request time.
 */
export default function ArticleBody({ html }: { html: string }) {
  return (
    <div className="article-body mt-10" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
