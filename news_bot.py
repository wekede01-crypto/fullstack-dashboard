import pymongo
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# 1. 连接 MongoDB
# -----------------
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["my_fullstack_journey"]
collection = db["tech_news"]

# 2. 定义爬虫函数
# -----------------
def scrape_hackernews():
    print("🕷️ 正在出发去 Hacker News 抓取数据...")
    url = "https://news.ycombinator.com/"
    
    try:
        # 发送请求 (假装自己是浏览器，防止被屏蔽)
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ 请求失败，状态码: {response.status_code}")
            return []

        # 解析网页
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取数据
        # Hacker News 的标题都在 class="titleline" 的 span 里
        news_items = []
        rows = soup.find_all(class_='titleline')[:8] # 只抓前 8 条，贪多嚼不烂

        for row in rows:
            link_tag = row.find('a')
            if link_tag:
                title = link_tag.get_text()
                link = link_tag['href']
                
                # 存入列表
                news_items.append({
                    "title": title,
                    "tag": "HackerNews", # 统一打个标签
                    "date": datetime.now().strftime("%H:%M"), # 记录几点抓的
                    "summary": link # 把链接存在 summary 字段里，前端会把它变成可点击的链接
                })
        
        return news_items

    except Exception as e:
        print(f"❌ 发生错误: {e}")
        return []

# 3. 执行任务
# -----------------
real_news = scrape_hackernews()

if real_news:
    # 策略：先清空旧新闻，再存入新新闻 (保证每次看都是最新的)
    collection.delete_many({})
    collection.insert_many(real_news)
    print(f"✅ 成功！已将 {len(real_news)} 条【真实新闻】存入 MongoDB！")
else:
    print("⚠️ 没抓到数据，可能是网络问题。")