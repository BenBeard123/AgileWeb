// Adult site blocklist for Chrome extension
// Extracted from data/adultSiteBlocklist.ts

export const ADULT_SITE_BLOCKLIST = [
  'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com', 'youporn.com', 'tube8.com',
  'xxx.com', 'xxxvideos.com', 'onlyfans.com', 'chaturbate.com', 'livejasmin.com',
  'myfreecams.com', 'stripchat.com', 'ashleymadison.com', 'adultfriendfinder.com',
  'fetlife.com', 'brazzers.com', 'realitykings.com', 'bangbros.com', 'naughtyamerica.com',
  'vivid.com', 'wicked.com', 'kink.com', 'penthouse.com', 'playboy.com', 'hustler.com',
  'maxim.com', 'r/nsfw', 'r/gonewild', 'r/realgirls', 'r/nsfw_gifs', 'r/porn', 'r/xxx',
];

export function isAdultSite(url) {
  if (!url || typeof url !== 'string') return false;
  const lowerUrl = url.toLowerCase();
  return ADULT_SITE_BLOCKLIST.some(site => lowerUrl.includes(site));
}

export function getMatchedAdultSite(url) {
  if (!url || typeof url !== 'string') return null;
  const lowerUrl = url.toLowerCase();
  return ADULT_SITE_BLOCKLIST.find(site => lowerUrl.includes(site)) || null;
}

