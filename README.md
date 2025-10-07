# VUP 歌单（tora.live）

本项目forked from Akegarasu/vup-song-list(https://github.com/Akegarasu/vup-song-list)，在其基础上进行了本地化与交互增强。


## 部署使用

### 制作歌单内容

在开始之前，请确保已安装 Python 环境与依赖（pandas 等）。

1. 按照模板 `scripts/example.xlsx` 填写'music.xlsx'，制作歌单内容
2. 运行 `python scripts/converter.py` 生成歌单文件 `public/music_list.json`

converter 脚本会进行必要清洗：
- 歌名必填：歌名为空的行会被过滤（避免生成空条目）
- 字段类型：`sticky_top`、`paid` 统一输出为 0/1；字符串空值输出为空串
- 顺序：置顶项保持相对顺序并排在最前，其余项保持原表顺序

### 修改配置文件

1. 将 `config/constants.example.js` 重命名为 `config/constants.js`
2. 按需修改配置（示例）：

```js
let config = {
  Name: "",
  BiliLiveRoomID: "",
  Footer: "Copyright © 2024 - 2025 Tora",
  Cursor: true,
  LanguageCategories: ["国语", "日语", "英语", "韩语"],
  RemarkCategories: ["弹唱", "翻唱", "流行"],
  BannerTitle: "",
  BannerContent: [
    "这里写你的简介或标语",
  ],
  CustomButtons: [
    { link: "https://space.bilibili.com/", name: "主页", image: "/assets/icon/bilibili.png" },
  ],
}
module.exports = { config }
```

## 启动与构建

```bash
npm install
npm run dev
# 导出静态站点：
npm run build
npm run export
```

Next.js 会在 `out/` 目录生成可直接部署的静态网站。

## 功能说明（筛选与数据）

- 标签筛选
  - 行内标签点击：添加为顶部搜索标签；再次点击同一标签会移除
  - 选中高亮：行内标签被选中时高亮；顶部已选胶囊样式与行内一致
  - 语言互斥：一次仅保留一个语言标签；添加新语言会自动移除已选的其他语言
  - “全部”按钮：位于语言行最前，用于清空所有筛选（顶部标签、语言/备注/首字母/付费与搜索输入）

- 数据转换（scripts/converter.py）
  - 歌名必填过滤、类型与空值统一、置顶顺序保持（详见上文）

## 构建与无障碍优化

- 使用 `next/image` 替代原生 `img`，并为所有图片添加 `alt` 文本：
  - pages/404.js：使用 `Image` 渲染 404 图片
  - components/banner/Banner.component.jsx：banner 头像添加 `alt`
  - components/banner/BannerButton.component.jsx：按钮图标改为 `Image` 并补充 `alt/尺寸`
  - components/SongDetail.component.jsx：置顶与付费小图标改为 `Image` 并补充尺寸

## 许可证

MIT License
