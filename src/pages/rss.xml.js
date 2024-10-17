import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection("posts");
  return rss({
    title: "UDock | Blog",
    description: "UDock Blog",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
