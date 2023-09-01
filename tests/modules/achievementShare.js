import replaceShare from "./replaceShare.js";
import getSharedData from "./getSharedData.js";
export default async function achievementShare(page, language, data) {
  await replaceShare(page)
  await page.click('#share')
  let achievementSharedData = await getSharedData(page);
  let cookie = await page.evaluate(() => {
    let name = "achievement=";
    let ca = document.cookie.split(';');
    for (c of ca) {
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
  })
  if (data.url+`achievement/?name=${cookie}&lang=${language}` != achievementSharedData.url) {
    return false
  }
  if (data.title != achievementSharedData.title) {
    return false
  }
  if (data.text != achievementSharedData.text) {
    return false
  }
  console.log("Achievement shared data ✅")
  return true
}