/**
 * Default blocklist of known 18+ adult sites
 * These sites are automatically blocked for all age groups
 */

export const ADULT_SITE_BLOCKLIST: string[] = [
  // Major adult video sites
  'pornhub.com',
  'pornhub',
  'xvideos.com',
  'xvideos',
  'xhamster.com',
  'xhamster',
  'redtube.com',
  'redtube',
  'youporn.com',
  'youporn',
  'tube8.com',
  'tube8',
  'spankwire.com',
  'spankwire',
  'keezmovies.com',
  'keezmovies',
  'xtube.com',
  'xtube',
  'drtuber.com',
  'drtuber',
  'beeg.com',
  'beeg',
  'tnaflix.com',
  'tnaflix',
  'sunporno.com',
  'sunporno',
  '4tube.com',
  '4tube',
  'porn.com',
  'porn.com',
  'pornhubpremium.com',
  'pornhubpremium',
  
  // XXX sites
  'xxx.com',
  'xxx',
  'xxxvideos.net',
  'xxxvideos',
  'xxxvideos2.com',
  'xxxvideos2',
  
  // Adult content platforms
  'onlyfans.com',
  'onlyfans',
  'chaturbate.com',
  'chaturbate',
  'livejasmin.com',
  'livejasmin',
  'myfreecams.com',
  'myfreecams',
  'stripchat.com',
  'stripchat',
  'cam4.com',
  'cam4',
  'bongacams.com',
  'bongacams',
  'streamate.com',
  'streamate',
  
  // Adult dating/hookups
  'ashleymadison.com',
  'ashleymadison',
  'adultfriendfinder.com',
  'adultfriendfinder',
  'fetlife.com',
  'fetlife',
  
  // Adult content networks
  'brazzers.com',
  'brazzers',
  'realitykings.com',
  'realitykings',
  'bangbros.com',
  'bangbros',
  'naughtyamerica.com',
  'naughtyamerica',
  'vivid.com',
  'vivid',
  'wicked.com',
  'wicked',
  'evilangel.com',
  'evilangel',
  'kink.com',
  'kink',
  'hardx.com',
  'hardx',
  
  // Adult magazines/content
  'penthouse.com',
  'penthouse',
  'playboy.com',
  'playboy',
  'hustler.com',
  'hustler',
  'maxim.com',
  'maxim',
  
  // Adult forums/communities
  'reddit.com/r/nsfw',
  'reddit.com/r/gonewild',
  'reddit.com/r/realgirls',
  'reddit.com/r/nsfw_gifs',
  'reddit.com/r/porn',
  'reddit.com/r/xxx',
  
  // Additional known adult domains
  'pornmd.com',
  'pornmd',
  'porn300.com',
  'porn300',
  'pornhub.org',
  'pornhub.org',
  'xnxx.com',
  'xnxx',
  'xvideo.com',
  'xvideo',
  'xvideos2.com',
  'xvideos2',
  'pornotube.com',
  'pornotube',
  'extremetube.com',
  'extremetube',
  'youjizz.com',
  'youjizz',
  'spankbang.com',
  'spankbang',
  'eporner.com',
  'eporner',
  'porntrex.com',
  'porntrex',
  'nuvid.com',
  'nuvid',
  'pornhub.tv',
  'pornhub.tv',
  'pornhub.net',
  'pornhub.net',
];

/**
 * Checks if a URL matches any adult site in the blocklist
 */
export function isAdultSite(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check against blocklist
  for (const blockedSite of ADULT_SITE_BLOCKLIST) {
    if (lowerUrl.includes(blockedSite.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets the matched adult site pattern (for logging/reporting)
 */
export function getMatchedAdultSite(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const lowerUrl = url.toLowerCase();
  
  for (const blockedSite of ADULT_SITE_BLOCKLIST) {
    if (lowerUrl.includes(blockedSite.toLowerCase())) {
      return blockedSite;
    }
  }
  
  return null;
}

