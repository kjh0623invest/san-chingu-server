import axios from 'axios';
import * as cheerio from 'cheerio';

// 현재 달로 계절 계산 (3~5월 봄, 6~8월 여름, 9~11월 가을, 12~2월 겨울)
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 계절별 검색 키워드
const seasonKeywords = {
  spring: '봄 등산 명산 추천',
  summer: '여름 등산 명산 추천',
  autumn: '가을 단풍 명산 추천',
  winter: '겨울 눈꽃 명산 추천'
};

// 기본 추천 산 (스크래핑 실패 시 폴백)
const fallbackRecommendations = {
  spring: [
    { name: '북한산', region: '경기', description: '봄 진달래가 아름답고 접근성 좋음' },
    { name: '남산', region: '서울', description: '봄꽃과 도시 경관을 함께 즐길 수 있음' },
    { name: '가리산', region: '경기', description: '봄철 철쭉 군락이 유명한 산' }
  ],
  summer: [
    { name: '설악산', region: '강원', description: '여름 산악 등산의 최고 명산' },
    { name: '오대산', region: '강원', description: '깊은 숲과 맑은 계곡이 인상적' },
    { name: '지리산', region: '전남', description: '호남의 대표 산, 여름 계곡이 아름다움' }
  ],
  autumn: [
    { name: '설악산', region: '강원', description: '가을 단풍의 절정, 전국 최고의 단풍 명산' },
    { name: '내장산', region: '전북', description: '호남 최고의 단풍 명산' },
    { name: '도봉산', region: '경기', description: '서울 근처 단풍 명산, 접근성 우수' }
  ],
  winter: [
    { name: '한라산', region: '제주', description: '겨울 설경과 신비한 풍경' },
    { name: '태백산', region: '강원', description: '영동 지역 눈꽃 명산' },
    { name: '치악산', region: '강원', description: '겨울 설경이 아름다운 산' }
  ]
};

// 네이버 블로그 검색 스크래핑
async function scrapeNaverBlog(keyword) {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    // 네이버 검색은 차단될 수 있으니 User-Agent 설정
    const url = `https://search.naver.com/search.naver?where=blog&sm=tab_jum&query=${encodedKeyword}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    const recommendations = [];

    // 네이버 검색 결과에서 블로그 포스트 추출
    // 블로그 결과 영역 선택자 (변경될 수 있음)
    $('div.list_item').each((index, element) => {
      if (recommendations.length >= 3) return false;

      const titleEl = $(element).find('a.title_link');
      const descEl = $(element).find('div.list_sub');

      const title = titleEl.text().trim();
      const description = descEl.text().trim().substring(0, 60);

      if (title && title.includes('산') && title.length < 50) {
        recommendations.push({
          name: title.replace(/\[.*?\]/g, '').trim(), // [블로그명] 제거
          region: extractRegion(title),
          description: description || '추천하는 산입니다',
          tag: getSeasonTag(keyword)
        });
      }
    });

    // 결과가 3개 미만이면 더 찾기 (다른 선택자 시도)
    if (recommendations.length < 3) {
      $('li.bx').each((index, element) => {
        if (recommendations.length >= 3) return false;

        const titleEl = $(element).find('a');
        const title = titleEl.attr('title') || titleEl.text();

        if (title && title.includes('산')) {
          recommendations.push({
            name: title.substring(0, 30).trim(),
            region: extractRegion(title),
            description: '추천하는 산입니다',
            tag: getSeasonTag(keyword)
          });
        }
      });
    }

    return recommendations.slice(0, 3);
  } catch (err) {
    console.error('스크래핑 오류:', err.message);
    return null;
  }
}

// 제목에서 지역 추출 시도
function extractRegion(title) {
  const regions = ['서울', '경기', '강원', '경남', '경북', '전남', '전북', '제주', '충남', '충북', '인천'];
  for (const region of regions) {
    if (title.includes(region)) return region;
  }
  return '전국';
}

// 계절별 태그 반환
function getSeasonTag(keyword) {
  if (keyword.includes('봄')) return '🌸 봄꽃';
  if (keyword.includes('여름')) return '🌿 여름';
  if (keyword.includes('가을')) return '🍁 단풍';
  if (keyword.includes('겨울')) return '❄️ 눈꽃';
  return '🏔️ 명산';
}

// 메인 추천 함수
export async function getSeasonalRecommendations(season = null) {
  const targetSeason = season || getCurrentSeason();
  const keyword = seasonKeywords[targetSeason];

  console.log(`[명산 추천] 계절: ${targetSeason}, 검색 키워드: ${keyword}`);

  // 웹 스크래핑 시도
  const scraped = await scrapeNaverBlog(keyword);

  // 스크래핑 성공 시 반환, 실패 시 기본값 반환
  const recommendations = scraped && scraped.length > 0
    ? scraped
    : fallbackRecommendations[targetSeason];

  return {
    season: targetSeason,
    recommendations: recommendations.slice(0, 3)
  };
}
