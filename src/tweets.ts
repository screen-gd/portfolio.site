export type Tweet = {
  url: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  text: string;
  date: string;
  image?: string;
  video: boolean;
};

const tweetUrl = /^https:\/\/(?:x|twitter)\.com\/\w+\/status\/(\d+)/;

export function tweetId(href: string) {
  return href.match(tweetUrl)?.[1];
}

type Syndication = {
  text: string;
  created_at: string;
  display_text_range: [number, number];
  user: { name: string; screen_name: string; profile_image_url_https: string; is_blue_verified?: boolean; verified?: boolean };
  mediaDetails?: { type: string; media_url_https: string }[];
};

// Fetched at build time from X's public embed endpoint, so readers never load X's scripts.
async function fetchTweet(id: string, url: string): Promise<Tweet | undefined> {
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
  try {
    const response = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${token}`);
    if (!response.ok) return undefined;
    const tweet = await response.json() as Syndication;
    const [start, end] = tweet.display_text_range;
    const media = tweet.mediaDetails?.[0];
    return {
      url,
      name: tweet.user.name,
      handle: tweet.user.screen_name,
      avatar: tweet.user.profile_image_url_https.replace('_normal.', '_x96.'),
      verified: Boolean(tweet.user.is_blue_verified || tweet.user.verified),
      text: Array.from(tweet.text).slice(start, end).join('').replace(/\s*https:\/\/t\.co\/\w+$/, '').trim(),
      date: tweet.created_at,
      image: media?.media_url_https,
      video: media?.type === 'video' || media?.type === 'animated_gif',
    };
  } catch {
    return undefined;
  }
}

// Links whose post can't be fetched stay plain links.
export async function getTweets(markdown: string) {
  const tweets = new Map<string, Tweet>();
  const links = [...markdown.matchAll(/\]\((https:\/\/(?:x|twitter)\.com\/\w+\/status\/\d+[^)\s]*)\)/g)].map(([, url]) => url);
  await Promise.all(links.map(async (url) => {
    const tweet = await fetchTweet(tweetId(url)!, url);
    if (tweet) tweets.set(url, tweet);
  }));
  return tweets;
}
